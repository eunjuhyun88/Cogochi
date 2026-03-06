import type { AgentState, AiMonInstance, MarketState } from '../types';

function enterState(
  agent: AiMonInstance,
  state: AgentState,
  now: number,
  patch: Partial<AiMonInstance> = {}
): AiMonInstance {
  return {
    ...agent,
    ...patch,
    state,
    stateEnteredAt: now
  };
}

export function transitionAiMonState(
  agent: AiMonInstance,
  state: AgentState,
  now: number,
  patch: Partial<AiMonInstance> = {}
): AiMonInstance {
  return enterState(agent, state, now, patch);
}

export function advanceAiMonState(agent: AiMonInstance, market: MarketState, now: number): AiMonInstance {
  const elapsed = now - agent.stateEnteredAt;
  const focusBoost = agent.focusTapUntil > now ? 320 : 0;
  const scanMs = Math.max(500, 1900 - agent.stats.detection * 9 - focusBoost);
  const lockMs = Math.max(420, 1000 - agent.stats.prediction * 4);
  const castMs = Math.max(260, 680 - agent.stats.speed * 3);
  const executeMs = 520;
  const cooldownMs = Math.max(500, 1250 - agent.stats.speed * 5);

  if (agent.state === 'IDLE') return enterState(agent, 'SCAN', now);
  if (agent.state === 'CLASH' && elapsed >= 300) return enterState(agent, 'COOLDOWN', now);

  if (agent.state === 'SCAN' && elapsed >= scanMs) {
    return enterState(agent, 'LOCK', now, {
      currentTarget: market.regime === 'TREND' ? 'Breakout Stream' : 'Range Echo'
    });
  }

  if (agent.state === 'LOCK' && elapsed >= lockMs) return enterState(agent, 'CAST', now);
  if (agent.state === 'CAST' && elapsed >= castMs) return enterState(agent, 'EXECUTE', now);
  if (agent.state === 'EXECUTE' && elapsed >= executeMs) return enterState(agent, 'COOLDOWN', now);

  if (agent.state === 'COOLDOWN' && elapsed >= cooldownMs) {
    return enterState(agent, 'SCAN', now, { currentTarget: undefined });
  }

  return agent;
}

