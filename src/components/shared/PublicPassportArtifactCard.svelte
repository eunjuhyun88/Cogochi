<script lang="ts">
  import type { PublicProofArtifact } from '$lib/types';

  let { artifact }: { artifact: PublicProofArtifact } = $props();

  const trustDeltaLabel = $derived(artifact.trustDelta >= 0 ? `+${artifact.trustDelta}` : `${artifact.trustDelta}`);
</script>

<article class={`public-card public-card--${artifact.trainerVerdict.toLowerCase()}`}>
  <div class="public-card__top">
    <div>
      <p class="section-kicker">{artifact.frameDateLabel ?? 'Undated frame'}</p>
      <h3>{artifact.mutationTitle}</h3>
    </div>
    <div class="chip-row">
      <span class="chip">{artifact.proofPackTitle ?? 'Unknown pack'}</span>
      {#if artifact.proofMode}
        <span class="chip">{artifact.proofMode.toLowerCase()}</span>
      {/if}
      <span class={`chip chip--${artifact.trainerVerdict.toLowerCase()}`}>{artifact.trainerVerdict.toLowerCase()}</span>
    </div>
  </div>
  <p class="public-card__lede">{artifact.visibleEffect}</p>
  <div class="chip-row">
    <span class="chip">{artifact.entryGate.toLowerCase()} gate</span>
    <span class="chip">{artifact.battleOutcome.toLowerCase()}</span>
    <span class="chip">Trust {trustDeltaLabel}</span>
    <span class="chip">{artifact.growthStageAfter.toLowerCase()}</span>
  </div>
  {#if artifact.criteriaSummary.length > 0}
    <div class="chip-row">
      {#each artifact.criteriaSummary.slice(0, 4) as criterion}
        <span class="chip">{criterion}</span>
      {/each}
    </div>
  {/if}
  <p class="public-card__note">{artifact.mutationReason}</p>
</article>

<style>
  .public-card {
    padding: 18px;
    display: grid;
    gap: 12px;
    border-radius: 24px;
    border: 1px solid var(--border);
    background: rgba(255, 255, 255, 0.86);
  }

  .public-card__top {
    display: flex;
    justify-content: space-between;
    gap: 12px;
    align-items: flex-start;
    flex-wrap: wrap;
  }

  .public-card__top h3,
  .public-card__top p,
  .public-card__lede,
  .public-card__note {
    margin: 0;
  }

  .public-card__lede,
  .public-card__note {
    color: var(--text-soft);
    line-height: 1.65;
  }

  .public-card--accepted {
    border-color: rgba(52, 155, 104, 0.24);
  }

  .public-card--reverted {
    border-color: rgba(170, 93, 72, 0.28);
  }

  .public-card--quarantined {
    border-color: rgba(191, 141, 66, 0.28);
  }

  .chip--accepted {
    border-color: rgba(52, 155, 104, 0.24);
  }

  .chip--reverted {
    border-color: rgba(170, 93, 72, 0.28);
  }

  .chip--quarantined {
    border-color: rgba(191, 141, 66, 0.28);
  }
</style>
