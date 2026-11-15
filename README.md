# First Handles

A dribbling-training web app for youth basketball players. Static HTML/CSS/JS, no build step, hosted on GitHub Pages.

## Layout
- `js/data/levels.js`: levels and steps (new levels are data, not code)
- `js/data/swatches.js`: preset team colors
- `js/progress.js`: saved profile and progress (browser storage), plus the single `completeStep()` signal
- `js/screens/`: one file per screen
- `js/components/`: swappable pieces (level list, celebration, placeholder drill animation, player card)

## Run locally
Serve the folder (ES modules don't load from `file://`), for example `python3 -m http.server`, then open http://localhost:8000.
