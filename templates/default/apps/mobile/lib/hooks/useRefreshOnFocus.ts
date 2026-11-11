import { useFocusEffect } from 'expo-router';
import { useCallback, useRef } from 'react';

/**
 * Official TanStack Query pattern for React Native:
 * Refetch query data when the screen regains focus, but skips the initial mount
 * to prevent duplicate concurrent network requests (since useQuery already fetches on mount).
 *
 * @param refetch - The refetch function returned by a TanStack Query hook.
 */
export function useRefreshOnFocus<T>(refetch: () => Promise<T>) {
  const firstTimeRef = useRef(true);

  useFocusEffect(
    useCallback(() => {
      if (firstTimeRef.current) {
        firstTimeRef.current = false;
        return;
      }

      refetch();
    }, [refetch])
  );
}
