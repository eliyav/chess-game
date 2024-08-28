import { AbstractMesh } from "@babylonjs/core";
import { PickingInfo } from "@babylonjs/core/Collisions/pickingInfo";
import { IPointerEvent } from "@babylonjs/core/Events/deviceInputEvents";
import type { Nullable } from "@babylonjs/core/types";
import { doMovesMatch, TurnHistory } from "../../helper/game-helpers";
import calcTurnAnimation from "../../view/animation/turn-animation";
import { displayPieceMoves, findByPoint } from "../../view/scene-helpers";
import GamePiece from "../game-logic/game-piece";
import { Match } from "../match";
import { SceneManager, Scenes } from "../scene-manager";

export class Controller {
  sceneManager: SceneManager;
  match: Match;
  eventHandlers: {
    endMatch: () => void;
    promote: () => void;
  };
  selectedPiece?: GamePiece;

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
        const move = this.gameInput(pickedMesh);
        if (move) {
          const [originPoint, targetPoint] = move;
          const validTurn = this.match.takeTurn(originPoint, targetPoint);
          if (validTurn) {
            if (validTurn.promotion) {
              this.eventHandlers.promote();
            } else {
              this.turnAnimation(validTurn);
              const nextTurn = this.match.nextTurn();
              if (!nextTurn) this.eventHandlers.endMatch();
            }
          }
        }
      }
    };
  }

  gameInput(pickedMesh: AbstractMesh) {
    const gameScene = this.sceneManager.getScene(Scenes.GAME);
    if (!gameScene) return false;
    const {
      player: { id: currentPlayer },
    } = this.match.current;
    const { game } = this.match;
    //If no selection
    if (!pickedMesh) return false;
    const pickedPiece = game.lookupPiece(
      findByPoint({
        get: "index",
        point: [pickedMesh.position.z, pickedMesh.position.x],
        externalMesh: true,
      })
    );
    if (!this.selectedPiece) {
      //If no previous selected piece, check if picked mesh is a piece of the current player and display its moves, and set as selected piece
      if (pickedMesh.metadata && pickedMesh.metadata.color === currentPlayer) {
        const piece = game.lookupPiece(
          findByPoint({
            get: "index",
            point: [pickedMesh.position.z, pickedMesh.position.x],
            externalMesh: true,
          })
        );
        if (!piece) return false;
        const movesToDisplay = game.getValidMoves(piece);
        this.selectedPiece = piece;
        displayPieceMoves({ piece, moves: movesToDisplay, gameScene });
      }
    } else {
      //If there is a selected piece
      const pickedCurrentPlayerPiece =
        pickedMesh.metadata && pickedMesh.metadata.color === currentPlayer;
      if (pickedCurrentPlayerPiece) {
        //If there is already a mesh selected, and you select another of your own meshes
        const originalPiece = this.selectedPiece;
        if (!pickedPiece) return false;
        if (originalPiece === pickedPiece) {
          this.selectedPiece = undefined;
          this.updateMeshesRender();
          return false;
        } else {
          //Check for castling
          if (pickedPiece.name === "Rook" && originalPiece.name === "King") {
            const isItCastling = game
              .calculateAvailableMoves(originalPiece, true)
              .filter((move) => doMovesMatch(move[0], pickedPiece.point));
            if (isItCastling.length > 0) {
              return [originalPiece.point, pickedPiece.point];
            } else {
              this.selectedPiece = pickedPiece;
              this.updateMeshesRender();
              const movesToDisplay = game.getValidMoves(pickedPiece);
              displayPieceMoves({
                piece: pickedPiece,
                moves: movesToDisplay,
                gameScene,
              });
            }
          } else {
            //If not castling
            this.updateMeshesRender();
            const movesToDisplay = game.getValidMoves(pickedPiece);
            this.selectedPiece = pickedPiece;
            displayPieceMoves({
              piece: pickedPiece,
              moves: movesToDisplay,
              gameScene,
            });
          }
        }
        return false;
      } else if (!pickedCurrentPlayerPiece && pickedMesh.metadata) {
        //If second selection is an enemy mesh, calculate move of original piece and push move if matches
        if (!pickedPiece) return false;
        const originalPiece = this.selectedPiece;
        const isValidMove = game
          .calculateAvailableMoves(originalPiece, false)
          .find((move) => doMovesMatch(move[0], pickedPiece.point));
        if (isValidMove) {
          return [originalPiece.point, pickedPiece.point];
        }
      } else if (pickedMesh.id === "plane") {
        //If the second mesh selected is one of the movement squares
        const point = findByPoint({
          get: "index",
          point: [pickedMesh.position.z, pickedMesh.position.x],
          externalMesh: false,
        });
        //Refactor to have isValidMove cover enPassant
        return [this.selectedPiece.point, point];
      }
    }
    return false;
  }

  prepGameScreen(team?: string) {
    this.updateMeshesRender();
    this.resetCamera(team);
  }

  onMoveSuccess() {
    this.selectedPiece = undefined;
    this.updateMeshesRender();
    this.rotateCamera();
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
    //#return a promise here and await it instead of passing on move success into
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
    this.selectedPiece = undefined;
    this.updateMeshesRender();
    const nextTurn = this.match.nextTurn();
    if (!nextTurn) this.eventHandlers.endMatch();
  }
}
