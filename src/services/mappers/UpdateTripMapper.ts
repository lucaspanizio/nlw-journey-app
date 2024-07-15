import { parseJSON } from '@/utils/parseJSON';
import { UpdateTrip, TripData } from '../api/trip';
import { calendarUtils, DatesSelected } from '@/utils/calendarUtils';
import { UpdateTripForm } from '@/types/trip';
import dayjs from 'dayjs';

export type TripDomain = TripData & {
  dates: string;
  description: string;
};

class UpdateTripMapper {
  private formatDatesForShortenMonth(formattedDates: string) {
    // Mês com os 3 primeiros caracteres
    const formattedDatesArray = formattedDates.split(' ');
    formattedDatesArray[formattedDatesArray.length - 1] = formattedDatesArray[
      formattedDatesArray.length - 1
    ].slice(0, 3);
    return formattedDatesArray.join(' ');
  }

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

    const formattedDates = calendarUtils.formatDatesInText({
      startsAt: dayjs(starts_at),
      endsAt: dayjs(ends_at),
    });

    return {
      ...data,
      dates: formattedDates,
      description: `${truncatedDestination} de ${this.formatDatesForShortenMonth(
        formattedDates,
      )}.`,
    };
  }
}

export default new UpdateTripMapper();
