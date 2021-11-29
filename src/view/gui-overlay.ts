import { App } from "../app";
import Game from "../game";
import { renderScene } from "../helper/canvas-helpers";
import { CustomScene } from "./start-screen";
import x from "../../assets/x.png";

const canvas = document.getElementById("renderCanvas") as HTMLCanvasElement;
const gameOverlay = document.getElementById("gameOverlay") as HTMLDivElement;
const homeButton = document.getElementById("home") as HTMLButtonElement;
const startOGButton = document.getElementById("startOG") as HTMLButtonElement;
const createOnlineMatch = document.getElementById(
  "createOnlineMatch"
) as HTMLButtonElement;
const joinOnlineMatch = document.getElementById(
  "joinOnlineMatch"
) as HTMLButtonElement;
const resetBoardButton = document.getElementById(
  "resetBoard"
) as HTMLButtonElement;
const resetCameraButton = document.getElementById(
  "camera"
) as HTMLButtonElement;
const undoMoveButton = document.getElementById("undo") as HTMLButtonElement;
const pauseButton = document.getElementById("pause") as HTMLButtonElement;

function setGUI(app: App) {
  const {
    game,
    gameMode,
    showScene,
    emitter,
    socket,
    scenes: { startScene, gameScene },
  } = app;

  const camera: any = gameScene.cameras[0];
  homeButton.addEventListener("click", () => {
    camera.alpha = Math.PI;
    gameScene.detachControl();
    showDisplay();
    showScene.index === 0 ? (showScene.index = 1) : (showScene.index = 0);
  });

  startOGButton.addEventListener("click", () => {
    gameMode.mode = "offline";
    game.resetGame();
    renderScene(game, gameScene);
    hideDisplay();
    startScene.detachControl();
    showScene.index === 0 ? (showScene.index = 1) : (showScene.index = 0);
  });

  createOnlineMatch.addEventListener("click", () => {
    createGameOptionsScreen();

    function createGameOptionsScreen() {
      const modal = document.createElement("form");
      modal.id = "gameOptionsScreen";

      const exitModal = document.createElement("img");
      exitModal.id = "exitButton";
      exitModal.src = x;
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

    let formEle = document.getElementById(
      "gameOptionsScreen"
    ) as HTMLFormElement;
    formEle.addEventListener("submit", (e) => {
      e.preventDefault();
      let form = new FormData(formEle);
      const team = form.get("team")?.toString();
      const time = form.get("time")?.toString();
      let clockTime;
      if (time) {
        clockTime = 60 * parseInt(time);
      }
      gameMode.mode = "online";
      gameMode.time = clockTime;
      gameMode.player = team;
      socket.emit("create-room", gameMode);
    });
  });

  joinOnlineMatch.addEventListener("click", () => {
    gameMode.mode = "online";
    let room = prompt("Please enter the room key");
    socket.emit("join-room", room);
  });

  resetBoardButton.addEventListener("click", () => {
    emitter!.emit("reset-board");
  });

  resetCameraButton.addEventListener("click", () => {
    resetCamera(game, gameScene);
  });

  undoMoveButton.addEventListener("click", () => {
    game.undoTurn();
    renderScene(game, gameScene);
    resetCamera(game, gameScene);
  });

  pauseButton.addEventListener("click", () => {
    pauseButton.innerHTML === "Pause"
      ? (pauseButton.innerHTML = "Paused")
      : (pauseButton.innerHTML = "Pause");
    if (gameMode.mode === "online") {
      if (gameMode.player === game.state.currentPlayer) {
        game.timer.pauseTimer();
        emitter!.emit("pause-game", game.state.currentPlayer);
      }
    } else {
      game.timer.pauseTimer();
    }
  });

  const resetCamera = (game: Game, gameScene: CustomScene) => {
    let camera: any = gameScene.cameras[0];
    if (game.state.currentPlayer === "Black") {
      camera.alpha = 0;
      camera.beta = Math.PI / 4;
      camera.radius = 35;
    } else {
      camera.alpha = Math.PI;
      camera.beta = Math.PI / 4;
      camera.radius = 35;
    }
  };
}

const hideDisplay = () => {
  startOGButton.style.display = "none";
  createOnlineMatch.style.display = "none";
  joinOnlineMatch.style.display = "none";
  gameOverlay.style.display = "unset";
};

const showDisplay = () => {
  gameOverlay.style.display = "none";
  startOGButton.style.display = "unset";
  createOnlineMatch.style.display = "unset";
  joinOnlineMatch.style.display = "unset";
};

export { setGUI, hideDisplay, showDisplay };
