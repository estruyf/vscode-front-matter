import { useCallback, useRef } from 'react';

// How long a local change keeps precedence over incoming values that are not the echo of our own update
const EXTERNAL_UPDATE_GRACE = 1500;

/**
 * Keeps track of the last value a field sent to the extension host, so that the (stale) echo
 * of an older update does not overwrite a newer local change.
 */
export default function useLocalChange() {
  const lastChangeRef = useRef<{ value: string; time: number } | null>(null);

  /**
   * Register the value that gets sent to the extension host
   */
  const trackChange = useCallback((value: unknown) => {
    lastChangeRef.current = { value: JSON.stringify(value ?? null), time: Date.now() };
  }, []);

  /**
   * Check if the incoming value should be ignored because a newer local change is pending
   */
  const isStaleValue = useCallback((value: unknown) => {
    const lastChange = lastChangeRef.current;
    if (!lastChange) {
      return false;
    }

    // The echo of our last change or the grace period passed, the incoming value can be applied again
    if (
      JSON.stringify(value ?? null) === lastChange.value ||
      Date.now() - lastChange.time >= EXTERNAL_UPDATE_GRACE
    ) {
      lastChangeRef.current = null;
      return false;
    }

    return true;
  }, []);

  return {
    trackChange,
    isStaleValue
  };
}
