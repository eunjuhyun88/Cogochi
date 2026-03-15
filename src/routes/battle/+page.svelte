<script lang="ts">
  import { browser } from '$app/environment';
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import ChartBattlefield from '$components/shared/ChartBattlefield.svelte';
  import PageShell from '$components/shared/PageShell.svelte';
  import { evalScenarios } from '$lib/data/seed';
  import { getHistoricalChartFrame, getScenarioForHistoricalFrame } from '$lib/engine/chart-frame-model';
  import { battleCommandDefinitions } from '$lib/engine/battle-session';
  import { buildBattleView } from '$lib/engine/battle-view';
  import { compareLoadouts } from '$lib/engine/eval-engine';
  import { battleStore } from '$lib/stores/battleStore';
  import { labStore } from '$lib/stores/labStore';
  import { getProofPack } from '$lib/engine/proof-system';
  import { proofStore } from '$lib/stores/proofStore';
  import { rosterStore } from '$lib/stores/rosterStore';
  import type { BattleEntryGate, MutationDecision } from '$lib/types';
  import type { PageData } from './$types';

  type RuntimeEntry = { heading: string; preview: string };
  type RuntimeHighlightedRail = { tier: string; entries: RuntimeEntry[] };

  function briefVerbForGate(gate: BattleEntryGate): string {
    if (gate === 'SPAR') {
      return 'Rehearse';
    }
    if (gate === 'PROOF') {
      return 'Prove';
    }
    return 'Read';
  }

  function briefReasonForCareState(careState: string | null | undefined): string {
    if (careState === 'MEMORY_DRIFT') {
      return 'Keep recall stable before the squad commits.';
    }
    if (careState === 'DOCTRINE_BLUR') {
      return 'Hold the doctrine line and avoid muddy entries.';
    }
    if (careState === 'SQUAD_FRICTION') {
      return 'Force the squad back into one coordinated push.';
    }
    if (careState === 'CONFIDENCE_SHAKE') {
      return 'Take the cleaner line and rebuild confidence.';
    }
    return 'Turn the current read into a clear, visible objective.';
  }

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
  const runtimeHighlightedRails = $derived.by<RuntimeHighlightedRail[]>(
    () => ((data.runtime?.highlightedEntries ?? []) as RuntimeHighlightedRail[]),
  );

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
  const scenarioId = $derived($labStore.activeScenarioId);
  let entryFrameId = $state<string | null>(null);
  let entryGate = $state<'spar' | 'proof' | null>(null);
  const stageScenarioId = $derived(entryFrameId ? getScenarioForHistoricalFrame(entryFrameId) : scenarioId);
  const entryFrame = $derived(entryFrameId ? getHistoricalChartFrame(entryFrameId) : null);
  const session = $derived($battleStore.session);
  const sessionGate = $derived.by<BattleEntryGate>(() => (entryGate === 'spar' ? 'SPAR' : entryGate === 'proof' ? 'PROOF' : 'DIRECT'));
  const draft = $derived(activeAgent ? labStore.getDraft(activeAgent.id) : null);
  const comparison = $derived(
    activeAgent && draft ? compareLoadouts(activeAgent, activeAgent.loadout, draft, stageScenarioId) : null,
  );
  const battleView = $derived(
    activeAgent && session && session.agentId === activeAgent.id && session.scenarioId === stageScenarioId
      ? buildBattleView(activeAgent, agents, session)
      : null,
  );
  const latestLog = $derived(session?.logs[0] ?? null);
  const mutationReview = $derived(comparison ?? activeAgent?.lastComparison ?? null);
  const recentLogs = $derived(session?.logs.slice(0, 3) ?? []);
  const appliedVerdict = $derived(
    session?.writebackApplied ? activeAgent?.mutations[0]?.decision ?? activeAgent?.lastComparison?.decision ?? null : null,
  );
  const activePackId = $derived(session?.doctrineSessionPackId ?? data.selectedProofPackId ?? selectedDoctrineSession?.recommendedProofPackId ?? null);
  const activeProofPack = $derived(activePackId ? getProofPack(activePackId) : null);
  const gateLabel = $derived(sessionGate === 'SPAR' ? 'Spar Gate' : sessionGate === 'PROOF' ? 'Proof Gate' : 'Direct Clash');
  const gateHint = $derived.by(() => {
    if (sessionGate === 'SPAR') {
      return 'Shorter rehearsal battle with softer pressure. Use it to stabilize a mutation before proof.';
    }
    if (sessionGate === 'PROOF') {
      return 'Live proof battle with harder pressure. The verdict should carry real trust consequences.';
    }
    return 'Direct chart clash outside the world loop.';
  });
  const verdictText = $derived.by(() => {
    if (appliedVerdict === 'ACCEPTED') return 'Trainer verdict: mutation kept';
    if (appliedVerdict === 'QUARANTINED') return 'Trainer verdict: mutation quarantined';
    if (appliedVerdict === 'REVERTED') return 'Trainer verdict: mutation reverted';
    return battleView?.verdictLabel ?? 'Battle still unstable';
  });
  const verdictOptions: Array<{ id: MutationDecision; label: string; helper: string }> = [
    { id: 'ACCEPTED', label: 'Keep mutation', helper: 'Promote this field result into the body and trust model.' },
    { id: 'QUARANTINED', label: 'Quarantine', helper: 'Record the result but keep the mutation on the bench.' },
    { id: 'REVERTED', label: 'Revert mutation', helper: 'Reject the field result and preserve the current body.' },
  ];
  const recommendedBattleVerdict = $derived(session?.outcome === 'WIN' ? 'ACCEPTED' : session?.outcome === 'LOSS' ? 'REVERTED' : null);
  const runtimeFocusCheck = $derived.by(() => {
    const candidateChecks = runtimeChecks
      .map((item) => sanitizeRuntimeFocusCheck(item))
      .filter((item): item is string => Boolean(item));
    if (candidateChecks.length === 0) {
      return null;
    }
    if (activeAgent?.careState === 'MEMORY_DRIFT') {
      return candidateChecks.find((item) => item.toLowerCase().includes('memory')) ?? candidateChecks[0];
    }
    if (battleView?.report.weakLink.toLowerCase().includes('risk')) {
      return candidateChecks.find((item) => item.toLowerCase().includes('battle truth')) ?? candidateChecks[0];
    }
    return candidateChecks[0];
  });
  const runtimeFocusRail = $derived(runtimeHighlightedRails.find((entry) => entry.tier === 'M90') ?? runtimeHighlightedRails[0] ?? null);
  const battleBriefTitle = $derived.by(() => {
    const verb = briefVerbForGate(sessionGate);
    const frameTitle = entryFrame?.title ?? battleView?.stageFrame.title ?? 'this chart slice';
    return `${verb} ${frameTitle}`;
  });
  const battleBriefText = $derived.by(() => {
    const reason = briefReasonForCareState(activeAgent?.careState);
    if (runtimeFocusCheck) {
      return `${reason} Focus check: ${runtimeFocusCheck}`;
    }
    return reason;
  });
  const battleBriefTag = $derived.by(() => {
    if (sessionGate === 'SPAR') {
      return 'Safe rehearsal';
    }
    if (sessionGate === 'PROOF') {
      return 'Live proof';
    }
    return 'Direct clash';
  });

  function sessionAwareHref(pathname: '/battle' | '/field' | '/journal'): string {
    const params = new URLSearchParams();
    const hasProofArtifact = pathname !== '/battle' && Boolean(session?.proofArtifactId);
    if (!hasProofArtifact && session?.outcome && pathname !== '/battle' && session.outcome !== 'ONGOING') {
      params.set('return', session.outcome);
    }
    if (!hasProofArtifact && entryFrameId) {
      params.set('frame', entryFrameId);
    }
    if (!hasProofArtifact && appliedVerdict && pathname !== '/battle') {
      params.set('verdict', appliedVerdict);
    }
    if (!hasProofArtifact && entryGate) {
      params.set('gate', entryGate);
    }
    const agentId = activeAgent?.id ?? data.selectedAgentId ?? null;
    const doctrineSessionId = session?.doctrineSessionId ?? data.selectedDoctrineSessionId ?? selectedDoctrineSession?.id ?? null;
    const doctrineSessionPackId = session?.doctrineSessionPackId ?? activePackId;
    if (agentId) {
      params.set('agent', agentId);
    }
    if (doctrineSessionId) {
      params.set('session', doctrineSessionId);
    }
    if (doctrineSessionPackId) {
      params.set('pack', doctrineSessionPackId);
    }
    if (session?.proofArtifactId) {
      params.set('artifact', session.proofArtifactId);
    }
    const query = params.toString();
    return query ? `${pathname}?${query}` : pathname;
  }

  function syncContext(agentId: string, nextScenarioId: string, nextEntryFrameId: string | null = entryFrameId) {
    const agent = agents.find((entry) => entry.id === agentId);
    if (!agent) {
      return;
    }
    entryFrameId = nextEntryFrameId;
    if (browser) {
      const url = new URL(window.location.href);
      if (nextEntryFrameId) {
        url.searchParams.set('entry', 'field');
        url.searchParams.set('frame', nextEntryFrameId);
        if (entryGate) {
          url.searchParams.set('gate', entryGate);
        }
      } else {
        url.searchParams.delete('entry');
        url.searchParams.delete('frame');
        url.searchParams.delete('gate');
      }
      if (agentId) {
        url.searchParams.set('agent', agentId);
      }
      const doctrineSessionId = session?.doctrineSessionId ?? data.selectedDoctrineSessionId ?? selectedDoctrineSession?.id ?? null;
      if (doctrineSessionId) {
        url.searchParams.set('session', doctrineSessionId);
      }
      if (activePackId) {
        url.searchParams.set('pack', activePackId);
      }
      goto(`${url.pathname}${url.search}`, { replaceState: true, noScroll: true, keepFocus: true });
    }
    rosterStore.selectAgent(agentId);
    labStore.setActiveAgent(agentId);
    labStore.ensureDraft(agentId);
    labStore.setActiveScenario(nextScenarioId);
    battleStore.ensureSession(
      agent,
      nextScenarioId,
      nextEntryFrameId,
      sessionGate,
      session?.doctrineSessionId ?? data.selectedDoctrineSessionId ?? selectedDoctrineSession?.id ?? null,
      session?.doctrineSessionTitle ?? selectedDoctrineSession?.title ?? null,
      session?.doctrineSessionPackId ?? activePackId,
    );
  }

  function executeSelectedCommand() {
    if (!activeAgent || !session || session.outcome !== 'ONGOING') {
      return;
    }
    battleStore.execute(activeAgent);
  }

  function resetBattle() {
    if (!activeAgent) {
      return;
    }
    battleStore.reset(
      activeAgent,
      stageScenarioId,
      entryFrameId,
      sessionGate,
      session?.doctrineSessionId ?? data.selectedDoctrineSessionId ?? selectedDoctrineSession?.id ?? null,
      session?.doctrineSessionTitle ?? selectedDoctrineSession?.title ?? null,
      session?.doctrineSessionPackId ?? activePackId,
    );
  }

  function applyBattleVerdict(decision: MutationDecision) {
    if (!activeAgent || !session || session.outcome === 'ONGOING' || session.writebackApplied) {
      return;
    }
    const writeback = rosterStore.applyBattleOutcome(
      activeAgent.id,
      stageScenarioId,
      session.outcome,
      entryFrameId,
      decision,
      session.doctrineSessionTitle ?? selectedDoctrineSession?.title ?? null,
    );
    if (!writeback) {
      return;
    }
    const artifact = proofStore.recordArtifact({
      agentId: activeAgent.id,
      agentName: activeAgent.name,
      scenarioId: stageScenarioId,
      frameId: entryFrame?.id ?? entryFrameId,
      frameTitle: writeback.mutation.proofFrameTitle,
      frameDateLabel: entryFrame?.dateLabel ?? null,
      entryGate: session.entryGate,
      proofPackId: activePackId,
      proofPackTitle: activeProofPack?.title ?? null,
      doctrineSessionId: session.doctrineSessionId ?? selectedDoctrineSession?.id ?? null,
      doctrineTitle: session.doctrineSessionTitle ?? selectedDoctrineSession?.title ?? null,
      doctrineNormalizedIntent: selectedDoctrineSession?.normalizedIntent ?? null,
      criteriaSummary: selectedDoctrineSession?.criteriaSummary ?? [],
      overlaySpec: selectedDoctrineSession?.overlaySpec ?? null,
      battleOutcome: session.outcome,
      trainerVerdict: decision,
      mutationId: writeback.mutation.id,
      mutationTitle: writeback.mutation.title,
      mutationReason: writeback.mutation.reason,
      visibleEffect: writeback.mutation.visibleEffect,
      trustBefore: writeback.previousAgent.trustWeight,
      trustAfter: writeback.nextAgent.trustWeight,
      trustDelta: writeback.nextAgent.trustWeight - writeback.previousAgent.trustWeight,
      growthStageBefore: writeback.previousAgent.growthStage,
      growthStageAfter: writeback.nextAgent.growthStage,
      careStateAfter: writeback.nextAgent.careState,
    });
    battleStore.markWritebackApplied(artifact.id);
  }

  function returnToField() {
    if (session?.outcome !== 'ONGOING' && !session?.writebackApplied) {
      return;
    }
    goto(sessionAwareHref('/field'));
  }

  function openJournal() {
    if (session?.outcome !== 'ONGOING' && !session?.writebackApplied) {
      return;
    }
    goto(sessionAwareHref('/journal'));
  }

  $effect(() => {
    if (activeAgent) {
      labStore.ensureDraft(activeAgent.id);
      battleStore.ensureSession(
        activeAgent,
        stageScenarioId,
        entryFrameId,
        sessionGate,
        data.selectedDoctrineSessionId ?? selectedDoctrineSession?.id ?? null,
        selectedDoctrineSession?.title ?? null,
        activePackId,
      );
    }
  });

  onMount(() => {
    if (!browser) {
      return;
    }

    const params = new URLSearchParams(window.location.search);
    const nextEntryFrameId = params.get('frame');
    const resolvedFrameId = nextEntryFrameId && getHistoricalChartFrame(nextEntryFrameId) ? nextEntryFrameId : null;
    const resolvedGate = params.get('gate');
    entryGate = resolvedGate === 'spar' || resolvedGate === 'proof' ? resolvedGate : null;
    const nextAgentId = params.get('agent');
    if (nextAgentId && agents.some((agent) => agent.id === nextAgentId)) {
      rosterStore.selectAgent(nextAgentId);
      labStore.setActiveAgent(nextAgentId);
      labStore.ensureDraft(nextAgentId);
    }
    const nextDoctrineSessionId = params.get('session');
    if (nextAgentId && nextDoctrineSessionId) {
      labStore.setActiveDoctrineSession(nextAgentId, nextDoctrineSessionId);
    }
    if (resolvedFrameId) {
      entryFrameId = resolvedFrameId;
      const mappedScenarioId = getScenarioForHistoricalFrame(resolvedFrameId);
      if (mappedScenarioId !== scenarioId) {
        labStore.setActiveScenario(mappedScenarioId);
      }
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (!session || !activeAgent) {
        return;
      }

      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        battleStore.moveSelection('left');
        return;
      }
      if (event.key === 'ArrowRight') {
        event.preventDefault();
        battleStore.moveSelection('right');
        return;
      }
      if (event.key === 'ArrowUp') {
        event.preventDefault();
        battleStore.moveSelection('up');
        return;
      }
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        battleStore.moveSelection('down');
        return;
      }
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        executeSelectedCommand();
        return;
      }
      if (event.key.toLowerCase() === 'r') {
        event.preventDefault();
        resetBattle();
        return;
      }

      const match = battleCommandDefinitions.find((item) => item.hotkey === event.key);
      if (match) {
        event.preventDefault();
        battleStore.selectCommand(match.id);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  });

  $effect(() => {
    if (!browser || !battleView || !session) {
      return;
    }

    window.__cogochi_text_state = () => ({
      mode: 'battle-console',
      agent: battleView.selectedAgent.name,
      family: battleView.selectedAgent.family,
      scenario: battleView.scenario.label,
      stageFrame: battleView.stageFrame.title,
      outcome: session.outcome,
      writebackApplied: session.writebackApplied,
      turn: session.turn,
      selectedCommand: session.selectedCommandId,
      verdict: verdictText,
      action: battleView.report.action,
      totalScore: battleView.report.totalScore,
      supportIntegrity: session.supportIntegrity,
      structureIntegrity: session.structureIntegrity,
      trapRisk: session.trapRisk,
      squad: battleView.squad.map((agent) => `${agent.role}:${agent.name}`),
      latestLog: latestLog?.title ?? null,
      proofFrame: battleView.report.proofFrameTitle,
      doctrineSession: session.doctrineSessionTitle,
      battleBriefTitle,
      battleBriefText,
      weakLink: battleView.report.weakLink,
      trustedInstincts: battleView.report.trustedInstincts.map((instinct) => instinct.label),
      latestLesson: activeAgent?.recentLesson ?? null,
    });

    return () => {
      delete window.__cogochi_text_state;
    };
  });
