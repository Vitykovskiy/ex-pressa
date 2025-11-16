# Ex-Pressa Monorepo

The client (Vue + Vite) and server (NestJS) applications live in a single npm workspace-based monorepo. Use the workspace-aware scripts from the repository root to work with each app or to run shared tasks.

## Getting Started
1. Copy `.env.example` to `.env` at the repository root and adjust the URLs/ports plus secrets (for example `TELEGRAM_BOT_TOKEN`). This single file is consumed by both the client dev server and the API CORS layer.
2. Install dependencies once with `npm install` from the repository root.

## Useful Scripts
- `npm run dev` - run the Vue dev server and NestJS watcher in parallel with a shared environment.
- `npm run client:dev` / `npm run server:dev` - start each dev server individually.
- `npm run build` - build the NestJS server and Vue client sequentially.
- `npm run lint` - lint both packages.
- `npm run server:test` - execute the NestJS test suite.

## Repository Layout
```
client/  Vue 3 + Vite front-end application
server/  NestJS back-end application
```
