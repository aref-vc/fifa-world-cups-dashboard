/* Hosts Section - Home Advantage Analysis */

function initHosts() {
  const container = document.getElementById('hosts-chart');
  if (!container || !DATA.hostPerformance) return;

  const hostData = DATA.hostPerformance;

  container.innerHTML = '';

  // Create layout: stats cards on top, then two-column charts below
  const wrapper = document.createElement('div');
  wrapper.style.display = 'flex';
  wrapper.style.flexDirection = 'column';
  wrapper.style.gap = '40px';
  container.appendChild(wrapper);

  // ============================================
  // Summary Stats
  // ============================================
  const statsRow = document.createElement('div');
  statsRow.style.display = 'grid';
  statsRow.style.gridTemplateColumns = 'repeat(4, 1fr)';
  statsRow.style.gap = '20px';
  wrapper.appendChild(statsRow);

  const hostsWon = hostData.filter(h => h.wonTournament).length;
  const hostsReachedFinal = hostData.filter(h => h.reachedFinal).length;
  const totalHosts = hostData.length;
  const avgWinRate = hostData.reduce((sum, h) => {
    const winRate = h.matchesPlayed > 0 ? (h.wins / h.matchesPlayed) * 100 : 0;
    return sum + winRate;
  }, 0) / totalHosts;

  const stats = [
    { value: hostsWon, label: 'Host Winners', color: Utils.colors.lime },
    { value: hostsReachedFinal, label: 'Reached Final', color: Utils.colors.cyan },
    { value: `${avgWinRate.toFixed(0)}%`, label: 'Avg Win Rate', color: Utils.colors.amber },
    { value: totalHosts, label: 'Total Hosts', color: Utils.colors.textSecondary }
  ];

  stats.forEach(stat => {
    const card = document.createElement('div');
    card.className = 'stat-card';
    card.innerHTML = `
      <div class="stat-value" style="color: ${stat.color}; font-size: 2.5rem;">${stat.value}</div>
      <div class="stat-label">${stat.label}</div>
    `;
    statsRow.appendChild(card);
  });

  // ============================================
  // Two-column chart layout
  // ============================================
  const chartsWrapper = document.createElement('div');
  chartsWrapper.style.display = 'grid';
  chartsWrapper.style.gridTemplateColumns = '2fr 1fr';
  chartsWrapper.style.gap = '40px';
  chartsWrapper.style.alignItems = 'start';
  wrapper.appendChild(chartsWrapper);

  // Left: Dot plot container
  const chartContainer = document.createElement('div');
  chartsWrapper.appendChild(chartContainer);

  // Right: Donut chart container
  const donutContainer = document.createElement('div');
  chartsWrapper.appendChild(donutContainer);

  // ============================================
  // LEFT: Connected Dot Plot - Host Performance
  // ============================================
  const width = (container.clientWidth * 0.63) || 800;
  const height = 600;
  const margin = { top: 60, right: 40, bottom: 80, left: 130 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  const svg = d3.select(chartContainer)
    .append('svg')
    .attr('width', width)
    .attr('height', height);

  const g = svg.append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);

  // Title - bold uppercase
  svg.append('text')
    .attr('class', 'chart-title')
    .attr('x', width / 2)
    .attr('y', 25)
    .attr('text-anchor', 'middle')
    .attr('fill', Utils.colors.textSecondary)
    .attr('font-size', '14px')
    .style('font-weight', 'bold')
    .text('HOST NATION PERFORMANCE BY TOURNAMENT');

  // Scales
  const y = d3.scaleBand()
    .domain(hostData.map(d => d.year))
    .range([0, innerHeight])
    .padding(0.3);

  const x = d3.scaleLinear()
    .domain([0, d3.max(hostData, d => d.matchesPlayed)])
    .range([0, innerWidth]);

  // Grid lines
  g.selectAll('.grid-line')
    .data(x.ticks(6))
    .enter()
    .append('line')
    .attr('class', 'grid-line')
    .attr('x1', d => x(d))
    .attr('x2', d => x(d))
    .attr('y1', 0)
    .attr('y2', innerHeight)
    .attr('stroke', Utils.colors.border)
    .attr('stroke-opacity', 0.5);

  // Draw connecting lines (matches played range)
  g.selectAll('.connect-line')
    .data(hostData)
    .enter()
    .append('line')
    .attr('class', 'connect-line')
    .attr('x1', 0)
    .attr('x2', d => x(d.matchesPlayed))
    .attr('y1', d => y(d.year) + y.bandwidth() / 2)
    .attr('y2', d => y(d.year) + y.bandwidth() / 2)
    .attr('stroke', Utils.colors.border)
    .attr('stroke-width', 2);

  // Draw wins as filled portion
  g.selectAll('.wins-line')
    .data(hostData)
    .enter()
    .append('line')
    .attr('class', 'wins-line')
    .attr('x1', 0)
    .attr('x2', d => x(d.wins))
    .attr('y1', d => y(d.year) + y.bandwidth() / 2)
    .attr('y2', d => y(d.year) + y.bandwidth() / 2)
    .attr('stroke', d => d.wonTournament ? Utils.colors.lime : Utils.colors.cyan)
    .attr('stroke-width', 4)
    .attr('stroke-linecap', 'round');

  // Matches played dots
  g.selectAll('.matches-dot')
    .data(hostData)
    .enter()
    .append('circle')
    .attr('class', 'matches-dot')
    .attr('cx', d => x(d.matchesPlayed))
    .attr('cy', d => y(d.year) + y.bandwidth() / 2)
    .attr('r', 6)
    .attr('fill', Utils.colors.bgElevated)
    .attr('stroke', Utils.colors.textTertiary)
    .attr('stroke-width', 2);

  // Wins dots
  g.selectAll('.wins-dot')
    .data(hostData)
    .enter()
    .append('circle')
    .attr('class', 'wins-dot')
    .attr('cx', d => x(d.wins))
    .attr('cy', d => y(d.year) + y.bandwidth() / 2)
    .attr('r', 8)
    .attr('fill', d => d.wonTournament ? Utils.colors.lime : Utils.colors.cyan)
    .attr('stroke', Utils.colors.bgMain)
    .attr('stroke-width', 2)
    .style('cursor', 'pointer')
    .on('mouseenter', function(event, d) {
      d3.select(this).attr('r', 11);
      const winRate = d.matchesPlayed > 0 ? ((d.wins / d.matchesPlayed) * 100).toFixed(0) : 0;
      Utils.showTooltip(`
        <div class="tooltip-title">${d.year} - ${d.host}</div>
        <div>Matches: <span style="color: ${Utils.colors.textSecondary}">${d.matchesPlayed}</span></div>
        <div>Wins: <span style="color: ${Utils.colors.lime}">${d.wins}</span></div>
        <div>Draws: <span style="color: ${Utils.colors.amber}">${d.draws}</span></div>
        <div>Losses: <span style="color: ${Utils.colors.coral}">${d.losses}</span></div>
        <div>Win Rate: <span style="color: ${Utils.colors.cyan}">${winRate}%</span></div>
        ${d.wonTournament ? `<div style="margin-top: 4px; color: ${Utils.colors.lime};">★ Won Tournament</div>` : ''}
        ${d.reachedFinal && !d.wonTournament ? `<div style="margin-top: 4px; color: ${Utils.colors.amber};">Runner-up</div>` : ''}
      `, event.pageX, event.pageY);
    })
    .on('mouseleave', function() {
      d3.select(this).attr('r', 8);
      Utils.hideTooltip();
    });

  // Trophy icons for winners
  g.selectAll('.trophy')
    .data(hostData.filter(d => d.wonTournament))
    .enter()
    .append('text')
    .attr('class', 'trophy')
    .attr('x', d => x(d.wins) + 18)
    .attr('y', d => y(d.year) + y.bandwidth() / 2)
    .attr('dominant-baseline', 'middle')
    .attr('fill', Utils.colors.amber)
    .attr('font-size', '16px')
    .text('★');

  // Y Axis - Years with host names
  const yAxis = g.append('g')
    .call(d3.axisLeft(y).tickFormat(year => {
      const host = hostData.find(d => d.year === year);
      return `${year} ${host ? host.host : ''}`;
    }));

  yAxis.selectAll('text')
    .attr('fill', d => {
      const host = hostData.find(h => h.year === d);
      return host && host.wonTournament ? Utils.colors.lime : Utils.colors.textSecondary;
    })
    .attr('font-size', '11px');

  yAxis.selectAll('line, path').attr('stroke', Utils.colors.border);

  // X Axis
  const xAxis = g.append('g')
    .attr('transform', `translate(0,${innerHeight})`)
    .call(d3.axisBottom(x).ticks(6));

  xAxis.selectAll('text')
    .attr('fill', Utils.colors.textTertiary)
    .attr('font-size', '11px');

  xAxis.selectAll('line, path').attr('stroke', Utils.colors.border);

  // X Axis label
  svg.append('text')
    .attr('x', width / 2)
    .attr('y', margin.top + innerHeight + 35)
    .attr('text-anchor', 'middle')
    .attr('fill', Utils.colors.textTertiary)
    .attr('font-size', '11px')
    .text('Matches');

  // Legend - bottom center with circles
  const legendItems = [
    { color: Utils.colors.lime, label: 'Won Tournament' },
    { color: Utils.colors.cyan, label: 'Host Wins' },
    { color: Utils.colors.textTertiary, label: 'Matches Played' }
  ];

  const legend = svg.append('g')
    .attr('transform', `translate(${width / 2 - 170}, ${height - 25})`);

  legendItems.forEach((item, i) => {
    legend.append('circle')
      .attr('cx', i * 120)
      .attr('cy', 0)
      .attr('r', 5)
      .attr('fill', item.color);

    legend.append('text')
      .attr('x', i * 120 + 12)
      .attr('y', 4)
      .attr('fill', Utils.colors.textSecondary)
      .attr('font-size', '11px')
      .text(item.label);
  });

  // ============================================
  // RIGHT: Host Results Breakdown - Donut Chart
  // ============================================
  const donutWidth = (container.clientWidth * 0.32) || 350;
  const donutHeight = 380;
  const donutRadius = Math.min(donutWidth - 40, donutHeight - 120) / 2;

  // Aggregate all host results
  const totalWins = hostData.reduce((sum, h) => sum + h.wins, 0);
  const totalDraws = hostData.reduce((sum, h) => sum + h.draws, 0);
  const totalLosses = hostData.reduce((sum, h) => sum + h.losses, 0);
  const totalMatches = totalWins + totalDraws + totalLosses;

  const resultData = [
    { label: 'Wins', value: totalWins, color: Utils.colors.lime },
    { label: 'Draws', value: totalDraws, color: Utils.colors.amber },
    { label: 'Losses', value: totalLosses, color: Utils.colors.coral }
  ];

  const donutSvg = d3.select(donutContainer)
    .append('svg')
    .attr('width', donutWidth)
    .attr('height', donutHeight);

  // Title
  donutSvg.append('text')
    .attr('class', 'chart-title')
    .attr('x', donutWidth / 2)
    .attr('y', 25)
    .attr('text-anchor', 'middle')
    .attr('fill', Utils.colors.textSecondary)
    .attr('font-size', '14px')
    .style('font-weight', 'bold')
    .text('HOST RESULTS BREAKDOWN');

  const donutG = donutSvg.append('g')
    .attr('transform', `translate(${donutWidth / 2}, ${donutHeight / 2 + 10})`);

  // Pie generator
  const pie = d3.pie()
    .value(d => d.value)
    .sort(null)
    .padAngle(0.02);

  // Arc generator
  const arc = d3.arc()
    .innerRadius(donutRadius * 0.6)
    .outerRadius(donutRadius);

  const arcHover = d3.arc()
    .innerRadius(donutRadius * 0.6)
    .outerRadius(donutRadius * 1.08);

  // Draw arcs
  const arcs = donutG.selectAll('.arc')
    .data(pie(resultData))
    .enter()
    .append('g')
    .attr('class', 'arc');

  arcs.append('path')
    .attr('d', arc)
    .attr('fill', d => d.data.color)
    .attr('stroke', Utils.colors.bgMain)
    .attr('stroke-width', 2)
    .style('cursor', 'pointer')
    .on('mouseenter', function(event, d) {
      d3.select(this)
        .transition()
        .duration(200)
        .attr('d', arcHover);
      const pct = ((d.data.value / totalMatches) * 100).toFixed(1);
      Utils.showTooltip(`
        <div class="tooltip-title" style="color: ${d.data.color}">${d.data.label}</div>
        <div>${d.data.value} matches (${pct}%)</div>
      `, event.pageX, event.pageY);
    })
    .on('mouseleave', function() {
      d3.select(this)
        .transition()
        .duration(200)
        .attr('d', arc);
      Utils.hideTooltip();
    });

  // Center text - total matches
  donutG.append('text')
    .attr('text-anchor', 'middle')
    .attr('dominant-baseline', 'middle')
    .attr('y', -10)
    .attr('fill', Utils.colors.text)
    .attr('font-size', '32px')
    .style('font-weight', '600')
    .text(totalMatches);

  donutG.append('text')
    .attr('text-anchor', 'middle')
    .attr('dominant-baseline', 'middle')
    .attr('y', 18)
    .attr('fill', Utils.colors.textTertiary)
    .attr('font-size', '11px')
    .text('TOTAL MATCHES');

  // Legend below donut - moved further down
  const donutLegend = donutSvg.append('g')
    .attr('transform', `translate(${donutWidth / 2 - 80}, ${donutHeight - 15})`);

  resultData.forEach((item, i) => {
    const pct = ((item.value / totalMatches) * 100).toFixed(0);

    donutLegend.append('circle')
      .attr('cx', i * 60)
      .attr('cy', 0)
      .attr('r', 5)
      .attr('fill', item.color);

    donutLegend.append('text')
      .attr('x', i * 60 + 10)
      .attr('y', 4)
      .attr('fill', Utils.colors.textSecondary)
      .attr('font-size', '10px')
      .text(`${pct}%`);
  });

  // Add result breakdown stat cards below donut
  const breakdownDiv = document.createElement('div');
  breakdownDiv.style.display = 'flex';
  breakdownDiv.style.justifyContent = 'space-around';
  breakdownDiv.style.marginTop = '20px';
  breakdownDiv.style.padding = '0 10px';
  donutContainer.appendChild(breakdownDiv);

  resultData.forEach(item => {
    const statDiv = document.createElement('div');
    statDiv.style.textAlign = 'center';
    statDiv.innerHTML = `
      <div style="font-size: 1.5rem; font-weight: 600; color: ${item.color};">${item.value}</div>
      <div style="font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.1em; color: ${Utils.colors.textTertiary};">${item.label}</div>
    `;
    breakdownDiv.appendChild(statDiv);
  });
}
