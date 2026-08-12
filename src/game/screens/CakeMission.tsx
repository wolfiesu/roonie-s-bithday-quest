import { useEffect, useMemo, useRef, useState } from "react";
import { Confetti } from "../Effects";
import { useDragDrop } from "../useDragDrop";
import { SPR, SPR2 } from "../assets";
import { Icon, Stars } from "../icons";
import { useAudio } from "../audio";

type Item = { id: string; label: string; img: string };

/** Pantry — every ingredient goes in once. English labels only. */
const RECIPE: Item[] = [
  { id: "flour", label: "Flour", img: SPR2.flour },
  { id: "sugar", label: "Sugar", img: SPR2.sugar },
  { id: "cocoa", label: "Cocoa", img: SPR2.cocoa },
  { id: "milk", label: "Milk", img: SPR2.milk },
  { id: "eggs", label: "Eggs", img: SPR.huevos },
];

type ToolId = "frosting" | "sprinkles";
type DecoId = "strawberry" | "cherries" | "candle" | "bow";

const DECOS: { id: DecoId; label: string; img: string; size: number; area: "top" | "upper" }[] = [
  { id: "strawberry", label: "Strawberry", img: SPR.strawberry, size: 34, area: "upper" },
  { id: "cherries", label: "Cherries", img: SPR.cherries, size: 34, area: "top" },
  { id: "candle", label: "Candle", img: SPR.candle, size: 44, area: "top" },
  { id: "bow", label: "Bow", img: SPR.bow, size: 44, area: "upper" },
];

const STIR_GOAL = 900; // degrees — 2.5 comfy turns
const BAKE_MS = 4200;
const FROST_GOAL = 6; // frosted grid cells

/* --- cake geometry, in % of the cake box (matches the cake_base sprite) --- */
const TOP = { cx: 50, cy: 33, rx: 29, ry: 11 };
const BODY = { x0: 21, x1: 79, y0: 33, y1: 72 };

/** true when the point sits on the cake's frostable surface */
function onCake(x: number, y: number) {
  const e = ((x - TOP.cx) / TOP.rx) ** 2 + ((y - TOP.cy) / TOP.ry) ** 2 <= 1;
  return e || (x >= BODY.x0 && x <= BODY.x1 && y >= BODY.y0 && y <= BODY.y1);
}

/** nearest valid point — the player never loses a decoration */
function clampToCake(x: number, y: number, area: "top" | "upper" | "any" = "any") {
  if (area === "top") {
    const dx = (x - TOP.cx) / TOP.rx;
    const dy = (y - TOP.cy) / TOP.ry;
    const d = Math.hypot(dx, dy);
    if (d <= 0.9) return { x, y };
    return { x: TOP.cx + (dx / d) * TOP.rx * 0.9, y: TOP.cy + (dy / d) * TOP.ry * 0.9 };
  }
  const cy0 = area === "upper" ? 26 : BODY.y0;
  const cy1 = area === "upper" ? 52 : BODY.y1;
  return {
    x: Math.min(BODY.x1 - 3, Math.max(BODY.x0 + 3, x)),
    y: Math.min(cy1, Math.max(cy0, y)),
  };
}

const SPRINKLE_COLORS = [
  "var(--color-pink-deep)",
  "var(--color-gold)",
  "var(--color-sky-deep)",
  "var(--color-grass-dark)",
  "var(--color-lilac)",
];

type Blob = { key: number; x: number; y: number; r: number; rot: number };
type Drip = { key: number; x: number; y: number; h: number; w: number };
type Sprinkle = { key: number; x: number; y: number; rot: number; c: string };
type Placed = { key: number; id: DecoId; img: string; x: number; y: number; size: number; rot: number };
type Phase = "mix" | "stir" | "pour" | "bake" | "decorate" | "done";
type Particle = { id: number; x: number; y: number; kind: "heart" | "star" };

type Props = { onNext: () => void; onHome: () => void };

