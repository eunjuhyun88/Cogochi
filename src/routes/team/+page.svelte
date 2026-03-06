<script lang="ts">
  import { onMount } from 'svelte';
  import TeamBuilder from '../../components/aimon/TeamBuilder.svelte';
  import PokemonFrame from '../../components/shared/PokemonFrame.svelte';
  import { setScreen } from '$lib/aimon/stores/gameStore';
  import { rosterStore } from '$lib/aimon/stores/rosterStore';
  import { squadStore, setSquadTacticPreset, toggleSquadAgent } from '$lib/aimon/stores/squadStore';

  let roster = $derived($rosterStore);
  let squad = $derived($squadStore);
  let selectedNames = $derived(
    squad.activeSquad.memberAgentIds
      .map((id) => roster.agents.find((agent) => agent.id === id)?.name)
      .filter((name): name is string => Boolean(name))
  );
  let roleSlots = $derived([
    ['SCOUT', squad.activeSquad.roleMap.scout],
    ['ANALYST', squad.activeSquad.roleMap.analyst],
    ['RISK', squad.activeSquad.roleMap.risk],
    ['EXECUTOR', squad.activeSquad.roleMap.executor]
  ] as const);

  onMount(() => {
    setScreen('team');
  });
</script>

<svelte:head>
  <title>AI MON Team Builder</title>
</svelte:head>

<div class="page">
  <header class="header">
    <div>
      <p class="eyebrow">TEAM BUILDER</p>
      <h1>Build Your 4-Mon Squad</h1>
      <p>현재 선택: {selectedNames.join(', ') || 'none'} · battle 화면에서 바로 이 조합으로 들어갑니다.</p>
    </div>
    <div class="header-actions">
      <a href="/roster">Roster</a>
      <a href="/battle">Battle</a>
      <select value={squad.activeSquad.tacticPreset} onchange={(event) => setSquadTacticPreset((event.currentTarget as HTMLSelectElement).value as typeof squad.activeSquad.tacticPreset)}>
        <option value="BALANCED">BALANCED</option>
        <option value="TREND">TREND</option>
        <option value="DEFENSIVE">DEFENSIVE</option>
        <option value="EXPERIMENTAL">EXPERIMENTAL</option>
      </select>
    </div>
  </header>

  <section class="slot-grid">
    {#each roleSlots as [label, agentId]}
      {@const assigned = agentId ? roster.agents.find((agent) => agent.id === agentId) ?? null : null}
      <PokemonFrame variant={assigned ? 'accent' : 'dark'} padding="14px">
        <article class="slot-card">
          <span>{label}</span>
          <strong>{assigned?.name ?? 'Empty Slot'}</strong>
          <small>{assigned ? `${assigned.loadout.readout} · ${assigned.speciesId}` : 'Select an owned agent with this role.'}</small>
          {#if assigned}
            <a href={`/agent/${assigned.id}`}>Open Console</a>
          {/if}
        </article>
      </PokemonFrame>
    {/each}
  </section>

  <TeamBuilder agents={roster.agents} selectedIds={squad.activeSquad.memberAgentIds} onToggle={toggleSquadAgent} />
</div>

<style>
  .page {
    display: grid;
    gap: 18px;
    padding: 18px;
  }

  .header {
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
    font-size: clamp(34px, 5vw, 56px);
    line-height: 0.96;
    font-family: 'Bebas Neue', 'Orbitron', sans-serif;
  }

  p {
    margin: 0;
    color: var(--text-1);
  }

  .header-actions,
  .slot-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
  }

  .header-actions a,
  .header-actions select,
  .slot-card a {
    display: inline-flex;
    align-items: center;
    min-height: 40px;
    padding: 0 12px;
    border-radius: 14px;
    border: 1px solid rgba(255,255,255,0.1);
    background: rgba(255,255,255,0.04);
    color: var(--text-0);
    text-decoration: none;
  }

  .slot-grid {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 14px;
  }

  .slot-card {
    display: grid;
    gap: 8px;
  }

  .slot-card span,
  .slot-card small {
    color: var(--text-2);
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
    letter-spacing: 0.08em;
  }

  .slot-card strong {
    font-size: 20px;
  }

  @media (max-width: 960px) {
    .slot-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  @media (max-width: 720px) {
    .header {
      flex-direction: column;
      align-items: stretch;
    }

    .slot-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
