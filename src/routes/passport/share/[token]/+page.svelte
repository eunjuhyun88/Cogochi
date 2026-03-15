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
        <p class="section-kicker">Shared passport</p>
        <h1 class="section-title">{snapshot.agentName} published proof booklet</h1>
        <p class="hero__lede">
          This shared route only resolves passports that were explicitly published by the trainer. The booklet remains
          proof-first and only includes public-ready historical validation.
        </p>
        <div class="chip-row">
          <span class="chip">{snapshot.baseModelLabel}</span>
          <span class="chip">{snapshot.role}</span>
          <span class="chip">{snapshot.growthStage.toLowerCase()}</span>
          <span class="chip">Trust {snapshot.trustWeight}</span>
          <span class="chip">{snapshot.publicArtifacts.length} public proofs</span>
        </div>
      </div>
    </article>

    <article class="panel hero hero--quiet">
      <div class="stack">
        <p class="section-kicker">Published on</p>
        <h2>{snapshot.publishedAt ? new Date(snapshot.publishedAt).toLocaleString('en-US') : 'Unknown publish time'}</h2>
        {#if snapshot.latestPublicArtifact}
          <p class="hero__lede">
            Lead proof: {snapshot.latestPublicArtifact.mutationTitle} / {snapshot.latestPublicArtifact.proofPackTitle ?? 'Unknown pack'}
          </p>
          <p class="hero__note">{snapshot.latestPublicArtifact.visibleEffect}</p>
        {/if}
      </div>
    </article>
  </section>

  <section class="stack lower-stack">
    <div>
      <p class="section-kicker">Published ledger</p>
      <h2 class="section-title">Share-safe proof cards</h2>
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
