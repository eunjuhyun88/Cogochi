<script lang="ts">
  import { browser } from '$app/environment';
  import { onMount } from 'svelte';
  import DoctrineTerminalPanel from '$components/shared/DoctrineTerminalPanel.svelte';
  import PageShell from '$components/shared/PageShell.svelte';
  import ComparePanel from '$components/shared/ComparePanel.svelte';
  import { confidenceLabels, evalScenarios, indicatorPresetLabels, memoryBiasLabels, memoryTierLabels, scriptPresetLabels } from '$lib/data/seed';
  import { compareLoadouts } from '$lib/engine/eval-engine';
  import { buildMemoryTierSummary } from '$lib/services/memory/writeback';
  import { labStore } from '$lib/stores/labStore';
  import { rosterStore } from '$lib/stores/rosterStore';
  import type { MutationDecision } from '$lib/types';
  import type { PageData } from './$types';

  let { data }: { data: PageData } = $props();

  const agents = $derived($rosterStore.agents);
  const activeAgentId = $derived($labStore.activeAgentId || agents[0]?.id || '');
  const activeAgent = $derived(agents.find((agent) => agent.id === activeAgentId) ?? null);
  const activeDoctrineSessionId = $derived.by(() => (activeAgent ? $labStore.activeDoctrineSessionIds[activeAgent.id] ?? null : null));
  const activeDoctrineSession = $derived.by(() => {
    $labStore;
    return activeAgent && activeDoctrineSessionId ? labStore.getDoctrineSession(activeAgent.id, activeDoctrineSessionId) : null;
  });
  const draft = $derived(activeAgent ? labStore.getDraft(activeAgent.id) : null);
  const memorySummary = $derived(activeAgent ? buildMemoryTierSummary(activeAgent.memoryBank) : null);
  const comparison = $derived(
    activeAgent && draft ? compareLoadouts(activeAgent, activeAgent.loadout, draft, $labStore.activeScenarioId) : null,
  );
  const proofHref = $derived.by(() => {
    if (!activeAgent || !activeDoctrineSession) {
      return '/proof';
    }

    const params = new URLSearchParams({
      agent: activeAgent.id,
      session: activeDoctrineSession.id,
    });
    if (activeDoctrineSession.recommendedProofPackId) {
      params.set('pack', activeDoctrineSession.recommendedProofPackId);
    }
    return `/proof?${params.toString()}`;
  });
  const verdictOptions: Array<{ id: MutationDecision; label: string; helper: string }> = [
    { id: 'ACCEPTED', label: 'Keep mutation', helper: 'Promote the body change and lock it into the next field run.' },
    { id: 'QUARANTINED', label: 'Quarantine', helper: 'Keep the mutation in review without promoting it to the live body.' },
    { id: 'REVERTED', label: 'Revert mutation', helper: 'Reject the mutation and preserve the current body.' },
  ];

  $effect(() => {
    if (activeAgent) {
      labStore.ensureDraft(activeAgent.id);
    }
  });

  onMount(() => {
    if (!browser) {
      return;
    }

    const params = new URLSearchParams(window.location.search);
    const agentId = params.get('agent');
    const sessionId = params.get('session');
    if (agentId && agents.some((agent) => agent.id === agentId)) {
      labStore.setActiveAgent(agentId);
      labStore.ensureDraft(agentId);
      rosterStore.selectAgent(agentId);
      if (sessionId) {
        labStore.setActiveDoctrineSession(agentId, sessionId);
      }
    }
  });
</script>

