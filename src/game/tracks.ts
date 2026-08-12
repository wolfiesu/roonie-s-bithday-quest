import shoklonkMusic from "../music/shoklonk.m4a";
import ladygirlMusic from "../music/ladygirl.mp3";
import maggotsMusic from "../music/maggots-for-brains.mp3";
import breatheMusic from "../music/breathe-deeper.mp3";
import stayMusic from "../music/i-really-want-to-stay.mp3";
import lightsMusic from "../music/bts-lights.mp3";
import harveyMusic from "../music/hers-harvey.mp3";
import stupidMusic from "../music/stupid-song.mp3";
import faceMusic from "../music/i-saw-your-face.mp3";

export type Track = {
  title: string;
  artist: string;
  src: string;
};

export const TRACKS: Track[] = [
  {
    title: "شيوكلونك شكر",
    artist: "بنوته خبله",
    src: shoklonkMusic,
  },
  {
    title: "Ladygirl",
    artist: "Malcolm Todd",
    src: ladygirlMusic,
  },
  {
    title: "Maggots For Brains",
    artist: "Olivia Rodrigo",
    src: maggotsMusic,
  },
  {
    title: "Breathe Deeper",
    artist: "Tame Impala",
    src: breatheMusic,
  },
  {
    title: "I Really Want to Stay At Your House",
    artist: "Rosa Walton",
    src: stayMusic,
  },
  {
    title: "Lights",
    artist: "BTS",
    src: lightsMusic,
  },
  {
    title: "Harvey",
    artist: "Her's",
    src: harveyMusic,
  },
  {
    title: "Stupid Song",
    artist: "Olivia Rodrigo",
    src: stupidMusic,
  },
  {
    title: "I Saw Your Face",
    artist: "Malcolm Todd",
    src: faceMusic,
  },
];