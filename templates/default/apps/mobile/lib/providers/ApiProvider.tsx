import { useQueryClient } from '@tanstack/react-query';
import type { ReactNode } from 'react';

import { trpcClient } from '@/src/lib/api/client';
import { TRPCProvider } from '@/src/lib/api/trpc';

/** Gives screens the typed API (`useTRPC`). Sits inside `QueryProvider`. */
export function ApiProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();

  return (
    <TRPCProvider trpcClient={trpcClient} queryClient={queryClient}>
      {children}
    </TRPCProvider>
  );
}
