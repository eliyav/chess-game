import xButtonImg from "../../assets/x.png";
import { Socket } from "socket.io-client";
import { GameMode } from "../app";

export function createGameOptionsScreen(socket: Socket, gameMode: GameMode) {
  const modal = document.createElement("form");
  modal.id = "gameOptionsScreen";

  const exitModal = document.createElement("img");
  exitModal.id = "exitButton";
  exitModal.src = xButtonImg;
  exitModal.addEventListener("click", () => {
    const domApp = document.getElementsByClassName("app");
    domApp[0].removeChild(modal);
  });
  modal.appendChild(exitModal);

  const title = document.createElement("p");
  title.id = "gameOptionsTitle";
  title.innerText = "Game Options";
  modal.appendChild(title);

  //Team Selection
  const teams = document.createElement("div");
  teams.id = "gameOptionsTeams";
  const playersText = document.createElement("p");
  playersText.innerText = `Select team color`;
  playersText.id = "gameOptionsTeamsText";
  teams.appendChild(playersText);
  const radio1 = document.createElement("input");
  radio1.type = "radio";
  radio1.id = "gameOptionsTeamsWhite";
  radio1.name = "team";
  radio1.value = "White";
  radio1.checked = true;
  const label1 = document.createElement("label");
  label1.innerText = "White";
  const radio2 = document.createElement("input");
  radio2.type = "radio";
  radio2.id = "gameOptionsTeamsBlack";
  radio2.name = "team";
  radio2.value = "Black";
  const label2 = document.createElement("label");
  label2.innerText = "Black";
  teams.appendChild(radio1);
  teams.appendChild(radio2);
  radio1.insertAdjacentElement("afterend", label1);
  radio2.insertAdjacentElement("afterend", label2);
  const lineBreak = document.createElement("br");
  radio1.insertAdjacentElement("beforebegin", lineBreak);
  modal.appendChild(teams);

  const timerOptions = document.createElement("div");
  timerOptions.id = "gameOptionsTimer";
  const timerText = document.createElement("p");
  timerText.innerText = `Select Time on Clock`;
  timerText.id = "gameOptionsTimerText";
  timerOptions.appendChild(timerText);
  const radioTimer1 = document.createElement("input");
  radioTimer1.type = "radio";
  radioTimer1.id = "No-Time";
  radioTimer1.name = "time";
  radioTimer1.value = "00";
  radioTimer1.checked = true;
  const radioLabel1 = document.createElement("label");
  radioLabel1.innerText = "Not Timed";
  const radioTimer2 = document.createElement("input");
  radioTimer2.type = "radio";
  radioTimer2.id = "15Minutes";
  radioTimer2.name = "time";
  radioTimer2.value = "15";
  const radioLabel2 = document.createElement("label");
  radioLabel2.innerText = "15 Minutes";
  const radioTimer3 = document.createElement("input");
  radioTimer3.type = "radio";
  radioTimer3.id = "30Minutes";
  radioTimer3.name = "time";
  radioTimer3.value = "30";
  const radioLabel3 = document.createElement("label");
  radioLabel3.innerText = "30 Minutes";
  timerOptions.appendChild(radioTimer1);
  timerOptions.appendChild(radioTimer2);
  timerOptions.appendChild(radioTimer3);
  radioTimer1.insertAdjacentElement("afterend", radioLabel1);
  radioTimer2.insertAdjacentElement("afterend", radioLabel2);
  radioTimer3.insertAdjacentElement("afterend", radioLabel3);
  modal.appendChild(timerOptions);

  //Player Status/Confirmation
  const confirmation = document.createElement("div");
  confirmation.id = "gameOptionsConfirmation";
  const playerConfirm = document.createElement("button");
  playerConfirm.textContent = "Create Room!";
  playerConfirm.type = "submit";
  confirmation.appendChild(playerConfirm);
  modal.appendChild(confirmation);

  //Invite Code
  const inviteCode = document.createElement("div");
  inviteCode.style.display = "none";
  inviteCode.id = "gameOptionsInviteCode";
  inviteCode.innerText = `Your Invite Code:`;
  const inviteCodeText = document.createElement("p");
  inviteCodeText.innerText = "";
  inviteCodeText.id = "gameOptionsInviteCodeText";
  inviteCode.appendChild(inviteCodeText);
  modal.appendChild(inviteCode);

  if (document.getElementById("gameOptionsScreen") === null) {
    const domApp = document.getElementsByClassName("app");
    domApp[0].appendChild(modal); //
  }
}
