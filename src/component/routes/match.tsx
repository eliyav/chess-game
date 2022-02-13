import React from "react";
import { Link } from "react-router-dom";
import { MenuButton } from "../buttons/menu-button";
import MatchSettingsModal from "../match-settings/match-settings";

interface MatchesProps {
  openNavbar: React.Dispatch<React.SetStateAction<boolean>>;
}

export const Matches: React.FC<MatchesProps> = ({ openNavbar }) => {
  return (
    <div className="matches screen">
      <MenuButton open={openNavbar} />
      <button>
        <Link to="/game">Create Offline Match</Link>;
      </button>

      <MatchSettingsModal
        onClose={() => {}}
        onSubmit={(formElement) => {
          let form = new FormData(formElement);
          const mode = form.get("mode")?.toString();
          const player = form.get("team")?.toString();
          const clockTime = form.get("time")?.toString();
          let time;
          if (clockTime) {
            time = 60 * parseInt(clockTime);
          }
          const options = {
            mode,
            time,
            player,
          };
          //   emitter.emit("create-match", options);
        }}
      />
    </div>
  );
};
