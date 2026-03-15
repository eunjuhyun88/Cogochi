<script lang="ts">
  import PageShell from '$components/shared/PageShell.svelte';
  import ProofPassportAgentCard from '$components/shared/ProofPassportAgentCard.svelte';
  import ProofPassportArtifactCard from '$components/shared/ProofPassportArtifactCard.svelte';
  import { proofStore } from '$lib/stores/proofStore';
  import { rosterStore } from '$lib/stores/rosterStore';

  const proofState = $derived($proofStore);
  const passportAgents = $derived.by(() => {
    proofState;
    return $rosterStore.agents.map((agent) => ({
      agent,
      summary: proofStore.getPassportSummary(agent.id),
    }));
  });
  const recentPublicArtifacts = $derived.by(() => {
    proofState;
    return proofStore.getRecentPublicArtifacts(6);
  });
  const totalPublicArtifacts = $derived(passportAgents.reduce((sum, entry) => sum + entry.summary.publicArtifacts, 0));
  const totalAcceptedPublicArtifacts = $derived(
    passportAgents.reduce((sum, entry) => sum + entry.summary.acceptedPublicArtifacts, 0),
  );
</script>

<PageShell>
  <section class="grid-2">
    <article class="panel hero">
      <div class="stack">
        <p class="section-kicker">Passport</p>
        <h1 class="section-title">Turn proof history into a readable creature booklet.</h1>
        <p class="hero__lede">
          Passport is the public-facing proof surface. It does not invent new scores. It turns accepted `ProofArtifact`
          history into a compact credibility story a trainer can actually show.
        </p>
        <div class="chip-row">
          <span class="chip">{totalPublicArtifacts} public-ready proofs</span>
          <span class="chip">{totalAcceptedPublicArtifacts} accepted public proofs</span>
          <span class="chip">proof-first, not leaderboard-first</span>
        </div>
        <div class="hero__actions">
          <a class="link-button" href="/proof">Run proof</a>
          <a class="link-button secondary" href="/lab">Tune doctrine</a>
          <a class="link-button ghost" href="/roster">Back to roster</a>
        </div>
      </div>
    </article>

    <article class="panel hero hero--quiet">
      <div class="stack">
        <p class="section-kicker">Recent public proof</p>
        {#if recentPublicArtifacts[0]}
          <h2>{recentPublicArtifacts[0].artifact.agentName} just surfaced {recentPublicArtifacts[0].artifact.mutationTitle}.</h2>
          <p class="hero__lede">
            {recentPublicArtifacts[0].artifact.proofPackTitle ?? 'Unknown pack'} / {recentPublicArtifacts[0].artifact.frameTitle}
          </p>
          <p class="hero__note">{recentPublicArtifacts[0].artifact.visibleEffect}</p>
        {:else}
          <h2>No public-ready proof artifact has been written yet.</h2>
          <p class="hero__lede">Run `Public Passport Gauntlet` or another public-ready proof pack to seed the booklet.</p>
        {/if}
      </div>
    </article>
  </section>

  <section class="grid-auto passport-grid">
    {#each passportAgents as entry}
      <ProofPassportAgentCard agent={entry.agent} summary={entry.summary} />
    {/each}
  </section>

  {#if recentPublicArtifacts.length > 0}
    <section class="stack lower-stack">
      <div>
        <p class="section-kicker">Ledger preview</p>
        <h2 class="section-title">Recent public-ready proof cards</h2>
      </div>
      <div class="grid-2">
        {#each recentPublicArtifacts as entry}
          <ProofPassportArtifactCard {entry} />
        {/each}
      </div>
    </section>
  {/if}
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

  .hero__actions {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
  }

  .hero--quiet {
    background: rgba(244, 247, 238, 0.84);
  }

  .passport-grid {
    margin-top: 18px;
  }

  .lower-stack {
    margin-top: 18px;
  }
</style>
