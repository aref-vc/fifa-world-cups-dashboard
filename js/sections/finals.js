/* Finals Section - Final Showdowns */

function initFinals() {
  const container = document.getElementById('finals-chart');
  if (!container || !DATA.finals) return;

  const finals = DATA.finals;

  container.innerHTML = '';

  // Create layout: Timeline strip on top, scatter plot below
  const wrapper = document.createElement('div');
  wrapper.style.display = 'flex';
  wrapper.style.flexDirection = 'column';
  wrapper.style.gap = '50px';
  container.appendChild(wrapper);

  // ============================================
  // Timeline Strip - All 22 Finals
  // ============================================
  const timelineContainer = document.createElement('div');
  timelineContainer.id = 'finals-timeline';
  wrapper.appendChild(timelineContainer);

  const tlWidth = container.clientWidth || 1200;
  const tlHeight = 200;
  const tlMargin = { top: 40, right: 40, bottom: 40, left: 40 };
  const tlInnerWidth = tlWidth - tlMargin.left - tlMargin.right;
  const tlInnerHeight = tlHeight - tlMargin.top - tlMargin.bottom;

  const tlSvg = d3.select(timelineContainer)
    .append('svg')
    .attr('width', tlWidth)
    .attr('height', tlHeight);

  const tlG = tlSvg.append('g')
    .attr('transform', `translate(${tlMargin.left},${tlMargin.top})`);

  // Title - bold uppercase
  tlSvg.append('text')
    .attr('class', 'chart-title')
    .attr('x', tlWidth / 2)
    .attr('y', 20)
    .attr('text-anchor', 'middle')
    .attr('fill', Utils.colors.textSecondary)
    .attr('font-size', '14px')
    .style('font-weight', 'bold')
    .text('WORLD CUP FINALS TIMELINE (1930-2022)');

  // X scale for years
  const xTl = d3.scalePoint()
    .domain(finals.map(d => d.year))
    .range([0, tlInnerWidth])
    .padding(0.5);

  // Draw timeline axis
  tlG.append('line')
    .attr('x1', 0)
    .attr('x2', tlInnerWidth)
    .attr('y1', tlInnerHeight / 2)
    .attr('y2', tlInnerHeight / 2)
    .attr('stroke', Utils.colors.border)
    .attr('stroke-width', 2);

  // Draw year ticks
  tlG.selectAll('.year-tick')
    .data(finals)
    .enter()
    .append('line')
    .attr('class', 'year-tick')
    .attr('x1', d => xTl(d.year))
    .attr('x2', d => xTl(d.year))
    .attr('y1', tlInnerHeight / 2 - 5)
    .attr('y2', tlInnerHeight / 2 + 5)
    .attr('stroke', Utils.colors.textTertiary)
    .attr('stroke-width', 1);

  // Score visualization - stacked bars showing goals
  const barWidth = Math.min(20, (tlInnerWidth / finals.length) - 4);
  const goalScale = d3.scaleLinear()
    .domain([0, d3.max(finals, d => d.totalGoals)])
    .range([0, tlInnerHeight / 2 - 15]);

  // Winner bar (above line)
  tlG.selectAll('.winner-bar')
    .data(finals)
    .enter()
    .append('rect')
    .attr('class', 'winner-bar')
    .attr('x', d => xTl(d.year) - barWidth / 2)
    .attr('y', d => tlInnerHeight / 2 - goalScale(d.winnerScore))
    .attr('width', barWidth)
    .attr('height', d => goalScale(d.winnerScore))
    .attr('fill', Utils.colors.lime)
    .attr('rx', 2)
    .style('cursor', 'pointer');

  // Loser bar (below line)
  tlG.selectAll('.loser-bar')
    .data(finals)
    .enter()
    .append('rect')
    .attr('class', 'loser-bar')
    .attr('x', d => xTl(d.year) - barWidth / 2)
    .attr('y', tlInnerHeight / 2)
    .attr('width', barWidth)
    .attr('height', d => goalScale(d.loserScore))
    .attr('fill', Utils.colors.coral)
    .attr('rx', 2)
    .style('cursor', 'pointer');

  // Year labels (alternating above/below)
  tlG.selectAll('.year-label')
    .data(finals)
    .enter()
    .append('text')
    .attr('class', 'year-label')
    .attr('x', d => xTl(d.year))
    .attr('y', (d, i) => i % 2 === 0 ? -5 : tlInnerHeight + 15)
    .attr('text-anchor', 'middle')
    .attr('fill', Utils.colors.textTertiary)
    .attr('font-size', '9px')
    .text(d => `'${String(d.year).slice(2)}`);

  // Hover areas for tooltips
  tlG.selectAll('.final-hover')
    .data(finals)
    .enter()
    .append('rect')
    .attr('class', 'final-hover')
    .attr('x', d => xTl(d.year) - barWidth)
    .attr('y', 0)
    .attr('width', barWidth * 2)
    .attr('height', tlInnerHeight)
    .attr('fill', 'transparent')
    .style('cursor', 'pointer')
    .on('mouseenter', function(event, d) {
      Utils.showTooltip(`
        <div class="tooltip-title" style="color: ${Utils.colors.amber}">${d.year} Final</div>
        <div style="margin: 8px 0;">
          <span style="color: ${Utils.colors.lime}">${d.winner}</span>
          <span style="color: ${Utils.colors.textTertiary}"> ${d.winnerScore} - ${d.loserScore} </span>
          <span style="color: ${Utils.colors.coral}">${d.loser}</span>
        </div>
        <div>Host: <span style="color: ${Utils.colors.cyan}">${d.host}</span></div>
        ${d.extraTime ? `<div style="color: ${Utils.colors.amber}; margin-top: 4px;">After Extra Time</div>` : ''}
        ${d.penalties ? `<div style="color: ${Utils.colors.amber}; margin-top: 4px;">Decided on Penalties</div>` : ''}
      `, event.pageX, event.pageY);
    })
    .on('mouseleave', function() {
      Utils.hideTooltip();
    });

  // Legend - bottom center with circles
  const tlLegend = tlSvg.append('g')
    .attr('transform', `translate(${tlWidth / 2 - 70}, ${tlHeight - 15})`);

  tlLegend.append('circle')
    .attr('cx', 0)
    .attr('cy', 0)
    .attr('r', 5)
    .attr('fill', Utils.colors.lime);

  tlLegend.append('text')
    .attr('x', 12)
    .attr('y', 4)
    .attr('fill', Utils.colors.textTertiary)
    .attr('font-size', '11px')
    .text('Winner');

  tlLegend.append('circle')
    .attr('cx', 80)
    .attr('cy', 0)
    .attr('r', 5)
    .attr('fill', Utils.colors.coral);

  tlLegend.append('text')
    .attr('x', 92)
    .attr('y', 4)
    .attr('fill', Utils.colors.textTertiary)
    .attr('font-size', '11px')
    .text('Runner-up');

  // ============================================
  // Bottom Row: Scatter Plot + Final Cards
  // ============================================
  const bottomRow = document.createElement('div');
  bottomRow.style.display = 'grid';
  bottomRow.style.gridTemplateColumns = '1fr 1fr';
  bottomRow.style.gap = '40px';
  wrapper.appendChild(bottomRow);

  // ============================================
  // Scatter Plot - Margin vs Total Goals
  // ============================================
  const scatterContainer = document.createElement('div');
  scatterContainer.id = 'finals-scatter';
  bottomRow.appendChild(scatterContainer);

  const scWidth = (container.clientWidth / 2) - 20 || 500;
  const scHeight = 350;
  const scMargin = { top: 40, right: 30, bottom: 50, left: 50 };
  const scInnerWidth = scWidth - scMargin.left - scMargin.right;
  const scInnerHeight = scHeight - scMargin.top - scMargin.bottom;

  const scSvg = d3.select(scatterContainer)
    .append('svg')
    .attr('width', scWidth)
    .attr('height', scHeight);

  const scG = scSvg.append('g')
    .attr('transform', `translate(${scMargin.left},${scMargin.top})`);

  // Title - bold uppercase
  scSvg.append('text')
    .attr('class', 'chart-title')
    .attr('x', scWidth / 2)
    .attr('y', 20)
    .attr('text-anchor', 'middle')
    .attr('fill', Utils.colors.textSecondary)
    .attr('font-size', '14px')
    .style('font-weight', 'bold')
    .text('FINAL COMPETITIVENESS');

  // Scales
  const xSc = d3.scaleLinear()
    .domain([0, d3.max(finals, d => d.totalGoals) + 1])
    .range([0, scInnerWidth]);

  const ySc = d3.scaleLinear()
    .domain([0, d3.max(finals, d => d.margin) + 1])
    .range([scInnerHeight, 0]);

  // Grid
  scG.selectAll('.grid-x')
    .data(xSc.ticks(6))
    .enter()
    .append('line')
    .attr('class', 'grid-x')
    .attr('x1', d => xSc(d))
    .attr('x2', d => xSc(d))
    .attr('y1', 0)
    .attr('y2', scInnerHeight)
    .attr('stroke', Utils.colors.border)
    .attr('stroke-opacity', 0.3);

  scG.selectAll('.grid-y')
    .data(ySc.ticks(5))
    .enter()
    .append('line')
    .attr('class', 'grid-y')
    .attr('x1', 0)
    .attr('x2', scInnerWidth)
    .attr('y1', d => ySc(d))
    .attr('y2', d => ySc(d))
    .attr('stroke', Utils.colors.border)
    .attr('stroke-opacity', 0.3);

  // Draw points
  scG.selectAll('.final-point')
    .data(finals)
    .enter()
    .append('circle')
    .attr('class', 'final-point')
    .attr('cx', d => xSc(d.totalGoals))
    .attr('cy', d => ySc(d.margin))
    .attr('r', d => d.penalties ? 10 : 7)
    .attr('fill', d => {
      if (d.penalties) return Utils.colors.amber;
      if (d.margin === 0) return Utils.colors.cyan; // Shouldn't happen in finals
      if (d.margin === 1) return Utils.colors.emerald;
      return Utils.colors.coral;
    })
    .attr('stroke', Utils.colors.bgMain)
    .attr('stroke-width', 2)
    .attr('opacity', 0.9)
    .style('cursor', 'pointer')
    .on('mouseenter', function(event, d) {
      d3.select(this).attr('r', d.penalties ? 14 : 10);
      Utils.showTooltip(`
        <div class="tooltip-title">${d.year} - ${d.host}</div>
        <div style="margin: 6px 0;">
          <span style="color: ${Utils.colors.lime}">${d.winner}</span>
          <span> ${d.winnerScore} - ${d.loserScore} </span>
          <span style="color: ${Utils.colors.coral}">${d.loser}</span>
        </div>
        <div>Total Goals: <span style="color: ${Utils.colors.cyan}">${d.totalGoals}</span></div>
        <div>Victory Margin: <span style="color: ${Utils.colors.amber}">${d.margin}</span></div>
        ${d.penalties ? `<div style="color: ${Utils.colors.amber}; margin-top: 4px;">Penalties</div>` : ''}
      `, event.pageX, event.pageY);
    })
    .on('mouseleave', function(event, d) {
      d3.select(this).attr('r', d.penalties ? 10 : 7);
      Utils.hideTooltip();
    });

  // X Axis
  const xScAxis = scG.append('g')
    .attr('transform', `translate(0,${scInnerHeight})`)
    .call(d3.axisBottom(xSc).ticks(6));

  xScAxis.selectAll('text')
    .attr('fill', Utils.colors.textTertiary)
    .attr('font-size', '10px');

  xScAxis.selectAll('line, path').attr('stroke', Utils.colors.border);

  scG.append('text')
    .attr('x', scInnerWidth / 2)
    .attr('y', scInnerHeight + 35)
    .attr('text-anchor', 'middle')
    .attr('fill', Utils.colors.textTertiary)
    .attr('font-size', '11px')
    .text('Total Goals');

  // Y Axis
  const yScAxis = scG.append('g')
    .call(d3.axisLeft(ySc).ticks(5));

  yScAxis.selectAll('text')
    .attr('fill', Utils.colors.textTertiary)
    .attr('font-size', '10px');

  yScAxis.selectAll('line, path').attr('stroke', Utils.colors.border);

  scG.append('text')
    .attr('transform', 'rotate(-90)')
    .attr('x', -scInnerHeight / 2)
    .attr('y', -35)
    .attr('text-anchor', 'middle')
    .attr('fill', Utils.colors.textTertiary)
    .attr('font-size', '11px')
    .text('Victory Margin');

  // Scatter legend - bottom center with circles
  const legendItems = [
    { color: Utils.colors.emerald, label: '1-goal margin' },
    { color: Utils.colors.coral, label: '2+ goal margin' },
    { color: Utils.colors.amber, label: 'Penalties' }
  ];

  const scLegend = scSvg.append('g')
    .attr('transform', `translate(${scWidth / 2 - 120}, ${scHeight - 10})`);

  legendItems.forEach((item, i) => {
    scLegend.append('circle')
      .attr('cx', i * 90)
      .attr('cy', 0)
      .attr('r', 5)
      .attr('fill', item.color);

    scLegend.append('text')
      .attr('x', i * 90 + 10)
      .attr('y', 4)
      .attr('fill', Utils.colors.textTertiary)
      .attr('font-size', '10px')
      .text(item.label);
  });

  // ============================================
  // Final Cards - Most Memorable
  // ============================================
  const cardsContainer = document.createElement('div');
  cardsContainer.style.display = 'flex';
  cardsContainer.style.flexDirection = 'column';
  cardsContainer.style.gap = '12px';
  bottomRow.appendChild(cardsContainer);

  // Title
  const cardsTitle = document.createElement('h3');
  cardsTitle.textContent = 'Memorable Finals';
  cardsTitle.style.color = Utils.colors.amber;
  cardsTitle.style.marginBottom = '8px';
  cardsTitle.style.fontSize = '14px';
  cardsTitle.style.textTransform = 'uppercase';
  cardsTitle.style.letterSpacing = '0.1em';
  cardsContainer.appendChild(cardsTitle);

  // Select most interesting finals: highest scoring, closest, most recent
  const highestScoring = [...finals].sort((a, b) => b.totalGoals - a.totalGoals)[0];
  const penaltyFinals = finals.filter(f => f.penalties);
  const mostRecent = finals[finals.length - 1];
  const closestNonPenalty = finals.filter(f => !f.penalties && f.margin === 1);
  const biggestMargin = [...finals].sort((a, b) => b.margin - a.margin)[0];

  const memorableFinals = [
    { final: mostRecent, tag: 'Most Recent' },
    { final: highestScoring, tag: 'Highest Scoring' },
    penaltyFinals.length > 0 ? { final: penaltyFinals[penaltyFinals.length - 1], tag: 'Latest Penalty Shootout' } : null,
    closestNonPenalty.length > 0 ? { final: closestNonPenalty[closestNonPenalty.length - 1], tag: 'Closest Contest' } : { final: biggestMargin, tag: 'Biggest Margin' }
  ].filter(f => f && f.final);

  memorableFinals.forEach(({ final, tag }) => {
    const card = document.createElement('div');
    card.className = 'card';
    card.style.padding = '16px';
    card.style.borderLeft = `3px solid ${Utils.colors.amber}`;

    card.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
        <span style="color: ${Utils.colors.amber}; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em;">${tag}</span>
        <span style="color: ${Utils.colors.textTertiary}; font-size: 0.875rem;">${final.year}</span>
      </div>
      <div style="font-size: 1.25rem; margin-bottom: 8px;">
        <span style="color: ${Utils.colors.lime}">${final.winner}</span>
        <span style="color: ${Utils.colors.textTertiary}; font-size: 1rem;"> ${final.winnerScore} - ${final.loserScore} </span>
        <span style="color: ${Utils.colors.coral}">${final.loser}</span>
      </div>
      <div style="font-size: 0.875rem; color: ${Utils.colors.textTertiary};">
        ${final.host}
        ${final.extraTime ? ' · AET' : ''}
        ${final.penalties ? ' · Penalties' : ''}
      </div>
    `;

    cardsContainer.appendChild(card);
  });

  // Summary stats
  const statsDiv = document.createElement('div');
  statsDiv.className = 'card';
  statsDiv.style.marginTop = '12px';
  statsDiv.style.padding = '16px';
  statsDiv.style.background = Utils.colors.bgAccent;

  const totalGoalsInFinals = finals.reduce((sum, f) => sum + f.totalGoals, 0);
  const avgGoals = (totalGoalsInFinals / finals.length).toFixed(1);
  const oneGoalMargins = finals.filter(f => f.margin === 1 && !f.penalties).length;

  statsDiv.innerHTML = `
    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; text-align: center;">
      <div>
        <div style="color: ${Utils.colors.lime}; font-size: 1.5rem; font-weight: 600;">${finals.length}</div>
        <div style="color: ${Utils.colors.textTertiary}; font-size: 0.75rem;">Finals Played</div>
      </div>
      <div>
        <div style="color: ${Utils.colors.cyan}; font-size: 1.5rem; font-weight: 600;">${avgGoals}</div>
        <div style="color: ${Utils.colors.textTertiary}; font-size: 0.75rem;">Avg Goals/Final</div>
      </div>
      <div>
        <div style="color: ${Utils.colors.amber}; font-size: 1.5rem; font-weight: 600;">${penaltyFinals.length}</div>
        <div style="color: ${Utils.colors.textTertiary}; font-size: 0.75rem;">Penalty Shootouts</div>
      </div>
    </div>
  `;

  cardsContainer.appendChild(statsDiv);
}
