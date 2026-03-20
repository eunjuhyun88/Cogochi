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
            <strong>Cogochi</strong>
            <span>{routeMeta.zone}</span>
          </span>
        </a>

        <div class="shell__tools">
          <div class="shell__status">
            <span class="shell__status-pill">{routeMeta.status}</span>
          </div>

          <div class="shell__dock" role="list">
            {#each links as link}
              <a class:active={isActive(link.href, page.url.pathname)} class="shell-link" href={link.href}>
                <span class="shell-link__crest" aria-hidden="true">{link.crest}</span>
                <span class="shell-link__copy">
                  <strong>{link.label}</strong>
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
    isolation: isolate;
    --shell-gold: rgba(232, 183, 109, 0.3);
    --shell-gold-strong: rgba(244, 202, 133, 0.74);
    --shell-mint: rgba(106, 199, 170, 0.3);
    --shell-mint-strong: rgba(155, 230, 206, 0.84);
    --shell-glass: rgba(18, 25, 31, 0.74);
    --shell-glass-strong: rgba(13, 19, 24, 0.92);
    --shell-line: rgba(255, 239, 207, 0.08);
    --shell-shadow: 0 28px 70px rgba(4, 7, 9, 0.34);
    color: #edf1eb;
    background:
      radial-gradient(circle at top left, rgba(42, 77, 70, 0.14), transparent 22%),
      radial-gradient(circle at top right, rgba(199, 146, 77, 0.12), transparent 18%),
      linear-gradient(180deg, rgba(6, 10, 14, 0.98), rgba(4, 8, 11, 1));
  }

  .shell::before {
    content: '';
    position: fixed;
    inset: 0;
    z-index: -2;
    pointer-events: none;
    background:
      linear-gradient(rgba(255, 255, 255, 0.018) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255, 255, 255, 0.018) 1px, transparent 1px),
      radial-gradient(circle at 50% 0, rgba(255, 248, 223, 0.05), transparent 30%);
    background-size: 48px 48px, 48px 48px, auto;
    opacity: 0.42;
  }

  .shell.immersive {
    min-height: auto;
  }

  .shell__aura {
    position: fixed;
    inset: auto;
    z-index: -1;
    pointer-events: none;
    filter: blur(44px);
    opacity: 0.68;
  }

  .shell__aura--left {
    top: 30px;
    left: -120px;
    width: 420px;
    height: 420px;
    border-radius: 999px;
    background: radial-gradient(circle, rgba(72, 126, 117, 0.44), transparent 72%);
  }

  .shell__aura--right {
    top: 96px;
    right: -90px;
    width: 430px;
    height: 430px;
    border-radius: 999px;
    background: radial-gradient(circle, rgba(214, 152, 88, 0.26), transparent 72%);
  }

  .shell__inner {
    max-width: 1540px;
    margin: 0 auto;
    padding: 18px 18px 22px;
  }

  .shell__inner.wide {
    max-width: 1640px;
  }

  .shell__nav {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 18px;
    padding: 14px 18px;
    margin-bottom: 16px;
    border-radius: 24px;
    border: 1px solid rgba(150, 174, 166, 0.12);
    background:
      linear-gradient(140deg, rgba(255, 255, 255, 0.05), transparent 34%),
      radial-gradient(circle at 12% 18%, rgba(76, 128, 118, 0.16), transparent 22%),
      radial-gradient(circle at 84% 22%, rgba(214, 142, 72, 0.1), transparent 16%),
      linear-gradient(180deg, rgba(17, 24, 29, 0.88), rgba(11, 17, 22, 0.94));
    box-shadow:
      0 18px 36px rgba(4, 7, 9, 0.22),
      inset 0 1px 0 rgba(255, 255, 255, 0.05),
      inset 0 -1px 0 rgba(255, 255, 255, 0.02);
    backdrop-filter: blur(14px);
  }

  .shell__brand {
    display: flex;
    gap: 12px;
    align-items: center;
    min-width: 0;
  }

  .shell__brand-mark {
    width: 38px;
    height: 38px;
    display: grid;
    place-items: center;
    border-radius: 14px;
    border: 1px solid rgba(154, 180, 171, 0.16);
    background:
      linear-gradient(180deg, rgba(33, 46, 52, 0.98), rgba(16, 24, 29, 0.98));
    box-shadow:
      0 10px 20px rgba(0, 0, 0, 0.22),
      inset 0 1px 0 rgba(255, 255, 255, 0.06),
      inset 0 0 0 1px rgba(255, 255, 255, 0.02);
  }

  .shell__brand-core {
    width: 14px;
    height: 14px;
    border-radius: 999px;
    background:
      radial-gradient(circle at 34% 34%, #f8f2cb 0 24%, transparent 25%),
      linear-gradient(180deg, #74d0ae, #244e45);
    box-shadow:
      0 0 0 8px rgba(110, 212, 179, 0.08),
      0 6px 18px rgba(27, 68, 59, 0.46);
  }

  .shell__brand-copy {
    display: grid;
    gap: 1px;
    min-width: 0;
  }

  .shell__brand-copy strong {
    font-size: 1rem;
    color: rgba(248, 245, 236, 0.98);
    font-family: 'Iowan Old Style', 'Palatino Linotype', 'Book Antiqua', serif;
    letter-spacing: -0.01em;
  }

  .shell__brand-copy > span:last-child {
    color: rgba(198, 211, 205, 0.66);
    font-size: 0.74rem;
    letter-spacing: 0.1em;
    text-transform: uppercase;
  }

  .shell__tools {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 10px;
    min-width: 0;
  }

  .shell__status {
    flex: 0 0 auto;
  }

  .shell__status-pill {
    display: inline-flex;
    align-items: center;
    padding: 6px 10px;
    border-radius: 999px;
    border: 1px solid rgba(145, 170, 160, 0.14);
    background: rgba(255, 255, 255, 0.04);
    color: rgba(231, 227, 214, 0.84);
    font-size: 0.66rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.04);
  }

  .shell__dock {
    display: flex;
    gap: 8px;
    min-width: 0;
    overflow-x: auto;
    padding-bottom: 2px;
    scrollbar-width: none;
  }

  .shell__dock::-webkit-scrollbar {
    display: none;
  }

  .shell-link {
    display: flex;
    gap: 8px;
    align-items: center;
    min-width: 0;
    padding: 8px 12px;
    border-radius: 999px;
    border: 1px solid rgba(131, 155, 149, 0.1);
    background:
      linear-gradient(180deg, rgba(255, 255, 255, 0.038), rgba(255, 255, 255, 0.022));
    color: rgba(216, 224, 219, 0.82);
    white-space: nowrap;
    transition:
      border-color 140ms ease,
      background 140ms ease,
      transform 140ms ease,
      box-shadow 140ms ease;
  }

  .shell-link:hover {
    border-color: rgba(168, 191, 182, 0.28);
    background:
      linear-gradient(180deg, rgba(255, 255, 255, 0.058), rgba(255, 255, 255, 0.036));
    transform: translateY(-1px);
    box-shadow: 0 10px 18px rgba(0, 0, 0, 0.12);
  }

  .shell-link.active {
    border-color: rgba(230, 175, 96, 0.36);
    background:
      linear-gradient(180deg, rgba(86, 96, 94, 0.32), rgba(41, 51, 52, 0.58)),
      linear-gradient(90deg, rgba(227, 157, 84, 0.12), rgba(83, 176, 151, 0.1));
    color: rgba(249, 245, 231, 0.96);
    box-shadow:
      0 12px 20px rgba(0, 0, 0, 0.16),
      inset 0 1px 0 rgba(255, 255, 255, 0.08);
  }

  .shell-link__crest {
    flex: 0 0 auto;
    width: 24px;
    height: 24px;
    display: grid;
    place-items: center;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(138, 160, 153, 0.14);
    font-size: 0.64rem;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.04);
  }

  .shell-link.active .shell-link__crest {
    background: rgba(226, 154, 80, 0.16);
    border-color: rgba(226, 154, 80, 0.24);
  }

  .shell-link__copy {
    display: flex;
    min-width: 0;
  }

  .shell-link__copy strong {
    font-size: 0.82rem;
    font-weight: 650;
  }

  .shell__content {
    position: relative;
  }

  .shell.compact .shell__nav,
  .shell.condensed .shell__nav {
    padding: 12px 16px;
  }

  .shell.minimal .shell__status {
    display: none;
  }

  .shell.minimal .shell__brand-copy > span:last-child,
  .shell.compact .shell__brand-copy > span:last-child {
    display: none;
  }

  .shell.ultraCompact .shell__nav {
    gap: 10px;
    padding: 10px 12px;
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
    font-size: 0.92rem;
  }

  .shell.ultraCompact .shell__brand-copy > span:last-child {
    display: none;
  }

  .shell.ultraCompact .shell__tools {
    gap: 6px;
  }

  .shell.ultraCompact .shell__status-pill {
    padding: 5px 9px;
    font-size: 0.64rem;
  }

  .shell.ultraCompact .shell-link {
    gap: 7px;
    padding: 7px 10px;
  }

  .shell.ultraCompact .shell-link__crest {
    width: 22px;
    height: 22px;
    font-size: 0.66rem;
  }

  .shell.ultraCompact .shell-link__copy strong {
    font-size: 0.76rem;
  }

  @media (max-width: 1100px) {
    .shell__nav {
      align-items: flex-start;
      flex-direction: column;
    }

    .shell__tools {
      width: 100%;
      justify-content: space-between;
    }

    .shell__dock {
      flex: 1 1 auto;
    }
  }

  @media (max-width: 720px) {
    .shell__inner {
      padding: 12px 10px 18px;
    }

    .shell__nav {
      padding: 12px;
      border-radius: 20px;
    }

    .shell__brand {
      gap: 10px;
    }

    .shell__brand-copy strong {
      font-size: 0.96rem;
    }

    .shell__brand-copy > span:last-child {
      font-size: 0.68rem;
    }
  }
</style>
