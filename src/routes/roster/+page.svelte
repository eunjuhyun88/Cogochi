<script lang="ts">
  import AgentCard from '$components/shared/AgentCard.svelte';
  import PageShell from '$components/shared/PageShell.svelte';
  import { rosterStore } from '$lib/stores/rosterStore';
</script>

<PageShell>
  <section class="panel roster-head">
    <div>
      <p class="section-kicker">Roster</p>
      <h1 class="section-title">Choose who to raise next.</h1>
    </div>
    <p>
      Imported dino starters and original Coglets now live in the same OpenClaw-based roster. Pick one to inspect
      its doctrine, trusted instincts, weak link, visible growth, and mutation history, then run the next proof pass.
    </p>
  </section>

  <section class="grid-auto roster-grid">
    {#each $rosterStore.agents as agent}
      <AgentCard agent={agent} href={`/agent/${agent.id}`} />
    {/each}
  </section>
</PageShell>

<style>
  .roster-head {
    padding: 22px;
    display: grid;
    gap: 12px;
  }

  .roster-head h1,
  .roster-head p {
    margin: 0;
  }

  .roster-grid {
    margin-top: 18px;
  }
</style>
