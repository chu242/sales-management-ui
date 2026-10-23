# Sales Manager (frontend)

React + TypeScript + Vite frontend for the FastAPI backend in `../python-api`.

## Run

```bash
# terminal 1: backend
cd ../python-api && .venv/bin/uvicorn app.main:app --reload     # http://127.0.0.1:8000

# terminal 2: frontend
npm install        # first time only
npm run dev        # http://localhost:5173
```

The browser calls `/api/...` on the Vite dev server, which forwards it to the backend
(see `vite.config.ts`). Because the browser only talks to one origin, no CORS setup is needed.

## Configuration

| Variable | Used by | Default | Purpose |
|---|---|---|---|
| `VITE_API_BASE_URL` | browser code (`src/config.ts`) | `/api` | Base URL for all API calls |
| `BACKEND_URL` | dev proxy only (`vite.config.ts`) | `http://127.0.0.1:8000` | Where `/api` is forwarded |

Example: `BACKEND_URL=http://127.0.0.1:8001 npm run dev` points the UI at a test backend.
Put personal overrides in `.env.local` (git-ignored); see `.env.example`.

Only variables starting with `VITE_` are included in the browser bundle, so never put secrets in them.

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Dev server with hot reload |
| `npm run build` | Type-check (`tsc`) and build to `dist/` |
| `npm run lint` | Lint with oxlint |
| `npm run preview` | Serve the built `dist/` locally |

## Structure

```
src/
├── config.ts      environment configuration
├── types/         interfaces matching the backend schemas (DTOs)
├── services/      all HTTP calls; apiClient.ts turns every failure into an ApiError
├── hooks/         useAsync (loading / error / data), useIdParam
├── utils/         money (exact cents arithmetic) and UTC date formatting
├── components/    reusable UI: tables, forms, dialogs, messages (no API calls)
├── pages/         one per route; connect services to components
└── styles/        global.css with design tokens (light + dark)
```

## What the backend supports

- Products: list, view, create, edit (PATCH, only changed fields sent), delete (409 if sold)
- Sales: list, view with details, create (stock is checked and reduced by the backend)
- Not supported by the backend, so not in the UI: editing or deleting sales, changing sale details on their own

## Production

`npm run build` creates static files in `dist/`. Either serve them and the API from the same domain
(forward `/api` to FastAPI in your web server, no CORS needed), or set `VITE_API_BASE_URL` to the
API's full URL at build time and add `CORSMiddleware` for the frontend's origin to FastAPI.
