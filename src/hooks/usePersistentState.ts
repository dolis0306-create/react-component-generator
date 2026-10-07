import { useState, useEffect } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import { loadFromStorage, saveToStorage } from '../utils/storage';

/** useState와 같지만 값이 localStorage에 저장되어 새로고침 후에도 유지된다. */
export function usePersistentState<T>(
  key: string,
  initial: T,
  parse?: (raw: unknown) => T | null,
): [T, Dispatch<SetStateAction<T>>] {
  const [state, setState] = useState<T>(() => loadFromStorage(key, initial, parse));

  useEffect(() => {
    saveToStorage(key, state);
  }, [key, state]);

  return [state, setState];
}
