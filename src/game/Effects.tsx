import { useEffect, useMemo, useState } from "react";
import { PixelArt } from "./PixelArt";
import { HEART, P } from "./sprites";

/** Random decorations are generated after mount so SSR and client HTML match. */
function useClientList<T>(count: number, make: (count: number) => T[]): T[] {
  const [items, setItems] = useState<T[]>([]);
  useEffect(() => {
    setItems(make(count));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [count]);
  return items;
}

const COLORS = [
  "var(--color-pink)",
  "var(--color-pink-deep)",
  "var(--color-gold)",
  "var(--color-lilac)",
  "var(--color-grass)",
  "#ffffff",
];

export function Confetti({ count = 60 }: { count?: number }) {
  const bits = useClientList(
    count,
    (count) =>
      Array.from({ length: count }, (_, i) => ({
        i,
        left: Math.random() * 100,
        delay: Math.random() * 1.2,
        dur: 2.2 + Math.random() * 1.8,
        size: 6 + Math.round(Math.random() * 6),
        color: COLORS[i % COLORS.length]!,
      })),
  );

  return (
    <div className="pointer-events-none fixed inset-0 z-40 overflow-hidden" aria-hidden>
      {bits.map((b) => (
        <span
          key={b.i}
          className="absolute top-0 border-2 border-ink"
          style={{
            left: `${b.left}%`,
            width: b.size,
            height: b.size,
            background: b.color,
            animation: `confetti-fall ${b.dur}s linear ${b.delay}s forwards`,
          }}
        />
      ))}
    </div>
  );
}

export function FloatingHearts({ count = 10 }: { count?: number }) {
  const hearts = useClientList(
    count,
    (count) =>
      Array.from({ length: count }, (_, i) => ({
        i,
        left: Math.random() * 100,
        delay: Math.random() * 6,
        dur: 5 + Math.random() * 4,
        size: 10 + Math.round(Math.random() * 10),
      })),
  );
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {hearts.map((h) => (
        <span
          key={h.i}
          className="absolute bottom-0"
          style={{
            left: `${h.left}%`,
            animation: `float-up ${h.dur}s linear ${h.delay}s infinite`,
          }}
        >
          <PixelArt rows={HEART} palette={P} scale={Math.max(2, Math.round(h.size / 6))} />
        </span>
      ))}
    </div>
  );
}

export function Clouds() {
  const clouds = useMemo(
    () =>
      Array.from({ length: 4 }, (_, i) => ({
        i,
        top: 6 + i * 13,
        dur: 40 + i * 14,
        delay: -i * 12,
        scale: 0.7 + (i % 3) * 0.3,
      })),
    [],
  );
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {clouds.map((c) => (
        <div
          key={c.i}
          className="absolute"
          style={{
            top: `${c.top}%`,
            transform: `scale(${c.scale})`,
            animation: `drift ${c.dur}s linear ${c.delay}s infinite`,
          }}
        >
          <div className="relative">
            <div className="h-5 w-20 rounded-full border-[3px] border-ink bg-white" />
            <div className="absolute -top-3 left-4 h-6 w-10 rounded-full border-[3px] border-ink bg-white" />
            <div className="absolute -top-2 left-11 h-5 w-8 rounded-full border-[3px] border-ink bg-white" />
            <div className="absolute top-1 left-5 h-3 w-12 bg-white" />
          </div>
        </div>
      ))}
    </div>
  );
}
