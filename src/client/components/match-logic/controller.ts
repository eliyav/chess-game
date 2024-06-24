import {
  displayPieceMoves,
  findIndex,
  findPosition,
} from "../../helper/canvas-helpers";
import { doMovesMatch, TurnHistory } from "../../helper/game-helpers";
import calcTurnAnimation from "../../view/animation/turn-animation";
import { ChessPieceMesh } from "../../view/game-assets";
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
  }

  async prepView() {
    await this.sceneManager.loadScene(Scenes.GAME);
    this.initGameInput();
    this.prepGameScreen();
    this.match.startMatch();
  }

  initGameInput() {
    this.sceneManager.scenes.GAME!.onPointerDown = async (
      e: any,
      pickResult: any
    ) => {
      this.handleInput(pickResult);
    };
  }

  prepGameScreen(team?: string) {
    this.sceneManager.scenes.HOME?.detachControl();
    this.updateMeshesRender();
    this.resetCamera(team);
    this.sceneManager.scenes.GAME?.attachControl();
  }

  handleInput(pickResult: any) {
    if (pickResult.pickedMesh !== null) {
      const mesh: ChessPieceMesh = pickResult.pickedMesh;
      const isCompleteMove = this.gameInput(mesh);
      if (isCompleteMove) {
        const [originPoint, targetPoint] = this.match.current.moves;
        const validTurn = this.match.takeTurn(originPoint, targetPoint);
        if (validTurn) {
          this.turnAnimation(originPoint, targetPoint, validTurn);
          const nextTurn = this.match.nextTurn();
          if (validTurn.promotion) this.eventHandlers.promote();
          if (!nextTurn) this.eventHandlers.endMatch();
        }
        this.updateMeshesRender();
        this.rotateCamera();

        this.match.resetMoves();
      }
    }
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

  turnAnimation(
    ...props: [originPoint: Point, targetPoint: Point, turnHistory: TurnHistory]
  ) {
    return calcTurnAnimation(this.sceneManager.scenes.GAME!, ...props);
  }

  updateMeshesRender() {
    //Clears old meshes/memory usage
    !this.sceneManager.scenes.GAME?.meshesToRender
      ? (this.sceneManager.scenes.GAME!.meshesToRender = [])
      : null;
    if (this.sceneManager.scenes.GAME?.meshesToRender.length) {
      for (
        let i = 0;
        i < this.sceneManager.scenes.GAME?.meshesToRender.length;
        i++
      ) {
        const mesh = this.sceneManager.scenes.GAME?.meshesToRender[i];
        this.sceneManager.scenes.GAME?.removeMesh(mesh);
        mesh.dispose();
      }
      this.sceneManager.scenes.GAME!.meshesToRender = [];
    }
    //Final Piece Mesh List
    const meshesList = this.sceneManager.scenes.GAME!.finalMeshes!.piecesMeshes;
    //For each active piece, creates a mesh clone and places on board
    this.match.game.allPieces().forEach((square) => {
      const { name, color, point } = square.on!;
      const foundMesh = meshesList.find(
        (mesh: any) => mesh.name === name && mesh.color === color
      );
      const clone = foundMesh!.clone(name, null);
      [clone!.position.z, clone!.position.x] = findPosition(point, true);
      clone!.isVisible = true;
      this.sceneManager.scenes.GAME?.meshesToRender!.push(clone!);
    });
  }

  rotateCamera() {
    let currentPlayer = this.match.game.currentPlayer.id;
    let camera: any = this.sceneManager.scenes.GAME!.cameras[0];
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
    let camera: any = this.sceneManager.scenes.GAME?.cameras[0];
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

  gameInput(mesh: ChessPieceMesh) {
    const {
      moves,
      player: { id: currentPlayer },
    } = this.match.current;
    const currentMove = moves;
    const { game } = this.match;
    //If mesh
    if (mesh) {
      if (currentMove.length === 0) {
        if (mesh.color === currentPlayer) {
          //If no current move has been selected, and mesh belongs to current player
          displayPieceMoves(
            mesh,
            currentMove,
            game,
            this.sceneManager.scenes.GAME!
          );
        }
      } else if (mesh.color === currentPlayer) {
        //If there is already a mesh selected, and you select another of your own meshes
        const originalPiece = game.lookupPiece(currentMove[0])!;
        const newPiece = game.lookupPiece(
          findIndex([mesh.position.z, mesh.position.x], true)
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
              displayPieceMoves(
                mesh,
                currentMove,
                game,
                this.sceneManager.scenes.GAME!
              );
            }
          } else {
            //If second selected piece is not a castling piece
            currentMove.length = 0;
            this.updateMeshesRender();
            displayPieceMoves(
              mesh,
              currentMove,
              game,
              this.sceneManager.scenes.GAME!
            );
          }
        }
      } else if (mesh.color && mesh.color !== currentPlayer) {
        //If second selection is an enemy mesh, calculate move of original piece and push move if matches
        const opponentsPiece = game.lookupPiece(
          findIndex([mesh.position.z, mesh.position.x], true)
        )!;
        const originalPiece = game.lookupPiece(currentMove[0])!;
        const isValidMove = game
          .calculateAvailableMoves(originalPiece, false)
          .find((move) => doMovesMatch(move[0], opponentsPiece.point));
        isValidMove ? currentMove.push(opponentsPiece.point) : null;
      } else if (mesh.id === "plane") {
        //If the second mesh selected is one of the movement squares
        const point = findIndex([mesh.position.z, mesh.position.x], false);
        currentMove.push(point);
      }
      //If complete move return true
      return currentMove.length === 2 ? true : false;
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
