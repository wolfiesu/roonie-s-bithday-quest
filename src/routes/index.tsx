import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { MusicPlayer } from "@/game/MusicPlayer";
import { AudioProvider } from "@/game/audio";
import { TitleScreen } from "@/game/screens/TitleScreen";
import { CakeMission } from "@/game/screens/CakeMission";
import { BouquetMission } from "@/game/screens/BouquetMission";
import { CardReveal } from "@/game/screens/CardReveal";
import { GameOverScreen } from "@/game/screens/GameOverScreen";
import { SettingsScreen } from "@/game/screens/SettingsScreen";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Roonie's Birthday Quest — a pixel game by sou" },
      {
        name: "description",
        content:
          "Bake the cake, build the bouquet and open the card in Roonie's Birthday Quest, a pastel retro pixel game with a playlist made just for her.",
      },
      { property: "og:title", content: "Roonie's Birthday Quest" },
      {
        property: "og:description",
        content: "A pastel pixel birthday quest with a playlist made just for her.",
      },
    ],
  }),
  component: Game,
});

type Screen = "title" | "cake" | "bouquet" | "card" | "settings" | "gameover";

function Game() {
  const [screen, setScreen] = useState<Screen>("title");

  return (
    <AudioProvider>
      <main className="mx-auto flex min-h-screen w-full max-w-[520px] flex-col bg-sky">
        <div className="flex flex-1 flex-col">
          {screen === "title" && (
            <TitleScreen onPlay={() => setScreen("cake")} onSettings={() => setScreen("settings")} />
          )}
          {screen === "settings" && <SettingsScreen onBack={() => setScreen("title")} />}
          {screen === "cake" && (
            <CakeMission onNext={() => setScreen("bouquet")} onHome={() => setScreen("title")} />
          )}
          {screen === "bouquet" && (
            <BouquetMission onNext={() => setScreen("card")} onHome={() => setScreen("title")} />
          )}
          {/* the card leads to the final screen — game over is the last stop */}
          {screen === "card" && <CardReveal onHome={() => setScreen("gameover")} />}
          {screen === "gameover" && (
            <GameOverScreen onStart={() => setScreen("cake")} onBack={() => setScreen("title")} />
          )}
        </div>

        {/* sticky player — present on every screen */}
        <div className="fixed inset-x-0 bottom-0 z-50 mx-auto w-full max-w-[520px]">
          <MusicPlayer />
        </div>
      </main>
    </AudioProvider>
  );
}
