import React from "react";
import { useNavigate } from "react-router-dom";
import { SvgGithub } from "../svg-components/svg-github";

export const Home: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="home screen">
      <div className="header glass-dark">
        <h1 className="title">3D CHESS</h1>
        <p className="description">Play for free!</p>
        <SvgGithub
          onClick={() => window.open("https://github.com/eliyav/chess-game")}
          className="svg-icon bottom-right"
        />
      </div>
      <div className="footer">
        <button
          className={"btn glass-light"}
          onClick={() => {
            navigate("/lobby");
          }}
        >
          Play
        </button>
      </div>
    </div>
  );
};
