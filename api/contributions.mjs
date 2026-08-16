// Vercel serverless function: proxy for GitHub's contribution calendar.
//
// The exact graph shown on a profile page lives at
// https://github.com/users/{user}/contributions — but github.com sends no
// CORS headers, so a browser can never fetch it directly. This function
// fetches it server-side and returns the parsed days as JSON.
//
// No auth, no rate-limit quota (it is a plain HTML page, not the API).

const CELL_RE =
  /<td[^>]*data-date="(\d{4}-\d{2}-\d{2})"[^>]*data-level="\d"[^>]*>\s*<\/td>\s*<tool-tip[^>]*>([^<]*)<\/tool-tip>/g;

export default async function handler(req, res) {
  const user = String(req.query.user || "Sagar264offici").replace(/[^a-zA-Z0-9-]/g, "");
  try {
    const r = await fetch(`https://github.com/users/${user}/contributions`, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; portfolio-site)" },
    });
    if (!r.ok) throw new Error(`github returned ${r.status}`);
    const html = await r.text();

    const days = [];
    for (const m of html.matchAll(CELL_RE)) {
      const tip = m[2].trim();
      const n = tip.match(/(\d+)\s+contribution/);
      days.push({ date: m[1], count: n ? Number(n[1]) : 0 });
    }
    if (days.length === 0) throw new Error("no calendar cells parsed");

    res.setHeader("Cache-Control", "public, s-maxage=3600, stale-while-revalidate=86400");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.status(200).json({ user, days });
  } catch (e) {
    res.status(502).json({ error: String((e && e.message) || e) });
  }
}
