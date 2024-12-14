import React from "react";
import { useNavigate } from "react-router-dom";
import { SvgGithub } from "../components/svg/svg-github";
import { SelectionButton } from "../components/buttons/start-button";
import { APP_ROUTES } from "../../shared/routes";

export const Home: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="grid grid-rows-5 h-dvh md:w-1/2 md:m-auto">
      <div className="relative glass dark-pane user-select-none p-6 m-6">
        <h1 className="text-5xl md:text-6xl text-white font-bold italic pb-2">
          3D CHESS
        </h1>
        <p className="italic pb-2 text-white">Play for free!</p>
        <SvgGithub
          onClick={() => window.open("https://github.com/eliyav/chess-game")}
          className="absolute bg-white rounded-lg right-1 bottom-1 hover:opacity-80"
        />
      </div>
      <SelectionButton
        customClass="m-10 row-start-5 font-bold text-2xl border-2 border-white italic tracking-widest hover:opacity-80 md:w-1/2 md:justify-self-center"
        text="Play"
        onClick={() => navigate(APP_ROUTES.Lobby)}
      />
    </div>
  );
};
