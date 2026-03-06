<script lang="ts">
  import PokemonFrame from '../shared/PokemonFrame.svelte';
  import { getEvolutionPreview } from '$lib/aimon/engine/evolutionSystem';
  import { getTrainingProfile } from '$lib/aimon/data/trainingProfiles';
  import type { AiMonDexEntry } from '$lib/aimon/types';

  const { entries, selectedId, squadIds, trainerXp, onSelect } = $props<{
    entries: AiMonDexEntry[];
    selectedId: string;
    squadIds: string[];
    trainerXp: number;
    onSelect: (id: string) => void;
  }>();
</script>

<section class="roster-grid">
  {#each entries as entry (entry.id)}
    {@const profile = getTrainingProfile(entry.id)}
    {@const evo = getEvolutionPreview(entry.id, trainerXp)}
    <button class="card-button" type="button" onclick={() => onSelect(entry.id)}>
      <PokemonFrame variant={selectedId === entry.id ? 'accent' : 'dark'} padding="12px">
        <article class="roster-card" class:selected={selectedId === entry.id} style={`--type-color:${entry.color}; --type-accent:${entry.accent};`}>
          <div class="card-head">
            <span class="dex-no">{entry.dexNo}</span>
            <div class="state-row">
              {#if squadIds.includes(entry.id)}
                <span class="badge squad">IN SQUAD</span>
              {/if}
              {#if evo.canEvolve}
                <span class="badge evolve">EVOLVE READY</span>
              {/if}
            </div>
          </div>

          <div class="sprite-wrap">
            <div class="sprite">
              <span>{entry.name.slice(0, 2).toUpperCase()}</span>
            </div>
          </div>

          <div class="meta">
            <div>
              <strong>{entry.name}</strong>
              <p>{profile.archetype}</p>
            </div>
            <span class="type-pill" style:color={entry.color}>{entry.type}</span>
          </div>

          <div class="readout">
            <span>READOUT</span>
            <strong>{profile.readout}</strong>
          </div>
        </article>
      </PokemonFrame>
    </button>
  {/each}
</section>

<style>
  .roster-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
    gap: 14px;
  }

  .card-button {
    width: 100%;
    padding: 0;
    border: 0;
    background: transparent;
    text-align: left;
  }

  .roster-card {
    display: grid;
    gap: 12px;
    min-height: 240px;
    transition: transform 160ms ease, filter 160ms ease;
  }

  .card-button:hover .roster-card,
  .roster-card.selected {
    transform: translateY(-2px);
    filter: brightness(1.03);
  }

  .card-head,
  .meta {
    display: flex;
    justify-content: space-between;
    gap: 10px;
    align-items: start;
  }

  .dex-no,
  .readout span {
    color: var(--text-2);
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
    letter-spacing: 0.08em;
  }

  .state-row {
    display: flex;
    flex-wrap: wrap;
    justify-content: end;
    gap: 6px;
  }

  .badge {
    padding: 3px 7px;
    border: 1px solid;
    border-radius: 999px;
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px;
    letter-spacing: 0.06em;
  }

  .badge.squad {
    border-color: rgba(0, 229, 255, 0.35);
    background: rgba(0, 229, 255, 0.08);
    color: #9cefff;
  }

  .badge.evolve {
    border-color: rgba(255, 215, 0, 0.35);
    background: rgba(255, 215, 0, 0.08);
    color: var(--yellow);
  }

  .sprite-wrap {
    position: relative;
    min-height: 120px;
    display: grid;
    place-items: center;
  }

  .sprite-wrap::before {
    content: '';
    position: absolute;
    inset: 10px 18px;
    border-radius: 24px;
    background:
      radial-gradient(circle at 50% 30%, color-mix(in srgb, var(--type-color) 48%, transparent), transparent 60%),
      linear-gradient(180deg, rgba(255,255,255,0.05), rgba(255,255,255,0.01));
    border: 1px solid rgba(255,255,255,0.06);
  }

  .sprite {
    position: relative;
    z-index: 1;
    display: grid;
    place-items: center;
    width: 110px;
    aspect-ratio: 1;
    border-radius: 26px;
    background:
      radial-gradient(circle at 35% 30%, var(--type-color), transparent 48%),
      linear-gradient(145deg, rgba(255,255,255,0.08), rgba(0,0,0,0.26)),
      var(--type-accent);
    border: 1px solid rgba(255,255,255,0.1);
    box-shadow: 0 16px 24px rgba(0, 0, 0, 0.28);
  }

  .sprite span {
    font-family: 'Orbitron', sans-serif;
    font-size: 30px;
    font-weight: 700;
    letter-spacing: 0.08em;
  }

  .meta strong {
    display: block;
    font-size: 22px;
    line-height: 0.95;
  }

  .meta p {
    margin: 6px 0 0;
    color: var(--text-1);
    font-size: 13px;
    line-height: 1.35;
  }

  .type-pill {
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
    letter-spacing: 0.08em;
    text-align: right;
  }

  .readout {
    display: grid;
    gap: 4px;
  }

  .readout strong {
    color: var(--text-0);
    font-size: 13px;
    line-height: 1.35;
  }

  @media (max-width: 720px) {
    .roster-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
