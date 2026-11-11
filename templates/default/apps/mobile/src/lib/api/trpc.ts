import type { AppRouter } from '@starter/api';
import { createTRPCContext } from '@trpc/tanstack-react-query';

/**
 * TanStack Query bindings for the API. In a component:
 * `const trpc = useTRPC(); useMutation(trpc.auth.logIn.mutationOptions())`.
 */
export const { TRPCProvider, useTRPC } = createTRPCContext<AppRouter>();
