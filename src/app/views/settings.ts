export enum StepForm {
  TRIP_DETAILS = 1,
  ADD_EMAIL = 2,
}

export enum EModal {
  NONE = 0,
  CALENDAR = 1,
}

export type THomeForm = {
  who: string;
  when: string;
  where: string;
};
