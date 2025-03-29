import { Container, Typography, Box } from '@mui/material';
import GlobalTeamList from '../components/teams/global-team-list';

const teams = () => {
  return (
    <>
      <Container maxWidth="md" sx={{ mt: 2 }}>
        <Box maxWidth="95%" mb={8}>
          <Typography variant="h2" gutterBottom sx={{ my: 2 }}>
            קבוצות
          </Typography>
          <Typography>
            שימו לב שרשימה זו כוללת רק את הקבוצות הפעילות מאז תחילת השימוש במערכת
          </Typography>
          <GlobalTeamList />
        </Box>
      </Container>
    </>
  )
}

export default teams