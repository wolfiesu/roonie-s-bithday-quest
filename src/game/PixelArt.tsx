import { cn } from "@/lib/utils";

export type Palette = Record<string, string>;

type Props = {
  /** rows of single-char keys; "." = transparent */
  rows: string[];
  palette: Palette;
  /** css size of one pixel */
  scale?: number;
  className?: string;
  style?: React.CSSProperties;
};

/** Tiny pixel-art renderer: draws a char grid with box-shadow-free divs. */
export function PixelArt({ rows, palette, scale = 4, className, style }: Props) {
  const w = Math.max(...rows.map((r) => r.length));
  return (
    <div
      className={cn("relative", className)}
      style={{
        width: w * scale,
        height: rows.length * scale,
        display: "grid",
        gridTemplateColumns: `repeat(${w}, ${scale}px)`,
        gridAutoRows: `${scale}px`,
        ...style,
      }}
      aria-hidden
    >
      {rows.flatMap((row, y) =>
        Array.from({ length: w }, (_, x) => {
          const key = row[x] ?? ".";
          if (key === "." || key === " ") return null;
          return (
            <span
              key={`${x}-${y}`}
              style={{
                gridColumn: x + 1,
                gridRow: y + 1,
                background: palette[key] ?? "transparent",
              }}
            />
          );
        }),
      )}
    </div>
  );
}
