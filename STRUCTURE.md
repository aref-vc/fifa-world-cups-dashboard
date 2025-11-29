# FIFA World Cup Dashboard - Project Structure

## Overview
A visual analytics dashboard analyzing 965 FIFA World Cup matches (1930-2022) with D3.js visualizations.

## Directory Layout

```
/FIFA World Cups/
├── index.html                 # Main entry point, single-page scroll layout
├── STRUCTURE.md              # This file - project documentation
├── all-world-cup-matches.csv # Source dataset
│
├── css/
│   └── styles.css            # Global styles with CSS variables
│
└── js/
    ├── data.js               # Embedded JSON data + aggregations
    ├── utils.js              # Shared D3 utilities, tooltips, scroll handlers
    └── sections/
        ├── hero.js           # Hero section - key stats with animated counters
        ├── timeline.js       # Tournament evolution stream graph
        ├── dominance.js      # Dynasties bump chart + radial bars
        ├── goals.js          # Scoring patterns - violin plots, heatmaps
        ├── upsets.js         # Giant killers - story cards, diverging bars
        ├── hosts.js          # Host advantage - dot plots, slope charts
        ├── rivalries.js      # Head-to-head - force network, matrix
        └── finals.js         # Final showdowns - timeline strip, scatter
```

## Dashboard Sections

### 1. Hero
- Animated counter cards: matches, goals, countries, tournaments
- Timeline sparkline for tournament growth

### 2. Timeline (Tournament Evolution)
- Stream graph: matches per tournament over time
- Format change annotations (Round of 16 introduction, 32-team expansion)
- Host country indicators

### 3. Dominance (The Dynasties)
- Bump chart: top 8 nations' ranking across tournaments
- Radial bar chart: all-time wins per nation
- Era-based small multiples

### 4. Goals (Scoring Patterns)
- Violin plots: goals per match by decade
- Heatmap: goals by tournament stage
- Lollipop chart: highest-scoring matches

### 5. Upsets (Giant Killers)
- Diverging bar chart: expected vs actual results
- Story cards: top 10 biggest upsets
- Interactive match details

### 6. Hosts (Home Advantage)
- Connected dot plot: host vs non-host performance
- Slope chart: win rate comparison
- Key stats: hosts reaching/winning finals

### 7. Rivalries
- Win-loss record matrix
- Force-directed network: match frequency connections
- Classic rivalry deep dives

### 8. Finals
- Timeline strip: all 22 finals visualized
- Scatter: victory margin vs total goals
- Repeat finalist analysis

## Technical Stack

- **Visualization:** D3.js v7 (inlined for CORS safety)
- **Navigation:** Single-page vertical scroll with smooth transitions
- **Responsiveness:** Desktop-first (1200px+ optimized)
- **Data:** Embedded JavaScript module (no fetch required)

## Color Palette

| Variable | Hex | Usage |
|----------|-----|-------|
| `--lime` | #BEFF00 | Winners, positive trends |
| `--cyan` | #00BAFE | Historical data, timelines |
| `--amber` | #FFC000 | Draws, neutral states |
| `--emerald` | #00DE71 | Goals, growth metrics |
| `--coral` | #F04E50 | Upsets, losses, drama |

## Development Notes

- Each section JS file is self-contained with its own render function
- All sections are initialized from `index.html` after DOM load
- Data aggregations are pre-computed in `data.js` to minimize runtime processing
- Tooltips and scroll behavior handled in `utils.js`
