<script lang="ts">
  import PixelSprite from '$components/shared/PixelSprite.svelte';
  import type { BattleViewModel } from '$lib/engine/battle-view';

  let { view }: { view: BattleViewModel } = $props();

  const svgWidth = 940;
  const svgHeight = 540;
  const padding = { top: 30, right: 92, bottom: 54, left: 30 };
  const innerWidth = svgWidth - padding.left - padding.right;
  const innerHeight = svgHeight - padding.top - padding.bottom;
  const skyClouds = [
    { id: 'cloud-west', x: 144, y: 96, width: 116, height: 30 },
    { id: 'cloud-mid', x: 426, y: 84, width: 142, height: 34 },
    { id: 'cloud-east', x: 706, y: 104, width: 122, height: 30 },
  ];

  function xFor(index: number): number {
    if (view.candles.length <= 1) {
      return padding.left;
    }
    return padding.left + (index / (view.candles.length - 1)) * innerWidth;
  }

  function yFor(price: number): number {
    const span = view.priceRange.max - view.priceRange.min || 1;
    return padding.top + ((view.priceRange.max - price) / span) * innerHeight;
  }

  function candleBodyHeight(index: number): number {
    const candle = view.candles[index];
    return Math.max(6, Math.abs(yFor(candle.open) - yFor(candle.close)));
  }

  function candleBodyY(index: number): number {
    const candle = view.candles[index];
    return Math.min(yFor(candle.open), yFor(candle.close));
  }

  function zoneTop(price: number): number {
    return yFor(price + 1.7);
  }

  function zoneHeight(): number {
    return Math.max(18, innerHeight * 0.06);
  }

  function companionStyle(index: number, price: number): string {
    return `left:${(xFor(index) / svgWidth) * 100}%;top:${(yFor(price) / svgHeight) * 100}%;`;
  }

  function blockRows(zone: BattleViewModel['zones'][number]): number {
    const ratio = Math.max(0.16, zone.strength / 100);
    if (zone.kind === 'LIQUIDATION') return Math.max(1, Math.round(ratio * 3));
    if (zone.kind === 'SUPPORT') return Math.max(1, Math.round(ratio * 4));
    if (zone.kind === 'OBJECTIVE') return Math.max(2, Math.round(ratio * 5));
    return Math.max(1, Math.round(ratio * 4));
  }

  function blockColumns(zone: BattleViewModel['zones'][number], row: number): number {
    if (zone.kind === 'OBJECTIVE') return Math.max(1, 2 - row);
    if (zone.kind === 'LIQUIDATION') return 5;
    if (zone.kind === 'SUPPORT') return 6;
    return Math.max(1, 4 - row);
  }

  const priceTicks = $derived(
    Array.from({ length: 6 }, (_, index) => {
      const ratio = index / 5;
      return Math.round(view.priceRange.max - ratio * (view.priceRange.max - view.priceRange.min));
    }),
  );

  const volumeMax = $derived(Math.max(...view.candles.map((candle) => candle.volume), 1));
  const trendLine = $derived(view.candles.map((candle, index) => `${xFor(index)},${yFor(candle.close)}`).join(' '));
  const terrainArea = $derived(
    `${padding.left},${padding.top + innerHeight} ${trendLine} ${xFor(view.candles.length - 1)},${padding.top + innerHeight}`,
  );
  const activeTrail = $derived(
    view.candles
      .slice(view.activeSlice.start, view.activeSlice.end + 1)
      .map((candle, index) => `${xFor(view.activeSlice.start + index)},${yFor(candle.close)}`)
      .join(' '),
  );
  const rivalPressure = $derived(
    Array.from({ length: 3 }, (_, index) => ({
      xIndex: view.activeSlice.start + 1 + index * 2,
      fromPrice: view.report.action === 'LONG' ? view.priceRange.max - 1.6 : view.priceRange.min + 1.6,
      toPrice: view.report.action === 'LONG' ? view.priceRange.max - 8.4 - index * 2.2 : view.priceRange.min + 8.4 + index * 2.2,
    })),
  );
  const statusMeters = $derived([
    { label: 'Wall', value: view.session.structureIntegrity, tone: 'goal' },
    { label: 'Support', value: view.session.supportIntegrity, tone: 'safe' },
    { label: 'Trap', value: view.session.trapRisk, tone: 'danger' },
    { label: 'Momentum', value: view.session.pushMomentum, tone: 'info' },
  ]);
  const selectedCommandCard = $derived(view.commandCards.find((card) => card.selected) ?? view.commandCards[0]);
  const objectiveZone = $derived(view.zones.find((zone) => zone.kind === 'OBJECTIVE') ?? view.zones.at(-1) ?? null);
