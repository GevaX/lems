import { Container, Paper, Typography } from '@mui/material';
import { GetStaticPropsContext, NextPage } from 'next';
import { useTranslations } from 'next-intl';
import { getMessages } from '../locale/get-messages';

const Custom404: NextPage = () => {
  const t = useTranslations('pages.404');

  return (
    <Container
      maxWidth="md"
      sx={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translateX(-50%) translateY(-50%)'
      }}
    >
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h1" gutterBottom>
          {t('title')}
        </Typography>
        <Typography variant="h2" sx={{ color: '#666' }} fontSize="1.5rem">
          {t('subtitle')}
        </Typography>
      </Paper>
    </Container>
  );
};

export const getStaticProps = async ({ locale }: GetStaticPropsContext) => {
  const messages = await getMessages(locale);
  return { props: { messages } };
};

export default Custom404;
