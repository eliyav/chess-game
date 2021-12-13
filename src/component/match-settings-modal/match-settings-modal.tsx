import React, { useRef, useState } from "react";
import SettingsMode from "./settings-mode";
import SettingsTeams from "./settings-teams";
import SettingsTime from "./settings-time";

interface FormProps {
  onClose: () => void;
  onSubmit: (formElement: HTMLFormElement) => void;
}

const MatchSettingsModal: React.VFC<FormProps> = ({ onClose, onSubmit }) => {
  const formRef = useRef<HTMLFormElement>(null);
  const [isOnlineGame, setIsOnlineMode] = useState(false);

  return (
    <div id="match-settings-modal">
      <form id="gameOptionsScreen" ref={formRef}>
        <a className="closebtn" onClick={() => onClose()}>
          &times;
        </a>
        <p id="gameOptionsTitle">Game Options</p>
        <SettingsMode setGameMode={setIsOnlineMode} />
        {isOnlineGame ? <SettingsTeams /> : null}
        <SettingsTime />
        <button
          id="gameOptionsConfirmation"
          onClick={(e) => {
            e.preventDefault();
            onSubmit(formRef.current!);
          }}
        >
          Create Room!
        </button>
      </form>
    </div>
  );
};

export default MatchSettingsModal;
