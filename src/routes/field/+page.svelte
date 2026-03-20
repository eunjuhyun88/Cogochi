<script lang="ts">
  import { browser } from '$app/environment';
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  import type { PageData } from './$types';
  import FieldScene from '$components/shared/FieldScene.svelte';
  import PixelSprite from '$components/shared/PixelSprite.svelte';
  import PageShell from '$components/shared/PageShell.svelte';
  import { careStateLabels } from '$lib/data/seed';
  import { getScenarioForHistoricalFrame, resolveHistoricalFieldFrame } from '$lib/engine/chart-frame-model';
  import { fieldCommandDefinitions } from '$lib/engine/field-encounter';
  import { fieldNodes, fieldStore } from '$lib/stores/fieldStore';
  import { labStore } from '$lib/stores/labStore';
  import { proofStore } from '$lib/stores/proofStore';
  import { rosterStore } from '$lib/stores/rosterStore';
  import type { CareState, FieldCommandId, ProofArtifact } from '$lib/types';

  let { data }: { data: PageData } = $props();
  let fieldStage: HTMLElement | null = null;
  let selectedFieldCommandId = $state('LONG' as FieldCommandId);

  type FieldReturnContext = PageData['returnContext'];
  type ContextualFieldRoute = '/field' | '/battle' | '/journal' | '/lab';
  type FieldConsoleEntry = {
    label: string;
    text: string;
    tone: 'accent' | 'info' | 'quiet';
    speaker: 'agent' | 'system';
  };

  function buildRouteHref(pathname: ContextualFieldRoute, entries: Array<[string, string | null | undefined]>): string {
    const params = new URLSearchParams();
    for (const [key, value] of entries) {
      if (value) {
        params.set(key, value);
      }
    }
    const query = params.toString();
    return query ? `${pathname}?${query}` : pathname;
  }

  function formatFieldPrice(value: number | null): string {
    if (value === null) {
      return 'None';
    }
    return value.toLocaleString('en-US', {
      maximumFractionDigits: 2,
    });
  }

  function artifactGateQuery(gate: ProofArtifact['entryGate']): FieldReturnContext['gate'] {
    if (gate === 'PROOF') {
      return 'proof';
    }
    if (gate === 'SPAR') {
      return 'spar';
    }
    return null;
  }

  function returnContextFromArtifact(artifact: ProofArtifact): FieldReturnContext {
    return {
      artifactId: artifact.id,
      outcome: artifact.battleOutcome === 'WIN' || artifact.battleOutcome === 'LOSS' ? artifact.battleOutcome : null,
      verdict: artifact.trainerVerdict,
      gate: artifactGateQuery(artifact.entryGate),
      frameId: artifact.frameId,
      frameTitle: artifact.frameTitle,
      frameDateLabel: artifact.frameDateLabel,
    };
  }

  function gateLabel(gate: FieldReturnContext['gate']): string | null {
    if (gate === 'proof') {
      return 'Proof Gate';
    }
    if (gate === 'spar') {
      return 'Spar Gate';
    }
    return null;
  }

  function outcomeLabel(outcome: FieldReturnContext['outcome']): string | null {
    if (outcome === 'WIN') {
      return 'Won the clash';
    }
    if (outcome === 'LOSS') {
      return 'Lost the clash';
    }
    return null;
  }

  function verdictLabel(verdict: FieldReturnContext['verdict']): string | null {
    if (verdict === 'ACCEPTED') {
      return 'Mutation kept';
    }
    if (verdict === 'QUARANTINED') {
      return 'Mutation quarantined';
    }
    if (verdict === 'REVERTED') {
      return 'Mutation reverted';
    }
    return null;
  }

  function targetNodeIdForCue(
    returnContext: FieldReturnContext,
    careState: CareState | null,
    objectiveNodeId: string,
  ): string {
    if (returnContext.verdict === 'ACCEPTED') {
      return 'battle-gate';
    }
    if (returnContext.verdict === 'QUARANTINED') {
      return 'journal-board';
    }
    if (returnContext.verdict === 'REVERTED') {
      return 'lab-bench';
    }

    if (careState === 'MEMORY_DRIFT') {
      return 'archive-well';
    }
    if (careState === 'DOCTRINE_BLUR') {
      return 'lab-bench';
    }
    if (careState === 'SQUAD_FRICTION') {
      return 'camp';
    }
    if (careState === 'CONFIDENCE_SHAKE') {
      return 'spar-gate';
    }

    return objectiveNodeId;
  }

  function chooseRuntimeCheck(checks: string[], careState: CareState | null): string | null {
    if (!checks.length) {
      return null;
    }

    const keywords =
      careState === 'MEMORY_DRIFT'
        ? ['memory']
        : careState === 'DOCTRINE_BLUR'
          ? ['bundle', 'doctrine', 'prompt']
          : careState === 'CONFIDENCE_SHAKE'
            ? ['battle truth', 'proof', 'calibration']
            : careState === 'SQUAD_FRICTION'
              ? ['relay', 'coordination', 'cross-agent']
              : [];

    if (!keywords.length) {
      return checks[0];
    }

    return checks.find((check) => keywords.some((keyword) => check.toLowerCase().includes(keyword))) ?? checks[0];
  }

  function sanitizeRuntimeCheck(text: string): string | null {
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

  function flavorRuntimeCheck(text: string | null, careState: CareState | null): string | null {
    if (!text) {
      return null;
    }

    const lower = text.toLowerCase();
    if (careState === 'MEMORY_DRIFT' || lower.includes('memory')) {
      return 'Pin one usable lesson before crossing the next gate.';
    }
    if (careState === 'DOCTRINE_BLUR' || lower.includes('bundle') || lower.includes('doctrine') || lower.includes('prompt')) {
      return 'Retighten the room rules before the next march.';
    }
    if (careState === 'CONFIDENCE_SHAKE' || lower.includes('battle truth') || lower.includes('calibration') || lower.includes('proof')) {
      return 'Take a cleaner spar until the squad trusts the read again.';
    }
    if (careState === 'SQUAD_FRICTION' || lower.includes('relay') || lower.includes('coordination') || lower.includes('cross-agent')) {
      return 'Pull the squad back onto one call before advancing.';
    }
    if (lower.includes('context') || lower.includes('surface') || lower.includes('program')) {
      return 'Reset the trail rules so the next gate reads cleanly.';
    }
    return 'Carry only the clue that helps the next gate.';
  }

  function trailRuleForContext(returnContext: FieldReturnContext, careState: CareState | null): string {
    if (returnContext.verdict === 'ACCEPTED') {
      return 'Carry the kept mutation straight to the next proof.';
    }
    if (returnContext.verdict === 'QUARANTINED') {
      return 'Keep the shard sealed until the journal clears it.';
    }
    if (returnContext.verdict === 'REVERTED') {
      return 'Scrub the bad branch before the next march.';
    }
    if (careState === 'MEMORY_DRIFT') {
      return 'Carry one lesson, not the whole archive.';
    }
    if (careState === 'DOCTRINE_BLUR') {
      return 'One doctrine line at a time.';
    }
    if (careState === 'SQUAD_FRICTION') {
      return 'One call, one push, one finish.';
    }
    if (careState === 'CONFIDENCE_SHAKE') {
      return 'Take the safer line until the squad settles.';
    }
    return 'Carry only the clue that helps the next gate.';
  }

  function cueTextForContext(
    returnContext: FieldReturnContext,
    careState: CareState | null,
    targetLabel: string | null,
  ): string {
    const target = targetLabel ?? 'the next gate';
    if (returnContext.verdict === 'ACCEPTED') {
      return `The mutation held. March for ${target}.`;
    }
    if (returnContext.verdict === 'QUARANTINED') {
      return `Keep the shard under watch and escort it to ${target}.`;
    }
    if (returnContext.verdict === 'REVERTED') {
      return `The run broke form. Reset at ${target} before pushing again.`;
    }

    if (careState === 'MEMORY_DRIFT') {
      return `The trail is thinning. Re-anchor the squad at ${target}.`;
    }
    if (careState === 'DOCTRINE_BLUR') {
      return `The room rules slipped. Retune them at ${target}.`;
    }
    if (careState === 'SQUAD_FRICTION') {
      return `Calls are splitting. Rally everyone at ${target}.`;
    }
    if (careState === 'CONFIDENCE_SHAKE') {
      return `The read wobbled. Rehearse at ${target} first.`;
    }

    return `The night trail still points toward ${target}.`;
  }

  function cueVerbForContext(returnContext: FieldReturnContext, careState: CareState | null): string {
    if (returnContext.verdict === 'ACCEPTED') {
      return 'prove';
    }
    if (returnContext.verdict === 'QUARANTINED') {
      return 'review';
    }
    if (returnContext.verdict === 'REVERTED') {
      return 'reset';
    }
    if (careState === 'MEMORY_DRIFT') {
      return 'anchor';
    }
    if (careState === 'DOCTRINE_BLUR') {
      return 'tune';
    }
    if (careState === 'SQUAD_FRICTION') {
      return 'regroup';
    }
    if (careState === 'CONFIDENCE_SHAKE') {
      return 'rehearse';
    }
    return 'advance';
  }

  function returnSummaryForContext(returnContext: FieldReturnContext): string | null {
    const parts = [
      gateLabel(returnContext.gate),
      outcomeLabel(returnContext.outcome),
      verdictLabel(returnContext.verdict),
      returnContext.frameTitle,
    ].filter((part): part is string => Boolean(part));

    return parts.length ? parts.join(' · ') : null;
  }

  function fieldReturnMessage(returnContext: FieldReturnContext): string | null {
    if (!returnContext.outcome && !returnContext.verdict && !returnContext.frameTitle) {
      return null;
    }

    const frameTitle = returnContext.frameTitle ?? 'the gate';

    if (returnContext.verdict === 'ACCEPTED') {
      return returnContext.outcome === 'WIN'
        ? `The squad came back from ${frameTitle} carrying a kept mutation and a clean finish.`
        : `The squad came back from ${frameTitle} bruised, but the mutation still holds.`;
    }

    if (returnContext.verdict === 'QUARANTINED') {
      return `The squad came back from ${frameTitle}. Keep the shard under watch.`;
    }

    if (returnContext.verdict === 'REVERTED') {
      return `The squad came back from ${frameTitle}. The field result was scrubbed before camp.`;
    }

    if (returnContext.outcome === 'WIN') {
      return `The squad came back from ${frameTitle} with a clean line.`;
    }

    if (returnContext.outcome === 'LOSS') {
      return `The squad fell back from ${frameTitle} and needs a steadier read.`;
    }

    return `The squad came back from ${frameTitle} for debrief.`;
  }

  const dinoParty = $derived($rosterStore.agents.filter((agent) => agent.family === 'DINO').slice(0, 4));
  const fallbackParty = $derived(dinoParty.length ? dinoParty : $rosterStore.agents.slice(0, 4));
  const selectedProofArtifact = $derived.by(() => {
    $proofStore;
    if (!data.returnContext.artifactId) {
      return null;
    }
    return proofStore.getArtifact(data.returnContext.artifactId);
  });
  const contextAgentId = $derived.by(() => {
    const requestedAgentId = selectedProofArtifact?.agentId ?? data.selectedAgentId ?? $rosterStore.selectedAgentId;
    return $rosterStore.agents.find((agent) => agent.id === requestedAgentId)?.id ?? $rosterStore.agents[0]?.id ?? null;
  });
  const activeDoctrineSessionId = $derived.by(() => selectedProofArtifact?.doctrineSessionId ?? data.selectedDoctrineSessionId ?? null);
  const activeProofPackId = $derived.by(() => selectedProofArtifact?.proofPackId ?? data.selectedProofPackId ?? null);
  const effectiveReturnContext = $derived.by<FieldReturnContext>(() =>
    selectedProofArtifact ? returnContextFromArtifact(selectedProofArtifact) : data.returnContext,
  );
  const fieldStateView = $derived($fieldStore);
  const runStats = $derived(fieldStateView.run);
  const encounter = $derived(fieldStateView.encounter);
  const objectiveNode = $derived(fieldNodes.find((node) => node.id === fieldStateView.objectiveNodeId) ?? null);
  const nearbyNode = $derived(fieldNodes.find((node) => node.id === fieldStateView.nearbyNodeId) ?? null);
  const fieldParty = $derived.by(() => {
    const lead = $rosterStore.agents.find((agent) => agent.id === contextAgentId) ?? null;
    if (!lead) {
      return fallbackParty;
    }
    const sameFamily = $rosterStore.agents.filter((agent) => agent.id !== lead.id && agent.family === lead.family);
    const others = $rosterStore.agents.filter((agent) => agent.id !== lead.id && agent.family !== lead.family);
    return [lead, ...sameFamily, ...others].slice(0, 4);
  });
  const leader = $derived(fieldParty[0] ?? null);
  const activeHistoricalFrame = $derived.by(() => {
    const currentLeader = fieldStateView.members[0];
    if (!currentLeader) {
      return null;
    }
    return resolveHistoricalFieldFrame(currentLeader.x, fieldStateView.width);
  });
  const activeScenarioId = $derived(
    activeHistoricalFrame ? getScenarioForHistoricalFrame(activeHistoricalFrame.id) : $labStore.activeScenarioId,
  );
  const runtimeCueNodeId = $derived(
    targetNodeIdForCue(effectiveReturnContext, leader?.careState ?? null, fieldStateView.objectiveNodeId),
  );
  const runtimeCueNode = $derived(fieldNodes.find((node) => node.id === runtimeCueNodeId) ?? null);
  const runtimeFocusCheck = $derived.by(() => {
    const rawCheck = chooseRuntimeCheck(data.runtime.distill.suggestedNextChecks, leader?.careState ?? null);
    const sanitized = rawCheck ? sanitizeRuntimeCheck(rawCheck) : null;
    return flavorRuntimeCheck(sanitized, leader?.careState ?? null);
  });
  const runtimeCueText = $derived(cueTextForContext(effectiveReturnContext, leader?.careState ?? null, runtimeCueNode?.label ?? null));
  const runtimeCueVerb = $derived(cueVerbForContext(effectiveReturnContext, leader?.careState ?? null));
  const returnSummary = $derived(returnSummaryForContext(effectiveReturnContext));
  const trailRule = $derived(trailRuleForContext(effectiveReturnContext, leader?.careState ?? null));
  const fieldShellHref = $derived.by(() =>
    buildRouteHref('/field', [
      ['agent', contextAgentId],
      ['session', activeDoctrineSessionId],
      ['pack', activeProofPackId],
      ['artifact', selectedProofArtifact?.id ?? null],
    ]),
  );
  const journalHref = $derived.by(() =>
    buildRouteHref('/journal', [
      ['agent', contextAgentId],
      ['session', activeDoctrineSessionId],
      ['pack', activeProofPackId],
      ['artifact', selectedProofArtifact?.id ?? null],
      ['return', selectedProofArtifact ? null : effectiveReturnContext.outcome],
      ['verdict', selectedProofArtifact ? null : effectiveReturnContext.verdict],
      ['gate', selectedProofArtifact ? null : effectiveReturnContext.gate],
      ['frame', selectedProofArtifact ? null : effectiveReturnContext.frameId],
    ]),
  );
  const labHref = $derived.by(() =>
    buildRouteHref('/lab', [
      ['agent', contextAgentId],
      ['session', activeDoctrineSessionId],
      ['pack', activeProofPackId],
      ['artifact', selectedProofArtifact?.id ?? null],
      ['return', selectedProofArtifact ? null : effectiveReturnContext.outcome],
      ['verdict', selectedProofArtifact ? null : effectiveReturnContext.verdict],
      ['gate', selectedProofArtifact ? null : effectiveReturnContext.gate],
      ['frame', selectedProofArtifact ? null : effectiveReturnContext.frameId],
    ]),
  );
  const encounterRecommendation = $derived(
    encounter ? fieldCommandDefinitions.find((command) => command.id === encounter.recommendedCommandId) ?? null : null,
  );
  const selectedFieldCommand = $derived(
    fieldCommandDefinitions.find((command) => command.id === selectedFieldCommandId) ?? fieldCommandDefinitions[0],
  );
  const canResolveEncounter = $derived(Boolean(encounter && !encounter.cleared && !encounter.failed));
  const canTravelToNearbyNode = $derived(Boolean(nearbyNode) && !canResolveEncounter);
  const fieldPlaqueTitle = $derived.by(() => {
    if (canResolveEncounter && encounter) {
      return 'Hold the squad on this slice.';
    }
    return activeHistoricalFrame?.title ?? runtimeCueNode?.label ?? objectiveNode?.label ?? 'Gate';
  });
  const fieldPlaqueDetail = $derived.by(() => {
    if (canResolveEncounter && encounter) {
      return 'Resolve the dock first. Once this read is clear, the trail opens again.';
    }
    return runtimeCueText;
  });
  const fieldConsoleFeed = $derived.by<FieldConsoleEntry[]>(() =>
    [
      encounter
        ? { label: encounter.frameTitle, text: encounter.bark, tone: 'accent' as const, speaker: 'agent' }
        : { label: leader?.name ?? 'Companion read', text: runtimeCueText, tone: 'accent' as const, speaker: 'agent' },
      encounter?.clue ? { label: 'Chart read', text: encounter.clue, tone: 'info' as const, speaker: 'agent' } : null,
      encounter?.lastSummary
        ? { label: encounter.failed ? 'Retreat' : encounter.cleared ? 'Clear' : 'Last reveal', text: encounter.lastSummary, tone: 'info' as const, speaker: 'agent' }
        : null,
      runtimeFocusCheck
        ? { label: 'Scout check', text: runtimeFocusCheck, tone: 'info' as const, speaker: 'agent' }
        : null,
      { label: 'Trail rule', text: trailRule, tone: 'quiet', speaker: 'system' },
      returnSummary ? { label: 'Return mark', text: returnSummary, tone: 'quiet' as const, speaker: 'system' } : null,
    ]
      .filter((entry): entry is FieldConsoleEntry => Boolean(entry))
      .slice(0, 3),
  );
  const fieldConsolePrompt = $derived.by(() => {
    if (canResolveEncounter && encounterRecommendation && encounter) {
      return `resolve ${encounter.frameTitle.toLowerCase()} with ${encounterRecommendation.label.toLowerCase()}`;
    }
    if (nearbyNode) {
      return `cross into ${nearbyNode.label.toLowerCase()}`;
    }
    return `guide the squad toward ${(runtimeCueNode?.label ?? objectiveNode?.label ?? 'the next gate').toLowerCase()}`;
  });
  const fieldConsoleStatus = $derived(
    encounter
      ? encounter.cleared
        ? `${encounter.frameTitle} cleared`
        : encounter.failed
          ? `${encounter.frameTitle} collapsed`
          : `${encounter.frameTitle} · turn ${Math.min(encounter.turn, encounter.turnLimit)}/${encounter.turnLimit}`
      : nearbyNode
        ? `Holding at ${nearbyNode.label}`
        : activeHistoricalFrame?.title ?? runtimeCueNode?.label ?? objectiveNode?.label ?? 'Chart trail live',
  );
  const fieldConsoleHint = $derived(
    canResolveEncounter && encounter
      ? 'Resolve this slice first. The dock is the only decision layer that matters right now.'
      : trailRule,
  );
  const fieldKeyline = $derived.by(() =>
    canResolveEncounter ? ['Choose 1-4', 'Aim arrows', 'Confirm Enter'] : ['Move WASD', 'Run Shift', 'Act E'],
  );

  function triggerInteract() {
    if (canResolveEncounter && encounter) {
      fieldStore.setFieldStatus('Resolve the current chart slice before marching to the next node.', nearbyNode?.id ?? runtimeCueNodeId ?? undefined);
      return;
    }

    const node = fieldStore.interact();
    if (!node) {
      return;
    }

    const mappedScenarioId = activeHistoricalFrame ? getScenarioForHistoricalFrame(activeHistoricalFrame.id) : $labStore.activeScenarioId;
    const targetAgent = fieldParty[0];
    if (targetAgent) {
      rosterStore.selectAgent(targetAgent.id);
      labStore.setActiveAgent(targetAgent.id);
      labStore.ensureDraft(targetAgent.id);
      if (activeDoctrineSessionId && labStore.getDoctrineSession(targetAgent.id, activeDoctrineSessionId)) {
        labStore.setActiveDoctrineSession(targetAgent.id, activeDoctrineSessionId);
      }
    }
    labStore.setActiveScenario(mappedScenarioId);

    if (node.kind === 'CAMP') {
      fieldStore.restAtCamp();
      fieldStore.setFieldStatus('Camp steadied the squad. HP is restored enough to read the next slice.', 'spar-gate');
      return;
    }

    if (node.kind === 'ARCHIVE') {
      fieldStore.setFieldStatus('Archive well opened. Read the squad, then drift back toward the spar gate.', 'spar-gate');
      if (targetAgent) {
        goto(`/agent/${targetAgent.id}`);
      }
      return;
    }

    if (node.kind === 'BATTLE_GATE' && activeHistoricalFrame) {
      if (encounter && !encounter.cleared) {
        fieldStore.setFieldStatus('Clear the current chart slice before stepping through the gate.', node.id);
        return;
      }
      const gate = node.id === 'spar-gate' ? 'spar' : 'proof';
      goto(
        buildRouteHref('/battle', [
          ['agent', contextAgentId],
          ['session', activeDoctrineSessionId],
          ['pack', activeProofPackId],
          ['entry', 'field'],
          ['frame', activeHistoricalFrame.id],
          ['gate', gate],
        ]),
      );
      return;
    }

    if (node.kind === 'JOURNAL') {
      fieldStore.setFieldStatus('Journal board checked. Pick the next gate and move the squad back onto the trail.', 'spar-gate');
      goto(journalHref);
      return;
    }

    if (node.kind === 'LAB') {
      fieldStore.setFieldStatus('Bench tuning held. Head for the spar gate and test the rewrite.', 'spar-gate');
      goto(labHref);
      return;
    }

    if (node.href) {
      goto(node.href);
    }
  }

  function triggerFieldCommand(commandId: FieldCommandId) {
    selectedFieldCommandId = commandId;
    fieldStore.executeCommand(commandId);
    focusFieldStage();
  }

  function moveFieldCommandSelection(direction: 'left' | 'right' | 'up' | 'down') {
    const commands = fieldCommandDefinitions.map((command) => command.id);
    const index = commands.indexOf(selectedFieldCommandId);
    const safeIndex = index === -1 ? 0 : index;
    let nextIndex = safeIndex;

    if (direction === 'left' || direction === 'right') {
      nextIndex = safeIndex % 2 === 0 ? safeIndex + 1 : safeIndex - 1;
    }
    if (direction === 'up' || direction === 'down') {
      nextIndex = safeIndex < 2 ? safeIndex + 2 : safeIndex - 2;
    }

    nextIndex = Math.max(0, Math.min(commands.length - 1, nextIndex));
    selectedFieldCommandId = commands[nextIndex] ?? selectedFieldCommandId;
  }

  function focusFieldStage() {
    fieldStage?.focus();
  }

  onMount(() => {
    if (!browser) {
      return;
    }

    let lastTick = performance.now();
    let rafId = 0;

    if (contextAgentId) {
      rosterStore.selectAgent(contextAgentId);
      labStore.setActiveAgent(contextAgentId);
      labStore.ensureDraft(contextAgentId);
      if (activeDoctrineSessionId && labStore.getDoctrineSession(contextAgentId, activeDoctrineSessionId)) {
        labStore.setActiveDoctrineSession(contextAgentId, activeDoctrineSessionId);
      }
    }

    const returnMessage = fieldReturnMessage(effectiveReturnContext);
    if (returnMessage) {
      fieldStore.setFieldStatus(returnMessage, runtimeCueNodeId);
      window.history.replaceState({}, '', fieldShellHref);
    }

    const handleKey = (event: KeyboardEvent, pressed: boolean) => {
      const key = event.key.toLowerCase();
      if (pressed && canResolveEncounter && key === 'arrowup') {
        event.preventDefault();
        moveFieldCommandSelection('up');
        return;
      }
      if (pressed && canResolveEncounter && key === 'arrowdown') {
        event.preventDefault();
        moveFieldCommandSelection('down');
        return;
      }
      if (pressed && canResolveEncounter && key === 'arrowleft') {
        event.preventDefault();
        moveFieldCommandSelection('left');
        return;
      }
      if (pressed && canResolveEncounter && key === 'arrowright') {
        event.preventDefault();
        moveFieldCommandSelection('right');
        return;
      }
      if (key === 'w') {
        event.preventDefault();
        fieldStore.setInput({ up: pressed });
        return;
      }
      if (key === 's') {
        event.preventDefault();
        fieldStore.setInput({ down: pressed });
        return;
      }
      if (key === 'a') {
        event.preventDefault();
        fieldStore.setInput({ left: pressed });
        return;
      }
      if (key === 'd') {
        event.preventDefault();
        fieldStore.setInput({ right: pressed });
        return;
      }
      if (key === 'shift') {
        fieldStore.setInput({ run: pressed });
        return;
      }
      if (pressed) {
        const command = fieldCommandDefinitions.find((entry) => entry.hotkey === key);
        if (command) {
          event.preventDefault();
          triggerFieldCommand(command.id);
          return;
        }
      }
      if (pressed && key === 'enter' && canResolveEncounter) {
        event.preventDefault();
        triggerFieldCommand(selectedFieldCommandId);
        return;
      }
      if (pressed && (key === 'e' || key === ' ')) {
        event.preventDefault();
        triggerInteract();
      }
    };

    const onKeyDown = (event: KeyboardEvent) => handleKey(event, true);
    const onKeyUp = (event: KeyboardEvent) => handleKey(event, false);

    const loop = (now: number) => {
      fieldStore.step(now - lastTick);
      lastTick = now;
      rafId = window.requestAnimationFrame(loop);
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    rafId = window.requestAnimationFrame(loop);
    focusFieldStage();

    window.__cogochi_text_state = () => ({
      mode: 'field',
      leader: leader?.name ?? null,
      contextAgentId,
      doctrineSessionId: activeDoctrineSessionId,
      fieldHref: fieldShellHref,
      journalHref,
      labHref,
      objective: objectiveNode?.label ?? null,
      runtimeCueNode: runtimeCueNode?.label ?? null,
      runtimeCueVerb,
      runtimeCueText,
      runtimeGoal: trailRule,
      runtimeFocusCheck,
      trailRule,
      activeFrame: activeHistoricalFrame?.title ?? null,
      activeScenarioId,
      nearbyNode: nearbyNode?.label ?? null,
      canInteract: fieldStateView.canInteract,
      run: {
        hp: runStats.hp,
        gold: runStats.gold,
        xp: runStats.xp,
        clearedFrames: runStats.clearedFrameIds.length,
        currentStreak: runStats.currentStreak,
      },
      encounter: encounter
        ? {
            frameId: encounter.frameId,
            frameTitle: encounter.frameTitle,
            turn: encounter.turn,
            turnLimit: encounter.turnLimit,
            visibleCount: encounter.visibleCount,
            recommendedCommandId: encounter.recommendedCommandId,
            supportPrice: encounter.supportPrice,
            resistancePrice: encounter.resistancePrice,
            hazardPrice: encounter.hazardPrice,
            hazardLabel: encounter.hazardLabel,
            bark: encounter.bark,
            clue: encounter.clue,
            cleared: encounter.cleared,
            failed: encounter.failed,
            lastSummary: encounter.lastSummary,
          }
        : null,
      commands: fieldCommandDefinitions.map((command) => ({
        id: command.id,
        hotkey: command.hotkey,
        recommended: encounter?.recommendedCommandId === command.id,
        selected: selectedFieldCommandId === command.id,
        disabled: !canResolveEncounter,
      })),
      lastEvent: fieldStateView.lastEvent,
      returnSummary,
      artifact: selectedProofArtifact?.id ?? null,
      members: fieldStateView.members.map((member) => ({
        agentId: member.agentId,
        x: Math.round(member.x),
        y: Math.round(member.y),
        moving: member.moving,
        facing: member.facing,
      })),
    });

    window.advanceTime = (ms: number) => {
      const stepSize = 16;
      const steps = Math.max(1, Math.round(ms / stepSize));
      for (let index = 0; index < steps; index += 1) {
        fieldStore.step(stepSize);
      }
    };

    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.cancelAnimationFrame(rafId);
      fieldStore.setInput({ up: false, down: false, left: false, right: false, run: false });
      window.advanceTime = (_ms: number) => {};
      delete window.__cogochi_text_state;
    };
  });

  $effect(() => {
    if (fieldParty.length) {
      fieldStore.setParty(fieldParty);
    }
  });

  $effect(() => {
    fieldStore.setActiveFrame(activeHistoricalFrame?.id ?? null);
  });

  $effect(() => {
    if (encounterRecommendation) {
      selectedFieldCommandId = encounterRecommendation.id;
    }
  });

  $effect(() => {
    if (!browser || !runtimeCueNodeId || runtimeCueNodeId === fieldStateView.objectiveNodeId) {
      return;
    }
    fieldStore.setFieldStatus(fieldStateView.lastEvent, runtimeCueNodeId);
  });
</script>

<PageShell condensed minimal immersive>
  <section class="field-layout">
    <!-- svelte-ignore a11y_no_noninteractive_tabindex -->
    <div
      bind:this={fieldStage}
      aria-label="Controllable field stage"
      class="field-stage panel"
      onfocus={focusFieldStage}
      role="application"
      tabindex="0"
    >
      <div class="field-stage__viewport">
        <FieldScene
          state={fieldStateView}
          agents={fieldParty}
          {encounter}
          runtimeCueNodeId={runtimeCueNodeId}
          runtimeCueVerb={runtimeCueVerb}
        />

        <div class="field-plaque">
          <div class="field-plaque__board">
            <span class="field-plaque__kicker">{encounter ? 'Micro Encounter' : 'Zone Traverse'}</span>
            <strong>{fieldPlaqueTitle}</strong>
            <p>{fieldPlaqueDetail}</p>
            <div class="field-plaque__route">
              {#if activeHistoricalFrame}
                <span class="field-route-chip field-route-chip--frame">{activeHistoricalFrame.shortLabel}</span>
              {/if}
              {#if encounter}
                <span class="field-route-chip field-route-chip--turn">Turn {Math.min(encounter.turn, encounter.turnLimit)}/{encounter.turnLimit}</span>
                <span class="field-route-chip field-route-chip--call">{encounter.recommendedCommandId}</span>
              {/if}
              <span class="field-route-chip runtimeCue">{runtimeCueNode?.label ?? objectiveNode?.label ?? 'Next gate'}</span>
              {#if nearbyNode}
                <span class="field-route-chip active">At {nearbyNode.label}</span>
              {/if}
            </div>
          </div>
        </div>

        {#if encounter}
          <div class="field-command-dock">
            <div class="field-command-dock__masthead">
              <div>
                <span class="field-command-dock__kicker">Command Dock</span>
                <strong>{encounter.frameTitle}</strong>
                <p>{encounter.clue}</p>
              </div>
              <div class="field-command-dock__scoreline">
                <span>HP {runStats.hp}/18</span>
                <span>Gold {runStats.gold}</span>
                <span>XP {runStats.xp}</span>
              </div>
            </div>

            <div class="field-command-dock__reads">
              <span>Support {formatFieldPrice(encounter.supportPrice)}</span>
              <span>Resistance {formatFieldPrice(encounter.resistancePrice)}</span>
              <span>{encounter.hazardLabel ? `${encounter.hazardLabel} ${encounter.hazardPrice ? formatFieldPrice(encounter.hazardPrice) : ''}`.trim() : 'No hazard call'}</span>
            </div>

            <div class="field-command-dock__actions">
              {#each fieldCommandDefinitions as command}
                <button
                  class:recommended={encounter.recommendedCommandId === command.id}
                  class:selected={selectedFieldCommandId === command.id}
                  class="field-command-dock__button"
                  disabled={!canResolveEncounter}
                  onclick={() => triggerFieldCommand(command.id)}
                >
                  <small>{command.hotkey}</small>
                  <strong>{command.label}</strong>
                  <span>{command.shortLabel}</span>
                </button>
              {/each}
            </div>

            <div
              class:fail={encounter.failed}
              class:success={encounter.cleared}
              class="field-command-dock__result"
            >
              {#if encounter.failed}
                <strong>Frame broke the squad.</strong>
                <p>Walk back to Camp and restore HP before re-reading this zone.</p>
              {:else if encounter.cleared}
                <strong>Frame cleared.</strong>
                <p>Rewards locked in. March to the next frame or enter the next gate.</p>
              {:else if encounter.lastSummary}
                <strong>Last reveal</strong>
                <p>{encounter.lastSummary}</p>
              {:else}
                <strong>Selected call: {selectedFieldCommand.label}</strong>
                <p>Use arrow keys plus Enter, `1-4`, or click the dock. The next candle will resolve immediately.</p>
              {/if}
            </div>
          </div>
        {/if}

        <div class="field-stage__footer">
          <span>Frames cleared {runStats.clearedFrameIds.length}</span>
          <span>{canResolveEncounter ? 'Resolve the dock to march again' : nearbyNode ? `Press E at ${nearbyNode.label}` : 'Move through the trail'}</span>
        </div>
      </div>
    </div>

    <aside class="field-console panel">
      <div class="field-console__masthead">
        <div>
          <p class="section-kicker">Trail Console</p>
          <h2 class="section-title">{leader?.name ?? 'Lead companion'}</h2>
          <p class="field-console__subtitle">{fieldConsoleStatus}</p>
        </div>
        {#if leader}
          <div class="field-console__hero-avatar">
            <PixelSprite agent={leader} frameIndex={0} size={58} alt={leader.name} />
          </div>
        {/if}
      </div>

      <div class="field-console__stream">
        <article class="field-console__bubble field-console__bubble--user">
          <small>Next move</small>
          <p>{fieldConsolePrompt}</p>
        </article>

        {#each fieldConsoleFeed as entry}
          <article
            class={`field-console__bubble field-console__bubble--${entry.speaker} field-console__bubble--${entry.tone}`}
          >
            <small>{entry.label}</small>
            <p>{entry.text}</p>
          </article>
        {/each}
      </div>

      <div class="field-console__cta">
        {#if canTravelToNearbyNode && nearbyNode}
          <button class="action-button field-console__action" onclick={triggerInteract}>
            Cross into {nearbyNode.label}
          </button>
        {:else if nearbyNode}
          <button class="action-button field-console__action field-console__action--quiet" disabled>
            Resolve current slice
          </button>
        {:else}
          <button class="action-button field-console__action field-console__action--quiet" disabled>
            March toward {runtimeCueNode?.label ?? objectiveNode?.label ?? 'the next gate'}
          </button>
        {/if}

        <p class="field-console__hint">{fieldConsoleHint}</p>

        <div class="field-console__keyline">
          {#each fieldKeyline as hint}
            <span>{hint}</span>
          {/each}
        </div>
      </div>

      <div class="field-console__party-strip">
        {#each fieldParty as agent}
          <div class:leader={leader?.id === agent.id} class="field-console__member">
            <div class="field-console__member-avatar">
              <PixelSprite agent={agent} frameIndex={0} size={28} alt={agent.name} />
            </div>
            <div class="field-console__member-copy">
              <strong>{agent.name}</strong>
              <span>{agent.role}</span>
            </div>
          </div>
        {/each}
      </div>
    </aside>
  </section>
</PageShell>

<style>
  .field-layout {
    --field-gold: rgba(239, 187, 105, 0.84);
    --field-gold-soft: rgba(239, 187, 105, 0.16);
    --field-mint: rgba(109, 216, 176, 0.82);
    --field-mint-soft: rgba(109, 216, 176, 0.16);
    --field-panel: rgba(10, 17, 24, 0.72);
    --field-panel-strong: rgba(8, 14, 20, 0.9);
    --field-line: rgba(255, 239, 205, 0.14);
    --field-shadow: 0 28px 64px rgba(6, 10, 15, 0.24);
    display: grid;
    grid-template-columns: minmax(0, 1fr) 356px;
    gap: 16px;
    align-items: stretch;
    min-height: 100vh;
    padding: 14px;
    background:
      radial-gradient(circle at 16% 0, rgba(255, 218, 142, 0.16), transparent 24%),
      radial-gradient(circle at 100% 8%, rgba(115, 206, 255, 0.12), transparent 22%),
      linear-gradient(180deg, rgba(3, 7, 11, 0.98), rgba(5, 9, 13, 1));
  }

  .field-stage {
    width: 100%;
    min-width: 0;
    position: relative;
    overflow: hidden;
    padding: 5px;
    background:
      linear-gradient(145deg, rgba(255, 255, 255, 0.05), transparent 28%),
      linear-gradient(180deg, rgba(9, 13, 18, 0.96), rgba(3, 6, 10, 0.98));
    border: 1px solid rgba(228, 183, 109, 0.3);
    border-radius: 28px;
    box-shadow:
      inset 0 0 0 1px rgba(255, 233, 193, 0.08),
      inset 0 18px 24px rgba(255, 255, 255, 0.03),
      var(--field-shadow);
  }

  .field-stage::before {
    content: '';
    position: absolute;
    inset: 0;
    pointer-events: none;
    z-index: 1;
    background:
      linear-gradient(180deg, rgba(255, 255, 255, 0.06), transparent 16%),
      radial-gradient(circle at 50% 100%, rgba(255, 187, 82, 0.1), transparent 36%);
  }

  .field-stage__viewport {
    position: relative;
    height: calc(100vh - 32px);
    min-height: 680px;
    border-radius: 24px;
    overflow: hidden;
  }

  .field-plaque,
  .field-stage__footer {
    position: absolute;
    pointer-events: none;
    z-index: 10;
  }

  .field-plaque {
    top: 22px;
    left: 22px;
    max-width: min(480px, calc(100% - 140px));
  }

  .field-plaque__board {
    display: grid;
    gap: 8px;
    padding: 13px 15px;
    border-radius: 20px;
    border: 1px solid rgba(233, 192, 123, 0.34);
    background:
      linear-gradient(180deg, rgba(10, 16, 23, 0.74), rgba(8, 13, 19, 0.68));
    backdrop-filter: blur(16px);
    box-shadow:
      0 22px 36px rgba(0, 0, 0, 0.24),
      inset 0 1px 0 rgba(255, 245, 219, 0.08);
  }

  .field-plaque__kicker,
  .field-console small {
    color: rgba(209, 216, 230, 0.58);
    font-size: 0.66rem;
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }

  .field-plaque__board strong {
    color: rgba(250, 239, 213, 0.98);
    line-height: 1.2;
    font-size: 1.08rem;
    letter-spacing: -0.01em;
  }

  .field-plaque__board p {
    margin: 0;
    color: rgba(228, 236, 244, 0.74);
    line-height: 1.4;
    font-size: 0.82rem;
  }

  .field-plaque__route {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }

  .field-route-chip {
    display: inline-flex;
    align-items: center;
    min-height: 24px;
    padding: 0 10px;
    border-radius: 999px;
    border: 1px solid rgba(255, 225, 174, 0.18);
    background: rgba(255, 255, 255, 0.06);
    color: rgba(246, 236, 211, 0.76);
    font-size: 0.62rem;
    font-weight: 700;
    letter-spacing: 0.05em;
  }

  .field-route-chip--frame {
    color: rgba(230, 221, 194, 0.72);
  }

  .field-route-chip--turn {
    border-color: rgba(251, 221, 132, 0.24);
    background: rgba(101, 72, 26, 0.34);
    color: rgba(252, 243, 215, 0.94);
  }

  .field-route-chip--call {
    border-color: rgba(122, 226, 169, 0.26);
    background: rgba(30, 99, 76, 0.34);
    color: rgba(234, 250, 241, 0.96);
  }

  .field-route-chip.runtimeCue {
    border-color: rgba(114, 220, 210, 0.26);
    background: rgba(35, 131, 136, 0.24);
    color: rgba(232, 252, 250, 0.96);
  }

  .field-route-chip.active {
    box-shadow: 0 0 0 1px rgba(240, 194, 105, 0.16);
  }

  .field-command-dock {
    position: absolute;
    left: 20px;
    right: 20px;
    bottom: 72px;
    z-index: 11;
    display: grid;
    gap: 12px;
    padding: 16px 18px;
    border-radius: 24px;
    border: 1px solid rgba(242, 207, 144, 0.26);
    background:
      linear-gradient(145deg, rgba(255, 255, 255, 0.05), transparent 30%),
      linear-gradient(180deg, rgba(10, 15, 21, 0.84), rgba(7, 11, 17, 0.9));
    box-shadow:
      0 26px 44px rgba(0, 0, 0, 0.28),
      inset 0 1px 0 rgba(255, 245, 219, 0.08);
    backdrop-filter: blur(16px);
  }

  .field-command-dock__masthead {
    display: flex;
    justify-content: space-between;
    gap: 12px;
    align-items: flex-start;
  }

  .field-command-dock__kicker {
    display: inline-flex;
    margin-bottom: 4px;
    color: rgba(218, 227, 238, 0.58);
    font-size: 0.66rem;
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }

  .field-command-dock__masthead strong {
    display: block;
    color: rgba(249, 237, 211, 0.98);
    font-size: 1rem;
    line-height: 1.15;
  }

  .field-command-dock__masthead p,
  .field-command-dock__result p {
    margin: 4px 0 0;
    color: rgba(228, 235, 244, 0.74);
    font-size: 0.8rem;
    line-height: 1.4;
  }

  .field-command-dock__scoreline,
  .field-command-dock__reads {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .field-command-dock__scoreline {
    justify-content: flex-end;
  }

  .field-command-dock__scoreline span,
  .field-command-dock__reads span {
    display: inline-flex;
    align-items: center;
    min-height: 30px;
    padding: 0 12px;
    border-radius: 999px;
    border: 1px solid rgba(246, 215, 163, 0.16);
    background: rgba(255, 255, 255, 0.06);
    color: rgba(241, 232, 214, 0.82);
    font-size: 0.66rem;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }

  .field-command-dock__actions {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 10px;
  }

  .field-command-dock__button {
    display: grid;
    gap: 6px;
    align-items: start;
    justify-items: start;
    min-height: 100px;
    padding: 12px 14px;
    border-radius: 18px;
    border: 1px solid rgba(241, 207, 148, 0.18);
    background:
      linear-gradient(180deg, rgba(27, 40, 52, 0.98), rgba(13, 22, 31, 0.96));
    color: rgba(245, 239, 226, 0.9);
    cursor: pointer;
    transition:
      transform 120ms ease,
      border-color 120ms ease,
      background 120ms ease,
      box-shadow 120ms ease;
    box-shadow:
      inset 0 1px 0 rgba(255, 255, 255, 0.04),
      0 10px 20px rgba(5, 10, 14, 0.16);
  }

  .field-command-dock__button:hover:not(:disabled),
  .field-command-dock__button:focus-visible:not(:disabled) {
    transform: translateY(-2px);
    border-color: rgba(244, 214, 149, 0.34);
    background:
      linear-gradient(180deg, rgba(35, 49, 62, 0.98), rgba(17, 29, 40, 0.98));
    box-shadow:
      inset 0 1px 0 rgba(255, 255, 255, 0.06),
      0 14px 24px rgba(5, 10, 14, 0.2);
  }

  .field-command-dock__button.recommended {
    border-color: rgba(112, 224, 171, 0.44);
    background:
      linear-gradient(180deg, rgba(20, 68, 60, 0.98), rgba(10, 41, 36, 0.98));
  }

  .field-command-dock__button.selected {
    box-shadow:
      0 0 0 2px rgba(243, 214, 146, 0.22),
      inset 0 1px 0 rgba(255, 247, 226, 0.08),
      0 16px 28px rgba(5, 10, 14, 0.18);
  }

  .field-command-dock__button:disabled {
    opacity: 0.68;
    cursor: default;
  }

  .field-command-dock__button small {
    display: inline-flex;
    align-items: center;
    min-height: 22px;
    padding: 0 8px;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.08);
    color: rgba(239, 228, 200, 0.78);
    font-size: 0.62rem;
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }

  .field-command-dock__button strong {
    font-size: 1.06rem;
    line-height: 1.02;
  }

  .field-command-dock__button span {
    color: rgba(223, 231, 239, 0.76);
    font-size: 0.76rem;
    line-height: 1.25;
  }

  .field-command-dock__result {
    padding: 12px 14px;
    border-radius: 18px;
    border: 1px solid rgba(246, 215, 163, 0.14);
    background: rgba(255, 255, 255, 0.06);
  }

  .field-command-dock__result strong {
    color: rgba(250, 240, 216, 0.98);
    font-size: 0.8rem;
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }

  .field-command-dock__result.success {
    border-color: rgba(118, 227, 177, 0.3);
    background: rgba(20, 75, 63, 0.34);
  }

  .field-command-dock__result.fail {
    border-color: rgba(227, 118, 132, 0.3);
    background: rgba(79, 25, 31, 0.38);
  }

  .field-stage__footer {
    left: 20px;
    bottom: 18px;
    display: flex;
    gap: 8px;
    align-items: center;
    flex-wrap: wrap;
    max-width: calc(100% - 36px);
  }

  .field-stage__footer span {
    display: inline-flex;
    align-items: center;
    min-height: 26px;
    padding: 0 10px;
    border-radius: 12px;
    border: 1px solid rgba(247, 217, 164, 0.18);
    background: rgba(11, 15, 21, 0.72);
    color: rgba(241, 234, 218, 0.78);
    text-transform: uppercase;
    letter-spacing: 0.08em;
    font-size: 0.62rem;
  }

  .field-console {
    display: grid;
    grid-template-rows: auto minmax(0, 1fr) auto auto;
    gap: 14px;
    min-height: calc(100vh - 24px);
    padding: 0;
    overflow: hidden;
    border-radius: 28px;
    border: 1px solid rgba(232, 197, 141, 0.16);
    background:
      linear-gradient(145deg, rgba(255, 255, 255, 0.04), transparent 26%),
      radial-gradient(circle at top right, rgba(232, 176, 95, 0.12), transparent 24%),
      linear-gradient(180deg, rgba(12, 16, 21, 0.98), rgba(8, 11, 16, 1));
    box-shadow:
      inset 0 1px 0 rgba(255, 255, 255, 0.06),
      inset 0 18px 26px rgba(255, 255, 255, 0.03),
      0 28px 56px rgba(0, 0, 0, 0.24);
    backdrop-filter: blur(16px);
  }

  .field-console__masthead {
    display: flex;
    justify-content: space-between;
    gap: 12px;
    align-items: center;
    position: relative;
    padding: 20px 18px 16px;
    background:
      linear-gradient(180deg, rgba(36, 44, 52, 0.98), rgba(22, 28, 34, 0.94)),
      linear-gradient(90deg, rgba(232, 178, 96, 0.12), rgba(119, 190, 169, 0.1));
  }

  .field-console__masthead::after {
    content: '';
    position: absolute;
    inset: 0;
    pointer-events: none;
    background: linear-gradient(180deg, rgba(255, 255, 255, 0.12), transparent 42%);
  }

  .field-console__masthead h2,
  .field-console__masthead p {
    margin: 0;
  }

  .field-console__subtitle {
    color: rgba(223, 230, 236, 0.78);
    font-size: 0.82rem;
    line-height: 1.4;
  }

  .field-console__hero-avatar {
    display: grid;
    place-items: center;
    width: 72px;
    height: 72px;
    flex: 0 0 72px;
    border-radius: 18px;
    border: 1px solid rgba(255, 240, 211, 0.16);
    background: rgba(12, 18, 24, 0.62);
    box-shadow:
      inset 0 1px 0 rgba(255, 255, 255, 0.08),
      0 10px 18px rgba(6, 10, 14, 0.14);
  }

  .field-console__stream {
    display: grid;
    align-content: start;
    gap: 10px;
    padding: 0 16px;
    overflow: auto;
  }

  .field-console__bubble {
    display: grid;
    gap: 6px;
    padding: 13px 14px;
    border-radius: 20px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    background: rgba(19, 23, 33, 0.92);
    box-shadow:
      inset 0 1px 0 rgba(255, 255, 255, 0.04),
      0 12px 22px rgba(6, 8, 14, 0.12);
  }

  .field-console__bubble p {
    margin: 0;
    color: rgba(233, 237, 245, 0.84);
    line-height: 1.42;
    font-size: 0.88rem;
  }

  .field-console__bubble--user {
    justify-self: end;
    width: min(100%, 260px);
    border-color: rgba(238, 192, 114, 0.22);
    background: linear-gradient(180deg, rgba(80, 61, 31, 0.98), rgba(59, 44, 23, 0.96));
  }

  .field-console__bubble--user small,
  .field-console__bubble--user p {
    color: rgba(251, 247, 255, 0.94);
  }

  .field-console__bubble--agent {
    width: min(100%, 292px);
  }

  .field-console__bubble--system {
    width: min(100%, 300px);
    border-style: dashed;
    border-color: rgba(255, 225, 174, 0.12);
    background: rgba(14, 18, 27, 0.92);
  }

  .field-console__bubble--accent {
    border-color: rgba(255, 202, 124, 0.18);
    background: linear-gradient(180deg, rgba(31, 34, 47, 0.98), rgba(24, 27, 39, 0.98));
  }

  .field-console__bubble--info {
    border-color: rgba(66, 206, 216, 0.24);
    background: rgba(12, 31, 39, 0.94);
  }

  .field-console__cta {
    display: grid;
    gap: 10px;
    padding: 0 16px;
  }

  .field-console__action {
    min-height: 50px;
    justify-content: center;
    border-radius: 16px;
    background: linear-gradient(180deg, rgba(239, 192, 101, 0.98), rgba(218, 153, 70, 0.98));
    color: rgba(18, 18, 24, 0.98);
    box-shadow:
      0 16px 26px rgba(14, 11, 6, 0.14),
      inset 0 1px 0 rgba(255, 244, 214, 0.3);
  }

  .field-console__action--quiet {
    background: rgba(255, 255, 255, 0.06);
    color: rgba(223, 231, 238, 0.72);
  }

  .field-console__hint {
    margin: 0;
    color: rgba(205, 214, 220, 0.68);
    font-size: 0.82rem;
    line-height: 1.45;
  }

  .field-console__keyline {
    display: flex;
    gap: 8px;
  }

  .field-console__keyline span {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-height: 32px;
    min-width: 82px;
    padding: 0 10px;
    border-radius: 16px;
    border: 1px solid rgba(255, 239, 208, 0.1);
    background: rgba(255, 255, 255, 0.05);
    color: rgba(243, 231, 204, 0.82);
    font-size: 0.72rem;
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }

  .field-console__party-strip {
    display: grid;
    gap: 8px;
    padding: 0 16px;
  }

  .field-console__member {
    display: grid;
    grid-template-columns: 40px minmax(0, 1fr);
    gap: 8px;
    align-items: center;
    padding: 9px;
    border-radius: 18px;
    border: 1px solid rgba(118, 144, 138, 0.14);
    background: rgba(255, 255, 255, 0.04);
  }

  .field-console__member.leader {
    border-color: rgba(218, 159, 83, 0.22);
    background: rgba(218, 159, 83, 0.08);
  }

  .field-console__member-avatar {
    display: grid;
    place-items: center;
    width: 40px;
    height: 40px;
    border-radius: 12px;
    background: rgba(12, 18, 24, 0.92);
  }

  .field-console__member-copy {
    display: grid;
    gap: 3px;
    min-width: 0;
  }

  .field-console__member-copy strong {
    color: rgba(245, 240, 225, 0.96);
    font-size: 0.86rem;
  }

  .field-console__member-copy span {
    color: rgba(196, 208, 202, 0.68);
    font-size: 0.74rem;
    line-height: 1.3;
  }

  .field-stage:focus-visible {
    outline: 2px solid rgba(104, 192, 161, 0.64);
    outline-offset: 2px;
  }

  @media (max-width: 1100px) {
    .field-layout {
      grid-template-columns: 1fr;
      min-height: auto;
      padding: 10px;
    }

    .field-stage__viewport,
    .field-console {
      min-height: 0;
    }

    .field-stage__viewport {
      height: min(72vh, 760px);
    }

    .field-console {
      grid-template-rows: auto auto auto auto;
    }

    .field-command-dock {
      left: 14px;
      right: 14px;
      bottom: 66px;
    }

    .field-command-dock__actions {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  @media (max-width: 640px) {
    .field-layout {
      padding: 8px;
    }

    .field-stage__viewport {
      height: min(68vh, 620px);
    }

    .field-plaque {
      top: 12px;
      left: 12px;
      max-width: calc(100% - 24px);
    }

    .field-stage__footer {
      left: 12px;
      bottom: 12px;
    }

    .field-command-dock {
      left: 12px;
      right: 12px;
      bottom: 58px;
      padding: 12px;
    }

    .field-command-dock__masthead {
      flex-direction: column;
    }

    .field-command-dock__scoreline {
      justify-content: flex-start;
    }

    .field-command-dock__actions {
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 8px;
    }

    .field-command-dock__button {
      min-height: 82px;
    }

    .field-console__masthead {
      padding: 16px 14px 12px;
    }

    .field-console__hero-avatar {
      width: 60px;
      height: 60px;
      flex-basis: 60px;
    }

    .field-console__stream,
    .field-console__cta,
    .field-console__party-strip {
      padding-left: 14px;
      padding-right: 14px;
    }

    .field-console__keyline {
      flex-wrap: wrap;
    }
  }
</style>
