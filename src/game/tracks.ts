import shokolatak from "@/assets/music/shokolatak.m4a";
import breatheDeeper from "@/assets/music/breathe-deeper.mp3";
import maggots from "@/assets/music/maggots-for-brains.mp3";
import stay from "@/assets/music/stay-at-your-house.mp3";
import harvey from "@/assets/music/harvey.mp3";
import sweetBoy from "@/assets/music/sweet-boy.mp3";

export type Track = {
  title: string;
  artist: string;
  src: string;
};

/** Roonie's playlist — a playlist you made for her. */
export const TRACKS: Track[] = [
  { title: "شيوكلونك شكر", artist: "بنوته خبله", src: "/music/shokolatak.m4a" },
  { title: "Breathe Deeper", artist: "Tame Impala", src: "/music/breathe-deeper.mp3" },
  { title: "maggots for brains", artist: "Olivia Rodrigo", src: "/music/maggots-for-brains.mp3" },
  { title: "I Really Want to Stay at Your House", artist: "Rosa Walton", src: "/music/stay-at-your-house.mp3" },
  { title: "Harvey", artist: "Her's", src: "/music/harvey.mp3" },
  { title: "Sweet Boy", artist: "Malcolm Todd", src: "/music/sweet-boy.mp3" },
];