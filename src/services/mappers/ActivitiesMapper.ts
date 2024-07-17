import dayjs from 'dayjs';
import { Activities } from '../api/activities';

export type ActivitiesDomain = {
  title: {
    dayNumber: number;
    dayName: string;
  };
  data: {
    id: string;
    title: string;
    hour: string;
    isBefore: boolean;
  }[];
}[];

class ActivitiesMapper {
  toDomain(data: Activities): ActivitiesDomain {
    return data.activities.map((dayActivity) => ({
      title: {
        dayNumber: dayjs(dayActivity.date).date(),
        dayName: dayjs(dayActivity.date).format('dddd').replace('-feira', ''),
      },
      data: dayActivity.activities.map((activity) => ({
        id: activity.id,
        title: activity.title,
        hour: dayjs(activity.occurs_at).format('hh[:]mm[h]'),
        isBefore: dayjs(activity.occurs_at).isBefore(dayjs()),
      })),
    }));
  }
}

export default new ActivitiesMapper();
