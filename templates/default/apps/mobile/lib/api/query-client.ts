import { QueryClient, QueryCache, MutationCache } from '@tanstack/react-query';
import * as Sentry from '@sentry/react-native';

import { defaultGcTime, defaultRetry, defaultStaleTime } from './query-config';

// Helper to get a human-readable name for mutations
const getMutationName = (mutation: any): string => {
  if (mutation.options.mutationKey) {
    return mutation.options.mutationKey.join('/');
  }
  if (mutation.options.mutationFn?.name) {
    return mutation.options.mutationFn.name;
  }
  return 'unknown-action';
};

export const createQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: defaultStaleTime,
        gcTime: defaultGcTime,
        retry: defaultRetry,
      },
    },
    queryCache: new QueryCache({
      onError: (error, query) => {
        // Log query errors to Sentry
        const queryName = query.queryKey.join('/');
        Sentry.captureException(error, {
          tags: {
            type: 'query',
            queryName,
          },
          extra: {
            queryKey: query.queryKey,
          },
        });
      },
    }),
    mutationCache: new MutationCache({
      onSuccess: (data, variables, context, mutation) => {
        const mutationName = getMutationName(mutation);

        // Add a breadcrumb for the successful action
        Sentry.addBreadcrumb({
          category: 'action',
          message: `Successful action: ${mutationName}`,
          level: 'info',
          data: {
            variables,
          },
        });

        // Log successful action event to Sentry
        Sentry.captureMessage(`Action Succeeded: ${mutationName}`, {
          level: 'info',
          tags: {
            type: 'mutation',
            mutationName,
          },
          extra: {
            variables,
            data,
          },
        });
      },
      onError: (error, variables, context, mutation) => {
        const mutationName = getMutationName(mutation);

        // Log mutation errors to Sentry
        Sentry.captureException(error, {
          tags: {
            type: 'mutation',
            mutationName,
          },
          extra: {
            variables,
          },
        });
      },
    }),
  });
