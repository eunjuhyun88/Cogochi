<script lang="ts">
  import { onMount } from 'svelte';
  import type { OwnedAgent } from '$lib/aimon/types';
  import { aimonDexById } from '$lib/aimon/data/aimonDex';
  import { createEvalScenario } from '$lib/aimon/data/evalScenarios';
  import { getEvolutionPreview } from '$lib/aimon/engine/evolutionSystem';
  import { gameStore, setScreen } from '$lib/aimon/stores/gameStore';
  import { matchStore } from '$lib/aimon/stores/matchStore';
  import { playerStore } from '$lib/aimon/stores/playerStore';
  import { rosterStore } from '$lib/aimon/stores/rosterStore';
  import { squadStore } from '$lib/aimon/stores/squadStore';
  import PokemonFrame from '../components/shared/PokemonFrame.svelte';

  let player = $derived($playerStore);
  let game = $derived($gameStore);
  let matches = $derived($matchStore);
  let roster = $derived($rosterStore);
  let squad = $derived($squadStore);
  let selectedScenario = $derived(matches.activeScenario ?? createEvalScenario(matches.selectedScenarioId));

  let rosterAgents = $derived(roster.agents);
  let squadAgents = $derived(
    squad.activeSquad.memberAgentIds
      .map((id) => rosterAgents.find((agent) => agent.id === id))
      .filter((agent): agent is OwnedAgent => Boolean(agent))
  );
  let featuredAgent = $derived(squadAgents[0] ?? rosterAgents[0] ?? null);
  let featuredEntry = $derived(featuredAgent ? aimonDexById[featuredAgent.speciesId] ?? null : null);
  let evolutionReady = $derived(rosterAgents.filter((agent) => getEvolutionPreview(agent.speciesId, agent.xp).canEvolve));
  let totalXp = $derived(rosterAgents.reduce((sum, agent) => sum + agent.xp, 0));

  onMount(() => {
    setScreen('hub');
  });
</script>

<svelte:head>
  <title>AI MON Trainer Hub</title>
</svelte:head>

