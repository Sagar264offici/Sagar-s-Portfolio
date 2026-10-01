import { useEffect } from "react";
import { usePortfolioStore } from "../store/portfolioStore";
import { loadGithubData } from "../lib/github";

let started = false;

export function useGithubData(): void {
  useEffect(() => {
    const target = document.getElementById("github");
    if (!target) return;

    const load = () => {
      if (started) return;
      started = true;

      const store = usePortfolioStore.getState();
      store.setGithubLoading(true);
      loadGithubData()
        .then((data) => {
          const s = usePortfolioStore.getState();
          s.setGithubUser(data.user);
          s.setGithubRepos(data.repos);
          s.setGithubEvents(data.events);
          s.setGithubContributions(data.contributions);
          s.setGithubSource(data.source);
          s.setGithubLoading(false);
        })
        .catch(() => {
          const s = usePortfolioStore.getState();
          s.setGithubSource("error");
          s.setGithubLoading(false);
        });
    };

    // GitHub is useful once the reader gets near that section, not during
    // the critical first render. Keep a small lead-in so it feels instant.
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          observer.disconnect();
          load();
        }
      },
      { rootMargin: "700px 0px" }
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, []);
}
