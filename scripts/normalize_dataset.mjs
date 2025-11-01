import fs from "fs/promises";
import path from "path";
import process from "process";
import "dotenv/config";

const INPUT = path.resolve("public/movies_dataset_480.json");
const OUTPUT = path.resolve("public/movies_dataset_480_primary.json");
const API_KEY = process.env.TMDB_API_KEY;

if (!API_KEY) {
  console.error("TMDB_API_KEY is missing. Add it to your .env (TMDB_API_KEY=...)");
  process.exit(1);
}

// Map TMDb genre IDs to your 4 target genres
const TMDB_TO_TARGET = new Map([
  [28, "Action"],
  [35, "Comedy"],
  [18, "Drama"],
  [53, "Thriller"],
]);

function getIdFromTmdbUrl(url) {
  const m = /themoviedb\.org\/movie\/(\d+)/.exec(url || "");
  return m ? Number(m[1]) : null;
}

async function tmdbDetails(id) {
  const url = https://api.themoviedb.org/3/movie/?api_key=;
  await new Promise(r => setTimeout(r, 250)); // gentle rate limit
  const res = await fetch(url);
  if (!res.ok) throw new Error(\TMDb \ \\);
  return res.json();
}

function mapPrimaryGenre(details) {
  const g = (details.genres || [])[0];
  if (!g) return null;
  return TMDB_TO_TARGET.get(g.id) || null;
}

function isErotic(title = "", overview = "") {
  const txt = \\ \\.toLowerCase();
  return [
    "erotic","porn","porno","pornographic","softcore","hardcore",
    "sexploitation","xxx","adult film","adult movie","explicit sex","hentai"
  ].some(k => txt.includes(k));
}

async function main() {
  const raw = JSON.parse(await fs.readFile(INPUT, "utf8"));

  // Dedupe by TMDb ID first (from tmdb_url)
  const uniqueById = new Map();
  for (const m of raw) {
    const id = getIdFromTmdbUrl(m.tmdb_url);
    if (!id) continue;
    if (!uniqueById.has(id)) uniqueById.set(id, m);
  }

  const out = [];
  const skipped = { tmdbError: 0, notTarget: 0, erotic: 0 };

  for (const [id, m] of uniqueById.entries()) {
    try {
      const details = await tmdbDetails(id);
      if (isErotic(details.title, details.overview)) { skipped.erotic++; continue; }
      const primary = mapPrimaryGenre(details);
      if (!primary) { skipped.notTarget++; continue; }

      out.push({
        ...m,
        genre: primary, // overwrite with primary-only classification
        year: m.year ?? (details.release_date ? Number(details.release_date.slice(0,4)) : null),
      });
    } catch {
      skipped.tmdbError++;
      continue;
    }
  }

  // Final dedupe safeguard by ID
  const finalById = new Map();
  for (const m of out) {
    const id = getIdFromTmdbUrl(m.tmdb_url);
    if (!finalById.has(id)) finalById.set(id, m);
  }
  const final = Array.from(finalById.values());

  // Save result
  await fs.writeFile(OUTPUT, JSON.stringify(final, null, 2), "utf8");

  // Report counts
  const counts = final.reduce((acc, m) => {
    acc[m.genre] = (acc[m.genre] || 0) + 1;
    return acc;
  }, {});
  console.log("Saved:", OUTPUT);
  console.log("Counts per genre:", counts);
  console.log("Total:", final.length);
  console.log("Skipped:", skipped);
}

main().catch(e => { console.error(e); process.exit(1); });
