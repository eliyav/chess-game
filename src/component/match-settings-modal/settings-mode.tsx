import React from "react";

interface Props {
  setGameMode: React.Dispatch<React.SetStateAction<boolean>>;
}

const SettingsMode: React.FC<Props> = ({ setGameMode }) => {
  return (
    <div id="gameOptionsMode">
      <p id="gameOptionsMode">Select Mode</p>
      <input
        type="radio"
        id="gameOptionsModeOffline"
        name="mode"
        value="Offline"
        defaultChecked={true}
        onClick={() => setGameMode(false)}
      ></input>
      <label>Offline</label>
      <input
        type="radio"
        id="gameOptionsModeOnline"
        name="mode"
        value="Online"
        onClick={() => setGameMode(true)}
      ></input>
      <label>Online</label>
    </div>
  );
};

export default SettingsMode;
