// Pixel-art sprite URLs (CDN-hosted).
import azucar from "@/assets/azucar.png.asset.json";
import balloons from "@/assets/balloons.png.asset.json";
import bouquet from "@/assets/bouquet.png.asset.json";
import bow from "@/assets/bow.png.asset.json";
import bowlBatter from "@/assets/bowl_batter.png.asset.json";
import bowlEmpty from "@/assets/bowl_empty.png.asset.json";
import cacao from "@/assets/cacao.png.asset.json";
import cakeDecorated from "@/assets/cake_decorated.png.asset.json";
import cakePlain from "@/assets/cake_plain.png.asset.json";
import cakeSlice from "@/assets/cake_slice.png.asset.json";
import candle from "@/assets/candle.png.asset.json";
import cdPlayer from "@/assets/cd_player.png.asset.json";
import cherries from "@/assets/cherries.png.asset.json";
import envelopeClosed from "@/assets/envelope_closed.png.asset.json";
import envelopeOpen from "@/assets/envelope_open.png.asset.json";
import flowerBlue from "@/assets/flower_blue.png.asset.json";
import flowerYellow from "@/assets/flower_yellow.png.asset.json";
import frosting from "@/assets/frosting.png.asset.json";
import gameoverBg from "@/assets/gameover_bg.png.asset.json";
import girl from "@/assets/girl.png.asset.json";
import happyBirthday from "@/assets/happy_birthday.png.asset.json";
import harina from "@/assets/harina.png.asset.json";
import huevos from "@/assets/huevos.png.asset.json";
import kitchenBg from "@/assets/kitchen_bg.png.asset.json";
import leche from "@/assets/leche.png.asset.json";
import oven from "@/assets/oven.png.asset.json";
import shelf from "@/assets/shelf.png.asset.json";
import whisk from "@/assets/whisk.png.asset.json";
import liliesPink from "@/assets/lilies_pink.png.asset.json";
import liliesStem from "@/assets/lilies_stem.png.asset.json";
import lilyPeach from "@/assets/lily_peach.png.asset.json";
import lilyValley from "@/assets/lily_valley.png.asset.json";
import lilyWhite from "@/assets/lily_white.png.asset.json";
import pug from "@/assets/pug.png.asset.json";
import spoon from "@/assets/spoon.png.asset.json";
import sprinkles from "@/assets/sprinkles.png.asset.json";
import strawberry from "@/assets/strawberry.png.asset.json";

export const SPR = {
  azucar: azucar.url,
  balloons: balloons.url,
  bouquet: bouquet.url,
  bow: bow.url,
  bowlBatter: bowlBatter.url,
  bowlEmpty: bowlEmpty.url,
  cacao: cacao.url,
  cakeDecorated: cakeDecorated.url,
  cakePlain: cakePlain.url,
  cakeSlice: cakeSlice.url,
  candle: candle.url,
  cdPlayer: cdPlayer.url,
  cherries: cherries.url,
  envelopeClosed: envelopeClosed.url,
  envelopeOpen: envelopeOpen.url,
  flowerBlue: flowerBlue.url,
  flowerYellow: flowerYellow.url,
  frosting: frosting.url,
  gameoverBg: gameoverBg.url,
  girl: girl.url,
  happyBirthday: happyBirthday.url,
  harina: harina.url,
  huevos: huevos.url,
  kitchenBg: kitchenBg.url,
  leche: leche.url,
  oven: oven.url,
  shelf: shelf.url,
  whisk: whisk.url,
  liliesPink: liliesPink.url,
  liliesStem: liliesStem.url,
  lilyPeach: lilyPeach.url,
  lilyValley: lilyValley.url,
  lilyWhite: lilyWhite.url,
  pug: pug.url,
  spoon: spoon.url,
  sprinkles: sprinkles.url,
  strawberry: strawberry.url,
} as const;

/* --- newer sprites imported directly (raw png assets) --- */
import cakeBase from "@/assets/cake_base.png";
import cdDisc from "@/assets/cd_disc.png";
import wrapBack from "@/assets/wrap_back.png";
import wrapFront from "@/assets/wrap_front.png";
import flour from "@/assets/flour.png";
import sugar from "@/assets/sugar.png";
import cocoa from "@/assets/cocoa.png";
import milk from "@/assets/milk.png";

export const SPR2 = {
  cakeBase,
  cdDisc,
  wrapBack,
  wrapFront,
  flour,
  sugar,
  cocoa,
  milk,
} as const;
