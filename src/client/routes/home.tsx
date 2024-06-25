import React from "react";
import { Link } from "react-router-dom";
import { SvgGithub } from "../svg-components/svg-github";

export const Home: React.FC = () => {
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
        <Link className={"btn"} to="/lobby">
          Play
        </Link>
      </div>
    </div>
  );
};
