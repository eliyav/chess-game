import React from "react";

interface Props {}

const SettingsTime: React.FC<Props> = () => {
  return (
    <div id="gameOptionsTimer">
      <p id="gameOptionsTimerText">Select Time on Clock (Minutes)</p>
      <input
        type="radio"
        id="No-Time"
        name="time"
        value="00"
        defaultChecked={true}
      ></input>
      <label>Not Timed</label>
      <input type="radio" id="15Minutes" name="time" value="15"></input>
      <label>15</label>
      <input type="radio" id="30Minutes" name="time" value="30"></input>
      <label>30</label>
    </div>
  );
};

export default SettingsTime;
