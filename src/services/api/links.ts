import { api } from '../api';

export type Link = {
  id: string;
  title: string;
  url: string;
};

const getLinksByTripId = async (tripId: string) => {
  return await api
    .get<{ links: Link[] }>(`/trips/${tripId}/links`)
    .then((links) => links);
};

type CreateLink = Omit<Link, 'id'> & {
  tripId: string;
};

const create = async ({ tripId, title, url }: CreateLink) => {
  return await api
    .post<{ linkId: string }>(`/trips/${tripId}/links`, { title, url })
    .then(({ data }) => data);
};

export const linksServer = { getLinksByTripId, create };
