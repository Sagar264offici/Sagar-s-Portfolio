import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { galleryPhotos } from "../data/astronomy";
import { usePortfolioStore } from "../store/portfolioStore";

const SLIDE_MS = 6500;

export function AstronomyGallery() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const reduced = usePortfolioStore((s) => s.reducedMotion);
  const count = galleryPhotos.length;
  const timer = useRef<number | null>(null);

  const next = useCallback(() => setIndex((i) => (i + 1) % count), [count]);
  const prev = useCallback(() => setIndex((i) => (i - 1 + count) % count), [count]);

  // auto-advance
  useEffect(() => {
    if (paused || reduced) return;
    timer.current = window.setInterval(next, SLIDE_MS);
    return () => {
      if (timer.current) window.clearInterval(timer.current);
    };
  }, [next, paused, reduced]);

  // keyboard
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") next();
      else if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, prev]);

  const photo = galleryPhotos[index];

  return (
    <div className="ag">
      <div
        className={`ag-stage ${paused ? "paused" : ""}`}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onTouchStart={() => setPaused(true)}
      >
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.div
            key={photo.src}
            className="ag-slide"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ opacity: { duration: 0.55, ease: "easeInOut" } }}
          >
            <img src={photo.src} alt={photo.title} loading="eager" draggable={false} />
          </motion.div>
        </AnimatePresence>

        {/* progress bar for the current slide */}
        <div className="ag-progress">
          <i key={index} style={{ animationDuration: `${SLIDE_MS}ms` }} />
        </div>

        {/* index chip */}
        <span className="ag-count mono">
          {String(index + 1).padStart(2, "0")} / {String(count).padStart(2, "0")}
        </span>

        {/* caption */}
        <div className="ag-caption">
          <span className="ag-caption-title">{photo.title}</span>
          <span className="ag-caption-sub">{photo.caption}</span>
        </div>

        {/* nav arrows */}
        <button
          className="ag-arrow left"
          onClick={prev}
          aria-label="Previous photo"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <ChevronLeft size={18} />
        </button>
        <button
          className="ag-arrow right"
          onClick={next}
          aria-label="Next photo"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {/* thumbnail strip */}
      <div className="ag-thumbs" role="tablist" aria-label="Astronomy gallery photos">
        {galleryPhotos.map((p, i) => (
          <button
            key={p.src}
            role="tab"
            aria-selected={i === index}
            aria-label={p.title}
            className={`ag-thumb ${i === index ? "active" : ""}`}
            onClick={() => {
              setPaused(true);
              setIndex(i);
            }}
          >
            <img src={p.thumb} alt="" loading="lazy" draggable={false} />
          </button>
        ))}
      </div>
    </div>
  );
}
