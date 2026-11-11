import { focusManager, QueryClientProvider } from '@tanstack/react-query';
import type { QueryClient } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { useState, useEffect } from 'react';
import { AppState, type AppStateStatus, Platform } from 'react-native';

import { createQueryClient } from '@/lib/api/query-client';

type QueryProviderProps = {
  children: ReactNode;
};

export function QueryProvider({ children }: QueryProviderProps) {
  // Use singleton pattern to keep the same query client across re-renders
  const [queryClient] = useState<QueryClient>(() => createQueryClient());

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (status: AppStateStatus) => {
      if (Platform.OS !== 'web') {
        focusManager.setFocused(status === 'active');
      }
    });

    return () => subscription.remove();
  }, []);

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
