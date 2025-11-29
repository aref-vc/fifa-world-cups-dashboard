# FIFA World Cup Dashboard (1930-2022)

A comprehensive visual analytics dashboard exploring 92 years of FIFA World Cup history through interactive D3.js visualizations.

![Dashboard Preview](https://img.shields.io/badge/Matches-965-BEFF00?style=flat-square)
![Goals](https://img.shields.io/badge/Goals-2720-00BAFE?style=flat-square)
![Tournaments](https://img.shields.io/badge/Tournaments-22-FFC000?style=flat-square)

## Overview

This dashboard presents FIFA World Cup data (1930-2022) through 8 distinct sections, each featuring multiple interactive visualizations. Built with a modular architecture that separates concerns for maintainability.

## Features

- **22 Tournaments** analyzed from Uruguay 1930 to Qatar 2022
- **965 Matches** with detailed statistics
- **Interactive Visualizations** using D3.js v7
- **CORS-Safe** - all data embedded, no external fetches required
- **Electric Dark Theme** with consistent color system

## Sections

| Section | Primary Chart | Secondary Chart |
|---------|--------------|-----------------|
| **Hero** | Animated stat counters | Top 5 champions bar |
| **Timeline** | Tournament evolution area chart | Goals by decade bars |
| **Dominance** | Dynasty rankings bump chart | World Cup trophies display |
| **Goals** | Top scorers lollipop chart | Goals heatmap by stage |
| **Upsets** | Giant killers bar chart | Iconic upset cards |
| **Hosts** | Host performance dot plot | Results breakdown donut |
| **Rivalries** | Force-directed network | Classic rivalry cards |
| **Finals** | Finals scatter plot | Memorable finals cards |

## Quick Start

```bash
# Clone the repository
git clone https://github.com/aref-vc/fifa-world-cups-dashboard.git

# Navigate to project
cd fifa-world-cups-dashboard

# Open in browser (no build step required)
open index.html
```

Or serve locally:

```bash
# Using Python
python -m http.server 8000

# Using Node
npx serve .
```

## Data Pipeline

The project uses a build script to convert CSV data to an embedded JavaScript module:

```bash
# Regenerate data.js from CSV
node build-data.js
```

This creates `js/data.js` with:
- Raw match data
- Tournament summaries
- Pre-computed aggregations (winner counts, host performance, etc.)

## Tech Stack

- **D3.js v7** - Visualization library
- **Vanilla JS** - No framework dependencies
- **CSS Variables** - Theming system
- **Node.js** - Data build pipeline

## Browser Support

Optimized for modern browsers (Chrome, Firefox, Safari, Edge). Desktop-first design with 1200px+ viewport recommended.

## Color System

| Color | Hex | Usage |
|-------|-----|-------|
| Lime | `#BEFF00` | Winners, positive metrics |
| Cyan | `#00BAFE` | Historical data, rankings |
| Amber | `#FFC000` | Draws, neutral states |
| Emerald | `#00DE71` | Goals, growth |
| Coral | `#F04E50` | Losses, upsets |

## Documentation

- [ARCHITECTURE.md](./ARCHITECTURE.md) - Detailed build structure and module organization
- [STRUCTURE.md](./STRUCTURE.md) - Project overview and section descriptions

## Data Source

Match data sourced from historical FIFA World Cup records (1930-2022), including:
- Match results and scores
- Tournament hosts and winners
- Stage classifications (Group, Knockout, Final)

## License

MIT License - see LICENSE file for details.

---

Built with D3.js and Berkeley Mono
