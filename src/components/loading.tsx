import { ActivityIndicator } from 'react-native';

export function Loading() {
  return (
    <ActivityIndicator
      size="large"
      className="flex-1 bg-zinc-950 items-center justify-center text-lime-300"
    />
  );
}
