<script lang="ts">
  import type { EvalComparison } from '$lib/types';

  let { comparison, title }: { comparison: EvalComparison; title: string } = $props();

  const rows = [
    { key: 'totalScore', label: 'Total' },
    { key: 'accuracyScore', label: 'Accuracy' },
    { key: 'reasoningScore', label: 'Reasoning' },
    { key: 'riskScore', label: 'Risk' },
    { key: 'coordinationScore', label: 'Coordination' },
    { key: 'retrievalScore', label: 'Retrieval' },
  ] as const;
</script>

<section class="compare panel">
  <div class="compare__head">
    <div>
      <p class="section-kicker">{comparison.scenario.label}</p>
      <h3>{title}</h3>
    </div>
    <div class="chip-row">
      <span class="chip">{comparison.scenario.symbol} / {comparison.scenario.timeframe}</span>
      <span class="chip">{comparison.scenario.targetAction}</span>
    </div>
  </div>

  <p class="compare__summary">{comparison.summary}</p>

  <div class="chip-row">
    <span class={`chip chip--${comparison.decision.toLowerCase()}`}>{comparison.decision}</span>
    <span class="chip">Weak link: {comparison.proposed.weakLink}</span>
    <span class="chip">Proof: {comparison.proposed.proofFrameTitle}</span>
  </div>

  <div class="compare__table">
    <div class="compare__row compare__row--head">
      <span>Metric</span>
      <span>Current</span>
      <span>Proposed</span>
      <span>Delta</span>
    </div>
    {#each rows as row}
      <div class="compare__row">
        <span>{row.label}</span>
        <span>{comparison.current[row.key]}</span>
        <span>{comparison.proposed[row.key]}</span>
        <span class:positive={comparison.deltas[row.key] > 0} class:negative={comparison.deltas[row.key] < 0}>
          {comparison.deltas[row.key] > 0 ? '+' : ''}{comparison.deltas[row.key]}
        </span>
      </div>
    {/each}
  </div>

  <div class="grid-2">
    <div class="metric-card">
      <small>Battle read</small>
      <strong>{comparison.proposed.battleRead}</strong>
    </div>
    <div class="metric-card">
      <small>Retrieval read</small>
      <strong>{comparison.proposed.retrievalRead}</strong>
    </div>
  </div>

  <div class="grid-2">
    <div class="metric-card">
      <small>Captain call</small>
      <strong>{comparison.proposed.captainCall}</strong>
      <p>{comparison.proposed.objection}</p>
    </div>
    <div class="metric-card">
      <small>Mutation review</small>
      <strong>{comparison.decisionReason}</strong>
      <p>{comparison.visibleEffect}</p>
    </div>
  </div>

  <div class="chip-row">
    {#each comparison.proposed.trustedInstincts.slice(0, 4) as instinct}
      <span class={`chip chip--instinct chip--${instinct.state.toLowerCase()}`}>{instinct.label} {instinct.weight}</span>
    {/each}
  </div>
</section>

<style>
  .compare {
    padding: 20px;
    display: grid;
    gap: 16px;
  }

  .compare__head {
    display: flex;
    gap: 12px;
    justify-content: space-between;
    flex-wrap: wrap;
    align-items: center;
  }

  .compare__head h3,
  .compare__summary {
    margin: 0;
  }

  .compare__summary {
    color: var(--text-soft);
  }

  .compare__table {
    display: grid;
    gap: 10px;
  }

  .compare__row {
    display: grid;
    grid-template-columns: 1.4fr repeat(3, minmax(0, 1fr));
    gap: 10px;
    padding: 12px 14px;
    border-radius: 16px;
    background: rgba(255, 255, 255, 0.58);
    border: 1px solid var(--border);
  }

  .compare__row--head {
    font-size: 0.82rem;
    color: var(--text-soft);
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }

  .positive {
    color: var(--accent);
    font-weight: 700;
  }

  .negative {
    color: var(--danger);
    font-weight: 700;
  }

  .chip--accepted {
    background: rgba(220, 236, 223, 0.9);
    color: #1f4c3b;
  }

  .chip--reverted {
    background: rgba(245, 223, 218, 0.9);
    color: #8a3c2c;
  }

  .chip--quarantined {
    background: rgba(244, 232, 208, 0.92);
    color: #7b5a1d;
  }

  .chip--trusted {
    border-color: rgba(47, 108, 88, 0.28);
  }

  .chip--weak {
    border-color: rgba(170, 93, 72, 0.28);
  }

  @media (max-width: 760px) {
    .compare__row {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }
</style>
