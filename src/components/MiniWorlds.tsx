import { useRef, useState } from "react";
import { TerminalSquare } from "lucide-react";
import { usePortfolioStore } from "../store/portfolioStore";

/* ── Cricket: drag the ball around the oval ── */
export function CricketWorld() {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ x: 50, y: 55 });
  const dragging = useRef(false);

  const move = (clientX: number, clientY: number) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = Math.min(92, Math.max(8, ((clientX - r.left) / r.width) * 100));
    const y = Math.min(90, Math.max(10, ((clientY - r.top) / r.height) * 100));
    setPos({ x, y });
  };

  return (
    <div
      ref={ref}
      className="mini-world mw-cricket"
      onPointerDown={(e) => {
        dragging.current = true;
        (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
        move(e.clientX, e.clientY);
      }}
      onPointerMove={(e) => {
        if (dragging.current) move(e.clientX, e.clientY);
      }}
      onPointerUp={() => (dragging.current = false)}
    >
      <div className="ball-drag" style={{ left: `${pos.x}%`, top: `${pos.y}%`, transform: "translate(-50%,-50%)", position: "absolute" }} aria-label="Cricket ball — drag me" />
    </div>
  );
}

/* ── Chess: real move rules, legal-square hints, drag-free click moves ── */
type PieceType = "♟" | "♞" | "♝" | "♜" | "♛" | "♚";
type Piece = { type: PieceType; color: "w" | "b" };
type Cell = Piece | null;

const p = (type: PieceType, color: "w" | "b"): Piece => ({ type, color });
const N = null;

const START: Cell[][] = [
  [p("♜", "b"), p("♞", "b"), p("♝", "b"), p("♛", "b"), p("♚", "b"), p("♝", "b"), p("♞", "b"), p("♜", "b")],
  [p("♟", "b"), p("♟", "b"), p("♟", "b"), p("♟", "b"), p("♟", "b"), p("♟", "b"), p("♟", "b"), p("♟", "b")],
  [N, N, N, N, N, N, N, N],
  [N, N, N, N, N, N, N, N],
  [N, N, N, N, N, N, N, N],
  [N, N, N, N, N, N, N, N],
  [p("♟", "w"), p("♟", "w"), p("♟", "w"), p("♟", "w"), p("♟", "w"), p("♟", "w"), p("♟", "w"), p("♟", "w")],
  [p("♜", "w"), p("♞", "w"), p("♝", "w"), p("♛", "w"), p("♚", "w"), p("♝", "w"), p("♞", "w"), p("♜", "w")],
];

const inBounds = (r: number, c: number) => r >= 0 && r < 8 && c >= 0 && c < 8;

function legalMoves(board: Cell[][], r: number, c: number): [number, number][] {
  const piece = board[r][c];
  if (!piece) return [];
  const { type, color } = piece;
  const out: [number, number][] = [];
  const canLand = (nr: number, nc: number) => inBounds(nr, nc) && (!board[nr][nc] || board[nr][nc]!.color !== color);

  const slide = (dr: number, dc: number) => {
    let nr = r + dr;
    let nc = c + dc;
    while (inBounds(nr, nc)) {
      if (!board[nr][nc]) {
        out.push([nr, nc]);
      } else {
        if (board[nr][nc]!.color !== color) out.push([nr, nc]);
        break;
      }
      nr += dr;
      nc += dc;
    }
  };

  switch (type) {
    case "♟": {
      const dir = color === "w" ? -1 : 1;
      const start = color === "w" ? 6 : 1;
      if (inBounds(r + dir, c) && !board[r + dir][c]) {
        out.push([r + dir, c]);
        if (r === start && !board[r + 2 * dir][c]) out.push([r + 2 * dir, c]);
      }
      for (const dc of [-1, 1]) {
        const nr = r + dir;
        const nc = c + dc;
        if (inBounds(nr, nc) && board[nr][nc] && board[nr][nc]!.color !== color) out.push([nr, nc]);
      }
      break;
    }
    case "♞":
      for (const [dr, dc] of [[-2, -1], [-2, 1], [-1, -2], [-1, 2], [1, -2], [1, 2], [2, -1], [2, 1]] as const) {
        if (canLand(r + dr, c + dc)) out.push([r + dr, c + dc]);
      }
      break;
    case "♝":
      for (const [dr, dc] of [[1, 1], [1, -1], [-1, 1], [-1, -1]] as const) slide(dr, dc);
      break;
    case "♜":
      for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]] as const) slide(dr, dc);
      break;
    case "♛":
      for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]] as const) slide(dr, dc);
      break;
    case "♚":
      for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]] as const) {
        if (canLand(r + dr, c + dc)) out.push([r + dr, c + dc]);
      }
      break;
  }
  return out;
}

