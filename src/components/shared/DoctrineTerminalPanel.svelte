<script lang="ts">
  import DoctrineOverlayPreview from '$components/shared/DoctrineOverlayPreview.svelte';
  import { labStore } from '$lib/stores/labStore';
  import type { DoctrineSession, DoctrineTerminalResult } from '$lib/types';

  let { agentId, agentName, quickPrompts = [] }: { agentId: string; agentName: string; quickPrompts?: string[] } = $props();

  let prompt = $state('');
  let loading = $state(false);
  let error = $state('');
  let notice = $state('');
  let result = $state<DoctrineSession | DoctrineTerminalResult | null>(null);
  let previewFrameId = $state('');

  const activeSessionId = $derived.by(() => (agentId ? $labStore.activeDoctrineSessionIds[agentId] ?? null : null));
  const doctrineSessions = $derived.by(() => {
    $labStore;
    return agentId ? labStore.getDoctrineSessions(agentId) : [];
  });
  const selectedPreviewFrameId = $derived(previewFrameId || result?.evidenceFrames[0]?.id || '');
  const proofHref = $derived.by(() => {
    if (!agentId || !result) {
      return '/proof';
    }

    const params = new URLSearchParams({
      agent: agentId,
      session: result.id,
    });
    if (result.recommendedProofPackId) {
      params.set('pack', result.recommendedProofPackId);
    }
    return `/proof?${params.toString()}`;
  });

  $effect(() => {
    if (!result) {
      previewFrameId = '';
      return;
    }

    const availableFrameIds = result.evidenceFrames.map((frame) => frame.id);
    if (!availableFrameIds.includes(previewFrameId)) {
      previewFrameId = availableFrameIds[0] ?? '';
    }
  });

  async function runPrompt(nextPrompt?: string) {
    const requestedPrompt = (nextPrompt ?? prompt).trim();
    if (!requestedPrompt || !agentId) {
      return;
    }

    prompt = requestedPrompt;
    loading = true;
    error = '';
    notice = '';

    try {
      const response = await fetch('/api/doctrine-terminal', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ prompt: requestedPrompt }),
      });
      const payload = (await response.json()) as DoctrineTerminalResult | { error: string };
      if (!response.ok || 'error' in payload) {
        throw new Error('error' in payload ? payload.error : 'The doctrine terminal failed to respond.');
      }

      const session = labStore.saveDoctrineSession(agentId, payload);
      result = session;
      notice = `${session.title} saved to ${agentName}.`;
    } catch (exception) {
      error = exception instanceof Error ? exception.message : 'Unknown doctrine terminal error.';
    } finally {
      loading = false;
    }
  }

  function openSession(sessionId: string) {
    if (!agentId) {
      return;
    }

    const session = labStore.getDoctrineSession(agentId, sessionId);
    if (!session) {
      return;
    }
    labStore.setActiveDoctrineSession(agentId, sessionId);
    result = session;
    notice = `${session.title} reloaded from doctrine history.`;
    error = '';
  }

  function bindResult() {
    if (!agentId || !result) {
      return;
    }

    const session = labStore.bindDoctrineSession(agentId, result.id);
    if (!session) {
      error = 'No doctrine session could be bound to the draft.';
      return;
    }

    result = labStore.getDoctrineSession(agentId, session.id);
    notice = `${session.title} is now bound to the mutation draft.`;
    error = '';
  }

  async function copyPineDraft() {
    if (!result?.pineDraft) {
      return;
    }
    await navigator.clipboard.writeText(result.pineDraft.code).catch(() => undefined);
    notice = 'Pine draft copied.';
  }
</script>

