import { useState, type CSSProperties } from "react";
import { Orbit, RotateCw, X } from "lucide-react";
import { bodyDefs, type BodyDef } from "../three/bodyData";
import { scrollToSection, usePortfolioStore } from "../store/portfolioStore";
import { audio } from "../lib/audio";

interface Station {
  id: string;
  label: string;
  color: string;
  bodies: BodyDef[];
}

const STATIONS: Station[] = [
  { id: "sun", label: "SUN", color: "#fbbf24", bodies: [] },
  { id: "moon", label: "MOON", color: "#94a3b8", bodies: bodyDefs.filter((b) => b.kind === "moon") },
  { id: "projects", label: "PROJECTS", color: "#fb923c", bodies: bodyDefs.filter((b) => b.kind === "project") },
  { id: "stacks", label: "STACKS", color: "#22d3ee", bodies: bodyDefs.filter((b) => b.kind === "built") },
  { id: "foundation", label: "FOUNDATION", color: "#60a5fa", bodies: bodyDefs.filter((b) => b.kind === "foundation") },
  { id: "exploring", label: "EXPLORING", color: "#a78bfa", bodies: bodyDefs.filter((b) => b.kind === "exploring") },
];

export function OrbitNav() {
  const [open, setOpen] = useState<string | null>(null);
  const professional = usePortfolioStore((s) => s.professionalMode);
  const orbitSpin = usePortfolioStore((s) => s.orbitSpin);
  const setOrbitSpin = usePortfolioStore((s) => s.setOrbitSpin);
  const setFocusedBody = usePortfolioStore((s) => s.setFocusedBody);
  const setHoloCard = usePortfolioStore((s) => s.setHoloCard);
  const setAstronomyOpen = usePortfolioStore((s) => s.setAstronomyOpen);

  const go = (def?: BodyDef) => {
    audio.blip("select");
    setOpen(null);
    if (!def) {
      // SUN — release focus and fly back to the center of the universe
      setHoloCard(null);
      setFocusedBody(null);
      scrollToSection("home");
      return;
    }
    if (def.kind === "moon") {
      setAstronomyOpen(true);
      return;
    }
    if (def.projectId) {
      setHoloCard({ kind: "project", id: def.projectId });
      setFocusedBody(def.key);
    } else if (def.skillName) {
      setHoloCard({ kind: "skill", id: def.skillName });
      setFocusedBody(def.key);
    }
  };

  if (professional) return null;

  const station = STATIONS.find((s) => s.id === open);

  return (
    <div className="orbit-nav" role="navigation" aria-label="Orbit navigation">
      {open && station && (
        <div className="on-pop" role="menu">
          <div className="on-pop-head">
            <span style={{ color: station.color }}>{station.label} ORBIT</span>
            <button onClick={() => setOpen(null)} aria-label="Close orbit menu">
              <X size={12} />
            </button>
          </div>
          {station.bodies.length > 0 ? (
            <div className="on-grid">
              {station.bodies.map((b) => (
                <button key={b.key} className="on-chip" onClick={() => go(b)} role="menuitem" data-cursor-label="EXPLORE">
                  <span className="on-dot" style={{ background: b.color, boxShadow: `0 0 8px ${b.color}` }} />
                  {b.name}
                  {b.dwarf && <em>dwarf</em>}
                </button>
              ))}
            </div>
          ) : (
            <button className="on-chip" onClick={() => go(undefined)} data-cursor-label="EXPLORE">
              <span className="on-dot" style={{ background: station.color, boxShadow: `0 0 8px ${station.color}` }} />
              Fly to the career sun
            </button>
          )}
        </div>
      )}
      <div className="on-bar">
        <span className="on-title">
          <Orbit size={11} /> ORBITS
        </span>
        {STATIONS.map((s) => (
          <button
            key={s.id}
            className={`on-station ${open === s.id ? "active" : ""}`}
            style={{ "--od": s.color } as CSSProperties}
            onClick={() => {
              audio.blip("click");
              setOpen(open === s.id ? null : s.id);
            }}
            aria-expanded={open === s.id}
            aria-haspopup="menu"
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* manual spin — a scrollbar that rotates the whole solar system */}
      <div className="on-spin">
        <RotateCw size={11} style={{ color: "var(--cyan)", flexShrink: 0 }} />
        <span className="on-spin-label">ROTATE</span>
        <input
          type="range"
          min={0}
          max={360}
          step={1}
          value={orbitSpin}
          onChange={(e) => setOrbitSpin(Number(e.target.value))}
          aria-label="Rotate the solar system"
          data-cursor-label="SPIN"
        />
        <span className="on-spin-val">{Math.round(orbitSpin)}°</span>
        <button
          className="on-spin-reset"
          onClick={() => {
            audio.blip("click");
            setOrbitSpin(0);
          }}
          aria-label="Reset rotation"
          title="Reset rotation"
        >
          ↺
        </button>
      </div>
    </div>
  );
}
