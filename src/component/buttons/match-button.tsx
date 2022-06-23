import React from "react";
import { Link } from "react-router-dom";

interface MatchBtnProps {
  name: string;
  path: string;
  description: string;
  onSelect: () => void;
}

export const MatchButton: React.FC<MatchBtnProps> = ({
  name,
  path,
  description,
  onSelect,
}) => {
  return (
    <>
      <Link to={path}>
        <button className="btn" onClick={onSelect}>
          {name}
        </button>
      </Link>
      <p>{description}</p>
    </>
  );
};