<article class="panel terminal-panel">
  <div class="terminal-shell">
    <div class="terminal-head">
      <div>
        <p class="section-kicker">Doctrine Terminal</p>
        <h2 class="section-title">Ask for the setup you want, then bind it to proof.</h2>
      </div>
      <div class="chip-row">
        <span class="chip">Agent {agentName}</span>
        {#if activeSessionId}
          <span class="chip chip--quiet">Bound session active</span>
        {/if}
      </div>
    </div>

    <p class="terminal-copy">
      Natural-language prompts become criteria, overlay layers, and exportable Pine drafts. The app runtime still
      trusts the internal overlay spec, then hands the candidate to proof before any mutation survives.
    </p>

    <div class="quick-row">
      {#each quickPrompts as quickPrompt}
        <button class="quick-chip" type="button" onclick={() => runPrompt(quickPrompt)}>{quickPrompt}</button>
      {/each}
    </div>

    <div class="input-row">
      <input
        bind:value={prompt}
        class="terminal-input"
        placeholder='예: "BTC에서 OI 과열 + CVD 다이버전스 구간 찾아줘"'
        onkeydown={(event) => {
          if (event.key === 'Enter') {
            runPrompt();
          }
        }}
      />
      <button class="action-button" disabled={loading} onclick={() => runPrompt()}>
        {loading ? 'Thinking…' : 'Run prompt'}
      </button>
    </div>

    {#if error}
      <p class="terminal-error">{error}</p>
    {/if}

    {#if notice}
      <p class="terminal-notice">{notice}</p>
    {/if}

    <div class="terminal-grid">
      <section class="terminal-column">
        <div class="metric-card terminal-card">
          <small>Saved doctrine sessions</small>
          {#if doctrineSessions.length > 0}
            <div class="session-list">
              {#each doctrineSessions as session}
                <button
                  class:session-entry--active={activeSessionId === session.id}
                  class="session-entry"
                  type="button"
                  onclick={() => openSession(session.id)}
                >
                  <strong>{session.title}</strong>
                  <span>{session.status}</span>
                  <p>{session.normalizedIntent}</p>
                </button>
              {/each}
            </div>
          {:else}
            <p>No doctrine session yet. Start with one natural-language request.</p>
          {/if}
        </div>
      </section>

      <section class="terminal-column terminal-column--wide">
        {#if result}
          <div class="result-stack">
            <div class="metric-card terminal-card">
              <small>Preview on historical frame</small>
              <DoctrineOverlayPreview overlaySpec={result.overlaySpec} frameId={selectedPreviewFrameId} />
              <div class="frame-chip-row">
                {#each result.evidenceFrames as frame}
                  <button
                    class:frame-chip--active={selectedPreviewFrameId === frame.id}
                    class="frame-chip"
                    type="button"
                    onclick={() => {
                      previewFrameId = frame.id;
                    }}
                  >
                    {frame.title}
                  </button>
                {/each}
              </div>
            </div>

            <div class="metric-card terminal-card">
              <small>Normalized intent</small>
              <strong>{result.title}</strong>
              <p>{result.normalizedIntent}</p>
              <div class="chip-row">
                {#if result.recommendedProofPackId}
                  <span class="chip chip--quiet">Proof pack {result.recommendedProofPackId}</span>
                {/if}
                <a class="link-button secondary" href={proofHref}>Open proof handoff</a>
              </div>
            </div>

            <div class="grid-2 terminal-subgrid">
              <div class="metric-card terminal-card">
                <small>Criteria summary</small>
                <div class="journal-list">
                  {#each result.criteriaSummary as criterion}
                    <p>{criterion}</p>
                  {/each}
                </div>
              </div>

              <div class="metric-card terminal-card">
                <small>Design rationale</small>
                <div class="journal-list">
                  {#each result.explanation as explanation}
                    <p>{explanation}</p>
                  {/each}
                </div>
              </div>
            </div>

            <div class="grid-2 terminal-subgrid">
              <div class="metric-card terminal-card">
                <small>Overlay spec</small>
                <strong>{result.overlaySpec.title}</strong>
                <p>{result.overlaySpec.summary}</p>
                <div class="overlay-list">
                  {#each result.overlaySpec.layers as layer}
                    <div class={`overlay-item overlay-item--${layer.tone.toLowerCase()}`}>
                      <div class="overlay-head">
                        <strong>{layer.label}</strong>
                        <span>{layer.kind}</span>
                      </div>
                      <p>{layer.rule}</p>
                      <small>{layer.detail}</small>
                    </div>
                  {/each}
                </div>
              </div>

              <div class="metric-card terminal-card">
                <small>Pine export draft</small>
                {#if result.pineDraft}
                  <strong>{result.pineDraft.title}</strong>
                  <div class="code-block">{result.pineDraft.code}</div>
                  <div class="journal-list">
                    {#each result.pineDraft.notes as note}
                      <p>{note}</p>
                    {/each}
                  </div>
                {:else}
                  <p>No Pine draft generated for this session.</p>
                {/if}
              </div>
            </div>

            <div class="grid-2 terminal-subgrid">
              <div class="metric-card terminal-card">
                <small>Suggested evidence frames</small>
                <div class="session-list">
                  {#each result.evidenceFrames as frame}
                    <div class="session-entry session-entry--static">
                      <strong>{frame.title}</strong>
                      <span>{frame.dateLabel}</span>
                      <p>{frame.note}</p>
                    </div>
                  {/each}
                </div>
              </div>

              <div class="metric-card terminal-card">
                <small>Suggested draft mutation</small>
                <div class="chip-row">
                  {#if result.suggestedLoadout.indicatorPresetId}
                    <span class="chip">{result.suggestedLoadout.indicatorPresetId}</span>
                  {/if}
                  {#if result.suggestedLoadout.scriptPresetId}
                    <span class="chip">{result.suggestedLoadout.scriptPresetId}</span>
                  {/if}
                  {#if result.suggestedLoadout.memoryBias}
                    <span class="chip">{result.suggestedLoadout.memoryBias}</span>
                  {/if}
                  {#if result.suggestedLoadout.confidenceStyle}
                    <span class="chip">{result.suggestedLoadout.confidenceStyle}</span>
                  {/if}
                </div>
                <p>{result.suggestedLoadout.doctrineNote ?? 'No doctrine note rewrite proposed.'}</p>
                <div class="chip-row">
                  <button class="action-button" type="button" onclick={bindResult}>Bind to mutation draft</button>
                  <button class="action-button secondary" disabled={!result.pineDraft} type="button" onclick={copyPineDraft}>
                    Copy Pine draft
                  </button>
                  <a class="link-button secondary" href={proofHref}>Open proof</a>
                </div>
              </div>
            </div>
          </div>
        {:else}
          <div class="metric-card terminal-card">
            <small>Doctrine terminal</small>
            <strong>No candidate yet</strong>
            <p>Run one prompt to generate criteria, overlay layers, evidence frames, and a mutation-ready doctrine draft.</p>
          </div>
        {/if}
      </section>
    </div>
  </div>
</article>

<style>
  .terminal-panel {
    padding: 22px;
  }

  .terminal-shell,
  .result-stack,
  .terminal-column {
    display: grid;
    gap: 16px;
  }

  .terminal-head,
  .input-row,
  .overlay-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }

  .terminal-copy,
  .terminal-notice,
  .terminal-error,
  .session-entry p,
  .overlay-item p,
  .overlay-item small,
  .code-block,
  .metric-card p {
    font-size: 0.9rem;
    line-height: 1.6;
  }

  .terminal-notice {
    color: var(--accent-olive-700);
  }

  .terminal-error {
    color: #b44c4c;
  }

  .quick-row,
  .terminal-grid,
  .terminal-subgrid,
  .overlay-list,
  .session-list {
    display: grid;
    gap: 10px;
  }

  .frame-chip-row {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin-top: 12px;
  }

  .quick-row {
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  }

  .terminal-grid {
    grid-template-columns: minmax(220px, 280px) minmax(0, 1fr);
    align-items: start;
  }

  .terminal-column--wide {
    min-width: 0;
  }

  .quick-chip,
  .session-entry {
    width: 100%;
    text-align: left;
    border: 1px solid rgba(39, 56, 34, 0.14);
    background: rgba(248, 250, 242, 0.92);
    border-radius: 18px;
    padding: 10px 14px;
    color: inherit;
    font: inherit;
    cursor: pointer;
  }

  .frame-chip {
    border: 1px solid rgba(39, 56, 34, 0.14);
    background: rgba(255, 255, 255, 0.7);
    border-radius: 999px;
    padding: 8px 12px;
    color: inherit;
    font: inherit;
    cursor: pointer;
    transition: border-color 120ms ease, transform 120ms ease, background 120ms ease;
  }

  .session-entry {
    border-radius: 20px;
  }

  .session-entry strong,
  .overlay-item strong {
    display: block;
    margin-bottom: 4px;
  }

  .session-entry span {
    display: inline-flex;
    margin-bottom: 6px;
    font-size: 0.72rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: rgba(39, 56, 34, 0.6);
  }

  .session-entry--active {
    border-color: rgba(99, 143, 91, 0.45);
    background: rgba(233, 243, 222, 0.92);
  }

  .frame-chip--active {
    border-color: rgba(99, 143, 91, 0.45);
    background: rgba(233, 243, 222, 0.92);
    transform: translateY(-1px);
  }

  .session-entry--static {
    cursor: default;
  }

  .terminal-input {
    width: 100%;
    border-radius: 16px;
    border: 1px solid rgba(39, 56, 34, 0.12);
    background: rgba(255, 255, 255, 0.8);
    padding: 14px 16px;
    font: inherit;
    color: inherit;
  }

  .terminal-card {
    background: rgba(248, 250, 242, 0.92);
  }

  .code-block {
    white-space: pre-wrap;
    background: rgba(33, 42, 30, 0.9);
    color: #d2efe1;
    border-radius: 18px;
    padding: 14px;
    overflow-x: auto;
  }

  .overlay-item {
    border-radius: 18px;
    padding: 12px 14px;
    border: 1px solid rgba(39, 56, 34, 0.12);
    background: rgba(255, 255, 255, 0.74);
  }

  .overlay-item--bear {
    border-color: rgba(180, 76, 76, 0.3);
    background: rgba(249, 237, 237, 0.9);
  }

  .overlay-item--warn {
    border-color: rgba(214, 154, 50, 0.32);
    background: rgba(252, 245, 226, 0.94);
  }

  .overlay-item--info {
    border-color: rgba(95, 129, 201, 0.3);
    background: rgba(235, 242, 252, 0.92);
  }

  .overlay-item--bull {
    border-color: rgba(99, 143, 91, 0.28);
    background: rgba(236, 247, 232, 0.92);
  }

  .overlay-item--neutral {
    border-color: rgba(39, 56, 34, 0.12);
  }

  @media (max-width: 980px) {
    .terminal-grid,
    .terminal-subgrid {
      grid-template-columns: 1fr;
    }
  }
</style>
