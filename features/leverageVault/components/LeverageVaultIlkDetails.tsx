import { Box,  Text } from '@theme-ui/components'
import { formatCryptoBalance, formatPercent } from 'helpers/formatters/format'
import { useTranslation } from 'next-i18next'
import React from 'react'

import { LeverageVaultState } from '../leverageVault'

function VaultIlkDetailsItem({ label, value }: { label: string; value: string }) {
  return (
    <Box
      sx={{
        px: [0, 4],
        borderRight: ['none', 'light'],
        '&:first-child': {
          pl: 0,
        },
        '&:last-child': {
          borderRight: 'none',
        },
      }}
    >
      {`${label} `}
      <Text as="span" sx={{ color: 'primary' }}>
        {value}
      </Text>
    </Box>
  )
}

export function LeverageVaultIlkDetails({
  ilkData: { liquidationRatio, stabilityFee, liquidationPenalty, debtFloor },
}: LeverageVaultState) {
  const { t } = useTranslation()

  return (
    <Box
      sx={{
        mb: 4,
        fontSize: 1,
        fontWeight: 'semiBold',
        color: 'text.subtitle',
        display: ['grid', 'flex'],
        gridTemplateColumns: '1fr 1fr',
        gap: [3, 0],
      }}
    >
      <VaultIlkDetailsItem label={'VaultID'} value={'T.B.D'} />
      <VaultIlkDetailsItem
        label={t('manage-vault.stability-fee')}
        value={`${formatPercent(stabilityFee.times(100), { precision: 2 })}`}
      />
      <VaultIlkDetailsItem
        label={t('manage-vault.liquidation-fee')}
        value={`${formatPercent(liquidationPenalty.times(100), { precision: 2 })}`}
      />
      <VaultIlkDetailsItem
        label={t('manage-vault.min-collat-ratio')}
        value={`${formatPercent(liquidationRatio.times(100), { precision: 2 })}`}
      />
      <VaultIlkDetailsItem
        label={t('manage-vault.dust-limit')}
        value={`$${formatCryptoBalance(debtFloor)}`}
      />
    </Box>
  )
}