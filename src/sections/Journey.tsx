import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { journey } from "../data/journey";

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" },
  transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const },
};

export function Journey() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const steps = el.querySelectorAll(".tl-step");
    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            const idx = Array.prototype.indexOf.call(steps, e.target);
            setVisible((v) => Math.max(v, idx + 1));
          }
        }
      },
      { threshold: 0.4 }
    );
    steps.forEach((s) => obs.observe(s));
    return () => obs.disconnect();
  }, []);

  return (
    <section id="journey" className="section">
      <div className="section-inner">
        <motion.div {...fadeUp} className="section-head" style={{ textAlign: "center" }}>
          <span className="eyebrow" style={{ justifyContent: "center" }}>
            TRAJECTORY
          </span>
          <h2 className="h-xl" style={{ marginTop: 14 }}>
            How I got <span className="text-grad">here</span>
          </h2>
          <p className="section-sub" style={{ margin: "12px auto 0" }}>
            A simple timeline — from Rishikesh to building interactive projects.
          </p>
        </motion.div>

        <div className="timeline" ref={ref}>
          {journey.map((step, i) => (
            <div key={step.id} className={`tl-step ${i < visible ? "done" : ""}`}>
              <div className="tl-year">{step.year}</div>
              <h3>{step.title}</h3>
              <p>{step.detail}</p>
              <span className="tl-kind">{step.kind}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
