<script lang="ts">
  import { onDestroy, onMount } from 'svelte';
  import type { OwnedAgent } from '$lib/aimon/types';
  import { AIMON_DEX, aimonDexById } from '$lib/aimon/data/aimonDex';
  import { EVAL_SCENARIO_TEMPLATES, createEvalScenario } from '$lib/aimon/data/evalScenarios';
  import BattleArena from '../../components/aimon/BattleArena.svelte';
  import PhaseBar from '../../components/aimon/PhaseBar.svelte';
  import PokemonFrame from '../../components/shared/PokemonFrame.svelte';
  import { battleStore, focusTap, restartBattle, startBattle, stopBattle } from '$lib/aimon/stores/battleStore';
  import { gameStore, setScreen } from '$lib/aimon/stores/gameStore';
  import { matchStore, selectEvalScenario } from '$lib/aimon/stores/matchStore';
  import { playerStore } from '$lib/aimon/stores/playerStore';
  import { rosterStore } from '$lib/aimon/stores/rosterStore';
  import { runtimeStore } from '$lib/aimon/stores/runtimeStore';
  import { squadStore } from '$lib/aimon/stores/squadStore';

  let battle = $derived($battleStore);
  let player = $derived($playerStore);
  let game = $derived($gameStore);
  let matches = $derived($matchStore);
  let roster = $derived($rosterStore);
  let runtime = $derived($runtimeStore);
  let squad = $derived($squadStore);
  let selectedScenario = $derived(matches.activeScenario ?? createEvalScenario(matches.selectedScenarioId));
  let totalXp = $derived(roster.agents.reduce((sum, agent) => sum + agent.xp, 0));
  let selectedTeam = $derived(
    squad.activeSquad.memberAgentIds
      .map((id) => roster.agents.find((agent) => agent.id === id))
      .filter((agent): agent is OwnedAgent => Boolean(agent))
  );

  onMount(() => {
    setScreen('battle');
    startBattle();
  });

  onDestroy(() => {
    stopBattle();
  });

  function launchScenario(scenarioId: string): void {
    selectEvalScenario(scenarioId);
    restartBattle();
  }
</script>

<svelte:head>
  <title>AI MON Battle</title>
</svelte:head>

