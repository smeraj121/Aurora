// hooks/useDebouncedCallback.ts
import { useRef, useCallback, useEffect } from 'react';

export function useDebouncedCallback<Args extends unknown[]>(
  fn: (...args: Args) => void,
  delayMs: number
): (...args: Args) => void {
  const fnRef = useRef(fn);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Always call the latest fn, without re-creating the debounced
  // function (and thus resetting the timer) on every render.
  useEffect(() => {
    fnRef.current = fn;
  }, [fn]);

  // Clear any pending timer on unmount so it doesn't fire after
  // the component is gone.
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return useCallback(
    (...args: Args) => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        fnRef.current(...args);
      }, delayMs);
    },
    [delayMs]
  );
}