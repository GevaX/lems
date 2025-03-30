import { PortalEvent, PortalTeam } from '@lems/types';
import { Stack, Divider, Typography, StackProps, Box } from '@mui/material';
import EventLink from './team-event-link';

interface TeamEventListProps extends StackProps {
  events: Array<PortalEvent>;
  team: PortalTeam;
  emptyText: string;
  title?: string;
  includeDate?: boolean;
  id?: string;
}

const TeamEventList: React.FC<TeamEventListProps> = ({
  events,
  team,
  emptyText,
  title,
  includeDate = false,
  id
}) => {
  return (
    <Box pb={2}>
      {title && (
        <Typography variant="h2" gutterBottom>
          {title}
        </Typography>
      )}
      <Stack id={id} spacing={1} divider={<Divider flexItem variant="middle" />}>
        {events.length === 0 && (
          <Typography pl={1} variant="body1">
            {emptyText}
          </Typography>
        )}
        {events.map(event => (
          <EventLink key={event.id} team={team} event={event} includeDate={includeDate} />
        ))}
      </Stack>
    </Box>
  );
};

export default TeamEventList;
