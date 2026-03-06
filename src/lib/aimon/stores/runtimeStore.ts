import { writable } from 'svelte/store';
import type { RuntimeConfig, RuntimeState } from '../types';

const STORAGE_KEY = 'cogochi.runtime.v1';

const DEFAULT_CONFIG: RuntimeConfig = {
  mode: 'HEURISTIC',
  baseUrl: 'http://127.0.0.1:11434',
  modelId: 'qwen2.5:7b-instruct',
  apiKey: '',
  temperature: 0.2,
  timeoutMs: 20_000
};

function defaultState(): RuntimeState {
  return {
    config: DEFAULT_CONFIG,
    lastStatus: 'IDLE',
    lastMessage: 'Runtime is using the local heuristic adapter.'
  };
}

function loadState(): RuntimeState {
  if (typeof window === 'undefined') return defaultState();

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState();
    const parsed = JSON.parse(raw);
    return {
      config: {
        ...DEFAULT_CONFIG,
        ...parsed?.config
      },
      lastTestedAt: typeof parsed?.lastTestedAt === 'number' ? parsed.lastTestedAt : undefined,
      lastStatus: parsed?.lastStatus === 'OK' || parsed?.lastStatus === 'ERROR' ? parsed.lastStatus : 'IDLE',
      lastMessage: typeof parsed?.lastMessage === 'string' ? parsed.lastMessage : defaultState().lastMessage
    };
  } catch {
    return defaultState();
  }
}

export const runtimeStore = writable<RuntimeState>(loadState());

if (typeof window !== 'undefined') {
  runtimeStore.subscribe((state) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  });
}

export function updateRuntimeConfig(patch: Partial<RuntimeConfig>): void {
  runtimeStore.update((state) => ({
    ...state,
    config: {
      ...state.config,
      ...patch
    }
  }));
}

export function setRuntimeStatus(status: RuntimeState['lastStatus'], message: string): void {
  runtimeStore.update((state) => ({
    ...state,
    lastStatus: status,
    lastMessage: message,
    lastTestedAt: Date.now()
  }));
}
