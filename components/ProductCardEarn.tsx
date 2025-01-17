import { Icon } from '@makerdao/dai-ui-icons'
import { BigNumber } from 'bignumber.js'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Flex, Text } from 'theme-ui'

import { formatCryptoBalance, formatPercent } from '../helpers/formatters/format'
import { ProductCardData, productCardsConfig } from '../helpers/productCards'
import { one } from '../helpers/zero'
import { calculateTokenAmount, ProductCard, ProductCardProtocolLink } from './ProductCard'
import { StatefulTooltip } from './Tooltip'

interface UnprofitableTooltipProps {
  value: string
  variant: 'left' | 'right'
}

function UnprofitableSlot({ value, variant }: UnprofitableTooltipProps) {
  const { t } = useTranslation()
  const tooltipSxMap = {
    right: { transform: ['translate(0, 70%)', 'translateX(-24%)'] },
    left: { transform: ['translate(0, 70%)', 'translateX(25%)'] },
  }
  const containerSxMap = {
    right: { justifyContent: 'flex-end' },
    left: { justifyContent: 'flex-start' },
  }

  return (
    <StatefulTooltip
      tooltip={
        <Text sx={{ fontWeight: 'semiBold', mb: 1, fontSize: 2, textAlign: 'left' }}>
          {t('product-card.unprofitable-position')}
        </Text>
      }
      tooltipSx={tooltipSxMap[variant]}
      containerSx={{ alignItems: 'center', ...containerSxMap[variant] }}
    >
      <Flex sx={{ alignItems: 'center' }}>
        {variant === 'right' && <Icon name="error" size={17} sx={{ mr: 1 }} />}
        <Text
          variant="paragraph1"
          sx={{ textAlign: 'right', fontWeight: 'semiBold', color: '#D94A1E' }}
        >
          {value}
        </Text>
        {variant === 'left' && <Icon name="error" size={17} sx={{ ml: 1 }} />}
      </Flex>
    </StatefulTooltip>
  )
}

interface ProductCardEarnProps {
  cardData: ProductCardData
}

export function ProductCardEarn({ cardData }: ProductCardEarnProps) {
  const { t } = useTranslation()
  const defaultDaiValue = new BigNumber(100000)

  const maxMultiple = one.div(cardData.liquidationRatio.minus(one))
  const tagKey = productCardsConfig.earn.tags[cardData.ilk]

  const sevenDayAvarange = new BigNumber(0.1402) // TODO to be replaced with calculations
  const ninetyDayAverage = new BigNumber(0.1201) // TODO to be replaced with calculations
  const unprofitable = false // TODO to be replaced with calculations

  const yieldSevenDayAsPercentage = formatPercent(sevenDayAvarange.times(100), { precision: 2 })
  const yieldNinetyDayAsPercentage = formatPercent(ninetyDayAverage.times(100), { precision: 2 })

  const title = t(`product-card-title.${cardData.ilk}`)

  const { roundedTokenAmount } = calculateTokenAmount({ ...cardData, balance: defaultDaiValue })

  return (
    <ProductCard
      key={cardData.ilk}
      tokenImage={cardData.bannerIcon}
      tokenGif={cardData.bannerGif}
      title={title}
      description={t(`product-card.${productCardsConfig.descriptionCustomKeys[cardData.ilk]}`, {
        token: cardData.token,
      })}
      banner={{
        title: t('product-card-banner.with', {
          value: roundedTokenAmount.toFormat(0),
          token: 'DAI',
        }),
        description: t(`product-card-banner.guni`, {
          value: formatCryptoBalance(maxMultiple.times(roundedTokenAmount)),
          token: cardData.token,
        }),
      }}
      labels={[
        {
          title: t('system.seven-day-average'),
          value: unprofitable ? (
            <UnprofitableSlot value={yieldSevenDayAsPercentage} variant="left" />
          ) : (
            yieldSevenDayAsPercentage
          ),
        },
        {
          title: t('system.ninety-day-average'),
          value: unprofitable ? (
            <UnprofitableSlot value={yieldNinetyDayAsPercentage} variant="left" />
          ) : (
            yieldNinetyDayAsPercentage
          ),
        },
        {
          title: t('system.liquidity-available'),
          value: `${formatCryptoBalance(cardData.liquidityAvailable)}`,
        },
        {
          title: t('system.protocol'),
          value: <ProductCardProtocolLink {...cardData}></ProductCardProtocolLink>,
        },
      ]}
      button={{
        // TODO to be replaced with open-earn in the future
        link: `/vaults/open-multiply/${cardData.ilk}`,
        text: t('nav.earn'),
      }}
      background={cardData.background}
      inactive={productCardsConfig.earn.inactiveIlks.includes(cardData.ilk)}
      isFull={cardData.isFull}
      floatingLabelText={tagKey ? t(`product-card.tags.${tagKey}`, { token: cardData.token }) : ''}
    />
  )
}
