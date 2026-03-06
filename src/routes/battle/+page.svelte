<script lang="ts">
  import { onDestroy, onMount } from 'svelte';
  import type { AiMonDexEntry } from '$lib/aimon/types';
  import { AIMON_DEX, aimonDexById } from '$lib/aimon/data/aimonDex';
  import BattleArena from '../../components/aimon/BattleArena.svelte';
  import PhaseBar from '../../components/aimon/PhaseBar.svelte';
  import PokemonFrame from '../../components/shared/PokemonFrame.svelte';
  import { battleStore, focusTap, restartBattle, startBattle, stopBattle } from '$lib/aimon/stores/battleStore';
  import { gameStore, setScreen } from '$lib/aimon/stores/gameStore';
  import { playerStore } from '$lib/aimon/stores/playerStore';

  let battle = $derived($battleStore);
  let player = $derived($playerStore);
  let game = $derived($gameStore);
  let selectedTeam = $derived(
    player.teamDexIds.map((id) => aimonDexById[id]).filter((entry): entry is AiMonDexEntry => Boolean(entry))
  );

  onMount(() => {
    setScreen('battle');
    startBattle();
  });

  onDestroy(() => {
    stopBattle();
  });
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
        전투 화면은 증명 단계입니다. 여기서는 squad readout, phase, consensus, focus tap 결과가 빠르게 읽혀야 합니다.
      </p>
    </div>
    <div class="hero-actions">
      <a href="/roster">Roster</a>
      <a href="/team">Squad Setup</a>
      <button type="button" onclick={() => restartBattle()}>Restart Match</button>
    </div>
  </section>

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
            {#each selectedTeam as entry (entry.id)}
              <span style:color={entry.color}>{entry.dexNo} {entry.name}</span>
            {/each}
          </div>
        </section>
      </PokemonFrame>

      <PokemonFrame variant="dark" padding="14px">
        <section class="panel">
          <h2>Trainer Progress</h2>
          <div class="scope-grid">
            <span>Total XP</span><strong>{player.xp}</strong>
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
