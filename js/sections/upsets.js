/* Upsets Section - Giant Killers */

function initUpsets() {
  const container = document.getElementById('upsets-chart');
  if (!container || !DATA.matches) return;

  // Define historically strong teams (World Cup winners + traditional powers)
  const powerTeams = ['Brazil', 'Germany', 'West Germany', 'Italy', 'Argentina', 'France', 'England', 'Spain', 'Netherlands', 'Uruguay'];

  // Find upsets: non-power team beats a power team
  const upsets = DATA.matches.filter(m => {
    if (m.isDraw) return false;
    const winnerIsPower = powerTeams.includes(m.winner);
    const loserIsPower = powerTeams.includes(m.loser);
    return !winnerIsPower && loserIsPower;
  }).map(m => ({
    ...m,
    upsetScore: m.goalDiff + (m.isKnockout ? 2 : 0) + (m.isFinal ? 3 : 0)
  })).sort((a, b) => b.upsetScore - a.upsetScore);

  // Top 15 upsets
  const topUpsets = upsets.slice(0, 15);

  container.innerHTML = '';

  // Create layout: story cards on left, bar chart on right
  const wrapper = document.createElement('div');
  wrapper.style.display = 'grid';
  wrapper.style.gridTemplateColumns = '1fr 1fr';
  wrapper.style.gap = '40px';
  wrapper.style.alignItems = 'start';
  container.appendChild(wrapper);

  // ============================================
  // Story Cards (Left)
  // ============================================
  const cardsContainer = document.createElement('div');
  cardsContainer.style.display = 'flex';
  cardsContainer.style.flexDirection = 'column';
  cardsContainer.style.gap = '16px';
  wrapper.appendChild(cardsContainer);

  // Section title
  const cardsTitle = document.createElement('h3');
  cardsTitle.textContent = 'Iconic Upsets';
  cardsTitle.style.color = Utils.colors.coral;
  cardsTitle.style.marginBottom = '8px';
  cardsTitle.style.fontSize = '14px';
  cardsTitle.style.textTransform = 'uppercase';
  cardsTitle.style.letterSpacing = '0.1em';
  cardsContainer.appendChild(cardsTitle);

  // Top 5 as story cards
  topUpsets.slice(0, 5).forEach((match, i) => {
    const card = document.createElement('div');
    card.className = 'card';
    card.style.borderLeft = `3px solid ${Utils.colors.coral}`;
    card.style.transition = 'transform 0.2s, box-shadow 0.2s';
    card.style.cursor = 'pointer';

    card.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: flex-start;">
        <div>
          <div style="font-size: 1.25rem; color: ${Utils.colors.text}; margin-bottom: 4px;">
            <span style="color: ${Utils.colors.lime}">${match.winner}</span>
            <span style="color: ${Utils.colors.textTertiary}; font-size: 0.9rem;"> ${match.homeScore}-${match.awayScore} </span>
            <span style="color: ${Utils.colors.coral}">${match.loser}</span>
          </div>
          <div style="font-size: 0.875rem; color: ${Utils.colors.textTertiary};">
            ${match.year} ${match.host} &middot; ${match.stage}
          </div>
        </div>
        <div style="text-align: right;">
          <div style="font-size: 1.5rem; color: ${Utils.colors.amber}; font-weight: 500;">#${i + 1}</div>
        </div>
      </div>
    `;

    card.addEventListener('mouseenter', () => {
      card.style.transform = 'translateX(8px)';
      card.style.boxShadow = `0 4px 20px rgba(${Utils.colors.coralRgb || '240, 78, 80'}, 0.2)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = 'translateX(0)';
      card.style.boxShadow = 'none';
    });

    cardsContainer.appendChild(card);
  });

  // ============================================
  // Bar Chart (Right) - All 15 upsets
  // ============================================
  const chartContainer = document.createElement('div');
  wrapper.appendChild(chartContainer);

  const width = (container.clientWidth / 2) - 40 || 500;
  const height = 450;
  const margin = { top: 40, right: 30, bottom: 20, left: 160 };
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
    .attr('y', 20)
    .attr('text-anchor', 'middle')
    .attr('fill', Utils.colors.textSecondary)
    .attr('font-size', '14px')
    .attr('font-weight', '600')
    .text('TOP 15 GIANT-KILLING VICTORIES');

  // Scales
  const x = d3.scaleLinear()
    .domain([0, d3.max(topUpsets, d => d.goalDiff) + 1])
    .range([0, innerWidth]);

  const y = d3.scaleBand()
    .domain(topUpsets.map((d, i) => i))
    .range([0, innerHeight])
    .padding(0.25);

  // Bars
  g.selectAll('.upset-bar')
    .data(topUpsets)
    .enter()
    .append('rect')
    .attr('class', 'upset-bar')
    .attr('x', 0)
    .attr('y', (d, i) => y(i))
    .attr('width', d => x(d.goalDiff))
    .attr('height', y.bandwidth())
    .attr('fill', (d, i) => i < 5 ? Utils.colors.coral : Utils.colors.amber)
    .attr('opacity', (d, i) => 1 - (i * 0.04))
    .attr('rx', 3)
    .style('cursor', 'pointer')
    .on('mouseenter', function(event, d) {
      d3.select(this).attr('opacity', 1).attr('stroke', Utils.colors.text).attr('stroke-width', 1);
      Utils.showTooltip(`
        <div class="tooltip-title">${d.winner} defeats ${d.loser}</div>
        <div>${d.homeScore} - ${d.awayScore}</div>
        <div>${d.year} ${d.host} &middot; ${d.stage}</div>
        <div style="margin-top: 4px;">Goal difference: <span style="color: ${Utils.colors.coral}">${d.goalDiff}</span></div>
      `, event.pageX, event.pageY);
    })
    .on('mouseleave', function(event, d, i) {
      const idx = topUpsets.indexOf(d);
      d3.select(this).attr('opacity', 1 - (idx * 0.04)).attr('stroke', 'none');
      Utils.hideTooltip();
    });

  // Goal diff labels
  g.selectAll('.upset-value')
    .data(topUpsets)
    .enter()
    .append('text')
    .attr('class', 'upset-value')
    .attr('x', d => x(d.goalDiff) + 8)
    .attr('y', (d, i) => y(i) + y.bandwidth() / 2)
    .attr('dominant-baseline', 'middle')
    .attr('fill', Utils.colors.textSecondary)
    .attr('font-size', '11px')
    .text(d => `+${d.goalDiff}`);

  // Match labels
  g.selectAll('.upset-label')
    .data(topUpsets)
    .enter()
    .append('text')
    .attr('class', 'upset-label')
    .attr('x', -8)
    .attr('y', (d, i) => y(i) + y.bandwidth() / 2)
    .attr('text-anchor', 'end')
    .attr('dominant-baseline', 'middle')
    .attr('fill', Utils.colors.textSecondary)
    .attr('font-size', '10px')
    .text(d => `${d.winner} vs ${d.loser} '${String(d.year).slice(2)}`);

  // Knockout indicator dots
  g.selectAll('.knockout-dot')
    .data(topUpsets.filter(d => d.isKnockout))
    .enter()
    .append('circle')
    .attr('class', 'knockout-dot')
    .attr('cx', -150)
    .attr('cy', d => {
      const idx = topUpsets.indexOf(d);
      return y(idx) + y.bandwidth() / 2;
    })
    .attr('r', 4)
    .attr('fill', Utils.colors.cyan);

  // Legend - bottom center with circle
  const legend = svg.append('g')
    .attr('transform', `translate(${width / 2 - 60}, ${height - 10})`);

  legend.append('circle')
    .attr('cx', 0)
    .attr('cy', 0)
    .attr('r', 5)
    .attr('fill', Utils.colors.cyan);

  legend.append('text')
    .attr('x', 12)
    .attr('y', 4)
    .attr('fill', Utils.colors.textTertiary)
    .attr('font-size', '11px')
    .text('Knockout stage upset');
}
