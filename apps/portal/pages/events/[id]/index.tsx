import { NextPage, GetServerSideProps, GetServerSidePropsContext } from 'next';
import { useTranslations } from 'next-intl';
import { Box, Container, Stack, Typography } from '@mui/material';
import { PortalEvent, PortalTeam, PortalEventStatus } from '@lems/types';
import { fetchAwards, fetchEvent } from '../../../lib/api';
import EventInfo from '../../../components/events/event-info';
import EventQuickLinks from '../../../components/events/event-quick-links';
import TeamList from '../../../components/teams/team-list';
import EventStatus from '../../../components/events/event-status';
import { useRealtimeData } from '../../../hooks/use-realtime-data';
import { getMessages } from '../../../locale/get-messages';

interface Props {
  event: PortalEvent;
  teams: PortalTeam[];
  hasAwards: boolean;
}

const Page: NextPage<Props> = ({ event, teams, hasAwards }) => {
  const {
    data: status,
    isLoading,
    error
  } = useRealtimeData<PortalEventStatus>(`/events/${event.id}/status`);
  const t = useTranslations('pages.events.id.index');

  return (
    <Container maxWidth="md" sx={{ my: 2 }}>
      <Typography variant="h1">{event.name}</Typography>
      {event.isDivision && (
        <Stack direction="row" spacing={2} alignItems="center">
          <Box bgcolor={event.color} width={18} height={18} borderRadius={1} />
          <Typography variant="body1" color="text.secondary">
            {event.subtitle}
          </Typography>
        </Stack>
      )}
      <EventInfo event={event} teamCount={teams.length} />
      {!isLoading && !error && status.isLive && <EventStatus status={status} />}
      <EventQuickLinks event={event} hasAwards={hasAwards} />
      <Typography variant="h2" gutterBottom>
        {t('event-teams')}
      </Typography>
      <TeamList eventId={event.id} teams={teams} />
    </Container>
  );
};

export const getServerSideProps: GetServerSideProps = async (ctx: GetServerSidePropsContext) => {
  const eventId = ctx.params?.id as string;
  const { event, teams } = await fetchEvent(eventId);
  const awards = await fetchAwards(eventId);
  const messages = await getMessages(ctx.locale);
  return { props: { event, teams, hasAwards: !!awards, messages } };
};

export default Page;
