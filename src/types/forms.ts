import { z } from 'zod';
import { schema } from './schemas';

export type CreateTripForm = {
  when: string;
  where: string;
  guests: string[];
  newGuest: string;
};

export type ConfirmParticipationForm = z.infer<
  typeof schema.confirmParticipation
>;

export type UpdateTripForm = z.infer<typeof schema.updateTrip>;

export type ActivityForm = z.infer<typeof schema.createActivity>;

export type DetailsForm = z.infer<typeof schema.createLink>;
