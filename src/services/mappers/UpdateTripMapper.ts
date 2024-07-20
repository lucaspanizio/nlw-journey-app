import { parseJSON } from '@/utils/parseJSON';
import { UpdateTrip, TripData } from '../api/trip';
import { DatesSelected } from '@/utils/calendarUtils';
import { UpdateTripForm } from '@/types/forms';
import { dateRangeWithShortMonth } from '@/utils/formatDate';
import dayjs from 'dayjs';

export type TripDomain = TripData & {
  dates: string;
  description: string;
};

class UpdateTripMapper {
  toPersistence(dataForm: UpdateTripForm, tripId: string): UpdateTrip {
    const { startsAt, endsAt } = parseJSON(dataForm.when) as DatesSelected;

    return {
      id: tripId,
      destination: dataForm.where,
      starts_at: dayjs(startsAt?.dateString).toISOString(),
      ends_at: dayjs(endsAt?.dateString).toISOString(),
    };
  }

  toDomain(data: TripData): TripDomain {
    const maxLengthDescription = 30;
    const { destination, starts_at, ends_at } = data;

    const truncatedDestination =
      destination.length > maxLengthDescription
        ? `${destination.slice(0, maxLengthDescription)}...`
        : destination;

    const formattedDates = dateRangeWithShortMonth(starts_at, ends_at);

    return {
      ...data,
      dates: formattedDates,
      description: `${truncatedDestination} de ${formattedDates}.`,
    };
  }
}

export default new UpdateTripMapper();
