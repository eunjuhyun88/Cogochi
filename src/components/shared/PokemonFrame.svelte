<script lang="ts">
  const { variant = 'default', padding = '10px', children } = $props<{
    variant?: 'default' | 'dark' | 'accent';
    padding?: string;
    children: import('svelte').Snippet;
  }>();
</script>

<div class={`poke-frame ${variant}`} style:padding={padding}>
  <div class="poke-inner">
    {@render children()}
  </div>
</div>

<style>
  .poke-frame {
    border: 3px solid #314265;
    border-radius: 10px;
    background: #131c32;
    position: relative;
  }

  .poke-frame.dark {
    border-color: #24324e;
    background: #0c1528;
  }

  .poke-frame.accent {
    border-color: #ff9a5f;
    background: #19152b;
  }

  .poke-inner {
    border: 1px solid rgba(255,255,255,0.06);
    border-radius: 5px;
    height: 100%;
  }

  .poke-frame::before {
    content: '';
    position: absolute;
    inset: 1px;
    border-radius: 7px;
    border-top: 1px solid rgba(255,255,255,0.08);
    border-left: 1px solid rgba(255,255,255,0.05);
    pointer-events: none;
  }
</style>

