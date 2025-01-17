import { VaultActionInput } from 'components/vault/VaultActionInput'
import { OpenVaultChangesInformation } from 'features/borrow/open/containers/OpenVaultChangesInformation'
import { OpenVaultState } from 'features/borrow/open/pipes/openVault'
import { handleNumericInput } from 'helpers/input'
import React, { useEffect, useState } from 'react'
import { Grid } from 'theme-ui'

import { SidebarResetButton } from './SidebarResetButton'

export function SidebarOpenBorrowVaultEditingStage(props: OpenVaultState) {
  const {
    token,
    depositAmount,
    generateAmount,
    maxDepositAmount,
    maxGenerateAmount,
    updateDeposit,
    updateDepositMax,
    updateDepositUSD,
    depositAmountUSD,
    maxDepositAmountUSD,
    updateGenerate,
    updateGenerateMax,
    showGenerateOption,
    toggleGenerateOption,
    inputAmountsEmpty,
    ilkData: { debtFloor },
    clear,
    priceInfo: { currentCollateralPrice },
  } = props

  const [isGenerateDaiDisabled, setIsGenerateDaiDisabled] = useState<boolean>(true)

  useEffect(() => {
    if (inputAmountsEmpty) {
      setIsGenerateDaiDisabled(true)
    } else {
      if (!showGenerateOption) toggleGenerateOption!()
      setIsGenerateDaiDisabled(false)
    }
  }, [depositAmount])

  return (
    <Grid gap={3}>
      <VaultActionInput
        action="Deposit"
        token={token}
        tokenUsdPrice={currentCollateralPrice}
        showMax={true}
        hasAuxiliary={true}
        onSetMax={updateDepositMax!}
        amount={depositAmount}
        auxiliaryAmount={depositAmountUSD}
        onChange={handleNumericInput(updateDeposit!)}
        onAuxiliaryChange={handleNumericInput(updateDepositUSD!)}
        maxAmount={maxDepositAmount}
        maxAuxiliaryAmount={maxDepositAmountUSD}
        maxAmountLabel={'Balance'}
        hasError={false}
      />
      <VaultActionInput
        action="Generate"
        amount={generateAmount}
        token={'DAI'}
        showMin={true}
        minAmount={debtFloor}
        minAmountLabel={'From'}
        onSetMin={() => {
          updateGenerate!(debtFloor)
        }}
        showMax={true}
        maxAmount={maxGenerateAmount}
        onSetMax={updateGenerateMax}
        onChange={handleNumericInput(updateGenerate!)}
        hasError={false}
        disabled={isGenerateDaiDisabled}
      />
      {!inputAmountsEmpty && <SidebarResetButton clear={clear} />}
      <OpenVaultChangesInformation {...props} />
    </Grid>
  )
}
