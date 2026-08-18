import type { ContributionDay, GithubEvent, GithubRepo } from "../store/portfolioStore";
import { projects } from "../data/projects";

export const GITHUB_USERNAME = "Sagar264offici";

const API = "https://api.github.com";

interface ApiRepo {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  language: string | null;
  html_url: string;
  stargazers_count: number;
  forks_count: number;
  pushed_at: string;
  archived: boolean;
  fork: boolean;
}

interface ApiEvent {
  id: string;
  type: string;
  created_at: string;
  repo: { name: string };
}

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url, {
    headers: { Accept: "application/vnd.github+json" },
  });
  if (!res.ok) {
    if (res.status === 403 || res.status === 429) {
      throw new Error("RATE_LIMITED");
    }
    if (res.status === 404) throw new Error("NOT_FOUND");
    throw new Error(`HTTP ${res.status}`);
  }
  return (await res.json()) as T;
}

/** Static fallback so the GitHub world always renders — clearly labeled offline. */
const fallbackRepos: GithubRepo[] = projects.map((p, i) => ({
  id: i + 1,
  name: p.githubUrl.split("/").pop() || p.slug,
  full_name: `Sagar264offici/${p.githubUrl.split("/").pop() || p.slug}`,
  description: p.description,
  language: p.technologies[0] ?? "TypeScript",
  html_url: p.githubUrl,
  stargazers_count: 0,
  forks_count: 0,
  pushed_at: new Date().toISOString(),
  archived: false,
  fork: false,
}));

/** Public, CORS-enabled mirror of the exact per-day contribution calendar
    (github-contributions-api.jogruber.de). Lets the green squares go live
    even in plain `npm run dev`, where the Vercel proxy is not served. */
const CONTRIBUTIONS_PUBLIC_API = "https://github-contributions-api.jogruber.de/v4";

/** The exact contribution graph. Tries our serverless proxy first (production),
    then the public mirror, then lets callers fall back to events. */
async function loadContributions(): Promise<ContributionDay[]> {
  try {
    const res = await fetch(`/api/contributions?user=${GITHUB_USERNAME}`);
    if (!res.ok) throw new Error(`contributions HTTP ${res.status}`);
    const j = (await res.json()) as { days?: ContributionDay[] };
    if (Array.isArray(j.days) && j.days.length > 0) return j.days;
  } catch {
    /* proxy unavailable (local dev / not deployed) — public mirror below */
  }

  const pub = await fetch(`${CONTRIBUTIONS_PUBLIC_API}/${GITHUB_USERNAME}?y=last`, {
    headers: { Accept: "application/json" },
  });
  if (!pub.ok) throw new Error(`public contributions HTTP ${pub.status}`);
  const j = (await pub.json()) as { contributions?: { date: string; count: number }[] };
  const days = Array.isArray(j.contributions)
    ? j.contributions.map((d) => ({ date: d.date, count: d.count }))
    : [];
  if (days.length === 0) throw new Error("no contribution days parsed");
  return days;
}

const fallbackUser = {
  login: GITHUB_USERNAME,
  name: "Sagar Pathak",
  avatar_url: "",
  html_url: `https://github.com/${GITHUB_USERNAME}`,
  public_repos: fallbackRepos.length,
  bio: "Developer • Builder • Problem Solver • Creative Technologist",
  location: "Rishikesh, Uttarakhand, India",
};

export async function loadGithubData(): Promise<{
  user: typeof fallbackUser | null;
  repos: GithubRepo[];
  events: GithubEvent[];
  contributions: ContributionDay[];
  source: "live" | "fallback" | "error";
}> {
  try {
    // Up to 3 pages of public events so the wall has depth even without the proxy.
    const [user, repos, ...eventPages] = await Promise.all([
      fetchJson<{
        login: string;
        name: string;
        avatar_url: string;
        html_url: string;
        public_repos: number;
        bio: string;
        location: string;
      }>(`${API}/users/${GITHUB_USERNAME}`),
      fetchJson<ApiRepo[]>(`${API}/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=30`),
      ...[1, 2, 3].map((page) =>
        fetchJson<ApiEvent[]>(`${API}/users/${GITHUB_USERNAME}/events/public?per_page=100&page=${page}`)
      ),
    ]);
    const events = eventPages.flat();

    // Primary source: the exact per-day contribution graph (matches the profile
    // page). Best-effort — events fill in when the proxy is unreachable (dev).
    let contributions: ContributionDay[] = [];
    try {
      contributions = await loadContributions();
    } catch {
      /* proxy unavailable — fall back to events below */
    }

    return {
      user: {
        login: user.login,
        name: user.name || user.login,
        avatar_url: user.avatar_url,
        html_url: user.html_url,
        public_repos: user.public_repos,
        bio: user.bio || "Developer",
        location: user.location || "",
      },
      repos: repos.map((r) => ({
        id: r.id,
        name: r.name,
        full_name: r.full_name,
        description: r.description,
        language: r.language,
        html_url: r.html_url,
        stargazers_count: r.stargazers_count,
        forks_count: r.forks_count,
        pushed_at: r.pushed_at,
        archived: r.archived,
        fork: r.fork,
      })),
      events: events.map((e) => ({
        id: e.id,
        type: e.type,
        created_at: e.created_at,
        repo: e.repo.name,
      })),
      contributions,
      source: "live",
    };
  } catch (err) {
    const rateLimited = err instanceof Error && err.message === "RATE_LIMITED";
    return {
      user: fallbackUser,
      repos: fallbackRepos,
      events: [],
      contributions: [],
      source: rateLimited ? "fallback" : "error",
    };
  }
}

/**
 * Build the contribution map (one full year, 52 weeks — matching the profile
 * graph) from the best source available:
 *   1. the exact contribution calendar (serverless proxy),
 *   2. real public events (dev / proxy down),
 *   3. a deterministic illustration clearly marked as offline.
 */
export function buildContributionMap(
  contributions: ContributionDay[],
  events: GithubEvent[],
  source: "live" | "fallback" | "error"
): { date: string; count: number }[] {
  const days = 365;
  const today = new Date();

  // Exact graph from GitHub — use it directly (already ~365 days).
  if (contributions.length > 0) {
    return contributions.slice(-days);
  }

  // Real public events — zero out days the events API does not cover.
  if (events.length > 0 && source === "live") {
    const byDay = new Map<string, number>();
    for (const e of events) {
      const day = e.created_at.slice(0, 10);
      byDay.set(day, (byDay.get(day) || 0) + 1);
    }
    const out: { date: string; count: number }[] = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      out.push({ date: key, count: byDay.get(key) || 0 });
    }
    return out;
  }

  // Deterministic illustration — same seed per day, clearly marked offline.
  let seed = 20260707;
  const out: { date: string; count: number }[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    seed = (seed * 9301 + 49297) % 233280;
    const r = seed / 233280;
    const count = r > 0.96 ? 4 + Math.floor(r * 10) : r > 0.8 ? 1 + Math.floor(r * 4) : 0;
    out.push({ date: d.toISOString().slice(0, 10), count });
  }
  return out;
}
