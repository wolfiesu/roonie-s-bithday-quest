import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { TRACKS, type Track } from "./tracks";

export type Sfx = "tap" | "pop" | "swirl" | "bake" | "win" | "error";

type Ctx = {
  /* music */
  order: Track[];
  index: number;
  track: Track;
  playing: boolean;
  progress: number;
  volume: number;
  setVolume: (v: number) => void;
  playAt: (i: number) => void;
  go: (dir: number) => void;
  toggle: () => void;
  move: (from: number, dir: number) => void;
  /* sfx */
  sfxOn: boolean;
  setSfxOn: (v: boolean) => void;
  sfx: (name: Sfx) => void;
};

const AudioCtx = createContext<Ctx | null>(null);

const TONES: Record<Sfx, { f: number[]; dur: number; type: OscillatorType }> = {
  tap: { f: [660], dur: 0.06, type: "square" },
  pop: { f: [520, 880], dur: 0.09, type: "square" },
  swirl: { f: [420], dur: 0.05, type: "triangle" },
  bake: { f: [330, 440, 550], dur: 0.12, type: "square" },
  win: { f: [523, 659, 784, 1046], dur: 0.13, type: "square" },
  error: { f: [200, 150], dur: 0.1, type: "sawtooth" },
};

export function AudioProvider({ children }: { children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const acRef = useRef<AudioContext | null>(null);

  const [order, setOrder] = useState<Track[]>(TRACKS);
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolumeState] = useState(0.8);
  const [sfxOn, setSfxOn] = useState(true);

  const track = order[index]!;

  // Handle volume changes
  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
  }, [volume, index]);

  // Sync HTMLAudioElement playback with React 'playing' and 'index' state
  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;

    if (playing) {
      el.play().catch((err) => {
        console.warn("Playback prevented or failed:", err);
        setPlaying(false);
      });
    } else {
      el.pause();
    }
  }, [playing, index]);

  // Start music on the first page interaction anywhere
  useEffect(() => {
    const start = () => {
      setPlaying(true);
    };
    window.addEventListener("pointerdown", start, { once: true });
    window.addEventListener("keydown", start, { once: true });
    return () => {
      window.removeEventListener("pointerdown", start);
      window.removeEventListener("keydown", start);
    };
  }, []);

  const playAt = useCallback((i: number) => {
    setIndex(i);
    setProgress(0);
    setPlaying(true);
  }, []);

  const go = useCallback(
    (dir: number) => playAt((index + dir + order.length) % order.length),
    [index, order.length, playAt],
  );

  const toggle = useCallback(() => {
    setPlaying((p) => !p);
  }, []);

  const move = useCallback(
    (from: number, dir: number) => {
      const to = from + dir;
      if (to < 0 || to >= order.length) return;
      const next = [...order];
      const [item] = next.splice(from, 1);
      next.splice(to, 0, item!);
      setOrder(next);
      setIndex((i) => (i === from ? to : i === to ? from : i));
    },
    [order],
  );

  const sfx = useCallback(
    (name: Sfx) => {
      if (!sfxOn || typeof window === "undefined") return;
      try {
        const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        const ac = (acRef.current ??= new AC());
        if (ac.state === "suspended") void ac.resume();
        const cfg = TONES[name];
        cfg.f.forEach((freq, i) => {
          const osc = ac.createOscillator();
          const gain = ac.createGain();
          const t0 = ac.currentTime + i * cfg.dur * 0.8;
          osc.type = cfg.type;
          osc.frequency.setValueAtTime(freq, t0);
          gain.gain.setValueAtTime(0.0001, t0);
          gain.gain.exponentialRampToValueAtTime(0.09, t0 + 0.01);
          gain.gain.exponentialRampToValueAtTime(0.0001, t0 + cfg.dur);
          osc.connect(gain).connect(ac.destination);
          osc.start(t0);
          osc.stop(t0 + cfg.dur + 0.02);
        });
      } catch {
        /* audio unavailable — silent */
      }
    },
    [sfxOn],
  );

  const value = useMemo<Ctx>(
    () => ({
      order,
      index,
      track,
      playing,
      progress,
      volume,
      setVolume: setVolumeState,
      playAt,
      go,
      toggle,
      move,
      sfxOn,
      setSfxOn,
      sfx,
    }),
    [order, index, track, playing, progress, volume, playAt, go, toggle, move, sfxOn, sfx],
  );

  return (
    <AudioCtx.Provider value={value}>
      <audio
        ref={audioRef}
        src={track.src}
        preload="auto"
        onTimeUpdate={(e) => {
          const el = e.currentTarget;
          setProgress(el.duration ? (el.currentTime / el.duration) * 100 : 0);
        }}
        onEnded={() => go(1)}
        onError={(e) => {
          console.error("Audio element error:", e);
          setPlaying(false);
        }}
      />
      {children}
    </AudioCtx.Provider>
  );
}

export function useAudio() {
  const ctx = useContext(AudioCtx);
  if (!ctx) throw new Error("useAudio must be used inside <AudioProvider>");
  return ctx;
}