import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { SvgGithub } from "../svg-components/svg-github";

const menuItems = [{ text: "Play", path: "/lobby" }];

export const Home: React.FC = () => {
  const navigate = useNavigate()

//Create function outside of app that accepts navigate as callback

//OR

//Create a function outside of react, once that happens pass in prop that has a side effect with useNavigate
  return (
    <div className="home screen">
      <h1 className="home-title">
        <div className="home-icons">
          <SvgGithub />
        </div>
        3D CHESS
      </h1>
      <div className="menu">
        {menuItems.map(({ path, text }, idx) => (
          <div className="menu-item" key={idx}>
            <Link to={path}>
              <button className="menu-btn">{text}</button>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};
