import { Icon } from '@makerdao/dai-ui-icons'
import { Context } from 'blockchain/network'
import { AppLink } from 'components/Links'
import { VaultOverviewOwnershipBanner } from 'features/banners/VaultsBannersView'
import { formatAddress } from 'helpers/formatters/format'
import { ProductCardData } from 'helpers/productCards'
import { Trans, useTranslation } from 'next-i18next'
import React from 'react'
import { Card, Flex, Grid, Heading, Text } from 'theme-ui'

import { PositionList } from '../../components/dumb/PositionList'
import { useFeatureToggle } from '../../helpers/useFeatureToggle'
import { AssetsAndPositionsOverview } from './containers/AssetsAndPositionsOverview'
import { Summary } from './Summary'
import { VaultsOverview } from './vaultsOverview'
import { VaultSuggestions } from './VaultSuggestions'

interface Props {
  vaultsOverview: VaultsOverview
  context: Context
  address: string
  ensName: string | null | undefined
  productCardsData: ProductCardData[]
}

function getHeaderTranslationKey(
  connectedAccount: string | undefined,
  address: string,
  numberOfVaults: number,
) {
  const HEADERS_PATH = 'vaults-overview.headers'
  if (connectedAccount === undefined) {
    return numberOfVaults === 0
      ? `${HEADERS_PATH}.notConnected-noVaults`
      : `${HEADERS_PATH}.notConnected-withVaults`
  }

  if (address === connectedAccount) {
    return numberOfVaults === 0
      ? `${HEADERS_PATH}.connected-owner-noVaults`
      : `${HEADERS_PATH}.connected-owner-withVaults`
  }

  return numberOfVaults === 0
    ? `${HEADERS_PATH}.connected-viewer-noVaults`
    : `${HEADERS_PATH}.connected-viewer-withVaults`
}

export function VaultsOverviewView({
  vaultsOverview,
  context,
  address,
  ensName,
  productCardsData,
}: Props) {
  const { t } = useTranslation()

  const earnEnabled = useFeatureToggle('EarnProduct')
  const { positions, vaultSummary } = vaultsOverview
  const numberOfVaults = positions.length

  if (vaultSummary === undefined) {
    return null
  }

  const connectedAccount = context?.status === 'connected' ? context.account : undefined
  const headerTranslationKey = getHeaderTranslationKey(connectedAccount, address, numberOfVaults)

  const isOwnerViewing = !!connectedAccount && address === connectedAccount

  return (
    <Grid sx={{ flex: 1, zIndex: 1 }}>
      {connectedAccount && address !== connectedAccount && (
        <VaultOverviewOwnershipBanner account={connectedAccount} controller={address} />
      )}
      <Flex sx={{ mt: 5, mb: 4, flexDirection: 'column' }}>
        {earnEnabled && <AssetsAndPositionsOverview address={address} />}
        <Heading variant="header2" sx={{ textAlign: 'center' }} as="h1">
          <Trans
            i18nKey={headerTranslationKey}
            values={{ address: formatAddress(address) }}
            components={[<br />]}
          />
        </Heading>
        {isOwnerViewing && numberOfVaults === 0 && (
          <>
            <Text variant="paragraph1" sx={{ mb: 3, color: 'lavender', textAlign: 'center' }}>
              <Trans i18nKey="vaults-overview.subheader-no-vaults" components={[<br />]} />
            </Text>
            <AppLink
              href="/"
              variant="primary"
              sx={{
                display: 'flex',
                margin: '0 auto',
                px: '40px',
                py: 2,
                my: 4,
                alignItems: 'center',
                '&:hover svg': {
                  transform: 'translateX(10px)',
                },
              }}
              hash="product-cards-wrapper"
            >
              {t('open-vault.title')}
              <Icon
                name="arrow_right"
                sx={{
                  ml: 2,
                  position: 'relative',
                  left: 2,
                  transition: '0.2s',
                }}
              />
            </AppLink>
          </>
        )}
        {context.status === 'connectedReadonly' && numberOfVaults === 0 && (
          <>
            <AppLink
              href="/connect"
              variant="primary"
              sx={{
                display: 'flex',
                margin: '0 auto',
                px: '40px',
                py: 2,
                my: 4,
                alignItems: 'center',
                '&:hover svg': {
                  transform: 'translateX(10px)',
                },
              }}
            >
              {t('connect-wallet')}
              <Icon
                name="arrow_right"
                sx={{
                  ml: 2,
                  position: 'relative',
                  left: 2,
                  transition: '0.2s',
                }}
              />
            </AppLink>
          </>
        )}
      </Flex>
      {numberOfVaults !== 0 && (
        <>
          <Summary summary={vaultSummary} />
          <Card variant="surface" sx={{ mb: 5, px: 3 }}>
            <PositionList positions={positions} />
          </Card>
        </>
      )}
      {isOwnerViewing && (
        <VaultSuggestions productCardsData={productCardsData} address={ensName || address} />
      )}
    </Grid>
  )
}
