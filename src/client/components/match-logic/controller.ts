import { AbstractMesh } from "@babylonjs/core";
import { PickingInfo } from "@babylonjs/core/Collisions/pickingInfo";
import { IPointerEvent } from "@babylonjs/core/Events/deviceInputEvents";
import type { Nullable } from "@babylonjs/core/types";
import { doMovesMatch, TurnHistory } from "../../helper/game-helpers";
import calcTurnAnimation from "../../view/animation/turn-animation";
import { displayPieceMoves, findByPoint } from "../../view/scene-helpers";
import GamePiece from "../game-logic/game-piece";
import { Match } from "../match";
import { GameScene, SceneManager, Scenes } from "../scene-manager";
import { Message } from "../modals/message-modal";

export class Controller {
  sceneManager: SceneManager;
  match: Match;
  events: {
    setMessage: (message: Message | null) => void;
    promote: () => void;
  };
  selectedPiece?: GamePiece;

  constructor({
    sceneManager,
    match,
    events,
  }: {
    sceneManager: SceneManager;
    match: Match;
    events: {
      setMessage: (message: Message | null) => void;
      promote: () => void;
    };
  }) {
    this.sceneManager = sceneManager;
    this.match = match;
    this.events = events;
    this.init();
  }

  init(team?: string) {
    const gameScene = this.sceneManager.switchScene(Scenes.GAME);
    if (gameScene) {
      this.subscribeGameInput(gameScene);
      this.updateMeshesRender();
      this.resetCamera(team);
    }
  }

  subscribeGameInput(gameScene: GameScene) {
    gameScene.scene.onPointerUp = async (
      e: IPointerEvent,
      pickResult: Nullable<PickingInfo>
    ) => {
      const pickedMesh = pickResult?.pickedMesh;
      if (!pickedMesh) return;
      console.log(pickedMesh);
      const pickedPiece = this.lookUpPiece(
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
      const validTurn = this.match.takeTurn(originPoint, targetPoint);
      if (validTurn) {
        if (validTurn.promotion) {
          this.events.promote();
        } else {
          const gameScene = this.sceneManager.getScene(Scenes.GAME);
          if (!gameScene) return;
          await this.turnAnimation(validTurn, gameScene);
          this.onMoveSuccess();
        }
      }
    }
  }

  displayMoves(piece: GamePiece | undefined) {
    const gameScene = this.sceneManager.getScene(Scenes.GAME);
    if (!gameScene) return;
    if (!piece) return;
    const currentPlayersPiece = this.currentPlayerPiece(piece);
    if (currentPlayersPiece) {
      const moves = this.match.game.getValidMoves(piece);
      this.selectedPiece = piece;
      this.updateMeshesRender();
      displayPieceMoves({ piece, moves, gameScene });
    }
  }

  lookUpPiece(pickedMesh: AbstractMesh, externalMesh: boolean) {
    return this.match.game.lookupPiece(
      findByPoint({
        get: "index",
        point: [pickedMesh.position.z, pickedMesh.position.x],
        externalMesh,
      })
    );
  }

  currentPlayerPiece(pickedPiece: GamePiece | undefined) {
    if (!pickedPiece) return false;
    const currentPlayer = this.match.current.player.id;
    return pickedPiece.color === currentPlayer;
  }

  unselectCurrentPiece() {
    this.selectedPiece = undefined;
    this.updateMeshesRender();
  }

  handlePieceInput(pickedPiece: GamePiece) {
    const { game } = this.match;
    //If no selection
    if (!this.selectedPiece) {
      return this.displayMoves(pickedPiece);
    } else {
      if (this.currentPlayerPiece(pickedPiece)) {
        //If there is already a mesh selected, and you select another of your own meshes
        if (this.selectedPiece === pickedPiece) {
          return this.unselectCurrentPiece();
        } else {
          // Check for castling
          if (
            pickedPiece.name === "Rook" &&
            this.selectedPiece.name === "King"
          ) {
            const castling = game.isValidMove(
              this.selectedPiece,
              pickedPiece.point,
              true
            );
            if (castling) {
              return this.resolveMove([
                this.selectedPiece.point,
                pickedPiece.point,
              ]);
            } else {
              return this.displayMoves(pickedPiece);
            }
          } else {
            //If not castling
            return this.displayMoves(pickedPiece);
          }
        }
      } else {
        //If second selection is an enemy mesh, calculate move of original piece and push move if matches
        const validMove = game.isValidMove(
          this.selectedPiece,
          pickedPiece.point,
          false
        );
        if (validMove) {
          return this.resolveMove([
            this.selectedPiece.point,
            pickedPiece.point,
          ]);
        }
      }
    }
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
    this.selectedPiece = undefined;
    this.updateMeshesRender();
    const nextTurn = this.match.nextTurn();
    if (!nextTurn) return this.events.setMessage(this.createMatchEndPrompt());
    this.rotateCamera();
  }

  createMatchEndPrompt() {
    const winningTeam = this.match.getWinningTeam();
    return {
      question: `${winningTeam} team has won!, Would you like to play another game?`,
      onConfirm: () => {
        this.resetMatch();
        this.events.setMessage(null);
      },
      onReject: () => {
        this.events.setMessage(null);
      },
    };
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
    this.updateMeshesRender();
    this.resetCamera();
  }

  turnAnimation(turnHistory: TurnHistory, gameScene: GameScene) {
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
    if (!nextTurn) return this.events.setMessage(this.createMatchEndPrompt());
  }
}
