# Architecture Guide

This document details the modular architecture and build structure of the FIFA World Cup Dashboard.

## Design Philosophy

The project follows a **separation of concerns** pattern:

1. **Data Layer** - CSV source → Build script → Embedded JS module
2. **Presentation Layer** - Modular section components with isolated logic
3. **Style Layer** - Centralized CSS with variables for theming
4. **Utility Layer** - Shared functions for tooltips, animations, colors

## Directory Structure

```
FIFA World Cups/
│
├── index.html                 # Entry point - loads all modules, defines sections
│
├── css/
│   └── styles.css             # Global styles, CSS variables, animations
│
├── js/
│   ├── data.js                # [GENERATED] Embedded data module
│   ├── utils.js               # Shared utilities (colors, tooltips, helpers)
│   │
│   └── sections/              # Modular visualization components
│       ├── hero.js            # initHero()
│       ├── timeline.js        # initTimeline()
│       ├── dominance.js       # initDominance()
│       ├── goals.js           # initGoals()
│       ├── upsets.js          # initUpsets()
│       ├── hosts.js           # initHosts()
│       ├── rivalries.js       # initRivalries()
│       └── finals.js          # initFinals()
│
├── build-data.js              # Node script: CSV → data.js
├── all-world-cup-matches.csv  # Source dataset
│
├── README.md                  # Project overview
├── ARCHITECTURE.md            # This file
└── STRUCTURE.md               # Section descriptions
```

## Build Pipeline

### Data Flow

```
┌─────────────────────────┐
│  all-world-cup-matches  │
│         .csv            │
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│     build-data.js       │
│  (Node.js transform)    │
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│      js/data.js         │
│  (Embedded JS module)   │
└─────────────────────────┘
```

### Running the Build

```bash
node build-data.js
```

This generates `js/data.js` containing:

```javascript
const DATA = {
  matches: [...],           // All 965 matches
  tournaments: [...],       // 22 tournament summaries
  summary: {...},           // Aggregate stats
  winnerCounts: {...},      // Titles per nation
  hostPerformance: [...],   // Host nation stats
  finals: [...]             // Final match details
};
```

### Why Embedded Data?

- **CORS-Safe**: No fetch() calls = works from file:// protocol
- **Performance**: Data available immediately on page load
- **Simplicity**: No async loading or error handling needed
- **Offline**: Dashboard works without network

## Module Architecture

### Entry Point (index.html)

```html
<!-- Load order matters -->
<script src="js/data.js"></script>      <!-- Data first -->
<script src="js/utils.js"></script>     <!-- Utilities second -->
<script src="js/sections/hero.js"></script>
<script src="js/sections/timeline.js"></script>
<!-- ... other sections ... -->

<script>
  // Initialize all sections after DOM ready
  document.addEventListener('DOMContentLoaded', () => {
    initHero();
    initTimeline();
    initDominance();
    // ...
  });
</script>
```

### Section Component Pattern

Each section follows this structure:

```javascript
/* Section Name - Brief Description */

function initSectionName() {
  // 1. Get container
  const container = document.getElementById('section-chart');
  if (!container || !DATA.requiredData) return;

  // 2. Clear and setup
  container.innerHTML = '';

  // 3. Create layout wrapper
  const wrapper = document.createElement('div');
  wrapper.style.display = 'grid';
  wrapper.style.gridTemplateColumns = '2fr 1fr';
  container.appendChild(wrapper);

  // 4. Build primary visualization
  const svg = d3.select(wrapper)
    .append('svg')
    // ... D3 code

  // 5. Build secondary visualization
  // ... additional charts
}
```

### Utils Module (utils.js)

Provides shared functionality:

```javascript
const Utils = {
  // Color palette
  colors: {
    lime: '#BEFF00',
    cyan: '#00BAFE',
    amber: '#FFC000',
    emerald: '#00DE71',
    coral: '#F04E50',
    // ... backgrounds, text colors
  },

  // Chart color array for scales
  chartColors: [...],

  // DOM helpers
  $: (selector) => document.querySelector(selector),
  $$: (selector) => document.querySelectorAll(selector),

  // Tooltip management
  showTooltip: (content, x, y) => {...},
  hideTooltip: () => {...},

  // Animation helpers
  animateCounter: (element, target, duration) => {...}
};
```

