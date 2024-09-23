import React from "react";
import { useNavigate } from "react-router-dom";
import { SvgGithub } from "../components/svg/svg-github";
import { SelectionButton } from "../components/buttons/start-button";

export const Home: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="flex-column space-between h-100">
      <div className="header glass-dark">
        <h1 className="title">3D CHESS</h1>
        <p className="description">Play for free!</p>
        <SvgGithub
          onClick={() => window.open("https://github.com/eliyav/chess-game")}
          className="svg-icon bottom-right"
        />
      </div>
      <SelectionButton
        customClass="mgn-1"
        text="Play"
        onClick={() => navigate("/lobby")}
      />
    </div>
  );
};
