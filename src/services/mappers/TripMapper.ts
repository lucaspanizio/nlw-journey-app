import { parseJSON } from '@/utils/parseJSON';
import { THomeForm } from '@/app/views/settings';
import { TripCreate } from '../api/trip';
import { DatesSelected } from '@/utils/calendarUtils';
import dayjs from 'dayjs';

class TripMapper {
  toPersistence(dataForm: THomeForm): TripCreate {
    const { startsAt, endsAt } = parseJSON(dataForm.when) as DatesSelected;

    return {
      destination: dataForm.where,
      emails_to_invite: dataForm.guests,
      starts_at: dayjs(startsAt?.dateString).toISOString(),
      ends_at: dayjs(endsAt?.dateString).toISOString(),
    };
  }

  toDomain() {}
}

export default new TripMapper();
