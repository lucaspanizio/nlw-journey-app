import { api } from '../api';

export type Participant = {
  id: string;
  name: string;
  email: string;
  is_confirmed: boolean;
};

const getByTripId = async (tripId: string) => {
  return await api
    .get<{ participants: Participant[] }>(`/trips/${tripId}/participants`)
    .then(({ data }) => data);
};

type ConfirmParticipation = {
  participantId: string;
  name: string;
  email: string;
};

const confirmParticipation = async ({
  participantId,
  name,
  email,
}: ConfirmParticipation) => {
  return await api
    .patch(`/participants/${participantId}/confirm`, { name, email })
    .then(({ data }) => data);
};
export const participantsServer = { getByTripId, confirmParticipation };
