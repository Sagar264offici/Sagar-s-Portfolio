import { useEffect } from "react";
import { usePortfolioStore } from "../store/portfolioStore";
import { loadGithubData } from "../lib/github";

let started = false;

export function useGithubData(): void {
  useEffect(() => {
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
  }, []);
}
