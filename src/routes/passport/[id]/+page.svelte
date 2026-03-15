<script lang="ts">
  import { browser } from '$app/environment';
  import AgentSpriteCard from '$components/shared/AgentSpriteCard.svelte';
  import PageShell from '$components/shared/PageShell.svelte';
  import ProofPassportArtifactCard from '$components/shared/ProofPassportArtifactCard.svelte';
  import { proofStore } from '$lib/stores/proofStore';
  import { rosterStore } from '$lib/stores/rosterStore';
  import type { PageData } from './$types';

  let { data }: { data: PageData } = $props();

  const proofState = $derived($proofStore);
  const agent = $derived(rosterStore.getAgent(data.agentId));
  const summary = $derived.by(() => {
    proofState;
    return proofStore.getPassportSummary(data.agentId);
  });
  const publicArtifacts = $derived.by(() => {
    proofState;
    return proofStore.getPublicArtifactsForAgent(data.agentId);
  });
  const privateArtifacts = $derived.by(() => {
    proofState;
    return proofStore.getArtifactsForAgent(data.agentId).filter((entry) => !entry.publicReady);
  });
  const featuredArtifact = $derived(summary.latestPublicArtifact ?? summary.latestArtifact);
  const averageTrustDeltaLabel = $derived(
    summary.averageTrustDelta >= 0 ? `+${summary.averageTrustDelta}` : `${summary.averageTrustDelta}`,
  );
  const proofHref = $derived(
    featuredArtifact?.artifact.proofPackId
      ? `/proof?agent=${data.agentId}&pack=${featuredArtifact.artifact.proofPackId}`
      : `/proof?agent=${data.agentId}&pack=public-passport-gauntlet`,
  );
  const passportExportInput = $derived(agent ? proofStore.getPassportSnapshotInput(agent) : null);

  let exportState = $state<{
    status: 'idle' | 'saving' | 'done' | 'error';
    message: string | null;
    href: string | null;
    shareHref: string | null;
    publishStatus: 'DRAFT' | 'PUBLISHED' | null;
  }>({
    status: 'idle',
    message: null,
    href: null,
    shareHref: null,
    publishStatus: null,
  });
  let checkedExistingExportFor = $state<string | null>(null);

  $effect(() => {
    if (
      !browser ||
      !agent ||
      !passportExportInput ||
      passportExportInput.publicArtifacts.length === 0 ||
      checkedExistingExportFor === agent.id
    ) {
      return;
    }

    checkedExistingExportFor = agent.id;

    void (async () => {
      const response = await fetch(`/api/passport/${agent.id}`);
      if (!response.ok) {
        return;
      }

      const payload = (await response.json().catch(() => null)) as {
        href?: string;
        shareHref?: string | null;
        publishStatus?: 'DRAFT' | 'PUBLISHED';
      } | null;
      if (!payload?.href) {
        return;
      }

      exportState = {
        status: 'done',
        message: 'Existing public passport snapshot found.',
        href: payload.href,
        shareHref: payload.shareHref ?? null,
        publishStatus: payload.publishStatus ?? 'DRAFT',
      };
    })();
  });

  async function exportPassportSnapshot() {
    if (!browser || !passportExportInput || passportExportInput.publicArtifacts.length === 0) {
      return;
    }

    exportState = {
      status: 'saving',
      message: null,
      href: null,
      shareHref: null,
      publishStatus: null,
    };

    try {
      const response = await fetch('/api/passport/export', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify(passportExportInput),
      });

      const payload = (await response.json().catch(() => null)) as {
        href?: string;
        shareHref?: string | null;
        publishStatus?: 'DRAFT' | 'PUBLISHED';
        error?: string;
      } | null;
      if (!response.ok || !payload?.href) {
        throw new Error(payload?.error ?? 'Passport export failed.');
      }

      exportState = {
        status: 'done',
        message: payload.publishStatus === 'PUBLISHED' ? 'Published passport snapshot refreshed.' : 'Draft passport snapshot exported.',
        href: payload.href,
        shareHref: payload.shareHref ?? null,
        publishStatus: payload.publishStatus ?? 'DRAFT',
      };
    } catch (error) {
      exportState = {
        status: 'error',
        message: error instanceof Error ? error.message : 'Passport export failed.',
        href: null,
        shareHref: null,
        publishStatus: null,
      };
    }
  }

  async function publishPassportSnapshot() {
    if (!browser || !agent || !exportState.href || exportState.publishStatus === 'PUBLISHED') {
      return;
    }

    exportState = {
      ...exportState,
      status: 'saving',
      message: 'Publishing passport share link...',
    };

    try {
      const response = await fetch('/api/passport/publish', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({ agentId: agent.id }),
      });
      const payload = (await response.json().catch(() => null)) as {
        href?: string;
        shareHref?: string;
        publishStatus?: 'DRAFT' | 'PUBLISHED';
        error?: string;
      } | null;

      if (!response.ok || !payload?.href || !payload?.shareHref) {
        throw new Error(payload?.error ?? 'Passport publish failed.');
      }

      exportState = {
        status: 'done',
        message: 'Passport published. Share link is ready.',
        href: payload.href,
        shareHref: payload.shareHref,
        publishStatus: payload.publishStatus ?? 'PUBLISHED',
      };
    } catch (error) {
      exportState = {
        ...exportState,
        status: 'error',
        message: error instanceof Error ? error.message : 'Passport publish failed.',
      };
    }
  }
