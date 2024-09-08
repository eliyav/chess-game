import { PickingInfo } from "@babylonjs/core/Collisions/pickingInfo";
import { IPointerEvent } from "@babylonjs/core/Events/deviceInputEvents";
import { AbstractMesh } from "@babylonjs/core/Meshes/abstractMesh";
import type { Nullable } from "@babylonjs/core/types";
import { doMovesMatch, TurnHistory } from "../../helper/game-helpers";
import calcTurnAnimation from "../../view/animation/turn-animation";
import { displayPieceMoves, findByPoint } from "../../view/scene-helpers";
import GamePiece from "../game-logic/game-piece";
import { Message } from "../modals/message-modal";
import { GameScene, SceneManager, Scenes } from "../scene-manager";
import { ArcRotateCamera } from "@babylonjs/core";
import { rotateCamera } from "../../view/animation/camera";
import { LocalMatch } from "./local-match";
import { OnlineMatch } from "./online-match";
import { Point } from "../../helper/movement-helpers";
import { LOBBY } from "../../../shared/match";

type ControllerOptions = {
  playAnimations?: boolean;
  rotateCamera?: boolean;
  renderShadows?: boolean;
};

export class Controller {
  sceneManager: SceneManager;
  match: LocalMatch | OnlineMatch;
  events: {
    setMessage: (message: Message | null) => void;
    promote: () => void;
  };
  selectedPiece?: GamePiece;
  options: Required<ControllerOptions>;

  constructor({
    sceneManager,
    match,
    events,
    options = {},
  }: {
    sceneManager: SceneManager;
    match: LocalMatch | OnlineMatch;
    events: {
      setMessage: (message: Message | null) => void;
      promote: () => void;
    };
    options?: Partial<ControllerOptions>;
  }) {
    this.sceneManager = sceneManager;
    this.match = match;
    this.events = events;
    this.options = {
      playAnimations: options.playAnimations ?? true,
      rotateCamera: options.rotateCamera ?? true,
      renderShadows: options.renderShadows ?? false,
    };
    this.init();
  }

  init() {
    const gameScene = this.sceneManager.switchScene(Scenes.GAME);
    if (gameScene) {
      this.subscribeGameInput(gameScene);
      this.resetView();
    }
  }

  subscribeGameInput(gameScene: GameScene) {
    gameScene.scene.onPointerUp = async (
      e: IPointerEvent,
      pickResult: Nullable<PickingInfo>
    ) => {
      if (!this.match.isPlayersTurn()) return;
      const pickedMesh = pickResult?.pickedMesh;
      if (!pickedMesh) return;
      const pickedPiece = this.match.lookupGamePiece(
        pickedMesh,
        pickedMesh.metadata !== null
      );
      if (pickedPiece) {
        this.handlePieceInput(pickedPiece);
      } else {
        this.handleMovementSquareInput(pickedMesh);
      }
    };
  }

  async resolveMove(move: Point[]) {
    if (move) {
      const [originPoint, targetPoint] = move;
      const validTurn = this.match.resolveMove({
        originPoint,
        targetPoint,
      });
      if (validTurn) {
        const gameScene = this.sceneManager.getScene(Scenes.GAME);
        if (!gameScene) return;
        await this.turnAnimation({
          turnHistory: validTurn,
          gameScene,
        });
        if (validTurn.promotion) {
          this.events.promote();
        } else {
          this.onMoveSuccess();
        }
      }
    }
  }

  displayMoves(piece: GamePiece | undefined) {
    const gameScene = this.sceneManager.getScene(Scenes.GAME);
    if (!gameScene) return;
    if (!piece) return;
    const currentPlayersPiece = this.match.isCurrentPlayersPiece(piece);
    if (currentPlayersPiece) {
      const moves = this.match.getValidMoves(piece);
      this.selectedPiece = piece;
      this.updateMeshesRender();
      displayPieceMoves({ piece, moves, gameScene });
    }
  }

  unselectCurrentPiece() {
    this.selectedPiece = undefined;
    this.updateMeshesRender();
  }

  handlePieceInput(pickedPiece: GamePiece) {
    //If no selection
    if (!this.selectedPiece) return this.displayMoves(pickedPiece);
    //If you select the same piece as before deselect it
    if (this.selectedPiece === pickedPiece) return this.unselectCurrentPiece();
    //If you select a different piece check if its a valid move and resolve or display new moves
    const validMove = this.match.isValidMove({
      selectedPiece: this.selectedPiece,
      pickedPiece,
    });
    if (validMove) {
      return this.resolveMove([this.selectedPiece.point, pickedPiece.point]);
    }
    return this.displayMoves(pickedPiece);
  }

