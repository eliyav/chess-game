import React from "react";

interface Props {}
//Update to react function in progress
const CreateMatchModal: React.FC<Props> = () => {
  return (
    <form
      id="gameOptionsScreen"
      onSubmit={(e) => {
        // e.preventDefault();
        // let form = new FormData(formEle);
        // const team = form.get("team")?.toString();
        // const time = form.get("time")?.toString();
        // let clockTime;
        // if (time) {
        //   clockTime = 60 * parseInt(time);
        // }
        // chessRef!.current!.gameMode.mode = "online";
        // chessRef!.current!.gameMode.time = clockTime;
        // chessRef!.current!.gameMode.player = team;
        // chessRef!.current!.socket.emit(
        //   "create-room",
        //   chessRef!.current!.gameMode
        // );
      }}
    >
      <a id="exitButton"></a>
      <p id="gameOptionsTitle">Game Options</p>
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
        Your Invite Code:<p id="gameOptionsInviteCodeText">HCCJD</p>
      </div>
    </form>
  );
};

export default CreateMatchModal;
