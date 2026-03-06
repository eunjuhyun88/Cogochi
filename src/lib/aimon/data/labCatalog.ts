import type { DataSourceBinding, ToolBinding } from '../types';

export const DEFAULT_DATA_SOURCES: DataSourceBinding[] = [
  {
    id: 'ds-price-core',
    kind: 'PRICE',
    name: 'Core Price Feed',
    enabled: true,
    qualityScore: 0.92,
    config: {
      symbol: 'BTCUSDT',
      timeframe: '15m'
    }
  },
  {
    id: 'ds-news-brief',
    kind: 'NEWS',
    name: 'News Brief',
    enabled: true,
    qualityScore: 0.76,
    config: {
      source: 'headline-summary'
    }
  },
  {
    id: 'ds-macro-calendar',
    kind: 'MACRO',
    name: 'Macro Calendar',
    enabled: true,
    qualityScore: 0.71,
    config: {
      region: 'global'
    }
  },
  {
    id: 'ds-onchain-pulse',
    kind: 'ONCHAIN',
    name: 'Onchain Pulse',
    enabled: true,
    qualityScore: 0.73,
    config: {
      chain: 'solana',
      cadence: '15m'
    }
  },
  {
    id: 'ds-social-sentiment',
    kind: 'SOCIAL',
    name: 'Social Sentiment',
    enabled: true,
    qualityScore: 0.68,
    config: {
      source: 'community-brief'
    }
  },
  {
    id: 'ds-user-doctrine',
    kind: 'USER_NOTE',
    name: 'User Doctrine',
    enabled: true,
    qualityScore: 1,
    config: {
      editable: true
    }
  }
];

export const DEFAULT_TOOLS: ToolBinding[] = [
  {
    id: 'tool-retriever',
    kind: 'RETRIEVER',
    name: 'Memory Retriever',
    enabled: true,
    description: 'Loads the most relevant summarized memories into the current decision context.'
  },
  {
    id: 'tool-summarizer',
    kind: 'SUMMARIZER',
    name: 'Reflection Summarizer',
    enabled: true,
    description: 'Compacts raw traces into durable lesson cards after each match.'
  },
  {
    id: 'tool-risk-filter',
    kind: 'RISK_FILTER',
    name: 'Risk Filter',
    enabled: true,
    description: 'Applies guardrails to high-conviction actions before execution.'
  },
  {
    id: 'tool-benchmark-scorer',
    kind: 'SCORER',
    name: 'Benchmark Scorer',
    enabled: true,
    description: 'Calculates scenario-weighted evaluation metrics after each match.'
  }
];
