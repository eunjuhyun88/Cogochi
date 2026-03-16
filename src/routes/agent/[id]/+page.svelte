<script lang="ts">
  import AgentSpriteCard from '$components/shared/AgentSpriteCard.svelte';
  import ComparePanel from '$components/shared/ComparePanel.svelte';
  import PageShell from '$components/shared/PageShell.svelte';
  import { careStateLabels, growthStageLabels, homeStyleLabels, memorySourceLabels, memoryTierLabels } from '$lib/data/seed';
  import { compareLoadouts, evaluateAgentLoadout } from '$lib/engine/eval-engine';
  import { buildMemoryTierSummary } from '$lib/services/memory/writeback';
  import { labStore } from '$lib/stores/labStore';
  import { rosterStore } from '$lib/stores/rosterStore';
  import type { PageData } from './$types';

  let { data }: { data: PageData } = $props();

  const agent = $derived(rosterStore.getAgent(data.agentId));
  const scenarioId = $derived($labStore.activeScenarioId);
  const draft = $derived(agent ? labStore.getDraft(agent.id) : null);
  const pendingComparison = $derived(
    agent && draft ? compareLoadouts(agent, agent.loadout, draft, scenarioId) : null,
  );
  const committedReport = $derived(
    agent ? evaluateAgentLoadout(agent, agent.loadout, scenarioId) : null,
  );
  const memorySummary = $derived(agent ? buildMemoryTierSummary(agent.memoryBank) : null);
</script>

