import { SPR } from "../assets";
import { Icon } from "../icons";
import { useAudio } from "../audio";

type Props = { onBack: () => void };

/** Settings: music controls, playlist order and sound effects toggle. */
export function SettingsScreen({ onBack }: Props) {
  const {
    order,
    index,
    playing,
    volume,
    setVolume,
    playAt,
    go,
    toggle,
    move,
    sfxOn,
    setSfxOn,
    sfx,
  } = useAudio();

  return (
    <div className="relative flex flex-1 flex-col overflow-x-hidden overflow-y-auto pb-[170px] bg-[linear-gradient(180deg,var(--color-sky),var(--color-pink-soft))] scanlines">
      <header className="relative z-10 flex items-center justify-between px-3 pt-4">
        <button
          type="button"
          onClick={onBack}
          aria-label="Back"
          className="pixel-btn grid h-9 w-9 place-items-center rounded-lg bg-cream"
        >
          <Icon name="back" scale={2} />
        </button>
        <h2 className="pixel-text text-[10px] text-ink">SETTINGS</h2>
        <Icon name="gear" scale={3} />
      </header>

      {/* music panel */}
      <section className="relative z-10 mx-3 mt-4 rounded-2xl border-[3px] border-ink bg-cream p-3 pixel-box">
        <h3 className="pixel-text text-[8px] text-ink">MUSIC</h3>
        <div className="mt-3 flex items-center gap-3">
          <img
            src={SPR.cdPlayer}
            alt=""
            className={`h-14 w-14 object-contain ${playing ? "anim-spin" : ""}`}
            style={{ imageRendering: "pixelated" }}
          />
          <div className="flex gap-2">
            <button
              type="button"
              aria-label="Previous track"
              onClick={() => go(-1)}
              className="pixel-btn grid h-10 w-12 place-items-center rounded-md bg-pink-soft"
            >
              <Icon name="prev" scale={2} />
            </button>
            <button
              type="button"
              aria-label={playing ? "Pause" : "Play"}
              onClick={toggle}
              className="pixel-btn grid h-10 w-12 place-items-center rounded-md bg-pink"
            >
              <Icon name={playing ? "pause" : "play"} scale={2} />
            </button>
            <button
              type="button"
              aria-label="Next track"
              onClick={() => go(1)}
              className="pixel-btn grid h-10 w-12 place-items-center rounded-md bg-pink-soft"
            >
              <Icon name="next" scale={2} />
            </button>
          </div>
        </div>

        <label className="pixel-text mt-4 flex items-center gap-2 text-[7px] text-ink">
          VOL
          <input
            type="range"
            min={0}
            max={100}
            value={Math.round(volume * 100)}
            onChange={(e) => setVolume(Number(e.target.value) / 100)}
            className="h-2 flex-1 accent-[var(--color-pink-deep)]"
            aria-label="Music volume"
          />
        </label>
      </section>

      {/* sfx panel */}
      <section className="relative z-10 mx-3 mt-4 rounded-2xl border-[3px] border-ink bg-cream p-3 pixel-box">
        <h3 className="pixel-text text-[8px] text-ink">SOUND FX</h3>
        <button
          type="button"
          onClick={() => {
            setSfxOn(!sfxOn);
            if (!sfxOn) sfx("pop");
          }}
          className={`pixel-btn mt-3 flex w-full items-center justify-between rounded-xl px-3 py-3 ${
            sfxOn ? "bg-grass" : "bg-white"
          }`}
        >
          <span className="pixel-text text-[8px] text-ink">{sfxOn ? "ON" : "OFF"}</span>
          <Icon name={sfxOn ? "sound" : "mute"} scale={3} />
        </button>
      </section>

      {/* playlist order */}
      <section className="relative z-10 mx-3 mt-4 mb-8 rounded-2xl border-[3px] border-ink bg-cream p-3 pixel-box">
        <h3 className="pixel-text text-[8px] text-ink">PLAYLIST ORDER</h3>
        <ol className="mt-2">
          {order.map((t, i) => (
            <li
              key={t.src}
              className={`flex items-center gap-1.5 rounded px-1 py-1.5 ${
                i === index ? "bg-pink-soft" : ""
              }`}
            >
              <span className="pixel-text w-4 shrink-0 text-[7px] text-ink/60">{i + 1}</span>
              <button
                type="button"
                onClick={() => playAt(i)}
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
                className="pixel-btn grid h-7 w-7 place-items-center rounded bg-white disabled:opacity-30"
              >
                <Icon name="up" scale={2} />
              </button>
              <button
                type="button"
                aria-label={`Move ${t.title} down`}
                onClick={() => move(i, 1)}
                disabled={i === order.length - 1}
                className="pixel-btn grid h-7 w-7 place-items-center rounded bg-white disabled:opacity-30"
              >
                <Icon name="down" scale={2} />
              </button>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
