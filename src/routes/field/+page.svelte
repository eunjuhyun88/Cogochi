<script lang="ts">
  import { browser } from '$app/environment';
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  import type { PageData } from './$types';
  import FieldScene from '$components/shared/FieldScene.svelte';
  import PixelSprite from '$components/shared/PixelSprite.svelte';
  import PageShell from '$components/shared/PageShell.svelte';
  import { getScenarioForHistoricalFrame, resolveHistoricalFieldFrame } from '$lib/engine/chart-frame-model';
  import { fieldNodes, fieldStore } from '$lib/stores/fieldStore';
  import { labStore } from '$lib/stores/labStore';
  import { proofStore } from '$lib/stores/proofStore';
  import { rosterStore } from '$lib/stores/rosterStore';
  import type { CareState, ProofArtifact } from '$lib/types';

  let { data }: { data: PageData } = $props();
  let fieldStage: HTMLElement | null = null;

  type FieldReturnContext = PageData['returnContext'];

  function roleMark(role: string) {
    return role.slice(0, 1);
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

  function cueTextForContext(
    returnContext: FieldReturnContext,
    careState: CareState | null,
    targetLabel: string | null,
  ): string {
    const target = targetLabel ?? 'the next gate';
    if (returnContext.verdict === 'ACCEPTED') {
      return `The proof survived. Escalate toward ${target}.`;
    }
    if (returnContext.verdict === 'QUARANTINED') {
      return `Keep the mutation in review and walk to ${target}.`;
    }
    if (returnContext.verdict === 'REVERTED') {
      return `Reset the build at ${target} before the next gate.`;
    }

    if (careState === 'MEMORY_DRIFT') {
      return `Memory drift is rising. Stabilize the squad at ${target}.`;
    }
    if (careState === 'DOCTRINE_BLUR') {
      return `Doctrine blur is visible. Tighten the bundle at ${target}.`;
    }
    if (careState === 'SQUAD_FRICTION') {
      return `The squad is out of sync. Regroup at ${target}.`;
    }
    if (careState === 'CONFIDENCE_SHAKE') {
      return `Confidence is shaking. Rehearse first at ${target}.`;
    }

    return `Nightly distill still points the squad toward ${target}.`;
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
        ? `The squad returned from ${frameTitle} with a kept mutation and a clean finish.`
        : `The squad returned from ${frameTitle}; the trainer still kept the mutation after a rough field run.`;
    }

    if (returnContext.verdict === 'QUARANTINED') {
      return `The squad returned from ${frameTitle}; the field proof stays in review.`;
    }

    if (returnContext.verdict === 'REVERTED') {
      return `The squad returned from ${frameTitle}; the mutation was rejected after the field run.`;
    }

    if (returnContext.outcome === 'WIN') {
      return `The squad returned from ${frameTitle} with a clean finish.`;
    }

    if (returnContext.outcome === 'LOSS') {
      return `The squad retreated from ${frameTitle} and needs a steadier read.`;
    }

    return `The squad returned from ${frameTitle} for review.`;
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
  const runtimeFocusCheck = $derived(
    chooseRuntimeCheck(data.runtime.distill.suggestedNextChecks, leader?.careState ?? null),
  );
  const routeStops = $derived(
    ['camp', 'journal-board', 'lab-bench', 'archive-well', 'spar-gate', 'battle-gate']
      .map((nodeId) => fieldNodes.find((node) => node.id === nodeId))
      .filter((node): node is (typeof fieldNodes)[number] => Boolean(node)),
  );
  const runtimeCueText = $derived(cueTextForContext(effectiveReturnContext, leader?.careState ?? null, runtimeCueNode?.label ?? null));
  const runtimeCueVerb = $derived(cueVerbForContext(effectiveReturnContext, leader?.careState ?? null));
  const returnSummary = $derived(returnSummaryForContext(effectiveReturnContext));

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
      fieldStore.setFieldStatus('Archive opened. Inspect the squad and then head back toward the spar gate.', 'spar-gate');
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
      fieldStore.setFieldStatus('Journal reviewed. Pick the next gate and move the squad back onto the chart.', 'spar-gate');
    } else if (node.kind === 'LAB') {
      fieldStore.setFieldStatus('Bench tuning locked in. Head to the spar gate and test the rewrite.', 'spar-gate');
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
      runtimeGoal: data.runtime.distill.goal,
      runtimeFocusCheck,
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

<PageShell>
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

        <div class="field-overlay field-overlay--top" aria-hidden="true">
          <div class="field-route-card">
            <span class="field-route-card__kicker">Route</span>
            <strong>{activeHistoricalFrame?.title ?? runtimeCueNode?.label ?? objectiveNode?.label ?? 'Gate'}</strong>
            <div class="field-route-card__progress">
              {#each routeStops as node}
                <span
                  class:active={nearbyNode?.id === node.id}
                  class:objective={objectiveNode?.id === node.id}
                  class:runtimeCue={runtimeCueNode?.id === node.id}
                  class="field-route-card__stop"
                >
                  {node.label}
                </span>
              {/each}
            </div>
            <div class="field-route-card__party">
              {#each fallbackParty as agent}
                <div class:leader={leader?.id === agent.id} class="field-route-card__slot">
                  <PixelSprite agent={agent} frameIndex={0} size={24} alt={agent.name} />
                  <span>{roleMark(agent.role)}</span>
                </div>
              {/each}
            </div>
            <span>{returnSummary ?? (nearbyNode ? `Near ${nearbyNode.label}` : `Next ${runtimeCueNode?.label ?? objectiveNode?.label ?? 'gate'}`)}</span>
          </div>

          <div class="field-overlay__stack">
            {#if data.runtime.available}
              <div class="field-cue-card">
                <span class="field-cue-card__kicker">Next beacon</span>
                <strong>{runtimeCueNode?.label ?? objectiveNode?.label ?? 'Next gate'}</strong>
                <p>{runtimeCueText}</p>
                {#if runtimeFocusCheck}
                  <span class="field-cue-card__check">{runtimeFocusCheck}</span>
                {/if}
                {#if data.runtime.distill.goal}
                  <span class="field-cue-card__goal">{data.runtime.distill.goal}</span>
                {/if}
              </div>
            {/if}

            <div class="field-overlay__cluster field-overlay__cluster--controls">
              <span class="hud-key">WASD</span>
              <span class="hud-key">Shift</span>
              <span class="hud-key">E</span>
            </div>
          </div>
        </div>

        <div class="field-overlay field-overlay--bottom">
          <div class="field-actions">
            {#if nearbyNode}
              <button class="action-button field-actions__button" onclick={triggerInteract}>
                Enter {nearbyNode.label}
              </button>
            {:else}
              <span class="hud-pill hud-pill--ghost">Move to {runtimeCueNode?.label ?? objectiveNode?.label ?? 'gate'}</span>
            {/if}
          </div>
        </div>

        <div class="field-overlay field-overlay--center">
          {#if state.canInteract && nearbyNode}
            <div class="field-signal field-signal--active">
              <span class="field-signal__verb">Enter</span>
              <strong>{nearbyNode.label}</strong>
            </div>
          {:else}
            <div class="field-signal">
              <span class="field-signal__verb">Frame</span>
              <strong>{activeHistoricalFrame?.title ?? runtimeCueNode?.label ?? objectiveNode?.label ?? 'Battle Gate'}</strong>
            </div>
          {/if}
        </div>
      </div>
    </div>
  </section>
</PageShell>

<style>
  .field-layout {
    display: block;
  }

  .field-stage {
    width: 100%;
    margin: 0 auto;
    min-width: 0;
    position: relative;
    padding: clamp(10px, 1vw, 14px);
    background:
      linear-gradient(180deg, rgba(255, 250, 241, 0.86), rgba(239, 234, 221, 0.72));
    border-color: rgba(147, 140, 111, 0.18);
    box-shadow:
      inset 0 1px 0 rgba(255, 255, 255, 0.48),
      0 18px 34px rgba(88, 83, 59, 0.12);
  }

  .field-stage__viewport {
    position: relative;
    height: clamp(520px, 78vh, 860px);
  }

  .field-overlay {
    position: absolute;
    left: 18px;
    right: 18px;
    display: flex;
    justify-content: space-between;
    gap: 12px;
    pointer-events: none;
    z-index: 10;
  }

  .field-overlay--top {
    top: 18px;
    align-items: flex-start;
  }

  .field-overlay--bottom {
    bottom: 18px;
    align-items: flex-end;
  }

  .field-overlay--center {
    inset: auto 18px 88px auto;
    right: 18px;
    left: auto;
    justify-content: flex-end;
  }

  .field-overlay__cluster {
    display: grid;
    grid-auto-flow: column;
    gap: 8px;
    align-items: center;
  }

  .field-overlay__stack {
    display: grid;
    gap: 10px;
    justify-items: end;
    align-items: flex-start;
  }

  .field-route-card,
  .field-cue-card {
    min-width: 208px;
    max-width: min(320px, 46vw);
    padding: 11px 14px;
    border-radius: 20px;
    border: 1px solid rgba(150, 139, 102, 0.18);
    background:
      linear-gradient(180deg, rgba(255, 250, 239, 0.92), rgba(244, 235, 215, 0.84));
    backdrop-filter: blur(10px);
    display: grid;
    gap: 4px;
    color: rgba(58, 64, 43, 0.94);
    box-shadow: 0 10px 24px rgba(113, 102, 66, 0.14);
  }

  .field-route-card strong,
  .field-cue-card strong {
    font-size: 0.96rem;
    line-height: 1.2;
  }

  .field-route-card__progress {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-top: 2px;
  }

  .field-route-card__party {
    display: flex;
    gap: 8px;
    align-items: center;
    margin-top: 2px;
  }

  .field-route-card__slot {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 4px 7px 4px 5px;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.54);
    border: 1px solid rgba(176, 157, 109, 0.14);
  }

  .field-route-card__slot :global(img) {
    image-rendering: pixelated;
  }

  .field-route-card__slot span {
    min-width: 18px;
    height: 18px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 999px;
    background: rgba(245, 238, 217, 0.92);
    border: 1px solid rgba(180, 155, 93, 0.18);
    color: rgba(96, 82, 42, 0.9);
    font-size: 0.62rem;
    font-weight: 700;
    text-transform: uppercase;
  }

  .field-route-card__slot.leader span {
    color: rgba(255, 241, 206, 0.96);
    border-color: rgba(239, 218, 156, 0.32);
  }

  .field-route-card__stop {
    display: inline-flex;
    align-items: center;
    min-height: 22px;
    padding: 0 8px;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.54);
    border: 1px solid rgba(176, 157, 109, 0.16);
    color: rgba(93, 84, 53, 0.82);
    font-size: 0.64rem;
    font-weight: 700;
    letter-spacing: 0.04em;
  }

  .field-route-card__stop.objective {
    background: rgba(252, 235, 189, 0.86);
    border-color: rgba(202, 158, 78, 0.28);
    color: rgba(111, 80, 26, 0.92);
  }

  .field-route-card__stop.runtimeCue {
    background: rgba(233, 245, 224, 0.9);
    border-color: rgba(115, 164, 103, 0.22);
    color: rgba(55, 97, 52, 0.92);
  }

  .field-route-card__stop.active {
    box-shadow: 0 0 0 1px rgba(98, 155, 90, 0.12);
  }

  .field-route-card span:last-child {
    color: rgba(87, 97, 72, 0.82);
    font-size: 0.76rem;
  }

  .field-route-card__kicker,
  .field-cue-card__kicker {
    color: rgba(118, 120, 85, 0.78);
    font-size: 0.68rem;
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }

  .field-cue-card {
    min-width: min(280px, 40vw);
    border-color: rgba(120, 168, 118, 0.22);
    background:
      linear-gradient(180deg, rgba(240, 249, 236, 0.92), rgba(223, 238, 217, 0.86));
    gap: 6px;
  }

  .field-cue-card p {
    margin: 0;
    color: rgba(74, 92, 68, 0.88);
    font-size: 0.76rem;
    line-height: 1.45;
  }

  .field-cue-card__check,
  .field-cue-card__goal {
    font-size: 0.7rem;
    color: rgba(83, 111, 79, 0.82);
    line-height: 1.35;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    overflow: hidden;
    line-clamp: 2;
    -webkit-line-clamp: 2;
  }

  .field-cue-card__check {
    padding: 6px 10px;
    border-radius: 999px;
    border: 1px solid rgba(120, 168, 118, 0.2);
    background: rgba(255, 255, 255, 0.52);
    color: rgba(61, 94, 58, 0.92);
    display: inline-flex;
    width: fit-content;
    max-width: 100%;
  }

  .field-overlay__cluster--controls {
    justify-content: end;
  }

  .hud-pill,
  .hud-key {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-height: 34px;
    padding: 0 12px;
    border-radius: 999px;
    border: 1px solid rgba(160, 146, 109, 0.18);
    color: rgba(83, 83, 62, 0.92);
    background: rgba(255, 249, 239, 0.82);
    backdrop-filter: blur(10px);
    letter-spacing: 0.06em;
    text-transform: uppercase;
    font-size: 0.72rem;
    box-shadow: 0 8px 20px rgba(118, 104, 59, 0.12);
  }

  .hud-pill--ghost {
    opacity: 0.72;
  }

  .hud-key {
    min-width: 50px;
    font-weight: 700;
    color: rgba(220, 230, 225, 0.92);
  }

  .field-actions {
    display: flex;
    align-items: center;
    gap: 10px;
    pointer-events: auto;
  }

  .field-actions__button {
    min-width: 136px;
    min-height: 42px;
    border-radius: 999px;
    background: linear-gradient(180deg, rgba(75, 150, 111, 0.96), rgba(45, 106, 79, 0.96));
    box-shadow: 0 10px 24px rgba(49, 95, 72, 0.22);
  }

  .field-signal {
    min-width: 160px;
    padding: 12px 14px;
    border-radius: 18px;
    background: rgba(255, 249, 239, 0.88);
    border: 1px solid rgba(157, 143, 101, 0.16);
    color: rgba(77, 71, 49, 0.94);
    display: grid;
    gap: 2px;
    box-shadow: 0 10px 28px rgba(118, 102, 63, 0.14);
  }

  .field-signal--active {
    border-color: rgba(115, 167, 108, 0.28);
    background: rgba(234, 246, 228, 0.92);
  }

  .field-signal__verb {
    font-size: 0.68rem;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: rgba(119, 119, 87, 0.78);
  }

  .field-stage:focus-visible {
    outline: 2px solid rgba(89, 180, 144, 0.7);
    outline-offset: 2px;
  }

  @media (max-width: 900px) {
    .field-stage__viewport {
      height: clamp(480px, 72vh, 760px);
    }

    .field-overlay {
      left: 12px;
      right: 12px;
    }

    .field-overlay--top,
    .field-overlay--bottom {
      gap: 10px;
    }

    .field-overlay__stack {
      gap: 8px;
    }

    .field-overlay__cluster {
      grid-auto-flow: row;
      justify-items: start;
    }

    .field-route-card,
    .field-cue-card {
      max-width: 62vw;
    }

    .field-overlay__cluster--controls {
      display: none;
    }

    .field-signal {
      min-width: 132px;
      padding: 10px 12px;
    }
  }

  @media (max-width: 640px) {
    .field-stage {
      width: 100%;
      padding: 8px;
    }

    .field-stage__viewport {
      height: clamp(420px, 70vh, 620px);
    }

    .field-overlay--top {
      top: 12px;
      flex-direction: column;
      align-items: stretch;
    }

    .field-overlay--bottom {
      bottom: 12px;
      flex-direction: column;
      align-items: stretch;
    }

    .field-overlay--center {
      right: 12px;
      bottom: 78px;
    }

    .field-route-card,
    .field-cue-card {
      min-width: 0;
      max-width: none;
      width: 100%;
    }

    .field-overlay__stack {
      justify-items: stretch;
    }

    .field-actions {
      justify-content: flex-end;
    }
  }
</style>
