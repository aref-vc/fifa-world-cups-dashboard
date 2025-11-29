/* FIFA World Cup Dashboard - Utility Functions */

const Utils = {
  // ============================================
  // DOM Helpers
  // ============================================

  $(selector) {
    return document.querySelector(selector);
  },

  $$(selector) {
    return document.querySelectorAll(selector);
  },

  // ============================================
  // Number Formatting
  // ============================================

  formatNumber(num) {
    return new Intl.NumberFormat().format(num);
  },

  formatPercent(num, decimals = 1) {
    return num.toFixed(decimals) + '%';
  },

  // ============================================
  // Color Palette
  // ============================================

  colors: {
    lime: '#BEFF00',
    cyan: '#00BAFE',
    amber: '#FFC000',
    emerald: '#00DE71',
    coral: '#F04E50',
    text: '#FFFFE3',
    textSecondary: '#E6E6CE',
    textTertiary: '#B3B3A3',
    bg: '#10100E',
    bgElevated: '#1A1A18',
    border: '#2A2A28'
  },

  // Chart color scales
  chartColors: ['#BEFF00', '#00BAFE', '#FFC000', '#00DE71', '#F04E50', '#9B59B6', '#3498DB', '#E67E22'],

  getColor(index) {
    return this.chartColors[index % this.chartColors.length];
  },

  // ============================================
  // Tooltip
  // ============================================

  tooltip: null,

  initTooltip() {
    if (this.tooltip) return;

    this.tooltip = document.createElement('div');
    this.tooltip.className = 'tooltip';
    document.body.appendChild(this.tooltip);
  },

  showTooltip(html, x, y) {
    if (!this.tooltip) this.initTooltip();

    this.tooltip.innerHTML = html;
    this.tooltip.classList.add('visible');

    // Position with bounds checking
    const rect = this.tooltip.getBoundingClientRect();
    const padding = 10;

    let left = x + padding;
    let top = y + padding;

    if (left + rect.width > window.innerWidth) {
      left = x - rect.width - padding;
    }
    if (top + rect.height > window.innerHeight) {
      top = y - rect.height - padding;
    }

    this.tooltip.style.left = left + 'px';
    this.tooltip.style.top = top + 'px';
  },

  hideTooltip() {
    if (this.tooltip) {
      this.tooltip.classList.remove('visible');
    }
  },

  // ============================================
  // Scroll Animations
  // ============================================

  initScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate');
          // For stagger animations, also add animate-in
          if (!entry.target.classList.contains('stagger')) {
            entry.target.classList.add('animate-in');
          }
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    });

    // Observe all sections and animatable elements
    document.querySelectorAll('section, .animate-on-scroll, .stagger').forEach(el => {
      observer.observe(el);
    });
  },

  // ============================================
  // Navigation
  // ============================================

  initNavigation() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-links a');

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          navLinks.forEach(link => {
            link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
          });
        }
      });
    }, {
      threshold: 0.3
    });

    sections.forEach(section => observer.observe(section));
  },

  // ============================================
  // Animated Counter
  // ============================================

  animateCounter(element, target, duration = 2000) {
    const start = 0;
    const startTime = performance.now();

    const update = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(start + (target - start) * eased);

      element.textContent = this.formatNumber(current);

      if (progress < 1) {
        requestAnimationFrame(update);
      }
    };

    requestAnimationFrame(update);
  },

  // ============================================
  // D3 Helpers
  // ============================================

  // Standard margins for charts
  margin: { top: 40, right: 40, bottom: 60, left: 60 },

  // Get dimensions for a chart container
  getChartDimensions(container) {
    const rect = container.getBoundingClientRect();
    return {
      width: rect.width,
      height: rect.height || 400,
      innerWidth: rect.width - this.margin.left - this.margin.right,
      innerHeight: (rect.height || 400) - this.margin.top - this.margin.bottom
    };
  },

  // Create SVG with standard setup
  createSvg(container, width, height) {
    return d3.select(container)
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${this.margin.left},${this.margin.top})`);
  },

  // Standard axis styling
  styleAxis(axis) {
    axis.selectAll('line').attr('stroke', this.colors.border);
    axis.selectAll('path').attr('stroke', this.colors.border);
    axis.selectAll('text')
      .attr('fill', this.colors.textTertiary)
      .style('font-family', "'Berkeley Mono', monospace")
      .style('font-size', '11px');
  },

  // ============================================
  // Data Helpers
  // ============================================

  // Group matches by a key
  groupBy(array, key) {
    return array.reduce((result, item) => {
      const k = typeof key === 'function' ? key(item) : item[key];
      (result[k] = result[k] || []).push(item);
      return result;
    }, {});
  },

  // Get unique values
  unique(array, key) {
    if (key) {
      return [...new Set(array.map(item => item[key]))];
    }
    return [...new Set(array)];
  },

  // Sort by key
  sortBy(array, key, desc = false) {
    return [...array].sort((a, b) => {
      const va = typeof key === 'function' ? key(a) : a[key];
      const vb = typeof key === 'function' ? key(b) : b[key];
      return desc ? vb - va : va - vb;
    });
  }
};

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  Utils.initTooltip();
  Utils.initScrollAnimations();
  Utils.initNavigation();
});