<PageShell>
  {#if agent}
    <section class="grid-2">
      <div class="stack">
        <AgentSpriteCard {agent} />
        <article class="panel detail-panel">
          <div class="stack">
            <div>
              <p class="section-kicker">Brain garden</p>
              <h2 class="section-title">Trusted instincts, weak link, and captain read</h2>
            </div>
            <div class="chip-row">
              <span class="chip">{agent.loadout.indicatorPresetId.replaceAll('_', ' ')}</span>
              <span class="chip">{agent.loadout.scriptPresetId.replaceAll('_', ' ')}</span>
              <span class="chip">{agent.loadout.memoryBias.toLowerCase()}</span>
              <span class="chip">Trust {agent.trustWeight}</span>
              <span class="chip">risk {agent.loadout.riskTolerance}</span>
              <span class="chip">{agent.loadout.confidenceStyle.toLowerCase()}</span>
              <span class="chip">{growthStageLabels[agent.growthStage]}</span>
              <span class="chip">{careStateLabels[agent.careState]}</span>
              <span class="chip">{homeStyleLabels[agent.homeStyle]}</span>
            </div>
            <div class="metric-grid">
              {#if committedReport}
                <div class="metric-card">
                  <small>Total score</small>
                  <strong>{committedReport.totalScore}</strong>
                </div>
                <div class="metric-card">
                  <small>Reasoning</small>
                  <strong>{committedReport.reasoningScore}</strong>
                </div>
                <div class="metric-card">
                  <small>Retrieval</small>
                  <strong>{committedReport.retrievalScore}</strong>
                </div>
                <div class="metric-card">
                  <small>Keepsakes</small>
                  <strong>{agent.keepsakes.length}</strong>
                </div>
              {/if}
            </div>
            <div class="metric-card">
              <small>Current weak link</small>
              <strong>{agent.weakLink}</strong>
              <p>{agent.lastComparison?.proposed.objection ?? 'The squad still needs one cleaner proof run before this instinct settles.'}</p>
            </div>
            <div class="chip-row">
              {#each agent.trustedInstincts as instinct}
                <span class={`chip chip--instinct chip--${instinct.state.toLowerCase()}`}>{instinct.label} {instinct.weight}</span>
              {/each}
            </div>
            <p>{agent.loadout.doctrineNote}</p>
            <div class="metric-card">
              <small>Next care action</small>
              <strong>{agent.nextCareAction}</strong>
            </div>
            <div class="metric-card">
              <small>Saved presence</small>
              <strong>{homeStyleLabels[agent.homeStyle]}</strong>
              <p>{agent.recentCareSummary}</p>
            </div>
            <div class="chip-row">
              <a class="link-button" href="/proof">Open proof</a>
              <a class="link-button secondary" href={`/passport/${agent.id}`}>Open passport</a>
              <a class="link-button secondary" href="/battle">Run battle</a>
              <a class="link-button" href={`/lab?agent=${agent.id}`}>Open lab</a>
              <a class="link-button ghost" href="/roster">Back to roster</a>
            </div>
          </div>
        </article>
      </div>

      <article class="panel detail-panel">
        <div class="stack">
          <div>
            <p class="section-kicker">Memory bank</p>
            <h2 class="section-title">What the agent retrieves</h2>
          </div>
          {#if memorySummary}
            <div class="chip-row">
              {#each Object.entries(memorySummary) as [tier, total]}
                <span class="chip">{memoryTierLabels[tier as keyof typeof memoryTierLabels]} {total}</span>
              {/each}
            </div>
          {/if}
          {#each agent.memoryBank as memory}
            <div class="metric-card">
              <small>
                {memory.type.replace('_', ' ')}
                /
                {memoryTierLabels[memory.tier ?? 'M30']}
                /
                {memorySourceLabels[memory.source ?? 'SEED']}
              </small>
              <strong>{memory.title}</strong>
              <p>{memory.note}</p>
            </div>
          {/each}
          <div>
            <p class="section-kicker">Proven frames</p>
            <h2 class="section-title">Where this build has been tested</h2>
          </div>
          {#each agent.provenFrames as frame}
            <div class="metric-card">
              <small>{frame.result} / {frame.dateLabel}</small>
              <strong>{frame.title}</strong>
              <p>{frame.note}</p>
            </div>
          {/each}
          <div>
            <p class="section-kicker">Keepsakes</p>
            <h2 class="section-title">Visible growth</h2>
          </div>
          <div class="chip-row">
            {#if agent.keepsakes.length > 0}
              {#each agent.keepsakes as keepsake}
                <span class="chip">{keepsake}</span>
              {/each}
            {:else}
              <span class="chip">No keepsakes yet</span>
            {/if}
          </div>
        </div>
      </article>
    </section>

    <section class="grid-2 mutation-grid">
      <article class="panel detail-panel">
        <div class="stack">
          <div>
            <p class="section-kicker">Evolution log</p>
            <h2 class="section-title">Accepted, reverted, and quarantined mutations</h2>
          </div>
          {#each agent.mutations as mutation}
            <div class={`mutation-card mutation-card--${mutation.decision.toLowerCase()}`}>
              <small>{mutation.decision} / {mutation.proofFrameTitle}</small>
              <strong>{mutation.title}</strong>
              <p>{mutation.reason}</p>
              <p class="mutation-card__effect">{mutation.visibleEffect}</p>
            </div>
          {/each}
        </div>
      </article>

      <article class="panel detail-panel">
        <div class="stack">
          <div>
            <p class="section-kicker">Mutation bench</p>
            <h2 class="section-title">What the next proof should attack</h2>
          </div>
          <div class="metric-card">
            <small>Suggested next target</small>
            <strong>{agent.weakLink}</strong>
            <p>{agent.lastComparison?.decisionReason ?? 'The next mutation should focus on the weakest instinct on the board.'}</p>
          </div>
          <div class="metric-card">
            <small>Last proof frame</small>
            <strong>{agent.lastComparison?.proposed.proofFrameTitle ?? agent.provenFrames[0]?.title ?? 'No proof frame yet'}</strong>
            <p>{agent.lastComparison?.visibleEffect ?? 'Accepted mutations should change both body and battle explanation.'}</p>
          </div>
          <div class="chip-row">
            <a class="link-button" href={`/lab?agent=${agent.id}`}>Open mutation bench</a>
            <a class="link-button secondary" href="/proof">Run proof pack</a>
            <a class="link-button ghost" href={`/passport/${agent.id}`}>View passport</a>
          </div>
        </div>
      </article>
    </section>

    {#if pendingComparison}
      <section class="compare-wrap">
        <ComparePanel comparison={pendingComparison} title="Pending before / after compare" />
      </section>
    {/if}

    {#if agent.lastComparison}
      <section class="compare-wrap">
        <ComparePanel comparison={agent.lastComparison} title="Last committed training result" />
      </section>
    {/if}
  {:else}
    <article class="panel detail-panel">
      <h1 class="section-title">Agent not found</h1>
      <a class="link-button secondary" href="/roster">Back to roster</a>
    </article>
  {/if}
</PageShell>

<style>
  .detail-panel {
    padding: 22px;
  }

  .detail-panel h2,
  .detail-panel p {
    margin: 0;
  }

  .compare-wrap {
    margin-top: 18px;
  }

  .mutation-grid {
    margin-top: 18px;
  }

  .mutation-card {
    padding: 16px;
    border-radius: 18px;
    border: 1px solid var(--border);
    background: rgba(255, 255, 255, 0.68);
  }

  .mutation-card strong,
  .mutation-card p,
  .mutation-card small {
    display: block;
    margin: 0;
  }

  .mutation-card strong {
    margin: 8px 0;
  }

  .mutation-card p {
    color: var(--text-soft);
    line-height: 1.5;
  }

  .mutation-card__effect {
    margin-top: 8px;
  }

  .mutation-card--accepted {
    border-color: rgba(52, 155, 104, 0.24);
  }

  .mutation-card--reverted {
    border-color: rgba(170, 93, 72, 0.28);
  }

  .mutation-card--quarantined {
    border-color: rgba(191, 141, 66, 0.28);
  }

  .chip--trusted {
    border-color: rgba(47, 108, 88, 0.28);
  }

  .chip--weak {
    border-color: rgba(170, 93, 72, 0.28);
  }
</style>
