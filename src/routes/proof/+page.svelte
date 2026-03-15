<script lang="ts">
  import PageShell from '$components/shared/PageShell.svelte';
  import ComparePanel from '$components/shared/ComparePanel.svelte';
  import DoctrineOverlayPreview from '$components/shared/DoctrineOverlayPreview.svelte';
  import PixelSprite from '$components/shared/PixelSprite.svelte';
  import { careStateLabels, growthStageLabels } from '$lib/data/seed';
  import { compareLoadouts } from '$lib/engine/eval-engine';
  import { getProofPack, proofMetricLabels } from '$lib/engine/proof-system';
  import { labStore } from '$lib/stores/labStore';
  import { rosterStore } from '$lib/stores/rosterStore';
  import type { PageData } from './$types';

  let { data }: { data: PageData } = $props();

  const agents = $derived($rosterStore.agents);
  const activeAgentId = $derived(data.selectedAgentId || $labStore.activeAgentId || $rosterStore.selectedAgentId || agents[0]?.id || '');
  const activeAgent = $derived(agents.find((agent) => agent.id === activeAgentId) ?? null);
  const selectedDoctrineSession = $derived.by(() => {
    $labStore;
    if (!data.selectedAgentId || !data.selectedDoctrineSessionId) {
      return null;
    }
    return labStore.getDoctrineSession(data.selectedAgentId, data.selectedDoctrineSessionId);
  });
  const draft = $derived(activeAgent ? labStore.getDraft(activeAgent.id) : null);
  const activePack = $derived.by(
    () =>
      getProofPack(data.selectedPackId ?? selectedDoctrineSession?.recommendedProofPackId ?? null) ?? data.proofPacks[0] ?? null,
  );
  const primaryScenarioId = $derived(activePack?.cases[0]?.scenarioId ?? $labStore.activeScenarioId);
  const comparison = $derived(
    activeAgent && draft ? compareLoadouts(activeAgent, activeAgent.loadout, draft, primaryScenarioId) : null,
  );
  const runtimeChecks = $derived.by<string[]>(() => ((data.runtime?.distill?.suggestedNextChecks ?? []) as string[]));

  function proofPackHref(packId: string): string {
    const params = new URLSearchParams({ pack: packId });
    const agentId = data.selectedAgentId ?? selectedDoctrineSession?.agentId ?? null;
    const sessionId = data.selectedDoctrineSessionId ?? selectedDoctrineSession?.id ?? null;
    if (agentId) {
      params.set('agent', agentId);
    }
    if (sessionId) {
      params.set('session', sessionId);
    }
    return `/proof?${params.toString()}`;
  }

  function battleEntryHref(frameId: string, gate: 'spar' | 'proof'): string {
    const params = new URLSearchParams({
      entry: 'field',
      frame: frameId,
      gate,
    });
    const agentId = data.selectedAgentId ?? selectedDoctrineSession?.agentId ?? null;
    const sessionId = data.selectedDoctrineSessionId ?? selectedDoctrineSession?.id ?? null;
    const packId = activePack?.id ?? selectedDoctrineSession?.recommendedProofPackId ?? null;
    if (agentId) {
      params.set('agent', agentId);
    }
    if (sessionId) {
      params.set('session', sessionId);
    }
    if (packId) {
      params.set('pack', packId);
    }
    return `/battle?${params.toString()}`;
  }

  $effect(() => {
    if (activeAgent) {
      labStore.ensureDraft(activeAgent.id);
    }
  });
</script>

