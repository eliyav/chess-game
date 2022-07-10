import React from "react";
import { MatchButton } from "../component/buttons/match-button";

export const Matches: React.FC = () => {
  return (
    <div className="matches screen">
      <div className="selections">
        <h1 className="page-title">Select match:</h1>
        <MatchButton
          name="Offline Match"
          path="./offline-lobby"
          description="Create an offline PvP match"
          onSelect={() => {}}
        />
        <MatchButton
          name="Create Online"
          path="./online-lobby"
          description="Create an online room to invite a friend to a PvP match"
          onSelect={() => {}}
        />
        <MatchButton
          name="Join Online"
          path="./join-lobby"
          description="Join a friend with an online code that was sent to you"
          onSelect={() => {}}
        />
      </div>
    </div>
  );
};
