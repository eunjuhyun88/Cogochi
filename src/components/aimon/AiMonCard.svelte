<script lang="ts">
  import PokemonFrame from '../shared/PokemonFrame.svelte';
  import type { AiMonDexEntry } from '$lib/aimon/types';

  const { entry, selected = false, onSelect = undefined } = $props<{
    entry: AiMonDexEntry;
    selected?: boolean;
    onSelect?: ((id: string) => void) | undefined;
  }>();
</script>

<button class="card-button" type="button" onclick={() => onSelect?.(entry.id)}>
  <PokemonFrame variant={selected ? 'accent' : 'default'} padding="10px">
    <div class="aimon-card" class:selected>
      <div class="card-top">
        <span class="dex-no">{entry.dexNo}</span>
        <span class="type-pill" style:color={entry.color}>{entry.type}</span>
      </div>
      <div class="avatar" style={`--card-color:${entry.color}; --card-accent:${entry.accent};`}>
        <span>{entry.name.slice(0, 2).toUpperCase()}</span>
      </div>
      <div class="meta">
        <strong>{entry.name}</strong>
        <p>{entry.description}</p>
      </div>
      <div class="stats">
        <span>DET {entry.baseStats.detection}</span>
        <span>PRED {entry.baseStats.prediction}</span>
        <span>RISK {entry.baseStats.risk}</span>
      </div>
    </div>
  </PokemonFrame>
</button>

<style>
  .card-button {
    width: 100%;
    background: transparent;
    border: 0;
    padding: 0;
    cursor: pointer;
    text-align: left;
  }

  .aimon-card {
    display: grid;
    gap: 10px;
    color: var(--text-0);
  }

  .card-top,
  .stats {
    display: flex;
    justify-content: space-between;
    gap: 8px;
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
  }

  .dex-no {
    color: var(--text-2);
  }

  .type-pill {
    font-weight: 700;
  }

  .avatar {
    display: grid;
    place-items: center;
    aspect-ratio: 1;
    border-radius: 16px;
    background:
      radial-gradient(circle at 30% 30%, var(--card-color), transparent 45%),
      linear-gradient(145deg, rgba(255,255,255,0.08), rgba(0,0,0,0.28)),
      var(--card-accent);
    border: 1px solid rgba(255,255,255,0.08);
    min-height: 92px;
    font-family: 'Bebas Neue', 'Orbitron', sans-serif;
    font-size: 26px;
    letter-spacing: 1px;
  }

  .meta strong {
    display: block;
    font-size: 18px;
    margin-bottom: 4px;
  }

  .meta p {
    margin: 0;
    color: var(--text-1);
    font-size: 12px;
    line-height: 1.45;
  }

  .stats {
    color: #b9c8e8;
  }
</style>

