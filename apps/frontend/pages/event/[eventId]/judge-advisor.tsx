import { useState } from 'react';
import { Form, Formik } from 'formik';
import { GetServerSideProps, NextPage } from 'next';
import { useRouter } from 'next/router';
import { WithId } from 'mongodb';
import { enqueueSnackbar } from 'notistack';
import {
  Avatar,
  Box,
  Card,
  CardHeader,
  CardContent,
  Paper,
  Stack,
  Tab,
  Tabs,
  Typography,
  IconButton
} from '@mui/material';
import { LoadingButton, TabContext, TabPanel } from '@mui/lab';
import Grid from '@mui/material/Unstable_Grid2';
import JudgingRoomIcon from '@mui/icons-material/Workspaces';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import ManageIcon from '@mui/icons-material/WidgetsRounded';
import OpenInFullIcon from '@mui/icons-material/OpenInFull';
import {
  JudgingRoom,
  JudgingSession,
  SafeUser,
  Event,
  Team,
  JudgingCategory,
  Rubric,
  Award,
  CoreValuesForm
} from '@lems/types';
import { cvFormSchema } from '@lems/season';
import { RoleAuthorizer } from '../../../components/role-authorizer';
import { apiFetch, serverSideGetRequests } from '../../../lib/utils/fetch';
import RubricStatusReferences from '../../../components/judging/rubric-status-references';
import ConnectionIndicator from '../../../components/connection-indicator';
import Layout from '../../../components/layout';
import JudgingRoomSchedule from '../../../components/judging/judging-room-schedule';
import ExportAction from '../../../components/judging/judge-advisor/export-action';
import AwardWinnerSelector from '../../../components/judging/judge-advisor/award-winner-selector';
import { localizedRoles } from '../../../localization/roles';
import { localizedFormSubject } from '../../../localization/cv-form';
import { useWebsocket } from '../../../hooks/use-websocket';

interface Props {
  user: WithId<SafeUser>;
  event: WithId<Event>;
  rooms: Array<WithId<JudgingRoom>>;
  teams: Array<WithId<Team>>;
  sessions: Array<WithId<JudgingSession>>;
  rubrics: Array<WithId<Rubric<JudgingCategory>>>;
  awards: Array<WithId<Award>>;
  cvForms: Array<WithId<CoreValuesForm>>;
}

