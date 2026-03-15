<script lang="ts">
  import { page } from '$app/state';

  function isActive(href: string, pathname: string): boolean {
    if (href === '/') {
      return pathname === href;
    }
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  const links = [
    { href: '/', label: 'Hub' },
    { href: '/field', label: 'Field' },
    { href: '/roster', label: 'Roster' },
    { href: '/proof', label: 'Proof' },
    { href: '/passport', label: 'Passport' },
    { href: '/journal', label: 'Journal' },
    { href: '/battle', label: 'Battle' },
    { href: '/lab', label: 'Lab' },
  ];
</script>

<div class="shell">
  <div class:wide={page.url.pathname === '/field' || page.url.pathname === '/battle'} class="shell__inner">
    <nav class="shell__nav" aria-label="Primary">
      <div class="shell__brand">
        <div class="shell__brand-chip" aria-hidden="true"></div>
        <div>
          <div class="section-kicker">Cogochi / Judgment RPG</div>
          <strong>Trainer Field Kit</strong>
        </div>
      </div>
      <div class="shell__links">
        {#each links as link}
          <a class:active={isActive(link.href, page.url.pathname)} class="nav-pill" href={link.href}>{link.label}</a>
        {/each}
      </div>
    </nav>
    <slot />
  </div>
</div>
