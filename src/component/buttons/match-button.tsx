import React from "react";
import { Link } from "react-router-dom";

interface MatchBtnProps {
  text: string;
  path: string;
}

export const MatchButton: React.FC<MatchBtnProps> = ({ text, path }) => {
  return (
    <div className="menu-item">
      <Link to={path}>
        <button className="menu-btn">{text}</button>
      </Link>
    </div>
  );
};
