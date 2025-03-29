import {
  PortalActivity,
  PortalAward,
  PortalEvent,
  PortalEventStatus,
  PortalSchedule,
  PortalScore,
  PortalTeam
} from '@lems/types';

class AuthorizationError extends Error {
  id: string;

  constructor(id: string) {
    super();
    this.id = id;

    Object.setPrototypeOf(this, AuthorizationError.prototype);
  }
}

const getApiBase = (forceClient = false) => {
  const isSsr = !forceClient && typeof window === 'undefined';
  const url = isSsr ? process.env.LOCAL_BASE_URL : process.env.NEXT_PUBLIC_BASE_URL;
  return url + '/public/portal';
};

export const apiFetch = async <T>(path: string, init?: RequestInit | undefined) => {
  const headers = { ...init?.headers };
  const response = await fetch(getApiBase() + path, {
    headers,
    ...init
  });

  if (!response.ok) {
    if (response.status === 403) {
      throw new AuthorizationError('Unauthorized');
    }

    throw new Error(`Failed to fetch ${path}`);
  }

  const data = await response.json();
  return data as T;
};

export const fetchEvents = async (): Promise<PortalEvent[]> => {
  const events: PortalEvent[] = await apiFetch('/events');
  return events;
};

export const fetchEvent = async (id: string) => {
  const event: PortalEvent = await apiFetch(`/events/${id}`);
  const teams: PortalTeam[] = await apiFetch(`/events/${id}/teams`);
  return { event, teams };
};

export const fetchAllTeams = async ():Promise<PortalTeam[]> => {
  const teams: PortalTeam[] = await apiFetch(`/teams`);
  return teams;
}

export const fetchGlobalTeam = async (teamNumber: string) => {
  const team = await apiFetch<PortalTeam>(`/teams/${teamNumber}`);

  const awards: { award: PortalAward; event: PortalEvent }[] = [];
  const events: PortalEvent[] = await fetchTeamEvents(team);
  
  for (const event of events) {
    try {
      const eventAwards = await apiFetch<PortalAward[] | null>(
        `/events/${event.routing}/teams/${teamNumber}/awards`
      );
      console.log(eventAwards);
      if (eventAwards) {
        for (const award of eventAwards) {
          awards.push({ award, event });
        }
      }
    } catch {
      // Event not yet completed
    }
  }

  return { team, awards, events };
};

export const fetchTeamEvents = async (team: PortalTeam) => {
  const allEvents: PortalEvent[] = await apiFetch('/events');
  const teamEvents: PortalEvent[] = [];

  for (const event of allEvents) {
    const teams: PortalTeam[] = await apiFetch(`/events/${event.routing}/teams`);
    if (teams.some(t => t.number === team.number)) {
      teamEvents.push(event);
    }
  }

  return teamEvents;
};

export const fetchEventStatus = async (id: string) => {
  const status = await apiFetch<PortalEventStatus>(`/events/${id}/status`);
  return status;
};

export const fetchAwards = async (id: string) => {
  let awards: PortalAward[] | null = null;

  try {
    awards = await apiFetch(`/events/${id}/awards`);
  } catch {
    // Event not yet completed
  }

  return awards;
};

export const fetchTeam = async (eventId: string, teamNumber: string) => {
  const team = await apiFetch<PortalTeam>(`/events/${eventId}/teams/${teamNumber}`);

  let awards: PortalAward[] | null = null;
  try {
    awards = await apiFetch<PortalAward[] | null>(`/events/${eventId}/teams/${teamNumber}/awards`);
  } catch {
    // Event not yet completed
  }

  const schedule = await apiFetch<PortalActivity<'general' | 'match' | 'session'>[]>(
    `/events/${eventId}/teams/${teamNumber}/schedule`
  );

  const scores = await apiFetch<PortalScore[]>(`/events/${eventId}/teams/${teamNumber}/scores`);

  return { team, awards, schedule, scores };
};

export const fetchScoreboard = async (eventId: string) => {
  const scoreboard = await apiFetch<PortalScore[]>(`/events/${eventId}/scoreboard`);
  const { field } = await apiFetch<PortalEventStatus>(`/events/${eventId}/status`);
  return { scoreboard, stage: field.stage };
};

export const fetchGeneralSchedule = async (eventId: string) => {
  const schedule = await apiFetch<PortalSchedule>(`/events/${eventId}/schedule`);
  return schedule;
};
