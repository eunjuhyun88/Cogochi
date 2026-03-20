<script lang="ts">
  import { browser } from '$app/environment';
  import PageShell from '$components/shared/PageShell.svelte';
  import PixelSprite from '$components/shared/PixelSprite.svelte';
  import {
    agentFamilyLabels,
    careStateLabels,
    confidenceLabels,
    evalScenarios,
    growthStageLabels,
    indicatorPresetLabels,
    memoryBiasLabels,
    scriptPresetLabels,
    trainerSummarySeed,
  } from '$lib/data/seed';
  import { labStore } from '$lib/stores/labStore';
  import { hubStore, type CareMode, type HubPanel, type StylePreview } from '$lib/stores/hubStore';
  import { rosterStore } from '$lib/stores/rosterStore';
  import type { CareState, MutationGene, OwnedAgent } from '$lib/types';

  const trainer = trainerSummarySeed;

  type HubActionSource = 'panel' | 'dock';
  type HubCareResult = NonNullable<ReturnType<typeof rosterStore.applyCareAction>>;
  type HubActionReceiptTone = 'resolved' | 'partial' | 'steady';
  type HubActionReceipt = {
    source: HubActionSource;
    label: string;
    title: string;
    detail: string;
    tone: HubActionReceiptTone;
  };

  type FeedCard = {
    label: string;
    title: string;
    note: string;
  };

  type LoopBeat = {
    label: string;
    title: string;
    note: string;
  };

  function buildRouteHref(pathname: '/field' | '/battle' | '/proof' | '/lab', entries: Array<[string, string | null | undefined]>): string {
    const params = new URLSearchParams();
    for (const [key, value] of entries) {
      if (value) {
        params.set(key, value);
      }
    }
    const query = params.toString();
    return query ? `${pathname}?${query}` : pathname;
  }

  let careReceipt = $state<HubActionReceipt | null>(null);

  function instinctWeight(agent: OwnedAgent, gene: MutationGene, fallback = agent.trustWeight): number {
    return agent.trustedInstincts.find((instinct) => instinct.gene === gene)?.weight ?? fallback;
  }

  function specializationScore(agent: OwnedAgent): number {
    const stageBase = {
      FRESH: 34,
      TUNED: 56,
      SPECIALIZED: 78,
      SIGNATURE: 92,
    }[agent.growthStage];

    return Math.min(
      100,
      stageBase +
        agent.provenFrames.length * 3 +
        agent.mutations.filter((mutation) => mutation.decision === 'ACCEPTED').length * 4,
    );
  }

  function formTone(careState: CareState): 'clear' | 'watch' | 'alert' {
    switch (careState) {
      case 'CLEAR':
        return 'clear';
      case 'MEMORY_DRIFT':
      case 'DOCTRINE_BLUR':
        return 'watch';
      case 'CONFIDENCE_SHAKE':
      case 'SQUAD_FRICTION':
        return 'alert';
    }
  }

  function formSummary(careState: CareState): string {
    switch (careState) {
      case 'CLEAR':
        return 'Steady and deploy-ready.';
      case 'MEMORY_DRIFT':
        return 'Useful lessons are getting buried by noise.';
      case 'DOCTRINE_BLUR':
        return 'The rule set needs one cleaner sentence.';
      case 'CONFIDENCE_SHAKE':
        return 'The last miss left the companion hesitant.';
      case 'SQUAD_FRICTION':
        return 'Role fit and travel rhythm need a reset.';
    }
  }

  function panelSummary(panel: HubPanel, agent: OwnedAgent): { title: string; description: string } {
    switch (panel) {
      case 'customize':
        return {
          title: 'Load the shell before departure',
          description: `${agent.name}'s body should telegraph the next route before the chart ever starts moving again.`,
        };
      case 'care':
        return {
          title: 'Settle the room before the next route',
          description: 'Care needs to feel like one meaningful correction, not a maintenance spreadsheet.',
        };
      case 'growth':
        return {
          title: 'Push the specialization pressure',
          description: 'Growth should read like sharper market instinct, not a detached XP ladder.',
        };
      case 'memory':
        return {
          title: 'Pin the one lesson that matters',
          description: 'Only the memory that changes the next call deserves front-row space.',
        };
      case 'doctrine':
        return {
          title: 'Write the next rule with consequence in mind',
          description: 'Doctrine only matters when it clearly changes how the next encounter will be played.',
        };
    }
  }

  const featuredAgent = $derived.by(() => {
    const roster = $rosterStore;
    return roster.agents.find((agent) => agent.id === roster.selectedAgentId) ?? roster.agents[0] ?? null;
  });

  const hubState = $derived($hubStore);
  const labState = $derived($labStore);
  const activePanel = $derived(hubState.activePanel);
  const stylePreview = $derived(hubState.stylePreview);
  const careMode = $derived(hubState.careMode);

  const companions = $derived.by(() => {
    if (!featuredAgent) {
      return [];
    }
    return $rosterStore.agents.filter((agent) => agent.id !== featuredAgent.id).slice(0, 3);
  });

  const activeScenario = $derived(evalScenarios.find((scenario) => scenario.id === labState.activeScenarioId) ?? evalScenarios[0] ?? null);
  const activeDoctrineSessionId = $derived.by(() => (featuredAgent ? labState.activeDoctrineSessionIds[featuredAgent.id] ?? null : null));
  const activeDoctrineSession = $derived.by(() =>
    featuredAgent && activeDoctrineSessionId ? labStore.getDoctrineSession(featuredAgent.id, activeDoctrineSessionId) : null,
  );
  const activeProofPackId = $derived(activeDoctrineSession?.recommendedProofPackId ?? null);

  const featuredStats = $derived.by(() => {
    if (!featuredAgent) {
      return [];
    }

    return [
      {
        label: 'Bond',
        value: featuredAgent.bond,
        helper: 'Trainer sync',
        tone: 'bond',
      },
      {
        label: 'Memory',
        value: instinctWeight(featuredAgent, 'MEMORY'),
        helper: 'Recall quality',
        tone: 'memory',
      },
      {
        label: 'Risk',
        value: instinctWeight(featuredAgent, 'RISK'),
        helper: 'Discipline',
        tone: 'risk',
      },
      {
        label: 'Spec',
        value: specializationScore(featuredAgent),
        helper: 'Role sharpness',
        tone: 'specialization',
      },
    ] as const;
  });

  const acceptedMutations = $derived.by(() => {
    if (!featuredAgent) {
      return [];
    }
    return featuredAgent.mutations.filter((mutation) => mutation.decision === 'ACCEPTED').slice(0, 2);
  });

  const memoryHighlights = $derived.by(() => {
    if (!featuredAgent) {
      return [];
    }
    return featuredAgent.memoryBank.slice(0, 2);
  });

  const currentPanelSummary = $derived.by(() => (featuredAgent ? panelSummary(activePanel, featuredAgent) : null));

  const fieldHref = $derived.by(() =>
    featuredAgent
      ? buildRouteHref('/field', [
          ['agent', featuredAgent.id],
          ['session', activeDoctrineSessionId],
          ['pack', activeProofPackId],
        ])
      : '/field',
  );
  const battleHref = $derived.by(() =>
    featuredAgent
      ? buildRouteHref('/battle', [
          ['agent', featuredAgent.id],
          ['session', activeDoctrineSessionId],
          ['pack', activeProofPackId],
        ])
      : '/battle',
  );
  const proofHref = $derived.by(() =>
    featuredAgent
      ? buildRouteHref('/proof', [
          ['agent', featuredAgent.id],
          ['session', activeDoctrineSessionId],
          ['pack', activeProofPackId],
        ])
      : '/proof',
  );
  const labHref = $derived.by(() =>
    featuredAgent
      ? buildRouteHref('/lab', [
          ['agent', featuredAgent.id],
          ['session', activeDoctrineSessionId],
          ['pack', activeProofPackId],
        ])
      : '/lab',
  );
  const passportHref = $derived(featuredAgent ? `/passport/${featuredAgent.id}` : '/passport');
  const agentHref = $derived(featuredAgent ? `/agent/${featuredAgent.id}` : '/roster');
  const resumeWaypoint = $derived.by(() => {
    if (!featuredAgent) {
      return 'Trail pending';
    }
    if (featuredAgent.careState === 'DOCTRINE_BLUR') {
      return activeDoctrineSession ? `Lab bench armed with ${activeDoctrineSession.title}` : 'Lab bench first';
    }
    if (featuredAgent.careState === 'MEMORY_DRIFT') {
      return 'Archive clue on return';
    }
    if (featuredAgent.careState === 'CONFIDENCE_SHAKE') {
      return 'Spar gate first';
    }
    if (featuredAgent.careState === 'SQUAD_FRICTION') {
      return 'Camp regroup before proof';
    }
    return activeScenario ? `${activeScenario.symbol} · ${activeScenario.timeframe}` : 'Field route live';
  });
  const resumeLoopTitle = $derived.by(() => {
    if (!featuredAgent) {
      return 'Resume the next route.';
    }
    if (featuredAgent.careState === 'DOCTRINE_BLUR') {
      return 'Carry one cleaner doctrine line back into the trail.';
    }
    if (featuredAgent.careState === 'MEMORY_DRIFT') {
      return 'Re-enter the field with one lesson pinned.';
    }
    if (featuredAgent.careState === 'CONFIDENCE_SHAKE') {
      return 'Take the safer gate and rebuild the read.';
    }
    if (featuredAgent.careState === 'SQUAD_FRICTION') {
      return 'Regroup the squad before the next hard proof.';
    }
    return `${featuredAgent.name} is ready to resume ${activeScenario?.label ?? 'the night route'}.`;
  });
  const resumeLoopDetail = $derived.by(() => {
    if (!featuredAgent) {
      return 'Choose the next route and leave the room with one clear intent.';
    }
    const doctrineLead = activeDoctrineSession ? `Bound doctrine: ${activeDoctrineSession.title}. ` : '';
    return `${doctrineLead}${featuredAgent.nextCareAction}`;
  });
  const resumePrimaryLabel = $derived.by(() => {
    if (!featuredAgent) {
      return 'Enter field';
    }
    if (featuredAgent.careState === 'CONFIDENCE_SHAKE') {
      return 'Take spar route';
    }
    return 'Resume trail';
  });
  const loopBeats = $derived.by<LoopBeat[]>(() => {
    if (!featuredAgent) {
      return [];
    }
    return [
      {
        label: 'Read',
        title: activeScenario?.structureHint ?? 'Read the current shelf first.',
        note: activeScenario ? `${activeScenario.symbol} · ${activeScenario.timeframe}` : 'Route pending',
      },
      {
        label: 'Call',
        title: activeScenario?.targetAction ?? 'HOLD',
        note: activeScenario?.objective ?? 'Answer with one clean LONG, SHORT, HOLD, or RUN call.',
      },
      {
        label: 'Return',
        title: featuredAgent.careState === 'CLEAR' ? 'Bring one lesson back to camp.' : careStateLabels[featuredAgent.careState],
        note: featuredAgent.nextCareAction,
      },
    ];
  });

  const stylePreviewCopy = {
    field: {
      label: 'Field kit',
      note: 'Travel-ready harness and practical carry cues for deploy mode.',
    },
    archive: {
      label: 'Archive look',
      note: 'Memory-heavy read with note tags and calmer room energy.',
    },
    proof: {
      label: 'Proof glow',
      note: 'A ceremonial posture for accepted mutations and validation moments.',
    },
  } as const;

  const careModeCopy = {
    gift: {
      label: 'Gift',
      note: 'Pushes the mood toward warmth and makes the next bond beat easier to read.',
    },
    rest: {
      label: 'Rest',
      note: 'Resets tension after a bad run and steadies the next deploy posture.',
    },
    note: {
      label: 'Lesson note',
      note: 'Pins the latest lesson in place before it drifts into noise.',
    },
  } as const;

  const activePanelFeed = $derived.by<FeedCard[]>(() => {
    if (!featuredAgent) {
      return [];
    }

    switch (activePanel) {
      case 'customize':
        return [
          {
            label: 'Visible unlock',
            title: acceptedMutations[0]?.title ?? 'Starter shell',
            note:
              acceptedMutations[0]?.visibleEffect ??
              'One accepted mutation still needs to land before the body changes harder.',
          },
          {
            label: 'Saved shell',
            title: stylePreviewCopy[featuredAgent.homeStyle].label,
            note: stylePreviewCopy[featuredAgent.homeStyle].note,
          },
        ];
      case 'care':
        return [
          {
            label: 'Room state',
            title: careStateLabels[featuredAgent.careState],
            note: featuredAgent.nextCareAction,
          },
          {
            label: 'Last room result',
            title: featuredAgent.recentCareSummary,
            note: formSummary(featuredAgent.careState),
          },
        ];
      case 'growth':
        return [
          {
            label: 'Growth stage',
            title: `${growthStageLabels[featuredAgent.growthStage]} / Lv ${featuredAgent.level}`,
            note: `${featuredAgent.provenFrames.length} proven frames are already shaping the role.`,
          },
          {
            label: 'Next target',
            title: featuredAgent.weakLink,
            note: 'Attack the weak instinct instead of padding a safe metric.',
          },
        ];
      case 'memory':
        return [
          {
            label: 'Memory bias',
            title: memoryBiasLabels[featuredAgent.loadout.memoryBias],
            note: `${featuredAgent.memoryBank.length} cards are close enough to change the next read.`,
          },
          {
            label: 'Latest lesson',
            title: featuredAgent.recentLesson,
            note: memoryHighlights[0]?.note ?? 'A better lesson still needs to be pinned.',
          },
        ];
      case 'doctrine':
        return [
          {
            label: 'Indicator',
            title: indicatorPresetLabels[featuredAgent.loadout.indicatorPresetId],
            note: scriptPresetLabels[featuredAgent.loadout.scriptPresetId],
          },
          {
            label: 'Confidence',
            title: confidenceLabels[featuredAgent.loadout.confidenceStyle],
            note: featuredAgent.loadout.doctrineNote,
          },
        ];
    }
  });

  function buildCareReceipt(result: HubCareResult, source: HubActionSource): HubActionReceipt {
    const label = careModeCopy[result.careMode].label;

    if (result.resolved) {
      return {
        source,
        label,
        title: `${label} cleared ${careStateLabels[result.previousAgent.careState]}.`,
        detail: result.nextAgent.recentCareSummary,
        tone: 'resolved',
      };
    }

    if (result.targetedAction) {
      return {
        source,
        label,
        title: `${label} moved the form forward, but one more proof still matters.`,
        detail: result.nextAgent.recentCareSummary,
        tone: 'partial',
      };
    }

    return {
      source,
      label,
      title: `${label} was a light home pass before the next deploy.`,
      detail: result.nextAgent.recentCareSummary,
      tone: 'steady',
    };
  }

  function applyStyleSelection(nextStyle: StylePreview) {
    if (!featuredAgent) {
      return;
    }

    hubStore.setStylePreview(nextStyle);
    rosterStore.setAgentHomeStyle(featuredAgent.id, nextStyle);
  }

  function selectCareMode(nextCareMode: CareMode) {
    hubStore.setCareMode(nextCareMode);
  }

  function applyCareAction(nextCareMode: CareMode = careMode, source: HubActionSource = 'panel') {
    if (!featuredAgent) {
      return;
    }

    hubStore.setCareMode(nextCareMode);
    const result = rosterStore.applyCareAction(featuredAgent.id, nextCareMode);
    if (!result) {
      return;
    }

    careReceipt = buildCareReceipt(result, source);
  }

  $effect(() => {
    if (!browser || !featuredAgent) {
      return;
    }

    hubStore.syncAgentSelections(featuredAgent.homeStyle, featuredAgent.lastCareMode);
  });

  $effect(() => {
    if (!browser || !featuredAgent) {
      return;
    }

    window.__cogochi_text_state = () => ({
      mode: 'hub',
      featuredAgent: featuredAgent.name,
      activePanel,
      stylePreview,
      careMode,
      homeStyle: featuredAgent.homeStyle,
      lastCareMode: featuredAgent.lastCareMode,
      careState: featuredAgent.careState,
      recentCareSummary: featuredAgent.recentCareSummary,
      nextCareAction: featuredAgent.nextCareAction,
      careReceipt: careReceipt
        ? {
            label: careReceipt.label,
            tone: careReceipt.tone,
            source: careReceipt.source,
          }
        : null,
      activeScenario: activeScenario?.id ?? null,
      recentLesson: featuredAgent.recentLesson,
      weakLink: featuredAgent.weakLink,
      keepsakes: featuredAgent.keepsakes,
      companions: companions.map((companion) => companion.name),
      activeDoctrineSessionId,
      fieldHref,
      battleHref,
      labHref,
      resumeWaypoint,
    });

    return () => {
      delete window.__cogochi_text_state;
    };
  });
