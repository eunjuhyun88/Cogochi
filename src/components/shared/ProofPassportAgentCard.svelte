<script lang="ts">
  import PixelSprite from '$components/shared/PixelSprite.svelte';
  import { careStateLabels, growthStageLabels } from '$lib/data/seed';
  import type { OwnedAgent, ProofPassportSummary } from '$lib/types';

  let { agent, summary }: { agent: OwnedAgent; summary: ProofPassportSummary } = $props();

  const featured = $derived(summary.latestPublicArtifact ?? summary.latestArtifact);
  const averageTrustDeltaLabel = $derived(
    summary.averageTrustDelta >= 0 ? `+${summary.averageTrustDelta}` : `${summary.averageTrustDelta}`,
  );
</script>

<a class="passport-card panel" href={`/passport/${agent.id}`}>
  <div class="passport-card__header">
    <div class="passport-card__sprite">
      <PixelSprite {agent} size={82} />
    </div>
    <div>
      <p class="section-kicker">{agent.baseModelLabel}</p>
      <h3>{agent.name}</h3>
      <p>{agent.role} / {growthStageLabels[agent.growthStage]} / {careStateLabels[agent.careState]}</p>
    </div>
  </div>

  <div class="chip-row">
    <span class="chip">{summary.publicArtifacts} public proofs</span>
    <span class="chip">{summary.acceptedPublicArtifacts} accepted public</span>
    <span class="chip">{summary.totalArtifacts} total runs</span>
    <span class="chip">Avg trust {averageTrustDeltaLabel}</span>
  </div>

  {#if featured}
    <p class="passport-card__headline">
      {featured.publicReady ? 'Public booklet lead' : 'Latest internal proof'}: {featured.artifact.mutationTitle}
    </p>
    <p class="passport-card__meta">{featured.artifact.proofPackTitle ?? 'No pack'} / {featured.artifact.frameTitle}</p>
    <p class="passport-card__meta">{featured.artifact.visibleEffect}</p>
  {:else}
    <p class="passport-card__headline">No proof booklet yet.</p>
    <p class="passport-card__meta">Run the public passport gauntlet to surface a readable proof story for this creature.</p>
  {/if}
</a>

<style>
  .passport-card {
    padding: 18px;
    display: grid;
    gap: 14px;
  }

  .passport-card__header {
    display: grid;
    grid-template-columns: 90px 1fr;
    gap: 14px;
    align-items: center;
  }

  .passport-card__sprite {
    width: 82px;
    height: 82px;
    display: grid;
    place-items: center;
    padding: 8px;
    border-radius: 22px;
    background: rgba(238, 243, 216, 0.92);
    border: 1px solid rgba(74, 84, 66, 0.18);
  }

  .passport-card h3,
  .passport-card p {
    margin: 0;
  }

  .passport-card__headline {
    font-weight: 600;
  }

  .passport-card__meta {
    color: var(--text-soft);
    line-height: 1.55;
  }
</style>