export function CakeMission({ onNext, onHome }: Props) {
  const bowlRef = useRef<HTMLDivElement | null>(null);
  const cakeRef = useRef<HTMLDivElement | null>(null);
  const puffId = useRef(0);
  const partId = useRef(0);
  const keyId = useRef(0);
  const { sfx } = useAudio();

  const [added, setAdded] = useState<string[]>([]);
  const [hint, setHint] = useState<string | null>(null);
  const [stirDeg, setStirDeg] = useState(0);
  const [phase, setPhase] = useState<Phase>("mix");
  const [pouring, setPouring] = useState(false);
  const [poured, setPoured] = useState(false);
  const [ovenOpen, setOvenOpen] = useState(true);
  const [inOven, setInOven] = useState(false);
  const [baking, setBaking] = useState(false);
  const [baked, setBaked] = useState(false);
  const [puffs, setPuffs] = useState<{ id: number; x: number; y: number; img: string }[]>([]);
  const [parts, setParts] = useState<Particle[]>([]);

  const [tool, setTool] = useState<ToolId | DecoId>("frosting");
  const [blobs, setBlobs] = useState<Blob[]>([]);
  const [drips, setDrips] = useState<Drip[]>([]);
  const [sprinkles, setSprinkles] = useState<Sprinkle[]>([]);
  const [placed, setPlaced] = useState<Placed[]>([]);

  const done = phase === "done";
  const hasCandle = placed.some((p) => p.id === "candle");

  const coverage = useMemo(() => {
    const cells = new Set(blobs.map((b) => `${Math.round(b.x / 8)}:${Math.round(b.y / 8)}`));
    return cells.size;
  }, [blobs]);
  const frosted = coverage >= FROST_GOAL;
  const stars = Math.max(
    1,
    Math.min(
      3,
      Math.round(
        1 +
          Math.min(1, coverage / FROST_GOAL) +
          Math.min(1, (sprinkles.length / 24 + placed.length / 4) / 2),
      ),
    ),
  );

  useEffect(() => {
    if (!hint) return;
    const t = window.setTimeout(() => setHint(null), 1500);
    return () => window.clearTimeout(t);
  }, [hint]);

  const sparkle = (x: number, y: number, kind: Particle["kind"] = "heart") => {
    const id = partId.current++;
    setParts((p) => [...p.slice(-14), { id, x, y, kind }]);
    window.setTimeout(() => setParts((p) => p.filter((q) => q.id !== id)), 900);
  };

  /* ---------------- STAGE 1 — INGREDIENTS ---------------- */
  const spawn = (img: string) => {
    const id = puffId.current++;
    setPuffs((p) => [...p, { id, x: 22 + Math.random() * 56, y: 25 + Math.random() * 30, img }]);
    window.setTimeout(() => setPuffs((p) => p.filter((q) => q.id !== id)), 900);
  };

  const addIngredient = (id: string) => {
    if (phase !== "mix") return;
    const item = RECIPE.find((r) => r.id === id);
    if (!item) return;
    if (added.includes(id)) {
      sfx("error");
      setHint(`${item.label} is already in the bowl`);
      return;
    }
    sfx("pop");
    spawn(item.img);
    sparkle(30 + Math.random() * 40, 40, "star");
    const next = [...added, id];
    setAdded(next);
    if (next.length >= RECIPE.length) {
      setHint("now stir it all together!");
      setPhase("stir");
    }
  };

  /* ---------------- STAGE 2 — MIXING ---------------- */
  const stirring = useRef(false);
  const lastAngle = useRef<number | null>(null);
  const [whiskAngle, setWhiskAngle] = useState(0);

  const stirMove = (clientX: number, clientY: number) => {
    if (phase !== "stir" || !stirring.current) return;
    const r = bowlRef.current?.getBoundingClientRect();
    if (!r) return;
    const a =
      (Math.atan2(clientY - (r.top + r.height / 2), clientX - (r.left + r.width / 2)) * 180) / Math.PI;
    setWhiskAngle(a);
    const prev = lastAngle.current;
    lastAngle.current = a;
    if (prev === null) return;
    let d = a - prev;
    if (d > 180) d -= 360;
    if (d < -180) d += 360;
    setStirDeg((s) => {
      const n = s + Math.abs(d);
      if (Math.floor(n / 90) > Math.floor(s / 90)) {
        sfx("swirl");
        sparkle(25 + Math.random() * 50, 30 + Math.random() * 30, Math.random() > 0.5 ? "heart" : "star");
      }
      if (n >= STIR_GOAL) {
        setPhase("pour");
        setHint("tip the bowl into the pan");
        return STIR_GOAL;
      }
      return n;
    });
  };

  /* ---------------- STAGE 3 — POURING ---------------- */
  const pour = () => {
    if (pouring || poured) return;
    sfx("swirl");
    setPouring(true);
    window.setTimeout(() => {
      setPoured(true);
      sfx("pop");
    }, 750);
    window.setTimeout(() => {
      setPouring(false);
      setPhase("bake");
      setHint("slide the pan into the oven");
    }, 1500);
  };

  /* ---------------- STAGE 4/5 — OVEN ---------------- */
  const tapOven = () => {
    if (baking) return;
    if (!inOven) {
      sfx("tap");
      setInOven(true);
      setHint("close the door to start baking");
      return;
    }
    if (!baked && ovenOpen) {
      sfx("bake");
      setOvenOpen(false);
      setBaking(true);
      window.setTimeout(() => {
        setBaking(false);
        setBaked(true);
        setOvenOpen(true);
        sfx("win");
        setHint("it smells amazing! tap to take it out");
      }, BAKE_MS);
      return;
    }
    if (baked) {
      sfx("pop");
      setPhase("decorate");
      setHint("pick the frosting and drag across the cake");
    }
  };

  /* ---------------- STAGE 6/7 — FROSTING + SPRINKLES ---------------- */
  const painting = useRef(false);

  const toPct = (clientX: number, clientY: number) => {
    const r = cakeRef.current?.getBoundingClientRect();
    if (!r) return null;
    return { x: ((clientX - r.left) / r.width) * 100, y: ((clientY - r.top) / r.height) * 100 };
  };

  const paint = (clientX: number, clientY: number) => {
    const p = toPct(clientX, clientY);
    if (!p || !onCake(p.x, p.y)) return;

    if (tool === "frosting") {
      setBlobs((b) => {
        const near = b.some((q) => Math.hypot(q.x - p.x, q.y - p.y) < 1.8);
        if (near) return b;
        const blob: Blob = {
          key: keyId.current++,
          x: p.x,
          y: p.y,
          r: 16 + Math.random() * 7,
          rot: Math.random() * 90,
        };
        // icing drips near the lower edge of the frosting
        if (p.y > 44 && Math.random() < 0.35) {
          setDrips((d) => [
            ...d,
            { key: keyId.current++, x: p.x, y: p.y, h: 8 + Math.random() * 14, w: 5 + Math.random() * 3 },
          ]);
        }
        return [...b, blob];
      });
      return;
    }

    if (tool === "sprinkles") {
      const overFrosting = blobs.some((q) => Math.hypot(q.x - p.x, q.y - p.y) < 7);
      if (!overFrosting) return;
      setSprinkles((s) => {
        if (s.length > 160) return s;
        const jx = p.x + (Math.random() - 0.5) * 9;
        const jy = p.y + (Math.random() - 0.5) * 7;
        if (!onCake(jx, jy)) return s;
        return [
          ...s,
          {
            key: keyId.current++,
            x: jx,
            y: jy,
            rot: Math.random() * 180,
            c: SPRINKLE_COLORS[Math.floor(Math.random() * SPRINKLE_COLORS.length)]!,
          },
        ];
      });
    }
  };

  /* ---------------- STAGE 8 — DECORATIONS ---------------- */
  const placeDeco = (id: string, clientX?: number, clientY?: number) => {
    if (phase !== "decorate") return;
    const item = DECOS.find((d) => d.id === id);
    if (!item) return;
    if (item.id === "candle" && hasCandle) {
      sfx("error");
      setHint("one candle is plenty");
      return;
    }
    const p = clientX !== undefined && clientY !== undefined ? toPct(clientX, clientY) : null;
    const raw = p ?? { x: TOP.cx, y: TOP.cy };
    const at = clampToCake(raw.x, raw.y, item.area);
    if (!p || !onCake(raw.x, raw.y)) sfx("tap");
    else sfx("pop");
    sparkle(at.x, at.y, "heart");
    setPlaced((list) => [
      ...list,
      {
        key: keyId.current++,
        id: item.id,
        img: item.img,
        x: at.x,
        y: at.y,
        size: item.size,
        rot: item.id === "candle" ? 0 : -12 + Math.random() * 24,
      },
    ]);
  };

  const ing = useDragDrop(bowlRef, addIngredient);
  const deco = useDragDrop(cakeRef, placeDeco, { tapToDrop: false });
  const activeDrag = phase === "decorate" ? deco.drag : ing.drag;
  const dragImg = useMemo(
    () => [...RECIPE, ...DECOS].find((i) => i.id === activeDrag?.id)?.img,
    [activeDrag],
  );

  const finish = () => {
    if (!frosted) {
      sfx("error");
      return setHint("frost a bit more of the cake first");
    }
    if (!hasCandle) {
      sfx("error");
      return setHint("she needs a candle to blow out!");
    }
    sfx("win");
    setPhase("done");
  };

  const stage =
    phase === "mix"
      ? `${added.length}/${RECIPE.length}`
      : phase === "stir"
        ? "MIX"
        : phase === "pour"
          ? "POUR"
          : phase === "bake"
            ? "OVEN"
            : "DECOR";

  return (
    <div className="relative flex flex-1 flex-col overflow-x-hidden overflow-y-auto pb-[170px] scanlines">
      {done && <Confetti />}

      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: `url(${SPR.kitchenBg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          imageRendering: "pixelated",
        }}
      />
      <div className="pointer-events-none absolute inset-0 bg-pink-soft/35" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 border-t-[4px] border-ink bg-[repeating-linear-gradient(180deg,var(--color-wood)_0_10px,var(--color-wood-dark)_10px_12px)]" />

      <header className="relative z-10 flex items-center justify-between px-3 pt-4">
        <button
          type="button"
          onClick={onHome}
          aria-label="Back"
          className="pixel-btn grid h-9 w-9 place-items-center rounded-lg bg-cream"
        >
          <Icon name="back" scale={2} />
        </button>
        <h2 className="pixel-text text-[10px] text-ink">MISSION 1 · CAKE</h2>
        <span className="pixel-text text-[8px] text-ink/70">{stage}</span>
      </header>

      {(phase === "mix" || phase === "stir") && (
        <ol className="relative z-10 mx-3 mt-3 rounded-xl border-[3px] border-ink bg-cream/95 px-3 py-2">
          {RECIPE.map((r, i) => {
            const inBowl = added.includes(r.id);
            return (
              <li key={r.id} className="flex items-center gap-2">
                <span className="pixel-text w-3 text-[7px] text-ink/60">{i + 1}</span>
                {inBowl ? <Icon name="check" scale={1} /> : <span className="h-[7px] w-[7px]" />}
                <span
                  className={`pixel-text text-[7px] ${inBowl ? "text-ink/40 line-through" : "text-ink"}`}
                >
                  {r.label}
                </span>
              </li>
            );
          })}
        </ol>
      )}

      <p className="pixel-text relative z-10 mx-4 mt-3 rounded-xl border-[3px] border-ink bg-cream/95 px-3 py-2 text-center text-[7px] text-ink">
        {hint
          ? hint
          : phase === "mix"
            ? "drag an ingredient into the bowl"
            : phase === "stir"
              ? "hold the whisk and stir in circles!"
              : phase === "pour"
                ? "tap the bowl to pour the batter"
                : phase === "bake"
                  ? "tap the oven"
                  : phase === "decorate"
                    ? tool === "frosting"
                      ? "drag across the cake to frost it"
                      : tool === "sprinkles"
                        ? "sprinkle over the frosting"
                        : "drag the decoration onto the cake"
                    : "look at what you made"}
      </p>

      {/* ---- BOWL ---- */}
      {(phase === "mix" || phase === "stir" || phase === "pour") && (
        <div className="relative z-10 mx-3 mt-3 rounded-2xl border-[3px] border-ink bg-[repeating-linear-gradient(180deg,var(--color-wood)_0_12px,var(--color-wood-dark)_12px_14px)] p-3 pixel-box">
          <div className="flex items-end justify-center gap-2">
            <div
              ref={bowlRef}
              onPointerDown={(e) => {
                if (phase === "pour") return pour();
                if (phase !== "stir") return;
                stirring.current = true;
                lastAngle.current = null;
                (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
              }}
              onPointerMove={(e) => stirMove(e.clientX, e.clientY)}
              onPointerUp={() => {
                stirring.current = false;
                lastAngle.current = null;
              }}
              onPointerLeave={() => {
                stirring.current = false;
                lastAngle.current = null;
              }}
              className={`relative grid aspect-square w-[58%] max-w-[220px] touch-none place-items-center select-none ${
                pouring ? "anim-pour" : ""
              }`}
            >
              <img
                src={SPR.bowlEmpty}
                alt=""
                className="absolute inset-0 h-full w-full object-contain"
                style={{ imageRendering: "pixelated" }}
              />
              <img
                src={SPR.bowlBatter}
                alt="mixing bowl"
                className="absolute inset-0 h-full w-full object-contain transition-opacity duration-500"
                style={{
                  imageRendering: "pixelated",
                  opacity: poured
                    ? 0
                    : Math.min(1, added.length / RECIPE.length / 1.6 + stirDeg / STIR_GOAL / 2.5),
                }}
              />
              {phase === "stir" && (
                <img
                  src={SPR.whisk}
                  alt=""
                  className="absolute h-[62%] w-[62%] object-contain"
                  style={{
                    imageRendering: "pixelated",
                    transformOrigin: "50% 50%",
                    transform: `rotate(${whiskAngle}deg)`,
                  }}
                />
              )}
              {puffs.map((p) => (
                <img
                  key={p.id}
                  src={p.img}
                  alt=""
                  className="pointer-events-none absolute h-10 w-10 object-contain"
                  style={{
                    left: `${p.x}%`,
                    top: `${p.y}%`,
                    imageRendering: "pixelated",
                    animation: "float-up 0.9s ease-out forwards",
                  }}
                />
              ))}
              {parts.map((p) => (
                <span
                  key={p.id}
                  className="pointer-events-none absolute anim-rise"
                  style={{ left: `${p.x}%`, top: `${p.y}%` }}
                >
                  <Icon name={p.kind === "heart" ? "heart" : "star"} scale={2} />
                </span>
              ))}
            </div>

            {/* cake pan waiting for the batter */}
            {phase === "pour" && (
              <div className="relative mb-1 h-16 w-28">
                {pouring && !poured && (
                  <span className="absolute -top-10 left-2 h-10 w-2 bg-[color-mix(in_oklab,var(--color-wood-dark)_70%,var(--color-cream))]" />
                )}
                <span className="absolute inset-x-0 bottom-0 h-10 rounded-b-xl border-[3px] border-ink bg-[color-mix(in_oklab,var(--color-ink)_25%,var(--color-cream))]" />
                {poured && (
                  <span className="absolute inset-x-[6px] bottom-[6px] h-6 rounded-b-lg border-2 border-ink bg-[color-mix(in_oklab,var(--color-wood-dark)_75%,var(--color-cream))] anim-pop" />
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ---- OVEN ---- */}
      {phase === "bake" && (
        <div className="relative z-10 mx-3 mt-3 flex flex-col items-center rounded-2xl border-[3px] border-ink bg-cream/90 p-4 pixel-box">
          <button
            type="button"
            onClick={tapOven}
            aria-label="Oven"
            className="relative h-52 w-52 select-none"
          >
            <img
              src={SPR.oven}
              alt="pixel oven"
              className="absolute inset-0 h-full w-full object-contain"
              style={{ imageRendering: "pixelated" }}
            />
            <span
              className="absolute top-[46%] left-1/2 h-16 w-24 -translate-x-1/2 border-[3px] border-ink"
              style={{
                background: baking
                  ? "color-mix(in oklab, var(--color-gold) 70%, transparent)"
                  : "color-mix(in oklab, var(--color-ink) 25%, transparent)",
                transition: "background 400ms steps(4)",
              }}
            />
            {inOven && (
              <img
                src={baked ? SPR2.cakeBase : SPR.bowlBatter}
                alt=""
                className="absolute top-[44%] left-1/2 h-16 w-16 -translate-x-1/2 object-contain anim-bob"
                style={{ imageRendering: "pixelated" }}
              />
            )}
            {baking &&
              [0, 1, 2, 3].map((i) => (
                <span
                  key={i}
                  className="absolute anim-sparkle"
                  style={{ left: `${18 + i * 20}%`, top: "18%", animationDelay: `${i * 0.25}s` }}
                >
                  <Icon name="star" scale={2} />
                </span>
              ))}
          </button>
          {baking && (
            <div className="mt-2 flex w-40 gap-[2px]">
              {Array.from({ length: 10 }, (_, i) => (
                <span
                  key={i}
                  className="h-2 flex-1 border-2 border-ink bg-white"
                  style={{ animation: `sparkle 1s steps(2,end) ${i * (BAKE_MS / 10000)}s forwards` }}
                />
              ))}
            </div>
          )}
          <p className="pixel-text mt-2 text-center text-[7px] text-ink/70">
            {baking
              ? "baking..."
              : baked
                ? "tap to take the cake out"
                : inOven
                  ? "tap to close the door"
                  : "tap to slide the pan in"}
          </p>
        </div>
      )}

      {/* ---- DECORATING ---- */}
      {(phase === "decorate" || done) && (
        <div className="relative z-10 mx-3 mt-3 rounded-2xl border-[3px] border-ink bg-cream/95 p-3 pixel-box">
          <div
            ref={cakeRef}
            onPointerDown={(e) => {
              if (tool !== "frosting" && tool !== "sprinkles") return;
              painting.current = true;
              (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
              paint(e.clientX, e.clientY);
            }}
            onPointerMove={(e) => painting.current && paint(e.clientX, e.clientY)}
            onPointerUp={() => (painting.current = false)}
            onPointerLeave={() => (painting.current = false)}
            className={`relative mx-auto aspect-[4/3] w-full max-w-[300px] touch-none ${
              done ? "anim-sway" : ""
            }`}
          >
            {/* 1-2 · cake body */}
            <img
              src={SPR2.cakeBase}
              alt="birthday cake"
              className="absolute inset-0 z-10 h-full w-full object-contain"
              style={{ imageRendering: "pixelated" }}
            />

            {/* 4 · icing drips (behind the frosting body so they look attached) */}
            {drips.map((d) => (
              <span
                key={d.key}
                className="absolute z-20 rounded-b-full border-[2px] border-ink/25 bg-cream"
                style={{ left: `${d.x}%`, top: `${d.y}%`, width: d.w, height: d.h, marginLeft: -d.w / 2 }}
              />
            ))}

            {/* 3 · frosting */}
            {blobs.map((b) => (
              <span
                key={b.key}
                className="absolute z-30 bg-cream"
                style={{
                  left: `${b.x}%`,
                  top: `${b.y}%`,
                  width: b.r,
                  height: b.r * 0.85,
                  borderRadius: "45% 55% 50% 50%",
                  transform: `translate(-50%,-50%) rotate(${b.rot}deg)`,
                  boxShadow: "0 1px 0 0 color-mix(in oklab, var(--color-ink) 12%, transparent)",
                }}
              />
            ))}

            {/* 5 · sprinkles */}
            {sprinkles.map((s) => (
              <span
                key={s.key}
                className="absolute z-40"
                style={{
                  left: `${s.x}%`,
                  top: `${s.y}%`,
                  width: 5,
                  height: 2,
                  background: s.c,
                  transform: `translate(-50%,-50%) rotate(${s.rot}deg)`,
                }}
              />
            ))}

            {/* 6-7 · toppings and candles */}
            {placed.map((p) => (
              <span
                key={p.key}
                className="absolute anim-settle"
                style={{ left: `${p.x}%`, top: `${p.y}%`, zIndex: p.id === "candle" ? 60 : 50 }}
              >
                <img
                  src={p.img}
                  alt=""
                  className="block object-contain"
                  style={{
                    width: p.size,
                    height: p.size,
                    transform: `rotate(${p.rot}deg)`,
                    imageRendering: "pixelated",
                  }}
                />
              </span>
            ))}

            {/* 8 · feedback particles */}
            {parts.map((p) => (
              <span
                key={p.id}
                className="pointer-events-none absolute z-[70] anim-rise"
                style={{ left: `${p.x}%`, top: `${p.y}%` }}
              >
                <Icon name={p.kind === "heart" ? "heart" : "star"} scale={2} />
              </span>
            ))}
          </div>

          {done && (
            <div className="mt-2">
              <Stars value={stars} scale={3} />
            </div>
          )}
        </div>
      )}

      {/* ---- PANTRY / TOOL SHELF ---- */}
      {(phase === "mix" || phase === "decorate") && (
        <div className="relative z-10 mx-3 mt-4 mb-8">
          <div className="rounded-2xl border-[3px] border-ink bg-[repeating-linear-gradient(180deg,var(--color-wood)_0_12px,var(--color-wood-dark)_12px_14px)] p-2 pixel-box">
            <div className="mb-1 flex items-center justify-center gap-1">
              <Icon name="star" scale={1} />
              <span className="pixel-text text-[6px] text-cream">
                {phase === "mix" ? "PANTRY" : "DECORATING KIT"}
              </span>
              <Icon name="star" scale={1} />
            </div>

            {phase === "mix" ? (
              <div className="grid grid-cols-3 gap-2">
                {RECIPE.map((it) => {
                  const used = added.includes(it.id);
                  return (
                    <button
                      key={it.id}
                      type="button"
                      disabled={used}
                      onPointerDown={(e) => !used && ing.begin(it.id, e)}
                      className={`relative flex flex-col items-center gap-0.5 rounded-lg border-[3px] border-ink px-1 py-1.5 ${
                        used ? "bg-pink-soft opacity-35" : "bg-pink-soft"
                      }`}
                      style={{ boxShadow: "0 4px 0 0 var(--color-ink)" }}
                    >
                      <img
                        src={it.img}
                        alt={it.label}
                        className="h-11 w-11 object-contain"
                        style={{ imageRendering: "pixelated" }}
                      />
                      <span className="pixel-text text-[5px] text-ink">{it.label}</span>
                      {used && (
                        <span className="absolute -top-2 -right-2 grid h-5 w-5 place-items-center rounded-full border-[3px] border-ink bg-cream">
                          <Icon name="check" scale={1} />
                        </span>
                      )}
                      <span className="absolute inset-x-1 -bottom-[6px] h-[5px] rounded-sm bg-wood-dark" />
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "frosting" as const, label: "Frosting", img: SPR.frosting },
                  { id: "sprinkles" as const, label: "Sprinkles", img: SPR.sprinkles },
                ].map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => {
                      sfx("tap");
                      setTool(t.id);
                    }}
                    className={`relative flex flex-col items-center gap-0.5 rounded-lg border-[3px] border-ink px-1 py-1.5 transition-transform ${
                      tool === t.id ? "-translate-y-1 bg-gold" : "bg-pink-soft"
                    }`}
                    style={{ boxShadow: "0 4px 0 0 var(--color-ink)" }}
                  >
                    <img
                      src={t.img}
                      alt={t.label}
                      className="h-11 w-11 object-contain"
                      style={{ imageRendering: "pixelated" }}
                    />
                    <span className="pixel-text text-[5px] text-ink">{t.label}</span>
                    <span className="absolute inset-x-1 -bottom-[6px] h-[5px] rounded-sm bg-wood-dark" />
                  </button>
                ))}
                {DECOS.map((d) => {
                  const count = placed.filter((p) => p.id === d.id).length;
                  return (
                    <button
                      key={d.id}
                      type="button"
                      onPointerDown={(e) => {
                        setTool(d.id);
                        sfx("tap");
                        deco.begin(d.id, e);
                      }}
                      className={`relative flex flex-col items-center gap-0.5 rounded-lg border-[3px] border-ink px-1 py-1.5 transition-transform ${
                        tool === d.id ? "-translate-y-1 bg-gold" : "bg-pink-soft"
                      }`}
                      style={{ boxShadow: "0 4px 0 0 var(--color-ink)" }}
                    >
                      <img
                        src={d.img}
                        alt={d.label}
                        className="h-11 w-11 object-contain"
                        style={{ imageRendering: "pixelated" }}
                      />
                      <span className="pixel-text text-[5px] text-ink">{d.label}</span>
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
            )}
          </div>

          {phase === "decorate" && (
            <div className="mt-3 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => {
                  sfx("tap");
                  if (tool === "frosting") setBlobs((b) => b.slice(0, -6));
                  else if (tool === "sprinkles") setSprinkles((s) => s.slice(0, -8));
                  else setPlaced((p) => p.slice(0, -1));
                }}
                className="pixel-btn rounded-lg bg-cream px-3 py-2 text-[7px] text-ink"
              >
                UNDO
              </button>
              <button
                type="button"
                onClick={() => {
                  sfx("tap");
                  setBlobs([]);
                  setDrips([]);
                  setSprinkles([]);
                  setPlaced([]);
                }}
                className="pixel-btn rounded-lg bg-cream px-3 py-2 text-[7px] text-ink"
              >
                CLEAR
              </button>
              <button
                type="button"
                onClick={finish}
                className="pixel-btn rounded-lg bg-pink px-4 py-2 text-[8px] text-ink"
              >
                DONE
              </button>
            </div>
          )}
        </div>
      )}

      {done && (
        <div className="relative z-10 mt-4 mb-8 flex justify-center anim-pop">
          <button
            type="button"
            onClick={onNext}
            className="pixel-btn flex items-center gap-2 rounded-xl bg-pink px-5 py-3 text-[10px] text-ink"
          >
            NEXT MISSION
            <Icon name="forward" scale={2} />
          </button>
        </div>
      )}

      {activeDrag && dragImg && (
        <img
          src={dragImg}
          alt=""
          className="pointer-events-none fixed z-50 h-20 w-20 -translate-x-1/2 -translate-y-1/2 object-contain drop-shadow"
          style={{ left: activeDrag.x, top: activeDrag.y, imageRendering: "pixelated" }}
        />
      )}
    </div>
  );
}
