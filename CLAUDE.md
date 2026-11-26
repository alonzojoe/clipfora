# Clipfora

An Electron + TypeScript app for macOS, used for clipping content.

## App structure

- The main process (`src/main`) owns the filesystem. The window only reaches it through the typed `window.api` from `src/preload`, and types used by both sides live in `src/shared/types.ts`.
- The window reads imported files through `clip://media/<id>` only, never `file://`. An id must be one the workspace store knows, so add new file access there.
- UI follows vfx Studio's layout with Clipfora's own brand: colors are the CSS variables in `src/renderer/src/assets/main.css`, primitives are in `src/renderer/src/components/ui`.

## Branch names

Name every new branch `<type>/<short-kebab-description>`, e.g. `feat/clip-trimmer`. The type joins with `/` because git rejects `:` in branch names.

Types: `feat` (new feature), `fix` (bug fix), `docs`, `chore` (maintenance, dependencies), `perf`, `refactor`, `test`, `build`, `ci`, `style` (formatting only), `revert`.

## Pull requests

Title: `<Type>: <What changed>`, using a branch type above, with the type and the first word after the colon both capitalised, e.g. `Feat: Add clip trimmer`, `Fix: Resolve export crash`.

Description: plain English sentences, written the way a person would explain the change to a teammate. Use only commas and full stops for punctuation, leaving out parentheses, slashes, quotation marks and em dashes.

## Agent skills

### Issue tracker

Issues live in GitHub Issues for alonzojoe/clipfora (via the `gh` CLI). See `docs/agents/issue-tracker.md`.

### Triage labels

Default vocabulary: `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: one `GLOSSARY.md` and `docs/adr/` at the repo root. See `docs/agents/domain.md`.
