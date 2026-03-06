<script lang="ts">
  import { onMount } from 'svelte';
  import TeamBuilder from '../../components/aimon/TeamBuilder.svelte';
  import { AIMON_DEX } from '$lib/aimon/data/aimonDex';
  import { setScreen } from '$lib/aimon/stores/gameStore';
  import { playerStore, toggleTeamDexId } from '$lib/aimon/stores/playerStore';

  let player = $derived($playerStore);

  onMount(() => {
    setScreen('team');
  });
</script>

<svelte:head>
  <title>AI MON Team Builder</title>
</svelte:head>

<div class="page">
  <header>
    <p class="eyebrow">TEAM BUILDER</p>
    <h1>Build Your 4-Mon Squad</h1>
    <p>현재 선택: {player.teamDexIds.join(', ') || 'none'} · battle 화면에서 바로 이 조합으로 들어갑니다.</p>
  </header>

  <TeamBuilder entries={AIMON_DEX} selectedIds={player.teamDexIds} onToggle={toggleTeamDexId} />
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
</style>
