/* Timeline Section - Tournament Evolution */

function initTimeline() {
  const container = document.getElementById('timeline-chart');
  if (!container || !DATA.tournaments) return;

  const tournaments = DATA.tournaments;

  // Dimensions
  const width = container.clientWidth || 1200;
  const height = 500;
  const margin = { top: 40, right: 120, bottom: 80, left: 60 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  // Clear container
  container.innerHTML = '';

  // Create SVG
  const svg = d3.select(container)
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
    .attr('font-weight', '600')
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
}
