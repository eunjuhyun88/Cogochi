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

  function curvedLinkPath(fromIndex: number, fromPrice: number, toIndex: number, toPrice: number, curveOffset: number): string {
    const startX = xFor(fromIndex);
    const startY = yFor(fromPrice);
    const endX = xFor(toIndex);
    const endY = yFor(toPrice);
    const deltaX = endX - startX;
    return `M ${startX} ${startY} C ${startX + deltaX * 0.28} ${startY + curveOffset} ${startX + deltaX * 0.72} ${endY + curveOffset * 0.54} ${endX} ${endY}`;
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
  const selectedAgent = $derived(view.selectedAgent);
  const objectiveAnchor = $derived.by(() => {
    const anchorIndex = objectiveZone
      ? Math.max(view.activeSlice.start + 1, Math.min(view.candles.length - 2, view.activeSlice.end - 1))
      : Math.round((view.activeSlice.start + view.activeSlice.end) / 2);
    const anchorPrice = objectiveZone?.price ?? view.candles[anchorIndex]?.close ?? view.priceRange.min;
    return {
      xIndex: Math.max(0, Math.min(view.candles.length - 1, anchorIndex)),
      price: anchorPrice,
    };
  });
  const rivalTitle = $derived.by(() => {
    if (objectiveZone?.kind === 'OBJECTIVE') {
      return 'Gate Keeper';
    }
    if (view.report.action === 'LONG') {
      return 'Ceiling Warden';
    }
    return 'Floor Hunter';
  });
  const rivalSubtitle = $derived.by(() => {
    if (view.report.action === 'LONG') {
      return `Pressuring ${view.report.weakLink.toLowerCase()} from above`;
    }
    return `Guarding ${view.report.weakLink.toLowerCase()} from below`;
  });
  const turnBanner = $derived(view.encounter.turnLabel);
  const rivalUnits = $derived.by(() => {
    const fromAbove = view.report.action === 'LONG';
    const baseIndex = fromAbove ? view.activeSlice.end - 1 : view.activeSlice.start + 1;
    const prices = fromAbove
      ? [view.priceRange.max - 3.2, view.priceRange.max - 5.6, view.priceRange.max - 7.8]
      : [view.priceRange.min + 3.2, view.priceRange.min + 5.6, view.priceRange.min + 7.8];
    const forms = ['warden', 'lancer', 'seer'] as const;
    return forms.map((form, index) => ({
      id: `rival-${form}`,
      form,
      xIndex: Math.max(0, Math.min(view.candles.length - 1, baseIndex - index)),
      price: prices[index],
      label: form === 'warden' ? 'Warden' : form === 'lancer' ? 'Lancer' : 'Seer',
    }));
  });
  const clashFocus = $derived.by(() => {
    const focusIndex = objectiveZone
      ? view.activeSlice.end - 1
      : Math.round((view.activeSlice.start + view.activeSlice.end) / 2);
    const focusPrice = objectiveZone?.price ?? view.candles[focusIndex]?.close ?? view.priceRange.min;
    return {
      xIndex: Math.max(0, Math.min(view.candles.length - 1, focusIndex)),
      price: focusPrice,
    };
  });
  const clashSparks = $derived.by(() => {
    const direction = view.report.action === 'LONG' ? -1 : 1;
    return [
      { id: 'spark-north', xIndex: clashFocus.xIndex, price: clashFocus.price + direction * 2.1, rotate: -18, shiftX: -34, shiftY: -12 },
      { id: 'spark-east', xIndex: clashFocus.xIndex + 1, price: clashFocus.price + direction * 0.7, rotate: 22, shiftX: 34, shiftY: 8 },
      { id: 'spark-west', xIndex: clashFocus.xIndex - 1, price: clashFocus.price - direction * 0.8, rotate: -34, shiftX: -40, shiftY: 18 },
    ].map((spark) => ({
      ...spark,
      xIndex: Math.max(0, Math.min(view.candles.length - 1, spark.xIndex)),
    }));
  });
  const allyLinks = $derived.by(() => {
    const curveOffset = view.report.action === 'LONG' ? -52 : 52;
    return view.companions.map((companion, index) => ({
      id: `ally-link-${companion.agent.id}`,
      d: curvedLinkPath(companion.xIndex, companion.price, clashFocus.xIndex, clashFocus.price, curveOffset + index * 10),
      width: companion.stance === 'finish' ? 5 : companion.stance === 'brace' ? 4 : 3.4,
      x: xFor(companion.xIndex),
      y: yFor(companion.price),
      boost: companion.stance === 'brace' || companion.stance === 'finish',
    }));
  });
  const rivalLinks = $derived.by(() => {
    const curveOffset = view.report.action === 'LONG' ? 48 : -48;
    return rivalUnits.map((rival, index) => ({
      id: `rival-link-${rival.id}`,
      d: curvedLinkPath(rival.xIndex, rival.price, clashFocus.xIndex, clashFocus.price, curveOffset - index * 10),
      width: index === 0 ? 4.4 : 3.2,
      x: xFor(rival.xIndex),
      y: yFor(rival.price),
      lead: index === 0,
    }));
  });
  const resolveLabel = $derived.by(() => {
    if (view.session.outcome === 'WIN') {
      return objectiveZone ? 'Gate Broken' : 'Push Held';
    }
    if (view.session.outcome === 'LOSS') {
      return objectiveZone ? 'Push Rejected' : 'Line Broken';
    }
    const selected = selectedCommandCard?.label.toLowerCase() ?? '';
    if (selected.includes('memory')) return 'Recall Spike';
    if (selected.includes('risk')) return 'Brace Window';
    if (selected.includes('retarget')) return 'Angle Shift';
    return view.report.action === 'LONG' ? 'Upward Commit' : 'Downward Commit';
  });
  const resolveTone = $derived.by(() => {
    if (view.session.outcome === 'WIN') return 'good';
    if (view.session.outcome === 'LOSS') return 'danger';
    return selectedCommandCard?.tone ?? 'info';
  });
</script>

<article class="battlefield">
  <div class="battlefield__stage">
    <div class="battlefield__duel-strip">
      <div class="battlefield__fighter-card battlefield__fighter-card--player">
        <div class="battlefield__fighter-avatar battlefield__fighter-avatar--player">
          <PixelSprite agent={selectedAgent} size={58} />
        </div>
        <div class="battlefield__fighter-copy">
          <small>Trainer Squad</small>
          <strong>{selectedAgent.name}</strong>
          <span>{selectedAgent.role} anchor</span>
        </div>
      </div>

      <div class="battlefield__turn-banner">
        <small>{view.encounter.phaseLabel}</small>
        <strong>{turnBanner}</strong>
      </div>

      <div class="battlefield__fighter-card battlefield__fighter-card--rival">
        <div class="battlefield__fighter-avatar battlefield__fighter-avatar--rival">
          <div class="battlefield__rival-emblem"></div>
        </div>
        <div class="battlefield__fighter-copy">
          <small>Rival Pressure</small>
          <strong>{rivalTitle}</strong>
          <span>{rivalSubtitle}</span>
        </div>
      </div>
    </div>

    <svg aria-label="Chart battlefield" class="battlefield__svg" viewBox={`0 0 ${svgWidth} ${svgHeight}`}>
      <defs>
        <linearGradient id="battlefield-sky" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stop-color="#21313b" />
          <stop offset="44%" stop-color="#25353b" />
          <stop offset="100%" stop-color="#1d2d29" />
        </linearGradient>
        <linearGradient id="battlefield-active" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stop-color="rgba(248, 221, 150, 0.18)" />
          <stop offset="100%" stop-color="rgba(248, 221, 150, 0.04)" />
        </linearGradient>
        <linearGradient id="battlefield-terrain" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stop-color="rgba(108, 148, 118, 0.92)" />
          <stop offset="48%" stop-color="rgba(76, 118, 93, 0.94)" />
          <stop offset="100%" stop-color="rgba(58, 88, 68, 0.98)" />
        </linearGradient>
        <linearGradient id="battlefield-ground" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stop-color="#304639" />
          <stop offset="100%" stop-color="#233429" />
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
      <circle cx="800" cy="94" fill="rgba(233, 201, 123, 0.42)" r="48" />

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
        <text fill="rgba(232, 223, 196, 0.84)" font-size="12" letter-spacing="0.08em" x={padding.left + 10} y={yFor(zone.price) - 8}>
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

      {#if objectiveZone}
        <g opacity="0.96">
          <line
            stroke={view.report.action === 'LONG' ? 'rgba(84, 158, 108, 0.44)' : 'rgba(188, 96, 82, 0.42)'}
            stroke-dasharray="6 7"
            stroke-width="2"
            x1={xFor(objectiveAnchor.xIndex)}
            x2={xFor(objectiveAnchor.xIndex)}
            y1={yFor(objectiveZone.price) - 90}
            y2={yFor(objectiveZone.price) + 62}
          />
          <rect
            fill={view.report.action === 'LONG' ? 'rgba(109, 161, 93, 0.9)' : 'rgba(169, 98, 76, 0.88)'}
            height="68"
            rx="8"
            width="16"
            x={xFor(objectiveAnchor.xIndex) - 42}
            y={yFor(objectiveZone.price) - 22}
          />
          <rect
            fill={view.report.action === 'LONG' ? 'rgba(109, 161, 93, 0.9)' : 'rgba(169, 98, 76, 0.88)'}
            height="68"
            rx="8"
            width="16"
            x={xFor(objectiveAnchor.xIndex) + 26}
            y={yFor(objectiveZone.price) - 22}
          />
          <path
            d={`M ${xFor(objectiveAnchor.xIndex) - 34} ${yFor(objectiveZone.price) - 10} Q ${xFor(objectiveAnchor.xIndex)} ${yFor(objectiveZone.price) - 62} ${xFor(objectiveAnchor.xIndex) + 34} ${yFor(objectiveZone.price) - 10}`}
            fill="none"
            stroke={view.report.action === 'LONG' ? 'rgba(231, 213, 148, 0.96)' : 'rgba(243, 189, 176, 0.94)'}
            stroke-linecap="round"
            stroke-width="8"
          />
          <rect
            fill={view.report.action === 'LONG' ? 'rgba(247, 228, 170, 0.96)' : 'rgba(248, 212, 204, 0.94)'}
            height="16"
            rx="6"
            width="58"
            x={xFor(objectiveAnchor.xIndex) - 29}
            y={yFor(objectiveZone.price) - 2}
          />
          <circle
            cx={xFor(objectiveAnchor.xIndex)}
            cy={yFor(objectiveZone.price) - 24}
            fill={view.report.action === 'LONG' ? 'rgba(248, 221, 138, 0.94)' : 'rgba(240, 158, 143, 0.92)'}
            r="10"
          />
          <text
            fill="rgba(102, 80, 48, 0.92)"
            font-size="11"
            font-weight="700"
            letter-spacing="0.08em"
            text-anchor="middle"
            x={xFor(objectiveAnchor.xIndex)}
            y={yFor(objectiveZone.price) + 40}
          >
            GATE
          </text>
        </g>
      {/if}

      {#each allyLinks as link}
        <path
          class:boost={link.boost}
          class="battlefield__engagement-line battlefield__engagement-line--ally"
          d={link.d}
          stroke-width={link.width}
        />
        <circle class="battlefield__engagement-node battlefield__engagement-node--ally" cx={link.x} cy={link.y} r="5" />
      {/each}

      {#each rivalLinks as link}
        <path
          class:lead={link.lead}
          class="battlefield__engagement-line battlefield__engagement-line--rival"
          d={link.d}
          stroke-width={link.width}
        />
        <circle class="battlefield__engagement-node battlefield__engagement-node--rival" cx={link.x} cy={link.y} r="5" />
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
      <div
        class:long={view.report.action === 'LONG'}
        class:short={view.report.action !== 'LONG'}
        class="battlefield__impact-sigil"
        style={companionStyle(clashFocus.xIndex, clashFocus.price)}
      >
        <div class="battlefield__impact-core"></div>
        <div class="battlefield__impact-ring"></div>
        <div class="battlefield__impact-ring battlefield__impact-ring--outer"></div>
        <div class="battlefield__impact-label">{selectedCommandCard?.label ?? 'Clash'}</div>
      </div>

      {#if objectiveZone}
        <div
          class={`battlefield__resolve-pill battlefield__resolve-pill--${resolveTone}`}
          style={companionStyle(objectiveAnchor.xIndex, objectiveAnchor.price - 3)}
        >
          <small>Resolve</small>
          <strong>{resolveLabel}</strong>
        </div>
      {/if}

      {#each clashSparks as spark}
        <div
          class:long={view.report.action === 'LONG'}
          class:short={view.report.action !== 'LONG'}
          class="battlefield__spark"
          style={`${companionStyle(spark.xIndex, spark.price)}--spark-rotate:${spark.rotate}deg;--spark-shift-x:${spark.shiftX}px;--spark-shift-y:${spark.shiftY}px;`}
        ></div>
      {/each}

      {#each rivalUnits as rival}
        <div class={`battlefield__rival-unit battlefield__rival-unit--${rival.form}`} style={companionStyle(rival.xIndex, rival.price)}>
          <div class="battlefield__rival-shadow"></div>
          <div class="battlefield__rival-body">
            <div class="battlefield__rival-core"></div>
            <div class="battlefield__rival-accent"></div>
          </div>
          <div class="battlefield__rival-tag">{rival.label}</div>
        </div>
      {/each}

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

      <div class="battlefield__command-plaque">
        <small>Selected Command</small>
        <strong>{selectedCommandCard?.label ?? 'Command locked'}</strong>
        <span>{selectedCommandCard?.summary ?? view.pressureLabel}</span>
      </div>
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
    position: relative;
    overflow: hidden;
    display: grid;
    gap: 10px;
    padding: 18px;
    border-radius: 28px;
    background:
      radial-gradient(circle at top right, rgba(255, 211, 109, 0.1), transparent 24%),
      radial-gradient(circle at bottom left, rgba(103, 169, 138, 0.1), transparent 22%),
      linear-gradient(180deg, rgba(17, 24, 29, 0.98), rgba(12, 18, 22, 0.98));
    border: 1px solid rgba(111, 127, 119, 0.24);
    box-shadow:
      inset 0 1px 0 rgba(255, 255, 255, 0.08),
      0 26px 60px rgba(7, 12, 14, 0.32);
    color: #edf1e8;
  }

  .battlefield::before {
    content: '';
    position: absolute;
    inset: 0;
    pointer-events: none;
    background:
      linear-gradient(rgba(168, 156, 110, 0.04) 1px, transparent 1px),
      linear-gradient(90deg, rgba(168, 156, 110, 0.04) 1px, transparent 1px),
      radial-gradient(circle at center, transparent 48%, rgba(46, 55, 42, 0.08) 100%);
    background-size: 28px 28px, 28px 28px, auto;
    opacity: 0.72;
  }

  .battlefield > * {
    position: relative;
    z-index: 1;
  }

  .battlefield__stage {
    position: relative;
    aspect-ratio: 16 / 8.4;
    min-height: 300px;
  }

  .battlefield__duel-strip {
    position: absolute;
    inset: 12px 14px auto;
    z-index: 3;
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
    gap: 12px;
    align-items: start;
    pointer-events: none;
  }

  .battlefield__fighter-card,
  .battlefield__turn-banner,
  .battlefield__command-plaque {
    border: 1px solid rgba(127, 131, 109, 0.24);
    box-shadow: 0 12px 22px rgba(83, 72, 43, 0.18);
    backdrop-filter: blur(10px);
  }

  .battlefield__fighter-card {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 8px 10px;
    border-radius: 18px;
    background: rgba(15, 24, 28, 0.78);
  }

  .battlefield__fighter-card--rival {
    justify-self: end;
    background: rgba(30, 18, 20, 0.74);
  }

  .battlefield__fighter-avatar {
    width: 58px;
    height: 58px;
    display: grid;
    place-items: center;
    border-radius: 16px;
    flex: 0 0 auto;
  }

  .battlefield__fighter-avatar--player {
    background: linear-gradient(180deg, rgba(36, 72, 63, 0.96), rgba(24, 49, 43, 0.92));
  }

  .battlefield__fighter-avatar--rival {
    background: linear-gradient(180deg, rgba(84, 44, 40, 0.96), rgba(53, 28, 27, 0.92));
  }

  .battlefield__rival-emblem {
    width: 32px;
    height: 32px;
    border-radius: 12px 12px 16px 16px;
    background:
      linear-gradient(180deg, rgba(221, 112, 94, 0.94), rgba(146, 71, 59, 0.98));
    clip-path: polygon(50% 0%, 78% 18%, 100% 56%, 70% 100%, 30% 100%, 0% 56%, 22% 18%);
    box-shadow:
      0 0 0 6px rgba(225, 134, 118, 0.12),
      inset 0 1px 0 rgba(255, 255, 255, 0.24);
  }

  .battlefield__fighter-copy {
    display: grid;
    gap: 2px;
    min-width: 0;
  }

  .battlefield__fighter-copy small {
    color: rgba(194, 206, 199, 0.66);
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  .battlefield__fighter-copy strong {
    font-size: 1rem;
    color: #f4edd8;
  }

  .battlefield__fighter-copy span {
    color: rgba(206, 217, 211, 0.72);
    font-size: 0.78rem;
    line-height: 1.35;
  }

  .battlefield__turn-banner {
    justify-self: center;
    display: grid;
    gap: 2px;
    padding: 8px 14px;
    border-radius: 18px;
    background: rgba(36, 52, 48, 0.84);
    text-align: center;
  }

  .battlefield__turn-banner small {
    color: rgba(213, 222, 209, 0.7);
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }

  .battlefield__turn-banner strong {
    color: #f1cf88;
    font-size: 1rem;
  }

  .battlefield__svg {
    width: 100%;
    height: 100%;
    display: block;
    border-radius: 24px;
    border: 1px solid rgba(111, 127, 119, 0.18);
    box-shadow:
      inset 0 0 0 1px rgba(255, 255, 255, 0.06),
      0 14px 26px rgba(8, 13, 15, 0.24);
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

  .battlefield__engagement-line,
  .battlefield__engagement-node {
    fill: none;
    pointer-events: none;
  }

  .battlefield__engagement-line {
    stroke-linecap: round;
    stroke-dasharray: 10 8;
    animation: battlefield-lane-flow 1400ms linear infinite;
  }

  .battlefield__engagement-line--ally {
    stroke: rgba(86, 177, 118, 0.84);
    filter: drop-shadow(0 0 8px rgba(137, 219, 166, 0.22));
  }

  .battlefield__engagement-line--ally.boost {
    stroke: rgba(244, 214, 126, 0.9);
  }

  .battlefield__engagement-line--rival {
    stroke: rgba(213, 110, 94, 0.82);
    filter: drop-shadow(0 0 8px rgba(224, 151, 138, 0.18));
    animation-direction: reverse;
  }

  .battlefield__engagement-line--rival.lead {
    stroke: rgba(232, 144, 126, 0.92);
  }

  .battlefield__engagement-node {
    animation: battlefield-node-pulse 1200ms ease-in-out infinite;
  }

  .battlefield__engagement-node--ally {
    fill: rgba(244, 225, 169, 0.94);
    stroke: rgba(86, 177, 118, 0.86);
    stroke-width: 2;
  }

  .battlefield__engagement-node--rival {
    fill: rgba(248, 221, 215, 0.94);
    stroke: rgba(213, 110, 94, 0.84);
    stroke-width: 2;
  }

  .battlefield__overlay {
    position: absolute;
    inset: 0;
    pointer-events: none;
  }

  .battlefield__impact-sigil,
  .battlefield__spark {
    position: absolute;
    transform: translate(-50%, -50%);
  }

  .battlefield__impact-sigil {
    width: 92px;
    height: 92px;
    z-index: 2;
    display: grid;
    place-items: center;
  }

  .battlefield__impact-core,
  .battlefield__impact-ring {
    position: absolute;
    inset: 50% auto auto 50%;
    transform: translate(-50%, -50%);
    border-radius: 999px;
  }

  .battlefield__impact-core {
    width: 18px;
    height: 18px;
    box-shadow: 0 0 22px rgba(255, 235, 190, 0.36);
    animation: battlefield-impact-core 880ms ease-in-out infinite;
  }

  .battlefield__impact-sigil.long .battlefield__impact-core {
    background: linear-gradient(180deg, rgba(95, 191, 130, 0.98), rgba(51, 130, 87, 0.98));
  }

  .battlefield__impact-sigil.short .battlefield__impact-core {
    background: linear-gradient(180deg, rgba(223, 116, 98, 0.98), rgba(154, 73, 63, 0.98));
  }

  .battlefield__impact-ring {
    width: 54px;
    height: 54px;
    border: 2px solid rgba(255, 243, 212, 0.92);
    opacity: 0.76;
    animation: battlefield-impact-ring 1600ms ease-out infinite;
  }

  .battlefield__impact-ring--outer {
    width: 82px;
    height: 82px;
    border-style: dashed;
    border-width: 3px;
    opacity: 0.48;
    animation-duration: 2100ms;
  }

  .battlefield__impact-sigil.long .battlefield__impact-ring {
    border-color: rgba(141, 222, 170, 0.84);
  }

  .battlefield__impact-sigil.short .battlefield__impact-ring {
    border-color: rgba(236, 152, 137, 0.84);
  }

  .battlefield__impact-label {
    position: absolute;
    inset: auto auto -16px 50%;
    transform: translateX(-50%);
    min-width: max-content;
    max-width: 138px;
    padding: 5px 9px;
    border-radius: 999px;
    background: rgba(255, 248, 234, 0.94);
    border: 1px solid rgba(151, 143, 111, 0.18);
    box-shadow: 0 10px 18px rgba(117, 104, 69, 0.12);
    color: rgba(86, 80, 58, 0.94);
    font-size: 0.64rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    text-align: center;
  }

  .battlefield__spark {
    width: 32px;
    height: 8px;
    border-radius: 999px;
    opacity: 0.88;
    z-index: 2;
    transform: translate(calc(-50% + var(--spark-shift-x, 0px)), calc(-50% + var(--spark-shift-y, 0px)))
      rotate(var(--spark-rotate, 0deg));
    box-shadow: 0 0 16px rgba(255, 239, 204, 0.3);
    animation: battlefield-spark-flicker 1150ms ease-in-out infinite;
  }

  .battlefield__spark.long {
    background: linear-gradient(90deg, rgba(255, 239, 204, 0), rgba(118, 207, 149, 0.96), rgba(255, 239, 204, 0));
  }

  .battlefield__spark.short {
    background: linear-gradient(90deg, rgba(255, 236, 231, 0), rgba(228, 125, 109, 0.96), rgba(255, 236, 231, 0));
  }

  .battlefield__companion,
  .battlefield__rival-unit,
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

  .battlefield__rival-unit {
    display: grid;
    gap: 4px;
    justify-items: center;
    z-index: 1;
  }

  .battlefield__resolve-pill {
    position: absolute;
    z-index: 2;
    display: grid;
    gap: 2px;
    min-width: 124px;
    padding: 8px 10px;
    border-radius: 16px;
    border: 1px solid rgba(114, 127, 119, 0.22);
    background: rgba(18, 28, 32, 0.9);
    box-shadow: 0 14px 26px rgba(8, 13, 15, 0.2);
    transform: translate(-50%, -50%);
    text-align: center;
    animation: battlefield-resolve-bob 1500ms ease-in-out infinite;
  }

  .battlefield__resolve-pill small {
    color: rgba(196, 206, 198, 0.68);
    font-size: 0.62rem;
    letter-spacing: 0.1em;
    text-transform: uppercase;
  }

  .battlefield__resolve-pill strong {
    color: #f4edd8;
    font-size: 0.86rem;
  }

  .battlefield__resolve-pill--good {
    background: rgba(21, 43, 34, 0.94);
    border-color: rgba(109, 171, 105, 0.22);
  }

  .battlefield__resolve-pill--danger {
    background: rgba(50, 24, 24, 0.92);
    border-color: rgba(190, 104, 89, 0.22);
  }

  .battlefield__resolve-pill--secondary {
    background: rgba(18, 34, 44, 0.92);
    border-color: rgba(108, 146, 178, 0.2);
  }

  .battlefield__resolve-pill--info {
    background: rgba(49, 40, 22, 0.92);
    border-color: rgba(196, 156, 74, 0.2);
  }

  .battlefield__rival-shadow {
    width: 38px;
    height: 10px;
    margin-bottom: -14px;
    border-radius: 999px;
    background: rgba(103, 53, 47, 0.22);
    filter: blur(1px);
  }

  .battlefield__rival-body {
    width: 42px;
    height: 42px;
    position: relative;
    display: grid;
    place-items: center;
    border-radius: 16px;
    background: linear-gradient(180deg, rgba(68, 37, 33, 0.96), rgba(44, 23, 22, 0.92));
    border: 1px solid rgba(173, 112, 100, 0.14);
    box-shadow: 0 8px 18px rgba(17, 10, 10, 0.22);
    animation: battlefield-rival-hover 1750ms ease-in-out infinite;
  }

  .battlefield__rival-core,
  .battlefield__rival-accent {
    position: absolute;
    inset: 50% auto auto 50%;
    transform: translate(-50%, -50%);
  }

  .battlefield__rival-core {
    width: 20px;
    height: 20px;
    background: linear-gradient(180deg, rgba(214, 102, 83, 0.96), rgba(139, 62, 54, 0.98));
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.22);
  }

  .battlefield__rival-accent {
    width: 30px;
    height: 30px;
    opacity: 0.18;
    background: rgba(214, 102, 83, 0.92);
  }

  .battlefield__rival-unit--warden .battlefield__rival-core {
    border-radius: 8px 8px 12px 12px;
    clip-path: polygon(50% 0%, 86% 18%, 100% 58%, 72% 100%, 28% 100%, 0% 58%, 14% 18%);
  }

  .battlefield__rival-unit--warden .battlefield__rival-accent {
    border-radius: 12px;
    clip-path: polygon(50% 0%, 86% 18%, 100% 58%, 72% 100%, 28% 100%, 0% 58%, 14% 18%);
  }

  .battlefield__rival-unit--lancer .battlefield__rival-core {
    width: 18px;
    height: 24px;
    border-radius: 6px;
    clip-path: polygon(50% 0%, 100% 42%, 64% 100%, 36% 100%, 0% 42%);
  }

  .battlefield__rival-unit--lancer .battlefield__rival-accent {
    clip-path: polygon(50% 0%, 100% 42%, 64% 100%, 36% 100%, 0% 42%);
  }

  .battlefield__rival-unit--seer .battlefield__rival-core {
    width: 22px;
    height: 22px;
    border-radius: 999px;
  }

  .battlefield__rival-unit--seer .battlefield__rival-accent {
    width: 34px;
    height: 16px;
    border-radius: 999px;
  }

  .battlefield__rival-tag {
    padding: 4px 8px;
    border-radius: 999px;
    background: rgba(43, 22, 22, 0.88);
    border: 1px solid rgba(176, 122, 109, 0.14);
    font-size: 0.62rem;
    letter-spacing: 0.08em;
    color: rgba(236, 208, 202, 0.92);
    text-transform: uppercase;
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
    background: rgba(19, 32, 34, 0.74);
    border: 1px solid rgba(128, 145, 138, 0.12);
    box-shadow: 0 8px 18px rgba(7, 12, 14, 0.2);
    animation: battlefield-ally-bob 1900ms ease-in-out infinite;
  }

  .battlefield__role-tag {
    padding: 4px 9px;
    border-radius: 999px;
    background: rgba(18, 30, 33, 0.88);
    border: 1px solid rgba(128, 145, 138, 0.14);
    font-size: 0.66rem;
    letter-spacing: 0.08em;
    color: rgba(216, 226, 220, 0.88);
  }

  .battlefield__callout {
    max-width: 192px;
    display: grid;
    gap: 4px;
    padding: 10px 12px;
    border-radius: 16px;
    background: rgba(17, 28, 32, 0.84);
    border: 1px solid rgba(128, 145, 138, 0.18);
    box-shadow: 0 18px 32px rgba(7, 12, 14, 0.22);
  }

  .battlefield__callout strong {
    font-size: 0.72rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  .battlefield__callout span {
    font-size: 0.76rem;
    line-height: 1.4;
    color: rgba(210, 219, 214, 0.76);
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

  .battlefield__command-plaque {
    position: absolute;
    left: 18px;
    bottom: 14px;
    max-width: 248px;
    display: grid;
    gap: 4px;
    padding: 10px 12px;
    border-radius: 18px;
    background: rgba(33, 49, 45, 0.84);
  }

  .battlefield__command-plaque small {
    color: rgba(205, 216, 200, 0.68);
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  .battlefield__command-plaque strong {
    color: #f7f0db;
    font-size: 0.98rem;
  }

  .battlefield__command-plaque span {
    color: rgba(218, 225, 213, 0.72);
    font-size: 0.76rem;
    line-height: 1.4;
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

  @keyframes battlefield-lane-flow {
    from {
      stroke-dashoffset: 0;
    }
    to {
      stroke-dashoffset: -36;
    }
  }

  @keyframes battlefield-node-pulse {
    0%,
    100% {
      opacity: 0.72;
      transform: scale(0.96);
    }
    50% {
      opacity: 1;
      transform: scale(1.08);
    }
  }

  @keyframes battlefield-impact-core {
    0%,
    100% {
      transform: translate(-50%, -50%) scale(0.94);
      box-shadow: 0 0 18px rgba(255, 235, 190, 0.3);
    }
    50% {
      transform: translate(-50%, -50%) scale(1.12);
      box-shadow: 0 0 28px rgba(255, 235, 190, 0.52);
    }
  }

  @keyframes battlefield-impact-ring {
    0% {
      transform: translate(-50%, -50%) scale(0.84);
      opacity: 0.78;
    }
    100% {
      transform: translate(-50%, -50%) scale(1.16);
      opacity: 0.14;
    }
  }

  @keyframes battlefield-spark-flicker {
    0%,
    100% {
      opacity: 0.38;
    }
    40% {
      opacity: 0.98;
    }
    70% {
      opacity: 0.62;
    }
  }

  @keyframes battlefield-resolve-bob {
    0%,
    100% {
      transform: translate(-50%, -50%);
    }
    50% {
      transform: translate(-50%, calc(-50% - 5px));
    }
  }

  @keyframes battlefield-rival-hover {
    0%,
    100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-5px);
    }
  }

  @keyframes battlefield-ally-bob {
    0%,
    100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-4px);
    }
  }

  @media (max-width: 900px) {
    .battlefield__duel-strip {
      grid-template-columns: 1fr;
      inset: 12px 12px auto;
    }

    .battlefield__fighter-card--rival,
    .battlefield__turn-banner {
      justify-self: stretch;
    }

    .battlefield__phases,
    .battlefield__meters,
    .battlefield__brief-row {
      grid-template-columns: 1fr;
    }

    .battlefield__callout {
      max-width: 140px;
    }

    .battlefield__command-plaque {
      left: 12px;
      right: 12px;
      max-width: none;
      bottom: 12px;
    }

    .battlefield__resolve-pill {
      min-width: 108px;
      padding: 7px 9px;
    }
  }
</style>
