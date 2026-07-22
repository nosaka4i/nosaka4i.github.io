# nosaka.ai

Marketing site for [Nosaka](https://nosaka.ai) — a voice-first executive
assistant. Static site built with [Astro](https://astro.build), deployed to
GitHub Pages behind the `nosaka.ai` custom domain.

## Project structure

```
/
├── public/
│   ├── CNAME              # custom domain for GitHub Pages
│   └── fonts/              # vendored .woff2 files (see tools/fonts/ below)
├── src/
│   ├── components/         # Header, Footer, RingMark
│   ├── content/
│   │   └── blog/           # one .md file per post
│   ├── content.config.ts   # blog collection schema
│   ├── layouts/
│   │   ├── Layout.astro    # shared <head>/<body> shell
│   │   └── BlogPost.astro  # wraps Layout for individual posts
│   ├── lib/
│   │   └── ring.ts         # the mark's ring geometry
│   ├── pages/
│   │   ├── index.astro     # home
│   │   ├── about.astro
│   │   └── blog/
│   │       ├── index.astro     # post listing
│   │       └── [...slug].astro # individual post route
│   └── styles/
│       └── global.css      # design tokens + all page styles
└── tools/
    └── fonts/
        └── fetch-fonts.js  # vendors Archivo / Public Sans / IBM Plex Mono
```

## Commands

Run from the repo root:

| Command         | Action                                             |
| :--------------- | :-------------------------------------------------- |
| `pnpm install`   | Install dependencies                                |
| `pnpm dev`       | Start the local dev server at `localhost:4321`      |
| `pnpm build`     | Build the production site to `./dist/`              |
| `pnpm preview`   | Preview the production build locally                |

Uses `pnpm@11.15.1` (pinned via `packageManager` in `package.json` —
corepack will fetch it automatically on first run, no manual install
needed).

## Adding a blog post

Drop a new file in `src/content/blog/`, e.g. `src/content/blog/my-post.md`:

```md
---
title: "Post title"
description: "One or two sentences — used on the /blog listing and in the meta description."
pubDate: 2026-08-01
---

Body content in Markdown.
```

The filename becomes the URL slug (`my-post.md` → `/blog/my-post/`). It'll
show up on `/blog` automatically, sorted newest-first by `pubDate` — no
other wiring needed.

## Fonts

The site uses three typefaces — Archivo (display), Public Sans (body), IBM
Plex Mono (labels/eyebrows) — vendored locally under `public/fonts/` rather
than loaded from Google Fonts at runtime, so there's no external font
request on page load.

To (re-)fetch them:

```sh
node tools/fonts/fetch-fonts.js
```

Already-fetched files are left alone; delete a specific `public/fonts/*.woff2`
first to force re-fetching just that one. Only needed if `public/fonts/` is
missing (e.g. a fresh clone before the font files are committed) or if
`tools/fonts/fetch-fonts.js`'s `FONTS` list changes.

## The mark

`src/lib/ring.ts` draws the organic ring mark used in the header, hero, and
footer. It's the same sine-wave-modulated-circle algorithm as the real app
icon generator (`tools/icon/generate-icon.js` in the main `nosaka` repo) —
kept in sync deliberately so the mark used here matches the actual app icon
rather than approximating it.

## Design system

`src/styles/global.css` holds the full token system (colors, type, spacing)
as CSS custom properties on `:root`. The site is deliberately committed to
one visual world — near-black ground, light ink, cyan (`#04d9ff`) as the
single accent — rather than adapting to the visitor's OS theme;
`:root[data-theme="dark"]` / `:root[data-theme="light"]` overrides exist for
a possible future manual toggle but nothing switches them today.

## Deployment

GitHub Pages, building from this repo via GitHub Actions (workflow not
included here — added separately). The build is a standard
`pnpm install && pnpm build`; the `dist/` output is what gets published.
`public/CNAME` (containing `nosaka.ai`) carries through to `dist/` on every
build and is what tells GitHub Pages to serve the custom domain.
