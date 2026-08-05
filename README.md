# masav-zikuim

**Read, validate and generate MASAV payment files in TypeScript.**

MASAV (מס"ב) is Israel's inter-bank clearing house. Payment instructions — salaries, supplier
payments, credits (*zikuim*) — are submitted to it as fixed-width `.msv` files: every field sits at
an exact byte offset, Hebrew text is encoded in CP862, and a malformed record is rejected by the
bank with no useful diagnostics.

This service handles that format end-to-end: it parses an existing file into structured JSON,
validates it against the specification, and generates a new compliant file from edited data. A
small SPA client provides a UI for the create flow.

Originally written in PHP with jQuery, migrated to JavaScript and then to TypeScript. In continuous
personal use since 2019.

## Stack

Bun · TypeScript · REST API · vanilla SPA client

## Run

```bash
bun install
bun run dev
```

Open: `http://localhost:3000`

## Build client

```bash
bun run build:client
```

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
