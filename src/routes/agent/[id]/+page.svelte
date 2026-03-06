<script lang="ts">
  import { onMount } from 'svelte';
  import type { AgentConfidenceStyle, AgentDecisionTrace, AgentHorizon, AgentEvalResult, EvalMatchResult, OwnedAgent, RuntimeInferenceMode, TrainingRunType } from '$lib/aimon/types';
  import { aimonDexById } from '$lib/aimon/data/aimonDex';
  import { createEvalScenario } from '$lib/aimon/data/evalScenarios';
  import { getEvolutionPreview } from '$lib/aimon/engine/evolutionSystem';
  import { buildAgentDecisionContext } from '$lib/aimon/services/contextAssembler';
  import { retrieveRelevantMemories } from '$lib/aimon/services/memoryService';
  import { promoteTrainingJob, queueTrainingJob, startTrainingJob } from '$lib/aimon/services/trainingOrchestrator';
  import { setScreen } from '$lib/aimon/stores/gameStore';
  import { addUserNoteMemory, compactMemoryBank, labStore, savePromptVariantFromAgent } from '$lib/aimon/stores/labStore';
  import { matchStore } from '$lib/aimon/stores/matchStore';
  import { rosterStore, selectRosterAgent, updateAgentConfiguration } from '$lib/aimon/stores/rosterStore';
  import { runtimeStore, setRuntimeStatus, updateRuntimeConfig } from '$lib/aimon/stores/runtimeStore';
  import { squadStore } from '$lib/aimon/stores/squadStore';
  import PokemonFrame from '../../../components/shared/PokemonFrame.svelte';

  let { data } = $props<{
    data: {
      agentId: string;
    };
  }>();

  let roster = $derived($rosterStore);
  let squad = $derived($squadStore);
  let lab = $derived($labStore);
  let matches = $derived($matchStore);
  let runtime = $derived($runtimeStore);

  let agent = $derived(roster.agents.find((item) => item.id === data.agentId) ?? null);
  let entry = $derived(agent ? aimonDexById[agent.speciesId] ?? null : null);
  let evolution = $derived(agent && entry ? getEvolutionPreview(entry.id, agent.xp) : null);
  let baseModel = $derived(agent ? lab.baseModels.find((item) => item.id === agent.baseModelId) ?? null : null);
  let memoryBank = $derived(
    agent ? lab.memoryBanks.find((bank) => bank.agentId === agent.id || bank.id === agent.memoryBankId) ?? null : null
  );
  let enabledDataSources = $derived(
    agent ? lab.dataSources.filter((source) => agent.loadout.enabledDataSourceIds.includes(source.id)) : []
  );
  let enabledTools = $derived(agent ? lab.tools.filter((tool) => agent.loadout.enabledToolIds.includes(tool.id)) : []);
  let trainingRuns = $derived(agent ? lab.trainingRuns.filter((run) => run.agentId === agent.id).slice(0, 4) : []);
  let modelArtifacts = $derived(agent ? lab.modelArtifacts.filter((artifact) => artifact.agentId === agent.id).slice(0, 4) : []);
  let promptVariants = $derived(agent ? lab.promptVariants.filter((variant) => variant.agentId === agent.id).slice(0, 4) : []);
  let recentMatches = $derived(
    agent ? matches.recentResults.filter((result) => result.agentResults.some((row) => row.agentId === agent.id)).slice(0, 5) : []
  );
  let selectedScenario = $derived(matches.activeScenario ?? createEvalScenario(matches.selectedScenarioId));
  let recentAgentResults = $derived(
    agent
      ? recentMatches
          .map((result) => ({
            result,
            agentResult: result.agentResults.find((row) => row.agentId === agent.id) ?? null
          }))
          .filter((row): row is { result: EvalMatchResult; agentResult: AgentEvalResult } => Boolean(row.agentResult))
      : []
  );
  let memoryRecords = $derived(memoryBank?.records.slice(0, 6) ?? []);
  let inSquad = $derived(agent ? squad.activeSquad.memberAgentIds.includes(agent.id) : false);
  let assignedRoleSlot = $derived(
    agent
      ? (() => {
          const assignment = Object.entries(squad.activeSquad.roleMap).find(([, agentId]) => agentId === agent.id);
          return assignment ? assignment[0].toUpperCase() : null;
        })()
      : null
  );
  let nextLevelXp = $derived(agent ? agent.level * 60 : 60);
  let currentLevelFloorXp = $derived(agent ? (agent.level - 1) * 60 : 0);
  let levelProgress = $derived(
    agent ? Math.max(0, Math.min(100, ((agent.xp - currentLevelFloorXp) / Math.max(1, nextLevelXp - currentLevelFloorXp)) * 100)) : 0
  );
  let successMemoryCount = $derived(memoryBank?.records.filter((record) => record.kind === 'SUCCESS_CASE').length ?? 0);
  let failureMemoryCount = $derived(memoryBank?.records.filter((record) => record.kind === 'FAILURE_CASE').length ?? 0);
  let retrievalPreview = $derived(
    agent && memoryBank
      ? retrieveRelevantMemories(memoryBank, agent.loadout.retrievalPolicy, {
          role: agent.role,
          symbol: selectedScenario.symbol,
          timeframe: selectedScenario.timeframe,
          regime: selectedScenario.targetRegime,
          tags: [selectedScenario.id, selectedScenario.symbol, agent.speciesId, agent.role, ...agent.loadout.indicators, ...agent.specializationTags],
          scenarioStartAt: matches.activeScenario?.scenarioStartAt ?? Date.now()
        })
      : []
  );
  let recommendedNextStep = $derived(
    !agent
      ? ''
      : failureMemoryCount > successMemoryCount
        ? 'Review recent failures, lower risk tolerance, and compact noisy memory cards before the next eval.'
        : !inSquad
          ? 'Place this agent into an active squad role so its memory and policy can be validated in battle.'
          : 'Run another benchmark and promote the best lessons into a stable playbook.'
  );

  let loadedAgentId = $state('');
  let baseModelDraft = $state('');
  let systemPromptDraft = $state('');
  let rolePromptDraft = $state('');
  let policyPromptDraft = $state('');
  let readoutDraft = $state('');
  let behaviorNoteDraft = $state('');
  let retrainingPathDraft = $state('');
  let focusSkillDraft = $state('');
  let indicatorDraft = $state('');
  let riskToleranceDraft = $state(0.5);
  let confidenceStyleDraft = $state<AgentConfidenceStyle>('BALANCED');
  let horizonDraft = $state<AgentHorizon>('INTRADAY');
  let topKDraft = $state(3);
  let recencyWeightDraft = $state(0.15);
  let similarityWeightDraft = $state(0.45);
  let successWeightDraft = $state(0.15);
  let importanceWeightDraft = $state(0.1);
  let roleMatchWeightDraft = $state(0.1);
  let regimeMatchWeightDraft = $state(0.05);
  let dataSourceDraft = $state<string[]>([]);
  let toolDraft = $state<string[]>([]);
  let variantLabelDraft = $state('');
  let trainingTypeDraft = $state<TrainingRunType>('PROMPT_TUNE');
  let trainingHypothesisDraft = $state('');
  let noteTitleDraft = $state('');
  let noteLessonDraft = $state('');
  let noteTagsDraft = $state('');
  let saveMessage = $state('Saved configuration sync is idle.');
  let decisionTest = $state<AgentDecisionTrace | null>(null);
  let decisionTestMessage = $state('Runtime decision test is idle.');
  let testingRuntime = $state(false);
  let runningTraining = $state(false);

  $effect(() => {
    if (!agent || loadedAgentId === agent.id) return;

    loadedAgentId = agent.id;
    baseModelDraft = agent.baseModelId;
    systemPromptDraft = agent.loadout.systemPrompt;
    rolePromptDraft = agent.loadout.rolePrompt;
    policyPromptDraft = agent.loadout.policyPrompt;
    readoutDraft = agent.loadout.readout;
    behaviorNoteDraft = agent.loadout.behaviorNote;
    retrainingPathDraft = agent.loadout.retrainingPath;
    focusSkillDraft = agent.loadout.focusSkill;
    indicatorDraft = agent.loadout.indicators.join(', ');
    riskToleranceDraft = agent.loadout.riskTolerance;
    confidenceStyleDraft = agent.loadout.confidenceStyle;
    horizonDraft = agent.loadout.horizon;
    topKDraft = agent.loadout.retrievalPolicy.topK;
    recencyWeightDraft = agent.loadout.retrievalPolicy.recencyWeight;
    similarityWeightDraft = agent.loadout.retrievalPolicy.similarityWeight;
    successWeightDraft = agent.loadout.retrievalPolicy.successWeight;
    importanceWeightDraft = agent.loadout.retrievalPolicy.importanceWeight;
    roleMatchWeightDraft = agent.loadout.retrievalPolicy.roleMatchWeight;
    regimeMatchWeightDraft = agent.loadout.retrievalPolicy.regimeMatchWeight;
    dataSourceDraft = [...agent.loadout.enabledDataSourceIds];
    toolDraft = [...agent.loadout.enabledToolIds];
    variantLabelDraft = `${agent.name} snapshot`;
    trainingTypeDraft = 'PROMPT_TUNE';
    trainingHypothesisDraft = '';
    noteTitleDraft = '';
    noteLessonDraft = '';
    noteTagsDraft = `${agent.speciesId}, ${agent.role.toLowerCase()}`;
    saveMessage = 'Loaded current agent configuration.';
  });

  $effect(() => {
    const nextSelectedId = agent?.id ?? null;
    if (nextSelectedId !== roster.selectedAgentId) {
      selectRosterAgent(nextSelectedId);
    }
  });

  onMount(() => {
    setScreen('roster');
  });

  function formatDate(timestamp?: number): string {
    if (!timestamp) return 'No record';
    return new Date(timestamp).toLocaleString('ko-KR', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  function formatPercent(value: number): string {
    return `${Math.round(value * 100)}%`;
  }

  function formatConfig(config: Record<string, string | number | boolean>): string {
    const entries = Object.entries(config);
    if (entries.length === 0) return 'default';
    return entries.map(([key, value]) => `${key}:${String(value)}`).join(' · ');
  }

  function parseIndicators(value: string): string[] {
    return value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
  }

  function toggleSelection(target: 'data' | 'tool', id: string): void {
    const current = target === 'data' ? dataSourceDraft : toolDraft;
    const next = current.includes(id) ? current.filter((item) => item !== id) : [...current, id];

    if (target === 'data') {
      dataSourceDraft = next;
      return;
    }

    toolDraft = next;
  }

  function buildChangeList(): string[] {
    if (!agent) return [];

    const changes: string[] = [];
    if (agent.baseModelId !== baseModelDraft) changes.push('base model');
    if (agent.loadout.systemPrompt !== systemPromptDraft) changes.push('system prompt');
    if (agent.loadout.rolePrompt !== rolePromptDraft) changes.push('role prompt');
    if (agent.loadout.policyPrompt !== policyPromptDraft) changes.push('policy prompt');
    if (agent.loadout.readout !== readoutDraft) changes.push('readout');
    if (agent.loadout.behaviorNote !== behaviorNoteDraft) changes.push('behavior note');
    if (agent.loadout.retrainingPath !== retrainingPathDraft) changes.push('retraining path');
    if (agent.loadout.focusSkill !== focusSkillDraft) changes.push('focus skill');
    if (agent.loadout.indicators.join('|') !== parseIndicators(indicatorDraft).join('|')) changes.push('indicators');
    if (agent.loadout.enabledDataSourceIds.join('|') !== dataSourceDraft.join('|')) changes.push('data bindings');
    if (agent.loadout.enabledToolIds.join('|') !== toolDraft.join('|')) changes.push('tool bindings');
    if (agent.loadout.riskTolerance !== riskToleranceDraft) changes.push('risk tolerance');
    if (agent.loadout.confidenceStyle !== confidenceStyleDraft) changes.push('confidence style');
    if (agent.loadout.horizon !== horizonDraft) changes.push('horizon');
    if (agent.loadout.retrievalPolicy.topK !== topKDraft) changes.push('retrieval topK');
    if (agent.loadout.retrievalPolicy.recencyWeight !== recencyWeightDraft) changes.push('recency weight');
    if (agent.loadout.retrievalPolicy.similarityWeight !== similarityWeightDraft) changes.push('similarity weight');
    if (agent.loadout.retrievalPolicy.successWeight !== successWeightDraft) changes.push('success weight');
    if (agent.loadout.retrievalPolicy.importanceWeight !== importanceWeightDraft) changes.push('importance weight');
    if (agent.loadout.retrievalPolicy.roleMatchWeight !== roleMatchWeightDraft) changes.push('role match weight');
    if (agent.loadout.retrievalPolicy.regimeMatchWeight !== regimeMatchWeightDraft) changes.push('regime match weight');
    return changes;
  }

  function saveConfiguration(): string[] {
    if (!agent) return [];
    const changes = buildChangeList();

    updateAgentConfiguration(agent.id, {
      baseModelId: baseModelDraft,
      loadout: {
        systemPrompt: systemPromptDraft,
        rolePrompt: rolePromptDraft,
        policyPrompt: policyPromptDraft,
        readout: readoutDraft,
        behaviorNote: behaviorNoteDraft,
        retrainingPath: retrainingPathDraft,
        focusSkill: focusSkillDraft,
        indicators: parseIndicators(indicatorDraft),
        enabledDataSourceIds: dataSourceDraft,
        enabledToolIds: toolDraft,
        riskTolerance: riskToleranceDraft,
        confidenceStyle: confidenceStyleDraft,
        horizon: horizonDraft
      },
      retrievalPolicy: {
        topK: topKDraft,
        recencyWeight: recencyWeightDraft,
        similarityWeight: similarityWeightDraft,
        successWeight: successWeightDraft,
        importanceWeight: importanceWeightDraft,
        roleMatchWeight: roleMatchWeightDraft,
        regimeMatchWeight: regimeMatchWeightDraft
      }
    });

    saveMessage = changes.length > 0 ? `Saved: ${changes.join(', ')}` : 'Saved without configuration delta.';
    return changes;
  }

  function snapshotPromptVariant(): void {
    if (!agent) return;
    saveConfiguration();
    savePromptVariantFromAgent(agent.id, variantLabelDraft.trim() || `${agent.name} snapshot`);
    saveMessage = 'Saved prompt snapshot to lab variants.';
  }

  async function enqueueTrainingRun(): Promise<void> {
    if (!agent) return;
    const changes = saveConfiguration();
    const benchmarkPackId = `benchmark-${selectedScenario.id}`;
    const datasetBundleIds = lab.datasetBundles
      .filter((bundle) => bundle.agentIds.includes(agent.id) && bundle.benchmarkPackId === benchmarkPackId)
      .map((bundle) => bundle.id);
    const jobId = queueTrainingJob({
      agentId: agent.id,
      type: trainingTypeDraft,
      requestedBy: 'PLAYER',
      hypothesis: trainingHypothesisDraft.trim() || 'Evaluate whether the current prompt and retrieval settings improve consistency.',
      benchmarkPackId,
      payload: {
        scenarioId: selectedScenario.id,
        datasetBundleIds,
        activeArtifactId: agent.activeArtifactId ?? null
      },
      changes: changes.length > 0 ? changes : ['configuration sync']
    });

    runningTraining = true;
    const result = await startTrainingJob(jobId);
    runningTraining = false;
    saveMessage = result.validationErrors?.length
      ? `${result.message} · ${result.validationErrors.join(', ')}`
      : result.message;
    trainingHypothesisDraft = '';
  }

  async function promoteRun(jobId: string): Promise<void> {
    const result = await promoteTrainingJob(jobId);
    saveMessage = result.message;
  }

  function compactMemory(): void {
    if (!agent) return;
    compactMemoryBank(agent.id);
    saveMessage = 'Compacted memory bank and raised compaction level.';
  }

  function addDoctrineNote(): void {
    if (!agent || noteTitleDraft.trim().length === 0 || noteLessonDraft.trim().length === 0) return;
    addUserNoteMemory(
      agent.id,
      noteTitleDraft.trim(),
      noteLessonDraft.trim(),
      noteTagsDraft
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean)
    );
    noteTitleDraft = '';
    noteLessonDraft = '';
    saveMessage = 'Added user doctrine note to the memory bank.';
  }

  function buildDraftAgent(): OwnedAgent | null {
    if (!agent) return null;

    return {
      ...agent,
      baseModelId: baseModelDraft,
      loadout: {
        ...agent.loadout,
        systemPrompt: systemPromptDraft,
        rolePrompt: rolePromptDraft,
        policyPrompt: policyPromptDraft,
        readout: readoutDraft,
        behaviorNote: behaviorNoteDraft,
        retrainingPath: retrainingPathDraft,
        focusSkill: focusSkillDraft,
        indicators: parseIndicators(indicatorDraft),
        enabledDataSourceIds: dataSourceDraft,
        enabledToolIds: toolDraft,
        riskTolerance: riskToleranceDraft,
        confidenceStyle: confidenceStyleDraft,
        horizon: horizonDraft,
        retrievalPolicy: {
          ...agent.loadout.retrievalPolicy,
          topK: topKDraft,
          recencyWeight: recencyWeightDraft,
          similarityWeight: similarityWeightDraft,
          successWeight: successWeightDraft,
          importanceWeight: importanceWeightDraft,
          roleMatchWeight: roleMatchWeightDraft,
          regimeMatchWeight: regimeMatchWeightDraft
        }
      }
    };
  }

  function updateRuntimeField<K extends keyof typeof runtime.config>(key: K, value: (typeof runtime.config)[K]): void {
    updateRuntimeConfig({ [key]: value });
  }

  async function testRuntimeConnection(): Promise<void> {
    testingRuntime = true;
    setRuntimeStatus('IDLE', 'Testing runtime connection...');

    try {
      const response = await fetch('/api/aimon/runtime', {
        method: 'POST',
        headers: {
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          config: runtime.config
        })
      });

      const payload = (await response.json()) as { ok?: boolean; message?: string };
      setRuntimeStatus(payload.ok ? 'OK' : 'ERROR', payload.message ?? 'Unknown runtime response');
      decisionTestMessage = payload.message ?? 'Runtime connection check completed.';
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown runtime error';
      setRuntimeStatus('ERROR', message);
      decisionTestMessage = message;
    } finally {
      testingRuntime = false;
    }
  }

  async function runDecisionTest(): Promise<void> {
    const draftAgent = buildDraftAgent();
    if (!draftAgent) return;

    testingRuntime = true;
    decisionTest = null;
    decisionTestMessage = 'Running decision test...';

    try {
      const memoryHits = retrieveRelevantMemories(memoryBank, draftAgent.loadout.retrievalPolicy, {
        role: draftAgent.role,
        symbol: selectedScenario.symbol,
        timeframe: selectedScenario.timeframe,
        regime: selectedScenario.targetRegime,
        tags: [selectedScenario.id, selectedScenario.symbol, draftAgent.speciesId, draftAgent.role, ...draftAgent.loadout.indicators, ...draftAgent.specializationTags],
        scenarioStartAt: Date.now()
      }).map((candidate) => ({
        id: candidate.record.id,
        title: candidate.record.title,
        lesson: candidate.record.lesson,
        kind: candidate.record.kind,
        score: candidate.totalScore
      }));
      const activeDataSourceKinds = draftAgent.loadout.enabledDataSourceIds
        .map((id) => lab.dataSources.find((source) => source.id === id)?.kind)
        .filter((kind): kind is (typeof lab.dataSources)[number]['kind'] => Boolean(kind));
      const squadNotes = squad.activeSquad.memberAgentIds
        .map((id) => roster.agents.find((item) => item.id === id))
        .filter((item): item is OwnedAgent => Boolean(item))
        .filter((item) => item.id !== draftAgent.id)
        .map((item) => `${item.role}:${item.name}`);

      const context = buildAgentDecisionContext(
        draftAgent,
        {
          tick: 0,
          timestamp: Date.now(),
          price: selectedScenario.startingPrice,
          priceChange5m: selectedScenario.baselinePriceChange5m,
          volatility: selectedScenario.baselineVolatility,
          fearGreed: selectedScenario.baselineFearGreed,
          fundingRate: selectedScenario.baselineFundingRate,
          openInterestChange: selectedScenario.baselineOpenInterestChange,
          regime: selectedScenario.targetRegime,
          regimeStrength: 0.66
        },
        memoryHits,
        squadNotes,
        squad.activeSquad.tacticPreset,
        selectedScenario,
        activeDataSourceKinds
      );

      const response = await fetch('/api/aimon/decide', {
        method: 'POST',
        headers: {
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          context,
          config: runtime.config
        })
      });

      const payload = (await response.json()) as { trace?: AgentDecisionTrace };
      if (!payload.trace) {
        throw new Error('Decision trace was not returned.');
      }

      decisionTest = payload.trace;
      decisionTestMessage = `${payload.trace.providerLabel ?? payload.trace.providerId ?? 'runtime'} produced ${payload.trace.action}.`;
    } catch (error) {
      decisionTestMessage = error instanceof Error ? error.message : 'Unknown decision test error';
    } finally {
      testingRuntime = false;
    }
  }
