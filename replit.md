# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Structure

```text
artifacts-monorepo/
├── artifacts/              # Deployable applications
│   ├── api-server/         # Express API server
│   └── detox-app/          # Digital Detox React + Vite frontend (at /)
├── lib/                    # Shared libraries
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   └── db/                 # Drizzle ORM schema + DB connection
├── scripts/                # Utility scripts (single workspace package)
│   └── src/                # Individual .ts scripts
├── pnpm-workspace.yaml     # pnpm workspace
├── tsconfig.base.json      # Shared TS options
├── tsconfig.json           # Root TS project references
└── package.json            # Root package with hoisted devDeps
```

## Application: Digital Detox App

A screen-locking wellness app that helps users avoid distractions.

### Features
- **Lock Screen**: Full-screen overlay with live detox timer
- **Emergency Unlock**: 2, 3, or 5 minute delay options before unlocking is allowed
- **Question-based Unlock**: User must correctly answer N custom questions to unlock
- **Custom Questions**: Users define their own questions and answers
- **Answer Progress**: Saved so users don't repeat already-answered questions; can reset
- **Settings**: Configure question count and emergency delay duration
- **Dashboard**: Lock status, "Start Detox" button, and motivational content

### Database Tables
- `questions` — user-defined questions with text answers
- `settings` — app configuration (question count, emergency delay)
- `progress` — tracks which questions have been answered correctly
- `lock_state` — current lock/unlock state with timestamps

### API Endpoints (all at /api)
- `GET/POST /questions`, `PUT/DELETE /questions/:id`
- `GET/PUT /settings`
- `GET/POST/DELETE /progress`
- `GET/POST /lock`

## TypeScript & Composite Projects

Every package extends `tsconfig.base.json` which sets `composite: true`. The root `tsconfig.json` lists all packages as project references. This means:

- **Always typecheck from the root** — run `pnpm run typecheck`
- **`emitDeclarationOnly`** — we only emit `.d.ts` files during typecheck

## Packages

### `artifacts/detox-app` (`@workspace/detox-app`)

React + Vite frontend. Uses React Query hooks generated from OpenAPI. Key pages:
- `Dashboard.tsx` — home screen with lock status
- `Questions.tsx` — manage and answer custom questions
- `Settings.tsx` — configure question count and emergency delay
- `LockOverlay.tsx` — full-screen lock UI with emergency bypass

### `artifacts/api-server` (`@workspace/api-server`)

Express 5 API server. Routes:
- `routes/questions.ts` — CRUD for custom questions
- `routes/settings.ts` — get/update settings
- `routes/progress.ts` — save/reset answer progress
- `routes/lock.ts` — get/set lock state

### `lib/db` (`@workspace/db`)

Database layer using Drizzle ORM with PostgreSQL.

Production migrations are handled by Replit when publishing. In development: `pnpm --filter @workspace/db run push`.
