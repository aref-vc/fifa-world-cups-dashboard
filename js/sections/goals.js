/* Goals Section - Scoring Patterns */

function initGoals() {
  const container = document.getElementById('goals-chart');
  if (!container || !DATA.matches) return;

  const matches = DATA.matches;

  // Dimensions
  const width = container.clientWidth || 1200;
  const height = 600;
  const margin = { top: 40, right: 40, bottom: 60, left: 60 };

  container.innerHTML = '';

  // Create two charts: Heatmap (goals by decade & stage) + Lollipop (highest scoring matches)
  const chartWrapper = document.createElement('div');
  chartWrapper.style.display = 'grid';
  chartWrapper.style.gridTemplateColumns = '1fr 1fr';
  chartWrapper.style.gap = '40px';
  container.appendChild(chartWrapper);

  const heatmapContainer = document.createElement('div');
  heatmapContainer.id = 'goals-heatmap';
  chartWrapper.appendChild(heatmapContainer);

  const lollipopContainer = document.createElement('div');
  lollipopContainer.id = 'goals-lollipop';
  chartWrapper.appendChild(lollipopContainer);

  // ============================================
  // HEATMAP: Goals by Decade & Stage
  // ============================================

  const decades = [...new Set(matches.map(m => m.decade))].sort();
  const stages = ['Group Stage', 'Round of 16', 'Quarterfinals', 'Semifinals', 'Third place', 'Final'];

  // Calculate average goals per stage per decade
  const heatmapData = [];
  decades.forEach(decade => {
    stages.forEach(stage => {
      const stageMatches = matches.filter(m =>
        m.decade === decade &&
        (m.stage === stage || (stage === 'Group Stage' && m.stage.includes('Group')))
      );
      if (stageMatches.length > 0) {
        const avgGoals = stageMatches.reduce((sum, m) => sum + m.totalGoals, 0) / stageMatches.length;
        heatmapData.push({ decade, stage, avgGoals, count: stageMatches.length });
      }
    });
  });

  const heatWidth = (width / 2) - 20;
  const heatHeight = 400;
  const heatMargin = { top: 50, right: 20, bottom: 80, left: 100 };
  const heatInnerWidth = heatWidth - heatMargin.left - heatMargin.right;
  const heatInnerHeight = heatHeight - heatMargin.top - heatMargin.bottom;

  const heatSvg = d3.select(heatmapContainer)
    .append('svg')
    .attr('width', heatWidth)
    .attr('height', heatHeight);

  const heatG = heatSvg.append('g')
    .attr('transform', `translate(${heatMargin.left},${heatMargin.top})`);

  // Scales
  const xHeat = d3.scaleBand()
    .domain(decades)
    .range([0, heatInnerWidth])
    .padding(0.05);

  const yHeat = d3.scaleBand()
    .domain(stages)
    .range([0, heatInnerHeight])
    .padding(0.05);

  const colorHeat = d3.scaleSequential()
    .domain([0, d3.max(heatmapData, d => d.avgGoals)])
    .interpolator(d3.interpolateRgb(Utils.colors.bgAccent, Utils.colors.emerald));

  // Draw cells
  heatG.selectAll('.heat-cell')
    .data(heatmapData)
    .enter()
    .append('rect')
    .attr('class', 'heat-cell')
    .attr('x', d => xHeat(d.decade))
    .attr('y', d => yHeat(d.stage))
    .attr('width', xHeat.bandwidth())
    .attr('height', yHeat.bandwidth())
    .attr('fill', d => colorHeat(d.avgGoals))
    .attr('rx', 4)
    .style('cursor', 'pointer')
    .on('mouseenter', function(event, d) {
      d3.select(this).attr('stroke', Utils.colors.text).attr('stroke-width', 2);
      Utils.showTooltip(`
        <div class="tooltip-title">${d.decade}s - ${d.stage}</div>
        <div>Avg Goals: <span style="color: ${Utils.colors.emerald}">${d.avgGoals.toFixed(2)}</span></div>
        <div>Matches: <span style="color: ${Utils.colors.cyan}">${d.count}</span></div>
      `, event.pageX, event.pageY);
    })
    .on('mouseleave', function() {
      d3.select(this).attr('stroke', 'none');
      Utils.hideTooltip();
    });

  // Cell labels
  heatG.selectAll('.heat-label')
    .data(heatmapData)
    .enter()
    .append('text')
    .attr('class', 'heat-label')
    .attr('x', d => xHeat(d.decade) + xHeat.bandwidth() / 2)
    .attr('y', d => yHeat(d.stage) + yHeat.bandwidth() / 2)
    .attr('text-anchor', 'middle')
    .attr('dominant-baseline', 'middle')
    .attr('fill', d => d.avgGoals > 3 ? Utils.colors.bgMain : Utils.colors.textSecondary)
    .attr('font-size', '11px')
    .text(d => d.avgGoals.toFixed(1));

  // X Axis
  const xHeatAxis = heatG.append('g')
    .attr('transform', `translate(0,${heatInnerHeight})`)
    .call(d3.axisBottom(xHeat).tickFormat(d => `${d}s`));

  xHeatAxis.selectAll('text')
    .attr('fill', Utils.colors.textTertiary)
    .attr('font-size', '10px');

  xHeatAxis.selectAll('line, path').attr('stroke', Utils.colors.border);

  // Y Axis
  const yHeatAxis = heatG.append('g')
    .call(d3.axisLeft(yHeat));

  yHeatAxis.selectAll('text')
    .attr('fill', Utils.colors.textTertiary)
    .attr('font-size', '10px');

  yHeatAxis.selectAll('line, path').attr('stroke', Utils.colors.border);

  // Title - bold uppercase
  heatSvg.append('text')
    .attr('class', 'chart-title')
    .attr('x', heatWidth / 2)
    .attr('y', 25)
    .attr('text-anchor', 'middle')
    .attr('fill', Utils.colors.textSecondary)
    .attr('font-size', '14px')
    .style('font-weight', 'bold')
    .text('AVG GOALS BY DECADE & STAGE');

  // ============================================
  // LOLLIPOP: Highest Scoring Matches
  // ============================================

  const topMatches = [...matches]
    .sort((a, b) => b.totalGoals - a.totalGoals)
    .slice(0, 12);

  const lolliWidth = (width / 2) - 20;
  const lolliHeight = 400;
  const lolliMargin = { top: 50, right: 40, bottom: 20, left: 220 };
  const lolliInnerWidth = lolliWidth - lolliMargin.left - lolliMargin.right;
  const lolliInnerHeight = lolliHeight - lolliMargin.top - lolliMargin.bottom;

  const lolliSvg = d3.select(lollipopContainer)
    .append('svg')
    .attr('width', lolliWidth)
    .attr('height', lolliHeight);

  const lolliG = lolliSvg.append('g')
    .attr('transform', `translate(${lolliMargin.left},${lolliMargin.top})`);

  // Scales
  const xLolli = d3.scaleLinear()
    .domain([0, d3.max(topMatches, d => d.totalGoals)])
    .range([0, lolliInnerWidth]);

  const yLolli = d3.scaleBand()
    .domain(topMatches.map((d, i) => i))
    .range([0, lolliInnerHeight])
    .padding(0.3);

  // Draw lines
  lolliG.selectAll('.lolli-line')
    .data(topMatches)
    .enter()
    .append('line')
    .attr('class', 'lolli-line')
    .attr('x1', 0)
    .attr('x2', d => xLolli(d.totalGoals))
    .attr('y1', (d, i) => yLolli(i) + yLolli.bandwidth() / 2)
    .attr('y2', (d, i) => yLolli(i) + yLolli.bandwidth() / 2)
    .attr('stroke', Utils.colors.border)
    .attr('stroke-width', 2);

  // Draw circles
  lolliG.selectAll('.lolli-circle')
    .data(topMatches)
    .enter()
    .append('circle')
    .attr('class', 'lolli-circle')
    .attr('cx', d => xLolli(d.totalGoals))
    .attr('cy', (d, i) => yLolli(i) + yLolli.bandwidth() / 2)
    .attr('r', 8)
    .attr('fill', Utils.colors.coral)
    .style('cursor', 'pointer')
    .on('mouseenter', function(event, d) {
      d3.select(this).attr('r', 11);
      Utils.showTooltip(`
        <div class="tooltip-title">${d.home} ${d.homeScore} - ${d.awayScore} ${d.away}</div>
        <div>${d.year} ${d.host} - ${d.stage}</div>
        <div>Total Goals: <span style="color: ${Utils.colors.coral}">${d.totalGoals}</span></div>
      `, event.pageX, event.pageY);
    })
    .on('mouseleave', function() {
      d3.select(this).attr('r', 8);
      Utils.hideTooltip();
    });

  // Goal count labels
  lolliG.selectAll('.lolli-value')
    .data(topMatches)
    .enter()
    .append('text')
    .attr('class', 'lolli-value')
    .attr('x', d => xLolli(d.totalGoals) + 15)
    .attr('y', (d, i) => yLolli(i) + yLolli.bandwidth() / 2)
    .attr('dominant-baseline', 'middle')
    .attr('fill', Utils.colors.coral)
    .attr('font-size', '12px')
    .attr('font-weight', '500')
    .text(d => d.totalGoals);

  // Match labels
  lolliG.selectAll('.lolli-label')
    .data(topMatches)
    .enter()
    .append('text')
    .attr('class', 'lolli-label')
    .attr('x', -10)
    .attr('y', (d, i) => yLolli(i) + yLolli.bandwidth() / 2)
    .attr('text-anchor', 'end')
    .attr('dominant-baseline', 'middle')
    .attr('fill', Utils.colors.textSecondary)
    .attr('font-size', '11px')
    .text(d => `${d.home} vs ${d.away} (${d.year})`);

  // Title - bold uppercase
  lolliSvg.append('text')
    .attr('class', 'chart-title')
    .attr('x', lolliWidth / 2)
    .attr('y', 25)
    .attr('text-anchor', 'middle')
    .attr('fill', Utils.colors.textSecondary)
    .attr('font-size', '14px')
    .style('font-weight', 'bold')
    .text('HIGHEST SCORING MATCHES');
}
