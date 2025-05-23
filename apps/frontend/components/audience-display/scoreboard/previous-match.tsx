import { Stack, Typography, GridProps, Paper } from '@mui/material';
import Grid from '@mui/material/Grid';
import { yellow, grey, green } from '@mui/material/colors';
import { WithId } from 'mongodb';
import { Team, Scoresheet, RobotGameMatch } from '@lems/types';
import { localizedMatchStage } from '../../../localization/field';

interface TeamScoreBoxProps {
  team: WithId<Team>;
  scoresheet: WithId<Scoresheet>;
}

const TeamScoreBox: React.FC<TeamScoreBoxProps> = ({ team, scoresheet }) => {
  let styles;
  if (scoresheet.status === 'in-progress' || scoresheet.escalated) {
    styles = {
      color: yellow[800],
      border: `1px solid ${yellow[300]}`,
      backgroundColor: yellow[100]
    };
  } else if (scoresheet.status === 'empty') {
    styles = {
      color: grey[800],
      border: `1px solid ${grey[300]}`,
      backgroundColor: grey[100]
    };
  } else {
    // Completed, Ready, Waiting for GP
    styles = {
      color: green[800],
      border: `1px solid ${green[300]}`,
      backgroundColor: green[100]
    };
  }

  return (
    <Stack
      sx={{
        color: styles.color,
        border: styles.border,
        backgroundColor: styles.backgroundColor,
        borderRadius: '0.5rem',
        px: 1.5,
        py: 0.5
      }}
      direction="row"
      spacing={4}
      alignItems="center"
      justifyContent="center"
      height="100%"
    >
      <Typography fontSize="2rem">#{team.number}</Typography>
      <Typography fontWeight={700} fontSize="2rem" color="textSecondary">
        {scoresheet.escalated ? 'בבדיקה' : scoresheet.data?.score || '-'}
      </Typography>
    </Stack>
  );
};

interface ScoreboardPreviousMatchProps extends GridProps {
  previousMatch: WithId<RobotGameMatch> | undefined;
  previousScoresheets: Array<WithId<Scoresheet>>;
}

const ScoreboardPreviousMatch: React.FC<ScoreboardPreviousMatchProps> = ({
  previousMatch,
  previousScoresheets,
  ...props
}) => {
  return (
    <Grid container component={Paper} {...props} alignItems="center">
      <Grid size={3}>
        <Typography component="h2" fontSize="1.75rem" fontWeight={500}>
          {previousMatch?.number
            ? `מקצה קודם (מקצה ${previousMatch && localizedMatchStage[previousMatch.stage]} #${previousMatch?.number})`
            : previousMatch?.stage === 'test'
              ? 'מקצה בדיקה'
              : 'מקצה קודם (-)'}
        </Typography>
        <Typography fontWeight={400} fontSize="1.5rem" color="textSecondary">
          הניקוד אינו סופי ויכול להשתנות בכל רגע.
        </Typography>
      </Grid>
      <Grid
        container
        columns={previousMatch?.participants.filter(p => p.teamId).length}
        alignContent="center"
        direction="row"
        height="100%"
        spacing={2}
        size={9}
      >
        {previousMatch?.participants
          .filter(p => p.teamId)
          .map(p => {
            const scoresheet = previousScoresheets.find(s => s.teamId === p.teamId);
            return (
              scoresheet && (
                <Grid key={scoresheet._id.toString()} height="100%" size={1}>
                  <TeamScoreBox
                    team={p.team || ({} as WithId<Team>)}
                    scoresheet={scoresheet || ({} as WithId<Scoresheet>)}
                  />
                </Grid>
              )
            );
          })}
      </Grid>
    </Grid>
  );
};

export default ScoreboardPreviousMatch;