<PageShell>
  {#if activeAgent}
    <section class="doctrine-wrap">
      <DoctrineTerminalPanel agentId={activeAgent.id} agentName={activeAgent.name} quickPrompts={data.quickPrompts} />
    </section>
  {/if}

  <section class="grid-2">
    <article class="panel lab-panel">
      <div class="stack">
        <div>
          <p class="section-kicker">Lab</p>
          <h1 class="section-title">Propose one mutation and run the proof pack.</h1>
        </div>

        <label class="field">
          <span>Agent</span>
          <select
            value={$labStore.activeAgentId}
            onchange={(event) => {
              const value = (event.currentTarget as HTMLSelectElement).value;
              labStore.setActiveAgent(value);
              labStore.ensureDraft(value);
            }}
          >
            {#each agents as agent}
              <option value={agent.id}>{agent.name}</option>
            {/each}
          </select>
        </label>

        <label class="field">
          <span>Scenario</span>
          <select value={$labStore.activeScenarioId} onchange={(event) => labStore.setActiveScenario((event.currentTarget as HTMLSelectElement).value)}>
            {#each evalScenarios as scenario}
              <option value={scenario.id}>{scenario.label}</option>
            {/each}
          </select>
        </label>

        {#if activeAgent && draft}
          <label class="field">
            <span>Indicator profile</span>
            <select
              value={draft.indicatorPresetId}
              onchange={(event) => labStore.patchDraft(activeAgent.id, { indicatorPresetId: (event.currentTarget as HTMLSelectElement).value as typeof draft.indicatorPresetId })}
            >
              {#each Object.entries(indicatorPresetLabels) as [id, label]}
                <option value={id}>{label}</option>
              {/each}
            </select>
          </label>

          <label class="field">
            <span>Script rule</span>
            <select
              value={draft.scriptPresetId}
              onchange={(event) => labStore.patchDraft(activeAgent.id, { scriptPresetId: (event.currentTarget as HTMLSelectElement).value as typeof draft.scriptPresetId })}
            >
              {#each Object.entries(scriptPresetLabels) as [id, label]}
                <option value={id}>{label}</option>
              {/each}
            </select>
          </label>

          <label class="field">
            <span>Memory bias</span>
            <select
              value={draft.memoryBias}
              onchange={(event) => labStore.patchDraft(activeAgent.id, { memoryBias: (event.currentTarget as HTMLSelectElement).value as typeof draft.memoryBias })}
            >
              {#each Object.entries(memoryBiasLabels) as [id, label]}
                <option value={id}>{label}</option>
              {/each}
            </select>
          </label>

          <label class="field">
            <span>Confidence style</span>
            <select
              value={draft.confidenceStyle}
              onchange={(event) => labStore.patchDraft(activeAgent.id, { confidenceStyle: (event.currentTarget as HTMLSelectElement).value as typeof draft.confidenceStyle })}
            >
              {#each Object.entries(confidenceLabels) as [id, label]}
                <option value={id}>{label}</option>
              {/each}
            </select>
          </label>

          <label class="field">
            <span>Risk tolerance ({draft.riskTolerance})</span>
            <input
              type="range"
              min="10"
              max="90"
              value={draft.riskTolerance}
              oninput={(event) => labStore.patchDraft(activeAgent.id, { riskTolerance: Number((event.currentTarget as HTMLInputElement).value) })}
            />
          </label>

          <label class="field">
            <span>Doctrine note</span>
            <textarea
              rows="5"
              value={draft.doctrineNote}
              oninput={(event) => labStore.patchDraft(activeAgent.id, { doctrineNote: (event.currentTarget as HTMLTextAreaElement).value })}
            ></textarea>
          </label>

          <div class="chip-row">
            {#if comparison}
              {#each verdictOptions as option}
                <button
                  class:selected-verdict={comparison.decision === option.id}
                  class={`action-button ${option.id === 'QUARANTINED' ? 'secondary' : option.id === 'REVERTED' ? 'ghost' : ''}`}
                  onclick={() => labStore.commitDraft(activeAgent.id, option.id)}
                >
                  {option.label}
                </button>
              {/each}
            {/if}
            <button class="action-button secondary" onclick={() => labStore.resetDraft(activeAgent.id)}>Reset draft</button>
            <a class="link-button" href={proofHref}>Open proof packs</a>
            <a class="link-button secondary" href="/battle">Preview battle</a>
            <a class="link-button ghost" href={`/agent/${activeAgent.id}`}>Inspect agent</a>
          </div>
        {/if}
      </div>
    </article>

    <article class="panel lab-panel lab-panel--quiet">
      <div class="stack">
        <div>
          <p class="section-kicker">Mutation bench</p>
          <h2 class="section-title">The same scenario should prove whether this mutation survives.</h2>
        </div>
        <p>
          This lab is intentionally narrow. You are not tweaking candles or faking PnL. You are changing doctrine,
          indicators, scripts, and memory emphasis to see whether the exact same historical situation produces a
          stronger judgment profile, a cleaner captain call, and a mutation worth keeping.
        </p>
        <div class="metric-grid">
          <div class="metric-card">
            <small>Current scenario</small>
            <strong>{evalScenarios.find((scenario) => scenario.id === $labStore.activeScenarioId)?.label}</strong>
          </div>
          <div class="metric-card">
            <small>Projected verdict</small>
            <strong>{comparison?.decision ?? 'No draft yet'}</strong>
            {#if comparison}
              <p>Recommended by the proof pack, but you can override it.</p>
            {/if}
          </div>
          <div class="metric-card">
            <small>Latest proof</small>
            <strong>{activeAgent?.lastComparison?.decisionReason ?? 'No proof run yet'}</strong>
          </div>
        </div>
        {#if activeDoctrineSession}
          <div class="metric-card">
            <small>Current doctrine handoff</small>
            <strong>{activeDoctrineSession.title}</strong>
            <p>{activeDoctrineSession.normalizedIntent}</p>
            <div class="chip-row">
              <span class="chip">{activeDoctrineSession.status}</span>
              {#if activeDoctrineSession.recommendedProofPackId}
                <span class="chip chip--quiet">{activeDoctrineSession.recommendedProofPackId}</span>
              {/if}
            </div>
          </div>
        {/if}
        {#if memorySummary}
          <div class="metric-card">
            <small>Memento memory tiers</small>
            <div class="chip-row">
              {#each Object.entries(memorySummary) as [tier, total]}
                <span class="chip">{memoryTierLabels[tier as keyof typeof memoryTierLabels]} {total}</span>
              {/each}
            </div>
            <p>The mutation bench should change not just stats, but what lands in recent, proven, and legacy memory.</p>
          </div>
        {/if}
        {#if activeAgent && comparison}
          <div class="metric-card">
            <small>Weak link under review</small>
            <strong>{comparison.proposed.weakLink}</strong>
            <p>{comparison.proposed.objection}</p>
          </div>
          <div class="metric-card">
            <small>Reference proof frame</small>
            <strong>{comparison.proposed.proofFrameTitle}</strong>
            <p>{comparison.proposed.proofFrameDateLabel}</p>
          </div>
          <div class="metric-card">
            <small>Visible effect if accepted</small>
            <strong>{comparison.visibleEffect}</strong>
            <p>{comparison.decisionReason}</p>
          </div>
          <div class="metric-card">
            <small>Projected memory landing</small>
            <strong>{comparison.decision === 'ACCEPTED' ? 'Proven memory (M90)' : comparison.decision === 'QUARANTINED' ? 'Recent review (M30)' : 'Recent failure (M30)'}</strong>
            <p>Accepted mutations should become durable playbooks. Rejected ones should stay visible as recent warnings, not disappear.</p>
          </div>
          <div class="verdict-grid">
            {#each verdictOptions as option}
              <button
                class:verdict-card--selected={comparison.decision === option.id}
                class={`verdict-card verdict-card--${option.id.toLowerCase()}`}
                onclick={() => labStore.commitDraft(activeAgent.id, option.id)}
                type="button"
              >
                <strong>{option.label}</strong>
                <span>{option.helper}</span>
              </button>
            {/each}
          </div>
          <div class="chip-row">
            {#each comparison.proposed.trustedInstincts.slice(0, 4) as instinct}
              <span class={`chip chip--${instinct.state.toLowerCase()}`}>{instinct.label} {instinct.weight}</span>
            {/each}
          </div>
        {/if}
      </div>
    </article>
  </section>

  {#if comparison}
    <section class="compare-wrap">
      <ComparePanel {comparison} title="Draft compare before commit" />
    </section>
  {/if}
</PageShell>

<style>
  .doctrine-wrap {
    margin-bottom: 24px;
  }

  .lab-panel {
    padding: 22px;
  }

  .lab-panel--quiet {
    background: rgba(243, 246, 234, 0.88);
  }

  .field {
    display: grid;
    gap: 8px;
  }

  .field span {
    font-size: 0.92rem;
    color: var(--text-soft);
  }

  .field select,
  .field textarea,
  .field input {
    padding: 12px 14px;
    border-radius: 14px;
    border: 1px solid var(--border-strong);
    background: rgba(255, 255, 255, 0.78);
  }

  .compare-wrap {
    margin-top: 18px;
  }

  .chip--trusted {
    border-color: rgba(47, 108, 88, 0.28);
  }

  .chip--weak {
    border-color: rgba(170, 93, 72, 0.28);
  }

  .selected-verdict {
    box-shadow: inset 0 0 0 1px rgba(47, 108, 88, 0.45);
  }

  .verdict-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 12px;
  }

  .verdict-card {
    display: grid;
    gap: 8px;
    padding: 14px;
    border-radius: 16px;
    border: 1px solid var(--border);
    background: rgba(255, 255, 255, 0.72);
    text-align: left;
    cursor: pointer;
  }

  .verdict-card strong,
  .verdict-card span {
    margin: 0;
  }

  .verdict-card span {
    color: var(--text-soft);
    line-height: 1.45;
  }

  .verdict-card--selected {
    box-shadow: 0 14px 28px rgba(56, 66, 58, 0.1);
    transform: translateY(-1px);
  }

  .verdict-card--accepted {
    border-color: rgba(47, 108, 88, 0.24);
  }

  .verdict-card--quarantined {
    border-color: rgba(191, 141, 66, 0.28);
  }

  .verdict-card--reverted {
    border-color: rgba(170, 93, 72, 0.24);
  }

  @media (max-width: 920px) {
    .verdict-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
