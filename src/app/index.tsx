import { useMutation } from '@tanstack/react-query';
import { parseJSON } from '@/utils/parseJSON';
import { tripStorage } from '@/storage/trip';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { tripServer } from '@/services/api/trip';
import { router } from 'expo-router';
import { Alert, Keyboard, ScrollView, Image, Text, View } from 'react-native';
import { Button } from '@/components/button';
import { Modal } from '@/components/modal';
import { validateInput } from '@/utils/validateInput';
import { Loading } from '@/components/loading';
import { colors } from '@/styles/colors';
import {
  ArrowRightIcon,
  AtSignIcon,
  MapPinIcon,
  Settings2Icon,
  UserRoundIcon,
} from 'lucide-react-native';
import { Input } from '@/components/inputs/text';
import { GuestEmail } from '@/components/email';
import { CreateTripForm } from '@/types/trip';
import TripMapper from '@/services/mappers/CreateTripMapper';
import { DateInput } from '@/components/inputs/date';

enum StepForm {
  TRIP_DETAILS = 1,
  ADD_EMAIL = 2,
}

enum EModal {
  NONE = 0,
  GUESTS = 1,
}

export default function App() {
  const form = useForm<CreateTripForm>();
  const { when, where, newGuest, guests } = form.watch();

  const [isGettingTrip, setIsGettingTrip] = useState(false);
  const [stepForm, setStepForm] = useState(StepForm.TRIP_DETAILS);
  const [showModal, setShowModal] = useState(EModal.NONE);

  const { mutate, isPending: loadingCreateTrip } = useMutation({
    mutationFn: tripServer.create,
  });

  useEffect(() => {
    setIsGettingTrip(true);

    async function getTrip() {
      return await tripStorage.get();
    }

    getTrip()
      .then((id) => {
        router.navigate(`/trip/${id}`);
      })
      .catch((error) => {
        console.error('Error fetching trip ID:', error);
      })
      .finally(() => {
        setIsGettingTrip(false);
      });
  }, []);

  function handleNextStepForm() {
    const { startsAt = null, endsAt = null } = parseJSON(when);

    // TODO: Transformar em schema e apresentar erros abaixo do input
    if (!where) {
      return Alert.alert(
        'Destino da viagem',
        'Preencha o destino da viagem para prosseguir!',
      );
    }

    if (where && where.length < 4) {
      return Alert.alert(
        'Destino da viagem',
        'O destino ter pelo menos 4 caracteres!',
      );
    }

    if (!startsAt || !endsAt) {
      return Alert.alert(
        'Datas da viagem',
        'Preencha as datas da viagem para prosseguir!',
      );
    }

    if (stepForm === StepForm.TRIP_DETAILS) {
      return setStepForm(StepForm.ADD_EMAIL);
    }

    if (stepForm === StepForm.ADD_EMAIL) createTrip();
  }

  function handlePreviousStepForm() {
    return setStepForm(StepForm.TRIP_DETAILS);
  }

  function handleAddGuest() {
    if (!validateInput.email(newGuest)) {
      return Alert.alert('Convidado', 'E-mail inválido!');
    }

    const emailAlreadyExists = guests?.find(
      (email) => email === newGuest.toLowerCase(),
    );

    if (emailAlreadyExists) {
      return Alert.alert('Convidado', 'Este e-mail já foi adicionado!');
    }

    const updatedGuests = [...(guests || []), newGuest.toLowerCase()];
    form.setValue('guests', updatedGuests);
    form.setValue('newGuest', '');
  }

  function handleRemoveGuest(emailToRemove: string) {
    const updatedGuests = guests.filter((email) => email !== emailToRemove);
    form.setValue('guests', updatedGuests);
  }

  function createTrip() {
    const body = TripMapper.toPersistence(form.getValues());

    mutate(body, {
      onSuccess: ({ tripId }) => {
        tripStorage.save(tripId);
        router.navigate(`/trip/${tripId}`);
      },
      onError: (error) => {
        // TODO: add toast
        console.error('error', error);
      },
    });
  }

  if (isGettingTrip) return <Loading />;

  return (
    <View className="flex-1 justify-center items-center px-5">
      <Image
        source={require('@/assets/logo.png')}
        className="h-8"
        resizeMode="contain"
      />

      <Image source={require('@/assets/bg.png')} className="absolute" />

      <Text className="text-zinc-400 font-regular text-center text-lg mt-3">
        Convide seus amigos e agende sua{'\n'}próxima viagem
      </Text>

      <View className="w-full bg-zinc-900 px-4 pt-2 pb-6 rounded-lg m-8 border border-zinc-800">
        <Input>
          <MapPinIcon color={colors.zinc[400]} size={20} />
          <Input.Field
            name="where"
            formRef={form}
            placeholder="Onde ?"
            editable={stepForm === StepForm.TRIP_DETAILS}
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

        {stepForm === StepForm.ADD_EMAIL && (
          <>
            <View className="border-b pb-5 border-zinc-800">
              <Button variant="secondary" onPress={handlePreviousStepForm}>
                <Button.Title>Alterar local/data</Button.Title>
                <Settings2Icon color={colors.zinc[200]} size={20} />
              </Button>
            </View>

            <Input>
              <UserRoundIcon color={colors.zinc[400]} size={20} />
              <Input.Field
                value={
                  guests?.length > 0
                    ? `${Number(guests?.length)} pessoa(s) convidada(s)`
                    : ''
                }
                formRef={form}
                name="guests"
                placeholder="Com quem ?"
                autoCorrect={false}
                showSoftInputOnFocus={false}
                onPressIn={() => {
                  Keyboard.dismiss();
                  setShowModal(EModal.GUESTS);
                }}
              />
            </Input>
          </>
        )}

        <Button onPress={handleNextStepForm} isLoading={loadingCreateTrip}>
          <Button.Title>
            {stepForm === StepForm.TRIP_DETAILS
              ? 'Continuar'
              : 'Confirmar viagem'}
          </Button.Title>
          <ArrowRightIcon color={colors.zinc[950]} size={20} />
        </Button>
      </View>

      <Text className="text-zinc-500 font-regular text-center text-base">
        Ao planejar sua viagem com a plann.er, você automaticamente concorda com
        nossos{' '}
        <Text className="text-zinc-300 underline">
          termos de uso e políticas de privacidade
        </Text>
        .
      </Text>

      <Modal
        title="Selecionar convidados"
        subtitle="Os convidados irão receber e-mails para confirmar a participação na viagem."
        visible={showModal === EModal.GUESTS}
        onClose={() => setShowModal(EModal.NONE)}
      >
        <ScrollView keyboardShouldPersistTaps="handled" className="flex-1">
          <View className="py-2 pb-5 gap-2 flex-wrap border-b border-zinc-800 items-start">
            {guests?.length > 0 &&
              guests.map((email) => (
                <GuestEmail
                  key={email}
                  email={email}
                  onRemove={() => handleRemoveGuest(email)}
                />
              ))}
          </View>

          <View className="gap-4 mt-5">
            <Input variant="secondary">
              <AtSignIcon color={colors.zinc[400]} size={20} />
              <Input.Field
                formRef={form}
                name="newGuest"
                placeholder="Digite o e-mail do convidado"
                keyboardType="email-address"
                value={newGuest}
                returnKeyType="send"
                onSubmitEditing={handleAddGuest}
              />
            </Input>

            <Button onPress={handleAddGuest} accessibilityLabel="Convidar">
              <Button.Title>Convidar</Button.Title>
            </Button>
          </View>
        </ScrollView>
      </Modal>
    </View>
  );
}
