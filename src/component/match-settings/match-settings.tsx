import React, { useRef, useState } from "react";
import SettingsMode from "./settings-mode";
import SettingsTeams from "./settings-teams";
import SettingsTime from "./settings-time";
import "./match-settings.css";

interface FormProps {
  onClose: () => void;
  onSubmit: (formElement: HTMLFormElement) => void;
}

const MatchSettingsModal: React.VFC<FormProps> = ({ onClose, onSubmit }) => {
  const formRef = useRef<HTMLFormElement>(null);
  const [isOnlineGame, setIsOnlineMode] = useState(false);

  return (
    <div className="match-settings-modal">
      <form className="gameOptionsScreen" ref={formRef}>
        <a className="closeBtn" onClick={onClose}>
          &times;
        </a>
        <p className="title">Game Options</p>
        <SettingsMode setGameMode={setIsOnlineMode} />
        {isOnlineGame ? <SettingsTeams /> : null}
        <SettingsTime />
        <button
          className="confirmButton"
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
