import React from "react";

const menuItems = ["Play", "Options", "Login"];

export const Home: React.FC = () => {
  return (
    <div className="home screen">
      <h1 className="home-title">CHESS</h1>
      <div className="menu">
        {menuItems.map((item) => (
          <div className="menu-item">
            <button>{item}</button>
          </div>
        ))}
      </div>
    </div>
  );
};
