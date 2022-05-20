import { BigNumber } from 'bignumber.js'
import { Vault, VaultWithType } from 'blockchain/vaults'
import { IlkWithBalance } from 'features/ilks/ilksWithBalances'
import { isEqual } from 'lodash'
import { Observable } from 'rxjs'
import { combineLatest, of } from 'rxjs'
import { map } from 'rxjs/internal/operators/map'
import { distinctUntilChanged, switchMap } from 'rxjs/operators'

import { getToken } from '../../blockchain/tokensMetadata'
import {
  BorrowPositionVM,
  EarnPositionVM,
  MultiplyPositionVM,
  PositionVM,
} from '../../components/dumb/PositionList'
import {
  formatCryptoBalance,
  formatFiatBalance,
  formatPercent,
} from '../../helpers/formatters/format'
import { calculatePNL } from '../../helpers/multiply/calculations'
import { zero } from '../../helpers/zero'
import {
  extractStopLossData,
  StopLossTriggerData,
} from '../automation/protection/common/StopLossTriggerDataExtractor'
import { TriggersData } from '../automation/protection/triggers/AutomationTriggersData'
import { calculateMultiply } from '../multiply/manage/pipes/manageMultiplyVaultCalculations'
import { VaultHistoryEvent } from '../vaultHistory/vaultHistory'
import { getVaultsSummary, VaultSummary } from './vaultSummary'

export interface VaultsOverview {
  positions: PositionVM[]
  vaultSummary: VaultSummary | undefined
}

export type RedirectionFunction = (vault: Vault) => void

type VaultWithIlkBalance = VaultWithType & IlkWithBalance & { events: VaultHistoryEvent[] }

export function createVaultsOverview$(
  vaults$: (address: string) => Observable<VaultWithType[]>,
  ilksListWithBalances$: Observable<IlkWithBalance[]>,
  automationTriggersData$: (id: BigNumber) => Observable<TriggersData>,
  vaultHistory$: (vaultId: BigNumber) => Observable<VaultHistoryEvent[]>,
  address: string,
  redirection: RedirectionFunction,
): Observable<VaultsOverview> {
  const vaultsWithHistory$ = vaults$(address).pipe(
    switchMap((vaults) => {
      const vaultsWithHistory = (vaults || []).map((vault) =>
        vaultHistory$(vault.id).pipe(map((history) => ({ ...vault, events: history || [] }))),
      )
      return combineLatest(vaultsWithHistory)
    }),
  )
  const vaultsAddressWithIlksBalances$: Observable<VaultWithIlkBalance[]> = combineLatest(
    vaultsWithHistory$,
    ilksListWithBalances$,
  ).pipe(
    map(([vaults, balances]) => {
      return vaults.map((vault) => {
        const balance = balances.find((balance) => balance.ilk === vault.ilk)

        return {
          ...vault,
          ...balance,
        }
      })
    }),
    distinctUntilChanged(isEqual),
  )

  const vaultWithAutomationData$: Observable<
    (VaultWithIlkBalance & StopLossTriggerData)[]
  > = vaultsAddressWithIlksBalances$.pipe(
    switchMap((vaults) => {
      return combineLatest(
        (vaults || []).length > 0
          ? vaults.map((vault) => {
              return automationTriggersData$(vault.id).pipe(
                map((automationData) => ({
                  ...vault,
                  ...extractStopLossData(automationData),
                })),
              )
            })
          : of([]),
      )
    }),
  )

  return combineLatest(
    vaultWithAutomationData$,
    vaultsAddressWithIlksBalances$.pipe(map(getVaultsSummary)),
  ).pipe(
    map(([vaults, vaultSummary]) => ({
      positions: mapToPositionVM(vaults, redirection),
      vaultSummary,
    })),
    distinctUntilChanged(isEqual),
  )
}

function mapToPositionVM(
  vaults: (VaultWithIlkBalance & StopLossTriggerData)[],
  redirectionFunction: RedirectionFunction,
): PositionVM[] {
  const borrowVM: BorrowPositionVM[] = vaults
    .filter((vault) => vault.type === 'borrow')
    .map((value) => ({
      type: 'borrow' as const,
      icon: getToken(value.token).iconCircle,
      ilk: value.ilk,
      collateralRatio: formatPercent(value.collateralizationRatio, { precision: 2 }),
      inDanger: value.atRiskLevelDanger,
      daiDebt: formatCryptoBalance(value.debt),
      collateralLocked: `${formatCryptoBalance(value.lockedCollateral)} ${value.token}`,
      variable: formatPercent(value.stabilityFee, { precision: 2 }),
      automationEnabled: value.isStopLossEnabled,
      protectionAmount: formatPercent(value.stopLossLevel),
      onEditClick: () => redirectionFunction(value),
      onAutomationClick: () => redirectionFunction(value),
      vaultID: value.id.toString(),
    }))

  const multiplyVM: MultiplyPositionVM[] = vaults
    .filter((vault) => vault.type === 'multiply')
    .map((value) => ({
      type: 'multiply' as const,
      icon: getToken(value.token).icon,
      ilk: value.ilk,
      vaultID: value.id.toString(),
      multiple: `${calculateMultiply({ ...value }).toFixed(2)}x`,
      onEditClick: () => redirectionFunction(value),
      netValue: formatCryptoBalance(value.backingCollateralUSD),
      liquidationPrice: `$${formatFiatBalance(value.liquidationPrice)}`,
      fundingCost: formatPercent(calculateFundingCost(value).times(100), { precision: 2 }),
      automationEnabled: value.isStopLossEnabled,
      onAutomationClick: () => redirectionFunction(value),
    }))

  const earnVM: EarnPositionVM[] = vaults
    // TODO: Probably this condition should be different
    .filter((vault) => vault.type !== 'multiply' && vault.type !== 'borrow')
    .map((value) => ({
      type: 'earn' as const,
      icon: getToken(value.token).iconCircle,
      ilk: value.ilk,
      vaultID: value.id.toString(),
      netValue: formatCryptoBalance(value.backingCollateralUSD),
      sevenDayYield: formatPercent(new BigNumber(0.12).times(100), { precision: 2 }), // TODO: Change in the future
      pnl: `${formatPercent((getPnl(value) || zero).times(100), {
        precision: 2,
        roundMode: BigNumber.ROUND_DOWN,
      })}`,
      liquidity: `${formatCryptoBalance(value.ilkDebtAvailable)} DAI`,
      onEditClick: () => redirectionFunction(value),
    }))

  return [...borrowVM, ...multiplyVM, ...earnVM]
}

function calculateFundingCost(vault: VaultWithIlkBalance): BigNumber {
  return vault.debt.div(vault.backingCollateralUSD).multipliedBy(vault.stabilityFee)
}

function getPnl(vault: VaultWithIlkBalance): BigNumber {
  const { lockedCollateralUSD, debt, events } = vault
  const netValueUSD = lockedCollateralUSD.minus(debt)
  return calculatePNL(events, netValueUSD)
}
