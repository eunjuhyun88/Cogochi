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
  import type { BattleCommandId, BattleEntryGate, MutationDecision } from '$lib/types';
  import type { PageData } from './$types';

  type RuntimeEntry = { heading: string; preview: string };
  type RuntimeHighlightedRail = { tier: string; entries: RuntimeEntry[] };
  type BattleRailTabId = 'captain' | 'comms' | 'stakes' | 'memory';

  const battleMenuCopy: Record<BattleCommandId, { verb: string; flavor: string }> = {
    FOCUS_TAP: {
      verb: 'Push',
      flavor: 'Drive the lane forward.',
    },
    MEMORY_PULSE: {
      verb: 'Read',
      flavor: 'Check the replay first.',
    },
    RISK_VETO: {
      verb: 'Guard',
      flavor: 'Block the bad line.',
    },
    RETARGET: {
      verb: 'Shift',
      flavor: 'Move to the live gate.',
    },
  };

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

  function flavorRuntimeCue(text: string | null): string | null {
    if (!text) {
      return null;
    }
    const lower = text.toLowerCase();
    if (lower.includes('memory')) {
      return 'Re-anchor the memory rail before the next proof.';
    }
    if (lower.includes('bundle') || lower.includes('doctrine') || lower.includes('prompt')) {
      return 'Retighten the room rules before the next proof.';
    }
    if (lower.includes('battle truth') || lower.includes('calibration')) {
      return 'Rehearse until the squad can trust this read again.';
    }
    if (lower.includes('context') || lower.includes('surface') || lower.includes('program')) {
      return 'Reset the room rules so the next gate reads cleanly.';
    }
    return text;
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
  const battleContract = $derived(battleView?.encounter ?? null);
  const latestLog = $derived(session?.logs[0] ?? null);
  const battleMenuCards = $derived.by(
    () =>
      (battleView?.commandCards ?? []).map((card) => ({
        ...card,
        battleVerb: battleMenuCopy[card.id].verb,
        battleFlavor: battleMenuCopy[card.id].flavor,
      })),
  );
  const selectedCommandCard = $derived.by(() => battleMenuCards.find((card) => card.selected) ?? battleMenuCards[0] ?? null);
  const recommendedCommandCard = $derived.by(() => battleMenuCards.find((card) => card.recommended) ?? null);
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
  const battleFocusCue = $derived.by(() => flavorRuntimeCue(runtimeFocusCheck));
  const runtimeRailEntries = $derived.by(() =>
    (runtimeFocusRail?.entries ?? []).slice(0, 2).map((entry) => ({
      heading: entry.heading,
      preview: entry.preview.length <= 110 ? entry.preview : `${entry.preview.slice(0, 107).trim()}...`,
    })),
  );
  const battleRailTabs = $derived.by<Array<{ id: BattleRailTabId; label: string }>>(() => {
    const tabs: Array<{ id: BattleRailTabId; label: string }> = [
      { id: 'captain', label: 'Captain' },
      { id: 'comms', label: 'Comms' },
      { id: 'stakes', label: 'Stakes' },
    ];
    if (runtimeFocusRail) {
      tabs.push({ id: 'memory', label: 'Memory' });
    }
    return tabs;
  });
  let activeRailTab = $state<BattleRailTabId>('captain');
  $effect(() => {
    if (!battleRailTabs.some((tab) => tab.id === activeRailTab)) {
      activeRailTab = battleRailTabs[0]?.id ?? 'captain';
    }
  });
  const battleBriefTitle = $derived.by(() => {
    const verb = briefVerbForGate(sessionGate);
    const frameTitle = entryFrame?.title ?? battleView?.stageFrame.title ?? 'this chart slice';
    return `${verb} ${frameTitle}`;
  });
  const battleBriefText = $derived.by(() => {
    const reason = briefReasonForCareState(activeAgent?.careState);
    if (battleFocusCue) {
      return `${reason} Focus check: ${battleFocusCue}`;
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
  const battleMenuHeading = $derived.by(() => {
    if (session?.outcome === 'WIN') {
      return 'Field control secured';
    }
    if (session?.outcome === 'LOSS') {
      return 'Field line collapsed';
    }
    return selectedCommandCard ? `${selectedCommandCard.battleVerb} ready` : 'Choose a command';
  });
  const battleMenuPrompt = $derived.by(() => {
    if (session?.outcome === 'WIN') {
      return 'The push held. Record what survives this proof before returning to the field.';
    }
    if (session?.outcome === 'LOSS') {
      return 'The push failed. Decide whether this mutation should be kept, quarantined, or reverted.';
    }
    return selectedCommandCard?.battleFlavor ?? latestLog?.summary ?? 'Choose one clean command and push the active slice toward your read.';
  });
  const battleRecommendedVerb = $derived.by(
    () => (battleContract ? battleMenuCopy[battleContract.recommendedCommandId].verb : recommendedCommandCard?.battleVerb ?? null),
  );
  let dossierOpen = $state(false);

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
      turnLabel: battleContract?.turnLabel ?? null,
      phaseLabel: battleContract?.phaseLabel ?? null,
      turnQuestion: battleContract?.question ?? null,
      recommendedCommand: battleContract?.recommendedCommandId ?? null,
      dossierOpen,
      weakLink: battleView.report.weakLink,
      trustedInstincts: battleView.report.trustedInstincts.map((instinct) => instinct.label),
      latestLesson: activeAgent?.recentLesson ?? null,
    });

    return () => {
      delete window.__cogochi_text_state;
    };
  });
