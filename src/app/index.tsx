import { QueryClientProvider } from '@tanstack/react-query';
import Home from './views/home';
import { queryClient } from '@/services/queryClient';

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Home />
    </QueryClientProvider>
  );
}
