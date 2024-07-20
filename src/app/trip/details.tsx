import { useState } from 'react';
import { View, Text, Alert, FlatList } from 'react-native';
import { useForm } from 'react-hook-form';
import { PlusIcon } from 'lucide-react-native';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import { linksServer } from '@/services/api/links';
import { participantsServer } from '@/services/api/participants';
import { DetailsForm } from '@/types/forms';
import { schema } from '@/types/schemas';
import { colors } from '@/styles/colors';
import { Button } from '@/components/button';
import { Input } from '@/components/inputs/text';
import { Modal } from '@/components/modal';
import { TripLink } from '@/components/tripLink';
import { Participant } from '@/components/participant';

interface IDetailsProps {
  tripId: string;
}

export function Details({ tripId }: IDetailsProps) {
  const form = useForm<DetailsForm>({
    defaultValues: { title: '', url: '' },
    resolver: zodResolver(schema.createLink),
  });
  const [showModal, setShowModal] = useState(false);

  const { data: linksData = [], refetch: refetchLinks } = useQuery({
    queryKey: ['get_links', tripId],
    queryFn: () =>
      linksServer.getLinksByTripId(tripId).then(({ data }) => data.links),
  });

  const { data: participantsData = [], refetch: refetchParticipants } =
    useQuery({
      queryKey: ['get_participants', tripId],
      queryFn: () =>
        participantsServer
          .getByTripId(tripId)
          .then((data) => data.participants),
    });

  const { mutate: create, isPending: isCreatingLink } = useMutation({
    mutationKey: ['create_link'],
    mutationFn: linksServer.create,
  });

  function handleCloseModal() {
    form.reset();
    setShowModal(false);
  }

  function handleCreateLink(formData: DetailsForm) {
    const body = { tripId, ...formData };
    create(body, {
      onSuccess: () => {
        refetchLinks();
        handleCloseModal();
        Alert.alert('', 'Link cadastrado com sucesso!');
      },
      onError: (error) => {
        console.error(String(error));
      },
    });
  }

  return (
    <View className="flex-1 mt-6">
      <View>
        <Text className="text-zinc-50 text-2xl font-semibold mb-4">
          Links importantes
        </Text>

        {linksData.length > 0 ? (
          <FlatList
            data={linksData}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <TripLink data={item} />}
            contentContainerClassName="gap-4"
            className="mb-4"
          />
        ) : (
          <Text className="text-zinc-400 font-regular text-base mt-2 mb-6">
            Nenhum link adicionado.
          </Text>
        )}
        <Button variant="secondary" onPress={() => setShowModal(true)}>
          <PlusIcon color={colors.zinc[200]} size={20} />
          <Button.Title>Cadastrar novo link</Button.Title>
        </Button>

        <Modal
          title="Cadastrar link"
          subtitle="Todos os convidados podem visualizar os links importantes."
          visible={showModal}
          onClose={handleCloseModal}
        >
          <View className="gap-2 mb-3">
            <Input variant="secondary">
              <Input.Field formRef={form} name="title" placeholder="Título" />
            </Input>

            <Input variant="secondary">
              <Input.Field
                formRef={form}
                name="url"
                placeholder="URL"
                keyboardType="url"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </Input>
          </View>

          <Button
            onPress={form.handleSubmit(handleCreateLink)}
            isLoading={isCreatingLink}
          >
            <Button.Title>Salvar link</Button.Title>
          </Button>
        </Modal>
      </View>

      <View className="flex-1 border-t border-zinc-800 mt-6">
        <Text className="text-zinc-50 text-2xl font-semibold my-6">
          Convidados
        </Text>

        {participantsData.length > 0 ? (
          <FlatList
            data={participantsData}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <Participant data={item} />}
            contentContainerClassName="gap-4"
            className="mb-4"
          />
        ) : (
          <Text className="text-zinc-400 font-regular text-base mt-2 mb-6">
            Nenhum convidado adicionado.
          </Text>
        )}
      </View>
    </View>
  );
}
