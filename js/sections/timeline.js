/* Timeline Section - Tournament Evolution */

function initTimeline() {
  const container = document.getElementById('timeline-chart');
  if (!container || !DATA.tournaments) return;

  const tournaments = DATA.tournaments;

  // Clear container and create wrapper
  container.innerHTML = '';

  const wrapper = document.createElement('div');
  wrapper.style.display = 'grid';
  wrapper.style.gridTemplateColumns = '2fr 1fr';
  wrapper.style.gap = '40px';
  wrapper.style.alignItems = 'start';
  container.appendChild(wrapper);

  // Left: Area chart container
  const areaContainer = document.createElement('div');
  wrapper.appendChild(areaContainer);

  // Right: Decade breakdown container
  const decadeContainer = document.createElement('div');
  wrapper.appendChild(decadeContainer);

  // ============================================
  // LEFT: Area Chart - Tournament Evolution
  // ============================================
  const width = (container.clientWidth * 0.63) || 800;
  const height = 450;
  const margin = { top: 50, right: 60, bottom: 80, left: 60 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  // Create SVG
  const svg = d3.select(areaContainer)
    .append('svg')
    .attr('width', width)
    .attr('height', height);

  const g = svg.append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);

  // Scales
  const x = d3.scaleLinear()
    .domain([1930, 2022])
    .range([0, innerWidth]);

  const yMatches = d3.scaleLinear()
    .domain([0, d3.max(tournaments, d => d.matchCount) * 1.1])
    .range([innerHeight, 0]);

  const yGoals = d3.scaleLinear()
    .domain([0, d3.max(tournaments, d => d.avgGoals) * 1.2])
    .range([innerHeight, 0]);

  // Area generator for matches
  const areaMatches = d3.area()
    .x(d => x(d.year))
    .y0(innerHeight)
    .y1(d => yMatches(d.matchCount))
    .curve(d3.curveMonotoneX);

  // Line generator for avg goals
  const lineGoals = d3.line()
    .x(d => x(d.year))
    .y(d => yGoals(d.avgGoals))
    .curve(d3.curveMonotoneX);

  // Gradient for area
  const gradient = svg.append('defs')
    .append('linearGradient')
    .attr('id', 'area-gradient')
    .attr('x1', '0%')
    .attr('y1', '0%')
    .attr('x2', '0%')
    .attr('y2', '100%');

  gradient.append('stop')
    .attr('offset', '0%')
    .attr('stop-color', Utils.colors.cyan)
    .attr('stop-opacity', 0.6);

  gradient.append('stop')
    .attr('offset', '100%')
    .attr('stop-color', Utils.colors.cyan)
    .attr('stop-opacity', 0.05);

  // Draw area (matches)
  g.append('path')
    .datum(tournaments)
    .attr('fill', 'url(#area-gradient)')
    .attr('d', areaMatches);

  // Draw area border
  g.append('path')
    .datum(tournaments)
    .attr('fill', 'none')
    .attr('stroke', Utils.colors.cyan)
    .attr('stroke-width', 2)
    .attr('d', d3.line()
      .x(d => x(d.year))
      .y(d => yMatches(d.matchCount))
      .curve(d3.curveMonotoneX)
    );

  // Draw avg goals line
  g.append('path')
    .datum(tournaments)
    .attr('fill', 'none')
    .attr('stroke', Utils.colors.lime)
    .attr('stroke-width', 2)
    .attr('stroke-dasharray', '6,4')
    .attr('d', lineGoals);

  // Data points for matches
  g.selectAll('.point-match')
    .data(tournaments)
    .enter()
    .append('circle')
    .attr('class', 'point-match')
    .attr('cx', d => x(d.year))
    .attr('cy', d => yMatches(d.matchCount))
    .attr('r', 5)
    .attr('fill', Utils.colors.bgElevated)
    .attr('stroke', Utils.colors.cyan)
    .attr('stroke-width', 2)
    .style('cursor', 'pointer')
    .on('mouseenter', function(event, d) {
      d3.select(this).attr('r', 8);
      Utils.showTooltip(`
        <div class="tooltip-title">${d.year} ${d.host}</div>
        <div><span style="color: ${Utils.colors.cyan}">${d.matchCount}</span> matches</div>
        <div><span style="color: ${Utils.colors.lime}">${d.avgGoals}</span> avg goals/match</div>
        <div style="margin-top: 8px; color: ${Utils.colors.text}">
          Winner: <span style="color: ${Utils.colors.amber}">${d.winner || 'N/A'}</span>
        </div>
      `, event.pageX, event.pageY);
    })
    .on('mouseleave', function() {
      d3.select(this).attr('r', 5);
      Utils.hideTooltip();
    });

  // X Axis
  const xAxis = g.append('g')
    .attr('transform', `translate(0,${innerHeight})`)
    .call(d3.axisBottom(x)
      .tickValues(tournaments.map(d => d.year))
      .tickFormat(d => d)
    );

  xAxis.selectAll('text')
    .attr('fill', Utils.colors.textTertiary)
    .attr('font-size', '10px')
    .attr('transform', 'rotate(-45)')
    .attr('text-anchor', 'end')
    .attr('dx', '-0.5em')
    .attr('dy', '0.5em');

  xAxis.selectAll('line, path')
    .attr('stroke', Utils.colors.border);

  // Y Axis (Matches - left)
  const yAxisLeft = g.append('g')
    .call(d3.axisLeft(yMatches).ticks(6));

  yAxisLeft.selectAll('text')
    .attr('fill', Utils.colors.cyan)
    .attr('font-size', '11px');

  yAxisLeft.selectAll('line, path')
    .attr('stroke', Utils.colors.border);

  // Y Axis label (left)
  g.append('text')
    .attr('transform', 'rotate(-90)')
    .attr('y', -45)
    .attr('x', -innerHeight / 2)
    .attr('text-anchor', 'middle')
    .attr('fill', Utils.colors.cyan)
    .attr('font-size', '12px')
    .text('Matches');

  // Y Axis (Avg Goals - right)
  const yAxisRight = g.append('g')
    .attr('transform', `translate(${innerWidth},0)`)
    .call(d3.axisRight(yGoals).ticks(6));

  yAxisRight.selectAll('text')
    .attr('fill', Utils.colors.lime)
    .attr('font-size', '11px');

  yAxisRight.selectAll('line, path')
    .attr('stroke', Utils.colors.border);

  // Y Axis label (right)
  g.append('text')
    .attr('transform', 'rotate(90)')
    .attr('y', -innerWidth - 45)
    .attr('x', innerHeight / 2)
    .attr('text-anchor', 'middle')
    .attr('fill', Utils.colors.lime)
    .attr('font-size', '12px')
    .text('Avg Goals/Match');

  // Chart title - bold uppercase
  svg.append('text')
    .attr('class', 'chart-title')
    .attr('x', width / 2)
    .attr('y', 20)
    .attr('text-anchor', 'middle')
    .attr('fill', Utils.colors.textSecondary)
    .attr('font-size', '14px')
    .style('font-weight', 'bold')
    .text('TOURNAMENT EVOLUTION (1930-2022)');

  // Legend - bottom center with circles
  const legend = svg.append('g')
    .attr('transform', `translate(${width / 2 - 80}, ${height - 15})`);

  legend.append('circle')
    .attr('cx', 0)
    .attr('cy', 0)
    .attr('r', 5)
    .attr('fill', Utils.colors.cyan);

  legend.append('text')
    .attr('x', 12).attr('y', 4)
    .attr('fill', Utils.colors.textSecondary)
    .attr('font-size', '11px')
    .text('Matches');

  legend.append('circle')
    .attr('cx', 90)
    .attr('cy', 0)
    .attr('r', 5)
    .attr('fill', Utils.colors.lime);

  legend.append('text')
    .attr('x', 102).attr('y', 4)
    .attr('fill', Utils.colors.textSecondary)
    .attr('font-size', '11px')
    .text('Avg Goals');

  // Annotations for key moments
  const annotations = [
    { year: 1950, text: 'Post-WWII Return', y: -15 },
    { year: 1982, text: '24 Teams', y: -15 },
    { year: 1998, text: '32 Teams', y: -15 }
  ];

  annotations.forEach(a => {
    const tournament = tournaments.find(t => t.year === a.year);
    if (!tournament) return;

    g.append('line')
      .attr('x1', x(a.year))
      .attr('x2', x(a.year))
      .attr('y1', yMatches(tournament.matchCount) + a.y)
      .attr('y2', yMatches(tournament.matchCount) - 30)
      .attr('stroke', Utils.colors.amber)
      .attr('stroke-width', 1)
      .attr('stroke-dasharray', '3,3');

    g.append('text')
      .attr('x', x(a.year))
      .attr('y', yMatches(tournament.matchCount) - 35)
      .attr('text-anchor', 'middle')
      .attr('fill', Utils.colors.amber)
      .attr('font-size', '10px')
      .text(a.text);
  });

  // ============================================
  // RIGHT: Decade Stats - Horizontal Bars
  // ============================================

  // Calculate stats by decade
  const decadeStats = {};
  DATA.matches.forEach(m => {
    const decade = m.decade;
    if (!decadeStats[decade]) {
      decadeStats[decade] = { goals: 0, matches: 0, tournaments: new Set() };
    }
    decadeStats[decade].goals += m.totalGoals;
    decadeStats[decade].matches++;
    decadeStats[decade].tournaments.add(m.year);
  });

  const decades = Object.keys(decadeStats).sort().map(d => ({
    decade: d,
    goals: decadeStats[d].goals,
    matches: decadeStats[d].matches,
    tournaments: decadeStats[d].tournaments.size,
    avgGoals: (decadeStats[d].goals / decadeStats[d].matches).toFixed(2)
  }));

  const decWidth = (container.clientWidth * 0.32) || 350;
  const decHeight = 450;
  const decMargin = { top: 50, right: 30, bottom: 40, left: 70 };
  const decInnerWidth = decWidth - decMargin.left - decMargin.right;
  const decInnerHeight = decHeight - decMargin.top - decMargin.bottom;

  const decSvg = d3.select(decadeContainer)
    .append('svg')
    .attr('width', decWidth)
    .attr('height', decHeight);

  const decG = decSvg.append('g')
    .attr('transform', `translate(${decMargin.left},${decMargin.top})`);

  // Title
  decSvg.append('text')
    .attr('class', 'chart-title')
    .attr('x', decWidth / 2)
    .attr('y', 25)
    .attr('text-anchor', 'middle')
    .attr('fill', Utils.colors.textSecondary)
    .attr('font-size', '14px')
    .style('font-weight', 'bold')
    .text('GOALS BY DECADE');

  // Scales
  const yDec = d3.scaleBand()
    .domain(decades.map(d => d.decade))
    .range([0, decInnerHeight])
    .padding(0.3);

  const xDec = d3.scaleLinear()
    .domain([0, d3.max(decades, d => d.goals)])
    .range([0, decInnerWidth]);

  // Background bars (total capacity feel)
  decG.selectAll('.bg-bar')
    .data(decades)
    .enter()
    .append('rect')
    .attr('x', 0)
    .attr('y', d => yDec(d.decade))
    .attr('width', decInnerWidth)
    .attr('height', yDec.bandwidth())
    .attr('fill', Utils.colors.bgAccent)
    .attr('rx', 4);

  // Goal bars
  decG.selectAll('.goal-bar')
    .data(decades)
    .enter()
    .append('rect')
    .attr('x', 0)
    .attr('y', d => yDec(d.decade))
    .attr('width', d => xDec(d.goals))
    .attr('height', yDec.bandwidth())
    .attr('fill', (d, i) => {
      const colors = [Utils.colors.cyan, Utils.colors.lime, Utils.colors.amber, Utils.colors.emerald, Utils.colors.coral];
      return colors[i % colors.length];
    })
    .attr('rx', 4)
    .attr('opacity', 0.8)
    .style('cursor', 'pointer')
    .on('mouseenter', function(event, d) {
      d3.select(this).attr('opacity', 1);
      Utils.showTooltip(`
        <div class="tooltip-title">${d.decade}s</div>
        <div>Total Goals: <span style="color: ${Utils.colors.lime}">${d.goals}</span></div>
        <div>Matches: <span style="color: ${Utils.colors.cyan}">${d.matches}</span></div>
        <div>Tournaments: <span style="color: ${Utils.colors.amber}">${d.tournaments}</span></div>
        <div>Avg Goals/Match: <span style="color: ${Utils.colors.emerald}">${d.avgGoals}</span></div>
      `, event.pageX, event.pageY);
    })
    .on('mouseleave', function() {
      d3.select(this).attr('opacity', 0.8);
      Utils.hideTooltip();
    });

  // Goal count labels
  decG.selectAll('.goal-label')
    .data(decades)
    .enter()
    .append('text')
    .attr('x', d => xDec(d.goals) + 8)
    .attr('y', d => yDec(d.decade) + yDec.bandwidth() / 2)
    .attr('dominant-baseline', 'middle')
    .attr('fill', Utils.colors.textSecondary)
    .attr('font-size', '11px')
    .text(d => d.goals);

  // Y Axis - decades
  const yDecAxis = decG.append('g')
    .call(d3.axisLeft(yDec).tickFormat(d => `${d}s`));

  yDecAxis.selectAll('text')
    .attr('fill', Utils.colors.textSecondary)
    .attr('font-size', '11px');

  yDecAxis.selectAll('line, path').attr('stroke', Utils.colors.border);
}
