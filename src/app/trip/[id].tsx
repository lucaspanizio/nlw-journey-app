import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Alert, Text, View, TouchableOpacity } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import {
  CalendarRangeIcon,
  InfoIcon,
  MailIcon,
  MapPinIcon,
  RefreshCcwIcon,
  Settings2Icon,
  UserIcon,
} from 'lucide-react-native';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import { TripData, tripServer } from '@/services/api/trip';
import UpdateTripMapper from '@/services/mappers/UpdateTripMapper';
import { colors } from '@/styles/colors';
import { Loading } from '@/components/loading';
import { Input } from '@/components/inputs/text';
import { Button } from '@/components/button';
import { Modal } from '@/components/modal';
import { DateInput } from '@/components/inputs/date';
import { parseJSON } from '@/utils/parseJSON';
import { dateRangeWithFullMonth } from '@/utils/formatDate';
import { schema } from '@/types/schemas';
import { ConfirmParticipationForm, UpdateTripForm } from '@/types/forms';
import { Details } from './details';
import { Activities } from './activities';
import { participantsServer } from '@/services/api/participants';
import { tripStorage } from '@/storage/trip';

enum MODAL {
  NONE = 0,
  UPDATE_TRIP = 1,
  CONFIRM_PARTICIPATION = 2,
}

export default function Trip() {
  const { id: tripId, participant } = useLocalSearchParams<{
    id: string;
    participant?: string;
  }>();

  const formTrip = useForm<UpdateTripForm>({
    defaultValues: { when: '', where: '' },
    resolver: zodResolver(schema.updateTrip),
  });

  const formParticipant = useForm<ConfirmParticipationForm>({
    defaultValues: { name: '', email: '' },
    resolver: zodResolver(schema.confirmParticipation),
  });

  const { when, where } = formTrip.watch();

  const [option, setOption] = useState<'activity' | 'details'>('activity');
  const [showModal, setShowModal] = useState(MODAL.NONE);

  if (!tripId) return router.back();

  const {
    data: tripData,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['get_trip_by_id', tripId],
    queryFn: () =>
      tripServer.getById(tripId).then(({ trip }) => {
        const domainTripData = UpdateTripMapper.toDomain(trip);
        formTrip.setValue('where', domainTripData.destination);
        return domainTripData;
      }),
    enabled: !!tripId,
  });

  const { mutate: updateTrip, isPending: isUpdatingTrip } = useMutation({
    mutationFn: tripServer.update,
  });

  const { mutate: confirmParticipation, isPending: isConfirming } = useMutation(
    {
      mutationFn: participantsServer.confirmParticipation,
    },
  );

  function handleCloseModal() {
    formTrip.reset();
    formParticipant.reset();
    setShowModal(MODAL.NONE);
  }

  function handleUpdateTrip(formData: UpdateTripForm) {
    if (!tripId) return;

    const body = UpdateTripMapper.toPersistence(formData, tripId);

    updateTrip(body, {
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

  // NOTE: isso poderia ser feito no logout
  function handleRemoveTrip() {
    try {
      Alert.alert(
        'Remover viagem',
        'Tem certeza que deseja remover a viagem do dispositivo ?',
        [
          {
            text: 'Não',
            style: 'cancel',
          },
          {
            text: 'Sim',
            onPress: async () => {
              await tripStorage.remove();
              router.navigate('/');
            },
          },
        ],
      );
    } catch (error) {
      console.log(error);
    }
  }

  function handleConfirmParticipation(formData: ConfirmParticipationForm) {
    if (!!tripId && !!participant) {
      const body = {
        participantId: participant,
        name: formData.name,
        email: formData.email,
      };

      confirmParticipation(body, {
        onSuccess: async () => {
          refetch();
          await tripStorage.save(tripId);
          handleCloseModal();
          // TODO: substituir por toast
          Alert.alert('Participação confirmada com sucesso!');
        },
        onError: (error) => {
          console.error(String(error));
        },
      });
    }
  }

  useEffect(() => {
    if (!!participant) setShowModal(MODAL.CONFIRM_PARTICIPATION);
  }, []);

  if (!tripData || isLoading) return <Loading />;

  return (
    <View className="flex-1 px-5 pt-16">
      <Input variant="tertiary">
        <MapPinIcon color={colors.zinc[400]} />
        <Input.Field
          name="description"
          value={tripData.description}
          formRef={formTrip}
          readOnly
        />

        <TouchableOpacity
          activeOpacity={0.6}
          className="w-9 h-9 bg-zinc-800 items-center justify-center rounded"
          onPress={() => setShowModal(MODAL.UPDATE_TRIP)}
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
        visible={showModal === MODAL.UPDATE_TRIP}
        onClose={handleCloseModal}
      >
        <View className="gap-2 my-4">
          <Input variant="secondary">
            <MapPinIcon color={colors.zinc[400]} size={20} />
            <Input.Field
              name="where"
              formRef={formTrip}
              value={where}
              placeholder="Onde ?"
            />
          </Input>

          <DateInput
            name="when"
            formRef={formTrip}
            placeholder="Quando ?"
            value={parseJSON(when).formatDatesInText}
            modalOptions={{
              title: 'Datas da viagem',
              subtitle: 'Selecione as datas de ida e volta da viagem',
            }}
          />

          <Button
            onPress={formTrip.handleSubmit(handleUpdateTrip)}
            isLoading={isUpdatingTrip}
          >
            <RefreshCcwIcon color={colors.zinc[800]} size={20} />
            <Button.Title>Atualizar</Button.Title>
          </Button>

          <Button
            variant="secondary"
            className="mt-6"
            onPress={handleRemoveTrip}
          >
            <Button.Title className="text-rose-500 text-center">
              Remover
            </Button.Title>
            <Text></Text>
          </Button>
        </View>
      </Modal>

      <Modal
        title="Confirmar presença"
        visible={showModal === MODAL.CONFIRM_PARTICIPATION}
      >
        <View className="gap-4 mt-4">
          <Text className="text-zinc-400 font-regular leading-6 my-2">
            Você foi convidado(a) para participar de uma viagem para
            <Text className="font-semibold text-zinc-100">
              {' '}
              {tripData.destination}{' '}
            </Text>
            nas datas de{' '}
            <Text className="font-semibold text-zinc-100">
              {dateRangeWithFullMonth(tripData.starts_at, tripData.ends_at)}
            </Text>
            {'\n\n'}
            Para confirmar sua presença, preencha os dados abaixo.
          </Text>

          <Input variant="secondary">
            <UserIcon color={colors.zinc[400]} size={20} />
            <Input.Field
              formRef={formParticipant}
              name="name"
              placeholder="Nome completo"
            />
          </Input>

          <Input variant="secondary">
            <MailIcon color={colors.zinc[400]} size={20} />
            <Input.Field
              formRef={formParticipant}
              name="email"
              placeholder="Seu melhor e-mail"
            />
          </Input>

          <Button
            onPressIn={formParticipant.handleSubmit(handleConfirmParticipation)}
            isLoading={isConfirming}
          >
            <Button.Title>Confirmar presença</Button.Title>
          </Button>
        </View>
      </Modal>
    </View>
  );
}
