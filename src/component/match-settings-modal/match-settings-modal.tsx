import React, { useRef, useState } from "react";
import EventEmitter from "../../events/event-emitter";
import SettingsMode from "./settings-mode";
import SettingsTeams from "./settings-teams";
import SettingsTime from "./settings-time";

interface Props {
  emitter: EventEmitter;
  setMatchSettings: React.Dispatch<React.SetStateAction<boolean>>;
}

const MatchSettingsModal: React.FC<Props> = ({ emitter, setMatchSettings }) => {
  const formRef = useRef<HTMLFormElement>(null);
  const [isOnlineGame, setIsOnlineMode] = useState(false);

  const formSubmitEvent = () => {
    let form = new FormData(formRef.current!);
    const mode = form.get("mode")?.toString();
    const team = form.get("team")?.toString();
    const time = form.get("time")?.toString();
    let clockTime;
    if (time) {
      clockTime = 60 * parseInt(time);
    }
    const options = {
      mode,
      clockTime,
      team,
    };
    emitter.emit("create-match", options);
    isOnlineGame ? null : setMatchSettings(false);
  };

  return (
    <div id="match-settings-modal">
      <form id="gameOptionsScreen" ref={formRef}>
        <a
          className="closebtn"
          onClick={() => {
            setMatchSettings(false);
          }}
        >
          &times;
        </a>
        <p id="gameOptionsTitle">Game Options</p>
        <SettingsMode setGameMode={setIsOnlineMode} />
        {isOnlineGame ? <SettingsTeams /> : null}
        <SettingsTime />
        <div id="gameOptionsInviteCode">
          <p id="gameOptionsInviteCodeText"></p>
        </div>
        <button
          id="gameOptionsConfirmation"
          onClick={(e) => {
            e.preventDefault();
            formSubmitEvent();
          }}
        >
          Create Room!
        </button>
      </form>
    </div>
  );
};

export default MatchSettingsModal;
