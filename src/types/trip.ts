export type CreateTripForm = {
  when: string;
  where: string;
  guests: string[];
  newGuest: string;
};

export type UpdateTripForm = {
  when: string;
  where: string;
  description: string;
};
