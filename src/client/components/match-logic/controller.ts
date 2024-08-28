import { PickingInfo } from "@babylonjs/core/Collisions/pickingInfo";
import { displayPieceMoves, findByPoint } from "../../helper/canvas-helpers";
import { doMovesMatch, TurnHistory } from "../../helper/game-helpers";
import calcTurnAnimation from "../../view/animation/turn-animation";
import GamePiece from "../game-logic/game-piece";
import { Match } from "../match";
import { SceneManager, Scenes } from "../scene-manager";
import { IPointerEvent } from "@babylonjs/core/Events/deviceInputEvents";
import type { ChessPieceMesh } from "../../view/game-assets";
import type { Nullable } from "@babylonjs/core/types";

export class Controller {
  sceneManager: SceneManager;
  match: Match;
  eventHandlers: {
    endMatch: () => void;
    promote: () => void;
  };

  constructor(
    sceneManager: SceneManager,
    match: Match,
    eventHandlers: {
      endMatch: () => void;
      promote: () => void;
    }
  ) {
    this.sceneManager = sceneManager;
    this.match = match;
    this.eventHandlers = eventHandlers;
    this.prepareGame();
  }

  async prepareGame() {
    this.sceneManager.switchScene(Scenes.GAME);
    this.gameInputHandler();
    this.prepGameScreen();
  }

  gameInputHandler() {
    const gameScene = this.sceneManager.getScene(Scenes.GAME);
    if (!gameScene) return;
    gameScene.scene.onPointerUp = async (
      e: IPointerEvent,
      pickResult: Nullable<PickingInfo>
    ) => {
      const pickedMesh = pickResult?.pickedMesh;
      if (pickedMesh !== null && pickedMesh !== undefined) {
        const isCompleteMove = this.gameInput(pickedMesh);
        if (isCompleteMove) {
          const [originPoint, targetPoint] = this.match.current.moves;
          const validTurn = this.match.takeTurn(originPoint, targetPoint);
          if (validTurn) {
            this.turnAnimation(validTurn);
            const nextTurn = this.match.nextTurn();
            if (validTurn.promotion) this.eventHandlers.promote();
            if (!nextTurn) this.eventHandlers.endMatch();
          } else {
            this.onMoveSuccess();
          }
        }
      }
    };
  }

  gameInput(mesh: ChessPieceMesh) {
    const gameScene = this.sceneManager.getScene(Scenes.GAME);
    if (!gameScene) return;
    const {
      moves,
      player: { id: currentPlayer },
    } = this.match.current;
    const currentMove = moves;
    const { game } = this.match;
    //If mesh
    if (mesh) {
      if (currentMove.length === 0) {
        if (mesh.metadata && mesh.metadata.color === currentPlayer) {
          //If no current move has been selected, and mesh belongs to current player
          displayPieceMoves(mesh, currentMove, game, gameScene);
        }
      } else if (mesh.metadata && mesh.metadata.color === currentPlayer) {
        //If there is already a mesh selected, and you select another of your own meshes
        const originalPiece = game.lookupPiece(currentMove[0])!;
        const newPiece = game.lookupPiece(
          findByPoint({
            get: "index",
            point: [mesh.position.z, mesh.position.x],
            externalMesh: true,
          })
        )!;
        if (originalPiece === newPiece) {
          //If both selected pieces are the same, reset current move
          currentMove.length = 0;
          this.updateMeshesRender();
        } else {
          if (newPiece.name === "Rook" && originalPiece.name === "King") {
            //Checks for castling
            const isItCastling = game
              .calculateAvailableMoves(originalPiece, true)
              .filter((move) => doMovesMatch(move[0], newPiece.point));
            if (isItCastling.length > 0) {
              currentMove.push(newPiece.point);
            } else {
              //If rook is selected second and not castling, show rooks moves
              currentMove.length = 0;
              this.updateMeshesRender();
              displayPieceMoves(mesh, currentMove, game, gameScene);
            }
          } else {
            //If second selected piece is not a castling piece
            currentMove.length = 0;
            this.updateMeshesRender();
            displayPieceMoves(mesh, currentMove, game, gameScene);
          }
        }
      } else if (mesh.metadata && mesh.metadata.color !== currentPlayer) {
        //If second selection is an enemy mesh, calculate move of original piece and push move if matches
        const opponentsPiece = game.lookupPiece(
          findByPoint({
            get: "index",
            point: [mesh.position.z, mesh.position.x],
            externalMesh: true,
          })
        )!;
        const originalPiece = game.lookupPiece(currentMove[0])!;
        const isValidMove = game
          .calculateAvailableMoves(originalPiece, false)
          .find((move) => doMovesMatch(move[0], opponentsPiece.point));
        isValidMove ? currentMove.push(opponentsPiece.point) : null;
      } else if (mesh.id === "plane") {
        //If the second mesh selected is one of the movement squares
        const point = findByPoint({
          get: "index",
          point: [mesh.position.z, mesh.position.x],
          externalMesh: false,
        });
        currentMove.push(point);
      }
      //If complete move return true
      return currentMove.length === 2 ? true : false;
    }
  }

