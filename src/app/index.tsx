import { View, Text, Image } from 'react-native';

export default function App() {
  return (
    <View className="flex-1 justify-center items-center gap-5">
      <Image
        source={require('@/assets/logo.png')}
        className="h-9"
        resizeMode="contain"
      />

      <Text className="text-zinc-400 font-regular text-center text-lg mt-3">
        Convide seus amigos e agende sua{'\n'}próxima viagem
      </Text>
    </View>
  );
}
