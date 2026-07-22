#!/usr/bin/env node

// Vendors the site's three typefaces as local woff2 files under public/fonts/
// instead of loading them from Google Fonts at runtime — no external font
// request on page load, no dependency on Google Fonts staying up, and the
// build works offline once fetched once.
//
// Usage: node tools/fonts/fetch-fonts.js
// Requires Node.js with network access. Re-run any time FONTS below changes;
// already-fetched files are left alone (delete public/fonts/<name>.woff2 to
// force a re-fetch of that one).

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import https from "https";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.join(__dirname, "..", "..", "public", "fonts");

// Each entry becomes public/fonts/<name>.woff2 — one variable-font file
// covering the whole weight (and width, where present) range in the query.
const FONTS = [
  { name: "archivo", query: "Archivo:ital,wdth,wght@0,62..125,400..800" },
  { name: "public-sans", query: "Public+Sans:ital,wght@0,400;0,500;0,600;0,700" },
  { name: "ibm-plex-mono", query: "IBM+Plex+Mono:wght@500" },
];

function fetchText(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36" } }, (res) => {
      if (res.statusCode !== 200) { reject(new Error(`GET ${url} -> ${res.statusCode}`)); return; }
      let data = "";
      res.on("data", (c) => (data += c));
      res.on("end", () => resolve(data));
    }).on("error", reject);
  });
}

function fetchBuffer(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        fetchBuffer(res.headers.location).then(resolve, reject);
        return;
      }
      if (res.statusCode !== 200) { reject(new Error(`GET ${url} -> ${res.statusCode}`)); return; }
      const chunks = [];
      res.on("data", (c) => chunks.push(c));
      res.on("end", () => resolve(Buffer.concat(chunks)));
    }).on("error", reject);
  });
}

async function resolveLatinWoff2Url(query) {
  const css = await fetchText(`https://fonts.googleapis.com/css2?family=${query}&display=swap`);
  const latinBlock = css.match(/\/\* latin \*\/\s*@font-face\s*{[^}]*}/);
  if (!latinBlock) throw new Error(`No latin subset found for ${query}`);
  const url = latinBlock[0].match(/url\((https:[^)]+)\)/);
  if (!url) throw new Error(`No font url found for ${query}`);
  return url[1];
}

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });

  for (const { name, query } of FONTS) {
    const outPath = path.join(OUT_DIR, `${name}.woff2`);
    if (fs.existsSync(outPath)) {
      console.log(`skip ${name}.woff2 (already fetched)`);
      continue;
    }
    const url = await resolveLatinWoff2Url(query);
    const buf = await fetchBuffer(url);
    fs.writeFileSync(outPath, buf);
    console.log(`wrote ${name}.woff2 (${(buf.length / 1024).toFixed(0)}KB)`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
