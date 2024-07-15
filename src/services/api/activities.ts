import { api } from '../api';

type Activity = {
  id: string;
  occurs_at: string;
  title: string;
};

type ActivityCreate = Omit<Activity, 'id'> & {
  tripId: string;
};

const create = async ({ tripId, occurs_at, title }: ActivityCreate) => {
  return await api
    .post<{ activityId: string }>(`/trips/${tripId}/activities`, {
      occurs_at,
      title,
    })
    .then(({ data }) => data);
};

type Activities = {
  activities: {
    date: string;
    activities: Activity[];
  }[];
};

const getActivities = async (tripId: string) => {
  return await api
    .get<Activities>(`/trips/${tripId}/activities`)
    .then(({ data }) => data);
};

export const activitiesServer = { create, getActivities };
