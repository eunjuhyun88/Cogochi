<script lang="ts">
  import { onMount } from 'svelte';
  import PokemonFrame from '../../components/shared/PokemonFrame.svelte';
  import type { AiMonDexEntry } from '$lib/aimon/types';
  import { aimonDexById } from '$lib/aimon/data/aimonDex';
  import { getEvolutionPreview } from '$lib/aimon/engine/evolutionSystem';
  import { setScreen } from '$lib/aimon/stores/gameStore';
  import { playerStore } from '$lib/aimon/stores/playerStore';

  let player = $derived($playerStore);
  let selectedTeam = $derived(
    player.teamDexIds.map((id) => aimonDexById[id]).filter((entry): entry is AiMonDexEntry => Boolean(entry))
  );

  onMount(() => {
    setScreen('lab');
  });
</script>

<svelte:head>
  <title>AI MON Growth Lab</title>
</svelte:head>

<div class="page">
  <header>
    <p class="eyebrow">GROWTH LAB</p>
    <h1>Raise Your Own Agents</h1>
    <p>Prototype 단계에서는 전체 XP를 기준으로 진화 가능 여부를 미리 보여줍니다.</p>
  </header>

  <PokemonFrame variant="dark" padding="14px">
    <div class="stats-grid">
      <span>Total XP</span><strong>{player.xp}</strong>
      <span>Research Points</span><strong>{player.researchPoints}</strong>
      <span>Battles</span><strong>{player.battleCount}</strong>
      <span>Wins</span><strong>{player.wins}</strong>
    </div>
  </PokemonFrame>

  <section class="cards">
    {#each selectedTeam as entry (entry.id)}
      {@const evo = getEvolutionPreview(entry.id, player.xp)}
      <PokemonFrame variant={evo.canEvolve ? 'accent' : 'dark'} padding="14px">
        <article class="lab-card">
          <div>
            <span class="dex-no">{entry.dexNo}</span>
            <h2 style:color={entry.color}>{entry.name}</h2>
            <p>{entry.description}</p>
          </div>
          <div class="evo-meta">
            <span>Current XP</span><strong>{evo.currentXp}</strong>
            <span>Required XP</span><strong>{evo.requiredXp ?? '—'}</strong>
            <span>Next Form</span><strong>{evo.evolvesTo ?? 'Final Form'}</strong>
            <span>Status</span><strong>{evo.canEvolve ? 'READY' : 'TRAINING'}</strong>
          </div>
        </article>
      </PokemonFrame>
    {/each}
  </section>
</div>

<style>
  .page {
    display: grid;
    gap: 18px;
    padding: 18px;
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

  .stats-grid,
  .evo-meta {
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 10px 14px;
    font-family: 'JetBrains Mono', monospace;
    font-size: 12px;
  }

  .stats-grid span,
  .evo-meta span,
  .lab-card p,
  .dex-no {
    color: var(--text-2);
  }

  .cards {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 14px;
  }

  .lab-card {
    display: grid;
    gap: 14px;
  }

  .lab-card h2 {
    margin: 4px 0 8px;
  }
</style>
