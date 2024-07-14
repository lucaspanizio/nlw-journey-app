import { useQuery } from '@tanstack/react-query';
import { api } from '../api';

type TripDetails = {
  id: string;
  destination: string;
  starts_at: string;
  ends_at: string;
  is_confirmed: boolean;
};

const getById = (id: string) =>
  useQuery({
    queryKey: ['get_trip_by_id', id],
    queryFn: async () =>
      await api.get<TripDetails>(`/trips/${id}`).then(({ data }) => data),
  });

export type TripCreate = Omit<TripDetails, 'id' | 'is_confirmed'> & {
  emails_to_invite: string[];
  owner_name?: string;
  owner_email?: string;
};

const create = async (body: TripCreate) => {
  return api
    .post<{ tripId: string }>(`/trips`, {
      ...body,
      owner_name: 'Diego',
      owner_email: 'diego@email.com',
    })
    .then(({ data }) => data);
};

export const tripServer = { getById, create };
