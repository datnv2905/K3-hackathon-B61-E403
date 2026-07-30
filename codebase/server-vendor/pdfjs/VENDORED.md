# Vendored: pdf.js (Node/legacy build)

- Source: `pdfjs-dist@6.2.108` on npm, fetched from unpkg (`legacy/build/pdf.mjs`, unminified — this build targets non-browser/older environments and is what npm's own docs point to for server-side use).
- License: Apache License 2.0 — see `LICENSE` in this folder.
- Used for: extracting real per-page text from `Slide/*.pdf` at server startup (`codebase/server.js`), so retrieval and citation verification are grounded in the actual PDF instead of a hand-guessed transcript.
- Node has no native `DOMMatrix`/`Path2D`; `server.js` installs minimal polyfills before importing this module (see `installDomPolyfills()`). The polyfills are only accurate enough for **text extraction** — never used for rendering, which happens entirely in the browser build instead.
- This build is never served to the browser. It lives outside `codebase/public/` on purpose.
