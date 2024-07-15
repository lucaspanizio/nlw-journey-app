import { View, Text } from 'react-native';
import { TripDomain } from '@/services/mappers/CreateTripMapper';

interface IActivitiesProps {
  tripData: TripDomain;
}

export function Activities({ tripData }: IActivitiesProps) {
  return (
    <View className="flex-1 justify-center">
      <Text className="text-white text-center">Atividades</Text>
    </View>
  );
}
