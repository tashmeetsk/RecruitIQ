# RecruitIQ

A recruitment knowledge management system for a small team of 3 recruiters to track candidates, job openings, and hiring pipeline. Uses Gemini AI to extract candidate info from resumes, chat notes, and voice notes.

## Run & Operate

- `pnpm --filter @workspace/recruit-iq run dev` — run the frontend (served at `/`)
- `pnpm --filter @workspace/api-server run dev` — run the API server (served at `/api`)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string
- Required env: `SESSION_SECRET` — session signing secret
- Required env: `GEMINI_API_KEY` — Gemini AI API key for candidate extraction

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite + Tailwind CSS + shadcn/ui + React Query
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- AI: Google Gemini 2.0 Flash (`@google/generative-ai`)
- File handling: multer (uploads), mammoth (DOCX → text extraction)
- Session auth: express-session (simple email-only login for 3 known users)
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `lib/api-spec/openapi.yaml` — API contract (source of truth)
- `lib/db/src/schema/` — Drizzle table definitions (candidates, candidate_preferences, job_openings, candidate_job_status, users)
- `artifacts/api-server/src/routes/` — Express route handlers
- `artifacts/api-server/src/lib/gemini.ts` — Gemini AI extraction service
- `artifacts/recruit-iq/src/` — React frontend

## Architecture decisions

- Simple email-only auth: 3 hardcoded users (Tashmeet, Alex, Jordan). No passwords, no DB users table needed for auth. Session stored server-side via express-session.
- Gemini extraction endpoint (`POST /api/candidates/extract`) is **not** in the OpenAPI spec — it uses multipart/form-data with binary files, which breaks the Zod lib typecheck (no DOM `File`/`Blob` types in Node-targeted tsconfig). Frontend calls it with native `fetch` + `FormData`.
- DOCX files are pre-processed with `mammoth` to extract raw text before sending to Gemini (Gemini cannot read DOCX directly).
- `lastVerifiedAt` on candidate_preferences is automatically updated whenever a candidate's job status is changed (implies a recruiter just checked in on them).
- `desired_role_category` is a standardized text bucket matching job `role_category` — the matching logic is a simple equality check.

## Product

- `/login` — Email-only login
- `/` — Dashboard: pipeline stats, recent candidates, role breakdown
- `/candidates` — Candidate list with search and filter
- `/candidates/new` — Add candidate: file upload + Gemini extraction + review form
- `/candidates/:id` — Candidate detail with preferences and job statuses
- `/jobs` — Job openings list
- `/jobs/new` — Create job opening
- `/jobs/:id` — Job detail with matched candidate pipeline + status management
- `/match` — Cross-job candidate search/filter

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- After changing `lib/api-spec/openapi.yaml`, always run codegen: `pnpm --filter @workspace/api-spec run codegen`
- The `/api/candidates/extract` endpoint is multipart — it does **not** have generated hooks. The frontend calls it directly with `fetch + FormData`.
- Operations with both path params AND query params in the OpenAPI spec cause Orval TS2308 collisions. Use client-side filtering instead of adding query params to those endpoints.
- Body schemas in the OpenAPI spec must use entity-shaped names (e.g. `CandidateInput`), never `<OperationId>Body` — that collides with Orval's auto-generated Zod schema name.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
