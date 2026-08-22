# Cleanup Report

## Removed

- `.git/` repository metadata
- `backend/.agents/` generated/local agent metadata
- `backend/node_modules/` and `frontend/node_modules/` generated dependencies
- `frontend/dist/` generated build output
- local `.env` files
- unused frontend assets (`hero.png`, `react.svg`, `vite.svg`)
- unused legacy `frontend/src/Profile.jsx`
- unused test page `frontend/src/PoseTest.jsx`
- unused legacy `backend/src/app.js`
- duplicate DB test `backend/test-db.js`
- generated `backend/skills-lock.json`
- obsolete `frontend/README.md`

## Reorganized

Frontend pages are under `src/pages/`, reusable pose components under `src/components/`, and existing `ai`, `contexts`, `services`, and `utils` modules remain grouped by responsibility.

## Intentionally retained

All Prisma migrations were kept. They are schema history, not duplicate files, and deleting them could break migration history for an existing database.

## Production fixes

- Prisma now uses `DATABASE_URL` rather than hard-coded local credentials.
- Added `/api/health`.
- Removed duplicate/unreachable page rendering in `App.jsx`.
- Frontend is built and served by nginx in production.
- nginx proxies `/api` to the backend service and supports SPA fallback.
- Compose includes MySQL, backend, frontend, and optional phpMyAdmin.
- Deployment `.env.example` templates are included without secrets.
