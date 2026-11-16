'use client';
import { useSyncExternalStore, useCallback, useMemo } from 'react';
const EVENT = 'basin-local-storage';
/** Subscribe to browser storage without hydration-dependent effect updates. */
export function useLocalArray<T>(key: string, validate: (v: unknown) => T) {
  const subscribe = useCallback((onChange: () => void) => {
    window.addEventListener('storage', onChange);
    window.addEventListener(EVENT, onChange);
    return () => {
      window.removeEventListener('storage', onChange);
      window.removeEventListener(EVENT, onChange);
    };
  }, []);
  const snapshot = useCallback(() => {
    try {
      return localStorage.getItem(key) || '[]';
    } catch {
      return 'unavailable';
    }
  }, [key]);
  const raw = useSyncExternalStore(subscribe, snapshot, () => '[]');
  const parsed = useMemo(() => {
    try {
      const data: unknown = JSON.parse(raw);
      if (!Array.isArray(data)) throw Error();
      return { records: data.map(validate), error: '' };
    } catch {
      return {
        records: [] as T[],
        error:
          'Saved records could not be read. Browser storage may be unavailable or contain invalid data.',
      };
    }
  }, [raw, validate]);
  const persist = useCallback(
    (next: T[]) => {
      localStorage.setItem(key, JSON.stringify(next));
      window.dispatchEvent(new Event(EVENT));
    },
    [key],
  );
  return { ...parsed, persist };
}
