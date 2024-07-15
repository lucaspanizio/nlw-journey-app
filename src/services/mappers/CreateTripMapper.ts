import { parseJSON } from '@/utils/parseJSON';
import { CreateTrip, TripData } from '../api/trip';
import { calendarUtils, DatesSelected } from '@/utils/calendarUtils';
import { CreateTripForm } from '@/types/trip';
import dayjs from 'dayjs';

export type TripDomain = TripData & {
  description: string;
};

class CreateTripMapper {
  toPersistence(dataForm: CreateTripForm): CreateTrip {
    const { startsAt, endsAt } = parseJSON(dataForm.when) as DatesSelected;

    return {
      destination: dataForm.where,
      emails_to_invite: dataForm.guests,
      starts_at: dayjs(startsAt?.dateString).toISOString(),
      ends_at: dayjs(endsAt?.dateString).toISOString(),
    };
  }
}

export default new CreateTripMapper();
