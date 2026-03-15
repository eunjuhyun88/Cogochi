<script lang="ts">
  import { get } from 'svelte/store';
  import { onMount } from 'svelte';
  import '../app.css';
  import { labStore } from '$lib/stores/labStore';
  import { rosterStore } from '$lib/stores/rosterStore';

  function getFallbackTextState() {
    const roster = get(rosterStore);
    const lab = get(labStore);
    const activeAgent = roster.agents.find((agent) => agent.id === lab.activeAgentId || agent.id === roster.selectedAgentId) ?? null;
    return {
      mode: 'agent-ops',
      selectedAgent: activeAgent?.name ?? null,
      activeScenario: lab.activeScenarioId,
      agentCount: roster.agents.length,
      latestDelta: roster.recentComparisons[0]?.deltas.totalScore ?? 0,
    };
  }

  onMount(() => {
    window.render_game_to_text = () =>
      JSON.stringify(window.__cogochi_text_state?.() ?? getFallbackTextState());

    if (!window.advanceTime) {
      window.advanceTime = (_ms: number) => {};
    }

    return () => {
      delete window.render_game_to_text;
      delete window.advanceTime;
    };
  });
</script>

<slot />
