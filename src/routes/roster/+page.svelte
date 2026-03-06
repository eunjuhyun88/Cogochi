<script lang="ts">
  import { onMount } from 'svelte';
  import type { AiMonDexEntry } from '$lib/aimon/types';
  import { aimonDexById } from '$lib/aimon/data/aimonDex';
  import { getTrainingProfile } from '$lib/aimon/data/trainingProfiles';
  import { getEvolutionPreview } from '$lib/aimon/engine/evolutionSystem';
  import { setScreen } from '$lib/aimon/stores/gameStore';
  import { playerStore } from '$lib/aimon/stores/playerStore';
  import AgentDetailPanel from '../../components/aimon/AgentDetailPanel.svelte';
  import RosterGrid from '../../components/aimon/RosterGrid.svelte';
  import PokemonFrame from '../../components/shared/PokemonFrame.svelte';

  let player = $derived($playerStore);
  let rosterEntries = $derived(
    player.unlockedDexIds.map((id) => aimonDexById[id]).filter((entry): entry is AiMonDexEntry => Boolean(entry))
  );

  let selectedId = $state('');

  $effect(() => {
    if (!rosterEntries.length) {
      selectedId = '';
      return;
    }

    if (!selectedId || !rosterEntries.some((entry) => entry.id === selectedId)) {
      selectedId = player.teamDexIds[0] ?? rosterEntries[0].id;
    }
  });

  let selectedEntry = $derived(rosterEntries.find((entry) => entry.id === selectedId) ?? null);
  let selectedProfile = $derived(selectedEntry ? getTrainingProfile(selectedEntry.id) : null);
  let selectedEvolution = $derived(selectedEntry ? getEvolutionPreview(selectedEntry.id, player.xp) : null);

  onMount(() => {
    setScreen('roster');
  });
</script>

<svelte:head>
  <title>AI MON Roster</title>
</svelte:head>

<div class="page">
  <header class="header">
    <div>
      <p class="eyebrow">ROSTER</p>
      <h1>Owned Agents</h1>
      <p class="lede">
        이 화면이 AIMON의 중심입니다. 개체를 고르고, readout을 보고, 다음 retraining과 squad 역할을 결정합니다.
      </p>
    </div>
    <div class="header-actions">
      <a href="/team">Squad Builder</a>
      <a href="/battle">Battle</a>
      <a href="/lab">Lab</a>
    </div>
  </header>

  <section class="summary-grid">
    <PokemonFrame variant="dark" padding="14px">
      <div class="summary">
        <span>Owned agents</span><strong>{rosterEntries.length}</strong>
        <span>In active squad</span><strong>{player.teamDexIds.length}</strong>
        <span>Evolution ready</span><strong>{rosterEntries.filter((entry) => getEvolutionPreview(entry.id, player.xp).canEvolve).length}</strong>
      </div>
    </PokemonFrame>

    <PokemonFrame variant="dark" padding="14px">
      <div class="summary">
        <span>Selected agent</span><strong>{selectedEntry?.name ?? 'None'}</strong>
        <span>Retraining</span><strong>{selectedProfile?.retrainingPath ?? '—'}</strong>
        <span>Focus skill</span><strong>{selectedProfile?.focusSkill ?? '—'}</strong>
      </div>
    </PokemonFrame>

    <PokemonFrame variant={selectedEvolution?.canEvolve ? 'accent' : 'dark'} padding="14px">
      <div class="summary">
        <span>Evolution watch</span><strong>{selectedEvolution?.canEvolve ? 'Ready now' : 'In progress'}</strong>
        <span>Required XP</span><strong>{selectedEvolution?.requiredXp ?? 'Final Form'}</strong>
        <span>Next form</span><strong>{selectedEvolution?.evolvesTo ?? 'Final Form'}</strong>
      </div>
    </PokemonFrame>
  </section>

  <section class="content-grid">
    <div class="left-column">
      <div class="section-head">
        <div>
          <p class="eyebrow">COLLECTION GRID</p>
          <h2>Signal Creatures Under Your Control</h2>
        </div>
      </div>

      <RosterGrid
        entries={rosterEntries}
        selectedId={selectedId}
        squadIds={player.teamDexIds}
        trainerXp={player.xp}
        onSelect={(id) => (selectedId = id)}
      />
    </div>

    <div class="right-column">
      <AgentDetailPanel
        entry={selectedEntry}
        trainerXp={player.xp}
        inSquad={selectedEntry ? player.teamDexIds.includes(selectedEntry.id) : false}
      />
    </div>
  </section>
</div>

<style>
  .page {
    display: grid;
    gap: 18px;
    padding: 18px;
  }

  .header,
  .section-head {
    display: flex;
    justify-content: space-between;
    gap: 16px;
    align-items: end;
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
    margin: 6px 0 0;
    font-family: 'Orbitron', sans-serif;
  }

  h1 {
    font-size: clamp(40px, 7vw, 72px);
    line-height: 0.9;
  }

  h2 {
    font-size: 28px;
  }

  .lede {
    margin: 8px 0 0;
    max-width: 64ch;
    color: var(--text-1);
    font-size: 15px;
    line-height: 1.45;
  }

  .header-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
  }

  .header-actions a {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-height: 42px;
    padding: 0 14px;
    border-radius: 14px;
    border: 1px solid rgba(255,255,255,0.1);
    background: rgba(255,255,255,0.04);
    color: var(--text-0);
    text-decoration: none;
  }

  .summary-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 14px;
  }

  .summary {
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 10px 14px;
  }

  .summary span {
    color: var(--text-2);
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
    letter-spacing: 0.08em;
  }

  .summary strong {
    font-size: 14px;
  }

  .content-grid {
    display: grid;
    grid-template-columns: minmax(0, 1.3fr) minmax(320px, 0.9fr);
    gap: 16px;
    align-items: start;
  }

  .left-column,
  .right-column {
    display: grid;
    gap: 14px;
  }

  @media (max-width: 1080px) {
    .summary-grid,
    .content-grid {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 720px) {
    .page {
      padding: 14px;
    }

    .header,
    .section-head {
      flex-direction: column;
      align-items: stretch;
    }
  }
</style>
