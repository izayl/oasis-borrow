import BigNumber from 'bignumber.js'
import { WithConnection } from 'components/connectWallet/ConnectWallet'
import { AppLayout } from 'components/Layouts'
import { TabSwitch, VaultViewMode } from 'components/TabSwitch'
import { VaultBannersView } from 'features/banners/VaultsBannersView'
import { GeneralManageVaultView } from 'features/generalManageVault/GeneralManageVaultView'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import NotFoundPage from 'pages/404'
import React, { useState } from 'react'
import { Box } from 'theme-ui'
import { BackgroundLight } from 'theme/BackgroundLight'

import { WithTermsOfService } from '../../features/termsOfService/TermsOfService'

export async function getServerSideProps(ctx: any) {
  return {
    props: {
      ...(await serverSideTranslations(ctx.locale, ['common'])),
      id: ctx.query.vault || null,
    },
  }
}

export default function Vault({ id }: { id: string }) {
  const vaultId = new BigNumber(id)
  const isValidVaultId = vaultId.isInteger() && vaultId.gt(0)

  return (
    <WithConnection>
      <WithTermsOfService>
        <BackgroundLight />
        {isValidVaultId ? (
          <Box sx={{ width: '100%' }}>
            <VaultBannersView id={vaultId} />
            <TabSwitch
              defaultMode={VaultViewMode.Overview}
              overViewControl={<GeneralManageVaultView id={vaultId} />}
              historyControl={<h1>TODO History</h1>}
              protectionControl={<h1>TODO Protection</h1>}
            />
          </Box>
        ) : (
          <Box sx={{ position: 'relative', zIndex: 1 }}>
            <NotFoundPage />
          </Box>
        )}
      </WithTermsOfService>
    </WithConnection>
  )
}

Vault.layout = AppLayout
