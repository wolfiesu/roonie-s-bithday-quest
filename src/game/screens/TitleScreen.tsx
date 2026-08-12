import { useState } from "react";
import { PixelArt } from "../PixelArt";
import { HEART, P } from "../sprites";
import { SPR } from "../assets";
import { Clouds, FloatingHearts } from "../Effects";
import { Icon } from "../icons";
import { useAudio } from "../audio";

type Props = { onPlay: () => void; onSettings: () => void };

const MENU = [
  { id: "play", label: "PLAY", bg: "bg-pink" },
  { id: "shop", label: "SHOP", bg: "bg-lilac" },
  { id: "duos", label: "DUOS", bg: "bg-cream" },
  { id: "collection", label: "COLLECTION", bg: "bg-sky-deep" },
  { id: "settings", label: "SETTINGS", bg: "bg-gold" },
] as const;

export function TitleScreen({ onPlay, onSettings }: Props) {
  const [toast, setToast] = useState<string | null>(null);
  const { sfx } = useAudio();

  const press = (id: string, label: string) => {
    sfx("tap");
    if (id === "play") return onPlay();
    if (id === "settings") return onSettings();
    setToast(`${label} — coming soon`);
    window.setTimeout(() => setToast(null), 1600);
  };

  return (
    <div className="relative flex flex-1 flex-col overflow-hidden pb-[170px] bg-sky scanlines">
      <Clouds />
      <FloatingHearts count={7} />

      {/* grass strip */}
      <div className="absolute inset-x-0 bottom-0 h-24 border-t-[3px] border-ink bg-grass">
        <div className="absolute inset-x-0 top-3 h-2 bg-grass-dark opacity-60" />
      </div>

      <div className="relative z-10 flex min-h-full flex-col px-4 pt-8 pb-28">
        <h1 className="pixel-text title-shadow text-center text-[26px] leading-[1.5] text-pink-soft">
          Roonie&apos;s
          <br />
          Quest
        </h1>
        <p className="pixel-text mt-3 text-center text-[7px] text-ink/70">
          a tiny birthday game made by sou
        </p>

        <div className="mt-7 flex items-end gap-3">
          <div className="flex w-[58%] flex-col gap-2.5">
            {MENU.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => press(m.id, m.label)}
                className={`pixel-btn flex w-full items-center justify-between rounded-xl ${m.bg} px-3 py-3 text-[10px] text-ink`}
              >
                {m.label}
                <Icon name={m.id === "play" ? "play" : m.id === "settings" ? "gear" : "forward"} scale={2} />
              </button>
            ))}
          </div>
          <div className="flex flex-1 flex-col items-center gap-2">
            <img
              src={SPR.girl}
              alt="Roonie"
              className="h-40 w-auto object-contain anim-bob"
              style={{ imageRendering: "pixelated" }}
            />

            <div className="flex gap-1">
              {[0, 1, 2].map((i) => (
                <PixelArt key={i} rows={HEART} palette={P} scale={3} />
              ))}
            </div>
          </div>
        </div>
      </div>

      {toast && (
        <div className="pointer-events-none fixed inset-x-6 bottom-40 z-30 anim-pop">
          <div className="pixel-box pixel-text rounded-xl bg-cream px-4 py-3 text-center text-[8px] text-ink">
            {toast}
          </div>
        </div>
      )}
    </div>
  );
}
