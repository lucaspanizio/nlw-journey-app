import { useState } from 'react';
import { View, Text, Alert, FlatList } from 'react-native';
import { useForm } from 'react-hook-form';
import { PlusIcon } from 'lucide-react-native';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import { validateInput } from '@/utils/validateInput';
import { linksServer } from '@/services/api/links';
import { colors } from '@/styles/colors';
import { Button } from '@/components/button';
import { Input } from '@/components/inputs/text';
import { Modal } from '@/components/modal';
import { schema } from '@/types/schemas';
import { DetailsForm } from '@/types/forms';
import { TripLink } from '@/components/tripLink';

interface IDetailsProps {
  tripId: string;
}

export function Details({ tripId }: IDetailsProps) {
  const form = useForm<DetailsForm>({
    defaultValues: { title: '', url: '' },
    resolver: zodResolver(schema.createLink),
  });
  const [showModal, setShowModal] = useState(false);

  const {
    data: linksData = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['get_links', tripId],
    queryFn: () =>
      linksServer.getLinksByTripId(tripId).then(({ data }) => data.links),
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
        refetch();
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
      <Text className="text-zinc-50 text-2xl font-semibold mb-4">
        Links importantes
      </Text>

      <View>
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
            Nenhum texto adicionado.
          </Text>
        )}
        <Button variant="secondary" onPress={() => setShowModal(true)}>
          <PlusIcon color={colors.zinc[200]} size={20} />
          <Button.Title>Cadastrar novo link</Button.Title>
        </Button>
      </View>

      <View className="flex-1 border-t border-zinc-800 mt-6">
        <Text className="text-zinc-50 text-2xl font-semibold my-6">
          Convidados
        </Text>
      </View>

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
  );
}
