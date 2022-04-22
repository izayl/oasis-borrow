import { Icon } from '@makerdao/dai-ui-icons'
import { ModalProps, useModal } from 'helpers/modalHook'
import React, { ReactNode, useState } from 'react'
import { Box, Flex, Grid, Heading, Text } from 'theme-ui'

import { AppLink } from './Links'
import { CollRatioColor, VaultDetailsCardModal } from './vault/VaultDetails'
import { WithArrow } from './WithArrow'

export type ChangeVariantType = 'positive' | 'negative'

interface DetailsSectionContentCardChangePillProps {
  value: string
  variant: ChangeVariantType
}

interface DetailsSectionContentCardLinkProps {
  label: string
  url?: string
  action?: () => void
}

interface ContentCardProps {
  title: string
  value?: string
  unit?: string
  change?: DetailsSectionContentCardChangePillProps
  footnote?: string
  link?: DetailsSectionContentCardLinkProps
  modal?: string | JSX.Element
}

export function getChangeColor(collRatioColor: CollRatioColor): ChangeVariantType {
  return (collRatioColor === 'primary' || collRatioColor === 'onSuccess') ? 'positive' : 'negative'
}

function DetailsSectionContentCardChangePill({
  value,
  variant,
}: DetailsSectionContentCardChangePillProps) {
  return (
    <Text
      as="p"
      variant="label"
      sx={{
        px: 3,
        py: 1,
        ...(variant === 'positive' && {
          color: 'onSuccess',
          backgroundColor: 'dimSuccess',
        }),
        ...(variant === 'negative' && {
          color: 'onError',
          backgroundColor: 'dimError',
        }),
        borderRadius: 'mediumLarge',
      }}
    >
      {value}
    </Text>
  )
}

function DetailsSectionContentCardLink({ label, url, action }: DetailsSectionContentCardLinkProps) {
  return (
    <>
      {url && (
        <AppLink href={url} sx={{ mt: 2 }}>
          <WithArrow gap={1} sx={{ fontSize: 1, color: 'link' }}>
            {label}
          </WithArrow>
        </AppLink>
      )}
      {action && (
        <Text as="span" sx={{ mt: 2, cursor: 'pointer' }} onClick={action}>
          <WithArrow gap={1} sx={{ fontSize: 1, color: 'link' }}>
            {label}
          </WithArrow>
        </Text>
      )}
    </>
  )
}

function DetailsSectionContentCardModal({
  close,
  children,
}: ModalProps<{ children: string | JSX.Element }>) {
  return <VaultDetailsCardModal close={close}>{children}</VaultDetailsCardModal>
}

export function DetailsSectionContentCardWrapper({ children }: { children: ReactNode }) {
  return (
    <Grid
      sx={{
        gridTemplateColumns: ['1fr', null, null, '1fr 1fr'],
      }}
    >
      {children}
    </Grid>
  )
}

export function DetailsSectionContentCard({
  title,
  value,
  unit,
  change,
  footnote,
  link,
  modal,
}: ContentCardProps) {
  const openModal = useModal()
  const [isHighlighted, setIsHighlighted] = useState(false)
  const modalHandler = () => {
    if (modal) openModal(DetailsSectionContentCardModal, { children: modal })
  }
  const hightlightableItemEvents = {
    onMouseEnter: () => setIsHighlighted(true),
    onMouseLeave: () => setIsHighlighted(false),
    onClick: modalHandler,
  }

  return (
    <Flex
      sx={{
        flexDirection: 'column',
        alignItems: 'flex-start',
        p: '12px',
        borderRadius: 'medium',
        backgroundColor: modal && isHighlighted ? 'secondaryAlt' : 'surface',
        transition: 'background-color 200ms',
      }}
    >
      <Heading
        as="h3"
        variant="label"
        sx={{ cursor: modal ? 'pointer' : 'auto' }}
        {...hightlightableItemEvents}
      >
        {title}
        {modal && (
          <Icon
            color={isHighlighted ? 'primary' : 'text.subtitle'}
            name="question_o"
            size="auto"
            width="14px"
            height="14px"
            sx={{ position: 'relative', top: '2px', ml: 1, transition: 'color 200ms' }}
          />
        )}
      </Heading>
      <Text
        as="p"
        variant="header2"
        sx={{ lineHeight: 'loose', cursor: modal ? 'pointer' : 'auto' }}
        {...hightlightableItemEvents}
      >
        {value || '-'}
        {unit && (
          <Text as="small" sx={{ ml: 1, fontSize: 5 }}>
            {unit}
          </Text>
        )}
      </Text>
      {change && (
        <Box sx={{ pt: 2, cursor: modal ? 'pointer' : 'auto' }} {...hightlightableItemEvents}>
          <DetailsSectionContentCardChangePill {...change} />
        </Box>
      )}
      {footnote && (
        <Text
          as="p"
          variant="label"
          sx={{ pt: 2, cursor: modal ? 'pointer' : 'auto' }}
          {...hightlightableItemEvents}
        >
          {footnote}
        </Text>
      )}
      {link?.label && (link?.url || link?.action) && <DetailsSectionContentCardLink {...link} />}
    </Flex>
  )
}
