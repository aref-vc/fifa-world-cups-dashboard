/* Hero Section - Key Stats */

function initHero() {
  const container = Utils.$('#hero .container');

  const stats = DATA.summary;

  // Get top 5 winners for the visual
  const topWinners = Object.entries(DATA.winnerCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  container.innerHTML = `
    <div class="hero-content" style="text-align: center; padding: 80px 0 60px;">

      <!-- Glowing accent line -->
      <div style="width: 120px; height: 3px; background: linear-gradient(90deg, transparent, var(--lime), transparent); margin: 0 auto 40px; opacity: 0.8;"></div>

      <!-- Main title with gradient effect -->
      <h1 style="font-size: 5rem; margin-bottom: 8px; font-weight: 700; letter-spacing: -0.02em; line-height: 1.1;">
        <span style="background: linear-gradient(135deg, var(--lime) 0%, var(--cyan) 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">92 YEARS</span>
      </h1>
      <h2 style="font-size: 2.5rem; font-weight: 400; color: var(--text-primary); margin-bottom: 16px; letter-spacing: 0.1em;">
        OF WORLD CUP HISTORY
      </h2>

      <!-- Subtitle with decorative elements -->
      <div style="display: flex; align-items: center; justify-content: center; gap: 16px; margin-bottom: 60px;">
        <div style="width: 40px; height: 1px; background: var(--border-light);"></div>
        <p style="font-size: 1rem; color: var(--text-tertiary); letter-spacing: 0.15em; text-transform: uppercase;">
          Montevideo 1930 — Lusail 2022
        </p>
        <div style="width: 40px; height: 1px; background: var(--border-light);"></div>
      </div>

      <!-- Stats grid with enhanced cards -->
      <div class="hero-stats stagger" style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 24px; max-width: 1000px; margin: 0 auto 70px;">

        <div class="hero-stat-card" style="background: linear-gradient(135deg, rgba(190, 255, 0, 0.08) 0%, rgba(190, 255, 0, 0.02) 100%); border: 1px solid rgba(190, 255, 0, 0.2); border-radius: 16px; padding: 32px 24px; position: relative; overflow: hidden;">
          <div style="position: absolute; top: -20px; right: -20px; width: 80px; height: 80px; background: radial-gradient(circle, rgba(190, 255, 0, 0.15) 0%, transparent 70%);"></div>
          <div class="stat-value" data-target="${stats.totalMatches}" style="font-size: 3.5rem; font-weight: 600; color: var(--lime); line-height: 1; margin-bottom: 8px;">0</div>
          <div style="font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.15em; color: var(--text-tertiary);">Matches Played</div>
        </div>

        <div class="hero-stat-card" style="background: linear-gradient(135deg, rgba(0, 186, 254, 0.08) 0%, rgba(0, 186, 254, 0.02) 100%); border: 1px solid rgba(0, 186, 254, 0.2); border-radius: 16px; padding: 32px 24px; position: relative; overflow: hidden;">
          <div style="position: absolute; top: -20px; right: -20px; width: 80px; height: 80px; background: radial-gradient(circle, rgba(0, 186, 254, 0.15) 0%, transparent 70%);"></div>
          <div class="stat-value" data-target="${stats.totalGoals}" style="font-size: 3.5rem; font-weight: 600; color: var(--cyan); line-height: 1; margin-bottom: 8px;">0</div>
          <div style="font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.15em; color: var(--text-tertiary);">Goals Scored</div>
        </div>

        <div class="hero-stat-card" style="background: linear-gradient(135deg, rgba(255, 192, 0, 0.08) 0%, rgba(255, 192, 0, 0.02) 100%); border: 1px solid rgba(255, 192, 0, 0.2); border-radius: 16px; padding: 32px 24px; position: relative; overflow: hidden;">
          <div style="position: absolute; top: -20px; right: -20px; width: 80px; height: 80px; background: radial-gradient(circle, rgba(255, 192, 0, 0.15) 0%, transparent 70%);"></div>
          <div class="stat-value" data-target="${stats.totalTournaments}" style="font-size: 3.5rem; font-weight: 600; color: var(--amber); line-height: 1; margin-bottom: 8px;">0</div>
          <div style="font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.15em; color: var(--text-tertiary);">Tournaments</div>
        </div>

        <div class="hero-stat-card" style="background: linear-gradient(135deg, rgba(0, 222, 113, 0.08) 0%, rgba(0, 222, 113, 0.02) 100%); border: 1px solid rgba(0, 222, 113, 0.2); border-radius: 16px; padding: 32px 24px; position: relative; overflow: hidden;">
          <div style="position: absolute; top: -20px; right: -20px; width: 80px; height: 80px; background: radial-gradient(circle, rgba(0, 222, 113, 0.15) 0%, transparent 70%);"></div>
          <div class="stat-value" data-target="${stats.totalTeams}" style="font-size: 3.5rem; font-weight: 600; color: var(--emerald); line-height: 1; margin-bottom: 8px;">0</div>
          <div style="font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.15em; color: var(--text-tertiary);">Nations</div>
        </div>

      </div>

      <!-- World Cup Champions section -->
      <div style="max-width: 800px; margin: 0 auto;">
        <div style="font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.2em; color: var(--text-tertiary); margin-bottom: 24px;">World Cup Champions</div>

        <div style="display: flex; justify-content: center; align-items: flex-end; gap: 32px;">
          ${topWinners.map((winner, i) => {
            const colors = ['var(--lime)', 'var(--cyan)', 'var(--amber)', 'var(--emerald)', 'var(--coral)'];
            const heights = [100, 80, 65, 50, 40];
            const sizes = ['2rem', '1.5rem', '1.25rem', '1.1rem', '1rem'];
            return `
              <div style="display: flex; flex-direction: column; align-items: center; gap: 12px;">
                <div style="font-size: ${sizes[i]}; font-weight: 600; color: ${colors[i]};">${winner[1]}</div>
                <div style="width: 60px; height: ${heights[i]}px; background: linear-gradient(180deg, ${colors[i]} 0%, transparent 100%); border-radius: 4px 4px 0 0; opacity: 0.6;"></div>
                <div style="font-size: 0.7rem; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.05em;">${winner[0]}</div>
              </div>
            `;
          }).join('')}
        </div>
      </div>

      <!-- Scroll indicator -->
      <div style="margin-top: 60px; opacity: 0.5;">
        <div style="font-size: 0.65rem; text-transform: uppercase; letter-spacing: 0.2em; color: var(--text-tertiary); margin-bottom: 8px;">Scroll to explore</div>
        <div style="width: 1px; height: 30px; background: linear-gradient(180deg, var(--text-tertiary), transparent); margin: 0 auto;"></div>
      </div>

    </div>
  `;

  // Animate counters when section comes into view
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        container.querySelectorAll('.stat-value[data-target]').forEach((el, index) => {
          const target = parseInt(el.dataset.target);
          // Stagger the counter animations
          setTimeout(() => {
            Utils.animateCounter(el, target, 2000);
          }, index * 150);
        });
        container.querySelector('.stagger').classList.add('animate');
        observer.disconnect();
      }
    });
  }, { threshold: 0.3 });

  observer.observe(container);
}
