import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { SvgGithub } from "../svg-components/svg-github";

export const Home: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="home screen">
      <div className="header">
        <h1 className="title">3D CHESS</h1>
        <p className="description">Play for free!</p>
      </div>
      <div className="icons">
        <SvgGithub className="svg-icon" />
      </div>
      <div className="footer">
        <button onClick={() => navigate("/lobby")} className="btn">
          Play
        </button>
      </div>
    </div>
  );
};
