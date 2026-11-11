import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Counts down to zero once per second.
 *
 * `restart` resets it to the full duration, or to `next` seconds — used after a
 * successful resend so the cooldown starts again.
 */
export const useCountdown = (seconds: number) => {
  const [remaining, setRemaining] = useState(seconds);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clear = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const restart = useCallback(
    (next: number = seconds) => {
      clear();
      setRemaining(next);
      intervalRef.current = setInterval(() => {
        setRemaining((value) => {
          if (value <= 1) {
            clear();
            return 0;
          }
          return value - 1;
        });
      }, 1000);
    },
    [clear, seconds]
  );

  useEffect(() => {
    restart();
    return clear;
  }, [restart, clear]);

  return { remaining, isComplete: remaining === 0, restart };
};
