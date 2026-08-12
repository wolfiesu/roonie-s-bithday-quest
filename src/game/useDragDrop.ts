import { useCallback, useEffect, useRef, useState } from "react";

type Drag = { id: string; x: number; y: number };

/**
 * Touch-friendly drag OR tap. Dropping on `zoneRef` (or a quick tap on the
 * item) fires `onDrop`. Never fails — misses are simply ignored.
 */
export function useDragDrop(
  zoneRef: React.RefObject<HTMLElement | null>,
  onDrop: (id: string, clientX?: number, clientY?: number) => void,
  opts: { tapToDrop?: boolean } = { tapToDrop: true },
) {

  const [drag, setDrag] = useState<Drag | null>(null);
  const start = useRef<{ x: number; y: number } | null>(null);
  const active = useRef<string | null>(null);

  const begin = useCallback((id: string, e: React.PointerEvent) => {
    active.current = id;
    start.current = { x: e.clientX, y: e.clientY };
    setDrag({ id, x: e.clientX, y: e.clientY });
  }, []);

  useEffect(() => {
    if (!drag) return;
    const move = (e: PointerEvent) => {
      setDrag((d) => (d ? { ...d, x: e.clientX, y: e.clientY } : d));
    };
    const up = (e: PointerEvent) => {
      const id = active.current;
      const s = start.current;
      active.current = null;
      start.current = null;
      setDrag(null);
      if (!id) return;
      const moved = s ? Math.hypot(e.clientX - s.x, e.clientY - s.y) : 0;
      const r = zoneRef.current?.getBoundingClientRect();
      const inZone =
        !!r && e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
      if (inZone || (opts.tapToDrop !== false && moved < 10)) onDrop(id, e.clientX, e.clientY);
    };
    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
    };
  }, [drag, onDrop, zoneRef, opts.tapToDrop]);

  return { drag, begin };
}
