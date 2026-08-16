import type { GithubEvent, GithubRepo } from "../store/portfolioStore";
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
  source: "live" | "fallback" | "error";
}> {
  try {
    // Up to 3 pages of public events so the activity wall has real depth.
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
      source: "live",
    };
  } catch (err) {
    const rateLimited = err instanceof Error && err.message === "RATE_LIMITED";
    return {
      user: fallbackUser,
      repos: fallbackRepos,
      events: [],
      source: rateLimited ? "fallback" : "error",
    };
  }
}

/**
 * Build a 52-week contribution map from real public event data.
 * When live data is unavailable, returns a deterministic generated map that is
 * clearly marked as illustrative (source === "fallback").
 */
export function buildContributionMap(events: GithubEvent[], source: "live" | "fallback" | "error"): { date: string; count: number }[] {
  const days = 7 * 26; // 26 weeks window
  const today = new Date();
  const out: { date: string; count: number }[] = [];

  if (events.length === 0 || source !== "live") {
    // Deterministic illustration — same seed per day, clearly marked offline.
    let seed = 20260707;
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

  const byDay = new Map<string, number>();
  for (const e of events) {
    const day = e.created_at.slice(0, 10);
    byDay.set(day, (byDay.get(day) || 0) + 1);
  }
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    out.push({ date: key, count: byDay.get(key) || 0 });
  }
  return out;
}
