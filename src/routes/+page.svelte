<script lang="ts">
  import PageShell from '$components/shared/PageShell.svelte';
  import { evalScenarios, trainerSummarySeed } from '$lib/data/seed';
  import { rosterStore } from '$lib/stores/rosterStore';

  const trainer = trainerSummarySeed;
</script>

<PageShell>
  <section class="grid-2">
    <article class="panel hero">
      <div class="stack">
        <p class="section-kicker">Trainer Hub</p>
        <h1>Raise your own chart agent and prove the setup works.</h1>
        <p class="hero__lede">
          Cogochi is now wired around one concrete loop: choose an owned agent, tune your indicator profile,
          script rule, doctrine, and memory bias, then compare the same historical scenario before and after.
        </p>
        <div class="chip-row">
          <span class="chip">{trainer.trainerName}</span>
          <span class="chip">{trainer.streakLabel}</span>
          <span class="chip">{trainer.focus}</span>
        </div>
        <div class="hero__actions">
          <a class="link-button" href="/field">Enter field</a>
          <a class="link-button secondary" href="/proof">Open proof</a>
          <a class="link-button secondary" href="/passport">Open passport</a>
          <a class="link-button secondary" href="/roster">Open roster</a>
          <a class="link-button ghost" href="/lab">Tune in lab</a>
        </div>
      </div>
    </article>

    <article class="panel hero hero--quiet">
      <div class="stack">
        <p class="section-kicker">Founder Goal</p>
        <h2>Personal doctrine -> dino squad travel -> controlled evaluation -> visible capability change.</h2>
        <div class="metric-grid">
          <div class="metric-card">
            <small>Owned agents</small>
            <strong>{$rosterStore.agents.length}</strong>
          </div>
          <div class="metric-card">
            <small>Recent compares</small>
            <strong>{$rosterStore.recentComparisons.length}</strong>
          </div>
          <div class="metric-card">
            <small>Next scenario</small>
            <strong>{evalScenarios.find((scenario) => scenario.id === trainer.activeScenarioId)?.label}</strong>
          </div>
        </div>
      </div>
    </article>
  </section>

  <section class="grid-3 lower-grid">
    {#each evalScenarios as scenario}
      <article class="panel scenario-card">
        <p class="section-kicker">{scenario.symbol} / {scenario.timeframe}</p>
        <h3>{scenario.label}</h3>
        <p>{scenario.objective}</p>
        <p class="scenario-card__hint">Hint: {scenario.structureHint}</p>
      </article>
    {/each}
  </section>
</PageShell>

<style>
  .hero {
    padding: 24px;
  }

  .hero h1,
  .hero h2,
  .hero p {
    margin: 0;
  }

  .hero__lede {
    font-size: 1.02rem;
    line-height: 1.7;
    color: var(--text-soft);
  }

  .hero__actions {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
  }

  .hero--quiet {
    background: rgba(244, 247, 238, 0.84);
  }

  .lower-grid {
    margin-top: 18px;
  }

  .scenario-card {
    padding: 18px;
    display: grid;
    gap: 10px;
  }

  .scenario-card h3,
  .scenario-card p {
    margin: 0;
  }

  .scenario-card__hint {
    color: var(--text-soft);
  }
</style>
