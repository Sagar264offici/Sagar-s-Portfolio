import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ExternalLink, Github, Star, GitFork } from "lucide-react";
import { usePortfolioStore } from "../store/portfolioStore";
import { buildContributionMap, GITHUB_USERNAME } from "../lib/github";
import { formatDate } from "../lib/utils";

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" },
  transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const },
};

const MONTHS = ["", "FEB", "", "APR", "", "JUN", "", "AUG", "", "OCT", "", "DEC"];

export function GitHubSection() {
  const repos = usePortfolioStore((s) => s.github.repos);
  const user = usePortfolioStore((s) => s.github.user);
  const events = usePortfolioStore((s) => s.github.events);
  const source = usePortfolioStore((s) => s.github.source);
  const [expanded, setExpanded] = useState<string | null>(null);

  const map = useMemo(() => buildContributionMap(events, source), [events, source]);
  const weeks = useMemo(() => {
    const w: { date: string; count: number }[][] = [];
    for (let i = 0; i < map.length; i += 7) w.push(map.slice(i, i + 7));
    return w;
  }, [map]);

  const levelFor = (count: number): number => {
    if (count <= 0) return 0;
    if (count <= 2) return 1;
    if (count <= 5) return 2;
    if (count <= 10) return 3;
    return 4;
  };

  const totalDays = map.filter((d) => d.count > 0).length;

  const selected = repos.find((r) => r.name === expanded) || null;

  return (
    <section id="github" className="section" style={{ alignItems: "flex-start" }}>
      <div className="section-inner">
        <motion.div {...fadeUp} className="section-head">
          <span className="eyebrow">GITHUB — ENGINEERING ARCHIVE</span>
          <h2 className="h-xl" style={{ marginTop: 14 }}>
            The <span className="text-grad">data archive</span>
          </h2>
          <p className="section-sub">
            Public repositories and recent activity, fetched live from the GitHub API. If the API is rate-limited,
            the system falls back to cached data — clearly labeled, never fabricated.
          </p>
        </motion.div>

        <div className="gh-layout">
          <motion.div {...fadeUp} className="glass gh-wall corner-lines">
            <div className="gh-head">
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <Github size={18} style={{ color: "var(--text)" }} />
                <span className="mono" style={{ fontSize: 12, letterSpacing: "0.08em" }}>
                  {GITHUB_USERNAME}
                </span>
                <span className={`gh-source ${source}`}>
                  {source === "live" ? "LIVE DATA" : source === "fallback" ? "OFFLINE CACHE" : "UNREACHABLE — CACHED"}
                </span>
              </div>
              <span className="chip">
                <span className="dot" />
                {user ? `${totalDays} ACTIVE DAYS · ${user.public_repos} REPOS` : "SYNCING"}
              </span>
            </div>

            <div className="gh-grid" aria-hidden style={{ gridTemplateColumns: `repeat(${weeks.length}, 1fr)` }}>
              {weeks.map((week, wi) => (
                <div key={wi} style={{ display: "grid", gridTemplateRows: "repeat(7, 1fr)", gap: 3 }}>
                  {Array.from({ length: 7 }).map((_, di) => {
                    const day = week[di];
                    return <div key={di} className={`gh-cell l${day ? levelFor(day.count) : 0}`} title={day ? `${day.date} — ${day.count} public event${day.count === 1 ? "" : "s"}` : ""} />;
                  })}
                </div>
              ))}
            </div>

            <div className="mono" style={{ display: "flex", justifyContent: "space-between", fontSize: 9, letterSpacing: "0.14em", color: "var(--text-3)", marginTop: 8, textTransform: "uppercase" }}>
              <span>{MONTHS[0]}</span>
              <span>LESS</span>
              {[1, 2, 3, 4].map((l) => (
                <span key={l} className={`gh-cell l${l}`} style={{ width: 10, height: 10, display: "inline-block" }} />
              ))}
              <span>MORE</span>
              <span>{MONTHS[11]}</span>
            </div>
            {source !== "live" && (
              <p className="mono" style={{ fontSize: 9, color: "var(--amber)", margin: "10px 0 0", letterSpacing: "0.08em" }}>
                Activity map is illustrative when the API is unavailable — real repo data is shown below regardless.
              </p>
            )}
          </motion.div>

          <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.08 }}>
            <div className="gh-repos" role="list" aria-label="Repositories">
              {repos.map((r) => (
                <div
                  key={r.id}
                  role="button"
                  tabIndex={0}
                  className={`repo-card ${expanded === r.name ? "repo-expanded" : ""}`}
                  data-cursor-label="CODE"
                  onClick={() => setExpanded(expanded === r.name ? null : r.name)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setExpanded(expanded === r.name ? null : r.name);
                    }
                  }}
                >
                  <div className="rc-top">
                    <span className="rc-name">{r.name}</span>
                    <a
                      href={r.html_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`Open ${r.name} on GitHub`}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <ExternalLink size={13} style={{ color: "var(--text-3)" }} />
                    </a>
                  </div>
                  <div className="rc-desc">{r.description || "No description provided."}</div>
                  <div className="rc-meta">
                    <span style={{ color: r.language ? "var(--cyan)" : undefined }}>● {r.language || "—"}</span>
                    {r.stargazers_count > 0 && (
                      <span>
                        <Star size={10} style={{ display: "inline", verticalAlign: -1 }} /> {r.stargazers_count}
                      </span>
                    )}
                    {r.forks_count > 0 && (
                      <span>
                        <GitFork size={10} style={{ display: "inline", verticalAlign: -1 }} /> {r.forks_count}
                      </span>
                    )}
                    <span>{r.archived ? "ARCHIVED" : "PUBLIC"}</span>
                    <span>PUSHED {formatDate(r.pushed_at)}</span>
                  </div>
                  {expanded === r.name && selected && (
                    <div style={{ marginTop: 6 }}>
                      <a className="btn btn-sm btn-primary" href={r.html_url} target="_blank" rel="noopener noreferrer" data-cursor-label="CODE">
                        <Github size={12} /> OPEN ON GITHUB
                      </a>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
