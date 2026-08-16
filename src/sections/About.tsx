import { motion } from "framer-motion";

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
};

const facts = [
  { k: "LOCATION", v: "Rishikesh, Uttarakhand, India" },
  { k: "DEGREE", v: "BSc Information Technology — Final Year" },
  { k: "FOCUS", v: "Interactive experiences, simulations, experiments" },
  { k: "FIELDS", v: "Cricket · Chess · Astronomy · Game dev · Learning" },
];

export function About() {
  return (
    <section id="about" className="section">
      <div className="section-inner">
        <div className="about-grid">
          <motion.div {...fadeUp}>
            <div className="section-head">
              <span className="eyebrow">ABOUT — PERSONNEL FILE</span>
              <h2 className="h-xl" style={{ marginTop: 14 }}>
                The person behind <span className="text-grad">the system</span>
              </h2>
            </div>
            <div className="about-copy">
              <p>
                I'm a BSc Information Technology student from Uttarakhand who enjoys building interactive software,
                web experiences, simulations and experiments. I like understanding how systems work and turning ideas
                into functioning interfaces.
              </p>
              <p>
                I care about programming, interactive design, cricket, chess, astronomy, technology and game
                development — and I'm still learning every day. The solar system you're flying through is my career,
                mapped honestly: the bright planets are things I've shipped with, the distant ones are things I'm
                exploring.
              </p>
            </div>
            <ul className="about-facts">
              {facts.map((f) => (
                <li key={f.k}>
                  <b>{f.k}</b>
                  {f.v}
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div {...fadeUp} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div className="glass corner-lines" style={{ padding: 22 }}>
              <span className="eyebrow" style={{ marginBottom: 10 }}>
                SYSTEM NOTE
              </span>
              <p className="mono" style={{ fontSize: 12, color: "var(--text-2)", lineHeight: 1.8, margin: 0 }}>
                The figure beside this panel is a generated 3D character — black-frame spectacles, slightly shorter
                hair, graphite outfit. Built from primitives, no photograph involved.
              </p>
            </div>
            <div className="glass corner-lines" style={{ padding: 22 }}>
              <span className="eyebrow" style={{ marginBottom: 10 }}>
                AVAILABILITY
              </span>
              <p className="mono" style={{ fontSize: 12, color: "var(--text-2)", lineHeight: 1.8, margin: 0 }}>
                Final-year student, open to internships and collaborative builds. Run{" "}
                <span style={{ color: "var(--cyan)" }}>'sudo hire-sagar'</span> in the terminal for a surprise.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