export function ChessWorld() {
  const [board, setBoard] = useState<Cell[][]>(START);
  const [selected, setSelected] = useState<{ r: number; c: number } | null>(null);
  const [legal, setLegal] = useState<[number, number][]>([]);

  const click = (r: number, c: number) => {
    const piece = board[r][c];
    if (selected) {
      const isLegal = legal.some(([lr, lc]) => lr === r && lc === c);
      if (isLegal) {
        const next = board.map((row) => [...row]);
        next[r][c] = next[selected.r][selected.c];
        next[selected.r][selected.c] = null;
        setBoard(next);
        setSelected(null);
        setLegal([]);
        return;
      }
      // clicking another own piece reselects; anything else deselects
      if (piece && piece.color === board[selected.r][selected.c]?.color) {
        setSelected({ r, c });
        setLegal(legalMoves(board, r, c));
      } else {
        setSelected(null);
        setLegal([]);
      }
      return;
    }
    if (piece) {
      setSelected({ r, c });
      setLegal(legalMoves(board, r, c));
    }
  };

  return (
    <div className="mini-world mw-chess">
      <div className="board" role="grid" aria-label="Mini chess board — select a piece, then move it to a highlighted square">
        {board.map((row, r) =>
          row.map((pce, c) => {
            const light = (r + c) % 2 === 0;
            const isSel = selected?.r === r && selected?.c === c;
            const isLegal = legal.some(([lr, lc]) => lr === r && lc === c);
            return (
              <div
                key={`${r}-${c}`}
                role="gridcell"
                className={`sq ${light ? "light" : "dark"} ${isSel ? "selected" : ""} ${isLegal ? "legal" : ""} ${isLegal && pce ? "has-piece" : ""}`}
                onClick={() => click(r, c)}
                aria-label={
                  pce
                    ? `${pce.color === "w" ? "White" : "Black"} ${pce.type} at rank ${8 - r} file ${String.fromCharCode(97 + c)}${isLegal ? " — click to capture" : ""}`
                    : `Empty square ${String.fromCharCode(97 + c)}${8 - r}${isLegal ? " — click to move here" : ""}`
                }
              >
                {pce && (
                  <span className={`piece ${pce.color === "w" ? "w" : "b"}`} aria-hidden>
                    {pce.type}
                  </span>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

/* ── Astronomy: drag to spin the planet ── */
export function AstronomyWorld() {
  const [rot, setRot] = useState(0);
  const last = useRef<number | null>(null);

  return (
    <div
      className="mini-world mw-astronomy"
      onPointerDown={(e) => {
        (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
        last.current = e.clientX;
      }}
      onPointerMove={(e) => {
        if (last.current !== null) {
          setRot((r) => r + (e.clientX - last.current!) * 0.6);
          last.current = e.clientX;
        }
      }}
      onPointerUp={() => (last.current = null)}
      onPointerLeave={() => (last.current = null)}
      aria-label="Drag to orbit the planet"
    >
      <div className="planet3d" style={{ transform: `rotateY(${rot}deg)` }} />
      <div className="orbit-line">
        <span className="moonlet" />
      </div>
    </div>
  );
}

/* ── Study: orbiting knowledge nodes ── */
const NODES = [
  { label: "3D WEB", dur: 14, delay: 0, top: 50, left: 50, r: 62 },
  { label: "UNITY", dur: 18, delay: -4, top: 50, left: 50, r: 72 },
  { label: "BLENDER", dur: 11, delay: -2, top: 50, left: 50, r: 50 },
  { label: "SYSTEMS", dur: 16, delay: -7, top: 50, left: 50, r: 56 },
];

export function StudyWorld() {
  return (
    <div className="mini-world mw-study">
      <div className="nodes" aria-hidden>
        {NODES.map((n) => (
          <span
            key={n.label}
            className="knode"
            style={{
              top: `${n.top}%`,
              left: `${n.left}%`,
              animation: `orbit-${n.r} ${n.dur}s linear infinite`,
              animationDelay: `${n.delay}s`,
            }}
          >
            {n.label}
          </span>
        ))}
        <style>{`
          ${NODES.map(
            (n) => `@keyframes orbit-${n.r} {
              0% { transform: translate(-50%,-50%) rotate(0deg) translateX(${n.r}px) rotate(0deg); }
              100% { transform: translate(-50%,-50%) rotate(360deg) translateX(${n.r}px) rotate(-360deg); }
            }`
          ).join("\n")}
        `}</style>
      </div>
    </div>
  );
}

/* ── Coding: terminal teaser ── */
export function CodingWorld() {
  const setTerminalOpen = usePortfolioStore((s) => s.setTerminalOpen);
  return (
    <div
      className="mini-world"
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 12,
        cursor: "pointer",
        background: "linear-gradient(160deg, rgba(139,92,246,0.08), rgba(34,211,238,0.05)), rgba(6,8,13,0.6)",
      }}
      onClick={() => setTerminalOpen(true)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") setTerminalOpen(true);
      }}
      data-cursor-label="OPEN"
      aria-label="Open the terminal"
    >
      <TerminalSquare size={26} style={{ color: "var(--cyan)", animation: "floaty 3s ease-in-out infinite" }} />
      <span className="mono" style={{ fontSize: 10, letterSpacing: "0.18em", color: "var(--text-2)", textTransform: "uppercase" }}>
        sagar@portfolio:~$ <span style={{ color: "var(--green)" }}>run terminal</span>
      </span>
    </div>
  );
}