  handleMovementSquareInput(pickedMesh: AbstractMesh) {
    if (!this.selectedPiece) return;
    if (pickedMesh.id === "plane") {
      //If the second mesh selected is one of the movement squares
      const point = findByPoint({
        get: "index",
        point: [pickedMesh.position.z, pickedMesh.position.x],
        externalMesh: false,
      });
      return this.resolveMove([this.selectedPiece.point, point]);
    }
  }

  onMoveSuccess() {
    this.handleNextTurn();
    this.rotateCamera();
  }

  handleNextTurn() {
    this.selectedPiece = undefined;
    this.updateMeshesRender();
    const nextTurn = this.match.nextTurn();
    if (!nextTurn) return this.events.setMessage(this.createMatchEndPrompt());
  }

  createMatchEndPrompt() {
    const winningTeam = this.match.getWinner();
    return {
      question: `${winningTeam} team has won!, Would you like to play another game?`,
      onConfirm: () => {
        this.requestMatchReset();
        this.events.setMessage(null);
      },
      onReject: () => {
        this.events.setMessage(null);
      },
    };
  }

  undoMove() {
    if (this.match.getGameHistory().length === 0) return;
    const isValidUndo = this.match.undoTurn();
    if (isValidUndo) {
      this.updateMeshesRender();
      this.rotateCamera();
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
    this.resetCamera();
  }

  turnAnimation({
    turnHistory,
    gameScene,
  }: {
    turnHistory: TurnHistory;
    gameScene: GameScene;
  }) {
    if (!this.options.playAnimations) return;
    return calcTurnAnimation({
      gameScene,
      findMeshFromPoint: this.findMeshFromPoint.bind(this),
      turnHistory,
    });
  }

  findMeshFromPoint(point: Point) {
    const gameScene = this.sceneManager.getScene(Scenes.GAME);
    if (!gameScene) return;
    return gameScene.data.meshesToRender.find((mesh) => {
      const meshPoint = findByPoint({
        get: "index",
        point: [mesh.position.z, mesh.position.x],
        externalMesh: true,
      });
      return doMovesMatch(meshPoint, point);
    });
  }

  handlePromotionEvent(selection: string) {
    this.match.setPromotion(selection);
    this.handleNextTurn();
  }

  updateMeshesRender() {
    const gameScene = this.sceneManager.getScene(Scenes.GAME);
    if (!gameScene) return;
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
        mesh.dispose();
      }
      gameScene.data.meshesToRender = [];
    }

    //For each active piece, creates a mesh clone and places on board
    this.match.getAllGamePieces().forEach((square) => {
      const { name, color, point } = square.on!;
      const foundMesh = gameScene.scene.meshes.find(
        (mesh) => mesh.name === name && mesh.metadata.color === color
      );
      if (!foundMesh) return;
      const clone = foundMesh.clone(name, null);
      if (!clone) return;
      [clone.position.z, clone.position.x] = findByPoint({
        get: "position",
        point,
        externalMesh: true,
      });
      clone.isVisible = true;
      if (this.options.renderShadows) {
        gameScene.data.shadowGenerator.forEach((gen) =>
          gen.addShadowCaster(clone)
        );
      }
      gameScene.data.meshesToRender.push(clone);
    });
  }

  rotateCamera() {
    if (!this.options.rotateCamera || !this.match.shouldCameraRotate()) return;
    const gameScene = this.sceneManager.getScene(Scenes.GAME);
    if (!gameScene) return;
    const camera = gameScene.scene.cameras[0] as ArcRotateCamera;
    const currentPlayer = this.match.getPlayerTeam();
    rotateCamera({
      camera,
      currentPlayer,
    });
  }

  resetCamera() {
    const gameScene = this.sceneManager.getScene(Scenes.GAME);
    if (!gameScene) return;
    const camera = gameScene.scene.cameras[0] as ArcRotateCamera;
    const isWhitePlayer = this.match.getPlayerTeam() === "White";
    camera.alpha = isWhitePlayer ? Math.PI : 0;
    camera.beta = Math.PI / 4;
  }
}
