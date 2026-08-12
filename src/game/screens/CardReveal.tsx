import { useState } from "react";
import { SPR } from "../assets";
import { Confetti, FloatingHearts } from "../Effects";
import { Icon } from "../icons";

const PLAYFUL = `Jiggle my balls to Niagara Falls
When I see you I'm not just gonna touch you
I'm gonna fuck you
Happy Birthday Queen Roonie`;

const HEARTFELT = `i'm genuinely so glad i get to call you my friend. even though we only know each other online you've become such an important part of my life. talking to you always makes my days better whether we're just being silly and laughing or having those deep conversations.

i hope this year brings you everything you deserve. so much happiness, success, love and just all the good things. you mean so much to me and i'm genuinely so grateful we found each other. i love you so much and i'll always support you no matter what. i hope you know you can always count on me. you're such a beautiful and smart person and you deserve the absolute best.

have the best birthday ever queen  love youuuu <3333`;

type Props = { onHome: () => void };

export function CardReveal({ onHome }: Props) {
  const [opened, setOpened] = useState(false);
  const [real, setReal] = useState(false);

  return (
    <div className="relative flex flex-1 flex-col overflow-x-hidden overflow-y-auto pb-[140px] bg-[linear-gradient(180deg,var(--color-pink-soft),var(--color-lilac))] scanlines">
      <FloatingHearts count={12} />
      {opened && <Confetti count={70} />}

      <div className="relative z-10 flex min-h-full flex-col items-center justify-center px-4 py-10">
        {!opened ? (
          <div className="flex flex-col items-center">
            <img
              src={SPR.envelopeClosed}
              alt="a sealed envelope"
              className="h-44 w-auto object-contain anim-bob"
              style={{ imageRendering: "pixelated" }}
            />
            <p className="pixel-text mt-6 max-w-[18rem] text-center text-[9px] leading-[2] text-ink">
              sou sends u this card ? Wants to open it
            </p>
            <div className="mt-6 flex w-full max-w-xs gap-3">
              {["yes", "yes"].map((label, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setOpened(true)}
                  className="pixel-btn flex-1 rounded-xl bg-pink px-4 py-4 text-[12px] text-ink"
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="w-full max-w-sm anim-pop">
            <div className="pixel-box rounded-2xl bg-white p-4">
              <p className="pixel-text text-center text-[9px] leading-[2] text-primary">
                {PLAYFUL.split("\n").map((l) => (
                  <span key={l} className="block">
                    {l}
                  </span>
                ))}
              </p>

              {!real ? (
                <button
                  type="button"
                  onClick={() => setReal(true)}
                  className="pixel-btn mx-auto mt-5 block rounded-xl bg-gold px-4 py-3 text-[9px] text-ink"
                >
                  <span className="flex items-center gap-2">
                    ...but for real
                    <Icon name="heart" scale={2} />
                  </span>
                </button>
              ) : (
                <div
                  className="mt-5 border-t-[3px] border-dashed border-ink pt-4"
                  style={{ animation: "pop-in 0.8s ease-out both" }}
                >
                  {HEARTFELT.split("\n\n").map((para) => (
                    <p key={para.slice(0, 24)} className="mb-4 text-[18px] leading-snug text-ink">
                      {para}
                    </p>
                  ))}
                  <p className="pixel-text flex items-center justify-center gap-2 text-center text-[8px] text-primary">
                    <Icon name="heart" scale={2} /> sou · happy birthday roonie
                  </p>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={onHome}
              className="pixel-btn mx-auto mt-6 block rounded-xl bg-cream px-4 py-3 text-[9px] text-ink"
            >
              LAST SCREEN
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
