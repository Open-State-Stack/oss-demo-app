import { useEffect } from "react";

type DebounceCallback<T> = (value: T) => void;

function useDebounce<T>(
  callback: DebounceCallback<T>,
  value: T,
  delay: number
): void {
  useEffect(() => {
    const handler = setTimeout(() => {
      callback(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay, callback]);
}

export default useDebounce;
