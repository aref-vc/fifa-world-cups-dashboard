/* Hero Section - Key Stats */

function initHero() {
  const container = Utils.$('#hero .container');

  const stats = DATA.summary;

  container.innerHTML = `
    <div class="hero-content" style="text-align: center; padding: 60px 0;">
      <h1 style="font-size: 4rem; margin-bottom: 16px;">
        <span style="color: var(--lime);">92 Years</span> of World Cup History
      </h1>
      <p style="font-size: 1.25rem; color: var(--text-secondary); margin-bottom: 60px; text-align: center;">
        From Montevideo 1930 to Lusail 2022
      </p>

      <div class="stat-grid stagger" style="max-width: 900px; margin: 0 auto;">
        <div class="stat-card">
          <div class="stat-value" data-target="${stats.totalMatches}">0</div>
          <div class="stat-label">Matches Played</div>
        </div>
        <div class="stat-card">
          <div class="stat-value" data-target="${stats.totalGoals}">0</div>
          <div class="stat-label">Goals Scored</div>
        </div>
        <div class="stat-card">
          <div class="stat-value" data-target="${stats.totalTournaments}">0</div>
          <div class="stat-label">Tournaments</div>
        </div>
        <div class="stat-card">
          <div class="stat-value" data-target="${stats.totalTeams}">0</div>
          <div class="stat-label">Nations</div>
        </div>
      </div>

      <div style="margin-top: 60px; padding: 24px; background: var(--bg-elevated); border-radius: 8px; display: inline-block;">
        <div class="label" style="margin-bottom: 8px;">Most Successful Nation</div>
        <div style="font-size: 1.5rem;">
          <span style="color: var(--lime);">${stats.mostWins[0]}</span>
          <span style="color: var(--text-tertiary);"> - ${stats.mostWins[1]} World Cup titles</span>
        </div>
      </div>
    </div>
  `;

  // Animate counters when section comes into view
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        container.querySelectorAll('.stat-value[data-target]').forEach(el => {
          const target = parseInt(el.dataset.target);
          Utils.animateCounter(el, target, 2000);
        });
        container.querySelector('.stagger').classList.add('animate');
        observer.disconnect();
      }
    });
  }, { threshold: 0.3 });

  observer.observe(container);
}
