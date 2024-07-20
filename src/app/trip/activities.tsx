import dayjs from 'dayjs';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { View, Text, Alert, SectionList } from 'react-native';
import { ClockIcon, PlusIcon, TagIcon } from 'lucide-react-native';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import { colors } from '@/styles/colors';
import { Button } from '@/components/button';
import { Modal } from '@/components/modal';
import { Input } from '@/components/inputs/text';
import { DateInput } from '@/components/inputs/date';
import { Loading } from '@/components/loading';
import { Activity } from '@/components/activity';
import { schema } from '@/types/schemas';
import { ActivityForm } from '@/types/forms';
import { isoToFullDateWithShortMonth } from '@/utils/formatDate';
import { activitiesServer } from '@/services/api/activities';
import { TripDomain } from '@/services/mappers/CreateTripMapper';
import ActivitiesMapper from '@/services/mappers/ActivitiesMapper';

interface IActivitiesProps {
  tripData: TripDomain;
}

export function Activities({ tripData }: IActivitiesProps) {
  const [showModal, setShowModal] = useState(false);
  const tripId = tripData.id;

  const form = useForm<ActivityForm>({
    defaultValues: { date: '', hour: '', description: '' },
    resolver: zodResolver(schema.createActivity),
  });
  const { date } = form.watch();

  const {
    data: activitiesData = [],
    isLoading,
    refetch,
  } = useQuery({
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

  function handleCloseModal() {
    form.reset();
    setShowModal(false);
  }

  async function handleCreateActivity(formData: ActivityForm) {
    const { description, date, hour } = formData;

    const body = {
      tripId,
      occurs_at: dayjs(date).add(Number(hour), 'h').toString(),
      title: description,
    };

    create(body, {
      onSuccess: () => {
        refetch();
        handleCloseModal();
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

      {isLoading ? (
        <Loading />
      ) : (
        <SectionList
          sections={activitiesData}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <Activity data={item} />}
          renderSectionHeader={({ section }) => (
            <View className="w-full">
              <Text className="text-zinc-50 text-xl font-semibold py-2">
                Dia {section.title.dayNumber + ' '}
                <Text className="text-zinc-500 text-base font-regular capitalize">
                  {section.title.dayName}
                </Text>
              </Text>
              {section.data.length === 0 && (
                <Text className="text-zinc-500 text-md font-regular">
                  Nenhuma atividade cadastrada para esse dia.
                </Text>
              )}
            </View>
          )}
          contentContainerClassName="gap-3 pb-48"
          showsVerticalScrollIndicator={false}
        />
      )}

      <Modal
        visible={showModal}
        title="Cadastrar atividade"
        subtitle="Todos os convidados podem visualizar as atividades"
        onClose={handleCloseModal}
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
              value={date && isoToFullDateWithShortMonth(date)}
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

        <Button
          onPress={form.handleSubmit(handleCreateActivity)}
          isLoading={isCreating}
        >
          <Button.Title>Salvar atividade</Button.Title>
        </Button>
      </Modal>
    </View>
  );
}
