import { api } from '../api';

export type TripData = {
  id: string;
  destination: string;
  starts_at: string;
  ends_at: string;
  is_confirmed: boolean;
};

const getById = async (tripId: string) => {
  return await api
    .get<{ trip: TripData }>(`/trips/${tripId}`)
    .then(({ data }) => data);
};

export type CreateTrip = Omit<TripData, 'id' | 'is_confirmed'> & {
  emails_to_invite: string[];
  owner_name?: string;
  owner_email?: string;
};

const create = async (body: CreateTrip) => {
  return api
    .post<{ tripId: string }>(`/trips`, {
      ...body,
      owner_name: 'Diego',
      owner_email: 'diego@email.com',
    })
    .then(({ data }) => data);
};

export type UpdateTrip = Omit<TripData, 'is_confirmed'>;

const update = async ({ id, destination, starts_at, ends_at }: UpdateTrip) => {
  return api
    .put<{ tripId: string }>(`/trips/${id}`, {
      destination,
      starts_at,
      ends_at,
    })
    .then(({ data }) => data);
};

export const tripServer = { getById, create, update };
