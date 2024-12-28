import { ArcRotateCamera } from "@babylonjs/core/Cameras/arcRotateCamera";
import { PickingInfo } from "@babylonjs/core/Collisions/pickingInfo";
import { IPointerEvent } from "@babylonjs/core/Events/deviceInputEvents";
import type { Nullable } from "@babylonjs/core/types";
import { GAMESTATUS, Point, Turn } from "../../shared/game";
import { ControllerOptions, LOBBY_TYPE, TEAM } from "../../shared/match";
import { APP_ROUTES } from "../../shared/routes";
import { Message } from "../components/modals/message-modal";
import { doPointsMatch } from "../game-logic/moves";
import { rotateCamera } from "../scenes/animation/camera";
import calcTurnAnimation from "../scenes/animation/turn-animation";
import {
  createMovementDisc,
  getPointFromPosition,
  getPositionFromPoint,
  showMoves,
} from "../scenes/scene-helpers";
import { GameScene, SceneManager, Scenes } from "../scenes/scene-manager";
import { websocket } from "../websocket-client";
import { LocalMatch } from "./local-match";
import { OnlineMatch } from "./online-match";

export class Controller {
  sceneManager: SceneManager;
  match: LocalMatch | OnlineMatch;
  events: {
    setMessage: (message: Message | null) => void;
    navigate: (route: APP_ROUTES) => void;
  };
  selectedPoint?: Point;
  options: ControllerOptions;

  constructor({
    sceneManager,
    match,
    events,
    options,
  }: {
    sceneManager: SceneManager;
    match: LocalMatch | OnlineMatch;
    events: {
      setMessage: (message: Message | null) => void;
      navigate: (route: APP_ROUTES) => void;
    };
    options: ControllerOptions;
  }) {
    this.sceneManager = sceneManager;
    this.match = match;
    this.events = events;
    this.options = options;
    this.init();
  }

  init() {
    const gameScene = this.sceneManager.getScene(Scenes.GAME);
    this.subscribeGameInput(gameScene);
    this.updateMeshesRender();
    this.resetCamera();
  }

  subscribeGameInput(gameScene: GameScene) {
    gameScene.scene.onPointerUp = async (
      e: IPointerEvent,
      pickResult: Nullable<PickingInfo>
    ) => {
      if (!this.match.isPlayersTurn()) return;
      const pickedMesh = pickResult?.pickedMesh;
      if (!pickedMesh) return;
      const point = getPointFromPosition({
        position: [pickedMesh.position.z, pickedMesh.position.x],
        externalMesh: false,
      });
      //If no point selected
      if (!this.selectedPoint) {
        const currentPlayersPiece = this.match.isCurrentPlayersPiece(point);
        if (!currentPlayersPiece) return;
        this.selectedPoint = point;
        return this.displayMoves(point);
      } else {
        //If you select the same piece as before deselect it
        if (doPointsMatch(this.selectedPoint, point)) {
          this.selectedPoint = undefined;
          this.updateMeshesRender();
          return;
        } else {
          //If you select a different piece check if its a valid move and resolve or display new moves
          const validMove = await this.move({
            move: [this.selectedPoint, point],
          });
          if (!validMove) {
            const currentPlayersPiece = this.match.isCurrentPlayersPiece(point);
            if (!currentPlayersPiece) return;
            this.selectedPoint = point;
            return this.displayMoves(point);
          }
        }
      }
    };
  }

  async move({ move, emit = true }: { move: Point[]; emit?: boolean }) {
    const [from, to] = move;
    const { turn, callback } = this.match.move({
      from,
      to,
    });
    if (!turn) return false;
    await this.handleValidTurn({ turn });
    if (emit) {
      callback();
    }

    return turn;
  }

  async handleValidTurn({ turn }: { turn: Turn }) {
    const gameScene = this.sceneManager.getScene(Scenes.GAME);
    if (this.options.playGameSounds) {
      const moveType = turn.type;
      if (moveType === "capture" || moveType === "enPassant") {
        gameScene.data.audio.crumble?.play();
      }
    }
    this.clearMeshes({ name: "plane" });
    this.clearMeshes({ name: "torus" });
    await this.turnAnimation({
      turn,
      gameScene,
    });
    this.prepNextView();
  }

  prepNextView() {
    this.selectedPoint = undefined;
    this.updateMeshesRender();
    //Show previous turn
    this.displayLastTurn();
    const isGameOver = this.match.isGameOver();
    if (isGameOver) {
      const status = this.match.getGame().getGameState().status;
      this.events.setMessage(this.createMatchEndPrompt(status));
    } else {
      this.rotateCamera();
    }
  }

  displayLastTurn() {
    const gameScene = this.sceneManager.getScene(Scenes.GAME);
    const name = "disc-previousTurn";
    //Clear old discs
    gameScene.scene.meshes.forEach((mesh) => {
      if (mesh.name === name) {
        gameScene.scene.removeMesh(mesh);
        mesh.dispose();
      }
    });
    const lastTurn = this.match.getGameHistory().at(-1);
    if (!lastTurn) return;
    const { from, to } = lastTurn;
    //Plane in both locations
    const originDisc = createMovementDisc({
      point: from,
      gameScene,
      type: "previousTurn",
      name,
    });
    const targetDisc = createMovementDisc({
      point: to,
      gameScene,
      type: "previousTurn",
      name,
    });
    gameScene.scene.addMesh(originDisc);
    gameScene.scene.addMesh(targetDisc);
  }

  displayMoves(point: Point) {
    const gameScene = this.sceneManager.getScene(Scenes.GAME);
    if (this.options.playGameSounds) {
      gameScene.data.audio.select?.play();
    }
    const moves = this.match.getMoves(point);
    this.updateMeshesRender();
    showMoves({
      point,
      moves,
      gameScene,
      visibleMoves: this.options.displayAvailableMoves,
    });
  }