const Page: NextPage<Props> = ({
  user,
  event,
  rooms,
  teams: initialTeams,
  sessions: initialSessions,
  rubrics: initialRubrics,
  awards,
  cvForms: initialCvForms
}) => {
  const router = useRouter();
  const [teams, setTeams] = useState<Array<WithId<Team>>>(initialTeams);
  const [sessions, setSessions] = useState<Array<WithId<JudgingSession>>>(initialSessions);
  const [rubrics, setRubrics] = useState<Array<WithId<Rubric<JudgingCategory>>>>(initialRubrics);
  const [cvForms, setCvForms] = useState<Array<WithId<CoreValuesForm>>>(initialCvForms);
  const [activeTab, setActiveTab] = useState<string>('1');

  awards.sort((a, b) => {
    const diff = a.index - b.index;
    if (diff !== 0) return diff;
    return a.place - b.place;
  });

  const handleSessionEvent = (session: WithId<JudgingSession>) => {
    setSessions(sessions =>
      sessions.map(s => {
        if (s._id === session._id) {
          return session;
        }
        return s;
      })
    );
  };

  const handleTeamRegistered = (team: WithId<Team>) => {
    setTeams(teams =>
      teams.map(t => {
        if (t._id == team._id) {
          return team;
        } else {
          return t;
        }
      })
    );
  };

  const updateRubric = (rubric: WithId<Rubric<JudgingCategory>>) => {
    setRubrics(rubrics =>
      rubrics.map(r => {
        if (r._id === rubric._id) {
          return rubric;
        }
        return r;
      })
    );
  };

  const handleCvFormCreated = (cvForm: WithId<CoreValuesForm>) => {
    setCvForms(cvForms => [...cvForms, cvForm]);
  };

  const handleCvFormUpdated = (cvForm: WithId<CoreValuesForm>) => {
    setCvForms(cvForms =>
      cvForms.map(f => {
        if (f._id === cvForm._id) {
          return cvForm;
        } else {
          return f;
        }
      })
    );
  };

  const { socket, connectionStatus } = useWebsocket(
    event._id.toString(),
    ['judging', 'pit-admin'],
    undefined,
    [
      { name: 'judgingSessionStarted', handler: handleSessionEvent },
      { name: 'judgingSessionCompleted', handler: handleSessionEvent },
      { name: 'judgingSessionAborted', handler: handleSessionEvent },
      { name: 'judgingSessionUpdated', handler: handleSessionEvent },
      { name: 'teamRegistered', handler: handleTeamRegistered },
      { name: 'rubricStatusChanged', handler: updateRubric },
      {
        name: 'cvFormCreated',
        handler: cvForm => {
          handleCvFormCreated(cvForm);
          enqueueSnackbar('נוצר טופס ערכי ליבה חדש!', { variant: 'warning' });
        }
      },
      {
        name: 'cvFormUpdated',
        handler: cvForm => {
          handleCvFormUpdated(cvForm);
          enqueueSnackbar('עודכן טופס ערכי ליבה!', { variant: 'info' });
        }
      }
    ]
  );

  return (
    <RoleAuthorizer
      user={user}
      allowedRoles="judge-advisor"
      onFail={() => {
        router.push(`/event/${event._id}/${user.role}`);
        enqueueSnackbar('לא נמצאו הרשאות מתאימות.', { variant: 'error' });
      }}
    >
      <Layout
        maxWidth={800}
        title={`ממשק ${user.role && localizedRoles[user.role].name} | ${event.name}`}
        error={connectionStatus === 'disconnected'}
        action={<ConnectionIndicator status={connectionStatus} />}
      >
        <>
          <TabContext value={activeTab}>
            <Paper sx={{ mt: 2 }}>
              <Tabs
                value={activeTab}
                onChange={(_e, newValue: string) => setActiveTab(newValue)}
                centered
              >
                <Tab label="שיפוט" value="1" />
                <Tab label="פרסים" value="2" />
                <Tab label="טפסי CV" value="3" />
              </Tabs>
            </Paper>
            <TabPanel value="1">
              <Paper sx={{ borderRadius: 2, mb: 4, boxShadow: 2, p: 2 }}>
                <RubricStatusReferences />
              </Paper>
              {rooms.map(room => (
                <Paper key={room._id.toString()} sx={{ borderRadius: 3, mb: 4, boxShadow: 2 }}>
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'row',
                      alignItems: 'center',
                      p: 3,
                      pb: 1
                    }}
                  >
                    <Avatar
                      sx={{
                        bgcolor: '#ede9fe',
                        color: '#a78bfa',
                        width: '2rem',
                        height: '2rem',
                        mr: 1
                      }}
                    >
                      <JudgingRoomIcon sx={{ fontSize: '1rem' }} />
                    </Avatar>
                    <Typography variant="h2" fontSize="1.25rem">
                      חדר שיפוט {room.name}
                    </Typography>
                  </Box>
                  <JudgingRoomSchedule
                    sessions={sessions.filter(s => s.roomId === room._id)}
                    event={event}
                    room={room}
                    teams={teams}
                    user={user}
                    socket={socket}
                    rubrics={rubrics}
                  />
                </Paper>
              ))}
            </TabPanel>
            <TabPanel value="2">
              <Paper sx={{ borderRadius: 3, mb: 4, boxShadow: 2, p: 3 }}>
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    pb: 3
                  }}
                >
                  <Avatar
                    sx={{
                      bgcolor: '#ccfbf1',
                      color: '#2dd4bf',
                      width: '2rem',
                      height: '2rem',
                      mr: 1
                    }}
                  >
                    <ManageIcon sx={{ fontSize: '1rem' }} />
                  </Avatar>
                  <Typography variant="h2" fontSize="1.25rem">
                    ניהול
                  </Typography>
                </Box>
                <Grid container>
                  <Grid xs={4}>
                    <ExportAction event={event} path="/rubrics/core-values" sx={{ m: 1 }}>
                      ייצוא מחווני ערכי הליבה
                    </ExportAction>
                  </Grid>

                  <Grid xs={4}>
                    <ExportAction event={event} path="/rubrics/innovation-project" sx={{ m: 1 }}>
                      ייצוא מחווני פרויקט חדשנות
                    </ExportAction>
                  </Grid>
                  <Grid xs={4}>
                    <ExportAction event={event} path="/rubrics/robot-design" sx={{ m: 1 }}>
                      ייצוא מחווני תכנון הרובוט
                    </ExportAction>
                  </Grid>
                  <Grid xs={4}>
                    <ExportAction event={event} path="/scores" sx={{ m: 1 }}>
                      ייצוא תוצאות זירה
                    </ExportAction>
                  </Grid>
                </Grid>
              </Paper>
              <Formik
                initialValues={awards.map(a => {
                  if (!a.winner) a.winner = '';
                  return a;
                })}
                onSubmit={(values, actions) => {
                  apiFetch(`/api/events/${event._id}/awards/winners`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(values)
                  })
                    .then(res => {
                      if (res.ok) {
                        enqueueSnackbar('זוכי הפרסים נשמרו בהצלחה!', { variant: 'success' });
                      } else {
                        enqueueSnackbar('אופס, לא הצלחנו לשמור את זוכי הפרסים.', {
                          variant: 'error'
                        });
                      }
                    })
                    .then(() => actions.setSubmitting(false));
                }}
              >
                {({ submitForm, isSubmitting }) => (
                  <Form>
                    <Stack spacing={2}>
                      {awards.map((a, index) => (
                        <AwardWinnerSelector
                          key={a._id.toString()}
                          award={a}
                          awardIndex={index}
                          teams={teams.filter(t => t.registered)}
                        />
                      ))}
                    </Stack>
                    {awards.length > 0 && (
                      <Box display="flex" flexDirection="row" justifyContent="center" mt={2}>
                        <LoadingButton
                          startIcon={<SaveOutlinedIcon />}
                          sx={{ minWidth: 250 }}
                          variant="contained"
                          onClick={submitForm}
                          loading={isSubmitting}
                        >
                          <span>שמירה</span>
                        </LoadingButton>
                      </Box>
                    )}
                  </Form>
                )}
              </Formik>
            </TabPanel>
            <TabPanel value="3">
              <Grid container spacing={2}>
                {cvForms.map(form => (
                  <Grid xs={6} key={form._id.toString()}>
                    <Card>
                      <CardHeader
                        avatar={
                          <Avatar
                            alt="חומרת הטופס"
                            src={`https://emojicdn.elk.sh/${
                              cvFormSchema.categories.find(c => c.id === form.severity)?.emoji
                            }`}
                          />
                        }
                        action={
                          <IconButton
                            onClick={() => router.push(`/event/${event._id}/cv-forms/${form._id}`)}
                          >
                            <OpenInFullIcon />
                          </IconButton>
                        }
                        title={`דיווח על ${form.demonstrators
                          .map(d =>
                            d === 'team'
                              ? `קבוצה #${form.demonstratorAffiliation}`
                              : localizedFormSubject[d]
                          )
                          .join(', ')}`}
                        subheader={`נצפה על ידי ${form.observers
                          .map(o =>
                            o === 'team'
                              ? `קבוצה #${form.observerAffiliation}`
                              : localizedFormSubject[o]
                          )
                          .join(', ')}`}
                      />
                      <CardContent>
                        <Typography fontSize="0.875rem">
                          הוגש על ידי {form.completedBy.name} ({form.completedBy.affiliation}) טל.{' '}
                          {form.completedBy.phone}
                        </Typography>
                        <Typography fontSize="0.875rem" color="text.secondary">
                          {form.details}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </TabPanel>
          </TabContext>
        </>
      </Layout>
    </RoleAuthorizer>
  );
};

export const getServerSideProps: GetServerSideProps = async ctx => {
  try {
    const user = await apiFetch(`/api/me`, undefined, ctx).then(res => res?.json());

    const data = await serverSideGetRequests(
      {
        event: `/api/events/${user.eventId}`,
        eventState: `/api/events/${user.eventId}/state`,
        teams: `/api/events/${user.eventId}/teams`,
        rooms: `/api/events/${user.eventId}/rooms`,
        sessions: `/api/events/${user.eventId}/sessions`,
        rubrics: `/api/events/${user.eventId}/rubrics`,
        awards: `/api/events/${user.eventId}/awards`,
        cvForms: `/api/events/${user.eventId}/cv-forms`
      },
      ctx
    );

    return { props: { user, ...data } };
  } catch (err) {
    return { redirect: { destination: '/login', permanent: false } };
  }
};

export default Page;
