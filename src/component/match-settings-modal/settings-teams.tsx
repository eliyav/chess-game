import React from "react";

interface Props {}

const SettingsTeams: React.FC<Props> = () => {
  return (
    <div id="gameOptionsTeams">
      <p id="gameOptionsTeamsText">Select team color</p>
      <input
        type="radio"
        id="gameOptionsTeamsWhite"
        name="team"
        value="White"
        defaultChecked={true}
      ></input>
      <label>White</label>
      <input
        type="radio"
        id="gameOptionsTeamsBlack"
        name="team"
        value="Black"
      ></input>
      <label>Black</label>
    </div>
  );
};

export default SettingsTeams;
