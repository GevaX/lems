import { useEffect, useState } from 'react';
import { WithId } from 'mongodb';
import dayjs from 'dayjs';
import { Button, Stack } from '@mui/material';
import { LocalizationProvider, TimePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { heIL } from '@mui/x-date-pickers/locales';
import {
  Division,
  FllEvent,
  JudgingRoom,
  RobotGameTable,
  ScheduleGenerationSettings,
  Team
} from '@lems/types';
import { apiFetch } from '../../../lib/utils/fetch';
import Calendar from './calendar/calendar';
import { enqueueSnackbar } from 'notistack';

interface TimingStepProps {
  event: WithId<FllEvent>;
  division: WithId<Division>;
  settings: ScheduleGenerationSettings;
  updateSettings: (settings: ScheduleGenerationSettings) => void;
  advanceStep: () => void;
  goBack: () => void;
}

const TimingStep: React.FC<TimingStepProps> = ({
  event,
  division,
  settings,
  updateSettings,
  advanceStep,
  goBack
}) => {
  const [teams, setTeams] = useState<Array<WithId<Team>> | null>(null);
  const [rooms, setRooms] = useState<Array<WithId<JudgingRoom>> | null>(null);
  const [tables, setTables] = useState<Array<WithId<RobotGameTable>> | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isValidating, setisValidating] = useState<boolean>(false);
  const [validationStatus, setValidationStatus] = useState<null | 'valid' | 'invalid'>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  const fetchTeams = async () => {
    const response = await apiFetch(`/api/divisions/${division._id}/teams`);
    const data = await response.json();
    setTeams(data);
  };

  const fetchRooms = async () => {
    const response = await apiFetch(`/api/divisions/${division._id}/rooms`);
    const data = await response.json();
    setRooms(data);
  };

  const fetchTables = async () => {
    const response = await apiFetch(`/api/divisions/${division._id}/tables`);
    const data = await response.json();
    setTables(data);
  };

  const sendValidate = async () => {
    return apiFetch(`/api/admin/divisions/${division._id}/schedule/validate`, {
      method: 'POST',
      body: JSON.stringify(settings),
      headers: { 'Content-Type': 'application/json' }
    }).then(res => {
      if (res.ok) {
        setValidationStatus('valid');
        setValidationError(null);
        return true;
      } else {
        setValidationStatus('invalid');
        res.json().then(data => {
          setValidationError(data.error)
          enqueueSnackbar(data.error, {
            variant: 'error'
          });
          return false;
        });
      }
    });
  };

  useEffect(() => {
    fetchTeams();
    fetchRooms();
    fetchTables();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setValidationStatus(null)
    setValidationError(null)
  }, [settings])

  const canAdvanceStep = settings.matchesStart && settings.judgingStart;

  if (!teams || !rooms || !tables) {
    return null; // or loading indicator
  }

  return (
    <LocalizationProvider
      dateAdapter={AdapterDayjs}
      localeText={heIL.components.MuiLocalizationProvider.defaultProps.localeText}
    >
      <Stack spacing={4}>
        <Stack spacing={2} direction="row">
          <TimePicker
            label="תחילת שיפוט"
            value={settings.judgingStart ? dayjs(settings.judgingStart) : null}
            sx={{ minWidth: 150 }}
            onChange={newTime => {
              if (newTime)
                updateSettings({ ...settings, judgingStart: newTime.set('seconds', 0).toDate() });
            }}
            ampm={false}
            format="HH:mm"
            views={['hours', 'minutes']}
          />
          <TimePicker
            label="תחילת מקצים"
            value={settings.matchesStart ? dayjs(settings.matchesStart) : null}
            sx={{ minWidth: 150 }}
            onChange={newTime => {
              if (newTime)
                updateSettings({ ...settings, matchesStart: newTime.set('seconds', 0).toDate() });
            }}
            ampm={false}
            format="HH:mm"
            views={['hours', 'minutes']}
          />
        </Stack>

        {settings.matchesStart && settings.judgingStart && (
          <Calendar
            date={event.startDate}
            settings={settings}
            updateSettings={updateSettings}
            teams={teams}
            rooms={rooms}
            tables={tables}
          />
        )}
        {validationStatus === 'valid' && (
          <Stack alignItems="center">
            <span style={{ color: 'green' }}>✅ הלו"ז תקין</span>
          </Stack>
        )}

        {validationStatus === 'invalid' && validationError && (
          <Stack alignItems="center">
            <span style={{ color: 'red' }} >❌הלו"ז לא תקין, שגיאה:</span>
            <span>{validationError}</span>
          </Stack>
        )}
        <Stack spacing={2} direction="row" alignItems="center" justifyContent="center" px={2}>
          <Button variant="contained" onClick={goBack}>
            הקודם
          </Button>
          <Button
            loading={isLoading}
            variant="contained"
            onClick={async () => {
              setIsLoading(true);
              const isValid = await sendValidate();
              if (isValid) {
                await advanceStep();
              }
              setIsLoading(false);
            }}
            disabled={!canAdvanceStep || isValidating || validationStatus == 'invalid'}
          >
            הבא
          </Button>
          <Button
            loading={isValidating}
            variant="contained"
            onClick={async () => {
              setisValidating(true);
              const isValid = await sendValidate();
              if (isValid) {
                enqueueSnackbar('לו"ז אומת בהצלחה', { variant: 'success' });
              }
              setisValidating(false);
            }}
            disabled={!canAdvanceStep}
          >
            אימות
          </Button>
        </Stack>
      </Stack>
    </LocalizationProvider>
  );
};

export default TimingStep;
