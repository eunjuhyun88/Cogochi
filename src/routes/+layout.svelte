<script lang="ts">
  import '../app.css';
  import { page } from '$app/state';

  let { children } = $props();

  const links = [
    { href: '/', label: 'Hub' },
    { href: '/roster', label: 'Roster' },
    { href: '/team', label: 'Team' },
    { href: '/battle', label: 'Battle' },
    { href: '/lab', label: 'Lab' }
  ] as const;

  let pathname = $derived(page.url.pathname);

  function isActive(href: string): boolean {
    if (href === '/') return pathname === '/';
    if (href === '/roster') return pathname === '/roster' || pathname.startsWith('/agent/');
    return pathname === href || pathname.startsWith(`${href}/`);
  }
</script>

<div class="app-shell">
  <header class="topbar">
    <div class="brand-block">
      <a class="brand" href="/">AI MON: SIGNAL WARS</a>
      <span class="brand-sub">TRAINER HUB · ROSTER · BATTLE LAB</span>
    </div>

    <nav>
      {#each links as link}
        <a href={link.href} class:active={isActive(link.href)}>{link.label}</a>
      {/each}
    </nav>
  </header>

  <main>
    {@render children()}
  </main>
</div>

<style>
  .app-shell {
    min-height: 100vh;
  }

  .topbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 16px;
    padding: 14px 18px;
    border-bottom: 1px solid var(--line);
    background: rgba(7, 12, 25, 0.9);
    position: sticky;
    top: 0;
    z-index: 10;
    backdrop-filter: blur(14px);
  }

  .brand-block {
    display: grid;
    gap: 2px;
  }

  .brand {
    color: var(--cyan);
    text-decoration: none;
    font-family: 'Orbitron', sans-serif;
    font-size: clamp(24px, 4vw, 36px);
    letter-spacing: 0.04em;
    line-height: 0.95;
  }

  .brand-sub {
    color: var(--text-2);
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
    letter-spacing: 0.12em;
  }

  nav {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
  }

  nav a {
    color: var(--text-0);
    text-decoration: none;
    padding: 10px 14px;
    border: 1px solid var(--line);
    border-radius: 14px;
    background: rgba(255,255,255,0.03);
    transition: border-color 160ms ease, background 160ms ease, transform 160ms ease;
  }

  nav a:hover {
    transform: translateY(-1px);
    border-color: rgba(0, 229, 255, 0.2);
  }

  nav a.active {
    border-color: rgba(0, 229, 255, 0.3);
    background: rgba(0, 229, 255, 0.08);
    color: #a6f5ff;
  }

  main {
    min-height: calc(100vh - 80px);
  }

  @media (max-width: 860px) {
    .topbar {
      flex-direction: column;
      align-items: stretch;
    }

    nav {
      justify-content: space-between;
    }
  }
</style>
