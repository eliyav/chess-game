import React, { useRef, useState } from "react";

interface ModeProps {
  setGameMode: React.Dispatch<React.SetStateAction<boolean>>;
}

const SettingsMode: React.FC<ModeProps> = ({ setGameMode }) => {
  const [isDefaultChecked, setIsDefaultChecked] = useState(true);
  const offlineRef = useRef<HTMLInputElement>(null);
  const onlineRef = useRef<HTMLInputElement>(null);

  return (
    <div className="subsection">
      <p>Select Mode</p>
      <input
        ref={offlineRef}
        type="radio"
        name="mode"
        value="Offline"
        defaultChecked={true}
        className="hide"
      ></input>
      <label
        className={isDefaultChecked === true ? "option highlighted" : "option"}
        onClick={() => {
          offlineRef.current!.checked = true;
          setIsDefaultChecked(true);
          setGameMode(false);
        }}
      >
        Offline
      </label>
      <input
        ref={onlineRef}
        type="radio"
        name="mode"
        value="Online"
        className="hide"
      ></input>
      <label
        className={isDefaultChecked === false ? "option highlighted" : "option"}
        onClick={() => {
          onlineRef.current!.checked = true;
          setIsDefaultChecked(false);
          setGameMode(true);
        }}
      >
        Online
      </label>
    </div>
  );
};

export default SettingsMode;
