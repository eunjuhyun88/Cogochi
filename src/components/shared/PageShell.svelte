<script lang="ts">
  import { page } from '$app/state';
  import type { Snippet } from 'svelte';

  let {
    compact = false,
    condensed = false,
    minimal = false,
    immersive = false,
    children,
  }: {
    compact?: boolean;
    condensed?: boolean;
    minimal?: boolean;
    immersive?: boolean;
    children?: Snippet;
  } = $props();

  function isActive(href: string, pathname: string): boolean {
    if (href === '/') {
      return pathname === href;
    }
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  const links = [
    { href: '/', label: 'Hub', note: 'macro', crest: 'H' },
    { href: '/field', label: 'Field', note: 'zone', crest: 'F' },
    { href: '/battle', label: 'Battle', note: 'boss', crest: 'B' },
    { href: '/journal', label: 'Journal', note: 'return', crest: 'J' },
    { href: '/roster', label: 'Roster', note: 'party', crest: 'R' },
    { href: '/proof', label: 'Proof', note: 'record', crest: 'P' },
    { href: '/passport', label: 'Passport', note: 'public', crest: 'M' },
    { href: '/lab', label: 'Lab', note: 'forge', crest: 'L' },
  ];

  function getSurfaceMeta(pathname: string): { zone: string; subtitle: string; status: string } {
    if (pathname === '/') {
      return {
        zone: 'Macro Command Map',
        subtitle: 'Pick the next route, settle the companion, then step back into the chart.',
        status: 'Return window open',
      };
    }
    if (pathname.startsWith('/field')) {
      return {
        zone: 'Zone Traverse',
        subtitle: 'Walk candle terrain, read pressure, and commit only when the ground agrees.',
        status: 'Route live',
      };
    }
    if (pathname.startsWith('/battle')) {
      return {
        zone: 'Boss Cut-In',
        subtitle: 'Special encounter framing. Keep the command grammar simple and sharp.',
        status: 'Boss pressure rising',
      };
    }
    if (pathname.startsWith('/journal')) {
      return {
        zone: 'Return Deck',
        subtitle: 'Turn the consequence into one clear lesson before it drifts.',
        status: 'Debrief active',
      };
    }
    if (pathname.startsWith('/lab')) {
      return {
        zone: 'Forge Bench',
        subtitle: 'Adjust doctrine only where the next route truly demands it.',
        status: 'Bench warm',
      };
    }
    if (pathname.startsWith('/proof')) {
      return {
        zone: 'Proof Gate',
        subtitle: 'Validation is a route decision, not a detached spreadsheet ritual.',
        status: 'Gate primed',
      };
    }
    if (pathname.startsWith('/roster')) {
      return {
        zone: 'Party Bench',
        subtitle: 'Pick the companion body that should carry the next section of history.',
        status: 'Party ready',
      };
    }
    if (pathname.startsWith('/agent')) {
      return {
        zone: 'Companion File',
        subtitle: 'Read one Cogochi closely enough to change how you travel with it.',
        status: 'Profile open',
      };
    }
    if (pathname.startsWith('/passport')) {
      return {
        zone: 'Record Ledger',
        subtitle: 'Public proof stays compact. The journey should still feel personal.',
        status: 'Record synced',
      };
    }
    return {
      zone: 'Command World',
      subtitle: 'Chart-world judgment RPG.',
      status: 'Systems awake',
    };
  }

  const routeMeta = $derived(getSurfaceMeta(page.url.pathname));
  const ultraCompact = $derived(
    minimal && (page.url.pathname.startsWith('/field') || page.url.pathname.startsWith('/battle')),
  );
</script>

<div class:compact class:condensed class:minimal class:immersive class:ultraCompact class="shell">
  <div class="shell__aura shell__aura--left"></div>
  <div class="shell__aura shell__aura--right"></div>
  <div class:wide={page.url.pathname === '/field' || page.url.pathname === '/battle'} class="shell__inner">
    {#if !immersive}
      <nav class="shell__nav" aria-label="Primary">
        <a class="shell__brand" href="/">
          <span class="shell__brand-mark" aria-hidden="true">
            <span class="shell__brand-core"></span>
          </span>
          <span class="shell__brand-copy">
            <span class="section-kicker">Cogochi // Command World</span>
            <strong>{routeMeta.zone}</strong>
            <span>{routeMeta.subtitle}</span>
          </span>
        </a>

        <div class="shell__tools">
          <div class="shell__status">
            <span class="shell__status-pill">{routeMeta.status}</span>
            {#if !ultraCompact}
              <span class="shell__status-pill shell__status-pill--quiet">
                {page.url.pathname === '/' ? 'Macro map' : 'Live route'}
              </span>
            {/if}
          </div>

          <div class="shell__dock" role="list">
            {#each links as link}
              <a class:active={isActive(link.href, page.url.pathname)} class="shell-link" href={link.href}>
                <span class="shell-link__crest" aria-hidden="true">{link.crest}</span>
                <span class="shell-link__copy">
                  <strong>{link.label}</strong>
                  <small>{link.note}</small>
                </span>
              </a>
            {/each}
          </div>
        </div>
      </nav>
    {/if}

    <div class="shell__content">
      {@render children?.()}
    </div>
  </div>
</div>

<style>
  .shell {
    position: relative;
    min-height: 100vh;
    color: #edf1eb;
  }

  .shell.immersive {
    min-height: auto;
  }

  .shell__aura {
    position: fixed;
    inset: auto;
    z-index: -1;
    pointer-events: none;
    filter: blur(28px);
    opacity: 0.5;
  }

  .shell__aura--left {
    top: 42px;
    left: -80px;
    width: 320px;
    height: 320px;
    border-radius: 999px;
    background: radial-gradient(circle, rgba(62, 102, 96, 0.46), transparent 72%);
  }

  .shell__aura--right {
    top: 120px;
    right: -70px;
    width: 360px;
    height: 360px;
    border-radius: 999px;
    background: radial-gradient(circle, rgba(208, 141, 76, 0.22), transparent 72%);
  }

  .shell__nav {
    display: grid;
    gap: 16px;
    padding: 18px 22px;
    margin-bottom: 18px;
    border-radius: 28px;
    border: 1px solid rgba(112, 139, 132, 0.18);
    background:
      radial-gradient(circle at 12% 18%, rgba(76, 128, 118, 0.22), transparent 24%),
      radial-gradient(circle at 84% 22%, rgba(214, 142, 72, 0.12), transparent 18%),
      linear-gradient(180deg, rgba(15, 20, 24, 0.94), rgba(20, 29, 34, 0.96));
    box-shadow:
      0 24px 44px rgba(7, 10, 12, 0.36),
      inset 0 1px 0 rgba(255, 255, 255, 0.05);
  }

  .shell__brand {
    display: flex;
    gap: 14px;
    align-items: flex-start;
    min-width: 0;
  }

  .shell__brand-mark {
    width: 46px;
    height: 46px;
    display: grid;
    place-items: center;
    border-radius: 16px;
    border: 1px solid rgba(120, 151, 143, 0.2);
    background:
      linear-gradient(180deg, rgba(27, 39, 42, 0.98), rgba(17, 25, 29, 0.98));
    box-shadow:
      0 12px 22px rgba(0, 0, 0, 0.24),
      inset 0 1px 0 rgba(255, 255, 255, 0.05);
  }

  .shell__brand-core {
    width: 16px;
    height: 16px;
    border-radius: 999px;
    background:
      radial-gradient(circle at 34% 34%, #f8f2cb 0 24%, transparent 25%),
      linear-gradient(180deg, #69c3a1, #214d43);
    box-shadow:
      0 0 0 7px rgba(96, 198, 162, 0.08),
      0 4px 16px rgba(27, 68, 59, 0.5);
  }

  .shell__brand-copy {
    display: grid;
    gap: 3px;
    min-width: 0;
  }

  .shell__brand-copy strong {
    font-size: 1.18rem;
    color: rgba(247, 244, 235, 0.96);
    font-family: 'Iowan Old Style', 'Palatino Linotype', 'Book Antiqua', serif;
  }

  .shell__brand-copy > span:last-child {
    color: rgba(198, 212, 205, 0.74);
    line-height: 1.45;
    max-width: 58ch;
  }

  .shell__tools {
    display: grid;
    gap: 12px;
  }

  .shell__status {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    justify-content: flex-end;
  }

  .shell__status-pill {
    display: inline-flex;
    align-items: center;
    padding: 7px 11px;
    border-radius: 999px;
    border: 1px solid rgba(123, 146, 140, 0.18);
    background: rgba(255, 255, 255, 0.04);
    color: rgba(232, 228, 213, 0.82);
    font-size: 0.72rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  .shell__status-pill--quiet {
    color: rgba(182, 196, 191, 0.7);
    background: rgba(87, 104, 112, 0.16);
  }

  .shell__dock {
    display: grid;
    grid-template-columns: repeat(8, minmax(0, 1fr));
    gap: 8px;
  }

  .shell-link {
    display: flex;
    gap: 10px;
    align-items: center;
    min-width: 0;
    padding: 10px 12px;
    border-radius: 18px;
    border: 1px solid rgba(113, 139, 133, 0.12);
    background: rgba(255, 255, 255, 0.03);
    color: rgba(209, 219, 213, 0.8);
    transition:
      border-color 140ms ease,
      background 140ms ease,
      transform 140ms ease;
  }

  .shell-link:hover {
    border-color: rgba(150, 174, 166, 0.28);
    background: rgba(255, 255, 255, 0.05);
    transform: translateY(-1px);
  }

  .shell-link.active {
    border-color: rgba(222, 154, 79, 0.28);
    background:
      linear-gradient(180deg, rgba(71, 86, 92, 0.46), rgba(44, 57, 62, 0.72)),
      linear-gradient(90deg, rgba(227, 157, 84, 0.08), rgba(83, 176, 151, 0.06));
    color: rgba(247, 242, 227, 0.94);
    box-shadow:
      0 12px 20px rgba(0, 0, 0, 0.2),
      inset 0 1px 0 rgba(255, 255, 255, 0.05);
  }

  .shell-link__crest {
    flex: 0 0 auto;
    width: 30px;
    height: 30px;
    display: grid;
    place-items: center;
    border-radius: 12px;
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(124, 144, 138, 0.12);
    font-size: 0.78rem;
    letter-spacing: 0.1em;
    text-transform: uppercase;
  }

  .shell-link.active .shell-link__crest {
    background: rgba(226, 154, 80, 0.12);
    border-color: rgba(226, 154, 80, 0.18);
  }

  .shell-link__copy {
    display: grid;
    min-width: 0;
  }

  .shell-link__copy strong {
    font-size: 0.9rem;
    font-weight: 700;
  }

  .shell-link__copy small {
    color: rgba(164, 182, 175, 0.72);
    text-transform: uppercase;
    letter-spacing: 0.08em;
    font-size: 0.63rem;
  }

  .shell__content {
    position: relative;
  }

  .shell.compact .shell__nav,
  .shell.condensed .shell__nav {
    padding: 16px 18px;
  }

  .shell.minimal .shell__brand-copy > span:last-child,
  .shell.compact .shell__brand-copy > span:last-child {
    max-width: 40ch;
  }

  .shell.minimal .shell__status {
    justify-content: flex-start;
  }

  .shell.minimal .shell__dock {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }

  .shell.ultraCompact .shell__nav {
    gap: 10px;
    padding: 12px 14px;
    margin-bottom: 12px;
    border-radius: 22px;
  }

  .shell.ultraCompact .shell__brand {
    gap: 10px;
    align-items: center;
  }

  .shell.ultraCompact .shell__brand-mark {
    width: 38px;
    height: 38px;
    border-radius: 13px;
  }

  .shell.ultraCompact .shell__brand-core {
    width: 13px;
    height: 13px;
  }

  .shell.ultraCompact .shell__brand-copy {
    gap: 1px;
  }

  .shell.ultraCompact .shell__brand-copy strong {
    font-size: 1rem;
  }

  .shell.ultraCompact .shell__brand-copy > span:last-child {
    display: none;
  }

  .shell.ultraCompact .shell__tools {
    gap: 8px;
  }

  .shell.ultraCompact .shell__status {
    justify-content: flex-start;
  }

  .shell.ultraCompact .shell__status-pill {
    padding: 5px 9px;
    font-size: 0.64rem;
  }

  .shell.ultraCompact .shell__dock {
    grid-template-columns: repeat(8, minmax(0, 1fr));
    gap: 6px;
  }

  .shell.ultraCompact .shell-link {
    gap: 7px;
    padding: 7px 8px;
    border-radius: 14px;
  }

  .shell.ultraCompact .shell-link__crest {
    width: 24px;
    height: 24px;
    border-radius: 10px;
    font-size: 0.66rem;
  }

  .shell.ultraCompact .shell-link__copy strong {
    font-size: 0.78rem;
  }

  .shell.ultraCompact .shell-link__copy small {
    display: none;
  }

  @media (max-width: 1100px) {
    .shell__dock {
      grid-template-columns: repeat(4, minmax(0, 1fr));
    }
  }

  @media (max-width: 720px) {
    .shell__nav {
      padding: 15px;
      border-radius: 24px;
    }

    .shell__brand {
      gap: 12px;
    }

    .shell__brand-copy strong {
      font-size: 1.05rem;
    }

    .shell__brand-copy > span:last-child {
      font-size: 0.92rem;
    }

    .shell__dock {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }
</style>