</script>

<PageShell compact condensed minimal>
  <div class="battle-page">
    {#if battleView && session}
      <section class="battle-hero">
        <div class="battle-hero__main">
          <section class="panel battle-stage-shell">
          <div class="battle-toolbar__top battle-stage-shell__hero">
            <div class="battle-toolbar__title battle-toolbar__title--contract">
              <div class="battle-toolbar__eyebrow">
                <p class="section-kicker">Turn Contract</p>
                <div class="chip-row battle-toolbar__chips">
                  <span class="chip chip--gate">{gateLabel}</span>
                  <span class="chip">{battleView.stageFrame.title}</span>
                  <span class="chip chip--quiet">{battleContract?.turnLabel ?? battleBriefTag}</span>
                </div>
              </div>
              <h1 class="section-title">{battleContract?.phaseLabel ?? battleBriefTitle}</h1>
              <p class="battle-contract__question">{battleContract?.question ?? battleBriefText}</p>
            </div>

            <div class="battle-toolbar__controls battle-toolbar__controls--compact">
              <label class="field">
                <span>Lead</span>
                <select value={activeAgentId} onchange={(event) => syncContext((event.currentTarget as HTMLSelectElement).value, stageScenarioId)}>
                  {#each agents as agent}
                    <option value={agent.id}>{agent.name}</option>
                  {/each}
                </select>
              </label>

              <label class="field">
                <span>Slice</span>
                <select value={stageScenarioId} onchange={(event) => syncContext(activeAgentId, (event.currentTarget as HTMLSelectElement).value, null)}>
                  {#each evalScenarios as scenario}
                    <option value={scenario.id}>{scenario.label}</option>
                  {/each}
                </select>
              </label>

              <button
                class:active={dossierOpen}
                class="action-button tertiary battle-toolbar__dossier-toggle"
                onclick={() => (dossierOpen = !dossierOpen)}
                type="button"
              >
                {dossierOpen ? 'Hide dossier' : 'Dossier'}
              </button>
            </div>
          </div>

          <div class="battle-brief-strip" aria-label="Encounter summary">
            <article class="battle-brief-pill battle-brief-pill--success">
              <small>Win line</small>
              <strong>{battleContract?.successLine ?? battleView.verdictLabel}</strong>
            </article>

            <article class="battle-brief-pill battle-brief-pill--failure">
              <small>Risk line</small>
              <strong>{battleContract?.failureLine ?? battleView.pressureLabel}</strong>
            </article>

            <article class="battle-brief-pill battle-brief-pill--guide">
              <small>Best now</small>
              <strong>{battleRecommendedVerb ?? selectedCommandCard?.battleVerb ?? 'Choose'} / {battleContract?.recommendedCommandLabel ?? selectedCommandCard?.label ?? 'Command'}</strong>
              <span>{battleContract?.recommendedReason ?? battleMenuPrompt}</span>
            </article>
          </div>

          <div class="battle-stage-shell__frame">
            <ChartBattlefield view={battleView} />
          </div>
          <div class="battle-bottom-menu-shell">
            <div class="battle-bottom-menu">
              <div class="battle-bottom-menu__dialog">
                <div class="battle-bottom-menu__meta">
                  <span class="battle-bottom-menu__tag">{session.outcome === 'ONGOING' ? 'Answer this turn' : 'After action'}</span>
                  {#if selectedCommandCard}
                    <span class="battle-bottom-menu__slot">{selectedCommandCard.hotkey}</span>
                  {/if}
                </div>
                <strong>{session.outcome === 'ONGOING' ? (battleContract?.question ?? 'Choose one clean answer') : battleMenuHeading}</strong>
                <p>
                  {session.outcome === 'ONGOING'
                    ? selectedCommandCard
                      ? `${selectedCommandCard.battleVerb} is your current answer. ${selectedCommandCard.battleFlavor}`
                      : 'Choose the cleanest answer to this turn.'
                    : battleMenuPrompt}
                </p>
                <div class="battle-bottom-menu__footnote">
                  <span>{battleContract?.turnLabel ?? battleBriefTag}</span>
                  <span>Best now {battleRecommendedVerb ?? selectedCommandCard?.battleVerb ?? 'Choose'}</span>
                  <span>{session.outcome === 'ONGOING' ? (battleContract?.coachLine ?? battleView.pressureLabel) : verdictText}</span>
                </div>
              </div>

              <div class="battle-bottom-menu__commands">
                <div class="battle-command-grid battle-command-grid--menu">
                  {#each battleMenuCards as card}
                    <button
                      class:selected={card.selected}
                      class:lastUsed={card.lastUsed}
                      class:recommended={card.recommended}
                      class={`battle-command battle-command--${card.tone}`}
                      disabled={session.outcome !== 'ONGOING'}
                      onclick={() => battleStore.selectCommand(card.id)}
                      type="button"
                    >
                      <div class="battle-command__meta">
                        <span class="battle-command__hotkey">{card.hotkey}</span>
                        {#if card.recommended}
                          <span class="battle-command__state">{card.selected ? 'Best now' : 'Recommended'}</span>
                        {:else if card.lastUsed}
                          <span class="battle-command__state">Last used</span>
                        {:else if card.selected}
                          <span class="battle-command__state">Selected</span>
                        {/if}
                      </div>
                      <strong>{card.battleVerb}</strong>
                      <span>{card.battleFlavor}</span>
                      <small>{card.label}</small>
                    </button>
                  {/each}
                </div>
              </div>
            </div>

            <div class="battle-bottom-menu__actions">
              <div class="battle-bottom-menu__toolbar">
                <div class="battle-bottom-menu__toolbar-main">
                  <button class="action-button" disabled={session.outcome !== 'ONGOING'} onclick={executeSelectedCommand}>
                    {session.outcome === 'ONGOING'
                      ? `Confirm ${selectedCommandCard?.battleVerb ?? 'command'}`
                      : session.outcome === 'WIN'
                        ? 'Battle won'
                        : 'Battle lost'}
                  </button>
                  <p class="battle-bottom-menu__hint">
                    <span>Hotkeys</span>
                    <strong>1-4</strong>
                    <span>pick</span>
                    <strong>Enter</strong>
                    <span>commit</span>
                    <strong>R</strong>
                    <span>reset</span>
                  </p>
                </div>
                <div class="battle-bottom-menu__toolbar-utilities">
                  <button class="action-button tertiary" onclick={resetBattle}>Reset</button>
                  <button class="action-button secondary" disabled={session.outcome !== 'ONGOING' && !session.writebackApplied} onclick={openJournal}>
                    {session.outcome !== 'ONGOING' && !session.writebackApplied ? 'Verdict first' : 'Journal'}
                  </button>
                  <button class="action-button tertiary" disabled={session.outcome !== 'ONGOING' && !session.writebackApplied} onclick={returnToField}>
                    {session.outcome !== 'ONGOING' && !session.writebackApplied ? 'Verdict first' : 'Field'}
                  </button>
                </div>
              </div>
            </div>
          </div>
          </section>

        {#if session.outcome !== 'ONGOING' && !session.writebackApplied}
          <section class="panel battle-command-panel battle-aftermath-panel">
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
          </section>
        {/if}

        {#if session.writebackApplied}
          <section class="panel battle-command-panel battle-aftermath-panel">
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
          </section>
        {/if}
        </div>

      {#if dossierOpen}
      <aside class="battle-hero__rail battle-hero__rail--overlay">
        <article class={`panel battle-panel battle-panel--rail battle-panel--${activeRailTab}`}>
          <div class="battle-rail-tabs" role="tablist" aria-label="Battle dossier">
            {#each battleRailTabs as tab}
              <button
                aria-selected={activeRailTab === tab.id}
                class:active={activeRailTab === tab.id}
                class="battle-rail-tab"
                onclick={() => (activeRailTab = tab.id)}
                role="tab"
                type="button"
              >
                {tab.label}
              </button>
            {/each}
          </div>

          {#if activeRailTab === 'captain'}
            <div class="stack battle-rail-body">
              <div>
                <p class="section-kicker">Squad Captain</p>
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
          {:else if activeRailTab === 'comms'}
            <div class="stack battle-rail-body">
              <div>
                <p class="section-kicker">Comms Feed</p>
                <h2 class="section-title">{latestLog?.title ?? 'Opening move'}</h2>
              </div>
              {#each recentLogs as log}
                <div class={`battle-log battle-log--${log.tone}`}>
                  <strong>{log.turn === 0 ? 'Boot' : `Turn ${log.turn}`}</strong>
                  <p>{log.title}</p>
                </div>
              {/each}
            </div>
          {:else if activeRailTab === 'stakes'}
            <div class="stack battle-rail-body">
              <div>
                <p class="section-kicker">Proof Stakes</p>
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
          {:else if activeRailTab === 'memory' && runtimeFocusRail}
            <div class="stack battle-rail-body">
              <div>
                <p class="section-kicker">Field Memory Rail</p>
                <h2 class="section-title">{battleFocusCue ?? 'Carry one clean memory cue out of this clash.'}</h2>
              </div>
              <p class="battle-panel__support-copy">Only carry the rail that helps the next gate. Battle truth stays deterministic.</p>
              <div class="chip-row">
                <span class="chip">Indexed {data.runtime.memoryIndexCount}</span>
                <span class="chip">{runtimeFocusRail.tier}</span>
                <span class="chip chip--quiet">Focus live</span>
              </div>
              {#each runtimeRailEntries as entry}
                <div class="battle-log battle-log--info">
                  <strong>{entry.heading}</strong>
                  <p>{entry.preview}</p>
                </div>
              {/each}
            </div>
          {/if}
        </article>
      </aside>
      {/if}
      </section>
    {:else}
      <section class="panel battle-boot">
        <p class="section-kicker">Preparing encounter</p>
        <h1 class="section-title">Assembling the chart battlefield...</h1>
        <p>The squad, command deck, and proof frame are syncing before the clash begins.</p>
      </section>
    {/if}
  </div>
</PageShell>

<style>
  .battle-page {
    display: grid;
    gap: 8px;
  }

  .battle-hero {
    position: relative;
    display: block;
  }

  .battle-hero__main,
  .battle-hero__rail {
    display: grid;
    gap: 8px;
  }

  .battle-hero__rail {
    position: absolute;
    top: 164px;
    right: 14px;
    width: min(320px, calc(100% - 28px));
    max-height: calc(100vh - 190px);
    z-index: 5;
  }

  .battle-toolbar,
  .battle-panel,
  .battle-command-panel,
  .battle-stage-shell {
    padding: 16px;
  }

  .battle-toolbar,
  .battle-panel,
  .battle-command-panel {
    background:
      linear-gradient(180deg, rgba(252, 248, 240, 0.95), rgba(244, 237, 223, 0.92));
    border-color: rgba(146, 139, 110, 0.14);
  }

  .battle-stage-shell {
    position: relative;
    overflow: hidden;
    display: grid;
    gap: 6px;
    padding: 10px 10px 8px;
    background:
      radial-gradient(circle at top left, rgba(255, 213, 118, 0.24), transparent 28%),
      radial-gradient(circle at 86% 14%, rgba(103, 169, 138, 0.18), transparent 22%),
      linear-gradient(180deg, rgba(41, 56, 52, 0.96), rgba(23, 34, 31, 0.98));
    border-color: rgba(116, 140, 126, 0.26);
    box-shadow:
      inset 0 1px 0 rgba(255, 255, 255, 0.08),
      0 22px 48px rgba(16, 24, 22, 0.22);
  }

  .battle-stage-shell::before {
    content: '';
    position: absolute;
    inset: 0;
    pointer-events: none;
    background:
      linear-gradient(rgba(202, 224, 204, 0.05) 1px, transparent 1px),
      linear-gradient(90deg, rgba(202, 224, 204, 0.05) 1px, transparent 1px),
      linear-gradient(140deg, rgba(255, 229, 158, 0.08), transparent 48%);
    background-size: 30px 30px, 30px 30px, auto;
    opacity: 0.72;
  }

  .battle-stage-shell > * {
    position: relative;
    z-index: 1;
  }

  .battle-toolbar__top {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    gap: 6px;
    align-items: center;
    padding-bottom: 2px;
    border-bottom: 1px solid rgba(228, 220, 188, 0.12);
  }

  .battle-toolbar__title {
    display: grid;
    gap: 1px;
    min-width: 0;
  }

  .battle-toolbar__eyebrow {
    display: flex;
    align-items: center;
    gap: 6px;
    flex-wrap: wrap;
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
    margin: 0;
    gap: 4px;
  }

  .battle-contract__question {
    max-width: 58ch;
    color: rgba(241, 235, 219, 0.92);
    line-height: 1.18;
    font-size: 0.84rem;
    display: -webkit-box;
    line-clamp: 1;
    -webkit-line-clamp: 1;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .battle-brief-strip {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 6px;
  }

  .battle-brief-pill {
    display: grid;
    gap: 3px;
    padding: 8px 10px;
    border-radius: 14px;
    border: 1px solid rgba(226, 215, 182, 0.12);
    background: rgba(8, 16, 14, 0.2);
  }

  .battle-brief-pill small {
    color: rgba(210, 220, 204, 0.68);
    font-size: 0.66rem;
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }

  .battle-brief-pill strong {
    color: #f7f0db;
    font-size: 0.78rem;
    line-height: 1.24;
  }

  .battle-brief-pill span {
    color: rgba(215, 223, 209, 0.72);
    font-size: 0.67rem;
    line-height: 1.18;
    display: -webkit-box;
    line-clamp: 1;
    -webkit-line-clamp: 1;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .battle-brief-pill--success {
    border-color: rgba(92, 179, 133, 0.2);
    background: rgba(24, 58, 44, 0.28);
  }

  .battle-brief-pill--failure {
    border-color: rgba(196, 108, 88, 0.2);
    background: rgba(66, 34, 31, 0.26);
  }

  .battle-brief-pill--guide {
    border-color: rgba(241, 180, 98, 0.2);
    background: rgba(72, 51, 24, 0.24);
  }

  .battle-stage-shell__summary {
    display: none;
    margin-top: 0;
    max-width: 56ch;
    color: rgba(241, 235, 219, 0.92);
    line-height: 1.24;
    font-size: 0.84rem;
    line-clamp: 1;
    display: -webkit-box;
    -webkit-line-clamp: 1;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .battle-stage-shell__gate-note {
    display: none;
  }

  .battle-stage-shell .section-title {
    color: #fbf3dd;
    font-size: clamp(1rem, 1.28vw, 1.28rem);
    line-height: 1;
    display: -webkit-box;
    line-clamp: 1;
    -webkit-line-clamp: 1;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .battle-stage-shell .section-kicker {
    color: rgba(211, 223, 209, 0.76);
    font-size: 0.62rem;
    letter-spacing: 0.12em;
  }

  .battle-stage-shell .chip {
    background: rgba(247, 240, 225, 0.12);
    border-color: rgba(223, 214, 180, 0.16);
    color: rgba(244, 235, 215, 0.86);
    padding: 3px 7px;
    font-size: 0.64rem;
  }

  .battle-toolbar__controls {
    display: flex;
    gap: 5px;
    align-items: center;
    justify-content: flex-end;
    flex-wrap: wrap;
  }

  .battle-toolbar__controls--compact {
    align-items: end;
  }

  .battle-toolbar__dossier-toggle {
    min-height: 0;
    padding: 8px 10px;
    white-space: nowrap;
    font-size: 0.78rem;
  }

  .battle-toolbar__dossier-toggle.active {
    background: rgba(241, 180, 98, 0.16);
    border-color: rgba(241, 180, 98, 0.28);
    color: #f8efd9;
  }

  .field {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 4px 7px;
    border-radius: 12px;
    border: 1px solid rgba(223, 214, 180, 0.14);
    background: rgba(12, 24, 21, 0.16);
  }

  .field span {
    font-size: 0.62rem;
    color: rgba(214, 223, 210, 0.74);
    letter-spacing: 0.12em;
    text-transform: uppercase;
    white-space: nowrap;
  }

  .field select {
    min-width: 0;
    width: 100%;
    padding: 5px 7px;
    border-radius: 9px;
    border: 1px solid rgba(225, 215, 184, 0.14);
    background: rgba(253, 248, 236, 0.92);
    color: #1d2b24;
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.32);
    font-size: 0.76rem;
  }

  .battle-stage-shell__frame {
    display: grid;
    gap: 0;
  }

  .battle-stage-shell__frame :global(.battlefield) {
    margin: 0;
    gap: 0;
    padding: 2px 0 0;
  }

  .battle-stage-shell__frame :global(.battlefield__stage) {
    aspect-ratio: 16 / 5.2;
    min-height: 430px;
  }

  .battle-stage-shell__frame :global(.battlefield__svg) {
    filter: brightness(0.74) saturate(0.86) contrast(1.03);
  }

  .battle-stage-shell__frame :global(.battlefield__duel-strip) {
    gap: 8px;
    margin-bottom: 6px;
  }

  .battle-stage-shell__frame :global(.battlefield__fighter-card),
  .battle-stage-shell__frame :global(.battlefield__turn-banner),
  .battle-stage-shell__frame :global(.battlefield__command-plaque) {
    padding: 8px 10px;
    border-radius: 18px;
  }

  .battle-stage-shell__frame :global(.battlefield__fighter-copy small) {
    font-size: 0.72rem;
  }

  .battle-stage-shell__frame :global(.battlefield__fighter-copy strong),
  .battle-stage-shell__frame :global(.battlefield__turn-banner strong) {
    font-size: 0.92rem;
  }

  .battle-stage-shell__frame :global(.battlefield__fighter-copy span) {
    display: none;
  }

  .battle-stage-shell__frame :global(.battlefield__turn-banner small) {
    font-size: 0.72rem;
  }

  .battle-stage-shell__frame :global(.battlefield__command-plaque) {
    display: none;
  }

  .battle-stage-shell__frame :global(.battlefield__footer) {
    display: none;
  }

  .battle-bottom-menu-shell {
    display: grid;
    gap: 6px;
    margin-top: 0;
    padding: 6px;
    border-radius: 22px;
    border: 1px solid rgba(112, 130, 115, 0.28);
    background:
      radial-gradient(circle at top right, rgba(255, 212, 118, 0.12), transparent 24%),
      linear-gradient(180deg, rgba(24, 35, 32, 0.95), rgba(12, 20, 18, 0.98));
    box-shadow:
      inset 0 1px 0 rgba(255, 255, 255, 0.08),
      0 16px 32px rgba(7, 14, 13, 0.24);
  }

  .battle-bottom-menu {
    display: grid;
    grid-template-columns: minmax(0, 0.48fr) minmax(0, 1fr);
    gap: 6px;
    align-items: start;
  }

  .battle-bottom-menu__dialog {
    display: grid;
    gap: 5px;
    padding: 8px 10px;
    border-radius: 16px;
    border: 1px solid rgba(112, 130, 115, 0.26);
    background:
      linear-gradient(180deg, rgba(40, 57, 52, 0.94), rgba(24, 35, 32, 0.94));
  }

  .battle-bottom-menu__meta {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
  }

  .battle-bottom-menu__tag,
  .battle-bottom-menu__slot {
    width: fit-content;
    padding: 4px 8px;
    border-radius: 999px;
    font-size: 0.64rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  .battle-bottom-menu__tag {
    background: rgba(72, 143, 107, 0.22);
    border: 1px solid rgba(114, 190, 150, 0.16);
    color: #d4ebd8;
  }

  .battle-bottom-menu__slot {
    background: rgba(232, 192, 97, 0.18);
    border: 1px solid rgba(232, 192, 97, 0.18);
    color: #f2d38a;
  }

  .battle-bottom-menu__dialog strong {
    font-size: 0.94rem;
    color: #f6efda;
    line-height: 1.1;
  }

  .battle-bottom-menu__dialog p {
    color: rgba(215, 223, 209, 0.74);
    line-height: 1.24;
    font-size: 0.8rem;
    display: -webkit-box;
    line-clamp: 2;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .battle-bottom-menu__footnote {
    display: flex;
    flex-wrap: nowrap;
    gap: 8px;
    overflow: hidden;
    font-size: 0.64rem;
    white-space: nowrap;
    color: rgba(204, 214, 198, 0.66);
  }

  .battle-bottom-menu__footnote span {
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .battle-bottom-menu__commands {
    display: grid;
    align-items: stretch;
  }

  .battle-command-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 8px;
  }

  .battle-command-grid--menu {
    height: 100%;
  }

  .battle-command {
    display: grid;
    gap: 10px;
    text-align: left;
    align-content: start;
    min-height: 154px;
    padding: 16px;
    border-radius: 22px;
    border: 1px solid rgba(104, 127, 112, 0.28);
    background:
      linear-gradient(180deg, rgba(33, 47, 42, 0.96), rgba(20, 31, 28, 0.94));
    cursor: pointer;
    transition: transform 120ms ease, border-color 120ms ease, box-shadow 120ms ease, background 120ms ease;
  }

  .battle-command-grid--menu .battle-command {
    min-height: 62px;
    padding: 7px 8px;
    border-radius: 16px;
    align-content: space-between;
  }

  .battle-command-grid--menu .battle-command strong {
    font-size: 0.82rem;
  }

  .battle-command-grid--menu .battle-command span:last-child {
    font-size: 0.66rem;
    line-height: 1.12;
  }

  .battle-command-grid--menu .battle-command small {
    color: rgba(215, 221, 209, 0.5);
    font-size: 0.62rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  .battle-command:hover,
  .battle-command.selected {
    transform: translateY(-1px);
    box-shadow: 0 16px 28px rgba(114, 101, 64, 0.12);
  }

  .battle-command.selected {
    border-color: rgba(92, 179, 133, 0.44);
    background:
      linear-gradient(180deg, rgba(42, 74, 61, 0.98), rgba(28, 53, 45, 0.96));
  }

  .battle-command.recommended:not(.selected) {
    border-color: rgba(241, 180, 98, 0.34);
    box-shadow:
      inset 0 0 0 1px rgba(241, 180, 98, 0.1),
      0 12px 24px rgba(10, 18, 16, 0.18);
  }

  .battle-command:disabled {
    cursor: not-allowed;
    opacity: 0.62;
    transform: none;
    box-shadow: none;
  }

  .battle-command.lastUsed {
    box-shadow:
      inset 0 0 0 1px rgba(226, 191, 94, 0.44),
      0 18px 30px rgba(7, 14, 13, 0.22);
  }

  .battle-command--danger {
    border-color: rgba(170, 93, 72, 0.34);
  }

  .battle-command--secondary {
    border-color: rgba(88, 123, 167, 0.34);
  }

  .battle-command__meta {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 6px;
  }

  .battle-command__hotkey,
  .battle-command__state {
    width: fit-content;
    padding: 3px 7px;
    border-radius: 999px;
    font-size: 0.62rem;
  }

  .battle-command__hotkey {
    background: rgba(236, 198, 105, 0.18);
    color: #f2d38a;
  }

  .battle-command__state {
    background: rgba(89, 169, 127, 0.18);
    color: #d4ebd8;
  }

  .battle-command strong {
    font-size: 1rem;
    color: #f6efda;
  }

  .battle-command span:last-child {
    color: rgba(217, 224, 212, 0.72);
    line-height: 1.45;
  }

  .battle-bottom-menu__actions {
    display: block;
  }

  .battle-bottom-menu__toolbar {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    padding: 7px 8px;
    border-radius: 16px;
    border: 1px solid rgba(112, 130, 115, 0.26);
    background: rgba(255, 248, 235, 0.06);
  }

  .battle-bottom-menu__toolbar-main,
  .battle-bottom-menu__toolbar-utilities {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    align-items: center;
  }

  .battle-bottom-menu__toolbar-main {
    flex: 1 1 300px;
  }

  .battle-bottom-menu__toolbar-utilities {
    justify-content: flex-end;
  }

  .battle-bottom-menu__hint {
    display: inline-flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 5px 7px;
    color: rgba(205, 214, 198, 0.72);
    font-size: 0.66rem;
    letter-spacing: 0.03em;
    margin: 0;
  }

  .battle-bottom-menu__hint strong {
    padding: 3px 7px;
    border-radius: 999px;
    background: rgba(247, 240, 225, 0.1);
    border: 1px solid rgba(226, 215, 182, 0.12);
    color: #f3e7c6;
    font-size: 0.68rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  .battle-bottom-menu__hint span:first-child {
    color: rgba(215, 223, 209, 0.6);
    text-transform: uppercase;
    letter-spacing: 0.1em;
  }

  .battle-bottom-menu__actions .action-button {
    border-color: rgba(229, 216, 182, 0.14);
    padding: 9px 12px;
    min-height: 0;
    font-size: 0.8rem;
  }

  .battle-bottom-menu__actions .action-button:not(.secondary):not(.tertiary) {
    background: linear-gradient(180deg, #f1b462, #d98f31);
    color: #261d11;
    box-shadow: 0 10px 20px rgba(10, 18, 16, 0.22);
  }

  .battle-bottom-menu__actions .action-button.secondary,
  .battle-bottom-menu__actions .action-button.tertiary {
    background: rgba(247, 240, 225, 0.08);
    color: #f4ecd6;
  }

  .battle-command-panel {
    display: grid;
    gap: 18px;
  }

  .battle-aftermath-panel {
    margin-top: 2px;
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
    min-height: auto;
    max-height: 288px;
    overflow: auto;
    padding: 12px;
    border-radius: 22px;
    background:
      linear-gradient(180deg, rgba(20, 31, 29, 0.86), rgba(14, 22, 21, 0.92));
    border-color: rgba(104, 127, 112, 0.28);
    box-shadow:
      0 20px 40px rgba(11, 18, 17, 0.28),
      inset 0 1px 0 rgba(255, 255, 255, 0.08);
    backdrop-filter: blur(14px);
  }

  .battle-rail-tabs {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 6px;
    margin-bottom: 10px;
  }

  .battle-rail-tab {
    padding: 7px 8px;
    border-radius: 12px;
    border: 1px solid rgba(226, 215, 182, 0.14);
    background: rgba(255, 248, 235, 0.07);
    color: rgba(219, 227, 214, 0.76);
    font-size: 0.68rem;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    transition: background 120ms ease, border-color 120ms ease, color 120ms ease, transform 120ms ease;
  }

  .battle-rail-tab.active {
    background: rgba(241, 180, 98, 0.16);
    border-color: rgba(241, 180, 98, 0.28);
    color: #f7efdb;
    transform: translateY(-1px);
  }

  .battle-rail-body {
    gap: 10px;
  }

  .battle-panel--captain {
    background:
      radial-gradient(circle at top right, rgba(255, 213, 118, 0.12), transparent 26%),
      linear-gradient(180deg, rgba(39, 56, 52, 0.96), rgba(23, 34, 31, 0.98));
  }

  .battle-panel--log {
    background:
      radial-gradient(circle at top left, rgba(93, 146, 180, 0.1), transparent 24%),
      linear-gradient(180deg, rgba(35, 48, 51, 0.96), rgba(22, 29, 31, 0.98));
  }

  .battle-panel--stakes {
    background:
      radial-gradient(circle at top right, rgba(160, 85, 70, 0.1), transparent 22%),
      linear-gradient(180deg, rgba(44, 46, 42, 0.96), rgba(24, 28, 25, 0.98));
  }

  .battle-panel--runtime {
    background:
      radial-gradient(circle at top left, rgba(83, 151, 111, 0.1), transparent 20%),
      linear-gradient(180deg, rgba(33, 48, 43, 0.96), rgba(20, 29, 27, 0.98));
  }

  .battle-panel--rail .section-title {
    color: #f7f0db;
    font-size: 1.02rem;
    line-height: 1.14;
  }

  .battle-panel--rail .section-kicker,
  .battle-panel--rail p,
  .battle-panel--rail small {
    color: rgba(215, 223, 210, 0.74);
  }

  .battle-panel--rail p {
    font-size: 0.86rem;
    line-height: 1.32;
  }

  .battle-panel--rail .chip {
    background: rgba(250, 244, 230, 0.08);
    border-color: rgba(226, 215, 182, 0.16);
    color: rgba(243, 235, 217, 0.84);
  }

  .battle-panel__support-copy {
    margin: -8px 0 0;
    color: rgba(201, 212, 197, 0.68);
    line-height: 1.45;
  }

  .battle-panel__metrics {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .battle-panel--rail :global(.metric-card) {
    background: rgba(255, 248, 235, 0.08);
    border-color: rgba(226, 215, 182, 0.14);
  }

  .battle-panel--rail :global(.metric-card strong) {
    color: #f6efda;
  }

  .battle-log {
    padding: 10px 12px;
    border-radius: 14px;
    border: 1px solid rgba(226, 215, 182, 0.16);
    background: rgba(255, 248, 235, 0.08);
  }

  .battle-log strong {
    display: block;
    margin-bottom: 4px;
    font-size: 0.72rem;
    color: rgba(226, 233, 220, 0.7);
  }

  .battle-log p {
    color: #f5edd8;
    line-height: 1.28;
    font-size: 0.82rem;
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

  .battle-log--info {
    border-color: rgba(88, 123, 167, 0.28);
  }

  .battle-delta {
    padding: 12px;
    border-radius: 16px;
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
      display: grid;
      grid-template-columns: 1fr;
    }

    .battle-hero__rail {
      position: static;
      width: auto;
      max-height: none;
    }
  }

  @media (max-width: 900px) {
    .battle-toolbar__top,
    .battle-bottom-menu,
    .battle-brief-strip,
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

    .field {
      padding: 10px 12px;
    }

    .battle-rail-tabs {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  @media (max-width: 700px) {
    .battle-command-grid,
    .battle-brief-strip,
    .battle-panel__metrics {
      grid-template-columns: 1fr;
    }

    .battle-bottom-menu__toolbar,
    .battle-bottom-menu__toolbar-main,
    .battle-bottom-menu__toolbar-utilities {
      align-items: stretch;
    }

    .battle-bottom-menu__toolbar-utilities {
      justify-content: flex-start;
    }
  }
</style>
