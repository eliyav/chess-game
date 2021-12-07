import React, { useRef, useState } from "react";
import EventEmitter from "../events/event-emitter";
import { App } from "./chess-app";

interface Props {
  chessApp: App;
  emitter: EventEmitter;
  setMatchSettings: React.Dispatch<React.SetStateAction<boolean>>;
}

const MatchSettingsModal: React.FC<Props> = ({
  chessApp,
  emitter,
  setMatchSettings,
}) => {
  const formRef = useRef<HTMLFormElement>(null);
  const [isOnlineMode, setIsOnlineMode] = useState(false);

  return (
    <div className="match-settings-modal">
      <form
        id="gameOptionsScreen"
        ref={formRef}
        onSubmit={(e) => {
          e.preventDefault();
          let form = new FormData(formRef.current!);
          const team = form.get("team")?.toString();
          const time = form.get("time")?.toString();
          let clockTime;
          if (time) {
            clockTime = 60 * parseInt(time);
          }
          chessApp.gameMode.mode = "online";
          chessApp.gameMode.time = clockTime;
          chessApp.gameMode.player = team;
          //socket.emit("create-room", chessApp.gameMode);
        }}
      >
        <a
          className="closebtn"
          onClick={() => {
            setMatchSettings(false);
          }}
        >
          &times;
        </a>
        <p id="gameOptionsTitle">Game Options</p>
        <div id="gameOptionsMode">
          <p id="gameOptionsMode">Select Mode</p>
          <input
            type="radio"
            id="gameOptionsModeOffline"
            name="mode"
            value="Offline"
          ></input>
          <label>Offline</label>
          <input
            type="radio"
            id="gameOptionsModeOnline"
            name="mode"
            value="Online"
          ></input>
          <label>Online</label>
        </div>
        <div id="gameOptionsTeams">
          <p id="gameOptionsTeamsText">Select team color</p>
          <input
            type="radio"
            id="gameOptionsTeamsWhite"
            name="team"
            value="White"
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
        <div id="gameOptionsTimer">
          <p id="gameOptionsTimerText">Select Time on Clock</p>
          <input type="radio" id="No-Time" name="time" value="00"></input>
          <label>Not Timed</label>
          <input type="radio" id="15Minutes" name="time" value="15"></input>
          <label>15 Minutes</label>
          <input type="radio" id="30Minutes" name="time" value="30"></input>
          <label>30 Minutes</label>
        </div>
        <div id="gameOptionsConfirmation">
          <button type="submit">Create Room!</button>
        </div>
        <div id="gameOptionsInviteCode">
          <p id="gameOptionsInviteCodeText"></p>
        </div>
      </form>
    </div>
  );
};

export default MatchSettingsModal;
