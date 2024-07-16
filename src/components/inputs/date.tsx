import React, { useState } from 'react';
import { Keyboard, TextInputProps, View } from 'react-native';
import {
  FieldPath,
  FieldValues,
  Path,
  PathValue,
  UseFormReturn,
} from 'react-hook-form';
import { DateData } from 'react-native-calendars';
import { CalendarIcon } from 'lucide-react-native';
import dayjs from 'dayjs';
import { colors } from '@/styles/colors';
import { calendarUtils, DatesSelected } from '@/utils/calendarUtils';
import { parseJSON } from '@/utils/parseJSON';
import { Calendar } from '../calendar';
import { Button } from '../button';
import { Input, Variant } from './text';
import { Modal } from '../modal';

interface DateInputProps<T extends FieldValues = FieldValues>
  extends TextInputProps {
  name: FieldPath<T>;
  formRef: UseFormReturn<T, FieldValues>;
  variant?: Variant;
  className?: string;
  iconColor?: string | keyof typeof colors;
  isSingleDate?: boolean;
  modalOptions?: {
    title: string;
    subtitle: string;
    minDate?: string;
    maxDate?: string;
    onClose?: () => void;
  };
}

export function DateInput<T extends FieldValues>({
  formRef,
  name,
  iconColor,
  className,
  variant = 'secondary',
  isSingleDate = false,
  modalOptions,
  ...props
}: DateInputProps<T>) {
  const data = formRef.watch(name);
  const [showModal, setShowModal] = useState<boolean>(false);

  const {
    title = 'Selecione as datas',
    subtitle = '',
    minDate,
    maxDate,
    onClose,
  } = modalOptions || {};

  const markedDates = isSingleDate
    ? { [data]: { selected: true } }
    : parseJSON(data).dates;

  function handleSelectDate(selectedDay: DateData) {
    if (isSingleDate) {
      formRef.setValue(name, selectedDay.dateString as PathValue<T, Path<T>>);
    } else {
      const { startsAt, endsAt } = parseJSON(data);

      const dates: DatesSelected = calendarUtils.orderStartsAtAndEndsAt({
        startsAt,
        endsAt,
        selectedDay,
      });

      formRef.setValue(name, JSON.stringify(dates) as PathValue<T, Path<T>>);
    }
  }

  function handleCloseModal() {
    if (onClose) onClose();
    setShowModal(false);
  }

  return (
    <>
      <Input variant={variant} className={className}>
        <CalendarIcon color={iconColor ?? colors.zinc[400]} size={20} />
        <Input.Field
          name={name}
          formRef={formRef}
          showSoftInputOnFocus={false}
          onFocus={() => Keyboard.dismiss()}
          onPressIn={() => setShowModal(true)}
          {...props}
        />
      </Input>

      <Modal
        title={title}
        subtitle={subtitle}
        visible={showModal}
        onClose={handleCloseModal}
      >
        <View className="gap-4 mt-4">
          <Calendar
            minDate={dayjs(minDate).toISOString()}
            maxDate={maxDate && dayjs(maxDate).toISOString()}
            onDayPress={handleSelectDate}
            markedDates={markedDates}
          />
          <Button onPress={handleCloseModal}>
            <Button.Title>{'Confirmar'}</Button.Title>
          </Button>
        </View>
      </Modal>
    </>
  );
}
