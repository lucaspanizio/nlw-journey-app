import { useMutation, useQuery } from '@tanstack/react-query';
import { api } from '../api';

type TripDetails = {
  id: string;
  destination: string;
  start_at: string;
  ends_at: string;
  is_confirmed: boolean;
};

const getById = (id: string) =>
  useQuery({
    queryKey: ['get_trip_by_id', id],
    queryFn: async () =>
      await api.get<TripDetails>(`/trips/${id}`).then(({ data }) => data),
  });

type TripCreate = Omit<TripDetails, 'id' | 'is_confirmed'> & {
  emails_to_invite: string;
  owner_name?: string;
  owner_email?: string;
};

const create = (body: TripCreate) =>
  useMutation({
    mutationFn: async () =>
      await api
        .post<{ tripId: string }>(`/trips`, {
          ...body,
          owner_name: 'José Lucas Panizio',
          owner_email: 'lucaspanizio@gmail.com',
        })
        .then(({ data }) => data),
  });

export const tripServer = { getById, create };
