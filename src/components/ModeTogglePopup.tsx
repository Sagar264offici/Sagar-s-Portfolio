import { useEffect, useState } from "react";
import { usePortfolioStore } from "../store/portfolioStore";
import { audio } from "../lib/audio";
import { X } from "lucide-react";

function ModeTogglePopup() {
  const professional = usePortfolioStore((s) => s.professionalMode);
  const toggle = usePortfolioStore((s) => s.toggleProfessionalMode);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (open) {
      try {
        localStorage.setItem("sp-mode-popup-seen", "1");
      } catch {
        /* noop */
      }
    }
  }, [open]);

  const toggleMode = () => {
    toggle();
    audio.blip("select");
    setOpen(false);
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="nav-toggle"
        aria-label="Toggle mode info"
      >
        <span className="sw" aria-hidden />
        <span className="nv-label">MODE</span>
      </button>

      {open && (
        <div className="mode-popup" role="dialog" aria-modal="true" aria-label="Mode toggle">
          <div className="mode-popup-content">
            <button
              className="mode-popup-close"
              onClick={() => setOpen(false)}
              aria-label="Close mode info"
            >
              <X size={20} />
            </button>

            <h3>Toggle Professional & Immersive Mode</h3>

            <p>
              Switch between<span className="mode-pro"> Professional Mode</span>
              — clean text-focused layout with maximum clarity, and<span className="mode-uni">
              Universe Mode</span> — the full immersive 3D experience with planets, orbits, and cinematic scroll.
            </p>

            <div className="mode-toggle-demo">
              <button
                onClick={toggleMode}
                className={`mode-btn ${professional ? "active" : ""}`}
                aria-label={professional ? "Switch to immersive mode" : "Switch to professional mode"}
              >
                {professional ? "IMMERSIVE" : "PROFESSIONAL"}
              </button>
            </div>

            <p className="mode-hint">
              You can also toggle mode anytime from the navbar or press <kbd>1</kbd> for Professional <kbd>2</kbd> for Universe.
            </p>
          </div>
        </div>
      )}
    </>
  );
}

export default ModeTogglePopup;