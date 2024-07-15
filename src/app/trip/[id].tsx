import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Alert, Keyboard, View, TouchableOpacity } from 'react-native';
import { DateData } from 'react-native-calendars';
import { router, useLocalSearchParams } from 'expo-router';
import {
  CalendarRangeIcon,
  CalendarXIcon,
  InfoIcon,
  MapPinIcon,
  Settings2Icon,
} from 'lucide-react-native';
import { useMutation, useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { Loading } from '@/components/loading';
import { Input } from '@/components/input';
import { colors } from '@/styles/colors';
import { Button } from '@/components/button';
import { Modal } from '@/components/modal';
import { Calendar } from '@/components/calendar';
import { parseJSON } from '@/utils/parseJSON';
import { calendarUtils, DatesSelected } from '@/utils/calendarUtils';
import UpdateTripMapper from '@/services/mappers/UpdateTripMapper';
import { TripData, tripServer } from '@/services/api/trip';
import { UpdateTripForm } from '@/types/trip';
import { Details } from './details';
import { Activities } from './activities';

enum EModal {
  NONE = 0,
  CALENDAR = 1,
  UPDATE_TRIP = 2,
}

export default function Trip() {
  const form = useForm<UpdateTripForm>();
  const { when, where } = form.watch();
  const tripId = useLocalSearchParams<{ id: string }>().id;

  const [option, setOption] = useState<'activity' | 'details'>('activity');
  const [showModal, setShowModal] = useState(EModal.NONE);

  if (!tripId) return router.back();

  const { mutate, isPending: isUpdatingTrip } = useMutation({
    mutationFn: tripServer.update,
  });

  function handleUpdateTrip() {
    if (!tripId) return;

    // TODO: trabalhar com schemas
    if (!where) {
      return Alert.alert(
        'Destino da viagem',
        'Preencha o novo destino da viagem!',
      );
    }

    if (!when) {
      return Alert.alert(
        'Datas da viagem',
        'Preencha as novas datas da viagem!',
      );
    }

    const body = UpdateTripMapper.toPersistence(form.getValues(), tripId);

    mutate(body, {
      onSuccess: () => {
        refetch();
        setShowModal(EModal.NONE);
        // TODO: substituir por toast
        Alert.alert('Viagem atualizada com sucesso!');
      },
      onError: (error) => {
        console.error(String(error));
      },
    });
  }

  function handleSelectDate(selectedDay: DateData) {
    const { startsAt, endsAt } = parseJSON(when);

    const dates: DatesSelected = calendarUtils.orderStartsAtAndEndsAt({
      startsAt,
      endsAt,
      selectedDay,
    });

    form.setValue('when', JSON.stringify(dates));
  }

  function updateTripData(tripData: TripData) {
    const domainTripData = UpdateTripMapper.toDomain(tripData);
    form.setValue('where', domainTripData.destination);
    return domainTripData;
  }

  const {
    data: tripData,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['get_trip_by_id', tripId],
    queryFn: () =>
      tripServer.getById(tripId).then(({ trip }) => updateTripData(trip)),
    enabled: !!tripId,
  });

  if (!tripData || isLoading) return <Loading />;

  return (
    <View className="flex-1 px-5 pt-16">
      <Input variant="tertiary">
        <MapPinIcon color={colors.zinc[400]} />
        <Input.Field
          name="description"
          value={tripData.description}
          formRef={form}
          readOnly
        />

        <TouchableOpacity
          activeOpacity={0.6}
          className="w-9 h-9 bg-zinc-800 items-center justify-center rounded"
          onPress={() => setShowModal(EModal.UPDATE_TRIP)}
        >
          <Settings2Icon color={colors.zinc[400]} size={20} />
        </TouchableOpacity>
      </Input>

      {option === 'activity' ? <Activities tripData={tripData} /> : <Details />}

      <View className="w-full absolute -bottom-1 self-center justify-end pb-5 z-10 bg-zinc-950">
        <View className="w-full flex-row bg-zinc-900 p-4 rounded-lg border border-zinc-800 gap-2">
          <Button
            className="flex-1"
            onPress={() => setOption('activity')}
            variant={option === 'activity' ? 'primary' : 'secondary'}
          >
            <CalendarRangeIcon
              color={
                option === 'activity' ? colors.lime[950] : colors.zinc[200]
              }
              size={20}
            />
            <Button.Title>Atividades</Button.Title>
          </Button>

          <Button
            className="flex-1"
            onPress={() => setOption('details')}
            variant={option === 'details' ? 'primary' : 'secondary'}
          >
            <InfoIcon
              color={option === 'details' ? colors.lime[950] : colors.zinc[200]}
              size={20}
            />
            <Button.Title>Detalhes</Button.Title>
          </Button>
        </View>
      </View>

      <Modal
        title="Atualizar viagem"
        subtitle="Somente quem criou a viagem pode editar."
        visible={showModal === EModal.UPDATE_TRIP}
        onClose={() => setShowModal(EModal.NONE)}
      >
        <View className="gap-2 my-4">
          <Input variant="secondary">
            <MapPinIcon color={colors.zinc[400]} size={20} />
            <Input.Field
              name="where"
              formRef={form}
              value={where}
              placeholder="Onde ?"
            />
          </Input>

          <Input variant="secondary">
            <CalendarXIcon color={colors.zinc[400]} size={20} />
            <Input.Field
              name="when"
              formRef={form}
              value={parseJSON(when).formatDatesInText}
              placeholder="Quando ?"
              onPressIn={() => setShowModal(EModal.CALENDAR)}
              onFocus={() => Keyboard.dismiss()}
            />
          </Input>

          <Button onPress={handleUpdateTrip} isLoading={isUpdatingTrip}>
            <Button.Title>Atualizar</Button.Title>
          </Button>
        </View>
      </Modal>

      <Modal
        title="Datas da viagem"
        subtitle="Selecione as datas de ida e volta da viagem"
        visible={showModal === EModal.CALENDAR}
        onClose={() => setShowModal(EModal.NONE)}
      >
        <View className="gap-4 mt-4">
          <Calendar
            minDate={dayjs().toISOString()}
            onDayPress={handleSelectDate}
            markedDates={parseJSON(when).dates}
          />
          <Button onPress={() => setShowModal(EModal.UPDATE_TRIP)}>
            <Button.Title>Confirmar</Button.Title>
          </Button>
        </View>
      </Modal>
    </View>
  );
}
