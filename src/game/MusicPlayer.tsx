import { useState } from "react";
import { SPR2 } from "./assets";
import { Icon } from "./icons";
import { useAudio } from "./audio";

/** Retro 8-bit CD-player widget with an ordered, reorderable playlist. */
export function MusicPlayer() {
  const { order, index, track, playing, progress, playAt, go, toggle, move, sfx } = useAudio();
  const [open, setOpen] = useState(false);

  return (
    <div className="pointer-events-auto w-full border-t-[3px] border-ink bg-[linear-gradient(180deg,var(--color-pink-soft),var(--color-pink))] px-3 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
      <p className="pixel-text mb-1 text-center text-[6px] text-ink/70">
        listen to this little playlist i made w love
      </p>
      {open && (
        <ol className="mb-2 max-h-44 overflow-y-auto rounded-lg border-[3px] border-ink bg-cream p-1.5">

          {order.map((t, i) => (
            <li
              key={t.src}
              className={`flex items-center gap-1.5 rounded px-1 py-1 ${
                i === index ? "bg-pink-soft" : ""
              }`}
            >
              <span className="pixel-text w-4 shrink-0 text-[7px] text-ink/60">{i + 1}</span>
              <button
                type="button"
                onClick={() => {
                  sfx("tap");
                  playAt(i);
                }}
                className="min-w-0 flex-1 text-left"
                aria-label={`Play ${t.title}`}
              >
                <p className="pixel-text truncate text-[7px] text-ink">{t.title}</p>
                <p className="pixel-text truncate text-[6px] text-ink/60">{t.artist}</p>
              </button>
              <button
                type="button"
                aria-label={`Move ${t.title} up`}
                onClick={() => move(i, -1)}
                disabled={i === 0}
                className="pixel-btn grid h-6 w-6 place-items-center rounded bg-white disabled:opacity-30"
              >
                <Icon name="up" scale={2} />
              </button>
              <button
                type="button"
                aria-label={`Move ${t.title} down`}
                onClick={() => move(i, 1)}
                disabled={i === order.length - 1}
                className="pixel-btn grid h-6 w-6 place-items-center rounded bg-white disabled:opacity-30"
              >
                <Icon name="down" scale={2} />
              </button>
            </li>
          ))}
        </ol>
      )}

      <div className="flex items-center gap-2 rounded-xl border-[3px] border-ink bg-cream px-2 py-1.5">
        <img
          src={SPR2.cdDisc}
          alt=""
          className="anim-spin h-10 w-10 shrink-0 object-contain"
          style={{ imageRendering: "pixelated", animationPlayState: playing ? "running" : "paused" }}
        />

        <div className="min-w-0 flex-1">
          <p className="pixel-text truncate text-[8px] text-ink">
            {index + 1}. <span className="text-primary">{track.title}</span>
          </p>
          <p className="pixel-text truncate text-[7px] text-ink/60">{track.artist}</p>
          {/* chunky pixel progress blocks */}
          <div className="mt-1 flex gap-[2px]">
            {Array.from({ length: 16 }, (_, i) => (
              <span
                key={i}
                className={`h-2 flex-1 border-2 border-ink ${
                  progress >= ((i + 1) / 16) * 100 ? "bg-pink-deep" : "bg-white"
                }`}
              />
            ))}
          </div>
        </div>
        <button
          type="button"
          onClick={() => {
            sfx("tap");
            setOpen((o) => !o);
          }}
          aria-label="Toggle playlist"
          className="pixel-btn grid h-8 w-8 shrink-0 place-items-center rounded-md bg-pink-soft"
        >
          <Icon name="note" scale={2} />
        </button>
      </div>

      <div className="mt-2 flex items-center justify-center gap-2">
        <PlayerBtn label="Previous track" onClick={() => go(-1)} icon="prev" />
        <PlayerBtn label={playing ? "Pause" : "Play"} onClick={toggle} icon={playing ? "pause" : "play"} />
        <PlayerBtn label="Next track" onClick={() => go(1)} icon="next" />
      </div>
    </div>
  );
}

function PlayerBtn({
  onClick,
  label,
  icon,
}: {
  onClick: () => void;
  label: string;
  icon: "play" | "pause" | "next" | "prev";
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="pixel-btn grid h-9 w-12 place-items-center rounded-md bg-cream"
    >
      <Icon name={icon} scale={2} />
    </button>
  );
}
