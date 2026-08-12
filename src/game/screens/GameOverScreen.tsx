import { PixelArt } from "../PixelArt";
import { HEART, P } from "../sprites";
import { SPR } from "../assets";
import { Icon } from "../icons";
import { useAudio } from "../audio";

type Props = { onStart: () => void; onBack: () => void };

/** The final screen of the quest — the credits roll, pug included. */
export function GameOverScreen({ onStart, onBack }: Props) {
  const { sfx } = useAudio();

  return (
    <div className="relative flex flex-1 flex-col overflow-x-hidden overflow-y-auto pb-[170px] bg-[linear-gradient(180deg,var(--color-pink-soft),var(--color-pink))] scanlines">
      <div className="relative z-10 flex min-h-full flex-col items-center px-4 pt-10 pb-44">
        <div className="flex gap-2">
          {[0, 1, 2].map((i) => (
            <PixelArt
              key={i}
              rows={HEART}
              palette={P}
              scale={5}
              className="anim-bob"
              style={{ animationDelay: `${i * 0.2}s` }}
            />
          ))}
        </div>

        <h2 className="pixel-text title-shadow mt-6 text-center text-[22px] text-cream">
          GAME
          <br />
          OVER
        </h2>
        <p className="pixel-text mt-4 text-center text-[7px] leading-[2] text-ink/70">
          mission complete &lt;3
          <br />
          happy birthday roonie !!
        </p>


        <div className="mt-8 flex items-end gap-6">
          <img
            src={SPR.pug}
            alt=""
            className="h-28 w-auto object-contain anim-bob"
            style={{ imageRendering: "pixelated" }}
          />
          <img
            src={SPR.balloons}
            alt=""
            className="h-32 w-auto object-contain anim-bob"
            style={{ imageRendering: "pixelated", animationDelay: "0.4s" }}
          />
        </div>

        <div className="mt-8 flex w-full max-w-xs flex-col gap-3">
          <button
            type="button"
            onClick={() => {
              sfx("tap");
              onStart();
            }}
            className="pixel-btn flex items-center justify-center gap-2 rounded-xl bg-cream px-4 py-3.5 text-[11px] text-ink"
          >
            PLAY AGAIN
            <Icon name="play" scale={2} />
          </button>
          <button
            type="button"
            onClick={() => {
              sfx("tap");
              onBack();
            }}
            className="pixel-btn flex items-center justify-center gap-2 rounded-xl bg-gold px-4 py-3.5 text-[11px] text-ink"
          >
            <Icon name="back" scale={2} />
            MENU
          </button>
        </div>
      </div>

      {/* fence + roses + grass */}
      <div className="absolute inset-x-0 bottom-0">
        <div className="flex items-end justify-center gap-1 px-2">
          {Array.from({ length: 14 }, (_, i) => (
            <div key={i} className="relative">
              <div className="h-12 w-3 rounded-t-sm border-[3px] border-ink bg-white" />
              {i % 3 === 0 && (
                <img
                  src={SPR.lilyPeach}
                  alt=""
                  className="absolute -top-5 left-1/2 h-7 w-7 -translate-x-1/2 object-contain"
                  style={{ imageRendering: "pixelated" }}
                />
              )}
            </div>
          ))}
        </div>
        <div className="h-16 border-t-[3px] border-ink bg-grass">
          <div className="mt-2 h-2 bg-grass-dark opacity-60" />
        </div>
      </div>
    </div>
  );
}
