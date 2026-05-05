# StudentStory

StudentStory is a focused teacher tool for capturing small classroom observations and turning them into evidence-based conference scripts, parent emails, report card comments, and support plans.

It is intentionally not a general AI lesson planner. The value is the evidence workflow: quick notes, evidence coverage, missing documentation flags, consistency checks, and class-level conference readiness.

## Local setup

```bash
npm install --include=optional --no-audit --no-fund --legacy-peer-deps
npm run dev
```

## Vercel settings

- Framework Preset: Vite
- Install Command: `npm install --include=optional --no-audit --no-fund --legacy-peer-deps`
- Build Command: `npm run build`
- Output Directory: `dist`
- Node.js Version: `20.x`

## Notes

- Data is stored in browser localStorage.
- Export/import JSON is included for simple backup.
- Print/Save as PDF uses the browser print dialog.


## v1.2 polished layout update
- Rebuilt the main screen into a cleaner premium boxed layout.
- Added a hero card with contained stats and a polished segmented navigation control.
- Improved the selected-student card, evidence readiness donut, observation form, and one-tap bank.
- Removed harsh black/white tab styling and replaced it with purple/lavender gradient controls.
- Added a privacy strip and stronger responsive layout.
