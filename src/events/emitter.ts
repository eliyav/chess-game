import EventEmitter from "./event-emitter";
import { renderScene, rotateCamera } from "../helper/canvas-helpers";
import { App } from "../component/app";

const activateEmitter = (app: App): EventEmitter => {
  const {
    game,
    gameMode,
    showScene,
    socket,
    scenes: { startScene, gameScene },
  } = app;

  const emitter = new EventEmitter();

  emitter.on("playerMove", (originPoint: Point, targetPoint: Point) => {
    renderScene(game, gameScene);
    const resolved = game.playerMove(originPoint!, targetPoint!);
    if (resolved) {
      if (gameMode.mode === "offline") {
        game.switchTurn();
        renderScene(game, gameScene);
        rotateCamera(game.state.currentPlayer, gameScene);
      } else if (gameMode.mode === "online") {
        const room = gameMode.room;
        renderScene(game, gameScene);
        game.switchTurn();
        socket.emit("stateChange", { originPoint, targetPoint, room });
      }
    }
    game.moves.length = 0;
  });

  emitter.on("reset-board", () => {
    const answer = confirm("Are you sure you want to reset the board?");
    if (answer) {
      if (gameMode.mode === "online") {
        socket.emit("reset-board", gameMode);
      } else {
        game.resetGame(gameMode.time);
        renderScene(game, gameScene);
        let camera: any = gameScene.cameras[0];
        camera.alpha = Math.PI;
      }
    }
  });

  emitter.on("pause-game", (currentPlayer: string) => {
    let time;
    if (currentPlayer === "White") {
      time = game.timer.timer1;
    } else {
      time = game.timer.timer2;
    }
    socket.emit("pause-game", { gameMode, currentPlayer, time });
  });

  emitter.on("undo-move", () => {
    if (gameMode.mode === "online") {
      if (gameMode.player !== game.state.currentPlayer) {
        const lastTurn = game.turnHistory.at(-1);
        if (lastTurn !== undefined) {
          socket.emit("undo-move", gameMode);
        }
      }
    } else {
      game.undoTurn();
      renderScene(game, gameScene);
      emitter.emit("reset-camera");
    }
  });

  emitter.on("start-match", (mode: string) => {
    gameMode.mode = mode;
    game.resetGame(gameMode.time);
    renderScene(game, gameScene);
    startScene.detachControl();
    showScene.index = 1;
  });

  emitter.on("reset-camera", () => {
    let camera: any = gameScene.cameras[0];
    if (gameMode.mode === "online") {
      gameMode.player === "White" ? setToWhitePlayer() : setToBlackPlayer();
    } else {
      game.state.currentPlayer === "White"
        ? setToWhitePlayer()
        : setToBlackPlayer();
    }

    function setToWhitePlayer() {
      camera.alpha = Math.PI;
      camera.beta = Math.PI / 4;
      camera.radius = 40;
    }

    function setToBlackPlayer() {
      camera.alpha = 0;
      camera.beta = Math.PI / 4;
      camera.radius = 60;
    }
  });

  emitter.on("home-screen", () => {
    let camera: any = gameScene.cameras[0];
    camera.alpha = Math.PI;
    gameScene.detachControl();
    showScene.index = 0;
  });

  emitter.on("start-online-match", () => {
    //Rework with react
    createGameOptionsScreen();

    function createGameOptionsScreen() {
      const modal = document.createElement("form");
      modal.id = "gameOptionsScreen";

      const exitModal = document.createElement("a");
      exitModal.id = "exitButton";
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

  // joinOnlineMatch.addEventListener("click", () => {
  //   gameMode.mode = "online";
  //   let room = prompt("Please enter the room key");
  //   socket.emit("join-room", room);
  // });

  // pauseButton.addEventListener("click", () => {
  //   pauseButton.innerHTML === "Pause"
  //     ? (pauseButton.innerHTML = "Paused")
  //     : (pauseButton.innerHTML = "Pause");
  //   if (gameMode.mode === "online") {
  //     if (gameMode.player === game.state.currentPlayer) {
  //       game.timer.pauseTimer();
  //       emitter!.emit("pause-game", game.state.currentPlayer);
  //     }
  //   } else {
  //     game.timer.pauseTimer();
  //   }
  // });

  return emitter;
};

export default activateEmitter;
