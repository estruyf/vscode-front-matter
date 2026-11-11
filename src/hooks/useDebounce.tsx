import { useEffect, useRef, useState } from 'react';

export function useDebounce<T>(value: T, delay: number, onUnmountFlush?: (pendingValue: T) => void) {
  // State and setters for debounced value
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  // Latest value and the last value that got debounced, used to flush a pending value on unmount
  const latestValueRef = useRef<T>(value);
  const lastDebouncedRef = useRef<T>(value);
  const onUnmountFlushRef = useRef(onUnmountFlush);
  latestValueRef.current = value;
  onUnmountFlushRef.current = onUnmountFlush;

  useEffect(
    () => {
      // Update debounced value after delay
      const handler = setTimeout(() => {
        lastDebouncedRef.current = value;
        setDebouncedValue(value);
      }, delay);

      // Cancel the timeout if value changes (also on delay change or unmount)
      // This is how we prevent debounced value from updating if value is changed ...
      // .. within the delay period. Timeout gets cleared and restarted.
      return () => {
        clearTimeout(handler);
      };
    },
    [value, delay] // Only re-call effect if value or delay changes
  );

  useEffect(() => {
    return () => {
      // The pending value would get lost when the component unmounts before the delay passed
      if (onUnmountFlushRef.current && latestValueRef.current !== lastDebouncedRef.current) {
        onUnmountFlushRef.current(latestValueRef.current);
      }
    };
  }, []);

  return debouncedValue;
}
