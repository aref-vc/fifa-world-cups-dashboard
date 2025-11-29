/* Rivalries Section - Head-to-Head Network */

function initRivalries() {
  const container = document.getElementById('rivalries-chart');
  if (!container || !DATA.matches) return;

  // Build rivalry data
  const matchups = {};
  DATA.matches.forEach(m => {
    const teams = [m.home, m.away].sort();
    const key = teams.join(' vs ');
    if (!matchups[key]) {
      matchups[key] = { team1: teams[0], team2: teams[1], matches: [], count: 0 };
    }
    matchups[key].matches.push(m);
    matchups[key].count++;
  });

  // Get top rivalries (most meetings)
  const topRivalries = Object.values(matchups)
    .filter(r => r.count >= 3)
    .sort((a, b) => b.count - a.count)
    .slice(0, 20);

  // Calculate win records for each rivalry
  topRivalries.forEach(r => {
    r.team1Wins = r.matches.filter(m => m.winner === r.team1).length;
    r.team2Wins = r.matches.filter(m => m.winner === r.team2).length;
    r.draws = r.matches.filter(m => m.isDraw).length;
    r.totalGoals = r.matches.reduce((sum, m) => sum + m.totalGoals, 0);
  });

  container.innerHTML = '';

  // Create layout
  const wrapper = document.createElement('div');
  wrapper.style.display = 'grid';
  wrapper.style.gridTemplateColumns = '1fr 1fr';
  wrapper.style.gap = '40px';
  container.appendChild(wrapper);

  // ============================================
  // Force-Directed Network (Left)
  // ============================================
  const networkContainer = document.createElement('div');
  networkContainer.id = 'rivalry-network';
  wrapper.appendChild(networkContainer);

  // Build nodes and links for network
  const nodeSet = new Set();
  topRivalries.forEach(r => {
    nodeSet.add(r.team1);
    nodeSet.add(r.team2);
  });

  const nodes = Array.from(nodeSet).map(name => ({ id: name, name }));
  const links = topRivalries.map(r => ({
    source: r.team1,
    target: r.team2,
    value: r.count,
    rivalry: r
  }));

  const netWidth = (container.clientWidth / 2) - 20 || 500;
  const netHeight = 450;

  const netSvg = d3.select(networkContainer)
    .append('svg')
    .attr('width', netWidth)
    .attr('height', netHeight);

  // Title - bold uppercase
  netSvg.append('text')
    .attr('class', 'chart-title')
    .attr('x', netWidth / 2)
    .attr('y', 20)
    .attr('text-anchor', 'middle')
    .attr('fill', Utils.colors.textSecondary)
    .attr('font-size', '14px')
    .style('font-weight', 'bold')
    .text('RIVALRY NETWORK (TOP 20 MATCHUPS)');

  const netG = netSvg.append('g')
    .attr('transform', 'translate(0, 30)');

  // Force simulation
  const simulation = d3.forceSimulation(nodes)
    .force('link', d3.forceLink(links).id(d => d.id).distance(100))
    .force('charge', d3.forceManyBody().strength(-300))
    .force('center', d3.forceCenter(netWidth / 2, (netHeight - 30) / 2))
    .force('collision', d3.forceCollide().radius(30));

  // Draw links
  const link = netG.selectAll('.link')
    .data(links)
    .enter()
    .append('line')
    .attr('class', 'link')
    .attr('stroke', Utils.colors.border)
    .attr('stroke-width', d => Math.sqrt(d.value) * 1.5)
    .attr('stroke-opacity', 0.6);

  // Draw nodes
  const node = netG.selectAll('.node')
    .data(nodes)
    .enter()
    .append('g')
    .attr('class', 'node')
    .style('cursor', 'pointer')
    .call(d3.drag()
      .on('start', dragstarted)
      .on('drag', dragged)
      .on('end', dragended));

  node.append('circle')
    .attr('r', d => {
      const connections = links.filter(l => l.source.id === d.id || l.target.id === d.id).length;
      return 8 + connections * 2;
    })
    .attr('fill', Utils.colors.cyan)
    .attr('stroke', Utils.colors.bgMain)
    .attr('stroke-width', 2);

  node.append('text')
    .attr('dy', -15)
    .attr('text-anchor', 'middle')
    .attr('fill', Utils.colors.textSecondary)
    .attr('font-size', '10px')
    .text(d => d.name);

  // Tooltip on node hover
  node.on('mouseenter', function(event, d) {
    const rivalries = links.filter(l => l.source.id === d.id || l.target.id === d.id);
    const opponents = rivalries.map(l => l.source.id === d.id ? l.target.id : l.source.id);

    Utils.showTooltip(`
      <div class="tooltip-title" style="color: ${Utils.colors.cyan}">${d.name}</div>
      <div>Rivalries: ${rivalries.length}</div>
      <div style="margin-top: 4px; font-size: 11px; color: ${Utils.colors.textTertiary}">
        ${opponents.slice(0, 5).join(', ')}${opponents.length > 5 ? '...' : ''}
      </div>
    `, event.pageX, event.pageY);

    // Highlight connected links
    link.attr('stroke', l => (l.source.id === d.id || l.target.id === d.id) ? Utils.colors.lime : Utils.colors.border)
      .attr('stroke-opacity', l => (l.source.id === d.id || l.target.id === d.id) ? 1 : 0.2);
  })
  .on('mouseleave', function() {
    Utils.hideTooltip();
    link.attr('stroke', Utils.colors.border).attr('stroke-opacity', 0.6);
  });

  // Link hover
  link.on('mouseenter', function(event, d) {
    d3.select(this).attr('stroke', Utils.colors.lime).attr('stroke-opacity', 1);
    Utils.showTooltip(`
      <div class="tooltip-title">${d.rivalry.team1} vs ${d.rivalry.team2}</div>
      <div>Meetings: <span style="color: ${Utils.colors.cyan}">${d.rivalry.count}</span></div>
      <div>${d.rivalry.team1}: <span style="color: ${Utils.colors.lime}">${d.rivalry.team1Wins}</span> wins</div>
      <div>${d.rivalry.team2}: <span style="color: ${Utils.colors.coral}">${d.rivalry.team2Wins}</span> wins</div>
      <div>Draws: <span style="color: ${Utils.colors.amber}">${d.rivalry.draws}</span></div>
    `, event.pageX, event.pageY);
  })
  .on('mouseleave', function() {
    d3.select(this).attr('stroke', Utils.colors.border).attr('stroke-opacity', 0.6);
    Utils.hideTooltip();
  });

  simulation.on('tick', () => {
    link
      .attr('x1', d => d.source.x)
      .attr('y1', d => d.source.y)
      .attr('x2', d => d.target.x)
      .attr('y2', d => d.target.y);

    node.attr('transform', d => `translate(${d.x},${d.y})`);
  });

  function dragstarted(event) {
    if (!event.active) simulation.alphaTarget(0.3).restart();
    event.subject.fx = event.subject.x;
    event.subject.fy = event.subject.y;
  }

  function dragged(event) {
    event.subject.fx = event.x;
    event.subject.fy = event.y;
  }

  function dragended(event) {
    if (!event.active) simulation.alphaTarget(0);
    event.subject.fx = null;
    event.subject.fy = null;
  }

  // ============================================
  // Rivalry Cards (Right)
  // ============================================
  const cardsContainer = document.createElement('div');
  cardsContainer.style.display = 'flex';
  cardsContainer.style.flexDirection = 'column';
  cardsContainer.style.gap = '12px';
  wrapper.appendChild(cardsContainer);

  // Title
  const cardsTitle = document.createElement('h3');
  cardsTitle.textContent = 'Classic Rivalries';
  cardsTitle.style.color = Utils.colors.amber;
  cardsTitle.style.marginBottom = '8px';
  cardsTitle.style.fontSize = '14px';
  cardsTitle.style.textTransform = 'uppercase';
  cardsTitle.style.letterSpacing = '0.1em';
  cardsContainer.appendChild(cardsTitle);

  // Top 8 rivalries as cards
  topRivalries.slice(0, 8).forEach((r, i) => {
    const card = document.createElement('div');
    card.className = 'card';
    card.style.padding = '16px';

    const total = r.team1Wins + r.team2Wins + r.draws;
    const team1Pct = (r.team1Wins / total) * 100;
    const team2Pct = (r.team2Wins / total) * 100;
    const drawPct = (r.draws / total) * 100;

    card.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
        <span style="color: ${Utils.colors.text}; font-size: 1rem;">${r.team1} vs ${r.team2}</span>
        <span style="color: ${Utils.colors.textTertiary}; font-size: 0.875rem;">${r.count} meetings</span>
      </div>
      <div style="display: flex; height: 8px; border-radius: 4px; overflow: hidden; margin-bottom: 8px;">
        <div style="width: ${team1Pct}%; background: ${Utils.colors.lime};"></div>
        <div style="width: ${drawPct}%; background: ${Utils.colors.amber};"></div>
        <div style="width: ${team2Pct}%; background: ${Utils.colors.coral};"></div>
      </div>
      <div style="display: flex; justify-content: space-between; font-size: 0.75rem; color: ${Utils.colors.textTertiary};">
        <span><span style="color: ${Utils.colors.lime}">${r.team1Wins}</span> ${r.team1}</span>
        <span><span style="color: ${Utils.colors.amber}">${r.draws}</span> draws</span>
        <span>${r.team2} <span style="color: ${Utils.colors.coral}">${r.team2Wins}</span></span>
      </div>
    `;

    cardsContainer.appendChild(card);
  });
}
