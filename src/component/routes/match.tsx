import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import { MatchButton } from "../buttons/match-button";
import { MenuButton } from "../buttons/menu-button";

interface MatchesProps {
  openNavbar: React.Dispatch<React.SetStateAction<boolean>>;
}

export const Matches: React.FC<MatchesProps> = ({ openNavbar }) => {
  const [showSelections, setShowSelections] = useState(true);

  return (
    <div className="matches screen">
      <MenuButton open={openNavbar} />
      {showSelections && (
        <div className="selections">
          <p className="page-title">Select match:</p>
          <div className="divider"></div>
          <MatchButton
            name="Offline Match"
            path="./offline-lobby"
            description="Create an offline PvP match"
            onSelect={() => setShowSelections(false)}
          />
          <MatchButton
            name="Create Online"
            path="./online-lobby"
            description="Create an online room to invite a friend to a PvP match"
            onSelect={() => setShowSelections(false)}
          />
          <MatchButton
            name="Join Online"
            path="./"
            description="Join a friend with an online code that was sent to you"
            onSelect={() => setShowSelections(false)}
          />
        </div>
      )}
      {!showSelections && <Outlet></Outlet>}
    </div>
  );
};
