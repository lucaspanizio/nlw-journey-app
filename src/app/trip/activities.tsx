import { useState } from 'react';
import { View, Text } from 'react-native';
import { TripDomain } from '@/services/mappers/CreateTripMapper';
import { Button } from '@/components/button';
import { ClockIcon, PlusIcon, TagIcon } from 'lucide-react-native';
import { colors } from '@/styles/colors';
import { Modal } from '@/components/modal';
import { Input } from '@/components/inputs/text';
import { useForm } from 'react-hook-form';
import { DateInput } from '@/components/inputs/date';
import { isoToFullDateWithShortMonth } from '@/utils/formatDate';

enum EModal {
  NONE = 0,
  NEW_ACTIVITY = 1,
}

interface IActivitiesProps {
  tripData: TripDomain;
}

export function Activities({ tripData }: IActivitiesProps) {
  const [showModal, setShowModal] = useState(EModal.NONE);
  const form = useForm<{ date: string; hour: string; description: string }>();
  const date = form.watch('date');

  return (
    <View className="flex-1">
      <View className="w-full flex-row mt-5 mb-6 items-center justify-between">
        <Text className="text-zinc-50 text-2xl font-semibold flex-1'">
          Atividades
        </Text>

        <Button onPress={() => setShowModal(EModal.NEW_ACTIVITY)}>
          <PlusIcon color={colors.lime[950]} />
          <Button.Title>Nova atividade</Button.Title>
        </Button>
      </View>

      <Modal
        visible={showModal === EModal.NEW_ACTIVITY}
        title="Cadastrar atividade"
        subtitle="Todos os convidados podem visualizar as atividades"
        onClose={() => setShowModal(EModal.NONE)}
      >
        <View className="mt-4 mb-3">
          <Input variant="secondary">
            <TagIcon color={colors.zinc[400]} size={20} />
            <Input.Field
              formRef={form}
              name="description"
              placeholder="Atividade"
            />
          </Input>

          <View className="w-full mt-2 flex-row gap-2">
            <DateInput
              name="date"
              isSingleDate
              formRef={form}
              placeholder="Data"
              className="flex-1"
              value={
                tripData.starts_at <= date && tripData.ends_at >= date
                  ? isoToFullDateWithShortMonth(date)
                  : ''
              }
              modalOptions={{
                title: 'Data da atividade',
                subtitle: 'Selecione a data da atividade',
                minDate: tripData.starts_at,
                maxDate: tripData.ends_at,
                onClose: () => setShowModal(EModal.NEW_ACTIVITY),
              }}
            />

            <Input variant="secondary" className="flex-1">
              <ClockIcon color={colors.zinc[400]} size={20} />
              <Input.Field
                formRef={form}
                name="hour"
                placeholder="Horário"
                keyboardType="numeric"
                maxLength={2}
              />
            </Input>
          </View>
        </View>
      </Modal>
    </View>
  );
}
