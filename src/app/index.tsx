import { Input } from '@/components/input';
import { View, Text, Image } from 'react-native';
import {
  MapPin as MapIcon,
  Calendar as CalendarIcon,
} from 'lucide-react-native';

import { colors } from '@/styles/colors';
import { Button } from '@/components/button';

export default function App() {
  return (
    <View className="flex-1 justify-center items-center px-5">
      <Image
        source={require('@/assets/logo.png')}
        className="h-8"
        resizeMode="contain"
      />

      <Text className="text-zinc-400 font-regular text-center text-lg mt-3">
        Convide seus amigos e agende sua{'\n'}próxima viagem
      </Text>

      <View className="w-full bg-zinc-900 p-4 rounded-lg my-8 border border-zinc-800">
        <Input>
          <MapIcon color={colors.zinc[400]} size={20} />
          <Input.Field placeholder="Para onde ?" />
        </Input>

        <Input>
          <CalendarIcon color={colors.zinc[400]} size={20} />
          <Input.Field placeholder="Quando ?" />
        </Input>

        <View className="border-b py-3 border-zinc-800">
          <Button>
            <Button.Title>Alterar local/data</Button.Title>
          </Button>
        </View>
      </View>
    </View>
  );
}