<div class="page">
  <section class="hero">
    <PokemonFrame variant="accent" padding="20px">
      <div class="hero-grid">
        <div class="hero-copy">
          <p class="eyebrow">TRAINER HUB</p>
          <h1>Raise The Squad Before You Enter The Arena</h1>
          <p class="lede">
            AIMON의 중심은 전투가 아니라 소유와 육성입니다. 내 에이전트의 readout, retraining path,
            squad 상태를 보고 다음 배틀에 들어가게 만듭니다.
          </p>
          <div class="hero-actions">
            {#if featuredAgent}
              <a href={`/agent/${featuredAgent.id}`}>Lead Console</a>
            {/if}
            <a href="/roster">Open Roster</a>
            <a href="/team">Build Squad</a>
            <a href="/battle">Start Battle</a>
          </div>
        </div>

        <div class="featured" style={`--hero-color:${featuredEntry?.color ?? '#00e5ff'}; --hero-accent:${featuredEntry?.accent ?? '#0b2c49'};`}>
          {#if featuredEntry && featuredAgent}
            <div class="sprite-shell">
              <div class="sprite">
                <span>{featuredAgent.name.slice(0, 2).toUpperCase()}</span>
              </div>
            </div>
            <div class="featured-meta">
              <span>{featuredEntry.dexNo}</span>
              <strong>{featuredAgent.name}</strong>
              <small>{featuredAgent.loadout.retrainingPath}</small>
            </div>
          {/if}
        </div>
      </div>
    </PokemonFrame>
  </section>

  <section class="dashboard-grid">
    <PokemonFrame variant="dark" padding="16px">
      <div class="panel">
        <div class="panel-head">
          <div>
            <p class="eyebrow">TRAINER STATUS</p>
            <h2>Command Readout</h2>
          </div>
          <span class="chip">{game.prototypeScope.pveOnly ? 'PvE Prototype' : 'Expanded'}</span>
        </div>
        <div class="stat-grid">
          <span>Total XP</span><strong>{totalXp}</strong>
          <span>Research</span><strong>{player.researchPoints}</strong>
          <span>Wins</span><strong>{player.wins}</strong>
          <span>Battles</span><strong>{player.battleCount}</strong>
          <span>Roster</span><strong>{rosterAgents.length} owned</strong>
          <span>Squad</span><strong>{squadAgents.length}/4 active</strong>
        </div>
      </div>
    </PokemonFrame>

    <PokemonFrame variant="dark" padding="16px">
      <div class="panel">
        <div class="panel-head">
          <div>
            <p class="eyebrow">NEXT MATCH</p>
            <h2>Deployment Checklist</h2>
          </div>
          <span class="chip cyan">{game.prototypeScope.regimeCount} regimes</span>
        </div>
        <div class="list">
          <div>
            <span>Active squad</span>
            <strong>{squadAgents.map((agent) => agent.name).join(' / ') || 'No squad selected'}</strong>
          </div>
          <div>
            <span>Selected eval</span>
            <strong>{selectedScenario.label} · {selectedScenario.symbol} · {selectedScenario.timeframe}</strong>
          </div>
          <div>
            <span>Evolution ready</span>
            <strong>{evolutionReady.length} units</strong>
          </div>
          <div>
            <span>Simulator mode</span>
            <strong>{game.prototypeScope.simulatorOnly ? 'Enabled' : 'Disabled'}</strong>
          </div>
        </div>
      </div>
    </PokemonFrame>
  </section>

  <section class="section">
    <div class="section-head">
      <div>
        <p class="eyebrow">ACTIVE SQUAD</p>
        <h2>4-Agent Deployment Board</h2>
      </div>
      <a href="/team">Adjust slots</a>
    </div>

    <div class="squad-grid">
      {#each squadAgents as agent (agent.id)}
        {@const entry = aimonDexById[agent.speciesId]}
        {#if entry}
          <PokemonFrame variant="dark" padding="14px">
            <a class="squad-card" href={`/agent/${agent.id}`} style={`--card-color:${entry.color}; --card-accent:${entry.accent};`}>
              <div class="squad-art">
                <span>{agent.name.slice(0, 2).toUpperCase()}</span>
              </div>
              <div class="squad-meta">
                <span>{entry.dexNo} · LVL {agent.level}</span>
                <strong>{agent.name}</strong>
                <p>{agent.loadout.retrainingPath}</p>
              </div>
              <div class="signals">
                {#each agent.loadout.indicators.slice(0, 2) as indicator}
                  <span>{indicator}</span>
                {/each}
              </div>
            </a>
          </PokemonFrame>
        {/if}
      {/each}
    </div>
  </section>

  <section class="section bottom-grid">
    <PokemonFrame variant="dark" padding="16px">
      <div class="panel">
        <div class="panel-head">
          <div>
            <p class="eyebrow">ROSTER WATCH</p>
            <h2>Owned Agents</h2>
          </div>
          <a href="/roster">View all</a>
        </div>
        <div class="roster-strip">
          {#each rosterAgents.slice(0, 4) as agent (agent.id)}
            {@const entry = aimonDexById[agent.speciesId]}
            {#if entry}
              <a class="mini-card" href={`/agent/${agent.id}`} style={`--mini-color:${entry.color}; --mini-accent:${entry.accent};`}>
                <div class="mini-avatar">
                  <span>{agent.name.slice(0, 2).toUpperCase()}</span>
                </div>
                <strong>{agent.name}</strong>
                <small>{agent.role}</small>
              </a>
            {/if}
          {/each}
        </div>
      </div>
    </PokemonFrame>

    <PokemonFrame variant="dark" padding="16px">
      <div class="panel">
        <div class="panel-head">
          <div>
            <p class="eyebrow">GROWTH WATCH</p>
            <h2>Lab Alerts</h2>
          </div>
          <a href="/lab">Open lab</a>
        </div>
        <div class="alerts">
          <div class="alert-card ready">
            <span>Evolution Ready</span>
            <strong>{evolutionReady.map((agent) => agent.name).join(', ') || 'No units ready yet'}</strong>
          </div>
          <div class="alert-card">
            <span>Current Focus</span>
            <strong>{featuredAgent ? featuredAgent.loadout.focusSkill : 'Select a lead agent'}</strong>
          </div>
          <div class="alert-card">
            <span>Next Step</span>
            <strong>{squadAgents.length < 4 ? 'Complete your 4-agent squad' : 'Enter battle and level the squad'}</strong>
          </div>
        </div>
      </div>
    </PokemonFrame>
  </section>
</div>

<style>
  .page {
    display: grid;
    gap: 18px;
    padding: 18px;
  }

  .hero-grid,
  .dashboard-grid,
  .bottom-grid {
    display: grid;
    gap: 16px;
  }

  .hero-grid {
    grid-template-columns: minmax(0, 1.4fr) 320px;
    align-items: stretch;
  }

  .hero-copy {
    display: grid;
    gap: 14px;
  }

  .eyebrow {
    margin: 0;
    color: var(--cyan);
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
    letter-spacing: 0.12em;
  }

  h1,
  h2 {
    margin: 0;
    font-family: 'Orbitron', sans-serif;
  }

  h1 {
    font-size: clamp(40px, 7vw, 72px);
    line-height: 0.9;
    max-width: 11ch;
  }

  h2 {
    font-size: 28px;
  }

  .lede {
    margin: 0;
    max-width: 66ch;
    color: var(--text-1);
    font-size: 16px;
    line-height: 1.45;
  }

  .hero-actions,
  .signals {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
  }

  .hero-actions a,
  .section-head a,
  .panel-head a,
  .mini-card,
  .chip {
    text-decoration: none;
  }

  .hero-actions a,
  .section-head a,
  .panel-head a {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-height: 42px;
    padding: 0 14px;
    border-radius: 14px;
    border: 1px solid rgba(255,255,255,0.1);
    background: rgba(255,255,255,0.04);
    color: var(--text-0);
  }

  .featured {
    display: grid;
    grid-template-rows: minmax(0, 1fr) auto;
    gap: 14px;
  }

  .sprite-shell {
    min-height: 280px;
    display: grid;
    place-items: center;
    border-radius: 28px;
    background:
      radial-gradient(circle at 50% 35%, rgba(255,255,255,0.09), transparent 54%),
      linear-gradient(180deg, rgba(255,255,255,0.05), rgba(255,255,255,0.01));
    border: 1px solid rgba(255,255,255,0.08);
  }

  .sprite {
    display: grid;
    place-items: center;
    width: 200px;
    aspect-ratio: 1;
    border-radius: 44px;
    background:
      radial-gradient(circle at 35% 30%, var(--hero-color), transparent 48%),
      linear-gradient(145deg, rgba(255,255,255,0.08), rgba(0,0,0,0.24)),
      var(--hero-accent);
    border: 1px solid rgba(255,255,255,0.1);
    box-shadow: 0 30px 50px rgba(0, 0, 0, 0.26);
  }

  .sprite span {
    font-family: 'Orbitron', sans-serif;
    font-size: 56px;
    font-weight: 700;
    letter-spacing: 0.08em;
  }

  .featured-meta {
    display: grid;
    gap: 6px;
  }

  .featured-meta span,
  .featured-meta small,
  .stat-grid span,
  .list span {
    color: var(--text-2);
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
    letter-spacing: 0.08em;
  }

  .featured-meta strong,
  .list strong {
    font-size: 22px;
  }

  .dashboard-grid,
  .bottom-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .panel {
    display: grid;
    gap: 14px;
  }

  .panel-head,
  .section-head {
    display: flex;
    justify-content: space-between;
    gap: 14px;
    align-items: end;
  }

  .chip {
    display: inline-flex;
    align-items: center;
    min-height: 28px;
    padding: 0 10px;
    border-radius: 999px;
    border: 1px solid rgba(255,255,255,0.08);
    background: rgba(255,255,255,0.04);
    color: var(--text-0);
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
  }

  .chip.cyan {
    color: #9cefff;
    border-color: rgba(0, 229, 255, 0.2);
    background: rgba(0, 229, 255, 0.08);
  }

  .stat-grid,
  .list {
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 12px 14px;
  }

  .section {
    display: grid;
    gap: 14px;
  }

  .squad-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 14px;
  }

  .squad-card {
    display: grid;
    gap: 12px;
    color: var(--text-0);
    text-decoration: none;
  }

  .squad-art {
    display: grid;
    place-items: center;
    min-height: 120px;
    border-radius: 20px;
    background:
      radial-gradient(circle at 35% 30%, var(--card-color), transparent 48%),
      linear-gradient(145deg, rgba(255,255,255,0.08), rgba(0,0,0,0.26)),
      var(--card-accent);
    border: 1px solid rgba(255,255,255,0.08);
  }

  .squad-art span,
  .mini-avatar span {
    font-family: 'Orbitron', sans-serif;
    font-size: 30px;
    font-weight: 700;
    letter-spacing: 0.08em;
  }

  .squad-meta {
    display: grid;
    gap: 4px;
  }

  .squad-meta span,
  .squad-meta p,
  .mini-card small {
    color: var(--text-2);
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
    letter-spacing: 0.08em;
  }

  .squad-meta strong,
  .mini-card strong {
    font-size: 22px;
    line-height: 0.95;
  }

  .squad-meta p {
    margin: 0;
  }

  .signals span {
    padding: 6px 9px;
    border-radius: 999px;
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.08);
    font-size: 12px;
  }

  .roster-strip {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
  }

  .mini-card {
    display: grid;
    gap: 8px;
    padding: 12px;
    border-radius: 18px;
    border: 1px solid rgba(255,255,255,0.08);
    background: rgba(255,255,255,0.03);
    color: var(--text-0);
    text-align: left;
  }

  .mini-avatar {
    display: grid;
    place-items: center;
    min-height: 92px;
    border-radius: 18px;
    background:
      radial-gradient(circle at 35% 30%, var(--mini-color), transparent 48%),
      linear-gradient(145deg, rgba(255,255,255,0.08), rgba(0,0,0,0.26)),
      var(--mini-accent);
  }

  .alerts {
    display: grid;
    gap: 10px;
  }

  .alert-card {
    display: grid;
    gap: 6px;
    padding: 12px;
    border-radius: 18px;
    border: 1px solid rgba(255,255,255,0.08);
    background: rgba(255,255,255,0.03);
  }

  .alert-card.ready {
    border-color: rgba(255, 215, 0, 0.2);
    background: rgba(255, 215, 0, 0.06);
  }

  .alert-card span {
    color: var(--text-2);
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
    letter-spacing: 0.08em;
  }

  .alert-card strong {
    font-size: 16px;
    line-height: 1.25;
  }

  @media (max-width: 980px) {
    .hero-grid,
    .dashboard-grid,
    .bottom-grid {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 720px) {
    .page {
      padding: 14px;
    }

    .roster-strip {
      grid-template-columns: 1fr;
    }
  }
</style>
