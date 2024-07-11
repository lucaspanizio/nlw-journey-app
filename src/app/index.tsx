import { Input } from '@/components/input';
import { View, Text, Image } from 'react-native';

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

      <View className="w-full bg-zinc-900 px-4 rounded-lg my-8 border border-zinc-800">
        <Input>
          <Input.Field placeholder="Para onde deseja ir ?" />
        </Input>
      </View>
    </View>
  );
}