## Styling Architecture

### CSS Variables (styles.css)

```css
:root {
  /* Backgrounds */
  --bg-main: #10100E;
  --bg-elevated: #1A1A18;
  --bg-accent: #242422;

  /* Text */
  --text-primary: #FFFFE3;
  --text-secondary: #E6E6CE;
  --text-tertiary: #B3B3A3;

  /* UI Colors */
  --lime: #BEFF00;
  --cyan: #00BAFE;
  --amber: #FFC000;
  --emerald: #00DE71;
  --coral: #F04E50;

  /* Layout */
  --section-padding: 80px;
  --container-max: 1400px;
  --gap: 24px;
}
```

### Component Classes

```css
/* Cards */
.card { ... }
.card-highlight { ... }

/* Stats */
.stat-card { ... }
.stat-value { ... }
.stat-label { ... }

/* Charts */
.chart-container { ... }
svg text.chart-title { ... }

/* Tooltips */
.tooltip { ... }
.tooltip.visible { ... }
```

### Animation System

```css
/* Section reveal on scroll */
section {
  opacity: 0;
  transform: translateY(40px);
  transition: opacity 0.8s, transform 0.8s;
}

section.animate {
  opacity: 1;
  transform: translateY(0);
}

/* Staggered children */
.stagger.animate > *:nth-child(1) { animation-delay: 0.1s; }
.stagger.animate > *:nth-child(2) { animation-delay: 0.2s; }
/* ... */
```

## Chart Conventions

### Titles
- Bold uppercase text
- Centered above chart
- Font size: 14px
- Color: `Utils.colors.textSecondary`

```javascript
svg.append('text')
  .attr('class', 'chart-title')
  .attr('x', width / 2)
  .attr('y', 20)
  .attr('text-anchor', 'middle')
  .attr('fill', Utils.colors.textSecondary)
  .attr('font-size', '14px')
  .style('font-weight', 'bold')
  .text('CHART TITLE IN CAPS');
```

### Legends
- Bottom center position
- Circle markers (no borders)
- 5px radius

```javascript
legend.append('circle')
  .attr('r', 5)
  .attr('fill', color);

legend.append('text')
  .attr('x', 12)
  .attr('y', 4)
  .attr('fill', Utils.colors.textSecondary)
  .attr('font-size', '11px')
  .text('Label');
```

### Tooltips
- Use `Utils.showTooltip()` and `Utils.hideTooltip()`
- Include `.tooltip-title` for headers
- Apply colors inline for values

```javascript
.on('mouseenter', function(event, d) {
  Utils.showTooltip(`
    <div class="tooltip-title">${d.name}</div>
    <div>Value: <span style="color: ${Utils.colors.lime}">${d.value}</span></div>
  `, event.pageX, event.pageY);
})
.on('mouseleave', Utils.hideTooltip);
```

## Adding New Sections

1. **Create section file**: `js/sections/newsection.js`

```javascript
function initNewSection() {
  const container = document.getElementById('newsection-chart');
  if (!container) return;

  // Build visualization...
}
```

2. **Add HTML section** in `index.html`:

```html
<section id="newsection">
  <div class="container">
    <div class="section-header">
      <div class="section-number">09</div>
      <h2 class="section-title">NEW SECTION</h2>
      <p class="section-subtitle">Description here</p>
    </div>
    <div id="newsection-chart" class="chart-container"></div>
  </div>
</section>
```

3. **Load script** in `index.html`:

```html
<script src="js/sections/newsection.js"></script>
```

4. **Initialize** in DOMContentLoaded:

```javascript
initNewSection();
```

## Performance Considerations

- **Pre-computed aggregations**: Complex calculations done at build time
- **SVG over Canvas**: Better for interactive tooltips, moderate data size
- **Lazy initialization**: Sections render only when container exists
- **CSS animations**: Hardware-accelerated transitions
- **No framework overhead**: Vanilla JS for minimal bundle size

## Browser Compatibility

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

Requires ES6+ support (arrow functions, template literals, destructuring).
