export enum StepForm {
  TRIP_DETAILS = 1,
  ADD_EMAIL = 2,
}

export enum EModal {
  NONE = 0,
  CALENDAR = 1,
  GUESTS = 2,
}

export type THomeForm = {
  when: string;
  where: string;
  guests: string[];
  newGuest: string;
};
