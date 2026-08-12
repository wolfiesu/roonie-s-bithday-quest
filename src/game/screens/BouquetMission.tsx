import { useEffect, useMemo, useRef, useState } from "react";
import { Confetti } from "../Effects";
import { useDragDrop } from "../useDragDrop";
import { SPR, SPR2 } from "../assets";
import { Icon, Stars } from "../icons";
import { useAudio } from "../audio";

type Flower = { id: string; label: string; img: string };

const FLOWERS: Flower[] = [
  { id: "lily_pink", label: "Lilies", img: SPR.liliesPink },
  { id: "lily_white", label: "White", img: SPR.lilyWhite },
  { id: "lily_peach", label: "Peach", img: SPR.lilyPeach },
  { id: "valley", label: "Valley", img: SPR.lilyValley },
  { id: "yellow", label: "Yellow", img: SPR.flowerYellow },
  { id: "blue", label: "Blue", img: SPR.flowerBlue },
  { id: "stem", label: "Greens", img: SPR.liliesStem },
];

/** Wrapping paper shades — the same pixel sprite, tinted. */
const WRAPS = [
  { id: "pink", label: "Pink", filter: "none", swatch: "var(--color-pink)" },
  { id: "cream", label: "Cream", filter: "hue-rotate(-25deg) saturate(0.6) brightness(1.1)", swatch: "var(--color-cream)" },
  { id: "lilac", label: "Lilac", filter: "hue-rotate(45deg) saturate(0.9)", swatch: "var(--color-lilac)" },
  { id: "sky", label: "Sky", filter: "hue-rotate(150deg) saturate(0.8)", swatch: "var(--color-sky-deep)" },
];

const COUNT_GOAL = 6;
const VARIETY_GOAL = 3;
const TIE_GOAL = 620;

/** Pinch point of the wrapper, in % of the workspace. */
const PINCH = { x: 50, y: 82 };

/** Fan of bouquet slots — three rings for real depth. */
type Slot = { x: number; y: number; rot: number; size: number; ring: number };
const SLOTS: Slot[] = [
  { ring: 0, count: 7, r: 32, sy: 0.95, size: 88 },
  { ring: 1, count: 5, r: 21, sy: 0.9, size: 80 },
  { ring: 2, count: 3, r: 10, sy: 0.85, size: 72 },
].flatMap(({ ring, count, r, sy, size }) =>
  Array.from({ length: count }, (_, i) => {
    const t = count === 1 ? 0 : (i / (count - 1)) * 2 - 1;
    const deg = t * 58;
    const rad = (deg * Math.PI) / 180;
    return {
      ring,
      x: 50 + Math.sin(rad) * r,
      y: 54 - Math.cos(rad) * r * sy,
      rot: deg * 0.5,
      size,
    };
  }),
);

type Stem = { key: number; id: string; img: string; slot: Slot; jx: number; jy: number; jr: number };
type Phase = "arrange" | "wrap" | "tie" | "done";
type Particle = { id: number; x: number; y: number };

type Props = { onNext: () => void; onHome: () => void };