<div class="page">
  <section class="hero">
    <div>
      <p class="eyebrow">LIVE BATTLE</p>
      <h1>Signal War Arena</h1>
      <p class="lede">
        전투 화면은 증명 단계입니다. 지금 선택된 시나리오의 목적, 허용 데이터, 스코어링 기준 위에서 squad readout과 decision trace를 검증합니다.
      </p>
    </div>
    <div class="hero-actions">
      <a href="/roster">Roster</a>
      <a href="/team">Squad Setup</a>
      <button type="button" onclick={() => restartBattle()}>Restart Match</button>
    </div>
  </section>

  <PokemonFrame variant="accent" padding="16px">
    <section class="scenario-panel">
      <div class="scenario-header">
        <div>
          <p class="eyebrow">EVAL SCENARIOS</p>
          <h2>{selectedScenario.label}</h2>
          <p>{selectedScenario.brief}</p>
        </div>
        <div class="scenario-meta">
          <span>{selectedScenario.symbol}</span>
          <span>{selectedScenario.timeframe}</span>
          <span>{selectedScenario.targetRegime}</span>
        </div>
      </div>

      <div class="scenario-picker">
        {#each EVAL_SCENARIO_TEMPLATES as scenario (scenario.id)}
          <button
            type="button"
            class:selected={scenario.id === selectedScenario.id}
            onclick={() => launchScenario(scenario.id)}
          >
            <strong>{scenario.label}</strong>
            <small>{scenario.symbol} · {scenario.timeframe} · {scenario.targetRegime}</small>
          </button>
        {/each}
      </div>

      <div class="scenario-grid">
        <div>
          <span>Objective</span>
          <strong>{selectedScenario.objective}</strong>
        </div>
        <div>
          <span>Allowed data</span>
          <strong>{selectedScenario.allowedDataSourceKinds.join(' / ')}</strong>
        </div>
        <div>
          <span>Weights</span>
          <strong>
            R {Math.round(selectedScenario.scoringWeights.returnWeight * 100)} /
            Risk {Math.round(selectedScenario.scoringWeights.riskWeight * 100)} /
            Acc {Math.round(selectedScenario.scoringWeights.accuracyWeight * 100)}
          </strong>
        </div>
        <div>
          <span>Context seed</span>
          <strong>
            Price {selectedScenario.startingPrice} · FG {selectedScenario.baselineFearGreed} · Vol {selectedScenario.baselineVolatility.toFixed(2)}
          </strong>
        </div>
      </div>
    </section>
  </PokemonFrame>

  <PhaseBar phase={battle.phase} remainingMs={battle.phaseRemainingMs} />

  <div class="content-grid">
    <BattleArena battle={battle} onFocusTap={focusTap} />

    <div class="side-stack">
      <PokemonFrame variant="dark" padding="14px">
        <section class="panel">
          <h2>Prototype Scope</h2>
          <div class="scope-grid">
            <span>Screen</span><strong>{game.currentScreen}</strong>
            <span>Species</span><strong>{game.prototypeScope.speciesCount}</strong>
            <span>Regimes</span><strong>{game.prototypeScope.regimeCount}</strong>
            <span>Mode</span><strong>{game.prototypeScope.pveOnly ? 'PvE Only' : 'Expanded'}</strong>
            <span>Runtime</span><strong>{runtime.config.mode}</strong>
            <span>Scenario</span><strong>{selectedScenario.label}</strong>
          </div>
        </section>
      </PokemonFrame>

      <PokemonFrame variant="dark" padding="14px">
        <section class="panel">
          <h2>Market Snapshot</h2>
          <div class="scope-grid">
            <span>Regime</span><strong>{battle.market.regime}</strong>
            <span>Strength</span><strong>{Math.round(battle.market.regimeStrength * 100)}%</strong>
            <span>Price</span><strong>${battle.market.price.toFixed(2)}</strong>
            <span>Fear & Greed</span><strong>{Math.round(battle.market.fearGreed)}</strong>
            <span>Volatility</span><strong>{battle.market.volatility.toFixed(2)}</strong>
            <span>Focus Charges</span><strong>{battle.focusTapCharges}</strong>
          </div>
        </section>
      </PokemonFrame>

      <PokemonFrame variant="dark" padding="14px">
        <section class="panel">
          <h2>My Squad</h2>
          <div class="team-list">
            <span class="preset-line">Preset · {squad.activeSquad.tacticPreset}</span>
            {#each selectedTeam as agent (agent.id)}
              {@const entry = aimonDexById[agent.speciesId]}
              {#if entry}
                <span style:color={entry.color}>{entry.dexNo} {agent.name} · {agent.role}</span>
              {/if}
            {/each}
          </div>
        </section>
      </PokemonFrame>

      <PokemonFrame variant="dark" padding="14px">
        <section class="panel">
          <h2>RAG Retrieval</h2>
          <div class="retrieval-list">
            {#if battle.retrievalFeed.length > 0}
              {#each battle.retrievalFeed as item (item.ownedAgentId)}
                <article class="retrieval-card">
                  <div class="retrieval-head">
                    <strong>{item.agentName}</strong>
                    <span>{Math.round(item.memoryScore * 100)}%</span>
                  </div>
                  <small>{item.role} · {item.readout}</small>
                  <p>{item.decisionHint}</p>
                  <div class="memory-chip-row">
                    {#if item.retrievedMemories.length > 0}
                      {#each item.retrievedMemories.slice(0, 2) as memory}
                        <span>{memory.title}</span>
                      {/each}
                    {:else}
                      <span>No memory hits</span>
                    {/if}
                  </div>
                </article>
              {/each}
            {:else}
              <p class="retrieval-empty">No retrieval context loaded yet.</p>
            {/if}
          </div>
        </section>
      </PokemonFrame>

      <PokemonFrame variant="dark" padding="14px">
        <section class="panel">
          <h2>Decision Trace</h2>
          <div class="retrieval-list">
            {#if battle.decisionFeed.length > 0}
              {#each battle.decisionFeed as trace (trace.ownedAgentId)}
                <article class="retrieval-card">
                  <div class="retrieval-head">
                    <strong>{trace.agentName}</strong>
                    <span>{trace.action} · {Math.round(trace.confidence * 100)}%</span>
                  </div>
                  <small>{trace.role}</small>
                  <p>{trace.thesis}</p>
                  <small>{trace.invalidation}</small>
                  <div class="memory-chip-row">
                    {#if trace.evidenceTitles.length > 0}
                      {#each trace.evidenceTitles as title}
                        <span>{title}</span>
                      {/each}
                    {:else}
                      <span>Live market packet only</span>
                    {/if}
                  </div>
                </article>
              {/each}
            {:else}
              <p class="retrieval-empty">No decision traces yet.</p>
            {/if}
          </div>
        </section>
      </PokemonFrame>

      <PokemonFrame variant="dark" padding="14px">
        <section class="panel">
          <h2>Trainer Progress</h2>
          <div class="scope-grid">
            <span>Total XP</span><strong>{totalXp}</strong>
            <span>Research</span><strong>{player.researchPoints}</strong>
            <span>Battles</span><strong>{player.battleCount}</strong>
            <span>Wins</span><strong>{player.wins}</strong>
          </div>
          {#if battle.result}
            <div class="result-box" data-outcome={battle.result.outcome}>
              <strong>{battle.result.outcome}</strong>
              <p>{battle.result.note}</p>
              <span>
                Δ {battle.result.priceDeltaPct >= 0 ? '+' : ''}{battle.result.priceDeltaPct.toFixed(2)}%
                · XP +{battle.result.xpGain}
                · RP +{battle.result.researchGain}
              </span>
            </div>
          {/if}
        </section>
      </PokemonFrame>
    </div>
  </div>

  <section class="dex-strip">
    {#each AIMON_DEX as entry (entry.id)}
      <article class="dex-card" style={`--dex-color:${entry.color};`}>
        <span>{entry.dexNo}</span>
        <strong>{entry.name}</strong>
        <small>{entry.type}</small>
      </article>
    {/each}
  </section>
</div>

<style>
  .page {
    display: grid;
    gap: 18px;
    padding: 18px;
  }

  .hero {
    display: flex;
    justify-content: space-between;
    gap: 18px;
    align-items: end;
  }

  .eyebrow {
    margin: 0;
    color: var(--cyan);
    font-family: 'JetBrains Mono', monospace;
    font-size: 12px;
    letter-spacing: 0.12em;
  }

  h1 {
    margin: 6px 0;
    font-family: 'Orbitron', sans-serif;
    font-size: clamp(40px, 6vw, 72px);
    line-height: 0.92;
    letter-spacing: 0.02em;
  }

  .lede {
    margin: 0;
    max-width: 720px;
    color: var(--text-1);
    font-size: 15px;
    line-height: 1.5;
  }

  .hero-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
  }

  .scenario-panel {
    display: grid;
    gap: 14px;
  }

  .scenario-header {
    display: flex;
    justify-content: space-between;
    gap: 16px;
    align-items: start;
  }

  .scenario-header h2 {
    margin: 4px 0 6px;
    font-family: 'Orbitron', sans-serif;
    font-size: 28px;
  }

  .scenario-header p {
    margin: 0;
    color: var(--text-1);
    line-height: 1.5;
  }

  .scenario-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .scenario-meta span,
  .scenario-grid span {
    color: var(--text-2);
    font-size: 12px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  .scenario-picker {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: 10px;
  }

  .scenario-picker button {
    display: grid;
    gap: 4px;
    align-items: start;
    padding: 14px;
    border-radius: 16px;
    border: 1px solid rgba(120, 214, 255, 0.18);
    background: rgba(8, 19, 34, 0.72);
    color: var(--text-0);
    text-align: left;
    cursor: pointer;
  }

  .scenario-picker button.selected {
    border-color: rgba(120, 214, 255, 0.58);
    box-shadow: 0 0 0 1px rgba(120, 214, 255, 0.24) inset;
    background: rgba(14, 33, 56, 0.9);
  }

  .scenario-picker strong {
    font-size: 15px;
  }

  .scenario-picker small {
    color: var(--text-1);
    line-height: 1.4;
  }

  .scenario-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 12px;
  }

  .scenario-grid div {
    display: grid;
    gap: 6px;
    padding: 12px 14px;
    border-radius: 14px;
    background: rgba(7, 17, 31, 0.62);
    border: 1px solid rgba(120, 214, 255, 0.12);
  }

  .hero-actions a,
  .hero-actions button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-height: 42px;
    padding: 0 14px;
    border-radius: 14px;
    border: 1px solid var(--line);
    background: rgba(13, 22, 40, 0.82);
    color: var(--text-0);
    text-decoration: none;
  }

  .content-grid {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 320px;
    gap: 16px;
  }

  .side-stack {
    display: grid;
    gap: 14px;
  }

  .panel {
    display: grid;
    gap: 12px;
  }

  .panel h2 {
    margin: 0;
    font-size: 20px;
  }

  .scope-grid {
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 10px 14px;
    font-family: 'JetBrains Mono', monospace;
    font-size: 12px;
  }

  .scope-grid span {
    color: var(--text-2);
  }

  .team-list {
    display: grid;
    gap: 8px;
  }

  .preset-line {
    color: var(--cyan);
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
    letter-spacing: 0.08em;
  }

  .retrieval-list {
    display: grid;
    gap: 10px;
  }

  .retrieval-card {
    display: grid;
    gap: 6px;
    padding: 12px;
    border-radius: 14px;
    border: 1px solid rgba(255,255,255,0.08);
    background: rgba(255,255,255,0.03);
  }

  .retrieval-head {
    display: flex;
    justify-content: space-between;
    gap: 12px;
    align-items: baseline;
  }

  .retrieval-card small,
  .retrieval-empty {
    color: var(--text-2);
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
  }

  .retrieval-card p {
    margin: 0;
    color: var(--text-1);
    font-size: 13px;
    line-height: 1.4;
  }

  .memory-chip-row {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .memory-chip-row span {
    padding: 5px 8px;
    border-radius: 999px;
    background: rgba(0,229,255,0.08);
    border: 1px solid rgba(0,229,255,0.15);
    color: #b7ebff;
    font-size: 11px;
  }

  .result-box {
    padding: 12px;
    border-radius: 14px;
    background: rgba(255,255,255,0.05);
  }

  .result-box[data-outcome='WIN'] {
    border: 1px solid rgba(0,255,136,0.25);
  }

  .result-box[data-outcome='LOSS'] {
    border: 1px solid rgba(255,51,85,0.25);
  }

  .result-box p {
    margin: 6px 0;
    color: var(--text-1);
  }

  .dex-strip {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: 10px;
  }

  .dex-card {
    padding: 12px;
    border-radius: 16px;
    background: linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02));
    border: 1px solid rgba(255,255,255,0.08);
    border-top-color: var(--dex-color);
    display: grid;
    gap: 4px;
  }

  .dex-card span {
    color: var(--text-2);
  }

  .dex-card small {
    color: var(--text-1);
  }

  @media (max-width: 980px) {
    .content-grid {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 720px) {
    .page {
      padding: 14px;
    }

    .hero {
      flex-direction: column;
      align-items: stretch;
    }
  }
</style>
