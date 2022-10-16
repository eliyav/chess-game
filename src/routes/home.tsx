import React from "react";
import { Link } from "react-router-dom";
import { SvgGithub } from "../component/svg/svg-github";

const menuItems = [
  // { text: "Login", path: "" },
  { text: "Play", path: "/lobby" },
];

export const Home: React.FC = () => {
  return (
    <div className="home screen">
      <h1 className="home-title">
        <div className="home-icons">
          <SvgGithub />
        </div>
        3D CHESS
      </h1>
      <div className="menu">
        {menuItems.map(({ path, text }) => (
          <div className="menu-item">
            <Link to={path}>
              <button className="menu-btn">{text}</button>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};
