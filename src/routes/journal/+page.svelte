<script lang="ts">
  import { browser } from '$app/environment';
  import DoctrineOverlayPreview from '$components/shared/DoctrineOverlayPreview.svelte';
  import PageShell from '$components/shared/PageShell.svelte';
  import PixelSprite from '$components/shared/PixelSprite.svelte';
  import { careStateLabels, growthStageLabels, homeStyleLabels, memoryTierLabels } from '$lib/data/seed';
  import { labStore } from '$lib/stores/labStore';
  import { proofStore } from '$lib/stores/proofStore';
  import { rosterStore } from '$lib/stores/rosterStore';
  import type { MemoryTier } from '$lib/types';
  import type { PageData } from './$types';

  type RuntimeRail = { tier: MemoryTier; items: string[] };
  type RuntimeEntry = { heading: string; preview: string };
  type RuntimeHighlightedRail = { tier: MemoryTier; entries: RuntimeEntry[] };

  function sanitizeRuntimeFocusCheck(text: string): string | null {
    const cleaned = text.replace(/`/g, '').replace(/\s+/g, ' ').trim();
    if (!cleaned) {
      return null;
    }
    if (/(src\/|runtime\/|\.ts\b|\.json\b|package\.json|readme\.md)/i.test(cleaned)) {
      return null;
    }
    if (cleaned.length <= 96) {
      return cleaned;
    }
    return `${cleaned.slice(0, 93).trim()}...`;
  }

  let { data }: { data: PageData } = $props();
  const runtimeChecks = $derived.by<string[]>(() => ((data.runtime?.distill?.suggestedNextChecks ?? []) as string[]));
  const runtimeRails = $derived.by<RuntimeRail[]>(() => ((data.runtime?.memoryIndexByTier ?? []) as RuntimeRail[]));
  const runtimeHighlightedRails = $derived.by<RuntimeHighlightedRail[]>(
    () => ((data.runtime?.highlightedEntries ?? []) as RuntimeHighlightedRail[]),
  );
  const runtimeChecksClean = $derived.by<string[]>(() =>
    runtimeChecks.map((item) => sanitizeRuntimeFocusCheck(item)).filter((item): item is string => Boolean(item)),
  );

  const agents = $derived($rosterStore.agents);
  const selectedProofArtifact = $derived.by(() => {
    $proofStore;
    if (data.returnContext.artifactId) {
      return proofStore.getArtifact(data.returnContext.artifactId) ?? proofStore.getActiveArtifact();
    }
    return proofStore.getActiveArtifact();
  });
  const selectedAgent = $derived(
    agents.find((agent) => agent.id === (selectedProofArtifact?.agentId || data.returnContext.agentId || $rosterStore.selectedAgentId)) ?? agents[0] ?? null,
  );
  const selectedDoctrineSession = $derived.by(() => {
    $labStore;
    const agentId = selectedProofArtifact?.agentId ?? data.returnContext.agentId;
    const doctrineSessionId = selectedProofArtifact?.doctrineSessionId ?? data.returnContext.doctrineSessionId;
    if (!agentId || !doctrineSessionId) {
      return null;
    }
    return labStore.getDoctrineSession(agentId, doctrineSessionId);
  });
  const latestEntries = $derived.by(() =>
    agents
      .map((agent) => ({
        agent,
        mutation: agent.mutations[0] ?? null,
        frame: agent.provenFrames[0] ?? null,
      }))
      .filter((entry) => entry.mutation)
      .sort((left, right) => (right.mutation?.createdAt ?? 0) - (left.mutation?.createdAt ?? 0))
      .slice(0, 4),
  );
  const careQueue = $derived.by(() =>
    agents
      .filter((agent) => agent.careState !== 'CLEAR')
      .sort((left, right) => right.trustWeight - left.trustWeight),
  );
  const focusTier = $derived.by<MemoryTier>(() => {
    if (!selectedAgent) {
      return 'M30';
    }
    if (selectedAgent.careState === 'MEMORY_DRIFT' || selectedAgent.careState === 'CONFIDENCE_SHAKE') {
      return 'M30';
    }
    if (selectedAgent.growthStage === 'SIGNATURE') {
      return 'M365';
    }
    return 'M90';
  });
  const focusedTierRail = $derived(
    runtimeHighlightedRails.find((entry) => entry.tier === focusTier) ?? runtimeHighlightedRails[0] ?? null,
  );
  const runtimeFocusCheck = $derived.by(() => {
    if (!selectedAgent || runtimeChecksClean.length === 0) {
      return null;
    }
    if (selectedAgent.careState === 'MEMORY_DRIFT') {
      return runtimeChecksClean.find((item) => item.toLowerCase().includes('memory')) ?? runtimeChecksClean[0];
    }
    if (selectedAgent.careState === 'DOCTRINE_BLUR') {
      return runtimeChecksClean.find((item) => item.toLowerCase().includes('bundle')) ?? runtimeChecksClean[0];
    }
    return runtimeChecksClean[0];
  });
  const returnSummary = $derived.by(() => {
    if (selectedProofArtifact) {
      return {
        gateLabel: selectedProofArtifact.entryGate === 'PROOF' ? 'Proof Gate' : selectedProofArtifact.entryGate === 'SPAR' ? 'Spar Gate' : 'Field Gate',
        verdictLabel:
          selectedProofArtifact.trainerVerdict === 'ACCEPTED'
            ? 'Mutation kept'
            : selectedProofArtifact.trainerVerdict === 'QUARANTINED'
              ? 'Mutation quarantined'
              : 'Mutation reverted',
        outcomeLabel: selectedProofArtifact.battleOutcome === 'WIN' ? 'Won the clash' : 'Lost the clash',
        frameTitle: selectedProofArtifact.frameTitle,
        frameDateLabel: selectedProofArtifact.frameDateLabel,
      };
    }

    const context = data.returnContext;
    if (!context.outcome && !context.verdict && !context.frameTitle) {
      return null;
    }

    const gateLabel = context.gate === 'proof' ? 'Proof Gate' : context.gate === 'spar' ? 'Spar Gate' : 'Field Gate';
    const verdictLabel =
      context.verdict === 'ACCEPTED'
        ? 'Mutation kept'
        : context.verdict === 'QUARANTINED'
          ? 'Mutation quarantined'
          : context.verdict === 'REVERTED'
            ? 'Mutation reverted'
            : 'Verdict pending';
    const outcomeLabel = context.outcome === 'WIN' ? 'Won the clash' : context.outcome === 'LOSS' ? 'Lost the clash' : 'Returned for review';

    return {
      gateLabel,
      verdictLabel,
      outcomeLabel,
      frameTitle: context.frameTitle ?? 'Unknown frame',
      frameDateLabel: context.frameDateLabel ?? null,
    };
  });
  const selectedKeepsakes = $derived(selectedAgent?.keepsakes.slice(0, 4) ?? []);
  const returnHeadline = $derived.by(() => {
    if (!selectedAgent) {
      return 'Return from the proof gate and set the next care move.';
    }
    if (selectedProofArtifact) {
      const verdictVerb =
        selectedProofArtifact.trainerVerdict === 'ACCEPTED'
          ? 'kept'
          : selectedProofArtifact.trainerVerdict === 'QUARANTINED'
            ? 'quarantined'
            : 'reverted';
      return `${selectedAgent.name} ${verdictVerb} the latest mutation and came back from ${selectedProofArtifact.frameTitle}.`;
    }
    return `${selectedAgent.name} is back from the field and waiting for the next care move.`;
  });
  const trustDeltaLabel = $derived.by(() => {
    if (!selectedProofArtifact) {
      return selectedAgent ? `Trust ${selectedAgent.trustWeight}` : null;
    }
    const sign = selectedProofArtifact.trustDelta > 0 ? '+' : '';
    return `Trust ${selectedProofArtifact.trustBefore} -> ${selectedProofArtifact.trustAfter} (${sign}${selectedProofArtifact.trustDelta})`;
  });
  const visualChangeLabel = $derived.by(
    () => selectedProofArtifact?.visibleEffect ?? selectedAgent?.recentTrainingFocus ?? 'No visible change recorded yet.',
  );

  $effect(() => {
    if (!browser || !selectedAgent) {
      return;
    }

    window.__cogochi_text_state = () => ({
      mode: 'journal',
      agent: selectedAgent.name,
      growthStage: selectedAgent.growthStage,
      homeStyle: selectedAgent.homeStyle,
      careState: selectedAgent.careState,
      nextCareAction: selectedAgent.nextCareAction,
      returnFrame: returnSummary?.frameTitle ?? null,
      verdict: returnSummary?.verdictLabel ?? null,
      artifact: selectedProofArtifact?.id ?? null,
      runtimeGoal: data.runtime.distill.goal,
      runtimeFocusCheck,
      focusTier,
      focusTierEntries: focusedTierRail?.entries.map((entry: RuntimeEntry) => entry.heading) ?? [],
    });

    return () => {
      delete window.__cogochi_text_state;
    };
  });
</script>

<PageShell>
  <div class="journal-home">
    <section class="panel journal-stage">
      <div class="journal-stage__mist"></div>
      <div class="journal-stage__header">
        <div>
          <p class="section-kicker">Return Chamber</p>
          <h1 class="section-title">{returnHeadline}</h1>
          <p class="journal-stage__lead">Come back from the gate, sort the marks on the creature, and decide what the room should carry into the next route.</p>
        </div>

        <div class="journal-stage__stamps">
          {#if returnSummary}
            <span class="chip chip--quiet">{returnSummary.gateLabel}</span>
            <span class="chip chip--quiet">{returnSummary.outcomeLabel}</span>
            <span class="chip chip--quiet">{returnSummary.verdictLabel}</span>
          {/if}
          <span class="chip chip--quiet">{memoryTierLabels[focusTier]} focus rail</span>
        </div>
      </div>

      <div class="journal-stage__layout">
        <article class="panel journal-board">
          {#if selectedAgent}
            <div class="journal-note">
              <div class="journal-note__portrait">
                <div class="journal-polaroid">
                  <PixelSprite agent={selectedAgent} homeStyle={selectedAgent.homeStyle} presentation="detail" size={86} alt={selectedAgent.name} />
                </div>
                <div class="chip-row">
                  <span class="chip">{growthStageLabels[selectedAgent.growthStage]}</span>
                  <span class="chip">{careStateLabels[selectedAgent.careState]}</span>
                  <span class="chip">{homeStyleLabels[selectedAgent.homeStyle]}</span>
                  {#if trustDeltaLabel}
                    <span class="chip">{trustDeltaLabel}</span>
                  {/if}
                </div>
              </div>

              <div class="journal-note__body">
                <div class="journal-note__story">
                  <small>Creature read</small>
                  <strong>{selectedAgent.name}</strong>
                  <p>{selectedAgent.recentLesson}</p>
                </div>

                <div class="journal-highlight-grid">
                  <div class="journal-ticket journal-ticket--verdict">
                    <small>Latest mutation</small>
                    <strong>{selectedProofArtifact?.mutationTitle ?? selectedAgent.recentTrainingFocus}</strong>
                    <p>{selectedProofArtifact?.mutationReason ?? visualChangeLabel}</p>
                    <p class="journal-ticket__meta">
                      {returnSummary?.frameTitle ?? 'Awaiting frame'}
                      {returnSummary?.frameDateLabel ? ` · ${returnSummary.frameDateLabel}` : ''}
                    </p>
                  </div>

                  <div class="journal-ticket">
                    <small>Visible change</small>
                    <strong>{visualChangeLabel}</strong>
                    <p>{selectedAgent.nextCareAction}</p>
                  </div>

                  <div class="journal-ticket">
                    <small>Saved presence</small>
                    <strong>{homeStyleLabels[selectedAgent.homeStyle]}</strong>
                    <p>{selectedAgent.recentCareSummary}</p>
                  </div>
                </div>

                {#if selectedDoctrineSession}
                  <div class="journal-torn-note">
                    <small>Doctrine carried through battle</small>
                    <strong>{selectedProofArtifact?.doctrineTitle ?? selectedDoctrineSession.title}</strong>
                    <p>{selectedProofArtifact?.doctrineNormalizedIntent ?? selectedDoctrineSession.normalizedIntent}</p>
                    <div class="chip-row">
                      <span class="chip chip--quiet">{selectedDoctrineSession.status}</span>
                      {#if selectedProofArtifact?.proofPackId || data.returnContext.proofPackId}
                        <span class="chip chip--quiet">{selectedProofArtifact?.proofPackId ?? data.returnContext.proofPackId}</span>
                      {/if}
                    </div>
                  </div>
                {/if}

                <div class="journal-next-step">
                  <small>Next room action</small>
                  <strong>{selectedAgent.nextCareAction}</strong>
                  {#if runtimeFocusCheck}
                    <p>Campfire distill note: {runtimeFocusCheck}</p>
                  {/if}
                </div>

                <div class="chip-row">
                  <a class="link-button" href="/field">Return to field</a>
                  <a class="link-button secondary" href={`/agent/${selectedAgent.id}`}>Inspect agent</a>
                  <a
                    class="link-button secondary"
                    href={`/lab?agent=${selectedAgent.id}${selectedProofArtifact?.doctrineSessionId || selectedDoctrineSession ? `&session=${selectedProofArtifact?.doctrineSessionId ?? selectedDoctrineSession?.id}` : ''}`}
                  >
                    Open lab
                  </a>
                </div>
              </div>
            </div>
          {/if}
        </article>

        <aside class="journal-sidebar">
          <article class="panel journal-care-rail">
            <div class="stack">
              <div>
                <p class="section-kicker">Care Queue</p>
                <h2 class="section-title">Who needs the room before the next gate.</h2>
              </div>

              {#if careQueue.length > 0}
                {#each careQueue as agent}
                  <div class="journal-care-card">
                    <small>{careStateLabels[agent.careState]}</small>
                    <strong>{agent.name}</strong>
                    <p>{agent.nextCareAction}</p>
                  </div>
                {/each}
              {:else}
                <div class="journal-care-card">
                  <small>Stable squad</small>
                  <strong>No urgent repairs</strong>
                  <p>The squad can head straight back into a spar or proof run.</p>
                </div>
              {/if}
            </div>
          </article>

          <article class="panel journal-distill-card">
            <div class="stack">
              <div>
                <p class="section-kicker">Campfire Distill</p>
                <h2 class="section-title">{data.runtime.distill.goal ?? 'Runtime distill not generated yet'}</h2>
              </div>

              <p class="journal-distill-card__updated">
                {data.runtime.updatedAt ? `Updated ${data.runtime.updatedAt}` : 'Run runtime:all to refresh the digest.'}
              </p>

              {#if runtimeChecksClean.length > 0}
                <div class="journal-list">
                  {#each runtimeChecksClean.slice(0, 3) as check}
                    <p>{check}</p>
                  {/each}
                </div>
              {/if}

              <div class="chip-row">
                {#each data.runtime.distill.promotionRules as rule}
                  <span class="chip chip--quiet">{rule}</span>
                {/each}
              </div>
            </div>
          </article>
        </aside>
      </div>
    </section>

    <section class="journal-ledgers">
      <article class="panel journal-shelf">
        <div class="stack">
          <div>
            <p class="section-kicker">Keepsake Desk</p>
            <h2 class="section-title">What this creature is carrying back into the room.</h2>
          </div>

          <div class="journal-keepsakes">
            {#if selectedKeepsakes.length > 0}
              {#each selectedKeepsakes as keepsake}
                <div class="journal-keepsake">{keepsake}</div>
              {/each}
            {:else}
              <div class="journal-keepsake journal-keepsake--empty">No keepsakes minted yet.</div>
            {/if}
          </div>

          <div class="journal-memory-tabs">
            {#each runtimeRails as rail}
              <div class="journal-memory-tab">
                <small>{memoryTierLabels[rail.tier]}</small>
                <strong>{rail.items.length > 0 ? `${rail.items.length} indexed memories` : 'No indexed memories yet'}</strong>
                <p>{rail.items[0] ?? 'This rail has not been populated yet.'}</p>
              </div>
            {/each}
          </div>
        </div>
      </article>

      <article class="panel journal-book">
        <div class="stack">
          <div>
            <p class="section-kicker">Field Notebook</p>
            <h2 class="section-title">{focusedTierRail ? `${memoryTierLabels[focusedTierRail.tier]} priorities for the current creature` : 'No focus rail yet'}</h2>
          </div>

          {#if focusedTierRail}
            <div class="journal-list journal-list--ink">
              {#each focusedTierRail.entries as entry}
                <p><strong>{entry.heading}</strong> · {entry.preview}</p>
              {/each}
            </div>
          {/if}

          {#if selectedDoctrineSession}
            <div class="journal-doctrine-card">
              <small>Doctrine replay</small>
              <strong>{selectedProofArtifact?.doctrineTitle ?? selectedDoctrineSession.title}</strong>
              <DoctrineOverlayPreview
                overlaySpec={selectedProofArtifact?.overlaySpec ?? selectedDoctrineSession.overlaySpec}
                frameId={selectedProofArtifact?.frameId ?? data.returnContext.frameId ?? selectedDoctrineSession.evidenceFrames[0]?.id ?? ''}
              />
            </div>
          {/if}
        </div>
      </article>
    </section>

    <section class="journal-history">
      <div class="journal-history__header">
        <p class="section-kicker">Squad Shelf</p>
        <h2 class="section-title">Recent mutation keepsakes across the squad.</h2>
      </div>

      <div class="journal-history__grid">
        {#each latestEntries as entry}
          <article class={`panel journal-proof-card journal-proof-card--${entry.mutation?.decision.toLowerCase()}`}>
            <small>{entry.agent.name} / {entry.mutation?.decision}</small>
            <strong>{entry.mutation?.title}</strong>
            <p>{entry.mutation?.reason}</p>
            <p class="journal-proof-card__frame">{entry.frame?.title ?? 'No proven frame yet'}</p>
          </article>
        {/each}
      </div>
    </section>
  </div>
</PageShell>

<style>
  .journal-home {
    display: grid;
    gap: 18px;
    color: #22313a;
    font-family: 'Avenir Next', 'Trebuchet MS', sans-serif;
  }

  .journal-home .panel {
    border-radius: 28px;
    border: 1px solid rgba(83, 100, 95, 0.18);
    background:
      linear-gradient(180deg, rgba(255, 252, 246, 0.96), rgba(244, 238, 225, 0.94));
    box-shadow:
      0 18px 36px rgba(77, 88, 71, 0.08),
      inset 0 1px 0 rgba(255, 255, 255, 0.7);
  }

  .journal-home h1,
  .journal-home h2,
  .journal-home .section-title {
    font-family: 'Iowan Old Style', 'Palatino Linotype', 'Book Antiqua', serif;
    letter-spacing: -0.02em;
  }

  .journal-home .chip {
    background: rgba(255, 251, 243, 0.8);
  }

  .journal-stage {
    position: relative;
    padding: 24px;
    overflow: hidden;
    background:
      radial-gradient(circle at top left, rgba(186, 219, 190, 0.48), transparent 26%),
      radial-gradient(circle at 82% 12%, rgba(238, 204, 144, 0.42), transparent 22%),
      linear-gradient(180deg, rgba(252, 248, 240, 0.98), rgba(241, 234, 216, 0.95));
  }

  .journal-stage__mist {
    position: absolute;
    inset: 0;
    background:
      linear-gradient(rgba(94, 110, 101, 0.05) 1px, transparent 1px),
      linear-gradient(90deg, rgba(94, 110, 101, 0.05) 1px, transparent 1px);
    background-size: 30px 30px;
    pointer-events: none;
  }

  .journal-stage__header,
  .journal-history__header {
    position: relative;
    z-index: 1;
    display: grid;
    gap: 10px;
  }

  .journal-stage__lead {
    margin: 0;
    max-width: 60ch;
    color: rgba(35, 52, 59, 0.7);
    line-height: 1.55;
  }

  .journal-stage__stamps {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    align-items: center;
  }

  .journal-stage__layout,
  .journal-ledgers {
    display: grid;
    grid-template-columns: minmax(0, 1.3fr) minmax(300px, 0.8fr);
    gap: 18px;
    align-items: start;
  }

  .journal-ledgers,
  .journal-history {
    margin-top: 0;
  }

  .journal-board {
    padding: 22px;
    background:
      radial-gradient(circle at top right, rgba(232, 221, 181, 0.34), transparent 30%),
      linear-gradient(180deg, rgba(252, 248, 239, 0.98), rgba(242, 237, 226, 0.94));
  }

  .journal-note {
    display: grid;
    grid-template-columns: 220px minmax(0, 1fr);
    gap: 18px;
  }

  .journal-note__portrait,
  .journal-note__body,
  .journal-sidebar {
    display: grid;
    gap: 16px;
  }

  .journal-polaroid {
    display: grid;
    place-items: center;
    min-height: 182px;
    border-radius: 28px;
    border: 1px solid rgba(74, 84, 66, 0.12);
    background:
      linear-gradient(180deg, rgba(255, 253, 248, 0.98), rgba(243, 239, 230, 0.94));
    box-shadow:
      0 14px 26px rgba(75, 73, 61, 0.08),
      inset 0 1px 0 rgba(255, 255, 255, 0.72);
  }

  .journal-note__story,
  .journal-ticket,
  .journal-torn-note,
  .journal-next-step,
  .journal-care-card,
  .journal-memory-tab,
  .journal-doctrine-card {
    display: grid;
    gap: 8px;
  }

  .journal-note__story strong,
  .journal-ticket strong,
  .journal-torn-note strong,
  .journal-next-step strong,
  .journal-care-card strong,
  .journal-memory-tab strong,
  .journal-doctrine-card strong,
  .journal-proof-card strong {
    font-size: 1.08rem;
    color: #24352d;
  }

  .journal-note__story p,
  .journal-ticket p,
  .journal-torn-note p,
  .journal-next-step p,
  .journal-care-card p,
  .journal-memory-tab p,
  .journal-proof-card p,
  .journal-distill-card__updated {
    margin: 0;
    color: var(--text-soft);
    line-height: 1.45;
  }

  .journal-highlight-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
  }

  .journal-ticket,
  .journal-next-step,
  .journal-care-card,
  .journal-memory-tab,
  .journal-doctrine-card,
  .journal-proof-card {
    padding: 16px;
    border-radius: 22px;
    border: 1px solid rgba(74, 84, 66, 0.14);
    background: rgba(255, 252, 245, 0.82);
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.72);
  }

  .journal-ticket--verdict {
    border-color: rgba(47, 108, 88, 0.22);
    background: rgba(241, 247, 239, 0.9);
  }

  .journal-ticket small,
  .journal-torn-note small,
  .journal-next-step small,
  .journal-care-card small,
  .journal-memory-tab small,
  .journal-doctrine-card small,
  .journal-proof-card small {
    color: var(--text-soft);
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  .journal-ticket__meta,
  .journal-proof-card__frame {
    font-size: 0.92rem;
    color: #5c6a5f;
  }

  .journal-torn-note {
    padding: 16px 18px;
    border-radius: 24px;
    border: 1px dashed rgba(74, 84, 66, 0.22);
    background: rgba(247, 242, 228, 0.84);
  }

  .journal-next-step {
    border-color: rgba(47, 108, 88, 0.2);
    background: rgba(248, 252, 245, 0.9);
  }

  .journal-care-rail {
    padding: 22px;
    background:
      linear-gradient(180deg, rgba(243, 246, 234, 0.94), rgba(233, 240, 223, 0.92));
  }

  .journal-distill-card {
    padding: 22px;
    background:
      linear-gradient(180deg, rgba(251, 246, 231, 0.94), rgba(245, 240, 223, 0.92));
  }

  .journal-list {
    display: grid;
    gap: 8px;
  }

  .journal-list p {
    margin: 0;
    color: var(--text-soft);
    line-height: 1.45;
  }

  .journal-list--ink p {
    color: #34433a;
  }

  .journal-keepsakes,
  .journal-memory-tabs,
  .journal-history__grid {
    display: grid;
    gap: 12px;
  }

  .journal-shelf,
  .journal-book,
  .journal-proof-card {
    padding: 22px;
  }

  .journal-keepsakes {
    grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  }

  .journal-memory-tabs,
  .journal-history__grid {
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  }

  .journal-keepsake {
    padding: 14px 16px;
    border-radius: 20px;
    border: 1px solid rgba(191, 141, 66, 0.22);
    background:
      linear-gradient(180deg, rgba(255, 251, 239, 0.95), rgba(247, 238, 213, 0.9));
    color: #5b4f2b;
    font-weight: 600;
  }

  .journal-keepsake--empty {
    color: var(--text-soft);
    font-weight: 500;
  }

  .journal-proof-card--accepted {
    border-color: rgba(52, 155, 104, 0.24);
  }

  .journal-proof-card--reverted {
    border-color: rgba(170, 93, 72, 0.28);
  }

  .journal-proof-card--quarantined {
    border-color: rgba(191, 141, 66, 0.28);
  }

  @media (max-width: 1100px) {
    .journal-stage__layout,
    .journal-ledgers {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 900px) {
    .journal-note,
    .journal-highlight-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