export function BouquetMission({ onNext, onHome }: Props) {
  const zoneRef = useRef<HTMLDivElement | null>(null);
  const nextId = useRef(0);
  const partId = useRef(0);
  const { sfx } = useAudio();

  const [stems, setStems] = useState<Stem[]>([]);
  const [pick, setPick] = useState(FLOWERS[0]!.id);
  const [phase, setPhase] = useState<Phase>("arrange");
  const [wrap, setWrap] = useState(WRAPS[0]!.id);
  const [tieDeg, setTieDeg] = useState(0);
  const [hint, setHint] = useState<string | null>(null);
  const [parts, setParts] = useState<Particle[]>([]);

  const variety = new Set(stems.map((s) => s.id)).size;
  const stars = Math.max(
    1,
    Math.min(3, Math.round(Math.min(1, stems.length / 10) * 1.5 + Math.min(1, variety / 4) * 1.5)),
  );
  const done = phase === "done";
  const wrapped = phase !== "arrange";
  const wrapFilter = WRAPS.find((w) => w.id === wrap)!.filter;

  useEffect(() => {
    if (!hint) return;
    const t = window.setTimeout(() => setHint(null), 1400);
    return () => window.clearTimeout(t);
  }, [hint]);

  const sparkle = (x: number, y: number) => {
    const id = partId.current++;
    setParts((p) => [...p.slice(-14), { id, x, y }]);
    window.setTimeout(() => setParts((p) => p.filter((q) => q.id !== id)), 900);
  };

  const add = (id: string, clientX?: number, clientY?: number) => {
    if (phase !== "arrange") return;
    const f = FLOWERS.find((x) => x.id === id);
    const r = zoneRef.current?.getBoundingClientRect();
    if (!f || !r) return;

    const taken = new Set(stems.map((s) => `${s.slot.x}:${s.slot.y}`));
    const free = SLOTS.filter((s) => !taken.has(`${s.x}:${s.y}`));
    if (free.length === 0) {
      sfx("error");
      setHint("the bouquet is full and gorgeous");
      return;
    }
    // forgiving: a release anywhere lands in the nearest free slot
    const px = clientX !== undefined ? ((clientX - r.left) / r.width) * 100 : 50;
    const py = clientY !== undefined ? ((clientY - r.top) / r.height) * 100 : 40;
    const slot = free.reduce((best, s) =>
      Math.hypot(s.x - px, s.y - py) < Math.hypot(best.x - px, best.y - py) ? s : best,
    );
    sfx("pop");
    sparkle(slot.x, slot.y);
    setStems((s) => [
      ...s,
      {
        key: nextId.current++,
        id,
        img: f.img,
        slot,
        jx: (Math.random() - 0.5) * 4,
        jy: (Math.random() - 0.5) * 5,
        jr: (Math.random() - 0.5) * 14,
      },
    ]);
  };

  const { drag, begin } = useDragDrop(zoneRef, add, { tapToDrop: false });
  const dragItem = useMemo(() => FLOWERS.find((f) => f.id === drag?.id), [drag]);

  /* ribbon tying — circular gesture */
  const tying = useRef(false);
  const lastAngle = useRef<number | null>(null);
  const tieMove = (clientX: number, clientY: number) => {
    if (phase !== "tie" || !tying.current) return;
    const r = zoneRef.current?.getBoundingClientRect();
    if (!r) return;
    const a =
      (Math.atan2(clientY - (r.top + r.height * 0.82), clientX - (r.left + r.width / 2)) * 180) /
      Math.PI;
    const prev = lastAngle.current;
    lastAngle.current = a;
    if (prev === null) return;
    let d = a - prev;
    if (d > 180) d -= 360;
    if (d < -180) d += 360;
    setTieDeg((t) => {
      const n = t + Math.abs(d);
      if (Math.floor(n / 90) > Math.floor(t / 90)) {
        sfx("swirl");
        sparkle(40 + Math.random() * 20, 70);
      }
      if (n >= TIE_GOAL) {
        sfx("win");
        setPhase("done");
        return TIE_GOAL;
      }
      return n;
    });
  };

  const toWrap = () => {
    if (stems.length < COUNT_GOAL) {
      sfx("error");
      return setHint(`${COUNT_GOAL - stems.length} more flowers`);
    }
    if (variety < VARIETY_GOAL) {
      sfx("error");
      return setHint(`use at least ${VARIETY_GOAL} different flowers`);
    }
    sfx("tap");
    setPhase("wrap");
  };

  return (
    <div className="relative flex flex-1 flex-col overflow-x-hidden overflow-y-auto bg-sky pb-[170px] scanlines">
      {done && <Confetti />}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 border-t-[3px] border-ink bg-grass" />

      <header className="relative z-10 flex items-center justify-between px-3 pt-4">
        <button
          type="button"
          onClick={onHome}
          aria-label="Back"
          className="pixel-btn grid h-9 w-9 place-items-center rounded-lg bg-cream"
        >
          <Icon name="back" scale={2} />
        </button>
        <h2 className="pixel-text text-[10px] text-ink">MISSION 2 · BOUQUET</h2>
        <span className="pixel-text text-[8px] text-ink/70">
          {phase === "tie" ? "TIE" : `${stems.length}/${COUNT_GOAL}`}
        </span>
      </header>

      <p className="pixel-text relative z-10 mx-4 mt-3 rounded-xl border-[3px] border-ink bg-cream/95 px-3 py-2 text-center text-[7px] text-ink">
        {hint
          ? hint
          : phase === "arrange"
            ? "drag a flower into the middle — it nestles in"
            : phase === "wrap"
              ? "choose her wrapping paper"
              : phase === "tie"
                ? "swirl your finger to tie the ribbon!"
                : "so pretty"}
      </p>

      <div className="pixel-box relative z-10 mx-3 mt-3 rounded-2xl border-[3px] border-ink bg-cream p-3">
        <div
          ref={zoneRef}
          onPointerDown={(e) => {
            if (phase !== "tie") return;
            tying.current = true;
            lastAngle.current = null;
            (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
          }}
          onPointerMove={(e) => tieMove(e.clientX, e.clientY)}
          onPointerUp={() => {
            tying.current = false;
            lastAngle.current = null;
          }}
          className={`relative h-80 touch-none overflow-hidden rounded-xl border-[3px] border-ink bg-[linear-gradient(180deg,var(--color-sky),var(--color-pink-soft))] ${
            done ? "anim-sway" : ""
          }`}
        >
          {/* 1 · back of the wrapping paper */}
          {wrapped && (
            <img
              src={SPR2.wrapBack}
              alt=""
              className="absolute bottom-1 left-1/2 z-0 h-[76%] w-[74%] -translate-x-1/2 object-contain anim-pop"
              style={{ imageRendering: "pixelated", filter: wrapFilter }}
            />
          )}

          {/* 2a · stems converging into the pinch */}
          {stems.map((s) => {
            const x = s.slot.x + s.jx;
            const y = s.slot.y + s.jy;
            const dx = PINCH.x - x;
            const dy = PINCH.y - y;
            const len = Math.hypot(dx, dy);
            const ang = (Math.atan2(dy, dx) * 180) / Math.PI - 90;
            return (
              <span
                key={`stem-${s.key}`}
                className="absolute z-[5] bg-grass-dark"
                style={{
                  left: `${x}%`,
                  top: `${y}%`,
                  width: 4,
                  height: `${len}%`,
                  transformOrigin: "50% 0",
                  transform: `translateX(-50%) rotate(${ang}deg)`,
                }}
              />
            );
          })}

          {/* 2b · flower heads, back rings first */}
          {[...stems]
            .sort((a, b) => b.slot.ring - a.slot.ring)
            .map((s) => (
              <span
                key={s.key}
                className="absolute anim-settle"
                style={{
                  left: `${s.slot.x + s.jx}%`,
                  top: `${s.slot.y + s.jy}%`,
                  zIndex: 10 + (2 - s.slot.ring),
                }}
              >
                <img
                  src={s.img}
                  alt=""
                  className="block object-contain"
                  style={{
                    width: s.slot.size,
                    height: s.slot.size,
                    transform: `rotate(${s.slot.rot + s.jr}deg)`,
                    imageRendering: "pixelated",
                  }}
                />
              </span>
            ))}

          {/* 3 · front fold of the wrapper, over the lower stems */}
          {wrapped && (
            <img
              src={SPR2.wrapFront}
              alt=""
              className="absolute bottom-0 left-1/2 z-20 h-[46%] w-[56%] -translate-x-1/2 object-contain"
              style={{ imageRendering: "pixelated", filter: wrapFilter }}
            />
          )}

          {/* 4 · bow, snapped to the pinch point */}
          {(phase === "tie" || done) && (
            <img
              src={SPR.bow}
              alt=""
              className={`absolute left-1/2 z-30 h-16 w-16 object-contain ${done ? "anim-snap" : ""}`}
              style={{
                top: `${PINCH.y}%`,
                imageRendering: "pixelated",
                transform: `translate(-50%,-50%) scale(${0.55 + (tieDeg / TIE_GOAL) * 0.55})`,
                opacity: 0.4 + (tieDeg / TIE_GOAL) * 0.6,
              }}
            />
          )}

          {/* 5 · particles */}
          {parts.map((p) => (
            <span
              key={p.id}
              className="pointer-events-none absolute z-40 anim-rise"
              style={{ left: `${p.x}%`, top: `${p.y}%` }}
            >
              <Icon name="heart" scale={2} />
            </span>
          ))}

          {stems.length === 0 && (
            <span className="pixel-text absolute inset-x-4 top-3 z-40 text-center text-[7px] text-ink/60">
              drag a flower here
            </span>
          )}
          {stems.length === 0 && (
            <span className="absolute bottom-6 left-1/2 h-24 w-32 -translate-x-1/2 rounded-b-full border-[3px] border-dashed border-ink/25" />
          )}
        </div>

        {done && (
          <div className="mt-2">
            <Stars value={stars} scale={3} />
          </div>
        )}
      </div>

      {phase === "arrange" && (
        <div className="pixel-box relative z-10 mx-3 mt-4 mb-8 rounded-2xl border-[3px] border-ink bg-[repeating-linear-gradient(180deg,var(--color-wood)_0_12px,var(--color-wood-dark)_12px_14px)] p-2">
          <div className="grid grid-cols-4 gap-2">
            {FLOWERS.map((f) => {
              const count = stems.filter((s) => s.id === f.id).length;
              return (
                <button
                  key={f.id}
                  type="button"
                  onPointerDown={(e) => {
                    setPick(f.id);
                    sfx("tap");
                    begin(f.id, e);
                  }}
                  className={`relative flex flex-col items-center gap-0.5 rounded-lg border-[3px] border-ink px-1 py-2 transition-transform ${
                    pick === f.id ? "-translate-y-1 bg-gold" : "bg-pink-soft"
                  }`}
                  style={{ boxShadow: "0 4px 0 0 var(--color-ink)" }}
                >
                  <img
                    src={f.img}
                    alt={f.label}
                    className="h-10 w-10 object-contain"
                    style={{ imageRendering: "pixelated" }}
                  />
                  <span className="pixel-text text-[5px] text-ink">{f.label}</span>
                  {count > 0 && (
                    <span className="pixel-text absolute -top-2 -right-2 grid h-5 min-w-5 place-items-center rounded-full border-[3px] border-ink bg-cream px-1 text-[6px] text-ink">
                      {count}
                    </span>
                  )}
                  <span className="absolute inset-x-1 -bottom-[6px] h-[5px] rounded-sm bg-wood-dark" />
                </button>
              );
            })}
          </div>

          <div className="mt-4 flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => setStems((s) => s.slice(0, -1))}
              className="pixel-btn rounded-lg bg-cream px-3 py-2 text-[7px] text-ink"
            >
              UNDO
            </button>
            <button
              type="button"
              onClick={() => setStems([])}
              className="pixel-btn rounded-lg bg-cream px-3 py-2 text-[7px] text-ink"
            >
              CLEAR
            </button>
            <button
              type="button"
              onClick={toWrap}
              className="pixel-btn flex items-center gap-1.5 rounded-lg bg-pink px-4 py-2 text-[8px] text-ink"
            >
              WRAP IT
              <Icon name="forward" scale={2} />
            </button>
          </div>
        </div>
      )}

      {phase === "wrap" && (
        <div className="pixel-box relative z-10 mx-3 mt-4 mb-8 rounded-2xl border-[3px] border-ink bg-cream p-2">
          <div className="grid grid-cols-4 gap-1.5">
            {WRAPS.map((w) => (
              <button
                key={w.id}
                type="button"
                onClick={() => {
                  sfx("tap");
                  setWrap(w.id);
                }}
                className={`pixel-btn rounded-lg px-1 py-2 ${wrap === w.id ? "ring-4 ring-ink/30" : ""}`}
                style={{ background: w.swatch }}
              >
                <span className="pixel-text text-[5px] text-ink">{w.label}</span>
              </button>
            ))}
          </div>
          <div className="mt-3 flex justify-center">
            <button
              type="button"
              onClick={() => setPhase("tie")}
              className="pixel-btn flex items-center gap-2 rounded-xl bg-pink px-5 py-3 text-[9px] text-ink"
            >
              TIE THE RIBBON
              <Icon name="forward" scale={2} />
            </button>
          </div>
        </div>
      )}

      {done && (
        <div className="relative z-10 mt-4 mb-8 flex justify-center anim-pop">
          <button
            type="button"
            onClick={onNext}
            className="pixel-btn flex items-center gap-2 rounded-xl bg-pink px-5 py-3 text-[10px] text-ink"
          >
            NEXT
            <Icon name="forward" scale={2} />
          </button>
        </div>
      )}

      {drag && dragItem && (
        <img
          src={dragItem.img}
          alt=""
          className="pointer-events-none fixed z-50 h-24 w-24 -translate-x-1/2 -translate-y-1/2 object-contain drop-shadow"
          style={{ left: drag.x, top: drag.y, imageRendering: "pixelated" }}
        />
      )}
    </div>
  );
}
