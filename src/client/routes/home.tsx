import React from "react";
import { useNavigate } from "react-router-dom";
import { SvgGithub } from "../components/svg/svg-github";
import { SelectionButton } from "../components/buttons/selection-button";
import { APP_ROUTES } from "../../shared/routes";

export const Home: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="grid grid-rows-5 h-dvh select-none md:w-3/4 md:max-w-4xl md:m-auto z-10">
      <div className="m-6">
        <div className="relative glass dark-pane user-select-none p-6 pt-3">
          <h1 className="mb-2 text-6xl md:text-7xl text-white font-bold italic pb-2">
            3D CHESS
          </h1>
          <p className="italic pb-2 pl-2 text-xl font-bold text-white">
            Play for free!
          </p>
          <SvgGithub
            onClick={() => window.open("https://github.com/eliyav/chess-game")}
            className="absolute bg-white rounded-lg right-1 m-2 bottom-1 hover:opacity-80"
            size={30}
          />
        </div>
      </div>
      <SelectionButton
        customClass="m-10 font-serif row-start-5 font-bold text-5xl border-2 border-white italic tracking-widest hover:opacity-80 md:w-1/2 md:justify-self-center"
        text="Play"
        onClick={() => navigate(APP_ROUTES.LOBBY_SELECT)}
      />
    </div>
  );
};
