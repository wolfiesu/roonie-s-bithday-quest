import shokolatak from "@/assets/music/shokolatak.m4a.asset.json";
import breatheDeeper from "@/assets/music/breathe-deeper.mp3.asset.json";
import maggots from "@/assets/music/maggots-for-brains.mp3.asset.json";
import stay from "@/assets/music/stay-at-your-house.mp3.asset.json";
import harvey from "@/assets/music/harvey.mp3.asset.json";
import sweetBoy from "@/assets/music/sweet-boy.mp3.asset.json";

export type Track = {
  title: string;
  artist: string;
  src: string;
};

/** Roonie's playlist — a playlist sou made for her. */
export const TRACKS: Track[] = [
  { title: "شيوكلونك شكر", artist: "بنوته خبله", src: shokolatak.url },
  { title: "Breathe Deeper", artist: "Tame Impala", src: breatheDeeper.url },
  { title: "maggots for brains", artist: "Olivia Rodrigo", src: maggots.url },
  { title: "I Really Want to Stay at Your House", artist: "Rosa Walton", src: stay.url },
  { title: "Harvey", artist: "Her's", src: harvey.url },
  { title: "Sweet Boy", artist: "Malcolm Todd", src: sweetBoy.url },
];
