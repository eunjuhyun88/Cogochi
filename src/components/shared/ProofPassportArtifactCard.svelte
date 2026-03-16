<script lang="ts">
  import type { ProofArtifactView } from '$lib/types';

  let { entry, featured = false }: { entry: ProofArtifactView; featured?: boolean } = $props();

  const artifact = $derived(entry.artifact);
  const trustDeltaLabel = $derived(artifact.trustDelta >= 0 ? `+${artifact.trustDelta}` : `${artifact.trustDelta}`);
</script>

<article class:featured class={`artifact-card artifact-card--${artifact.trainerVerdict.toLowerCase()}`}>
  <div class="artifact-card__top">
    <div>
      <p class="section-kicker">{artifact.frameDateLabel ?? 'Undated frame'}</p>
      <h3>{artifact.mutationTitle}</h3>
    </div>
    <div class="chip-row artifact-card__chips">
      <span class={`chip chip--tone chip--${artifact.trainerVerdict.toLowerCase()}`}>{artifact.trainerVerdict.toLowerCase()}</span>
      <span class="chip">{entry.publicReady ? 'public-ready' : 'private proof'}</span>
      {#if entry.proofMode}
        <span class="chip">{entry.proofMode.toLowerCase()}</span>
      {/if}
      <span class="chip">{artifact.battleOutcome.toLowerCase()}</span>
    </div>
  </div>

  <p class="artifact-card__lede">{artifact.visibleEffect}</p>

  <div class="artifact-card__meta">
    <p><strong>Pack</strong> {artifact.proofPackTitle ?? 'Unbound proof pack'}</p>
    <p><strong>Frame</strong> {artifact.frameTitle}</p>
    <p><strong>Doctrine</strong> {artifact.doctrineTitle ?? 'No doctrine session attached'}</p>
  </div>

  <div class="chip-row">
    <span class="chip">Trust {artifact.trustBefore} -> {artifact.trustAfter} ({trustDeltaLabel})</span>
    <span class="chip">{artifact.growthStageBefore.toLowerCase()} -> {artifact.growthStageAfter.toLowerCase()}</span>
    <span class="chip">{artifact.entryGate.toLowerCase()} gate</span>
  </div>

  {#if artifact.criteriaSummary.length > 0}
    <div class="chip-row">
      {#each artifact.criteriaSummary.slice(0, 4) as criterion}
        <span class="chip">{criterion}</span>
      {/each}
    </div>
  {/if}

  <p class="artifact-card__note">{artifact.mutationReason}</p>
</article>

<style>
  .artifact-card {
    padding: 18px;
    display: grid;
    gap: 12px;
    border-radius: 24px;
    border: 1px solid var(--border);
    background: rgba(255, 255, 255, 0.78);
  }

  .artifact-card.featured {
    background: linear-gradient(180deg, rgba(245, 247, 233, 0.96), rgba(255, 255, 255, 0.88));
  }

  .artifact-card__top {
    display: flex;
    gap: 12px;
    justify-content: space-between;
    align-items: flex-start;
    flex-wrap: wrap;
  }

  .artifact-card__top h3,
  .artifact-card__top p,
  .artifact-card__lede,
  .artifact-card__meta p,
  .artifact-card__note {
    margin: 0;
  }

  .artifact-card__chips {
    justify-content: flex-end;
  }

  .artifact-card__lede,
  .artifact-card__note,
  .artifact-card__meta p {
    color: var(--text-soft);
    line-height: 1.6;
  }

  .artifact-card__meta {
    display: grid;
    gap: 4px;
  }

  .artifact-card--accepted {
    border-color: rgba(52, 155, 104, 0.24);
  }

  .artifact-card--reverted {
    border-color: rgba(170, 93, 72, 0.28);
  }

  .artifact-card--quarantined {
    border-color: rgba(191, 141, 66, 0.28);
  }

  .chip--tone.chip--accepted {
    border-color: rgba(52, 155, 104, 0.24);
  }

  .chip--tone.chip--reverted {
    border-color: rgba(170, 93, 72, 0.28);
  }

  .chip--tone.chip--quarantined {
    border-color: rgba(191, 141, 66, 0.28);
  }
</style>
