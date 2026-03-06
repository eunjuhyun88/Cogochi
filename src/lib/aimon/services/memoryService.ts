import type { AgentRole, MemoryBank, MemoryRecord, RetrievalPolicy } from '../types';

export interface MemoryRetrievalContext {
  role: AgentRole;
  symbol: string;
  timeframe: string;
  regime: string;
  tags: string[];
  scenarioStartAt: number;
}

export interface MemoryRetrievalCandidate {
  record: MemoryRecord;
  totalScore: number;
  breakdown: {
    similarity: number;
    recency: number;
    success: number;
    importance: number;
    roleMatch: number;
    regimeMatch: number;
  };
}

function clamp(value: number): number {
  return Math.max(0, Math.min(1, value));
}

function tokenize(parts: string[]): Set<string> {
  return new Set(
    parts
      .flatMap((part) => part.toLowerCase().split(/[^a-z0-9]+/))
      .map((token) => token.trim())
      .filter((token) => token.length >= 3)
  );
}

function computeSimilarity(record: MemoryRecord, context: MemoryRetrievalContext): number {
  const memoryTokens = tokenize([record.title, record.summary, record.lesson, ...record.tags, record.symbol, record.timeframe, record.regime]);
  const contextTokens = tokenize([...context.tags, context.role, context.symbol, context.timeframe, context.regime]);

  if (memoryTokens.size === 0 || contextTokens.size === 0) return 0;

  let shared = 0;
  for (const token of contextTokens) {
    if (memoryTokens.has(token)) shared += 1;
  }

  return clamp(shared / Math.max(contextTokens.size, memoryTokens.size));
}

function computeRecency(record: MemoryRecord, context: MemoryRetrievalContext): number {
  const ageMs = Math.max(0, context.scenarioStartAt - record.createdAt);
  const decayWindowMs = 1000 * 60 * 60 * 24 * 30;
  return clamp(1 - ageMs / decayWindowMs);
}

function computeSuccess(score: number): number {
  return clamp((score + 1) / 2);
}

export function retrieveRelevantMemories(
  memoryBank: MemoryBank | null | undefined,
  policy: RetrievalPolicy,
  context: MemoryRetrievalContext,
  limit = policy.topK
): MemoryRetrievalCandidate[] {
  if (!memoryBank || memoryBank.records.length === 0) return [];

  return memoryBank.records
    .filter((record) => record.createdAt <= context.scenarioStartAt)
    .map((record) => {
      const similarity = computeSimilarity(record, context);
      const recency = computeRecency(record, context);
      const success = computeSuccess(record.successScore);
      const importance = clamp(record.importance);
      const roleMatch = record.role === context.role ? 1 : 0;
      const regimeMatch = record.regime === context.regime ? 1 : 0;

      const totalScore = clamp(
        similarity * policy.similarityWeight +
          recency * policy.recencyWeight +
          success * policy.successWeight +
          importance * policy.importanceWeight +
          roleMatch * policy.roleMatchWeight +
          regimeMatch * policy.regimeMatchWeight
      );

      return {
        record,
        totalScore: Number(totalScore.toFixed(3)),
        breakdown: {
          similarity: Number(similarity.toFixed(3)),
          recency: Number(recency.toFixed(3)),
          success: Number(success.toFixed(3)),
          importance: Number(importance.toFixed(3)),
          roleMatch: Number(roleMatch.toFixed(3)),
          regimeMatch: Number(regimeMatch.toFixed(3))
        }
      };
    })
    .sort((left, right) => right.totalScore - left.totalScore)
    .slice(0, limit);
}
