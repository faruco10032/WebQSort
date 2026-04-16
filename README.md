# Web Q-Sort

Browser-based Q-sort tool for behavioral and personality research.

**Live:** https://faruco10032.github.io/WebQSort/

## Overview

Web Q-Sort is a lightweight, client-side web application that replicates the Q-sort methodology used in psychological research. It replaces the legacy RAP Q-Sorter desktop application (.NET Framework 1.1 / Windows XP) with a modern browser-based tool that runs on any platform.

Q methodology is a research technique where participants rank-order a set of statements (the "Q-set") into a forced quasi-normal distribution. This tool implements the standard two-stage procedure:

1. **Pre-sort** — Classify each item into three broad categories (Uncharacteristic / Neutral / Characteristic)
2. **Main Sort** — Distribute items across 9 piles with fixed capacities (forced distribution)

## Features

- **Two-stage sorting**: Pre-sort (3 categories) followed by main sort (9 piles with enforced capacities)
- **Preset decks**: RSQ 3.15, RBQ 3.11, CAQ (Japanese and English)
- **Custom deck import**: Upload any tab-delimited `.txt` deck file
- **Drag & drop**: Full drag-and-drop interface with keyboard shortcuts (←/↓/→ keys, Backspace to undo)
- **Visual feedback**: Color-coded cards by pre-sort category, capacity indicators, over-capacity warnings
- **CSV export**: Automatic CSV download on session completion
- **Session persistence**: Auto-saves progress to localStorage (recoverable after browser crash)
- **Bilingual UI**: Japanese / English toggle
- **No server required**: Fully static — works on GitHub Pages, Netlify, or local `npx serve`

## Supported Decks

| Deck | Items | Pile Capacities (1→9) |
|------|-------|-----------------------|
| RSQ 3.15 | 89 | 3, 6, 11, 15, 19, 15, 11, 6, 3 |
| RBQ 3.11 | 68 | 3, 5, 7, 11, 16, 11, 7, 5, 3 |
| CAQ | 100 | 5, 8, 12, 16, 18, 16, 12, 8, 5 |

## Deck File Format

Tab-delimited text file, one item per line:

```
1	Situation is potentially enjoyable.
2	Situation is complex.
3	A job needs to be done.
```

Format: `<item_number><TAB><item_text>`

## Tech Stack

- React 18 + TypeScript
- Vite (build tool)
- Tailwind CSS (styling)
- @dnd-kit (drag & drop)
- Zustand (state management)

## Development

```bash
npm install
npm run dev      # Start dev server
npm run build    # Production build → dist/
npm run preview  # Preview production build
```

## Deployment

Push to `main` branch triggers automatic deployment to GitHub Pages via GitHub Actions.

## CSV Output Format

```csv
target_id,condition,deck_name,trial,started_at,finished_at,duration_sec,item_id,item_text,pile
S01,avatar_voice,RSQ3-15_ja,1,2026-05-10T10:00:00Z,2026-05-10T10:12:34Z,754,1,"楽しい状況である",5
```

The `pile` column contains values 1–9, where 1 = Extremely Uncharacteristic and 9 = Extremely Characteristic.

## License

For academic research use.
