/* Dominance Section - Dynasty Analysis with Bump Chart */

function initDominance() {
  const container = document.getElementById('dominance-chart');
  if (!container || !DATA.matches) return;

  // Calculate wins per team per tournament
  const tournaments = DATA.tournaments.map(t => t.year);
  const teamWinsByYear = {};

  DATA.matches.forEach(m => {
    if (m.isDraw) return;
    const key = `${m.winner}-${m.year}`;
    teamWinsByYear[key] = (teamWinsByYear[key] || 0) + 1;
  });

  // Get top 10 teams by total wins
  const teamTotalWins = {};
  DATA.matches.forEach(m => {
    if (m.isDraw) return;
    teamTotalWins[m.winner] = (teamTotalWins[m.winner] || 0) + 1;
  });

  const topTeams = Object.entries(teamTotalWins)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(d => d[0]);

  // Build ranking data for each tournament
  const rankingData = tournaments.map(year => {
    const yearWins = topTeams.map(team => ({
      team,
      wins: teamWinsByYear[`${team}-${year}`] || 0
    }));

    // Sort by wins and assign ranks
    yearWins.sort((a, b) => b.wins - a.wins);
    yearWins.forEach((d, i) => {
      d.rank = d.wins > 0 ? i + 1 : null;
    });

    return { year, teams: yearWins };
  });

  // Prepare data for bump chart
  const bumpData = topTeams.map(team => ({
    team,
    values: rankingData.map(rd => {
      const teamData = rd.teams.find(t => t.team === team);
      return {
        year: rd.year,
        rank: teamData ? teamData.rank : null,
        wins: teamData ? teamData.wins : 0
      };
    }).filter(d => d.rank !== null)
  }));

  container.innerHTML = '';

  // Create wrapper for two-column layout
  const wrapper = document.createElement('div');
  wrapper.style.display = 'grid';
  wrapper.style.gridTemplateColumns = '2fr 1fr';
  wrapper.style.gap = '40px';
  wrapper.style.alignItems = 'start';
  container.appendChild(wrapper);

  // Left: Bump chart container
  const bumpContainer = document.createElement('div');
  wrapper.appendChild(bumpContainer);

  // Right: Trophy case container
  const trophyContainer = document.createElement('div');
  wrapper.appendChild(trophyContainer);

  // ============================================
  // LEFT: Bump Chart - Dynasty Rankings
  // ============================================

  // Dimensions
  const width = (container.clientWidth * 0.63) || 800;
  const height = 550;
  const margin = { top: 40, right: 40, bottom: 120, left: 60 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  const svg = d3.select(bumpContainer)
    .append('svg')
    .attr('width', width)
    .attr('height', height);

  const g = svg.append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);

  // Scales
  const x = d3.scalePoint()
    .domain(tournaments)
    .range([0, innerWidth])
    .padding(0.5);

  const y = d3.scaleLinear()
    .domain([1, 10])
    .range([0, innerHeight]);

  const color = d3.scaleOrdinal()
    .domain(topTeams)
    .range(Utils.chartColors);

  // Line generator
  const line = d3.line()
    .x(d => x(d.year))
    .y(d => y(d.rank))
    .curve(d3.curveMonotoneX)
    .defined(d => d.rank !== null);

  // Draw lines for each team
  bumpData.forEach((teamData, i) => {
    if (teamData.values.length < 2) return;

    // Line
    g.append('path')
      .datum(teamData.values)
      .attr('fill', 'none')
      .attr('stroke', color(teamData.team))
      .attr('stroke-width', 2.5)
      .attr('stroke-opacity', 0.8)
      .attr('d', line);

    // Points
    g.selectAll(`.point-${i}`)
      .data(teamData.values)
      .enter()
      .append('circle')
      .attr('class', `point-${i}`)
      .attr('cx', d => x(d.year))
      .attr('cy', d => y(d.rank))
      .attr('r', 6)
      .attr('fill', color(teamData.team))
      .attr('stroke', Utils.colors.bgElevated)
      .attr('stroke-width', 2)
      .style('cursor', 'pointer')
      .on('mouseenter', function(event, d) {
        d3.select(this).attr('r', 9);
        Utils.showTooltip(`
          <div class="tooltip-title" style="color: ${color(teamData.team)}">${teamData.team}</div>
          <div>${d.year} World Cup</div>
          <div>Rank: <span style="color: ${Utils.colors.lime}">#${d.rank}</span></div>
          <div>Wins: <span style="color: ${Utils.colors.cyan}">${d.wins}</span></div>
        `, event.pageX, event.pageY);
      })
      .on('mouseleave', function() {
        d3.select(this).attr('r', 6);
        Utils.hideTooltip();
      });
  });

  // X Axis
  const xAxis = g.append('g')
    .attr('transform', `translate(0,${innerHeight + 20})`)
    .call(d3.axisBottom(x).tickValues(tournaments.filter((_, i) => i % 2 === 0)));

  xAxis.selectAll('text')
    .attr('fill', Utils.colors.textTertiary)
    .attr('font-size', '10px');

  xAxis.selectAll('line, path')
    .attr('stroke', Utils.colors.border);

  // Y Axis
  const yAxis = g.append('g')
    .call(d3.axisLeft(y).ticks(10).tickFormat(d => `#${d}`));

  yAxis.selectAll('text')
    .attr('fill', Utils.colors.textTertiary)
    .attr('font-size', '11px');

  yAxis.selectAll('line, path')
    .attr('stroke', Utils.colors.border);

  // Grid lines
  g.selectAll('.grid-line')
    .data(d3.range(1, 11))
    .enter()
    .append('line')
    .attr('class', 'grid-line')
    .attr('x1', 0)
    .attr('x2', innerWidth)
    .attr('y1', d => y(d))
    .attr('y2', d => y(d))
    .attr('stroke', Utils.colors.border)
    .attr('stroke-opacity', 0.3);

  // Chart title - bold uppercase
  svg.append('text')
    .attr('class', 'chart-title')
    .attr('x', width / 2)
    .attr('y', 20)
    .attr('text-anchor', 'middle')
    .attr('fill', Utils.colors.textSecondary)
    .attr('font-size', '14px')
    .style('font-weight', 'bold')
    .text('DYNASTY RANKINGS (TOP 10 NATIONS ALL-TIME)');

  // Legend - bottom center with circles (2 rows of 5)
  const itemsPerRow = 5;
  const itemWidth = 140;
  const rowHeight = 20;
  const legendWidth = itemsPerRow * itemWidth;

  const legend = svg.append('g')
    .attr('transform', `translate(${(width - legendWidth) / 2}, ${height - 65})`);

  topTeams.forEach((team, i) => {
    const totalWins = teamTotalWins[team];
    const row = Math.floor(i / itemsPerRow);
    const col = i % itemsPerRow;

    const legendItem = legend.append('g')
      .attr('transform', `translate(${col * itemWidth}, ${row * rowHeight})`);

    legendItem.append('circle')
      .attr('cx', 0)
      .attr('cy', 0)
      .attr('r', 5)
      .attr('fill', color(team));

    legendItem.append('text')
      .attr('x', 12)
      .attr('y', 4)
      .attr('fill', Utils.colors.textSecondary)
      .attr('font-size', '11px')
      .text(`${team} (${totalWins})`);
  });

  // ============================================
  // RIGHT: Trophy Case - World Cup Winners
  // ============================================
  const trophyWidth = (container.clientWidth * 0.32) || 350;
  const trophyHeight = 550;
  const trophyMargin = { top: 50, right: 30, bottom: 40, left: 90 };
  const trophyInnerWidth = trophyWidth - trophyMargin.left - trophyMargin.right;
  const trophyInnerHeight = trophyHeight - trophyMargin.top - trophyMargin.bottom;

  // Get World Cup winners count
  const winners = Object.entries(DATA.winnerCounts)
    .sort((a, b) => b[1] - a[1]);

  const trophySvg = d3.select(trophyContainer)
    .append('svg')
    .attr('width', trophyWidth)
    .attr('height', trophyHeight);

  const trophyG = trophySvg.append('g')
    .attr('transform', `translate(${trophyMargin.left},${trophyMargin.top})`);

  // Title
  trophySvg.append('text')
    .attr('class', 'chart-title')
    .attr('x', trophyWidth / 2)
    .attr('y', 25)
    .attr('text-anchor', 'middle')
    .attr('fill', Utils.colors.textSecondary)
    .attr('font-size', '14px')
    .style('font-weight', 'bold')
    .text('WORLD CUP TROPHIES');

  // Scales
  const yTrophy = d3.scaleBand()
    .domain(winners.map(d => d[0]))
    .range([0, trophyInnerHeight])
    .padding(0.3);

  const xTrophy = d3.scaleLinear()
    .domain([0, d3.max(winners, d => d[1])])
    .range([0, trophyInnerWidth]);

  const trophyColors = [
    Utils.colors.lime,
    Utils.colors.cyan,
    Utils.colors.amber,
    Utils.colors.emerald,
    Utils.colors.coral,
    Utils.colors.textTertiary,
    Utils.colors.textTertiary,
    Utils.colors.textTertiary
  ];

  // Background bars
  trophyG.selectAll('.bg-bar')
    .data(winners)
    .enter()
    .append('rect')
    .attr('x', 0)
    .attr('y', d => yTrophy(d[0]))
    .attr('width', trophyInnerWidth)
    .attr('height', yTrophy.bandwidth())
    .attr('fill', Utils.colors.bgAccent)
    .attr('rx', 4);

  // Trophy bars with icons
  winners.forEach((winner, i) => {
    const [team, count] = winner;
    const barY = yTrophy(team);

    // Draw trophy icons instead of bars
    for (let t = 0; t < count; t++) {
      trophyG.append('text')
        .attr('x', 10 + t * 35)
        .attr('y', barY + yTrophy.bandwidth() / 2)
        .attr('dominant-baseline', 'middle')
        .attr('fill', trophyColors[i] || Utils.colors.textTertiary)
        .attr('font-size', '22px')
        .style('cursor', 'pointer')
        .text('★')
        .on('mouseenter', function(event) {
          d3.select(this).attr('font-size', '28px');
          // Find the year this team won
          const teamWins = DATA.tournaments
            .filter(t => t.winner === team)
            .map(t => t.year);
          Utils.showTooltip(`
            <div class="tooltip-title" style="color: ${trophyColors[i]}">${team}</div>
            <div>${count} World Cup${count > 1 ? 's' : ''}</div>
            <div style="margin-top: 4px; font-size: 11px; color: ${Utils.colors.textTertiary}">
              ${teamWins.join(', ')}
            </div>
          `, event.pageX, event.pageY);
        })
        .on('mouseleave', function() {
          d3.select(this).attr('font-size', '22px');
          Utils.hideTooltip();
        });
    }
  });

  // Y Axis - team names
  const yTrophyAxis = trophyG.append('g')
    .call(d3.axisLeft(yTrophy));

  yTrophyAxis.selectAll('text')
    .attr('fill', (d, i) => trophyColors[winners.findIndex(w => w[0] === d)] || Utils.colors.textSecondary)
    .attr('font-size', '11px');

  yTrophyAxis.selectAll('line, path').attr('stroke', Utils.colors.border);
}
