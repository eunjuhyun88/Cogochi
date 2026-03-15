<script lang="ts">
  import PageShell from '$components/shared/PageShell.svelte';
  import PublicPassportArtifactCard from '$components/shared/PublicPassportArtifactCard.svelte';
  import type { PageData } from './$types';

  let { data }: { data: PageData } = $props();

  const snapshot = $derived(data.snapshot);
</script>

<PageShell>
  <section class="grid-2">
    <article class="panel hero">
      <div class="stack">
        <p class="section-kicker">Public passport</p>
        <h1 class="section-title">{snapshot.agentName} proof booklet</h1>
        <p class="hero__lede">
          Exported from canonical `ProofArtifact` history on {new Date(snapshot.exportedAt).toLocaleString('en-US')}.
          This page only includes public-ready proof packs.
        </p>
        <div class="chip-row">
          <span class="chip">{snapshot.baseModelLabel}</span>
          <span class="chip">{snapshot.role}</span>
          <span class="chip">{snapshot.growthStage.toLowerCase()}</span>
          <span class="chip">Trust {snapshot.trustWeight}</span>
          <span class="chip">{snapshot.publicArtifacts.length} public proofs</span>
          <span class="chip">{snapshot.acceptedPublicArtifacts} accepted</span>
        </div>
        <p class="hero__note">Weak link still being trained: {snapshot.weakLink}. Recent lesson: {snapshot.recentLesson}</p>
      </div>
    </article>

    <article class="panel hero hero--quiet">
      <div class="stack">
        <p class="section-kicker">Featured proof</p>
        {#if snapshot.latestPublicArtifact}
          <h2>{snapshot.latestPublicArtifact.mutationTitle}</h2>
          <p class="hero__lede">
            {snapshot.latestPublicArtifact.proofPackTitle ?? 'Unknown pack'} / {snapshot.latestPublicArtifact.frameTitle}
          </p>
          <p class="hero__note">{snapshot.latestPublicArtifact.visibleEffect}</p>
        {:else}
          <h2>No public proof in this snapshot.</h2>
        {/if}
      </div>
    </article>
  </section>

  <section class="stack lower-stack">
    <div>
      <p class="section-kicker">Public ledger</p>
      <h2 class="section-title">Exported proof cards</h2>
    </div>
    <div class="grid-2">
      {#each snapshot.publicArtifacts as artifact}
        <PublicPassportArtifactCard {artifact} />
      {/each}
    </div>
  </section>
</PageShell>

<style>
  .hero {
    padding: 24px;
  }

  .hero h1,
  .hero h2,
  .hero p {
    margin: 0;
  }

  .hero__lede,
  .hero__note {
    color: var(--text-soft);
    line-height: 1.65;
  }

  .hero--quiet {
    background: rgba(244, 247, 238, 0.84);
  }

  .lower-stack {
    margin-top: 18px;
  }
</style>