</script>

<PageShell>
  {#if battleView && session}
    <section class="battle-hero">
      <div class="battle-hero__main">
        <section class="panel battle-stage-shell">
          <div class="battle-toolbar__top battle-stage-shell__hero">
            <div class="battle-toolbar__title">
              <p class="section-kicker">Entry Gate</p>
              <div class="chip-row battle-toolbar__chips">
                <span class="chip chip--gate">{gateLabel}</span>
                {#if entryFrame}
                  <span class="chip">{entryFrame.title}</span>
                  <span class="chip">{entryFrame.dateLabel}</span>
                {/if}
                <span class="chip">Agent {battleView.selectedAgent.name}</span>
              </div>
              <h1 class="section-title">{battleBriefTitle}</h1>
              <p class="battle-stage-shell__summary">{gateHint}</p>
            </div>

            <div class="battle-toolbar__controls">
              <label class="field">
                <span>Agent</span>
                <select value={activeAgentId} onchange={(event) => syncContext((event.currentTarget as HTMLSelectElement).value, stageScenarioId)}>
                  {#each agents as agent}
                    <option value={agent.id}>{agent.name}</option>
                  {/each}
                </select>
              </label>

              <label class="field">
                <span>Scenario</span>
                <select value={stageScenarioId} onchange={(event) => syncContext(activeAgentId, (event.currentTarget as HTMLSelectElement).value, null)}>
                  {#each evalScenarios as scenario}
                    <option value={scenario.id}>{scenario.label}</option>
                  {/each}
                </select>
              </label>
            </div>
          </div>

          <div class="battle-stage-shell__frame">
            <div class="chip-row battle-stage-shell__status">
              <span class="chip">Turn {Math.min(session.turn, session.turnLimit)} / {session.turnLimit}</span>
              <span class="chip">Support {session.supportIntegrity}</span>
              <span class="chip">Wall {session.structureIntegrity}</span>
              <span class="chip">Trap {session.trapRisk}</span>
              <span class="chip">Momentum {session.pushMomentum}</span>
            </div>
            <ChartBattlefield view={battleView} />
          </div>

          <div class="battle-brief battle-stage-shell__brief">
            <span class="battle-brief__tag">{battleBriefTag}</span>
            <strong>{battleView.stageFrame.title}</strong>
            <p>{battleBriefText}</p>
            {#if session.doctrineSessionTitle}
              <div class="chip-row">
                <span class="chip chip--quiet">Doctrine {session.doctrineSessionTitle}</span>
                {#if session.doctrineSessionPackId}
                  <span class="chip chip--quiet">Pack {session.doctrineSessionPackId}</span>
                {/if}
              </div>
            {/if}
          </div>
        </section>

        <section class="panel battle-command-panel">
          <div class="battle-command-panel__prompt">
            <div>
              <p class="section-kicker">Command Deck</p>
              <h2 class="section-title">{battleView.report.action}</h2>
            </div>
            <p>{latestLog?.summary ?? 'Choose one clean command and push the active slice toward your read.'}</p>
          </div>

          <div class="battle-command-grid">
            {#each battleView.commandCards as card}
              <button
                class:selected={card.selected}
                class:lastUsed={card.lastUsed}
                class={`battle-command battle-command--${card.tone}`}
                onclick={() => battleStore.selectCommand(card.id)}
                type="button"
              >
                <div class="battle-command__meta">
                  <span class="battle-command__hotkey">{card.hotkey}</span>
                  {#if card.lastUsed}
                    <span class="battle-command__state">Last used</span>
                  {:else if card.selected}
                    <span class="battle-command__state">Selected</span>
                  {/if}
                </div>
                <strong>{card.label}</strong>
                <span>{card.summary}</span>
              </button>
            {/each}
          </div>

          <div class="battle-command-panel__actions">
            <button class="action-button" disabled={session.outcome !== 'ONGOING'} onclick={executeSelectedCommand}>
              {session.outcome === 'ONGOING' ? 'Commit selected command' : session.outcome === 'WIN' ? 'Battle won' : 'Battle lost'}
            </button>
            <button class="action-button secondary" onclick={resetBattle}>Reset battle</button>
            <button class="action-button secondary" disabled={session.outcome !== 'ONGOING' && !session.writebackApplied} onclick={openJournal}>
              {session.outcome !== 'ONGOING' && !session.writebackApplied ? 'Choose verdict first' : 'Open journal review'}
            </button>
            <button class="action-button tertiary" disabled={session.outcome !== 'ONGOING' && !session.writebackApplied} onclick={returnToField}>
              {session.outcome !== 'ONGOING' && !session.writebackApplied ? 'Choose verdict first' : 'Return to field'}
            </button>
            <p class="battle-command-panel__hint">Controls: `1-4` choose a card, arrows move selection, `Enter` commits, `R` resets.</p>
          </div>

          {#if session.outcome !== 'ONGOING' && !session.writebackApplied}
            <div class="battle-verdict-block">
              <div>
                <p class="section-kicker">Trainer Verdict</p>
                <h2 class="section-title">Choose what survives this proof</h2>
              </div>

              <div class="battle-verdict-grid">
                {#each verdictOptions as option}
                  <button
                    class:verdict-card--selected={recommendedBattleVerdict === option.id}
                    class={`verdict-card verdict-card--${option.id.toLowerCase()}`}
                    onclick={() => applyBattleVerdict(option.id)}
                    type="button"
                  >
                    <strong>{option.label}</strong>
                    <span>{option.helper}</span>
                  </button>
                {/each}
              </div>
            </div>
          {/if}

          {#if session.writebackApplied}
            <div class="battle-resolution-grid">
              <div class="battle-delta">
                <small>Battle writeback</small>
                <strong>{activeAgent?.recentTrainingFocus ?? 'Field proof recorded'}</strong>
                <p>{activeAgent?.recentLesson ?? 'The field result is now part of this creature\'s evolution history.'}</p>
                {#if session.doctrineSessionTitle}
                  <div class="chip-row">
                    <span class="chip chip--quiet">{session.doctrineSessionTitle}</span>
                  </div>
                {/if}
              </div>

              {#if runtimeFocusCheck}
                <div class="battle-delta battle-delta--runtime">
                  <small>Nightly distill</small>
                  <strong>{runtimeFocusCheck}</strong>
                  <p>{data.runtime.distill.goal ?? 'Runtime distill is advisory only and should not override deterministic battle truth.'}</p>
                </div>
              {/if}
            </div>
          {/if}
        </section>
      </div>

      <aside class="battle-hero__rail">
        <article class="panel battle-panel battle-panel--rail">
          <div class="stack">
            <div>
              <p class="section-kicker">Captain Call</p>
              <h2 class="section-title">{battleView.report.captainCall}</h2>
            </div>
            <p>{battleView.report.objection}</p>
            <div class="chip-row">
              <span class="chip">Confidence {battleView.report.confidence}</span>
              <span class="chip">Score {battleView.report.totalScore}</span>
              <span class="chip">Weak link {battleView.report.weakLink}</span>
              <span class="chip">Proof {battleView.report.proofFrameTitle}</span>
            </div>
            <div class="chip-row">
              {#each battleView.report.trustedInstincts.slice(0, 4) as instinct}
                <span class={`chip chip--${instinct.state.toLowerCase()}`}>{instinct.label} {instinct.weight}</span>
              {/each}
            </div>
          </div>
        </article>

        <article class="panel battle-panel battle-panel--rail">
          <div class="stack">
            <div>
              <p class="section-kicker">Battle Log</p>
              <h2 class="section-title">{latestLog?.title ?? 'Opening move'}</h2>
            </div>
            {#each recentLogs as log}
              <div class={`battle-log battle-log--${log.tone}`}>
                <strong>{log.turn === 0 ? 'Boot' : `Turn ${log.turn}`}</strong>
                <p>{log.title}</p>
              </div>
            {/each}
          </div>
        </article>

        <article class="panel battle-panel battle-panel--rail">
          <div class="stack">
            <div>
              <p class="section-kicker">Mutation Pressure</p>
              <h2 class="section-title">{verdictText}</h2>
            </div>

            <div class="metric-grid battle-panel__metrics">
              <div class="metric-card">
                <small>Accuracy</small>
                <strong>{battleView.report.accuracyScore}</strong>
              </div>
              <div class="metric-card">
                <small>Risk</small>
                <strong>{battleView.report.riskScore}</strong>
              </div>
              <div class="metric-card">
                <small>Retrieval</small>
                <strong>{battleView.report.retrievalScore}</strong>
              </div>
              <div class="metric-card">
                <small>Proof frame</small>
                <strong>{battleView.report.proofFrameDateLabel}</strong>
              </div>
            </div>

            {#if mutationReview}
              <div class="battle-delta">
                <small>Mutation review</small>
                <strong>{mutationReview.summary}</strong>
                <p>{mutationReview.visibleEffect}</p>
              </div>
            {/if}

            <div class="chip-row">
              <a class="link-button" href={`/lab?agent=${battleView.selectedAgent.id}${session.doctrineSessionId ? `&session=${session.doctrineSessionId}` : ''}`}>
                Tune this agent
              </a>
              <a class="link-button secondary" href={`/agent/${battleView.selectedAgent.id}`}>Inspect details</a>
            </div>
          </div>
        </article>

        {#if runtimeFocusRail}
          <article class="panel battle-panel battle-panel--rail">
            <div class="stack">
              <div>
                <p class="section-kicker">Runtime Rail</p>
                <h2 class="section-title">{data.runtime.distill.goal ?? 'Runtime memory rail'}</h2>
              </div>
              <div class="chip-row">
                <span class="chip">Indexed {data.runtime.memoryIndexCount}</span>
                <span class="chip">{runtimeFocusRail.tier}</span>
              </div>
              {#each runtimeFocusRail.entries.slice(0, 3) as entry}
                <div class="battle-log battle-log--info">
                  <strong>{entry.heading}</strong>
                  <p>{entry.preview}</p>
                </div>
              {/each}
            </div>
          </article>
        {/if}
      </aside>
    </section>
  {:else}
    <section class="panel battle-boot">
      <p class="section-kicker">Preparing encounter</p>
      <h1 class="section-title">Assembling the chart battlefield...</h1>
      <p>The squad, command deck, and proof frame are syncing before the clash begins.</p>
    </section>
  {/if}
</PageShell>

<style>
  .battle-hero {
    display: grid;
    grid-template-columns: minmax(0, 1.62fr) minmax(300px, 0.74fr);
    gap: 18px;
    align-items: start;
  }

  .battle-hero__main,
  .battle-hero__rail {
    display: grid;
    gap: 18px;
  }

  .battle-toolbar,
  .battle-panel,
  .battle-command-panel,
  .battle-stage-shell {
    padding: 20px;
  }

  .battle-toolbar,
  .battle-panel,
  .battle-command-panel {
    background:
      linear-gradient(180deg, rgba(252, 248, 240, 0.95), rgba(244, 237, 223, 0.92));
    border-color: rgba(146, 139, 110, 0.14);
  }

  .battle-stage-shell {
    display: grid;
    gap: 14px;
    background:
      radial-gradient(circle at top left, rgba(255, 223, 149, 0.18), transparent 28%),
      linear-gradient(180deg, rgba(248, 244, 232, 0.96), rgba(237, 231, 214, 0.94));
    border-color: rgba(150, 139, 103, 0.16);
  }

  .battle-toolbar__top {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    gap: 18px;
    align-items: start;
  }

  .battle-toolbar__title h1,
  .battle-toolbar__title p,
  .battle-panel h2,
  .battle-panel p,
  .battle-command-panel h2,
  .battle-command-panel p,
  .battle-stage-shell h1,
  .battle-stage-shell p {
    margin: 0;
  }

  .battle-toolbar__chips {
    margin: 8px 0 12px;
  }

  .battle-stage-shell__summary {
    max-width: 58ch;
    color: var(--text-soft);
    line-height: 1.45;
  }

  .battle-brief {
    padding: 16px 18px;
    border-radius: 20px;
    border: 1px solid rgba(126, 173, 120, 0.2);
    background: rgba(235, 246, 229, 0.78);
    display: grid;
    gap: 8px;
  }

  .battle-brief strong {
    font-size: 1rem;
    color: #1f2b24;
  }

  .battle-brief p {
    color: var(--text-soft);
    line-height: 1.45;
  }

  .battle-brief__tag {
    width: fit-content;
    padding: 4px 8px;
    border-radius: 999px;
    background: rgba(31, 76, 59, 0.1);
    color: #1f4c3b;
    font-size: 0.72rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  .battle-toolbar__controls {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 220px));
    gap: 12px;
  }

  .field {
    display: grid;
    gap: 8px;
  }

  .field span {
    font-size: 0.92rem;
    color: var(--text-soft);
  }

  .field select {
    padding: 12px 14px;
    border-radius: 14px;
    border: 1px solid var(--border-strong);
    background: rgba(255, 255, 255, 0.88);
  }

  .battle-stage-shell__frame {
    display: grid;
    gap: 12px;
  }

  .battle-stage-shell__status {
    justify-content: space-between;
  }

  .battle-stage-shell__frame :global(.battlefield) {
    margin: 0;
  }

  .battle-stage-shell__brief {
    background: rgba(235, 246, 229, 0.72);
  }

  .battle-command-panel {
    display: grid;
    gap: 18px;
  }

  .battle-command-panel__prompt {
    display: grid;
    gap: 10px;
  }

  .battle-command-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
  }

  .battle-command {
    display: grid;
    gap: 10px;
    text-align: left;
    align-content: start;
    min-height: 154px;
    padding: 16px;
    border-radius: 22px;
    border: 1px solid rgba(151, 143, 110, 0.2);
    background:
      linear-gradient(180deg, rgba(255, 251, 243, 0.94), rgba(246, 240, 229, 0.88));
    cursor: pointer;
    transition: transform 120ms ease, border-color 120ms ease, box-shadow 120ms ease, background 120ms ease;
  }

  .battle-command:hover,
  .battle-command.selected {
    transform: translateY(-1px);
    box-shadow: 0 16px 28px rgba(114, 101, 64, 0.12);
  }

  .battle-command.selected {
    border-color: rgba(74, 144, 103, 0.4);
    background:
      linear-gradient(180deg, rgba(231, 246, 233, 0.98), rgba(220, 238, 222, 0.94));
  }

  .battle-command.lastUsed {
    box-shadow:
      inset 0 0 0 1px rgba(211, 172, 83, 0.46),
      0 12px 26px rgba(114, 101, 64, 0.1);
  }

  .battle-command--danger {
    border-color: rgba(170, 93, 72, 0.24);
  }

  .battle-command--secondary {
    border-color: rgba(88, 123, 167, 0.2);
  }

  .battle-command__meta {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
  }

  .battle-command__hotkey,
  .battle-command__state {
    width: fit-content;
    padding: 5px 9px;
    border-radius: 999px;
    font-size: 0.72rem;
  }

  .battle-command__hotkey {
    background: rgba(244, 233, 204, 0.88);
    color: #7b5d24;
  }

  .battle-command__state {
    background: rgba(83, 151, 111, 0.12);
    color: #2e6a50;
  }

  .battle-command strong {
    font-size: 1rem;
    color: #1f2b24;
  }

  .battle-command span:last-child {
    color: var(--text-soft);
    line-height: 1.45;
  }

  .battle-command-panel__actions {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
    align-items: center;
  }

  .battle-command-panel__hint {
    color: var(--text-soft);
    font-size: 0.92rem;
  }

  .battle-verdict-block {
    display: grid;
    gap: 14px;
    padding-top: 4px;
    border-top: 1px solid rgba(74, 84, 66, 0.12);
  }

  .battle-verdict-grid,
  .battle-resolution-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 12px;
  }

  .battle-resolution-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .verdict-card {
    display: grid;
    gap: 8px;
    padding: 14px;
    border-radius: 16px;
    border: 1px solid var(--border);
    background: rgba(255, 252, 244, 0.78);
    text-align: left;
    cursor: pointer;
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

  .battle-panel--rail {
    min-height: 100%;
  }

  .battle-panel__metrics {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .battle-log {
    padding: 14px;
    border-radius: 18px;
    border: 1px solid var(--border);
    background: rgba(255, 255, 255, 0.68);
  }

  .battle-log strong {
    display: block;
    margin-bottom: 6px;
    font-size: 0.82rem;
    color: var(--text-soft);
  }

  .battle-log p {
    color: #233128;
    line-height: 1.4;
    font-weight: 600;
  }

  .battle-log--good {
    border-color: rgba(52, 155, 104, 0.24);
  }

  .battle-log--warn {
    border-color: rgba(191, 141, 66, 0.28);
  }

  .battle-log--danger {
    border-color: rgba(170, 93, 72, 0.28);
  }

  .battle-delta {
    padding: 16px;
    border-radius: 18px;
    border: 1px solid rgba(47, 108, 88, 0.22);
    background: rgba(220, 236, 223, 0.62);
  }

  .battle-delta strong {
    display: block;
    margin: 8px 0;
    font-size: 1.35rem;
    color: #1f4c3b;
  }

  .battle-delta p {
    color: var(--text-soft);
  }

  .chip--trusted {
    border-color: rgba(47, 108, 88, 0.28);
  }

  .chip--weak {
    border-color: rgba(170, 93, 72, 0.28);
  }

  .chip--gate {
    border-color: rgba(47, 108, 88, 0.24);
    color: #1f4c3b;
  }

  .battle-boot {
    display: grid;
    gap: 12px;
    padding: 26px;
    background:
      radial-gradient(circle at top left, rgba(255, 226, 153, 0.2), transparent 28%),
      linear-gradient(180deg, rgba(252, 248, 240, 0.96), rgba(244, 237, 223, 0.92));
  }

  .battle-boot p {
    margin: 0;
    color: var(--text-soft);
  }

  @media (max-width: 1180px) {
    .battle-hero {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 900px) {
    .battle-toolbar__top,
    .battle-toolbar__controls,
    .battle-verdict-grid,
    .battle-resolution-grid {
      grid-template-columns: 1fr;
    }

    .battle-toolbar__top {
      display: grid;
    }

    .battle-toolbar__controls {
      width: 100%;
    }

    .battle-stage-shell__status {
      justify-content: flex-start;
    }
  }

  @media (max-width: 700px) {
    .battle-command-grid,
    .battle-panel__metrics {
      grid-template-columns: 1fr;
    }
  }
</style>
