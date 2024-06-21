import { useState } from 'react';
import { GetServerSideProps, NextPage } from 'next';
import { useRouter } from 'next/router';
import { WithId } from 'mongodb';
import { enqueueSnackbar } from 'notistack';
import { Box, Paper, Stack } from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';
import {
  Division,
  SafeUser,
  JudgingCategory,
  Rubric,
  Team,
  Scoresheet,
  JudgingSession,
  JudgingRoom,
  CoreValuesForm
} from '@lems/types';
import { localizedJudgingCategory } from '@lems/season';
import CategoryDeliberationsGrid from '../../../../components/deliberations/category-deliberations-grid';
import ScoresPerRoomChart from '../../../../components/insights/charts/scores-per-room-chart';
import { RoleAuthorizer } from '../../../../components/role-authorizer';
import ConnectionIndicator from '../../../../components/connection-indicator';
import Layout from '../../../../components/layout';
import { apiFetch, serverSideGetRequests } from '../../../../lib/utils/fetch';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';

interface Props {
  user: WithId<SafeUser>;
  division: WithId<Division>;
  teams: Array<WithId<Team>>;
  rubrics: Array<WithId<Rubric<JudgingCategory>>>;
  rooms: Array<WithId<JudgingRoom>>;
  sessions: Array<WithId<JudgingSession>>;
  scoresheets: Array<WithId<Scoresheet>>;
  cvForms: Array<WithId<CoreValuesForm>>;
}

interface DeliberationTeamNumberProps {
  team: WithId<Team>;
  index: number;
}

const DeliberationTeamNumber: React.FC<DeliberationTeamNumberProps> = ({ team, index }) => {
  return (
    <Grid xs={1}>
      <Draggable key={team._id.toString()} draggableId={team._id.toString()} index={index}>
        {(provided, snapshot) => (
          <div ref={provided.innerRef}>
            <Paper
              sx={{
                border: `1px ${snapshot.isDragging ? 'dashed' : 'solid'} #ccc`,
                borderRadius: 1,
                minHeight: 35,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                userSelect: 'none'
              }}
              {...provided.dragHandleProps}
              {...provided.draggableProps}
              style={provided.draggableProps.style}
            >
              {team.number}
            </Paper>
            {snapshot.isDragging && (
              <Paper
                sx={{
                  border: '1px solid #ccc',
                  borderRadius: 1,
                  minHeight: 35,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  userSelect: 'none'
                }}
              >
                {team.number}
              </Paper>
            )}
          </div>
        )}
      </Draggable>
    </Grid>
  );
};

const Page: NextPage<Props> = ({
  user,
  division,
  teams,
  rubrics,
  rooms,
  sessions,
  cvForms,
  scoresheets
}) => {
  const router = useRouter();
  const judgingCategory: JudgingCategory = router.query.judgingCategory as JudgingCategory;

  return (
    <RoleAuthorizer
      user={user}
      allowedRoles={['lead-judge', 'judge-advisor']}
      onFail={() => {
        router.push(`/lems/${user.role}`);
        enqueueSnackbar('לא נמצאו הרשאות מתאימות.', { variant: 'error' });
      }}
    >
      <Layout
        maxWidth={1900}
        title={`דיון תחום ${
          localizedJudgingCategory[judgingCategory as JudgingCategory].name
        } | בית ${division.name}`}
        // error={connectionStatus === 'disconnected'}
        // action={<ConnectionIndicator status={connectionStatus} />}
        color={division.color}
      >
        <DragDropContext
          onDragEnd={result => {
            console.log(result);
            const { source, destination } = result;
            if (!destination) {
              console.log('yo');
              return;
            }

            switch (source.droppableId) {
              case 'teams':
                console.log('hi');
                break;
            }
          }}
        >
          <Grid container sx={{ pt: 2 }} columnSpacing={4} rowSpacing={2}>
            <Grid xs={8}>
              <CategoryDeliberationsGrid
                category={judgingCategory}
                rooms={rooms}
                rubrics={rubrics}
                scoresheets={scoresheets}
                sessions={sessions}
                teams={teams}
                cvForms={cvForms}
              />
            </Grid>
            <Grid xs={4} component={Box} p={2}>
              <Droppable key="picklist" droppableId="picklist">
                {(provided, snapshot) => (
                  <Paper sx={{ p: 2 }}>
                    <Stack ref={provided.innerRef} {...provided.droppableProps}>
                      {provided.placeholder}
                    </Stack>
                  </Paper>
                )}
              </Droppable>
            </Grid>
            <Grid xs={5}>
              <ScoresPerRoomChart division={division} height={210} />
            </Grid>
            <Grid xs={7}>
              <Paper sx={{ p: 2, height: '100%' }}>
                <Droppable droppableId="teams" isDropDisabled>
                  {provided => (
                    <Grid
                      container
                      columns={Math.max(8, Math.ceil(teams.length / 6))}
                      columnSpacing={2}
                      rowSpacing={1}
                      flexDirection="row"
                      alignItems="center"
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                    >
                      {teams
                        .filter(team => team.registered)
                        .sort((a, b) => a.number - b.number)
                        .map((team, index) => (
                          <DeliberationTeamNumber team={team} index={index} />
                        ))}
                    </Grid>
                  )}
                </Droppable>
              </Paper>
            </Grid>
          </Grid>
        </DragDropContext>
      </Layout>
    </RoleAuthorizer>
  );
};

export const getServerSideProps: GetServerSideProps = async ctx => {
  try {
    const user = await apiFetch(`/api/me`, undefined, ctx).then(res => res?.json());

    const data = await serverSideGetRequests(
      {
        division: `/api/divisions/${user.divisionId}`,
        teams: `/api/divisions/${user.divisionId}/teams`,
        rubrics: `/api/divisions/${user.divisionId}/rubrics/${ctx.params?.judgingCategory}`,
        rooms: `/api/divisions/${user.divisionId}/rooms`,
        sessions: `/api/divisions/${user.divisionId}/sessions`,
        scoresheets: `/api/divisions/${user.divisionId}/scoresheets`,
        cvForms: `/api/divisions/${user.divisionId}/cv-forms`
      },
      ctx
    );

    return { props: { user, ...data } };
  } catch (err) {
    return { redirect: { destination: '/login', permanent: false } };
  }
};

export default Page;
