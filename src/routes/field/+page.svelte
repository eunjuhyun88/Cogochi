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
  import { fieldNodes, fieldStore } from '$lib/stores/fieldStore';
  import { labStore } from '$lib/stores/labStore';
  import { proofStore } from '$lib/stores/proofStore';
  import { rosterStore } from '$lib/stores/rosterStore';
  import type { CareState, ProofArtifact } from '$lib/types';

  let { data }: { data: PageData } = $props();
  let fieldStage: HTMLElement | null = null;

  type FieldReturnContext = PageData['returnContext'];
  type FieldConsoleEntry = {
    label: string;
    text: string;
    tone: 'accent' | 'info' | 'quiet';
    speaker: 'agent' | 'system';
  };

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

  function toolLabelForContext(careState: CareState | null, returnContext: FieldReturnContext): string {
    if (returnContext.verdict === 'QUARANTINED') {
      return 'Shard Quarantine';
    }
    if (returnContext.verdict === 'REVERTED') {
      return 'Reset Bench';
    }
    if (careState === 'MEMORY_DRIFT') {
      return 'Memory Anchor';
    }
    if (careState === 'DOCTRINE_BLUR') {
      return 'Doctrine Tuner';
    }
    if (careState === 'SQUAD_FRICTION') {
      return 'Party Relay';
    }
    if (careState === 'CONFIDENCE_SHAKE') {
      return 'Risk Reader';
    }
    return 'Trail Reader';
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
  const effectiveReturnContext = $derived.by<FieldReturnContext>(() =>
    selectedProofArtifact ? returnContextFromArtifact(selectedProofArtifact) : data.returnContext,
  );
  const state = $derived($fieldStore);
  const objectiveNode = $derived(fieldNodes.find((node) => node.id === state.objectiveNodeId) ?? null);
  const nearbyNode = $derived(fieldNodes.find((node) => node.id === state.nearbyNodeId) ?? null);
  const leader = $derived(fallbackParty[0] ?? null);
  const activeHistoricalFrame = $derived.by(() => {
    const currentLeader = state.members[0];
    if (!currentLeader) {
      return null;
    }
    return resolveHistoricalFieldFrame(currentLeader.x, state.width);
  });
  const activeScenarioId = $derived(
    activeHistoricalFrame ? getScenarioForHistoricalFrame(activeHistoricalFrame.id) : $labStore.activeScenarioId,
  );
  const runtimeCueNodeId = $derived(
    targetNodeIdForCue(effectiveReturnContext, leader?.careState ?? null, state.objectiveNodeId),
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
  const fieldConsoleFeed = $derived.by<FieldConsoleEntry[]>(() =>
    [
      { label: leader?.name ?? 'Companion read', text: runtimeCueText, tone: 'accent', speaker: 'agent' },
      runtimeFocusCheck
        ? { label: 'Scout check', text: runtimeFocusCheck, tone: 'info' as const, speaker: 'agent' }
        : null,
      { label: 'Trail rule', text: trailRule, tone: 'quiet', speaker: 'system' },
      returnSummary ? { label: 'Return mark', text: returnSummary, tone: 'quiet' as const, speaker: 'system' } : null,
    ].filter((entry): entry is FieldConsoleEntry => Boolean(entry)),
  );
  const fieldConsolePrompt = $derived(
    nearbyNode
      ? `cross into ${nearbyNode.label.toLowerCase()}`
      : `guide the squad toward ${(runtimeCueNode?.label ?? objectiveNode?.label ?? 'the next gate').toLowerCase()}`,
  );
  const fieldConsoleTool = $derived(toolLabelForContext(leader?.careState ?? null, effectiveReturnContext));
  const fieldConsoleStatus = $derived(
    nearbyNode
      ? `Holding at ${nearbyNode.label}`
      : activeHistoricalFrame?.title ?? runtimeCueNode?.label ?? objectiveNode?.label ?? 'Chart trail live',
  );

  function triggerInteract() {
    const node = fieldStore.interact();
    if (!node) {
      return;
    }

    const mappedScenarioId = activeHistoricalFrame ? getScenarioForHistoricalFrame(activeHistoricalFrame.id) : $labStore.activeScenarioId;
    const targetAgent = fallbackParty[0];
    if (targetAgent) {
      rosterStore.selectAgent(targetAgent.id);
      labStore.setActiveAgent(targetAgent.id);
    }
    labStore.setActiveScenario(mappedScenarioId);

    if (node.kind === 'ARCHIVE') {
      fieldStore.setFieldStatus('Archive well opened. Read the squad, then drift back toward the spar gate.', 'spar-gate');
      if (targetAgent) {
        goto(`/agent/${targetAgent.id}`);
      }
      return;
    }

    if (node.kind === 'BATTLE_GATE' && activeHistoricalFrame) {
      const gate = node.id === 'spar-gate' ? 'spar' : 'proof';
      goto(`/battle?entry=field&frame=${activeHistoricalFrame.id}&gate=${gate}`);
      return;
    }

    if (node.kind === 'JOURNAL') {
      fieldStore.setFieldStatus('Journal board checked. Pick the next gate and move the squad back onto the trail.', 'spar-gate');
    } else if (node.kind === 'LAB') {
      fieldStore.setFieldStatus('Bench tuning held. Head for the spar gate and test the rewrite.', 'spar-gate');
    }

    if (node.href) {
      goto(node.href);
    }
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

    const returnMessage = fieldReturnMessage(effectiveReturnContext);
    if (returnMessage) {
      fieldStore.setFieldStatus(returnMessage, runtimeCueNodeId);
      window.history.replaceState({}, '', '/field');
    }

    const handleKey = (event: KeyboardEvent, pressed: boolean) => {
      const key = event.key.toLowerCase();
      if (['arrowup', 'w'].includes(key)) {
        event.preventDefault();
        fieldStore.setInput({ up: pressed });
        return;
      }
      if (['arrowdown', 's'].includes(key)) {
        event.preventDefault();
        fieldStore.setInput({ down: pressed });
        return;
      }
      if (['arrowleft', 'a'].includes(key)) {
        event.preventDefault();
        fieldStore.setInput({ left: pressed });
        return;
      }
      if (['arrowright', 'd'].includes(key)) {
        event.preventDefault();
        fieldStore.setInput({ right: pressed });
        return;
      }
      if (key === 'shift') {
        fieldStore.setInput({ run: pressed });
        return;
      }
      if (pressed && (key === 'e' || key === 'enter' || key === ' ')) {
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
      leader: fallbackParty[0]?.name ?? null,
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
      canInteract: state.canInteract,
      lastEvent: state.lastEvent,
      returnSummary,
      artifact: selectedProofArtifact?.id ?? null,
      members: state.members.map((member) => ({
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
    if (fallbackParty.length) {
      fieldStore.setParty(fallbackParty);
    }
  });

  $effect(() => {
    if (!browser || !runtimeCueNodeId || runtimeCueNodeId === state.objectiveNodeId) {
      return;
    }
    fieldStore.setFieldStatus(state.lastEvent, runtimeCueNodeId);
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
        <FieldScene {state} agents={fallbackParty} runtimeCueNodeId={runtimeCueNodeId} runtimeCueVerb={runtimeCueVerb} />

        <div class="field-plaque">
          <div class="field-plaque__board">
            <span class="field-plaque__kicker">Zone Traverse</span>
            <strong>{activeHistoricalFrame?.title ?? runtimeCueNode?.label ?? objectiveNode?.label ?? 'Gate'}</strong>
            <p>{runtimeCueText}</p>
            <div class="field-plaque__route">
              {#if activeHistoricalFrame}
                <span class="field-route-chip field-route-chip--frame">{activeHistoricalFrame.shortLabel}</span>
              {/if}
              <span class="field-route-chip runtimeCue">{runtimeCueNode?.label ?? objectiveNode?.label ?? 'Next gate'}</span>
              {#if nearbyNode}
                <span class="field-route-chip active">At {nearbyNode.label}</span>
              {/if}
            </div>
          </div>
        </div>

        <div class="field-stage__footer">
          <span>Party {fallbackParty.length}/4</span>
          <span>{leader ? careStateLabels[leader.careState] : 'Route ready'}</span>
          <span>{nearbyNode ? `Press E at ${nearbyNode.label}` : 'WASD / Shift / E'}</span>
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

      <div class="field-console__topics">
        <span class="field-console__topic">route</span>
        <span class="field-console__topic">risk</span>
        <span class="field-console__topic">camp</span>
      </div>

      <div class="field-console__stream">
        <article class="field-console__bubble field-console__bubble--user">
          <small>You</small>
          <p>{fieldConsolePrompt}</p>
        </article>

        <div class="field-console__tool">Using: {fieldConsoleTool}</div>

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
        {#if nearbyNode}
          <button class="action-button field-console__action" onclick={triggerInteract}>
            Cross into {nearbyNode.label}
          </button>
        {:else}
          <button class="action-button field-console__action field-console__action--quiet" disabled>
            March toward {runtimeCueNode?.label ?? objectiveNode?.label ?? 'the next gate'}
          </button>
        {/if}

        <div class="field-console__keyline">
          <span>WASD</span>
          <span>SHIFT</span>
          <span>E</span>
        </div>
      </div>

      <div class="field-console__party-strip">
        {#each fallbackParty as agent}
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

      <div aria-hidden="true" class="field-console__composer">
        <span>Ask about route, risk, camp...</span>
        <button type="button">SEND</button>
      </div>
    </aside>
  </section>
</PageShell>

<style>
  .field-layout {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 356px;
    gap: 12px;
    align-items: stretch;
    min-height: 100vh;
    padding: 12px;
    background:
      radial-gradient(circle at 50% 0, rgba(115, 86, 255, 0.12), transparent 24%),
      linear-gradient(180deg, rgba(2, 4, 8, 0.98), rgba(5, 8, 12, 1));
  }

  .field-stage {
    width: 100%;
    min-width: 0;
    position: relative;
    padding: 4px;
    background:
      linear-gradient(180deg, rgba(7, 8, 12, 0.98), rgba(3, 5, 9, 0.98));
    border: 1px solid rgba(223, 167, 90, 0.28);
    border-radius: 24px;
    box-shadow:
      inset 0 0 0 1px rgba(255, 219, 163, 0.08),
      0 30px 60px rgba(0, 0, 0, 0.36);
  }

  .field-stage__viewport {
    position: relative;
    height: calc(100vh - 32px);
    min-height: 680px;
    border-radius: 20px;
    overflow: hidden;
  }

  .field-plaque,
  .field-stage__footer {
    position: absolute;
    pointer-events: none;
    z-index: 10;
  }

  .field-plaque {
    top: 18px;
    left: 18px;
    max-width: min(480px, calc(100% - 140px));
  }

  .field-plaque__board {
    display: grid;
    gap: 6px;
    padding: 12px 14px;
    border-radius: 18px;
    border: 1px solid rgba(188, 137, 66, 0.34);
    background: rgba(9, 12, 18, 0.7);
    backdrop-filter: blur(12px);
    box-shadow:
      0 18px 36px rgba(0, 0, 0, 0.24),
      inset 0 1px 0 rgba(255, 239, 208, 0.06);
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
    font-size: 1.02rem;
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
    min-height: 20px;
    padding: 0 8px;
    border-radius: 999px;
    border: 1px solid rgba(255, 225, 174, 0.16);
    background: rgba(255, 255, 255, 0.05);
    color: rgba(246, 236, 211, 0.76);
    font-size: 0.62rem;
    font-weight: 700;
    letter-spacing: 0.05em;
  }

  .field-route-chip--frame {
    color: rgba(230, 221, 194, 0.72);
  }

  .field-route-chip.runtimeCue {
    border-color: rgba(114, 220, 210, 0.26);
    background: rgba(35, 131, 136, 0.24);
    color: rgba(232, 252, 250, 0.96);
  }

  .field-route-chip.active {
    box-shadow: 0 0 0 1px rgba(240, 194, 105, 0.16);
  }

  .field-stage__footer {
    left: 18px;
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
    border: 1px solid rgba(247, 217, 164, 0.14);
    background: rgba(11, 15, 21, 0.68);
    color: rgba(238, 231, 215, 0.74);
    text-transform: uppercase;
    letter-spacing: 0.08em;
    font-size: 0.62rem;
  }

  .field-console {
    display: grid;
    grid-template-rows: auto auto minmax(0, 1fr) auto auto auto;
    gap: 12px;
    min-height: calc(100vh - 24px);
    padding: 0;
    overflow: hidden;
    border-radius: 22px;
    border: 1px solid rgba(183, 134, 255, 0.24);
    background:
      radial-gradient(circle at top right, rgba(154, 91, 255, 0.18), transparent 24%),
      linear-gradient(180deg, rgba(13, 16, 25, 0.98), rgba(8, 11, 18, 0.98));
    box-shadow:
      inset 0 1px 0 rgba(255, 255, 255, 0.04),
      0 28px 50px rgba(0, 0, 0, 0.34);
  }

  .field-console__masthead {
    display: flex;
    justify-content: space-between;
    gap: 12px;
    align-items: center;
    padding: 18px 16px 14px;
    background: linear-gradient(90deg, rgba(140, 74, 255, 0.94), rgba(214, 161, 89, 0.84));
  }

  .field-console__masthead h2,
  .field-console__masthead p {
    margin: 0;
  }

  .field-console__subtitle {
    color: rgba(247, 244, 255, 0.8);
    font-size: 0.8rem;
    line-height: 1.35;
  }

  .field-console__hero-avatar {
    display: grid;
    place-items: center;
    width: 72px;
    height: 72px;
    flex: 0 0 72px;
    border-radius: 18px;
    border: 1px solid rgba(255, 240, 211, 0.18);
    background: rgba(12, 12, 18, 0.24);
  }

  .field-console__topics {
    display: flex;
    gap: 8px;
    padding: 0 16px;
  }

  .field-console__topic {
    display: inline-flex;
    align-items: center;
    min-height: 28px;
    padding: 0 12px;
    border-radius: 999px;
    border: 1px solid rgba(87, 214, 222, 0.28);
    background: rgba(16, 26, 37, 0.86);
    color: rgba(115, 233, 241, 0.88);
    font-size: 0.72rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.08em;
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
    gap: 5px;
    padding: 12px 13px;
    border-radius: 18px;
    border: 1px solid rgba(255, 255, 255, 0.08);
    background: rgba(19, 23, 33, 0.96);
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.03);
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
    border-color: rgba(142, 86, 236, 0.22);
    background: linear-gradient(180deg, rgba(135, 69, 241, 0.96), rgba(96, 54, 191, 0.96));
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

  .field-console__tool {
    justify-self: start;
    display: inline-flex;
    align-items: center;
    min-height: 30px;
    padding: 0 12px;
    border-radius: 999px;
    border: 1px solid rgba(66, 206, 216, 0.36);
    background: rgba(6, 30, 39, 0.84);
    color: rgba(97, 230, 240, 0.92);
    font-size: 0.74rem;
    font-weight: 700;
    letter-spacing: 0.06em;
  }

  .field-console__cta {
    display: grid;
    gap: 10px;
    padding: 0 16px;
  }

  .field-console__action {
    min-height: 46px;
    justify-content: center;
    border-radius: 14px;
    background: linear-gradient(180deg, rgba(239, 192, 101, 0.98), rgba(218, 153, 70, 0.98));
    color: rgba(18, 18, 24, 0.98);
    box-shadow: none;
  }

  .field-console__action--quiet {
    background: rgba(255, 255, 255, 0.06);
    color: rgba(223, 231, 238, 0.72);
  }

  .field-console__keyline {
    display: flex;
    gap: 8px;
  }

  .field-console__keyline span {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-height: 30px;
    min-width: 58px;
    padding: 0 10px;
    border-radius: 14px;
    border: 1px solid rgba(255, 239, 208, 0.08);
    background: rgba(255, 255, 255, 0.04);
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
    padding: 8px;
    border-radius: 16px;
    border: 1px solid rgba(118, 144, 138, 0.12);
    background: rgba(255, 255, 255, 0.03);
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

  .field-console__composer {
    display: flex;
    gap: 10px;
    align-items: center;
    padding: 14px 16px 16px;
    border-top: 1px solid rgba(255, 255, 255, 0.05);
    background: rgba(10, 12, 19, 0.96);
  }

  .field-console__composer span {
    flex: 1 1 auto;
    min-height: 42px;
    display: flex;
    align-items: center;
    padding: 0 14px;
    border-radius: 14px;
    border: 1px solid rgba(146, 89, 255, 0.28);
    background: rgba(8, 10, 18, 0.98);
    color: rgba(146, 154, 172, 0.78);
    font-size: 0.82rem;
  }

  .field-console__composer button {
    min-width: 72px;
    min-height: 42px;
    border: 0;
    border-radius: 12px;
    background: linear-gradient(180deg, rgba(154, 91, 255, 0.96), rgba(109, 58, 214, 0.96));
    color: rgba(251, 247, 255, 0.96);
    font-weight: 800;
    letter-spacing: 0.08em;
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
      grid-template-rows: auto auto auto auto auto auto;
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

    .field-console__masthead {
      padding: 16px 14px 12px;
    }

    .field-console__hero-avatar {
      width: 60px;
      height: 60px;
      flex-basis: 60px;
    }

    .field-console__topics,
    .field-console__stream,
    .field-console__cta,
    .field-console__party-strip,
    .field-console__composer {
      padding-left: 14px;
      padding-right: 14px;
    }

    .field-console__composer {
      flex-direction: column;
      align-items: stretch;
    }

    .field-console__composer button {
      width: 100%;
    }

    .field-console__keyline {
      flex-wrap: wrap;
    }
  }
</style>
