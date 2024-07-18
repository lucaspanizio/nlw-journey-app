import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Alert, View, TouchableOpacity } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import {
  CalendarRangeIcon,
  InfoIcon,
  MapPinIcon,
  Settings2Icon,
} from 'lucide-react-native';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import { TripData, tripServer } from '@/services/api/trip';
import { colors } from '@/styles/colors';
import { Loading } from '@/components/loading';
import { Input } from '@/components/inputs/text';
import { Button } from '@/components/button';
import { Modal } from '@/components/modal';
import { DateInput } from '@/components/inputs/date';
import { parseJSON } from '@/utils/parseJSON';
import { schema } from '@/types/schemas';
import { UpdateTripForm } from '@/types/forms';
import UpdateTripMapper from '@/services/mappers/UpdateTripMapper';
import { Details } from './details';
import { Activities } from './activities';

export default function Trip() {
  const form = useForm<UpdateTripForm>({
    defaultValues: { when: '', where: '' },
    resolver: zodResolver(schema.updateTrip),
  });

  const { when, where } = form.watch();
  const tripId = useLocalSearchParams<{ id: string }>().id;

  const [option, setOption] = useState<'activity' | 'details'>('activity');
  const [showModal, setShowModal] = useState(false);

  if (!tripId) return router.back();

  const { mutate, isPending: isUpdatingTrip } = useMutation({
    mutationFn: tripServer.update,
  });

  function handleCloseModal() {
    form.reset();
    setShowModal(false);
  }

  function handleUpdateTrip(formData: UpdateTripForm) {
    if (!tripId) return;

    const body = UpdateTripMapper.toPersistence(formData, tripId);

    mutate(body, {
      onSuccess: () => {
        refetch();
        handleCloseModal();
        // TODO: substituir por toast
        Alert.alert('Viagem atualizada com sucesso!');
      },
      onError: (error) => {
        console.error(String(error));
      },
    });
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
          onPress={() => setShowModal(true)}
        >
          <Settings2Icon color={colors.zinc[400]} size={20} />
        </TouchableOpacity>
      </Input>

      {option === 'activity' ? (
        <Activities tripData={tripData} />
      ) : (
        <Details tripId={tripId} />
      )}

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
        visible={showModal}
        onClose={handleCloseModal}
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

          <DateInput
            name="when"
            formRef={form}
            placeholder="Quando ?"
            value={parseJSON(when).formatDatesInText}
            modalOptions={{
              title: 'Datas da viagem',
              subtitle: 'Selecione as datas de ida e volta da viagem',
            }}
          />

          <Button
            onPress={form.handleSubmit(handleUpdateTrip)}
            isLoading={isUpdatingTrip}
          >
            <Button.Title>Atualizar</Button.Title>
          </Button>
        </View>
      </Modal>
    </View>
  );
}
