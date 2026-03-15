import { browser } from '$app/environment';
import { writable, type StartStopNotifier, type Writable } from 'svelte/store';

export function persistedWritable<T>(key: string, initialValue: T, start?: StartStopNotifier<T>): Writable<T> {
  const store = writable(initialValue, start);

  if (!browser) {
    return store;
  }

  const saved = window.localStorage.getItem(key);
  if (saved) {
    try {
      store.set(JSON.parse(saved) as T);
    } catch {
      window.localStorage.removeItem(key);
    }
  }

  store.subscribe((value) => {
    window.localStorage.setItem(key, JSON.stringify(value));
  });

  return store;
}
