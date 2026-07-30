# Vendored: pdf.js (browser build)

- Source: `pdfjs-dist@6.2.108` on npm, fetched from unpkg (`build/pdf.min.mjs`, `build/pdf.worker.min.mjs`).
- License: Apache License 2.0 — see `LICENSE` in this folder (also embedded as a header comment in each file).
- Why vendored instead of `npm install`: the project intentionally has no `npm install` step (`node codebase/server.js` is the whole setup). Vendoring keeps that true while still using the real Mozilla library instead of hand-rolled PDF parsing.
- Used for: rendering PDF pages to `<canvas>` and extracting text-item geometry for the drag-to-select interaction. See `codebase/public/app.js`.
- Not used: the `TextLayer` class (native browser text selection). Deliberately skipped — see `codebase/MOCKS.md` for why.

To update: fetch a newer `pdfjs-dist` version's `build/pdf.min.mjs` + `build/pdf.worker.min.mjs` from unpkg and replace both files, keeping the version number here in sync with `codebase/server-vendor/pdfjs/VENDORED.md` (the two builds must match).
