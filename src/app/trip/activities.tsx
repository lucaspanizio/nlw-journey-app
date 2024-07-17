import { useState } from 'react';
import { View, Text, Alert, SectionList } from 'react-native';
import { TripDomain } from '@/services/mappers/CreateTripMapper';
import { Button } from '@/components/button';
import { ClockIcon, PlusIcon, TagIcon } from 'lucide-react-native';
import { colors } from '@/styles/colors';
import { Modal } from '@/components/modal';
import { Input } from '@/components/inputs/text';
import { useForm } from 'react-hook-form';
import { DateInput } from '@/components/inputs/date';
import { isoToFullDateWithShortMonth } from '@/utils/formatDate';
import { useMutation, useQuery } from '@tanstack/react-query';
import { activitiesServer } from '@/services/api/activities';
import dayjs from 'dayjs';
import { Activity } from '@/components/activity';
import ActivitiesMapper from '@/services/mappers/ActivitiesMapper';

type TActivityForm = { date: string; hour: string; description: string };

interface IActivitiesProps {
  tripData: TripDomain;
}

export function Activities({ tripData }: IActivitiesProps) {
  const [showModal, setShowModal] = useState(false);
  const tripId = tripData.id;

  const form = useForm<TActivityForm>({
    defaultValues: { date: '', hour: '', description: '' },
  });
  const { description, date, hour } = form.watch();

  const { data: activitiesData = [], refetch } = useQuery({
    queryKey: ['get_activities', tripId],
    queryFn: () =>
      activitiesServer
        .getByTripId(tripId)
        .then((data) => ActivitiesMapper.toDomain(data)),
  });

  const { mutate: create, isPending: isCreating } = useMutation({
    mutationKey: ['create_activity'],
    mutationFn: activitiesServer.create,
  });

  async function handleCreateActivity() {
    if (!description || !date || !hour) {
      return Alert.alert('Cadastrar atividade, "Preencha todos os campos!"');
    }

    const body = {
      tripId,
      occurs_at: dayjs(date).add(Number(hour), 'h').toString(),
      title: description,
    };

    create(body, {
      onSuccess: () => {
        refetch();
        form.reset();
        setShowModal(false);
        Alert.alert('', 'Atividade cadastrada com sucesso!');
      },
      onError: (error) => {
        console.error(String(error));
      },
    });
  }

  return (
    <View className="flex-1">
      <View className="w-full flex-row mt-5 mb-6 items-center justify-between">
        <Text className="text-zinc-50 text-2xl font-semibold flex-1'">
          Atividades
        </Text>

        <Button onPress={() => setShowModal(true)}>
          <PlusIcon color={colors.lime[950]} />
          <Button.Title>Nova atividade</Button.Title>
        </Button>
      </View>

      <SectionList
        sections={activitiesData}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <Activity data={item} />}
      />

      <Modal
        visible={showModal}
        title="Cadastrar atividade"
        subtitle="Todos os convidados podem visualizar as atividades"
        onClose={() => setShowModal(false)}
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
                onClose: () => setShowModal(true),
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

        <Button onPress={handleCreateActivity} isLoading={isCreating}>
          <Button.Title>Salvar atividade</Button.Title>
        </Button>
      </Modal>
    </View>
  );
}
