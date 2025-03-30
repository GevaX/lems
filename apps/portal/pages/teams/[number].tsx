import { fetchGlobalTeam } from "../../lib/api";
import { NextPage, GetServerSideProps, GetServerSidePropsContext } from 'next';
import { Avatar, Container, Divider, Paper, Typography, Box } from '@mui/material';
import Grid from '@mui/material/Grid2';
import { PortalAward, PortalEvent, PortalTeam } from "@lems/types";
import EventList from "../../components/events/event-list";
import AwardBanner from "../../components/teams/award-banner";

interface TeamProps {
  team: PortalTeam;
  events: PortalEvent[];
  awards: { award: PortalAward; event: PortalEvent }[] | [];
}

const Page: NextPage<TeamProps> = ({ team, awards, events }) => {
  return (
    <Container maxWidth="md" sx={{ mt: 2 }}>
      <Typography variant="h1">
        מידע קבוצה גלובלי
      </Typography>
      <Divider sx={{ my: 2 }} />
      <Grid container rowSpacing={2} columnSpacing={2}>
        <Grid size={{ xs: 12, md: 11.6 }} display="flex" flexDirection="column">
          <Paper sx={{ p: 2, flexGrow: 1 }}>
            <Grid container alignItems="center">
              <Grid size={4}>
                <Avatar
                  src="/assets/default-avatar.svg"
                  alt="לוגו קבוצתי"
                  sx={{ width: 72, height: 72 }}
                />
              </Grid>
              <Grid size={8}>
                <Typography variant="h2">
                  👥 {team.name} #{team.number}
                </Typography>
                <Typography variant="h6">
                  🏫 {team.affiliation.name}, {team.affiliation.city}
                </Typography>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
        <br />
        <Grid size={{ xs: 12, md: 6 }}>
          <Typography variant="h5">
            היסטורית תחרויות
          </Typography>
          <EventList
            events={events}
            emptyText="שגיאת מערכת."
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Typography variant="h5">
            היסטורית פרסים
          </Typography>
          <Box sx={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 2,
            mt: 2,
            justifyContent: { xs: 'center', md: 'flex-start' }
          }}>
            {awards && awards.length > 0 ? (
              Object.entries(
                awards.reduce((acc: Record<number, { award: PortalAward; event: PortalEvent }[]>, item) => {
                  const year = new Date(item.event.date).getFullYear();
                  if (!acc[year]) acc[year] = [];
                  acc[year].push(item);
                  return acc;
                }, {})
              )
                .sort(([yearA], [yearB]) => Number(yearB) - Number(yearA))
                .map(([year, yearAwards]) => (
                  <Box key={year} sx={{ width: '100%' }}>
                    <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>{year}</Typography>
                    <Divider sx={{ mb: 2 }} />
                    <Box sx={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: 2,
                      justifyContent: { xs: 'center', md: 'flex-start' }
                    }}>
                      {yearAwards.map((item, index) => (
                        <AwardBanner key={`${item.award.name}-${index}`} award={item.award} event={item.event} />
                      ))}
                    </Box>
                  </Box>
                ))
            ) : (
              <Typography>לא נמצאו פרסים</Typography>
            )}
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
};

export const getServerSideProps: GetServerSideProps = async (ctx: GetServerSidePropsContext) => {
  const teamNumber = ctx.params?.number as string;

  const { team, awards, events } = await fetchGlobalTeam(teamNumber);
  return { props: { team, awards, events } };
};

export default Page;