<PageShell>
  <section class="grid-2">
    <article class="panel proof-hero">
      <div class="stack">
        <div>
          <p class="section-kicker">Proof</p>
          <h1 class="section-title">Game-native backtest, not a finance dashboard.</h1>
        </div>
        <p>
          `Proof` is Cogochi&apos;s historical validation layer. One mutation, one fixed frame pack, one deterministic
          verdict. The player should leave knowing whether the creature truly improved, not just whether one candle
          happened to look good.
        </p>
        {#if activeAgent}
          <div class="proof-agent">
            <PixelSprite agent={activeAgent} size={72} alt={activeAgent.name} />
            <div class="stack">
              <strong>{activeAgent.name}</strong>
              <p>{activeAgent.recentLesson}</p>
              <div class="chip-row">
                <span class="chip">{growthStageLabels[activeAgent.growthStage]}</span>
                <span class="chip">{careStateLabels[activeAgent.careState]}</span>
                <span class="chip">Trust {activeAgent.trustWeight}</span>
                <span class="chip">Weak link {activeAgent.weakLink}</span>
              </div>
            </div>
          </div>
        {/if}
        {#if selectedDoctrineSession}
          <div class="metric-card">
            <small>Bound doctrine session</small>
            <strong>{selectedDoctrineSession.title}</strong>
            <p>{selectedDoctrineSession.normalizedIntent}</p>
            <div class="chip-row">
              <span class="chip">{selectedDoctrineSession.status}</span>
              {#if selectedDoctrineSession.recommendedProofPackId}
                <span class="chip chip--quiet">{selectedDoctrineSession.recommendedProofPackId}</span>
              {/if}
            </div>
          </div>
        {/if}
        {#if activePack}
          <div class="metric-grid">
            <div class="metric-card">
              <small>Selected pack</small>
              <strong>{activePack.title}</strong>
            </div>
            <div class="metric-card">
              <small>Mode</small>
              <strong>{activePack.mode}</strong>
            </div>
            <div class="metric-card">
              <small>Cases</small>
              <strong>{activePack.cases.length}</strong>
            </div>
            <div class="metric-card">
              <small>Public ready</small>
              <strong>{activePack.publicReady ? 'Yes' : 'Not yet'}</strong>
            </div>
          </div>
          <div class="chip-row">
            {#each activePack.targetWeakLinks as gene}
              <span class="chip chip--quiet">{gene.toLowerCase()}</span>
            {/each}
          </div>
          <p>{activePack.summary}</p>
          <div class="chip-row">
            <a
              class="link-button"
              href={battleEntryHref(activePack.cases[0].frameId, activePack.recommendedGate === 'SPAR' ? 'spar' : 'proof')}
            >
              {activePack.mode === 'SPAR' ? 'Run spar opener' : activePack.mode === 'GAUNTLET' ? 'Run gauntlet opener' : 'Run proof opener'}
            </a>
            <a class="link-button secondary" href="/lab">Refine in lab</a>
            <a class="link-button secondary" href="/journal">Open journal</a>
          </div>
        {/if}
      </div>
    </article>

    <article class="panel proof-hero proof-hero--quiet">
      <div class="stack">
        <div>
          <p class="section-kicker">What proof measures</p>
          <h2 class="section-title">Historical validation should score judgment quality first and shadow return second.</h2>
        </div>
        {#if activePack}
          <div class="journal-list">
            {#each activePack.metricWeights as metric}
              <p><strong>{proofMetricLabels[metric.id]}</strong> · {Math.round(metric.weight * 100)}%</p>
            {/each}
          </div>
        {/if}
        <div class="metric-card">
          <small>Runtime goal</small>
          <strong>{data.runtime.distill.goal ?? 'No distill goal generated yet'}</strong>
        </div>
        {#if runtimeChecks.length > 0}
          <div class="metric-card">
            <small>Suggested next checks</small>
            <div class="journal-list">
              {#each runtimeChecks.slice(0, 3) as check}
                <p>{check}</p>
              {/each}
            </div>
          </div>
        {/if}
      </div>
    </article>
  </section>

  {#if activePack}
    <section class="grid-auto proof-grid">
      {#each data.proofPacks as pack}
        <a
          class:proof-pack--selected={activePack.id === pack.id}
          class="panel proof-pack"
          href={proofPackHref(pack.id)}
        >
          <small>{pack.mode}</small>
          <strong>{pack.title}</strong>
          <p>{pack.summary}</p>
          <div class="chip-row">
            <span class="chip">{pack.cases.length} frames</span>
            <span class="chip">{pack.publicReady ? 'public-ready' : 'private proof'}</span>
          </div>
        </a>
      {/each}
    </section>

    <section class="grid-2 proof-grid">
      <article class="panel mutation-card">
        <div class="stack">
          <div>
            <p class="section-kicker">Frame bundle</p>
            <h2 class="section-title">A proof pack is a deterministic sequence, not one lucky screenshot.</h2>
          </div>
          {#each activePack.cases as proofCase}
            <div class="metric-card">
              <small>{proofCase.frameDateLabel}</small>
              <strong>{proofCase.frameTitle}</strong>
              <p>{proofCase.objective}</p>
              <p>{proofCase.note}</p>
            </div>
          {/each}
        </div>
      </article>

      <article class="panel mutation-card mutation-card--focused">
        <div class="stack">
          <div>
            <p class="section-kicker">Current candidate</p>
            <h2 class="section-title">The proof page binds the current draft to a fixed pack before battle.</h2>
          </div>
          {#if activeAgent}
            <div class="metric-card">
              <small>Selected creature</small>
              <strong>{activeAgent.name}</strong>
              <p>{activeAgent.nextCareAction}</p>
            </div>
          {/if}
          {#if selectedDoctrineSession}
            <div class="metric-card">
              <small>Doctrine preview</small>
              <DoctrineOverlayPreview
                overlaySpec={selectedDoctrineSession.overlaySpec}
                frameId={selectedDoctrineSession.evidenceFrames[0]?.id ?? activePack.cases[0]?.frameId}
              />
            </div>
            <div class="metric-card">
              <small>Candidate criteria</small>
              <div class="journal-list">
                {#each selectedDoctrineSession.criteriaSummary as criterion}
                  <p>{criterion}</p>
                {/each}
              </div>
            </div>
          {/if}
          <div class="metric-card">
            <small>Primary scenario anchor</small>
            <strong>{primaryScenarioId}</strong>
            <p>The first frame anchors the mutation compare. Each later frame tests whether the improvement generalizes.</p>
          </div>
          <div class="metric-card">
            <small>Battle authority</small>
            <strong>Historical frames only</strong>
            <p>Live market state, popularity, and market demand do not change proof truth.</p>
          </div>
        </div>
      </article>
    </section>
  {/if}

  {#if comparison}
    <section class="compare-wrap">
      <ComparePanel {comparison} title="Draft mutation against the first proof anchor" />
    </section>
  {/if}
</PageShell>

<style>
  .proof-hero {
    padding: 22px;
  }

  .proof-agent {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 14px;
    align-items: center;
  }

  .proof-grid {
    margin-top: 18px;
  }

  .proof-pack {
    display: block;
    color: inherit;
    text-decoration: none;
    padding: 18px;
    border: 1px solid var(--border);
    transition: transform 140ms ease, border-color 140ms ease, box-shadow 140ms ease;
  }

  .proof-pack:hover,
  .proof-pack--selected {
    transform: translateY(-2px);
    border-color: rgba(52, 155, 104, 0.26);
    box-shadow: 0 14px 30px rgba(23, 34, 29, 0.08);
  }

  .proof-pack strong,
  .proof-pack p,
  .proof-pack small {
    display: block;
    margin: 0;
  }

  .proof-pack strong {
    margin: 6px 0 8px;
  }

  .proof-pack p {
    color: var(--text-soft);
    line-height: 1.5;
  }

  .compare-wrap {
    margin-top: 18px;
  }
</style>