</script>

<PageShell>
  {#if agent}
    <section class="grid-2">
      <div class="stack">
        <AgentSpriteCard {agent} />
        <article class="panel detail-panel">
          <div class="stack">
            <div>
              <p class="section-kicker">Passport booklet</p>
              <h1 class="section-title">Public proof history for {agent.name}</h1>
            </div>
            <p class="passport-copy">
              Passport only shows what the creature has actually proven. Public-ready packs surface readable evidence;
              private packs remain visible as trainer context, not market-facing truth.
            </p>
            <div class="metric-grid">
              <div class="metric-card">
                <small>Public proofs</small>
                <strong>{summary.publicArtifacts}</strong>
              </div>
              <div class="metric-card">
                <small>Accepted public</small>
                <strong>{summary.acceptedPublicArtifacts}</strong>
              </div>
              <div class="metric-card">
                <small>Total ledger</small>
                <strong>{summary.totalArtifacts}</strong>
              </div>
              <div class="metric-card">
                <small>Avg trust shift</small>
                <strong>{averageTrustDeltaLabel}</strong>
              </div>
            </div>
            {#if featuredArtifact}
              <div class="metric-card">
                <small>Featured proof</small>
                <strong>{featuredArtifact.artifact.mutationTitle}</strong>
                <p>
                  {featuredArtifact.artifact.proofPackTitle ?? 'Unbound pack'} / {featuredArtifact.artifact.frameTitle}
                </p>
              </div>
            {/if}
            <div class="chip-row">
              <a class="link-button" href={proofHref}>Run next proof</a>
              <a class="link-button secondary" href={`/lab?agent=${agent.id}`}>Open lab</a>
              <button class="link-button secondary button-link" disabled={passportExportInput?.publicArtifacts.length === 0 || exportState.status === 'saving'} onclick={exportPassportSnapshot}>
                {exportState.status === 'saving' && !exportState.href ? 'Exporting...' : 'Export draft card'}
              </button>
              {#if exportState.href}
                <a class="link-button secondary" href={exportState.href}>Open preview card</a>
                <button class="link-button secondary button-link" disabled={exportState.status === 'saving' || exportState.publishStatus === 'PUBLISHED'} onclick={publishPassportSnapshot}>
                  {exportState.publishStatus === 'PUBLISHED' ? 'Published' : exportState.status === 'saving' ? 'Publishing...' : 'Publish share link'}
                </button>
              {/if}
              {#if exportState.shareHref}
                <a class="link-button secondary" href={exportState.shareHref}>Open share card</a>
              {/if}
              <a class="link-button secondary" href={`/agent/${agent.id}`}>Open agent</a>
              <a class="link-button ghost" href="/passport">All passports</a>
            </div>
            {#if exportState.message}
              <p class="passport-copy" class:error-copy={exportState.status === 'error'}>{exportState.message}</p>
            {/if}
          </div>
        </article>
      </div>

      <article class="panel detail-panel">
        <div class="stack">
          <div>
            <p class="section-kicker">Public lead</p>
            <h2 class="section-title">What another player could actually read</h2>
          </div>
          {#if summary.latestPublicArtifact}
            <ProofPassportArtifactCard entry={summary.latestPublicArtifact} featured={true} />
          {:else}
            <div class="metric-card">
              <small>No public-ready proof yet</small>
              <strong>Run the passport gauntlet.</strong>
              <p>
                This creature has internal proof history, but nothing public-ready has been cleared yet. That means the
                booklet should not pretend a credibility state it has not earned.
              </p>
            </div>
          {/if}
        </div>
      </article>
    </section>

    <section class="stack lower-stack">
      <div>
        <p class="section-kicker">Public ledger</p>
        <h2 class="section-title">Readable proof cards</h2>
      </div>
      {#if publicArtifacts.length > 0}
        <div class="grid-2">
          {#each publicArtifacts as entry}
            <ProofPassportArtifactCard {entry} />
          {/each}
        </div>
      {:else}
        <article class="panel detail-panel">
          <p class="passport-copy">No public-ready artifact has been recorded for this creature yet.</p>
        </article>
      {/if}
    </section>

    {#if privateArtifacts.length > 0}
      <section class="stack lower-stack">
        <div>
          <p class="section-kicker">Trainer-only ledger</p>
          <h2 class="section-title">Internal proof history</h2>
        </div>
        <div class="grid-2">
          {#each privateArtifacts as entry}
            <ProofPassportArtifactCard {entry} />
          {/each}
        </div>
      </section>
    {/if}
  {:else}
    <article class="panel detail-panel">
      <h1 class="section-title">Passport not found</h1>
      <p class="passport-copy">This agent does not exist in the current roster.</p>
      <a class="link-button secondary" href="/passport">Back to passports</a>
    </article>
  {/if}
</PageShell>

<style>
  .detail-panel {
    padding: 22px;
  }

  .passport-copy,
  .detail-panel h1,
  .detail-panel h2,
  .detail-panel p {
    margin: 0;
  }

  .passport-copy {
    color: var(--text-soft);
    line-height: 1.65;
  }

  .button-link {
    appearance: none;
    cursor: pointer;
  }

  .button-link:disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }

  .error-copy {
    color: #8f4b3e;
  }

  .lower-stack {
    margin-top: 18px;
  }
</style>
