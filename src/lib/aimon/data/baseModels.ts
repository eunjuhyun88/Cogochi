import type { BaseModelDefinition } from '../types';

export const BASE_MODELS: BaseModelDefinition[] = [
  {
    id: 'qwen2.5-7b-instruct',
    family: 'Qwen',
    variant: '2.5 7B Instruct',
    provider: 'OLLAMA',
    parameterScale: 'MEDIUM',
    contextWindow: 32_768,
    supportsJsonMode: true,
    supportsToolUse: false
  }
];

export const DEFAULT_BASE_MODEL_ID = BASE_MODELS[0]?.id ?? 'qwen2.5-7b-instruct';
