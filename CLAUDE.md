# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run setup          # Install deps + generate Prisma client + run migrations (first-time setup)
npm run dev            # Start dev server (localhost:3000) with Turbopack
npm run build          # Production build
npm test               # Run all tests
npx vitest run         # Run all tests (non-watch)
npx vitest run src/lib/__tests__/file-system.test.ts  # Run a single test file
npx tsc --noEmit       # Type-check without emitting
npx prisma studio      # Open DB browser
npm run db:reset       # Reset and re-run all migrations (destructive)
```

`ANTHROPIC_API_KEY` in `.env` is optional — without it the app uses `MockLanguageModel` in `src/lib/provider.ts`, which returns static component code.

## Architecture

### Generation pipeline

1. **Client** (`ChatProvider` in `src/lib/contexts/chat-context.tsx`) sends messages + serialized VFS to `POST /api/chat`.
2. **Server** (`src/app/api/chat/route.ts`) streams Claude responses. Claude uses two tools:
   - `str_replace_editor` — view / create / str_replace / insert on the VFS
   - `file_manager` — rename / delete on the VFS
3. Tool calls stream back to the client via Vercel AI SDK. `onToolCall` in `ChatProvider` forwards each call to `handleToolCall` in `FileSystemProvider`, which applies mutations to the in-memory `VirtualFileSystem`.
4. **`refreshTrigger`** (a counter in `FileSystemProvider`) increments on every mutation, causing `PreviewFrame` to re-render.
5. **`PreviewFrame`** (`src/components/preview/PreviewFrame.tsx`) calls `createImportMap` → transforms every `.jsx/.tsx` file via Babel standalone into a blob URL → builds an ES import map → writes `srcdoc` on the iframe.

Third-party npm packages imported inside generated components are auto-resolved to `https://esm.sh/<package>` at preview time — no install needed.

### Virtual File System

`VirtualFileSystem` (`src/lib/file-system.ts`) is a pure in-memory tree. It never touches disk. The server reconstructs a fresh instance from serialized JSON on every request; the client holds the authoritative copy in `FileSystemProvider`.

Every project must have `/App.jsx` as the entry point (default-exported React component). The `@/` import alias maps to the virtual root `/`.

### Database schema

The schema is defined in `prisma/schema.prisma`. Reference it whenever you need to understand the structure of data stored in the database.

### Auth & projects

- JWT sessions via `jose`, stored in an `httpOnly` cookie (`auth-token`). Secret from `JWT_SECRET` env var (falls back to a dev default).
- Anonymous users get a fully functional ephemeral session; their work is saved to `sessionStorage` via `src/lib/anon-work-tracker.ts`.
- Authenticated users' projects persist to SQLite (`prisma/dev.db`) — messages as a JSON string, VFS state as a JSON string of `FileNode` records.

### Model

Configured in `src/lib/provider.ts`. Production model: `claude-haiku-4-5`. Switch by changing the `MODEL` constant. If `ANTHROPIC_API_KEY` is absent, `MockLanguageModel` is used instead (useful for tests and offline dev).

### Code style

Only add comments for genuinely complex logic. Self-explanatory code needs no comments.

### Testing

Tests use Vitest + jsdom + React Testing Library. Config: `vitest.config.mts`. Test files live alongside source under `__tests__/` subdirectories. The `@/` path alias is resolved via `vite-tsconfig-paths`.