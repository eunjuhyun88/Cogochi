<script lang="ts">
  import { aimonDexById } from '$lib/aimon/data/aimonDex';
  import { TYPE_COLORS } from '$lib/aimon/data/typeChart';
  import type { AiMonType, BattleState } from '$lib/aimon/types';
  import PokemonFrame from '../shared/PokemonFrame.svelte';

  const { battle, onFocusTap } = $props<{
    battle: BattleState;
    onFocusTap: (instanceId: string) => void;
  }>();

  function getOrbColor(type: AiMonType): string {
    return TYPE_COLORS[type];
  }
</script>

<PokemonFrame variant="dark" padding="14px">
  <section class="arena-shell">
    <div class="arena-banner">{battle.eventBanner}</div>
    <div class="arena-core">
      <div class="team-column">
        <span class="side-label">MY AGENTS</span>
        {#each battle.playerTeam as agent (agent.instanceId)}
          {@const entry = aimonDexById[agent.dexId]}
          <button class="agent-chip" type="button" onclick={() => onFocusTap(agent.instanceId)}>
            <span class="state-ring" style={`--ring-color:${entry?.color ?? '#00e5ff'};`} class:focused={agent.focusTapUntil > Date.now()}></span>
            <span class="agent-main">
              <strong>{agent.name}</strong>
              <small>{agent.role ?? 'UNSET'} · {agent.state}{agent.currentTarget ? ` · ${agent.currentTarget}` : ''}</small>
              <small>{agent.plannedAction} · {Math.round(agent.recentAccuracy * 100)}% confidence lane</small>
              <small>{agent.readout}</small>
              <small>{agent.decisionHint}</small>
            </span>
            <span class="intel-stack">
              <small>MEM {Math.round(agent.memoryScore * 100)}%</small>
              <small>D{agent.activeDataSourceCount} · T{agent.activeToolCount}</small>
            </span>
            {#if battle.phase === 'EVIDENCE' && battle.focusTapCharges > 0}
              <span class="focus-tag">FOCUS</span>
            {/if}
          </button>
        {/each}
      </div>

      <div class="orb-lane">
        <div class="consensus-badge">
          <span>SIGNAL CONSENSUS</span>
          <strong>{battle.consensus}%</strong>
        </div>
        <div class="orb-board">
          {#each battle.orbs as orb (orb.id)}
            <span
              class="orb"
              title={`${orb.type} ${orb.kind}`}
              style={`left:${orb.x}%; top:${orb.y}%; --orb-color:${getOrbColor(orb.type)}; --orb-size:${14 + orb.strength * 0.18}px;`}
            >
              {orb.kind === 'LONG' ? '▲' : orb.kind === 'SHORT' ? '▼' : orb.kind === 'RISK' ? '!' : '•'}
            </span>
          {/each}
        </div>
        <div class="interaction-feed">
          {#if battle.interactions.length === 0}
            <span>No active clashes yet</span>
          {:else}
            {#each battle.interactions as interaction (interaction.id)}
              <span>{interaction.kind} · {interaction.label}</span>
            {/each}
          {/if}
        </div>
      </div>

      <div class="team-column enemy">
        <span class="side-label">RIVAL SQUAD</span>
        {#each battle.enemyTeam as agent (agent.instanceId)}
          {@const entry = aimonDexById[agent.dexId]}
          <div class="agent-chip enemy">
            <span class="state-ring" style={`--ring-color:${entry?.color ?? '#ff6b35'};`}></span>
            <span class="agent-main">
              <strong>{agent.name}</strong>
              <small>{agent.state}</small>
            </span>
          </div>
        {/each}
      </div>
    </div>
  </section>
</PokemonFrame>

<style>
  .arena-shell {
    display: grid;
    gap: 14px;
  }

  .arena-banner {
    padding: 10px 14px;
    border-radius: 12px;
    background: linear-gradient(90deg, rgba(255,107,53,0.22), rgba(0,229,255,0.14));
    border: 1px solid rgba(255,255,255,0.06);
    color: #ffe7dd;
    font-family: 'JetBrains Mono', monospace;
    font-size: 12px;
  }

  .arena-core {
    display: grid;
    grid-template-columns: minmax(220px, 280px) 1fr minmax(220px, 280px);
    gap: 14px;
    min-height: 420px;
  }

  .team-column {
    display: grid;
    align-content: start;
    gap: 10px;
  }

  .side-label {
    color: var(--text-2);
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
    letter-spacing: 0.08em;
  }

  .agent-chip {
    position: relative;
    display: flex;
    align-items: center;
    gap: 12px;
    min-height: 66px;
    padding: 10px 12px 10px 18px;
    border-radius: 14px;
    border: 1px solid rgba(255,255,255,0.08);
    background: rgba(10, 18, 34, 0.94);
    color: var(--text-0);
    text-align: left;
  }

  .agent-chip.enemy {
    opacity: 0.88;
  }

  .state-ring {
    position: absolute;
    left: 8px;
    width: 8px;
    height: 44px;
    border-radius: 999px;
    background: var(--ring-color);
    box-shadow: 0 0 12px var(--ring-color);
  }

  .state-ring.focused {
    animation: pulse 1s ease-in-out infinite;
  }

  .agent-main {
    display: grid;
    gap: 4px;
    min-width: 0;
  }

  .agent-main strong {
    font-size: 15px;
  }

  .agent-main small {
    color: var(--text-1);
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
    line-height: 1.35;
  }

  .intel-stack {
    margin-left: auto;
    display: grid;
    gap: 4px;
    justify-items: end;
    min-width: 64px;
  }

  .intel-stack small {
    color: #9cefff;
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px;
    letter-spacing: 0.06em;
  }

  .focus-tag {
    margin-left: auto;
    padding: 6px 9px;
    border-radius: 999px;
    background: rgba(0,229,255,0.12);
    color: #8ff3ff;
    font-size: 10px;
    font-weight: 800;
    letter-spacing: 0.08em;
  }

  .orb-lane {
    display: grid;
    grid-template-rows: auto 1fr auto;
    gap: 12px;
    border-radius: 18px;
    border: 1px solid rgba(255,255,255,0.08);
    background:
      radial-gradient(circle at center, rgba(0,229,255,0.1), transparent 35%),
      linear-gradient(180deg, rgba(14,24,46,0.92), rgba(5,10,20,0.96));
    padding: 16px;
  }

  .consensus-badge {
    display: flex;
    align-items: end;
    justify-content: space-between;
    gap: 12px;
    color: #a7badc;
    font-family: 'JetBrains Mono', monospace;
    font-size: 12px;
  }

  .consensus-badge strong {
    color: var(--green);
    font-size: 26px;
  }

  .orb-board {
    position: relative;
    min-height: 290px;
    border-radius: 16px;
    border: 1px dashed rgba(0,229,255,0.12);
    overflow: hidden;
  }

  .orb {
    position: absolute;
    display: grid;
    place-items: center;
    width: var(--orb-size);
    height: var(--orb-size);
    transform: translate(-50%, -50%);
    border-radius: 50%;
    background: radial-gradient(circle at 35% 35%, #ffffff, var(--orb-color));
    box-shadow: 0 0 18px var(--orb-color);
    color: #021018;
    font-size: 11px;
    font-weight: 800;
  }

  .interaction-feed {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .interaction-feed span {
    padding: 6px 8px;
    border-radius: 999px;
    background: rgba(255,255,255,0.06);
    color: #b3c3de;
    font-size: 11px;
  }

  @keyframes pulse {
    0%, 100% { transform: scaleY(1); opacity: 1; }
    50% { transform: scaleY(0.85); opacity: 0.6; }
  }

  @media (max-width: 1100px) {
    .arena-core {
      grid-template-columns: 1fr;
    }
  }
</style>
