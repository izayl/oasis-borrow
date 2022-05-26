import { Box } from "@theme-ui/components";
import { useTranslation } from "next-i18next";
import { Flex, Image, Link, Text } from 'theme-ui';

export default function () {
  const { t } = useTranslation();

  return (
    <Box>
        <Text
          variant='paragraph3'
          sx={{ position: 'relative', color: 'text.subtitle', mb: 4 }}
        >
          {t('proxy-waiting-text')} <Link href="https://kb.oasis.app/help" target="blank">{t('proxy-waiting-text-link')}</Link>.
        </Text>
      <Flex
        sx={{
          justifyContent: 'center',
          px: '30px',
          pt: '30px',
          pb: '38px'
        }}
      >
        <Image
          src="/static/img/proxy/process-setup.svg"
          alt="setup process"
        />
      </Flex>
    </Box>
  )
}