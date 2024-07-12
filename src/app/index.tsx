import { useState } from 'react';
import { View, Text, Image, Keyboard } from 'react-native';
import { DateData } from 'react-native-calendars';
import {
  MapPinIcon,
  Settings2Icon,
  CalendarXIcon,
  UserRoundIcon,
  ArrowRightIcon,
} from 'lucide-react-native';
import { colors } from '@/styles/colors';
import { calendarUtils, DatesSelected } from '@/utils/calendarUtils';
import { Input } from '@/components/input';
import { Button } from '@/components/button';
import { Modal } from '@/components/modal';
import { Calendar } from '@/components/calendar';
import dayjs from 'dayjs';

enum StepForm {
  TRIP_DETAILS = 1,
  ADD_EMAIL = 2,
}

enum EModal {
  NONE = 0,
  CALENDAR = 1,
}

export default function App() {
  const [stepForm, setStepForm] = useState(StepForm.TRIP_DETAILS);
  const [showModal, setShowModal] = useState(EModal.NONE);
  const [selectedDates, setSelectedDates] = useState({} as DatesSelected);

  function handleNextStepForm() {
    if (stepForm === StepForm.TRIP_DETAILS) {
      return setStepForm(StepForm.ADD_EMAIL);
    }
  }

  function handlePreviousStepForm() {
    return setStepForm(StepForm.TRIP_DETAILS);
  }

  function handleSelectDate(selectedDay: DateData) {
    const dates = calendarUtils.orderStartsAtAndEndsAt({
      startsAt: selectedDates.startsAt,
      endsAt: selectedDates.endsAt,
      selectedDay,
    });

    setSelectedDates(dates);
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
            placeholder="Onde ?"
            editable={stepForm === StepForm.TRIP_DETAILS}
          />
        </Input>

        <Input>
          <CalendarXIcon color={colors.zinc[400]} size={20} />
          <Input.Field
            placeholder="Quando ?"
            value={selectedDates.formatDatesInText}
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
              <Input.Field placeholder="Com quem ?" />
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
            markedDates={selectedDates.dates}
          />
          <Button onPress={() => setShowModal(EModal.NONE)}>
            <Button.Title>Confirmar</Button.Title>
          </Button>
        </View>
      </Modal>
    </View>
  );
}
