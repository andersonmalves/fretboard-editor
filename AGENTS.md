# AGENTS.md

Short orientation for coding agents working on this repository.

## Product shape

- Single-file SPA: all product code lives in `index.html` (HTML + CSS + JS).
- No build step, no framework, no bundler, no runtime dependencies.
- Dev-only tooling: Playwright via `package.json` (`npm test`).

## Non-goals

- No network requests at runtime (CSP blocks external connections).
- No persistence (no `localStorage`, cookies, accounts, analytics, or backend).
- No multi-file app split or framework migration unless an ADR explicitly changes that.

## Hard budget

```text
wc -c index.html  →  ≤ 73.728 bytes
```

Source of truth: [ADR 006](adr/006-budget-bytes-selection-controls.md). Prefer small, surgical edits over refactors that burn the budget.

## Security and a11y (baseline)

- Keep CSP intact; do not introduce inline event-handler attributes or external scripts/styles.
- Prefer `textContent` / safe DOM APIs for labels; never turn user text into markup or URLs.
- Preserve keyboard operation, focus visibility, `aria-*` / `aria-live`, and touch targets ≥ 44×44 px where the UI already requires them.
- Manual VoiceOver / contrast checks stay manual — see the README pre-publish checklist.

## Where things live

| Path | Role |
|---|---|
| `index.html` | Product |
| `specs/` | Approved specs (`fretboard-editor.md`, `transpose-shape.md`, `steps/`) |
| `adr/` | Architecture decisions |
| `tests/` | Playwright E2E |
| `README.md` | Human onboarding, QA notes, manual checklist |

## Commands

```bash
npm install
npx playwright install    # first time only
npm test                  # Chromium, Firefox, WebKit
npm test -- --project=chromium
wc -c index.html          # budget check
python3 -m http.server 4176 --bind 127.0.0.1
```

Prose in `specs/`, `adr/`, and `README.md` is pt-BR. Commit subjects and PR titles are English.
