import React from "react";

const menuItems = ["Login", "Play"];

//add to the play button
// background: #007e008f;

export const Home: React.FC = () => {
  return (
    <div className="home screen">
      <h1 className="home-title">3D CHESS</h1>
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