</script>

<svelte:head>
  <title>{agent ? `${agent.name} Console` : 'Agent Console'}</title>
</svelte:head>

<div class="page">
  {#if agent && entry && evolution}
    <header class="header">
      <div>
        <p class="eyebrow">AGENT CONSOLE</p>
        <h1>{agent.name}</h1>
        <p class="lede">
          이 화면이 AIMON의 실질적인 육성 허브입니다. 모델, prompt stack, memory, 최근 eval 결과를 한 자리에서 보고 다음 학습 결정을 내립니다.
        </p>
      </div>
      <div class="header-actions">
        <a href="/roster">Back To Roster</a>
        <a href="/team">Assign Squad</a>
        <a href="/battle">Run Eval</a>
        <a href="/lab">Open Lab</a>
      </div>
    </header>

    <section class="hero-grid">
      <PokemonFrame variant="accent" padding="18px">
        <article class="hero" style={`--agent-color:${entry.color}; --agent-accent:${entry.accent};`}>
          <div class="hero-art">
            <div class="hero-sprite">
              <span>{agent.name.slice(0, 2).toUpperCase()}</span>
            </div>
          </div>

          <div class="hero-copy">
            <p class="eyebrow">{entry.dexNo} · {entry.type} · {agent.role}</p>
            <div class="hero-title-row">
              <h2>{agent.name}</h2>
              <span class="status-pill">{agent.status}</span>
            </div>
            <p class="hero-description">{entry.description}</p>

            <div class="hero-badges">
              <span>{agent.loadout.retrainingPath}</span>
              <span>{agent.loadout.focusSkill}</span>
              <span>{baseModel?.family ?? agent.baseModelId}</span>
              {#if inSquad}
                <span class="active">{assignedRoleSlot ?? 'ACTIVE'} SLOT</span>
              {/if}
            </div>

            <div class="progress-block">
              <div class="progress-meta">
                <span>Level Progress</span>
                <strong>LVL {agent.level} · {agent.xp}/{nextLevelXp} XP</strong>
              </div>
              <div class="progress-bar">
                <div class="progress-fill" style:width={`${levelProgress}%`} style:background={entry.color}></div>
              </div>
            </div>
          </div>
        </article>
      </PokemonFrame>

      <PokemonFrame variant={evolution.canEvolve ? 'accent' : 'dark'} padding="16px">
        <section class="summary-stack">
          <div class="section-head">
            <h3>Operational Snapshot</h3>
            <span>{inSquad ? 'ACTIVE' : 'BENCH'}</span>
          </div>
          <div class="kv-grid">
            <span>Base model</span><strong>{baseModel ? `${baseModel.family} ${baseModel.variant}` : agent.baseModelId}</strong>
            <span>Bond</span><strong>{agent.bond}</strong>
            <span>Matches</span><strong>{agent.record.matches}</strong>
            <span>Last outcome</span><strong>{agent.record.lastOutcome ?? 'No record'}</strong>
            <span>Specialization</span><strong>T{agent.progression.specializationTier}</strong>
            <span>Last match</span><strong>{formatDate(agent.record.lastMatchAt)}</strong>
            <span>Evolution</span><strong>{evolution.canEvolve ? 'READY NOW' : evolution.evolvesTo ?? 'FINAL FORM'}</strong>
            <span>Memory bank</span><strong>{memoryBank?.records.length ?? 0}/{memoryBank?.capacity ?? 0}</strong>
          </div>
        </section>
      </PokemonFrame>
    </section>

    <section class="grid two-up">
      <PokemonFrame variant="dark" padding="16px">
        <section class="panel">
          <div class="section-head">
            <h3>Training Workbench</h3>
            <span>Editable config</span>
          </div>
          <div class="form-grid">
            <label class="field">
              <span>Base Model</span>
              <select bind:value={baseModelDraft}>
                {#each lab.baseModels as model (model.id)}
                  <option value={model.id}>{model.family} {model.variant}</option>
                {/each}
              </select>
            </label>
            <label class="field">
              <span>Readout</span>
              <input bind:value={readoutDraft} />
            </label>
            <label class="field">
              <span>Retraining Path</span>
              <input bind:value={retrainingPathDraft} />
            </label>
            <label class="field">
              <span>Focus Skill</span>
              <input bind:value={focusSkillDraft} />
            </label>
            <label class="field full">
              <span>System Prompt</span>
              <textarea bind:value={systemPromptDraft} rows="4"></textarea>
            </label>
            <label class="field full">
              <span>Role Prompt</span>
              <textarea bind:value={rolePromptDraft} rows="4"></textarea>
            </label>
            <label class="field full">
              <span>Policy Prompt</span>
              <textarea bind:value={policyPromptDraft} rows="4"></textarea>
            </label>
            <label class="field full">
              <span>Behavior Note</span>
              <textarea bind:value={behaviorNoteDraft} rows="3"></textarea>
            </label>
            <label class="field full">
              <span>Indicators (comma separated)</span>
              <input bind:value={indicatorDraft} />
            </label>
          </div>
          <div class="form-actions">
            <button type="button" onclick={saveConfiguration}>Save Configuration</button>
            <small>{saveMessage}</small>
          </div>
        </section>
      </PokemonFrame>

      <PokemonFrame variant="dark" padding="16px">
        <section class="panel">
          <div class="section-head">
            <h3>Runtime Controls</h3>
            <span>Data, tools, retrieval</span>
          </div>
          <div class="form-grid">
            <label class="field">
              <span>Risk Tolerance</span>
              <input type="number" min="0" max="1" step="0.01" bind:value={riskToleranceDraft} />
            </label>
            <label class="field">
              <span>Confidence Style</span>
              <select bind:value={confidenceStyleDraft}>
                <option value="CONSERVATIVE">CONSERVATIVE</option>
                <option value="BALANCED">BALANCED</option>
                <option value="AGGRESSIVE">AGGRESSIVE</option>
              </select>
            </label>
            <label class="field">
              <span>Horizon</span>
              <select bind:value={horizonDraft}>
                <option value="SCALP">SCALP</option>
                <option value="INTRADAY">INTRADAY</option>
                <option value="SWING">SWING</option>
              </select>
            </label>
            <label class="field">
              <span>Top K</span>
              <input type="number" min="1" max="8" step="1" bind:value={topKDraft} />
            </label>
            <label class="field">
              <span>Recency Weight</span>
              <input type="number" min="0" max="1" step="0.01" bind:value={recencyWeightDraft} />
            </label>
            <label class="field">
              <span>Similarity Weight</span>
              <input type="number" min="0" max="1" step="0.01" bind:value={similarityWeightDraft} />
            </label>
            <label class="field">
              <span>Success Weight</span>
              <input type="number" min="0" max="1" step="0.01" bind:value={successWeightDraft} />
            </label>
            <label class="field">
              <span>Importance Weight</span>
              <input type="number" min="0" max="1" step="0.01" bind:value={importanceWeightDraft} />
            </label>
            <label class="field">
              <span>Role Match Weight</span>
              <input type="number" min="0" max="1" step="0.01" bind:value={roleMatchWeightDraft} />
            </label>
            <label class="field">
              <span>Regime Match Weight</span>
              <input type="number" min="0" max="1" step="0.01" bind:value={regimeMatchWeightDraft} />
            </label>
          </div>

          <div class="checklist-group">
            <div>
              <span class="label">Enabled Data Sources</span>
              <div class="checklist">
                {#each lab.dataSources as source (source.id)}
                  <label class="check-item">
                    <input
                      type="checkbox"
                      checked={dataSourceDraft.includes(source.id)}
                      onchange={() => toggleSelection('data', source.id)}
                    />
                    <span>{source.name} · {source.kind}</span>
                  </label>
                {/each}
              </div>
            </div>

            <div>
              <span class="label">Enabled Tools</span>
              <div class="checklist">
                {#each lab.tools as tool (tool.id)}
                  <label class="check-item">
                    <input
                      type="checkbox"
                      checked={toolDraft.includes(tool.id)}
                      onchange={() => toggleSelection('tool', tool.id)}
                    />
                    <span>{tool.name}</span>
                  </label>
                {/each}
              </div>
            </div>
          </div>
        </section>
      </PokemonFrame>
    </section>

    <section class="grid two-up">
      <PokemonFrame variant="dark" padding="16px">
        <section class="panel">
          <div class="section-head">
            <h3>Inference Runtime</h3>
            <span>{runtime.config.mode}</span>
          </div>
          <div class="form-grid">
            <label class="field">
              <span>Mode</span>
              <select value={runtime.config.mode} onchange={(event) => updateRuntimeField('mode', (event.currentTarget as HTMLSelectElement).value as RuntimeInferenceMode)}>
                <option value="HEURISTIC">HEURISTIC</option>
                <option value="OLLAMA">OLLAMA</option>
                <option value="OPENAI_COMPAT">OPENAI_COMPAT</option>
              </select>
            </label>
            <label class="field">
              <span>Model Id</span>
              <input value={runtime.config.modelId} oninput={(event) => updateRuntimeField('modelId', (event.currentTarget as HTMLInputElement).value)} />
            </label>
            <label class="field full">
              <span>Base URL</span>
              <input value={runtime.config.baseUrl} oninput={(event) => updateRuntimeField('baseUrl', (event.currentTarget as HTMLInputElement).value)} />
            </label>
            <label class="field full">
              <span>API Key</span>
              <input type="password" value={runtime.config.apiKey} oninput={(event) => updateRuntimeField('apiKey', (event.currentTarget as HTMLInputElement).value)} />
            </label>
            <label class="field">
              <span>Temperature</span>
              <input
                type="number"
                min="0"
                max="2"
                step="0.05"
                value={runtime.config.temperature}
                onchange={(event) => updateRuntimeField('temperature', Number((event.currentTarget as HTMLInputElement).value))}
              />
            </label>
            <label class="field">
              <span>Timeout (ms)</span>
              <input
                type="number"
                min="1000"
                step="500"
                value={runtime.config.timeoutMs}
                onchange={(event) => updateRuntimeField('timeoutMs', Number((event.currentTarget as HTMLInputElement).value))}
              />
            </label>
          </div>
          <div class="form-actions">
            <button type="button" onclick={testRuntimeConnection} disabled={testingRuntime}>Test Runtime</button>
            <small>{runtime.lastStatus} · {runtime.lastMessage}</small>
          </div>
        </section>
      </PokemonFrame>

      <PokemonFrame variant="dark" padding="16px">
        <section class="panel">
          <div class="section-head">
            <h3>Decision Test</h3>
            <span>{testingRuntime ? 'RUNNING' : 'READY'}</span>
          </div>
          <p class="next-step">
            현재 드래프트 prompt와 retrieval policy를 사용해서 synthetic market packet 위에서 즉시 한 번 판단을 돌립니다.
          </p>
          <div class="form-actions">
            <button type="button" onclick={runDecisionTest} disabled={testingRuntime}>Run Decision Test</button>
            <small>{decisionTestMessage}</small>
          </div>
          {#if decisionTest}
            <article class="list-card">
              <div class="list-head">
                <strong>{decisionTest.action}</strong>
                <span>{Math.round(decisionTest.confidence * 100)}%</span>
              </div>
              <p>{decisionTest.thesis}</p>
              <small>{decisionTest.invalidation}</small>
              <div class="chips">
                <span>{decisionTest.providerLabel ?? decisionTest.providerId ?? 'runtime'}</span>
                {#if decisionTest.fallbackUsed}
                  <span>FALLBACK</span>
                {/if}
                {#each decisionTest.evidenceTitles as title}
                  <span>{title}</span>
                {/each}
              </div>
            </article>
          {/if}
        </section>
      </PokemonFrame>
    </section>

    <PokemonFrame variant="dark" padding="16px">
      <section class="panel">
        <div class="section-head">
          <h3>Lab Actions</h3>
          <span>Snapshot, queue, doctrine</span>
        </div>
        <div class="grid three-up">
          <div class="action-card">
            <label class="field">
              <span>Prompt Snapshot Label</span>
              <input bind:value={variantLabelDraft} />
            </label>
            <button type="button" onclick={snapshotPromptVariant}>Save Prompt Variant</button>
          </div>

          <div class="action-card">
            <label class="field">
              <span>Training Type</span>
              <select bind:value={trainingTypeDraft}>
                <option value="PROMPT_TUNE">PROMPT_TUNE</option>
                <option value="RETRIEVAL_TUNE">RETRIEVAL_TUNE</option>
                <option value="MEMORY_COMPACT">MEMORY_COMPACT</option>
                <option value="SFT">SFT</option>
                <option value="LORA">LORA</option>
                <option value="CPT">CPT</option>
              </select>
            </label>
            <label class="field">
              <span>Hypothesis</span>
              <textarea bind:value={trainingHypothesisDraft} rows="4"></textarea>
            </label>
            <button type="button" onclick={enqueueTrainingRun} disabled={runningTraining}>
              {runningTraining ? 'Running Training Job…' : 'Queue And Start Training'}
            </button>
          </div>

          <div class="action-card">
            <label class="field">
              <span>Doctrine Note Title</span>
              <input bind:value={noteTitleDraft} />
            </label>
            <label class="field">
              <span>Doctrine Lesson</span>
              <textarea bind:value={noteLessonDraft} rows="4"></textarea>
            </label>
            <label class="field">
              <span>Tags</span>
              <input bind:value={noteTagsDraft} />
            </label>
            <div class="form-actions">
              <button type="button" onclick={addDoctrineNote}>Add Doctrine Memory</button>
              <button type="button" class="secondary" onclick={compactMemory}>Compact Memory Bank</button>
            </div>
          </div>
        </div>
      </section>
    </PokemonFrame>

    <section class="grid two-up">
      <PokemonFrame variant="dark" padding="16px">
        <section class="panel">
          <div class="section-head">
            <h3>Prompt Stack</h3>
            <span>{agent.loadout.outputSchemaVersion}</span>
          </div>
          <div class="stack">
            <article>
              <span class="label">System Prompt</span>
              <p>{agent.loadout.systemPrompt}</p>
            </article>
            <article>
              <span class="label">Role Prompt</span>
              <p>{agent.loadout.rolePrompt}</p>
            </article>
            <article>
              <span class="label">Policy Prompt</span>
              <p>{agent.loadout.policyPrompt}</p>
            </article>
          </div>
        </section>
      </PokemonFrame>

      <PokemonFrame variant="dark" padding="16px">
        <section class="panel">
          <div class="section-head">
            <h3>Decision Policy</h3>
            <span>{agent.loadout.horizon}</span>
          </div>
          <div class="kv-grid">
            <span>Readout</span><strong>{agent.loadout.readout}</strong>
            <span>Behavior</span><strong>{agent.loadout.behaviorNote}</strong>
            <span>Confidence</span><strong>{agent.loadout.confidenceStyle}</strong>
            <span>Risk tolerance</span><strong>{formatPercent(agent.loadout.riskTolerance)}</strong>
            <span>Indicators</span><strong>{agent.loadout.indicators.join(' / ')}</strong>
            <span>Special tags</span><strong>{agent.specializationTags.join(' / ')}</strong>
          </div>
        </section>
      </PokemonFrame>
    </section>

    <section class="grid two-up">
      <PokemonFrame variant="dark" padding="16px">
        <section class="panel">
          <div class="section-head">
            <h3>Data Inputs</h3>
            <span>{enabledDataSources.length} active</span>
          </div>
          <div class="list">
            {#if enabledDataSources.length > 0}
              {#each enabledDataSources as source (source.id)}
                <article class="list-card">
                  <div class="list-head">
                    <strong>{source.name}</strong>
                    <span>{source.kind}</span>
                  </div>
                  <p>{formatConfig(source.config)}</p>
                  <small>Quality {Math.round(source.qualityScore * 100)}%</small>
                </article>
              {/each}
            {:else}
              <p class="empty-copy">No data sources attached.</p>
            {/if}
          </div>
        </section>
      </PokemonFrame>

      <PokemonFrame variant="dark" padding="16px">
        <section class="panel">
          <div class="section-head">
            <h3>Tool Stack</h3>
            <span>{enabledTools.length} active</span>
          </div>
          <div class="list">
            {#if enabledTools.length > 0}
              {#each enabledTools as tool (tool.id)}
                <article class="list-card">
                  <div class="list-head">
                    <strong>{tool.name}</strong>
                    <span>{tool.kind}</span>
                  </div>
                  <p>{tool.description}</p>
                </article>
              {/each}
            {:else}
              <p class="empty-copy">No tools enabled.</p>
            {/if}
          </div>
        </section>
      </PokemonFrame>
    </section>

    <section class="grid two-up">
      <PokemonFrame variant="dark" padding="16px">
        <section class="panel">
          <div class="section-head">
            <h3>Retrieval Policy</h3>
            <span>Memory RAG</span>
          </div>
          <div class="kv-grid">
            <span>Top K</span><strong>{agent.loadout.retrievalPolicy.topK}</strong>
            <span>Similarity</span><strong>{formatPercent(agent.loadout.retrievalPolicy.similarityWeight)}</strong>
            <span>Recency</span><strong>{formatPercent(agent.loadout.retrievalPolicy.recencyWeight)}</strong>
            <span>Success</span><strong>{formatPercent(agent.loadout.retrievalPolicy.successWeight)}</strong>
            <span>Importance</span><strong>{formatPercent(agent.loadout.retrievalPolicy.importanceWeight)}</strong>
            <span>Role match</span><strong>{formatPercent(agent.loadout.retrievalPolicy.roleMatchWeight)}</strong>
            <span>Regime match</span><strong>{formatPercent(agent.loadout.retrievalPolicy.regimeMatchWeight)}</strong>
            <span>Memory pressure</span><strong>{memoryBank ? `${memoryBank.records.length}/${memoryBank.capacity}` : '0/0'}</strong>
          </div>
          <div class="memory-summary">
            <div>
              <span class="label">Success cards</span>
              <strong>{successMemoryCount}</strong>
            </div>
            <div>
              <span class="label">Failure cards</span>
              <strong>{failureMemoryCount}</strong>
            </div>
            <div>
              <span class="label">Compaction</span>
              <strong>L{memoryBank?.compactionLevel ?? 0}</strong>
            </div>
          </div>
          <div class="section-head secondary">
            <h3>Retrieval Preview</h3>
            <span>{retrievalPreview.length} candidates</span>
          </div>
          <div class="list">
            {#if retrievalPreview.length > 0}
              {#each retrievalPreview as candidate (candidate.record.id)}
                <article class="list-card">
                  <div class="list-head">
                    <strong>{candidate.record.title}</strong>
                    <span>{formatPercent(candidate.totalScore)}</span>
                  </div>
                  <p>{candidate.record.lesson}</p>
                  <small>
                    Sim {formatPercent(candidate.breakdown.similarity)} · Rec {formatPercent(candidate.breakdown.recency)} · Success {formatPercent(candidate.breakdown.success)}
                  </small>
                </article>
              {/each}
            {:else}
              <p class="empty-copy">No retrievable memory cards yet.</p>
            {/if}
          </div>
        </section>
      </PokemonFrame>

      <PokemonFrame variant="dark" padding="16px">
        <section class="panel">
          <div class="section-head">
            <h3>Training Queue</h3>
            <span>{trainingRuns.length} runs · {modelArtifacts.length} artifacts</span>
          </div>
          <div class="list">
            {#if trainingRuns.length > 0}
              {#each trainingRuns as run (run.id)}
                <article class="list-card">
                  <div class="list-head">
                    <strong>{run.type}</strong>
                    <span>{run.state}</span>
                  </div>
                  <p>{run.hypothesis}</p>
                  <small>{run.benchmarkPackId} · {run.changes.join(' / ') || 'No recorded delta'}</small>
                  {#if run.validationErrors.length > 0}
                    <div class="chips">
                      {#each run.validationErrors as error}
                        <span>{error}</span>
                      {/each}
                    </div>
                  {/if}
                  {#if run.resultArtifactId}
                    <small>Artifact {run.resultArtifactId}</small>
                  {/if}
                  {#if run.state === 'PROMOTABLE'}
                    <button type="button" class="secondary" onclick={() => promoteRun(run.id)}>Promote Candidate</button>
                  {/if}
                </article>
              {/each}
            {:else}
              <p class="empty-copy">No queued retraining yet. Start with prompt tuning or retrieval tuning after the next eval.</p>
            {/if}
          </div>
          <div class="section-head secondary">
            <h3>Prompt Variants</h3>
            <span>{promptVariants.length} saved</span>
          </div>
          <div class="chips">
            {#if promptVariants.length > 0}
              {#each promptVariants as variant (variant.id)}
                <span>{variant.label}</span>
              {/each}
            {:else}
              <span class="muted">No variant snapshots yet</span>
            {/if}
          </div>
        </section>
      </PokemonFrame>
    </section>

    <section class="grid two-up">
      <PokemonFrame variant="dark" padding="16px">
        <section class="panel">
          <div class="section-head">
            <h3>Memory Bank</h3>
            <span>{memoryRecords.length} recent cards</span>
          </div>
          <div class="list">
            {#if memoryRecords.length > 0}
              {#each memoryRecords as record (record.id)}
                <article class="memory-card">
                  <div class="list-head">
                    <strong>{record.title}</strong>
                    <span>{record.kind}</span>
                  </div>
                  <p>{record.summary}</p>
                  <small>{record.lesson}</small>
                  <div class="chips">
                    {#each record.tags.slice(0, 4) as tag}
                      <span>{tag}</span>
                    {/each}
                  </div>
                </article>
              {/each}
            {:else}
              <p class="empty-copy">No memory cards yet. Run an eval battle to generate reflection summaries.</p>
            {/if}
          </div>
        </section>
      </PokemonFrame>

      <PokemonFrame variant="dark" padding="16px">
        <section class="panel">
          <div class="section-head">
            <h3>Recent Evaluations</h3>
            <span>{recentAgentResults.length} matches</span>
          </div>
          <div class="list">
            {#if recentAgentResults.length > 0}
              {#each recentAgentResults as row (row.result.id)}
                <article class="list-card">
                  <div class="list-head">
                    <strong>{row.result.outcome}</strong>
                    <span>{formatDate(row.result.createdAt)}</span>
                  </div>
                  <p>{row.agentResult.reflection?.lesson ?? row.agentResult.reasoningSummary ?? row.result.lessons[0] ?? 'No lesson recorded.'}</p>
                  <div class="metric-row">
                    <span>{row.agentResult.action}</span>
                    <span>Conf {formatPercent(row.agentResult.confidence)}</span>
                    <span>XP +{row.agentResult.xpGain}</span>
                    <span>Bond +{row.agentResult.bondGain}</span>
                    <span>Total {formatPercent(row.result.teamMetrics.totalScore)}</span>
                  </div>
                  <small>Dataset {row.result.datasetBundleId ?? 'pending'} · {createEvalScenario(row.result.scenarioId, row.result.createdAt).label}</small>
                  {#if row.agentResult.failureMode}
                    <div class="chips">
                      <span>{row.agentResult.failureMode}</span>
                    </div>
                  {/if}
                  {#if row.agentResult.evidenceTitles && row.agentResult.evidenceTitles.length > 0}
                    <div class="chips">
                      {#each row.agentResult.evidenceTitles as title}
                        <span>{title}</span>
                      {/each}
                    </div>
                  {/if}
                </article>
              {/each}
            {:else}
              <p class="empty-copy">No evaluation history for this agent yet.</p>
            {/if}
          </div>
        </section>
      </PokemonFrame>
    </section>

    <PokemonFrame variant="dark" padding="16px">
      <section class="panel">
        <div class="section-head">
          <h3>Recommended Next Step</h3>
          <span>Operator Guidance</span>
        </div>
        <p class="next-step">{recommendedNextStep}</p>
      </section>
    </PokemonFrame>
  {:else}
    <PokemonFrame variant="dark" padding="18px">
      <section class="empty-state">
        <p class="eyebrow">AGENT CONSOLE</p>
        <h1>Owned agent not found</h1>
        <p>이 id는 현재 로스터에 없습니다. 로스터에서 개체를 다시 선택한 뒤 상세 화면으로 진입하세요.</p>
        <div class="header-actions">
          <a href="/roster">Back To Roster</a>
          <a href="/team">Open Team</a>
        </div>
      </section>
    </PokemonFrame>
  {/if}
</div>

<style>
  .page {
    display: grid;
    gap: 18px;
    padding: 18px;
  }

  .header,
  .section-head,
  .list-head,
  .hero-title-row,
  .progress-meta {
    display: flex;
    justify-content: space-between;
    gap: 14px;
    align-items: end;
  }

  .header {
    align-items: flex-end;
  }

  .eyebrow,
  .label,
  .section-head span,
  .list-head span,
  .kv-grid span,
  .metric-row span,
  .memory-summary span {
    color: var(--text-2);
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
    letter-spacing: 0.08em;
  }

  h1,
  h2,
  h3 {
    margin: 0;
    font-family: 'Orbitron', sans-serif;
  }

  h1 {
    margin-top: 6px;
    font-size: clamp(38px, 6vw, 72px);
    line-height: 0.9;
  }

  h2 {
    font-size: clamp(28px, 4vw, 42px);
    line-height: 0.95;
  }

  h3 {
    font-size: 22px;
  }

  .lede,
  .hero-description,
  .stack p,
  .list p,
  .next-step,
  .empty-state p:last-of-type {
    margin: 0;
    color: var(--text-1);
    line-height: 1.5;
  }

  .header-actions,
  .hero-badges,
  .chips,
  .metric-row {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .header-actions a,
  .chips span {
    display: inline-flex;
    align-items: center;
    min-height: 38px;
    padding: 0 12px;
    border-radius: 999px;
    border: 1px solid rgba(255,255,255,0.1);
    background: rgba(255,255,255,0.04);
    color: var(--text-0);
    text-decoration: none;
  }

  .hero-grid,
  .two-up {
    display: grid;
    grid-template-columns: minmax(0, 1.25fr) minmax(320px, 0.95fr);
    gap: 16px;
  }

  .hero {
    display: grid;
    grid-template-columns: 220px minmax(0, 1fr);
    gap: 18px;
    align-items: center;
  }

  .hero-art {
    display: grid;
    place-items: center;
    min-height: 220px;
    border-radius: 28px;
    background:
      radial-gradient(circle at 50% 35%, rgba(255,255,255,0.08), transparent 54%),
      linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01));
    border: 1px solid rgba(255,255,255,0.08);
  }

  .hero-sprite {
    display: grid;
    place-items: center;
    width: 164px;
    aspect-ratio: 1;
    border-radius: 36px;
    background:
      radial-gradient(circle at 35% 30%, var(--agent-color), transparent 48%),
      linear-gradient(145deg, rgba(255,255,255,0.08), rgba(0,0,0,0.28)),
      var(--agent-accent);
    border: 1px solid rgba(255,255,255,0.1);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.25);
  }

  .hero-sprite span {
    font-family: 'Orbitron', sans-serif;
    font-size: 48px;
    font-weight: 700;
    letter-spacing: 0.08em;
  }

  .hero-copy {
    display: grid;
    gap: 14px;
  }

  .status-pill,
  .hero-badges span {
    display: inline-flex;
    align-items: center;
    min-height: 30px;
    padding: 0 10px;
    border-radius: 999px;
    border: 1px solid rgba(255,255,255,0.1);
    background: rgba(255,255,255,0.04);
    font-size: 12px;
  }

  .hero-badges .active {
    border-color: rgba(0, 229, 255, 0.3);
    background: rgba(0, 229, 255, 0.12);
    color: #a6f5ff;
  }

  .progress-block,
  .summary-stack,
  .panel,
  .stack,
  .list,
  .empty-state {
    display: grid;
    gap: 12px;
  }

  .progress-bar {
    height: 10px;
    border-radius: 999px;
    background: rgba(255,255,255,0.08);
    overflow: hidden;
  }

  .progress-fill {
    height: 100%;
    border-radius: 999px;
  }

  .kv-grid {
    display: grid;
    grid-template-columns: minmax(110px, 0.9fr) minmax(0, 1.1fr);
    gap: 10px 14px;
  }

  .kv-grid strong {
    font-size: 14px;
    line-height: 1.45;
  }

  .form-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
  }

  .field {
    display: grid;
    gap: 6px;
  }

  .field.full {
    grid-column: 1 / -1;
  }

  .field input,
  .field select,
  .field textarea {
    width: 100%;
    border-radius: 12px;
    border: 1px solid rgba(255,255,255,0.1);
    background: rgba(255,255,255,0.04);
    color: var(--text-0);
    padding: 10px 12px;
    font: inherit;
    resize: vertical;
  }

  .field textarea {
    min-height: 96px;
  }

  .form-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    align-items: center;
  }

  button,
  .secondary {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-height: 40px;
    padding: 0 14px;
    border-radius: 14px;
    border: 1px solid rgba(255,255,255,0.1);
    background: rgba(255,255,255,0.05);
    color: var(--text-0);
    cursor: pointer;
    font: inherit;
  }

  button.secondary {
    background: rgba(0,229,255,0.05);
  }

  .checklist-group,
  .checklist,
  .action-card {
    display: grid;
    gap: 10px;
  }

  .check-item {
    display: flex;
    align-items: center;
    gap: 10px;
    min-height: 40px;
    padding: 10px 12px;
    border-radius: 12px;
    border: 1px solid rgba(255,255,255,0.08);
    background: rgba(255,255,255,0.03);
  }

  .three-up {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 16px;
  }

  .action-card {
    padding: 14px;
    border-radius: 18px;
    border: 1px solid rgba(255,255,255,0.08);
    background: rgba(255,255,255,0.03);
    align-content: start;
  }

  .list-card,
  .memory-card {
    display: grid;
    gap: 8px;
    padding: 14px;
    border-radius: 18px;
    border: 1px solid rgba(255,255,255,0.08);
    background: rgba(255,255,255,0.03);
  }

  .list-card p,
  .memory-card p,
  .memory-card small {
    margin: 0;
  }

  .list-card small,
  .memory-card small {
    color: var(--text-2);
    line-height: 1.45;
  }

  .memory-summary {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 10px;
    padding-top: 10px;
    border-top: 1px solid rgba(255,255,255,0.08);
  }

  .memory-summary div {
    display: grid;
    gap: 4px;
  }

  .memory-summary strong {
    font-size: 18px;
  }

  .secondary {
    padding-top: 8px;
    border-top: 1px solid rgba(255,255,255,0.08);
  }

  .muted,
  .empty-copy {
    color: var(--text-2);
  }

  .next-step {
    max-width: 88ch;
  }

  @media (max-width: 1080px) {
    .hero-grid,
    .two-up,
    .hero,
    .three-up,
    .form-grid {
      grid-template-columns: 1fr;
    }

    .hero-art {
      min-height: 180px;
    }
  }

  @media (max-width: 720px) {
    .page {
      padding: 14px;
    }

    .header,
    .section-head,
    .list-head,
    .hero-title-row,
    .progress-meta {
      flex-direction: column;
      align-items: stretch;
    }

    .memory-summary {
      grid-template-columns: 1fr;
    }
  }
</style>
