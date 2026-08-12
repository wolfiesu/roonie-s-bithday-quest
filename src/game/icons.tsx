import { PixelArt, type Palette } from "./PixelArt";
import { P } from "./sprites";

/** Palette for UI icons — pixel only, never emoji. */
const IP: Palette = {
  ...P,
  d: "color-mix(in oklab, var(--color-ink) 22%, transparent)",
  G: "var(--color-gold)",
};

export const ICONS = {
  play: ["kk.....", "kPkk...", "kPPPk..", "kPPPPk.", "kPPPk..", "kPkk...", "kk....."],
  pause: ["kkk.kkk", "kPk.kPk", "kPk.kPk", "kPk.kPk", "kPk.kPk", "kPk.kPk", "kkk.kkk"],
  next: ["kk...kkk", "kPkk.kPk", "kPPPkkPk", "kPPPPkPk", "kPPPkkPk", "kPkk.kPk", "kk...kkk"],
  prev: ["kkk...kk", "kPk.kkPk", "kPkkPPPk", "kPkPPPPk", "kPkkPPPk", "kPk.kkPk", "kkk...kk"],
  up: ["...k...", "..kPk..", ".kPPPk.", "kPPPPPk", "kkkPkkk", "..kPk..", "..kkk.."],
  down: ["..kkk..", "..kPk..", "kkkPkkk", "kPPPPPk", ".kPPPk.", "..kPk..", "...k..."],
  back: ["..k....", ".kPk...", "kPPPkkk", "kPPPPPk", "kPPPkkk", ".kPk...", "..k...."],
  forward: ["....k..", "...kPk.", "kkkPPPk", "kPPPPPk", "kkkPPPk", "...kPk.", "....k.."],
  star: ["...G...", "..GGG..", "GGGGGGG", ".GGGGG.", "..GGG..", ".GG.GG.", "G.....G"],
  starOff: ["...d...", "..ddd..", "ddddddd", ".ddddd.", "..ddd..", ".dd.dd.", "d.....d"],
  gear: [".k.k.k.", "kkkkkkk", ".kwwwk.", "kkw.wkk", ".kwwwk.", "kkkkkkk", ".k.k.k."],
  note: ["....kkk", "....kPk", "...kkPk", "...kPPk", "kkkkPk.", "kPPPk..", ".kkk..."],
  check: ["......k", ".....ke", "k...kek", "kk.kek.", ".kkek..", "..kek..", "...k..."],
  cross: ["k.....k", "kk...kk", ".kk.kk.", "..kkk..", ".kk.kk.", "kk...kk", "k.....k"],
  sound: ["...kk..", "..kPk.k", "kkPPk.k", "kPPPkkk", "kkPPk.k", "..kPk.k", "...kk.."],
  mute: ["...kk..", "..kPk..", "kkPPk..", "kPPPk.k", "kkPPkkk", "..kPk.k", "...kk.."],
  heart: [".kk.kk.", "kPPkPPk", "kPPPPPk", "kPPPPPk", ".kPPPk.", "..kPk..", "...k..."],
} as const;

export type IconName = keyof typeof ICONS;

export function Icon({
  name,
  scale = 2,
  className,
}: {
  name: IconName;
  scale?: number;
  className?: string;
}) {
  return (
    <PixelArt
      rows={ICONS[name] as unknown as string[]}
      palette={IP}
      scale={scale}
      className={className ?? ""}
    />
  );

}

/** Pixel star row — replaces "★" text. */
export function Stars({ value, max = 3, scale = 2 }: { value: number; max?: number; scale?: number }) {
  return (
    <div className="flex items-center justify-center gap-1">
      {Array.from({ length: max }, (_, i) => (
        <Icon key={i} name={i < value ? "star" : "starOff"} scale={scale} />
      ))}
    </div>
  );
}