  createMatchEndPrompt(status: GAMESTATUS) {
    const text = (() => {
      const winningTeam = this.match.getWinner();
      switch (status) {
        case GAMESTATUS.CHECKMATE:
          return `Checkmate! ${winningTeam} team has won, would you like to play another game?`;
        case GAMESTATUS.STALEMATE:
          return "Game has ended in a stalemate, would you like to play another game?";
        default:
          return "Game Over! Would you like to play another game";
      }
    })();
    return {
      text,
      onConfirm: () => {
        this.requestMatchReset();
        this.events.setMessage(null);
      },
      onReject: () => {
        this.events.setMessage(null);
      },
    };
  }

  undoTurn() {
    if (this.match.getGameHistory().length === 0) return;
    const isValidUndo = this.match.undoTurn();
    if (isValidUndo) {
      this.resetView();
    }
  }

  requestUndoTurn() {
    if (this.match.undoTurnRequest()) {
      this.undoTurn();
    }
  }

  requestMatchReset() {
    if (this.match.resetRequest()) {
      this.resetMatchAndView();
    }
  }

  resetMatchAndView() {
    this.match.reset();
    this.resetView();
  }

  resetView() {
    this.updateMeshesRender();
    if (this.match.lobby.mode === LOBBY_TYPE.LOCAL) {
      this.rotateCamera();
    } else {
      this.resetCamera();
    }
  }

  turnAnimation({ turn, gameScene }: { turn: Turn; gameScene: GameScene }) {
    if (!this.options.playAnimations) return;
    return calcTurnAnimation({
      gameScene,
      findMeshFromPoint: this.findMeshFromPoint.bind(this),
      turn,
    });
  }

  findMeshFromPoint(point: Point) {
    const gameScene = this.sceneManager.getScene(Scenes.GAME);
    return gameScene.data.meshesToRender.find((mesh) => {
      const meshPoint = getPointFromPosition({
        position: [mesh.position.z, mesh.position.x],
        externalMesh: true,
      });
      return doPointsMatch(meshPoint, point);
    });
  }

  updateMeshesRender() {
    const gameScene = this.sceneManager.getScene(Scenes.GAME);
    //Clears old meshes/memory usage
    if (gameScene.data.meshesToRender.length) {
      for (let i = 0; i < gameScene.data.meshesToRender.length; i++) {
        const mesh = gameScene.data.meshesToRender[i];
        if (this.options.renderShadows) {
          gameScene.data.shadowGenerator.forEach((gen) =>
            gen.removeShadowCaster(mesh)
          );
        }
        gameScene.scene.removeMesh(mesh);
      }
      gameScene.data.meshesToRender = [];
      this.displayLastTurn();
    }

    //For each active piece, creates a mesh clone and places on board
    this.match.getAllGamePieces().forEach(({ piece, point }) => {
      if (!piece) return;
      const { type, team } = piece;
      const foundMesh = gameScene.scene.meshes.find(
        (mesh) => mesh.name === type && mesh.metadata.color === team
      );
      if (!foundMesh) return;
      const clone = foundMesh.clone(type, null);
      if (!clone) return;
      [clone.position.z, clone.position.x] = getPositionFromPoint({
        point,
        externalMesh: true,
      });
      clone.isVisible = true;
      clone.isPickable = false;
      if (this.options.renderShadows) {
        gameScene.data.shadowGenerator.forEach((gen) =>
          gen.addShadowCaster(clone)
        );
      }
      gameScene.data.meshesToRender.push(clone);
    });
  }

  clearMeshes({ name }: { name: string }) {
    const gameScene = this.sceneManager.getScene(Scenes.GAME);
    gameScene.data.meshesToRender
      .filter((mesh) => mesh.name === name)
      .forEach((mesh) => {
        gameScene.scene.removeMesh(mesh);
        mesh.dispose();
      });
  }

  setMessage(message: Message | null) {
    this.events.setMessage(message);
  }

  leaveMatch({ key }: { key: string }) {
    this.events.navigate(APP_ROUTES.Home);
    if (
      this.match.mode === LOBBY_TYPE.ONLINE &&
      this.match.getGame().getGameState().status === GAMESTATUS.INPROGRESS
    ) {
      websocket.emit("abandonMatch", { lobbyKey: key });
    }
  }

  shouldCameraRotate() {
    if (this.match.lobby.mode === LOBBY_TYPE.LOCAL) {
      if (
        this.match.lobby.players.find((player) => player.type === "Computer")
      ) {
        return false;
      } else {
        return true;
      }
    } else {
      return false;
    }
  }

  rotateCamera() {
    if (!this.shouldCameraRotate()) return;
    const gameScene = this.sceneManager.getScene(Scenes.GAME);
    const camera = gameScene.scene.cameras[0] as ArcRotateCamera;
    const currentPlayer = this.match.getCurrentTeam();
    if (!currentPlayer) return;
    rotateCamera({
      camera,
      currentPlayer,
    });
  }

  resetCamera() {
    const gameScene = this.sceneManager.getScene(Scenes.GAME);
    const camera = gameScene.scene.cameras[0] as ArcRotateCamera;
    const playersTurn = this.match.isPlayersTurn();
    const currentTeam = this.match.getCurrentTeam();
    const teamToReset = playersTurn
      ? currentTeam
      : currentTeam === TEAM.WHITE
      ? TEAM.BLACK
      : TEAM.WHITE;
    camera.alpha = teamToReset === TEAM.WHITE ? Math.PI : 0;
    camera.beta = Math.PI / 4;
  }

  info() {
    return {
      currentTeam: this.match.getCurrentTeam(),
      time: "",
    };
  }
}
