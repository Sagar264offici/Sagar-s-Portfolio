import { useEffect, useRef } from "react";
import * as THREE from "three";
import { usePortfolioStore } from "../store/portfolioStore";
import { getPlanetPosition } from "../three/planetRegistry";
import { findBody } from "../three/bodyData";
import { allSkills } from "../data/skills";
import { getProjectById } from "../data/projects";

let camRef: THREE.Camera | null = null;
export function registerTooltipCamera(cam: THREE.Camera) {
  camRef = cam;
}

const tierLabel: Record<string, string> = {
  project: "PROJECT",
  built: "BUILT WITH",
  foundation: "FOUNDATION",
  exploring: "EXPLORING",
  moon: "SPECIAL",
};

export function PlanetTooltip() {
  const hovered = usePortfolioStore((s) => s.hoveredPlanet);
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let raf = 0;
    const loop = () => {
      const el = root.current;
      if (el) {
        if (hovered && camRef) {
          const v = getPlanetPosition(hovered);
          if (v) {
            const vec = v.clone().project(camRef);
            if (vec.z < 1) {
              const x = ((vec.x + 1) / 2) * window.innerWidth;
              const y = ((-vec.y + 1) / 2) * window.innerHeight;
              el.style.opacity = "1";
              el.style.transform = `translate(${x + 16}px, ${y - 12}px) translateY(-50%)`;
              raf = requestAnimationFrame(loop);
              return;
            }
          }
        }
        el.style.opacity = "0";
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [hovered]);

  if (!hovered) return null;

  const def = findBody(hovered);
  if (!def) return null;

  const project = def.projectId ? getProjectById(def.projectId) : undefined;
  const skill = def.skillName ? allSkills.find((s) => s.name === def.skillName) : undefined;

  return (
    <div
      ref={root}
      style={{
        position: "fixed",
        left: 0,
        top: 0,
        zIndex: 45,
        pointerEvents: "none",
        opacity: 0,
        transition: "opacity 0.15s ease",
        willChange: "transform",
      }}
    >
      <div
        className="glass"
        style={{
          padding: "12px 16px",
          minWidth: 190,
          background: "rgba(8,11,18,0.88)",
          borderRadius: 10,
        }}
      >
        <div className="mono" style={{ fontSize: 9, letterSpacing: "0.24em", color: def.color, textTransform: "uppercase" }}>
          {def.dwarf ? "DWARF PLANET — " : ""}{tierLabel[def.kind]} — {def.note}
        </div>
        <div style={{ fontWeight: 600, fontSize: 14, marginTop: 4 }}>{def.name}</div>
        {skill && (
          <div className="mono" style={{ fontSize: 10, color: "var(--text-2)", marginTop: 4 }}>
            {skill.note}
          </div>
        )}
        {skill && skill.projects.length > 0 && (
          <div className="mono" style={{ fontSize: 9, color: "var(--cyan)", marginTop: 4, letterSpacing: "0.06em" }}>
            {skill.projects.slice(0, 2).join(" · ")}
          </div>
        )}
        {project && (
          <div className="mono" style={{ fontSize: 10, color: "var(--text-2)", marginTop: 4 }}>
            {project.technologies.slice(0, 3).join(" · ")}
          </div>
        )}
        <div className="mono" style={{ fontSize: 9, color: "var(--text-3)", marginTop: 6, letterSpacing: "0.14em" }}>
          CLICK TO INSPECT
        </div>
      </div>
    </div>
  );
}
