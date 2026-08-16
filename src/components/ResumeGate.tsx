import { useEffect, useState } from "react";
import { Download, FileText } from "lucide-react";

const RESUME_URL = "/resume.pdf";

type ResumeState = "checking" | "missing" | "present";

export function ResumeGate({ compact = false }: { compact?: boolean }) {
  const [state, setState] = useState<ResumeState>("checking");

  useEffect(() => {
    let cancelled = false;
    fetch(RESUME_URL, { method: "HEAD" })
      .then((res) => {
        // SPA rewrites can return index.html with a 200 — a real PDF announces itself.
        const isPdf = (res.headers.get("content-type") || "").includes("pdf");
        if (!cancelled) setState(res.ok && isPdf ? "present" : "missing");
      })
      .catch(() => {
        if (!cancelled) setState("missing");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (state === "present") {
    return (
      <a className="btn btn-primary" href={RESUME_URL} download data-cursor-label="SAVE">
        <Download size={14} /> DOWNLOAD RESUME
      </a>
    );
  }

  return (
    <span className="btn" aria-disabled="true" style={{ opacity: 0.75, cursor: "default" }} title="Final résumé PDF coming soon">
      <FileText size={14} />
      {compact ? "RESUME SOON" : "RESUME COMING SOON"}
    </span>
  );
}
