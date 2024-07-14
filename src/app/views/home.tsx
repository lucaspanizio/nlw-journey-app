import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { View, Text, Image, Keyboard, Alert, ScrollView } from 'react-native';
import { DateData } from 'react-native-calendars';
import {
  MapPinIcon,
  Settings2Icon,
  CalendarXIcon,
  UserRoundIcon,
  ArrowRightIcon,
  AtSignIcon,
} from 'lucide-react-native';
import { colors } from '@/styles/colors';
import { calendarUtils, DatesSelected } from '@/utils/calendarUtils';
import { Input } from '@/components/input';
import { Button } from '@/components/button';
import { Modal } from '@/components/modal';
import { Calendar } from '@/components/calendar';
import { parseJSON } from '@/utils/parseJSON';
import { EModal, StepForm, THomeForm } from './settings';
import { GuestEmail } from '@/components/email';
import { validateInput } from '@/utils/validateInput';
import dayjs from 'dayjs';

export default function Home() {
  const form = useForm<THomeForm>();
  const { when, where, newGuest, guests } = form.watch();

  const [stepForm, setStepForm] = useState(StepForm.TRIP_DETAILS);
  const [showModal, setShowModal] = useState(EModal.NONE);

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
  }

  function handlePreviousStepForm() {
    return setStepForm(StepForm.TRIP_DETAILS);
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

        <Input>
          <CalendarXIcon color={colors.zinc[400]} size={20} />
          <Input.Field
            name="when"
            formRef={form}
            placeholder="Quando ?"
            value={parseJSON(when).formatDatesInText}
            editable={stepForm === StepForm.TRIP_DETAILS}
            showSoftInputOnFocus={false}
            onFocus={() => Keyboard.dismiss()}
            onPressIn={() =>
              stepForm === StepForm.TRIP_DETAILS &&
              setShowModal(EModal.CALENDAR)
            }
          />
        </Input>

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

        <Button onPress={handleNextStepForm}>
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
          <Button onPress={() => setShowModal(EModal.NONE)}>
            <Button.Title>Confirmar</Button.Title>
          </Button>
        </View>
      </Modal>

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