  prepGameScreen(team?: string) {
    this.updateMeshesRender();
    this.resetCamera(team);
  }

  onMoveSuccess() {
    this.updateMeshesRender();
    this.rotateCamera();
    this.match.resetMoves();
  }

  undoMove() {
    if (this.match.current.isActive) {
      const isValidUndo = this.match.undoTurn();
      if (isValidUndo) {
        this.updateMeshesRender();
        this.rotateCamera();
      }
    }
  }

  resetMatch() {
    this.match.resetMatch();
    this.prepGameScreen();
  }

  turnAnimation(turnHistory: TurnHistory) {
    const gameScene = this.sceneManager.getScene(Scenes.GAME);
    if (!gameScene) return;
    return calcTurnAnimation({
      gameScene,
      onMoveSuccess: this.onMoveSuccess.bind(this),
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

  updateMeshesRender() {
    const gameScene = this.sceneManager.getScene(Scenes.GAME);
    if (!gameScene) return;
    //Clears old meshes/memory usage
    if (gameScene.data.meshesToRender.length) {
      for (let i = 0; i < gameScene.data.meshesToRender.length; i++) {
        const mesh = gameScene.data.meshesToRender[i];
        gameScene.scene.removeMesh(mesh);
        mesh.dispose();
      }
      gameScene.data.meshesToRender = [];
    }
    //For each active piece, creates a mesh clone and places on board
    this.match.game.allPieces().forEach((square) => {
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
      gameScene.data.meshesToRender.push(clone);
    });
  }

  rotateCamera() {
    const gameScene = this.sceneManager.getScene(Scenes.GAME);
    if (!gameScene) return;
    let currentPlayer = this.match.game.currentPlayer.id;
    let camera: any = gameScene.scene.cameras[0];
    let alpha = camera.alpha;
    let ratio;
    let subtractedRatio;
    let piDistance;
    let remainingDistance: number;
    let remainder: number;

    if (alpha < 0) {
      ratio = Math.ceil(alpha / Math.PI);
      subtractedRatio = alpha - ratio * Math.PI;
      piDistance = Math.abs(Math.PI + subtractedRatio);
    } else {
      ratio = Math.floor(alpha / Math.PI);
      subtractedRatio = alpha - ratio * Math.PI;
      piDistance = Math.PI - subtractedRatio;
    }

    remainder = ratio % 2;

    if (currentPlayer === "Black") {
      remainder
        ? (remainingDistance = piDistance)
        : (remainingDistance = Math.PI - piDistance);
    } else {
      remainder
        ? (remainingDistance = Math.PI - piDistance)
        : (remainingDistance = piDistance);
    }

    function animateCameraRotation(currentPlayer: string) {
      requestAnimationFrame(() => {
        const playerFlag = currentPlayer === "Black" ? true : false;
        const rotateAmount = remainingDistance > 0.05 ? 0.05 : 0.01;
        rotateCam(playerFlag, rotateAmount);
      });

      function rotateCam(playerFlag: boolean, rotateAmount: number) {
        if (remainder) {
          if (alpha < 0) {
            playerFlag
              ? (camera.alpha -= rotateAmount)
              : (camera.alpha += rotateAmount);
          } else {
            playerFlag
              ? (camera.alpha += rotateAmount)
              : (camera.alpha -= rotateAmount);
          }
        } else {
          if (alpha > 0) {
            playerFlag
              ? (camera.alpha -= rotateAmount)
              : (camera.alpha += rotateAmount);
          } else {
            playerFlag
              ? (camera.alpha += rotateAmount)
              : (camera.alpha -= rotateAmount);
          }
        }
        remainingDistance -= rotateAmount;
        if (remainingDistance > 0.01) {
          animateCameraRotation(currentPlayer);
        }
      }
    }
    animateCameraRotation(currentPlayer);
  }

  resetCamera(team?: string) {
    const gameScene = this.sceneManager.getScene(Scenes.GAME);
    if (!gameScene) return;
    let camera: any = gameScene?.scene.cameras[0];
    if (!team) {
      this.match.game.currentPlayer.id === "White"
        ? setToWhitePlayer()
        : setToBlackPlayer();
    } else {
      parseInt(team) === 1 ? setToWhitePlayer() : setToBlackPlayer();
    }
    function setToWhitePlayer() {
      camera.alpha = Math.PI;
      camera.beta = Math.PI / 4;
    }

    function setToBlackPlayer() {
      camera.alpha = 0;
      camera.beta = Math.PI / 4;
    }
  }

  setPromotionPiece(selection: string) {
    const turnHistory = this.match.game.turnHistory.at(-1);
    if (turnHistory !== undefined) {
      const square = turnHistory.targetSquare.square;
      turnHistory.promotedPiece = selection;
      const { color, point, movement } = turnHistory.originPiece!;
      turnHistory.targetSquare.on = new GamePiece(
        selection,
        color,
        point,
        movement
      );
      const symbol = turnHistory.targetSquare.on.getSymbol();
      const annotations = this.match.game.annotations;
      annotations[annotations.length - 1] = `${square}${symbol}`;
    }
  }
}
