import React from "react";
import { useNavigate } from "react-router-dom";
import { BackButton } from "../component/buttons/back-button";
import { MatchButton } from "../component/buttons/match-button";

const matchButtons = [
  {
    text: "Offline Match",
    path: "./offline-lobby",
    description: "Create an offline PvP match",
  },
  {
    text: "Create Online",
    path: "./online-lobby",
    description: "Create an online room to invite a friend to a PvP match",
  },
  {
    text: "Join Online",
    path: "./join-lobby",
    description: "Join a friend with an online code that was sent to you",
  },
];

export const Matches: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="matches screen">
      <h1 className="sub-title">Match</h1>
      <div className="menu">
        {matchButtons.map(({ text, path }) => (
          <MatchButton text={text} path={path} />
        ))}
        <BackButton onClick={() => navigate(-1)} />
      </div>
    </div>
  );
};