</script>

<article class="battlefield">
  <header class="battlefield__top">
    <div>
      <p class="battlefield__kicker">
        {view.scenario.symbol} / {view.scenario.timeframe}
        {#if view.stageFrame.mode === 'historical'}
          <span> · {view.stageFrame.dateLabel}</span>
        {/if}
      </p>
      <h2>{view.stageFrame.title}</h2>
      <p>{view.stageFrame.mode === 'historical' ? view.stageFrame.note : view.scenario.objective}</p>
    </div>
    <div class="battlefield__state">
      <span class:danger={view.verdictTone === 'danger'} class:good={view.verdictTone === 'good'} class:warn={view.verdictTone === 'warn'} class="battlefield__verdict">
        {view.verdictLabel}
      </span>
      <span class="battlefield__pressure">{view.pressureLabel}</span>
    </div>
  </header>

  <div class="battlefield__stage">
    <svg aria-label="Chart battlefield" class="battlefield__svg" viewBox={`0 0 ${svgWidth} ${svgHeight}`}>
      <defs>
        <linearGradient id="battlefield-sky" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stop-color="#cde7f6" />
          <stop offset="44%" stop-color="#ecf4ee" />
          <stop offset="100%" stop-color="#c9d7b2" />
        </linearGradient>
        <linearGradient id="battlefield-active" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stop-color="rgba(248, 221, 150, 0.36)" />
          <stop offset="100%" stop-color="rgba(248, 221, 150, 0.08)" />
        </linearGradient>
        <linearGradient id="battlefield-terrain" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stop-color="rgba(157, 202, 144, 0.94)" />
          <stop offset="48%" stop-color="rgba(104, 160, 96, 0.94)" />
          <stop offset="100%" stop-color="rgba(86, 124, 74, 0.98)" />
        </linearGradient>
        <linearGradient id="battlefield-ground" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stop-color="#5b7f4f" />
          <stop offset="100%" stop-color="#45613a" />
        </linearGradient>
        <linearGradient id="battlefield-volume" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stop-color="rgba(71, 138, 118, 0.62)" />
          <stop offset="100%" stop-color="rgba(92, 106, 86, 0.18)" />
        </linearGradient>
        <marker id="battle-up-arrow" markerHeight="8" markerWidth="8" orient="auto" refX="5" refY="3.5">
          <path d="M0,0 L7,3.5 L0,7 Z" fill="#3f966d" />
        </marker>
        <marker id="battle-down-arrow" markerHeight="8" markerWidth="8" orient="auto" refX="5" refY="3.5">
          <path d="M0,0 L7,3.5 L0,7 Z" fill="#c5645c" />
        </marker>
      </defs>

      <rect fill="url(#battlefield-sky)" height={svgHeight} rx="28" width={svgWidth} />
      <circle cx="800" cy="94" fill="rgba(255, 236, 182, 0.9)" r="48" />

      {#each skyClouds as cloud}
        <g opacity="0.78">
          <ellipse cx={cloud.x} cy={cloud.y} fill="rgba(255, 255, 255, 0.88)" rx={cloud.width / 2.6} ry={cloud.height / 2.1} />
          <ellipse cx={cloud.x + cloud.width / 5} cy={cloud.y - 4} fill="rgba(255, 255, 255, 0.92)" rx={cloud.width / 3.2} ry={cloud.height / 2.2} />
          <ellipse cx={cloud.x - cloud.width / 5} cy={cloud.y + 2} fill="rgba(255, 255, 255, 0.86)" rx={cloud.width / 3.4} ry={cloud.height / 2.1} />
        </g>
      {/each}

      <rect
        fill="url(#battlefield-active)"
        height={innerHeight}
        rx="18"
        width={xFor(view.activeSlice.end) - xFor(view.activeSlice.start) + 36}
        x={xFor(view.activeSlice.start) - 18}
        y={padding.top}
      />

      <polygon fill="url(#battlefield-terrain)" opacity="0.92" points={terrainArea} />
      <rect fill="url(#battlefield-ground)" height="110" rx="0" width={innerWidth} x={padding.left} y={svgHeight - 126} />

      {#each Array.from({ length: 6 }, (_, index) => index) as row}
        <line
          stroke="rgba(109, 125, 86, 0.16)"
          stroke-width="1"
          x1={padding.left}
          x2={svgWidth - padding.right}
          y1={padding.top + (innerHeight / 5) * row}
          y2={padding.top + (innerHeight / 5) * row}
        />
      {/each}

      {#each Array.from({ length: view.candles.length }, (_, index) => index) as column}
        <line
          stroke="rgba(109, 125, 86, 0.08)"
          stroke-width="1"
          x1={xFor(column)}
          x2={xFor(column)}
          y1={padding.top}
          y2={padding.top + innerHeight}
        />
      {/each}

      {#each view.zones as zone}
        <rect
          class={`battlefield__zone battlefield__zone--${zone.tone}`}
          height={zoneHeight()}
          rx="12"
          width={innerWidth}
          x={padding.left}
          y={zoneTop(zone.price)}
        />
        <line
          stroke={zone.tone === 'safe' ? 'rgba(70, 142, 103, 0.52)' : zone.tone === 'goal' ? 'rgba(201, 160, 78, 0.62)' : 'rgba(188, 96, 82, 0.54)'}
          stroke-dasharray={zone.kind === 'OBJECTIVE' ? '7 5' : '5 7'}
          stroke-width="2"
          x1={padding.left}
          x2={svgWidth - padding.right}
          y1={yFor(zone.price)}
          y2={yFor(zone.price)}
        />
        <text fill="rgba(84, 76, 49, 0.9)" font-size="12" letter-spacing="0.08em" x={padding.left + 10} y={yFor(zone.price) - 8}>
          {zone.label}
        </text>
      {/each}

      {#each view.zones as zone}
        {@const anchorIndex =
          zone.kind === 'SUPPORT'
            ? view.activeSlice.start + 1
            : zone.kind === 'LIQUIDATION'
              ? view.activeSlice.start + 2
              : zone.kind === 'RESISTANCE'
                ? view.activeSlice.start + 4
                : view.activeSlice.end - 1}
        {@const anchorX = xFor(anchorIndex)}
        {@const anchorY = yFor(zone.price)}
        {@const rows = blockRows(zone)}
        {#each Array.from({ length: rows }, (_, row) => row) as row}
          {@const columns = blockColumns(zone, row)}
          {#each Array.from({ length: columns }, (_, column) => column) as column}
            <rect
              fill={
                zone.kind === 'SUPPORT'
                  ? 'rgba(122, 181, 98, 0.86)'
                  : zone.kind === 'OBJECTIVE'
                    ? 'rgba(235, 203, 112, 0.9)'
                    : zone.kind === 'LIQUIDATION'
                      ? 'rgba(135, 91, 56, 0.82)'
                      : 'rgba(184, 110, 67, 0.86)'
              }
              height="16"
              rx="4"
              width="22"
              x={anchorX + column * 18 - columns * 9}
              y={
                zone.kind === 'LIQUIDATION'
                  ? anchorY + row * 12
                  : zone.kind === 'OBJECTIVE'
                    ? anchorY - row * 16
                    : anchorY - row * 18
              }
            />
          {/each}
        {/each}
      {/each}

      <polyline fill="none" points={trendLine} stroke="rgba(52, 104, 88, 0.48)" stroke-dasharray="8 7" stroke-width="2.2" />
      <polyline
        fill="none"
        points={activeTrail}
        stroke={view.report.action === 'LONG' ? 'rgba(93, 176, 124, 0.26)' : 'rgba(198, 111, 98, 0.24)'}
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="26"
      />
      <polyline
        fill="none"
        marker-end={view.report.action === 'LONG' ? 'url(#battle-up-arrow)' : 'url(#battle-down-arrow)'}
        points={activeTrail}
        stroke={view.report.action === 'LONG' ? '#3f966d' : '#c5645c'}
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="5"
      />

      {#each rivalPressure as pressure}
        <line
          marker-end={view.report.action === 'LONG' ? 'url(#battle-down-arrow)' : 'url(#battle-up-arrow)'}
          stroke={view.report.action === 'LONG' ? 'rgba(197, 100, 92, 0.7)' : 'rgba(63, 150, 109, 0.72)'}
          stroke-dasharray="8 8"
          stroke-width="3"
          x1={xFor(pressure.xIndex)}
          x2={xFor(pressure.xIndex)}
          y1={yFor(pressure.fromPrice)}
          y2={yFor(pressure.toPrice)}
        />
      {/each}

      {#each view.candles as candle, index}
        <line
          stroke={candle.close >= candle.open ? '#4a9f74' : '#c56b63'}
          stroke-linecap="round"
          stroke-width="2"
          x1={xFor(index)}
          x2={xFor(index)}
          y1={yFor(candle.high)}
          y2={yFor(candle.low)}
        />
        <rect
          fill={candle.close >= candle.open ? '#6cbc8e' : '#db9182'}
          height={candleBodyHeight(index)}
          rx="5"
          width="18"
          x={xFor(index) - 9}
          y={candleBodyY(index)}
        />
      {/each}

      {#each view.candles as candle, index}
        <rect
          fill={index >= view.activeSlice.start ? 'url(#battlefield-volume)' : 'rgba(110, 125, 107, 0.18)'}
          height={(candle.volume / volumeMax) * 76}
          rx="4"
          width="14"
          x={xFor(index) - 7}
          y={svgHeight - padding.bottom + 12 + (76 - (candle.volume / volumeMax) * 76)}
        />
      {/each}

      {#each priceTicks as tick}
        <text
          fill="rgba(84, 88, 61, 0.86)"
          font-size="12"
          text-anchor="end"
          x={svgWidth - 12}
          y={yFor(tick) + 4}
        >
          {tick.toLocaleString()}
        </text>
      {/each}

      <text fill="rgba(96, 102, 75, 0.72)" font-size="12" x={padding.left} y={svgHeight - 14}>
        Chart Ridge
      </text>
      <text fill="rgba(188, 146, 68, 0.92)" font-size="12" x={xFor(view.activeSlice.start)} y={padding.top - 8}>
        Active Slice
      </text>
      <text
        fill={view.report.action === 'LONG' ? 'rgba(63, 150, 109, 0.96)' : 'rgba(197, 100, 92, 0.96)'}
        font-size="12"
        x={padding.left}
        y={view.report.action === 'LONG' ? svgHeight - 96 : padding.top + 18}
      >
        {view.report.action === 'LONG' ? 'Player squad climbs from below' : 'Player squad drops from above'}
      </text>
      <text
        fill={view.report.action === 'LONG' ? 'rgba(197, 100, 92, 0.9)' : 'rgba(63, 150, 109, 0.9)'}
        font-size="12"
        x={padding.left}
        y={view.report.action === 'LONG' ? padding.top + 18 : svgHeight - 96}
      >
        {view.report.action === 'LONG' ? 'Rival pressure slams downward' : 'Rival support rises from below'}
      </text>
      <text fill="rgba(96, 102, 75, 0.72)" font-size="12" x={svgWidth - padding.right - 20} y={svgHeight - 14}>
        Volume Route
      </text>
    </svg>

    <div class="battlefield__overlay">
      {#each view.companions as companion}
        <div class={`battlefield__companion battlefield__companion--${companion.stance}`} style={companionStyle(companion.xIndex, companion.price)}>
          <div class="battlefield__companion-shadow"></div>
          <div class="battlefield__companion-body">
            <PixelSprite agent={companion.agent} size={48} />
          </div>
          <div class="battlefield__role-tag">{companion.agent.role}</div>
        </div>
      {/each}

      {#each view.callouts as callout}
        <div class={`battlefield__callout battlefield__callout--${callout.tone}`} style={companionStyle(callout.xIndex, callout.price)}>
          <strong>{callout.label}</strong>
          <span>{callout.detail}</span>
        </div>
      {/each}
    </div>
  </div>

  <footer class="battlefield__footer">
    <div class="battlefield__phases">
      {#each view.phases as phase}
        <div class={`battlefield__phase battlefield__phase--${phase.state}`}>
          <span>{phase.label}</span>
        </div>
      {/each}
    </div>

    <div class="battlefield__meters">
      {#each statusMeters as meter}
        <div class={`battlefield__meter battlefield__meter--${meter.tone}`}>
          <div class="battlefield__meter-head">
            <small>{meter.label}</small>
            <strong>{meter.value}</strong>
          </div>
          <div class="battlefield__meter-track">
            <div class="battlefield__meter-fill" style={`width:${meter.value}%`}></div>
          </div>
        </div>
      {/each}
    </div>

    <div class="battlefield__brief-row">
      <div class="battlefield__brief-card battlefield__brief-card--command">
        <small>Current order</small>
        <strong>{selectedCommandCard?.label ?? 'Command locked'}</strong>
        <p>{selectedCommandCard?.summary ?? view.pressureLabel}</p>
      </div>
      <div class="battlefield__brief-card battlefield__brief-card--objective">
        <small>Main conflict</small>
        <strong>{objectiveZone?.label ?? view.verdictLabel}</strong>
        <p>{view.pressureLabel}</p>
      </div>
    </div>
  </footer>
</article>

<style>
  .battlefield {
    display: grid;
    gap: 18px;
    padding: 22px;
    border-radius: 28px;
    background:
      radial-gradient(circle at top right, rgba(255, 229, 161, 0.24), transparent 26%),
      linear-gradient(180deg, rgba(255, 250, 240, 0.98), rgba(243, 236, 220, 0.96));
    border: 1px solid rgba(147, 140, 111, 0.18);
    box-shadow:
      inset 0 1px 0 rgba(255, 255, 255, 0.48),
      0 24px 60px rgba(117, 104, 69, 0.14);
    color: #283422;
  }

  .battlefield__top {
    display: flex;
    gap: 16px;
    align-items: flex-start;
    justify-content: space-between;
    flex-wrap: wrap;
  }

  .battlefield__top h2,
  .battlefield__top p {
    margin: 0;
  }

  .battlefield__kicker {
    margin: 0 0 8px;
    font-size: 0.76rem;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: rgba(100, 104, 75, 0.78);
  }

  .battlefield__state {
    display: grid;
    gap: 8px;
    justify-items: end;
  }

  .battlefield__verdict,
  .battlefield__pressure {
    display: inline-flex;
    padding: 10px 12px;
    border-radius: 999px;
    border: 1px solid rgba(151, 143, 111, 0.18);
    background: rgba(255, 248, 234, 0.82);
    font-size: 0.92rem;
    box-shadow: 0 8px 18px rgba(127, 112, 71, 0.1);
  }

  .battlefield__verdict.good {
    color: #357b59;
  }

  .battlefield__verdict.warn {
    color: #9a6a24;
  }

  .battlefield__verdict.danger {
    color: #a84f48;
  }

  .battlefield__pressure {
    color: rgba(72, 79, 57, 0.88);
    max-width: 320px;
  }

  .battlefield__stage {
    position: relative;
    aspect-ratio: 16 / 9;
    min-height: 320px;
  }

  .battlefield__svg {
    width: 100%;
    height: 100%;
    display: block;
    border-radius: 24px;
    border: 1px solid rgba(142, 139, 101, 0.18);
    box-shadow:
      inset 0 0 0 1px rgba(255, 255, 255, 0.22),
      0 14px 26px rgba(115, 103, 69, 0.12);
  }

  .battlefield__zone {
    opacity: 0.78;
  }

  .battlefield__zone--safe {
    fill: rgba(115, 177, 117, 0.12);
  }

  .battlefield__zone--danger {
    fill: rgba(198, 113, 94, 0.1);
  }

  .battlefield__zone--goal {
    fill: rgba(224, 190, 102, 0.11);
  }

  .battlefield__overlay {
    position: absolute;
    inset: 0;
    pointer-events: none;
  }

  .battlefield__companion,
  .battlefield__callout {
    position: absolute;
    transform: translate(-50%, -50%);
    transition:
      left 220ms ease,
      top 220ms ease,
      transform 220ms ease;
  }

  .battlefield__companion {
    display: grid;
    gap: 4px;
    justify-items: center;
  }

  .battlefield__companion--brace {
    transform: translate(-50%, -50%) scale(1.02);
  }

  .battlefield__companion--finish {
    transform: translate(-50%, -50%) scale(1.05);
  }

  .battlefield__companion-shadow {
    width: 42px;
    height: 12px;
    margin-bottom: -18px;
    border-radius: 999px;
    background: rgba(59, 76, 45, 0.2);
    filter: blur(1px);
  }

  .battlefield__companion-body {
    padding: 6px;
    border-radius: 18px;
    background: rgba(255, 250, 241, 0.7);
    border: 1px solid rgba(153, 140, 103, 0.12);
    box-shadow: 0 8px 18px rgba(114, 101, 65, 0.12);
  }

  .battlefield__role-tag {
    padding: 4px 9px;
    border-radius: 999px;
    background: rgba(255, 248, 234, 0.94);
    border: 1px solid rgba(160, 146, 103, 0.16);
    font-size: 0.66rem;
    letter-spacing: 0.08em;
    color: rgba(86, 80, 58, 0.94);
  }

  .battlefield__callout {
    max-width: 192px;
    display: grid;
    gap: 4px;
    padding: 10px 12px;
    border-radius: 16px;
    background: rgba(255, 249, 238, 0.94);
    border: 1px solid rgba(153, 140, 103, 0.16);
    box-shadow: 0 18px 32px rgba(105, 93, 60, 0.12);
  }

  .battlefield__callout strong {
    font-size: 0.72rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  .battlefield__callout span {
    font-size: 0.76rem;
    line-height: 1.4;
    color: rgba(78, 82, 63, 0.84);
  }

  .battlefield__callout--good strong {
    color: #357b59;
  }

  .battlefield__callout--info strong {
    color: #40758e;
  }

  .battlefield__callout--warn strong {
    color: #9a6a24;
  }

  .battlefield__callout--danger strong {
    color: #a84f48;
  }

  .battlefield__footer {
    display: grid;
    gap: 16px;
  }

  .battlefield__phases,
  .battlefield__meters,
  .battlefield__brief-row {
    display: grid;
    gap: 12px;
  }

  .battlefield__phases {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }

  .battlefield__meters {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }

  .battlefield__brief-row {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .battlefield__phase,
  .battlefield__meter,
  .battlefield__brief-card {
    padding: 14px;
    border-radius: 18px;
    border: 1px solid rgba(151, 143, 111, 0.18);
    background: rgba(255, 249, 238, 0.78);
    box-shadow: 0 10px 18px rgba(117, 104, 69, 0.08);
  }

  .battlefield__phase--complete {
    border-color: rgba(101, 163, 110, 0.26);
    color: #357b59;
  }

  .battlefield__phase--active {
    border-color: rgba(196, 156, 74, 0.34);
    color: #9a6a24;
    background: rgba(252, 244, 219, 0.86);
  }

  .battlefield__phase--queued {
    color: rgba(112, 118, 86, 0.72);
  }

  .battlefield__meter {
    display: grid;
    gap: 10px;
  }

  .battlefield__meter-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
  }

  .battlefield__meter-head small {
    color: rgba(100, 104, 75, 0.78);
  }

  .battlefield__meter-head strong {
    font-size: 0.94rem;
    color: #31412b;
  }

  .battlefield__meter-track {
    height: 10px;
    border-radius: 999px;
    overflow: hidden;
    background: rgba(120, 126, 91, 0.12);
  }

  .battlefield__meter-fill {
    height: 100%;
    border-radius: 999px;
    background: linear-gradient(90deg, rgba(97, 174, 123, 0.92), rgba(216, 185, 96, 0.92));
    transition: width 220ms ease;
  }

  .battlefield__meter--danger .battlefield__meter-fill {
    background: linear-gradient(90deg, rgba(214, 109, 97, 0.88), rgba(165, 82, 74, 0.94));
  }

  .battlefield__meter--goal .battlefield__meter-fill {
    background: linear-gradient(90deg, rgba(216, 185, 96, 0.9), rgba(124, 171, 99, 0.88));
  }

  .battlefield__brief-card {
    display: grid;
    gap: 6px;
  }

  .battlefield__brief-card small {
    color: rgba(104, 108, 79, 0.74);
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  .battlefield__brief-card strong {
    font-size: 1rem;
    color: #283422;
  }

  .battlefield__brief-card p {
    margin: 0;
    color: rgba(76, 82, 62, 0.84);
    line-height: 1.45;
  }

  .battlefield__brief-card--objective {
    background:
      linear-gradient(180deg, rgba(252, 246, 228, 0.86), rgba(244, 232, 197, 0.82));
  }

  @media (max-width: 900px) {
    .battlefield__state {
      justify-items: start;
    }

    .battlefield__phases,
    .battlefield__meters,
    .battlefield__brief-row {
      grid-template-columns: 1fr;
    }

    .battlefield__callout {
      max-width: 140px;
    }
  }
</style>
