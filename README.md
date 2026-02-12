# masav-zikuim (Bun + TypeScript)

This repository now runs as a Bun.js TypeScript application with:

- **API server** for MASAV files (read, validate, generate).
- **Minimal client app** (plain HTML + JS) that mirrors the original workflow of loading a MASAV file, editing rows, and downloading a newly generated file.

## Run

```bash
bun install
bun run dev
```

Open: `http://localhost:3000`

## API endpoints

- `POST /api/masav/read` (multipart form-data, file field `msvZfile`)
  - parses and validates a MASAV file
  - returns designed JSON payload
- `POST /api/masav/validate` (multipart form-data, file field `msvZfile`)
  - validates a MASAV file
  - returns `{ valid, errors }`
- `POST /api/masav/generate` (application/json)
  - accepts designed data payload
  - returns `{ fileName, rawFile }`

The parsing and writing logic is ported from the original PHP implementation behavior, including fixed-position fields and CP862 Hebrew encoding handling.
