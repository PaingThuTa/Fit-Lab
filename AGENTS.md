# Repository Guidelines

## Project Structure & Module Organization
This repository is split into a frontend app and a backend API:
- `src/`: React UI (pages, components, routes, Zustand store, mock data).
- `public/`: static frontend assets.
- `server/src/`: Express server (`app.js`, `server.js`), route entrypoint, and Postgres config in `config/db.js`.
- `scripts/`: local utility scripts (for example, `render-app.mjs` smoke-renders the React app in JSDOM).
- `dist/`: frontend production build output (generated).

Keep feature code grouped by domain (for example, `src/pages/Admin/*`, `src/pages/Trainer/*`), and keep shared UI in `src/components/`.

## Build, Test, and Development Commands
Frontend (repo root):
- `npm run dev`: start Vite dev server.
- `npm run build`: create production build in `dist/`.
- `npm run preview`: serve built frontend locally.
- `npm run lint`: run ESLint over `*.js` and `*.jsx`.
- `node scripts/render-app.mjs`: smoke test that `App` renders without crashing.

Backend (`server/`):
- `npm run dev`: run API with `nodemon`.
- `npm start`: run API with Node.

## Coding Style & Naming Conventions
- Use 2-space indentation and semicolons in JavaScript files.
- React components: `PascalCase` file and component names (for example, `ManageCourses.jsx`).
- Hooks/stores/utilities: `camelCase` (for example, `useAuthStore.js`).
- Follow ESLint config in `eslint.config.js` (React Hooks + Vite refresh rules). Run lint before opening a PR.

## Testing Guidelines
There is currently no full automated test suite committed. Minimum checks before PR:
- `npm run lint`
- `node scripts/render-app.mjs`
- Manual sanity test of affected flows in frontend and `/health` on backend.

When adding tests, colocate them near source files using `*.test.js` / `*.test.jsx` naming.

## Commit & Pull Request Guidelines
Recent commits use short, imperative summaries (for example, `frontend wireframe updated`). Follow that style and keep each commit scoped to one logical change.

PRs should include:
- What changed and why.
- Affected areas (`src/...`, `server/...`).
- Setup or env changes (new variables, ports, DB expectations).
- Screenshots/GIFs for UI changes and sample API responses for backend changes.

## Security & Configuration Tips
- Backend reads `.env` / `.env.test` for DB and server settings (`DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `DB_PORT`, `PORT`).
- Do not commit secrets or database credentials.
- Use least-privilege DB users for local and shared environments.
