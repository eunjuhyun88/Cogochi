import type { AgentDecisionContext, BattleRetrievedMemory, DataSourceKind, EvalScenario, MarketState, OwnedAgent } from '../types';

export function buildAgentDecisionContext(
  agent: OwnedAgent,
  market: MarketState,
  retrievedMemories: BattleRetrievedMemory[],
  squadNotes: string[],
  tacticPreset: AgentDecisionContext['tacticPreset'],
  scenario?: Pick<EvalScenario, 'id' | 'label' | 'symbol' | 'timeframe' | 'objective' | 'allowedDataSourceKinds'>,
  activeDataSourceKinds: DataSourceKind[] = []
): AgentDecisionContext {
  const allowedDataSourceKinds = scenario?.allowedDataSourceKinds ?? [];
  const disallowedDataSourceKinds = activeDataSourceKinds.filter((kind) => !allowedDataSourceKinds.includes(kind));

  return {
    ownedAgentId: agent.id,
    agentName: agent.name,
    speciesId: agent.speciesId,
    role: agent.role,
    tacticPreset,
    baseModelId: agent.baseModelId,
    readout: agent.loadout.readout,
    behaviorNote: agent.loadout.behaviorNote,
    riskTolerance: agent.loadout.riskTolerance,
    confidenceStyle: agent.loadout.confidenceStyle,
    horizon: agent.loadout.horizon,
    activeDataSourceIds: [...agent.loadout.enabledDataSourceIds],
    activeDataSourceKinds,
    allowedDataSourceKinds,
    disallowedDataSourceKinds,
    activeToolIds: [...agent.loadout.enabledToolIds],
    scenario: {
      id: scenario?.id ?? 'ad-hoc',
      label: scenario?.label ?? 'Ad hoc sandbox',
      objective: scenario?.objective ?? 'Evaluate the current setup against the live market packet.'
    },
    market: {
      symbol: scenario?.symbol ?? 'BTCUSDT',
      timeframe: scenario?.timeframe ?? '15m',
      regime: market.regime,
      price: market.price,
      priceChange5m: market.priceChange5m,
      volatility: market.volatility,
      fearGreed: market.fearGreed,
      fundingRate: market.fundingRate,
      openInterestChange: market.openInterestChange
    },
    retrievedMemories,
    squadNotes
  };
}