</script>

<PageShell>
  <div class="hub-home">
    {#if featuredAgent}
      <section class="hub-home__grid">
        <article class="hub-stage panel">
          <div class="hub-stage__header">
            <div class="hub-stage__title-block">
              <p class="section-kicker">Judgment RPG</p>
              <h1>Read the shelf. Make one call.</h1>
              <p>Cogochi turns chart analysis into a field loop: read the structure, answer with LONG, SHORT, HOLD, or RUN, then return with one consequence that changes the next route.</p>
            </div>

            <div class="hub-stage__chips">
              <span class="chip">{trainer.trainerName}</span>
              <span class="chip">{trainer.streakLabel}</span>
              <span class="chip">{trainer.focus}</span>
            </div>
          </div>

          <div class="hub-stage__mission">
            <div class="hub-stage__mission-copy">
              <small>Resume Loop</small>
              <strong>{resumeLoopTitle}</strong>
              <p>{resumeLoopDetail}</p>
            </div>

            <div class="hub-stage__mission-meta">
              <span class="chip">{featuredAgent.name}</span>
              <span class="chip chip--quiet">{resumeWaypoint}</span>
              {#if activeDoctrineSession}
                <span class="chip chip--quiet">{activeDoctrineSession.title}</span>
              {/if}
            </div>

            <div class="hub-stage__mission-actions">
              <a class="link-button" href={fieldHref}>{resumePrimaryLabel}</a>
              <a class="link-button secondary" href={battleHref}>Jump to battle</a>
              <a class="link-button ghost" href={labHref}>Tune lab</a>
            </div>

            <div class="hub-stage__loop">
              {#each loopBeats as beat}
                <article class="hub-stage__loop-card">
                  <small>{beat.label}</small>
                  <strong>{beat.title}</strong>
                  <p>{beat.note}</p>
                </article>
              {/each}
            </div>
          </div>

          <div class={`hub-stage__screen hub-stage__screen--${stylePreview}`}>
            <div class="hub-stage__noise"></div>
            <svg class="hub-stage__chart" viewBox="0 0 960 420" preserveAspectRatio="none" aria-hidden="true">
              <defs>
                <linearGradient id="hubChartFill" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stop-color="rgba(230, 166, 90, 0.32)"></stop>
                  <stop offset="100%" stop-color="rgba(230, 166, 90, 0)"></stop>
                </linearGradient>
                <linearGradient id="hubChartStroke" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stop-color="#6ab8a0"></stop>
                  <stop offset="70%" stop-color="#f0bf7b"></stop>
                  <stop offset="100%" stop-color="#f27d55"></stop>
                </linearGradient>
              </defs>
              <g class="hub-stage__gridlines">
                <line x1="0" y1="90" x2="960" y2="90"></line>
                <line x1="0" y1="175" x2="960" y2="175"></line>
                <line x1="0" y1="260" x2="960" y2="260"></line>
                <line x1="0" y1="345" x2="960" y2="345"></line>
              </g>
              <path
                class="hub-stage__area"
                d="M 36 302 L 128 286 L 196 292 L 254 236 L 338 248 L 418 226 L 500 160 L 600 182 L 694 146 L 776 170 L 844 114 L 924 134 L 924 420 L 36 420 Z"
              ></path>
              <path
                class="hub-stage__line"
                d="M 36 302 L 128 286 L 196 292 L 254 236 L 338 248 L 418 226 L 500 160 L 600 182 L 694 146 L 776 170 L 844 114 L 924 134"
              ></path>
              <line class="hub-stage__support-line" x1="0" y1="272" x2="960" y2="272"></line>
              <line class="hub-stage__risk-line" x1="0" y1="336" x2="960" y2="336"></line>
            </svg>

            <div class="hub-stage__tag hub-stage__tag--support">
              <small>Support shelf</small>
              <strong>{activeScenario?.structureHint ?? 'Shelf still readable'}</strong>
            </div>

            <div class={`hub-stage__tag hub-stage__tag--form hub-stage__tag--${formTone(featuredAgent.careState)}`}>
              <small>Body read</small>
              <strong>{careStateLabels[featuredAgent.careState]}</strong>
            </div>

            <div class="hub-stage__bark">
              <small>{featuredAgent.name}</small>
              <strong>{activeScenario?.structureHint ?? featuredAgent.nextCareAction}</strong>
            </div>

            <div class="hub-stage__hero">
              <div class="hub-stage__hero-ring hub-stage__hero-ring--outer"></div>
              <div class="hub-stage__hero-ring hub-stage__hero-ring--inner"></div>
              <div class="hub-stage__hero-frame">
                <PixelSprite agent={featuredAgent} homeStyle={stylePreview} presentation="hub" size={224} />
              </div>
              <div class="hub-stage__hero-label">
                <small>Lead companion</small>
                <strong>{featuredAgent.name}</strong>
                <span>{featuredAgent.recentTrainingFocus}</span>
              </div>
            </div>
          </div>

          <div class="hub-stage__dock">
            <button class:active={activePanel === 'customize'} type="button" onclick={() => hubStore.setActivePanel('customize')}>
              <span>Gear</span>
              <small>shell</small>
            </button>
            <button class:active={activePanel === 'care'} type="button" onclick={() => hubStore.setActivePanel('care')}>
              <span>Camp</span>
              <small>recover</small>
            </button>
            <button class:active={activePanel === 'growth'} type="button" onclick={() => hubStore.setActivePanel('growth')}>
              <span>Edge</span>
              <small>sharpen</small>
            </button>
            <button class:active={activePanel === 'memory'} type="button" onclick={() => hubStore.setActivePanel('memory')}>
              <span>Recall</span>
              <small>pin clue</small>
            </button>
            <button class:active={activePanel === 'doctrine'} type="button" onclick={() => hubStore.setActivePanel('doctrine')}>
              <span>Rule</span>
              <small>route line</small>
            </button>
          </div>

          <div class="hub-stage__footer">
            <div class="hub-stage__metrics">
              {#each featuredStats as stat}
                <div class="hub-stage__metric">
                  <small>{stat.label}</small>
                  <strong>{stat.value}</strong>
                  <span>{stat.helper}</span>
                </div>
              {/each}
            </div>

            <div class="hub-stage__actions">
              <a class="link-button secondary" href={proofHref}>Open proof</a>
              <a class="link-button ghost" href={passportHref}>Passport</a>
              <a class="link-button ghost" href={agentHref}>Companion file</a>
            </div>
          </div>
        </article>

        <aside class="hub-sidebar">
          <section class="hub-card panel">
            <div class="hub-card__header">
              <p class="section-kicker">Judgment Loop</p>
              <h2>Read one shelf. Make one call.</h2>
              <p>{activeScenario?.objective ?? 'The field should ask one clear question, then send the player back with consequence.'}</p>
            </div>

            {#if activeScenario}
              <div class="hub-card__chips">
                <span class="chip">{activeScenario.symbol}</span>
                <span class="chip">{activeScenario.timeframe}</span>
                <span class="chip">{activeScenario.targetAction}</span>
              </div>
            {/if}

            <div class={`hub-card__alert hub-card__alert--${formTone(featuredAgent.careState)}`}>
              <small>{careStateLabels[featuredAgent.careState]}</small>
              <strong>{featuredAgent.nextCareAction}</strong>
            </div>

            <div class="hub-card__list">
              <div>
                <small>Chart</small>
                <strong>{activeScenario ? `${activeScenario.symbol} · ${activeScenario.timeframe}` : 'Route pending'}</strong>
              </div>
              <div>
                <small>Weak link</small>
                <strong>{featuredAgent.weakLink}</strong>
              </div>
              <div>
                <small>Return</small>
                <strong>{featuredAgent.careState === 'CLEAR' ? 'Camp then field' : careStateLabels[featuredAgent.careState]}</strong>
              </div>
            </div>

            <div class="hub-card__bench">
              <small>Quick switch</small>
              <div class="hub-bench">
                {#each [featuredAgent, ...companions] as agent}
                  <button
                    class:active={agent.id === featuredAgent.id}
                    class="hub-bench__card"
                    onclick={() => rosterStore.selectAgent(agent.id)}
                    type="button"
                  >
                    <PixelSprite agent={agent} homeStyle={agent.homeStyle} presentation="hub" size={52} />
                    <span>{agent.name}</span>
                  </button>
                {/each}
              </div>
            </div>
          </section>

          <section class="hub-card panel">
            <div class="hub-card__header">
              <p class="section-kicker">Camp Prep</p>
              <h2>{currentPanelSummary?.title}</h2>
              <p>{currentPanelSummary?.description}</p>
            </div>

            <div class="hub-feed">
              {#each activePanelFeed as item}
                <div class="hub-feed__card">
                  <small>{item.label}</small>
                  <strong>{item.title}</strong>
                  <p>{item.note}</p>
                </div>
              {/each}
            </div>

            {#if activePanel === 'customize'}
              <div class="hub-choice-row">
                {#each Object.entries(stylePreviewCopy) as [id, option]}
                  <button class:selected={stylePreview === id} type="button" onclick={() => applyStyleSelection(id as StylePreview)}>
                    {option.label}
                  </button>
                {/each}
              </div>
              <div class="hub-inline-actions">
                <a class="link-button secondary" href={passportHref}>Open passport</a>
                <a class="link-button ghost" href={agentHref}>Companion file</a>
              </div>
            {:else if activePanel === 'care'}
              <div class="hub-choice-row">
                {#each Object.entries(careModeCopy) as [id, option]}
                  <button class:selected={careMode === id} type="button" onclick={() => selectCareMode(id as CareMode)}>
                    {option.label}
                  </button>
                {/each}
              </div>
              <div class="hub-inline-actions">
                <button class="link-button secondary button-link" type="button" onclick={() => applyCareAction()}>
                  Apply {careModeCopy[careMode].label}
                </button>
                <button class="link-button ghost button-link" type="button" onclick={() => applyCareAction('note', 'dock')}>
                  Quick pin
                </button>
              </div>
            {:else if activePanel === 'growth'}
              <div class="hub-inline-actions">
                <a class="link-button" href={proofHref}>Run proof</a>
                <a class="link-button secondary" href={battleHref}>Open battle</a>
              </div>
            {:else if activePanel === 'memory'}
              <div class="hub-inline-actions">
                <a class="link-button secondary" href={labHref}>Curate in lab</a>
                <a class="link-button ghost" href={agentHref}>Full memory bank</a>
              </div>
            {:else}
              <div class="hub-card__chips">
                <span class="chip">{indicatorPresetLabels[featuredAgent.loadout.indicatorPresetId]}</span>
                <span class="chip">{scriptPresetLabels[featuredAgent.loadout.scriptPresetId]}</span>
                <span class="chip">{memoryBiasLabels[featuredAgent.loadout.memoryBias]}</span>
                <span class="chip">{confidenceLabels[featuredAgent.loadout.confidenceStyle]}</span>
              </div>
              <div class="hub-inline-actions">
                <a class="link-button secondary" href={labHref}>Mutation bench</a>
                <a class="link-button ghost" href={proofHref}>Bind to proof</a>
              </div>
            {/if}

            <div class={`hub-receipt ${careReceipt ? `hub-receipt--${careReceipt.tone}` : ''}`}>
              {#if careReceipt}
                <small>{careReceipt.source === 'dock' ? 'Quick action' : 'Care action'}</small>
                <strong>{careReceipt.title}</strong>
                <p>{careReceipt.detail}</p>
              {:else}
                <small>Prep note</small>
                <strong>Keep the room edits short and legible.</strong>
                <p>Only one correction should compete with the next route at a time.</p>
              {/if}
            </div>
          </section>
        </aside>
      </section>
    {:else}
      <article class="hub-empty panel">
        <p class="section-kicker">Judgment RPG</p>
        <h1>No featured agent yet</h1>
        <p>Open the roster, pick one companion, then come back here to choose the next route.</p>
        <a class="link-button" href="/roster">Open roster</a>
      </article>
    {/if}
  </div>
</PageShell>

<style>
  .hub-home {
    --hub-ink: #edf2ed;
    --hub-soft: rgba(208, 222, 216, 0.7);
    --hub-panel: rgba(12, 17, 20, 0.9);
    --hub-panel-strong: rgba(16, 23, 28, 0.96);
    --hub-panel-soft: rgba(26, 36, 42, 0.9);
    --hub-border: rgba(119, 146, 140, 0.16);
    --hub-border-strong: rgba(209, 149, 82, 0.26);
    --hub-gold: #e4aa68;
    --hub-amber: #f0c27d;
    --hub-green: #68c0a1;
    --hub-red: #dd7b66;
    --hub-shadow: 0 24px 48px rgba(4, 7, 8, 0.32);
    display: grid;
    gap: 20px;
    color: var(--hub-ink);
  }

  .hub-home::before {
    content: '';
    position: fixed;
    inset: 0;
    z-index: -2;
    background:
      radial-gradient(circle at 14% 12%, rgba(46, 83, 78, 0.34), transparent 24%),
      radial-gradient(circle at 84% 18%, rgba(199, 128, 62, 0.18), transparent 22%),
      linear-gradient(180deg, #06080a 0%, #0d1318 42%, #141d23 100%);
  }

  .hub-home :global(.panel) {
    position: relative;
    overflow: hidden;
    border-radius: 28px;
    border: 1px solid var(--hub-border);
    background:
      linear-gradient(180deg, rgba(18, 25, 30, 0.96), rgba(11, 16, 20, 0.94));
    box-shadow:
      var(--hub-shadow),
      inset 0 1px 0 rgba(255, 255, 255, 0.04);
  }

  .hub-home h1,
  .hub-home h2 {
    margin: 0;
    font-family: 'Iowan Old Style', 'Palatino Linotype', 'Book Antiqua', serif;
    letter-spacing: -0.03em;
  }

  .hub-home p,
  .hub-home strong {
    margin: 0;
  }

  .hub-home .section-kicker,
  .hub-home small {
    letter-spacing: 0.12em;
    text-transform: uppercase;
    font-size: 0.68rem;
    color: rgba(192, 206, 201, 0.64);
  }

  .hub-home .chip {
    padding: 7px 11px;
    border-radius: 999px;
    border: 1px solid rgba(128, 149, 144, 0.14);
    background: rgba(255, 255, 255, 0.05);
    color: rgba(238, 242, 236, 0.84);
  }

  .hub-home .link-button,
  .hub-home .button-link {
    min-height: 42px;
    border-radius: 14px;
    border: 1px solid transparent;
    box-shadow: none;
  }

  .hub-home .link-button {
    background: linear-gradient(180deg, #efb469, #c98445);
    color: #111418;
  }

  .hub-home .link-button.secondary {
    background: rgba(255, 255, 255, 0.07);
    color: rgba(239, 242, 235, 0.92);
    border-color: rgba(122, 143, 138, 0.16);
  }

  .hub-home .link-button.ghost {
    background: transparent;
    color: rgba(208, 219, 214, 0.76);
    border-color: rgba(122, 143, 138, 0.14);
  }

  .button-link {
    appearance: none;
  }

  .hub-home__grid {
    display: grid;
    grid-template-columns: minmax(0, 1.3fr) 320px;
    gap: 18px;
    align-items: start;
  }

  .hub-stage {
    padding: 24px;
    display: grid;
    gap: 18px;
  }

  .hub-stage__header {
    display: grid;
    gap: 12px;
  }

  .hub-stage__mission {
    display: grid;
    grid-template-columns: minmax(0, 1.5fr) auto;
    gap: 14px;
    align-items: center;
    padding: 18px;
    border-radius: 24px;
    border: 1px solid rgba(120, 146, 140, 0.14);
    background:
      linear-gradient(180deg, rgba(227, 168, 93, 0.1), rgba(98, 163, 141, 0.06)),
      rgba(255, 255, 255, 0.03);
    box-shadow:
      inset 0 1px 0 rgba(255, 255, 255, 0.04),
      0 18px 30px rgba(0, 0, 0, 0.14);
  }

  .hub-stage__mission-copy {
    display: grid;
    gap: 6px;
  }

  .hub-stage__mission-copy strong {
    font-size: 1.08rem;
  }

  .hub-stage__mission-copy p {
    margin: 0;
    max-width: 62ch;
    color: rgba(202, 216, 210, 0.74);
    line-height: 1.5;
  }

  .hub-stage__mission-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .hub-stage__mission-actions {
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-end;
    gap: 10px;
  }

  .hub-stage__loop {
    grid-column: 1 / -1;
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 10px;
  }

  .hub-stage__loop-card {
    display: grid;
    gap: 6px;
    padding: 14px 16px;
    border-radius: 18px;
    border: 1px solid rgba(123, 148, 141, 0.12);
    background:
      linear-gradient(180deg, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.02)),
      rgba(11, 15, 19, 0.38);
    box-shadow:
      inset 0 1px 0 rgba(255, 255, 255, 0.04),
      0 12px 20px rgba(0, 0, 0, 0.12);
  }

  .hub-stage__loop-card small {
    color: rgba(221, 230, 225, 0.56);
    font-size: 0.62rem;
    letter-spacing: 0.14em;
    text-transform: uppercase;
  }

  .hub-stage__loop-card strong {
    color: rgba(247, 241, 225, 0.96);
    font-size: 0.92rem;
    line-height: 1.25;
  }

  .hub-stage__loop-card p {
    margin: 0;
    color: rgba(203, 216, 211, 0.72);
    font-size: 0.8rem;
    line-height: 1.45;
  }

  .hub-stage__title-block {
    display: grid;
    gap: 10px;
  }

  .hub-stage__title-block h1 {
    font-size: clamp(2rem, 4vw, 3.35rem);
    line-height: 0.92;
    max-width: 12ch;
  }

  .hub-stage__title-block > p {
    max-width: 60ch;
    color: rgba(208, 219, 214, 0.74);
    line-height: 1.6;
  }

  .hub-stage__chips {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }

  .hub-stage__screen {
    position: relative;
    min-height: 500px;
    border-radius: 26px;
    overflow: hidden;
    border: 1px solid rgba(124, 145, 140, 0.16);
    background:
      linear-gradient(180deg, rgba(10, 15, 18, 0.95), rgba(17, 24, 30, 0.98)),
      linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px),
      linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px);
    box-shadow:
      inset 0 1px 0 rgba(255, 255, 255, 0.03),
      0 22px 44px rgba(0, 0, 0, 0.24);
  }

  .hub-stage__screen--field {
    background:
      radial-gradient(circle at 20% 18%, rgba(87, 154, 136, 0.16), transparent 24%),
      linear-gradient(180deg, rgba(10, 15, 18, 0.95), rgba(17, 24, 30, 0.98));
  }

  .hub-stage__screen--archive {
    background:
      radial-gradient(circle at 70% 18%, rgba(161, 126, 85, 0.16), transparent 26%),
      linear-gradient(180deg, rgba(11, 15, 18, 0.95), rgba(20, 24, 28, 0.98));
  }

  .hub-stage__screen--proof {
    background:
      radial-gradient(circle at 50% 12%, rgba(206, 138, 73, 0.18), transparent 24%),
      linear-gradient(180deg, rgba(12, 15, 20, 0.95), rgba(23, 24, 30, 0.98));
  }

  .hub-stage__noise {
    position: absolute;
    inset: 0;
    background:
      linear-gradient(rgba(255, 255, 255, 0.04) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255, 255, 255, 0.04) 1px, transparent 1px);
    background-size: 52px 52px;
    opacity: 0.32;
    pointer-events: none;
  }

  .hub-stage__chart {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
  }

  .hub-stage__gridlines line {
    stroke: rgba(224, 234, 228, 0.08);
    stroke-width: 1;
  }

  .hub-stage__area {
    fill: url(#hubChartFill);
  }

  .hub-stage__line {
    fill: none;
    stroke: url(#hubChartStroke);
    stroke-width: 4;
    stroke-linecap: round;
    stroke-linejoin: round;
    filter: drop-shadow(0 8px 18px rgba(230, 160, 88, 0.16));
  }

  .hub-stage__support-line,
  .hub-stage__risk-line {
    stroke-width: 2;
    stroke-dasharray: 8 10;
  }

  .hub-stage__support-line {
    stroke: rgba(105, 197, 165, 0.56);
  }

  .hub-stage__risk-line {
    stroke: rgba(221, 123, 102, 0.42);
  }

  .hub-stage__tag,
  .hub-stage__bark,
  .hub-stage__hero {
    position: absolute;
    z-index: 1;
  }

  .hub-stage__tag,
  .hub-stage__bark {
    border-radius: 18px;
    border: 1px solid rgba(126, 147, 141, 0.16);
    background: rgba(13, 18, 22, 0.82);
    backdrop-filter: blur(10px);
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.18);
  }

  .hub-stage__tag {
    padding: 10px 12px;
    display: grid;
    gap: 4px;
    min-width: 150px;
  }

  .hub-stage__tag strong {
    font-size: 0.88rem;
  }

  .hub-stage__tag--support {
    top: 20px;
    left: 20px;
  }

  .hub-stage__tag--form {
    right: 20px;
    top: 20px;
  }

  .hub-stage__tag--clear {
    border-color: rgba(98, 194, 160, 0.24);
  }

  .hub-stage__tag--watch {
    border-color: rgba(233, 180, 102, 0.24);
  }

  .hub-stage__tag--alert {
    border-color: rgba(220, 121, 101, 0.24);
  }

  .hub-stage__bark {
    left: 50%;
    bottom: 22px;
    transform: translateX(-50%);
    min-width: min(360px, calc(100% - 40px));
    padding: 12px 16px;
    display: grid;
    gap: 4px;
    text-align: center;
  }

  .hub-stage__bark strong {
    font-size: 0.94rem;
  }

  .hub-stage__hero {
    left: 50%;
    bottom: 84px;
    transform: translateX(-50%);
    width: 280px;
    display: grid;
    justify-items: center;
  }

  .hub-stage__hero-ring {
    position: absolute;
    inset: auto;
    border-radius: 999px;
    border: 1px solid rgba(120, 146, 140, 0.16);
  }

  .hub-stage__hero-ring--outer {
    width: 196px;
    height: 196px;
    bottom: 34px;
    background: radial-gradient(circle, rgba(92, 176, 150, 0.14), transparent 72%);
  }

  .hub-stage__hero-ring--inner {
    width: 146px;
    height: 146px;
    bottom: 58px;
    background: radial-gradient(circle, rgba(227, 171, 97, 0.16), transparent 72%);
  }

  .hub-stage__hero-frame {
    position: relative;
    z-index: 1;
    display: grid;
    place-items: center;
    width: 224px;
    height: 224px;
  }

  .hub-stage__hero-label {
    position: relative;
    z-index: 1;
    display: grid;
    gap: 4px;
    justify-items: center;
    margin-top: -8px;
    padding: 10px 14px;
    border-radius: 16px;
    background: rgba(10, 14, 17, 0.76);
    border: 1px solid rgba(126, 146, 142, 0.14);
  }

  .hub-stage__hero-label span {
    color: rgba(196, 210, 205, 0.72);
    font-size: 0.9rem;
  }

  .hub-stage__dock {
    display: grid;
    grid-template-columns: repeat(5, minmax(0, 1fr));
    gap: 10px;
  }

  .hub-stage__dock button {
    display: grid;
    gap: 4px;
    justify-items: start;
    padding: 12px 14px;
    border-radius: 18px;
    border: 1px solid rgba(124, 145, 140, 0.12);
    background: rgba(255, 255, 255, 0.04);
    color: rgba(208, 219, 214, 0.78);
    text-align: left;
  }

  .hub-stage__dock button.active {
    border-color: var(--hub-border-strong);
    background:
      linear-gradient(180deg, rgba(228, 171, 98, 0.16), rgba(95, 152, 134, 0.1)),
      rgba(255, 255, 255, 0.05);
    color: rgba(247, 239, 225, 0.96);
  }

  .hub-stage__dock span {
    font-weight: 700;
  }

  .hub-stage__footer {
    display: grid;
    gap: 16px;
  }

  .hub-stage__metrics {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 10px;
  }

  .hub-stage__metric {
    display: grid;
    gap: 4px;
    padding: 12px 14px;
    border-radius: 18px;
    border: 1px solid rgba(124, 145, 140, 0.12);
    background: rgba(255, 255, 255, 0.04);
  }

  .hub-stage__metric strong {
    font-size: 1.2rem;
  }

  .hub-stage__metric span {
    color: rgba(192, 205, 199, 0.68);
    font-size: 0.84rem;
  }

  .hub-stage__actions {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
  }

  .hub-sidebar {
    display: grid;
    gap: 16px;
  }

  .hub-card {
    padding: 18px;
    display: grid;
    gap: 16px;
  }

  .hub-card__header {
    display: grid;
    gap: 8px;
  }

  .hub-card__header p:last-child {
    color: rgba(203, 216, 210, 0.72);
    line-height: 1.5;
  }

  .hub-card__chips {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }

  .hub-card__alert {
    display: grid;
    gap: 6px;
    padding: 14px;
    border-radius: 18px;
    border: 1px solid rgba(123, 144, 139, 0.14);
    background: rgba(255, 255, 255, 0.04);
  }

  .hub-card__alert--clear {
    border-color: rgba(104, 193, 161, 0.24);
  }

  .hub-card__alert--watch {
    border-color: rgba(229, 180, 100, 0.24);
  }

  .hub-card__alert--alert {
    border-color: rgba(221, 123, 102, 0.24);
  }

  .hub-card__list {
    display: grid;
    gap: 12px;
  }

  .hub-card__list div {
    display: flex;
    justify-content: space-between;
    gap: 12px;
    padding-bottom: 10px;
    border-bottom: 1px solid rgba(122, 143, 138, 0.12);
  }

  .hub-card__list div:last-child {
    border-bottom: 0;
    padding-bottom: 0;
  }

  .hub-card__list small,
  .hub-feed__card p,
  .hub-receipt p {
    color: rgba(193, 208, 202, 0.68);
  }

  .hub-card__bench {
    display: grid;
    gap: 10px;
  }

  .hub-card__bench > small {
    color: rgba(193, 208, 202, 0.68);
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  .hub-feed {
    display: grid;
    gap: 10px;
  }

  .hub-feed__card {
    display: grid;
    gap: 6px;
    padding: 14px;
    border-radius: 18px;
    border: 1px solid rgba(122, 143, 138, 0.12);
    background: rgba(255, 255, 255, 0.04);
  }

  .hub-feed__card p {
    line-height: 1.5;
  }

  .hub-choice-row {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 8px;
  }

  .hub-choice-row button {
    padding: 11px 10px;
    border-radius: 16px;
    border: 1px solid rgba(122, 143, 138, 0.12);
    background: rgba(255, 255, 255, 0.03);
    color: rgba(214, 224, 219, 0.78);
  }

  .hub-choice-row button.selected {
    border-color: var(--hub-border-strong);
    background: rgba(230, 168, 94, 0.12);
    color: rgba(248, 240, 226, 0.96);
  }

  .hub-inline-actions {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 8px;
  }

  .hub-receipt {
    display: grid;
    gap: 6px;
    padding: 14px;
    border-radius: 18px;
    border: 1px solid rgba(122, 143, 138, 0.12);
    background: rgba(255, 255, 255, 0.03);
  }

  .hub-receipt--resolved {
    border-color: rgba(104, 193, 161, 0.24);
  }

  .hub-receipt--partial {
    border-color: rgba(229, 180, 100, 0.24);
  }

  .hub-receipt--steady {
    border-color: rgba(122, 143, 138, 0.16);
  }

  .hub-bench {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 8px;
  }

  .hub-bench__card {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px;
    border-radius: 16px;
    border: 1px solid rgba(122, 143, 138, 0.12);
    background: rgba(255, 255, 255, 0.03);
    color: rgba(235, 240, 234, 0.82);
  }

  .hub-bench__card.active {
    border-color: rgba(105, 193, 161, 0.2);
    background: rgba(105, 193, 161, 0.08);
  }

  .hub-empty {
    padding: 28px;
    display: grid;
    gap: 12px;
    max-width: 560px;
  }

  .hub-empty p:last-of-type {
    color: rgba(203, 216, 210, 0.72);
    line-height: 1.5;
  }

  @media (max-width: 1180px) {
    .hub-home__grid {
      grid-template-columns: 1fr;
    }

    .hub-stage__title-block h1 {
      max-width: 15ch;
    }
  }

  @media (max-width: 860px) {
    .hub-stage {
      padding: 18px;
    }

    .hub-stage__mission {
      grid-template-columns: 1fr;
    }

    .hub-stage__loop {
      grid-template-columns: 1fr;
    }

    .hub-stage__screen {
      min-height: 560px;
    }

    .hub-stage__hero {
      bottom: 120px;
      width: 248px;
    }

    .hub-stage__dock,
    .hub-stage__metrics,
    .hub-choice-row,
    .hub-inline-actions,
    .hub-bench {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  @media (max-width: 640px) {
    .hub-stage__screen {
      min-height: 520px;
    }

    .hub-stage__tag--support,
    .hub-stage__tag--form {
      position: relative;
      top: auto;
      right: auto;
      left: auto;
      margin: 16px 16px 0;
    }

    .hub-stage__hero {
      bottom: 120px;
    }

    .hub-stage__bark {
      min-width: calc(100% - 32px);
    }

    .hub-stage__dock,
    .hub-stage__metrics,
    .hub-choice-row,
    .hub-inline-actions,
    .hub-bench {
      grid-template-columns: 1fr;
    }

    .hub-stage__mission-actions,
    .hub-stage__actions {
      flex-direction: column;
    }
  }
</style>
