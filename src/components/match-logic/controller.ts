import {
  displayPieceMoves,
  findIndex,
  findPosition,
} from "../../helper/canvas-helpers";
import { doMovesMatch, TurnHistory } from "../../helper/game-helpers";
import calcTurnAnimation from "../../view/animation/turn-animation";
import { ChessPieceMesh } from "../../view/game-assets";
import Game from "../game-logic/game";
import { Match } from "../match";
import { SceneManager } from "../scene-manager";

//Create the controller upon entering /game, save match and scene as keys
export class Controller {
  async prepGame(sceneManager: SceneManager, match: Match) {
    await sceneManager.loadGame();
    this.initGameInput(sceneManager, match);
    this.prepGameScreen(sceneManager, match.game);
    match.startMatch();
  }

  resolveMove(
    originPoint: Point,
    targetPoint: Point,
    history: TurnHistory,
    sceneManager: SceneManager,
    match: Match
  ) {
    this.turnAnimation(sceneManager, originPoint, targetPoint, history);
    if (history.promotion) return; //callback(); //promotion selections
    match.switchPlayer();
    this.rotateCamera(match.game, sceneManager);
  }

  rotateCamera(game: Game, sceneManager: SceneManager) {
    let currentPlayer = game.currentPlayer.id;
    let camera: any = sceneManager.gameScreen!.cameras[0];
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

  updateGameView(game: Game, sceneManager: SceneManager) {
    this.updateMeshesRender(game, sceneManager);
    this.rotateCamera(game, sceneManager);
  }

  resetCamera(sceneManager: SceneManager, game: Game, team?: string) {
    let camera: any = sceneManager.gameScreen?.cameras[0];
    if (!team) {
      game.currentPlayer.id === "White"
        ? setToWhitePlayer()
        : setToBlackPlayer();
    } else {
      parseInt(team) === 1 ? setToWhitePlayer() : setToBlackPlayer();
    }
    function setToWhitePlayer() {
      camera.alpha = Math.PI;
      camera.beta = Math.PI / 4;
      camera.radius = 70;
    }

    function setToBlackPlayer() {
      camera.alpha = 0;
      camera.beta = Math.PI / 4;
      camera.radius = 70;
    }
  }

  resolveInput(match: Match, sceneManager: SceneManager, pickResult: any) {
    if (pickResult.pickedMesh !== null) {
      const mesh: ChessPieceMesh = pickResult.pickedMesh;
      const isCompleteMove = this.gameInput(mesh, match, sceneManager);
      if (isCompleteMove) {
        const [originPoint, targetPoint] = match.current.moves;
        this.updateMeshesRender(match.game, sceneManager);
        const resolved = match.takeTurn(originPoint, targetPoint);
        if (typeof resolved !== "boolean" && resolved.result) {
          this.resolveMove(
            originPoint,
            targetPoint,
            resolved,
            sceneManager,
            match
          );
        }
        match.resetMoves();
      }
    }
  }
  updateMeshesRender(game: Game, sceneManager: SceneManager) {
    //Clears old meshes/memory usage
    !sceneManager.gameScreen?.meshesToRender
      ? (sceneManager.gameScreen!.meshesToRender = [])
      : null;
    if (sceneManager.gameScreen?.meshesToRender.length) {
      for (let i = 0; i < sceneManager.gameScreen?.meshesToRender.length; i++) {
        const mesh = sceneManager.gameScreen?.meshesToRender[i];
        sceneManager.gameScreen?.removeMesh(mesh);
        mesh.dispose();
      }
      sceneManager.gameScreen!.meshesToRender = [];
    }
    //Final Piece Mesh List
    const meshesList = sceneManager.gameScreen!.finalMeshes!.piecesMeshes;
    //For each active piece, creates a mesh clone and places on board
    game.allPieces().forEach((square) => {
      const { name, color, point } = square.on!;
      const foundMesh = meshesList.find(
        (mesh: any) => mesh.name === name && mesh.color === color
      );
      const clone = foundMesh!.clone(name, null);
      [clone!.position.z, clone!.position.x] = findPosition(point, true);
      clone!.isVisible = true;
      sceneManager.gameScreen?.meshesToRender!.push(clone!);
    });
  }

  gameInput(mesh: ChessPieceMesh, match: Match, sceneManager: SceneManager) {
    const {
      moves,
      player: { id: currentPlayer },
    } = match.current;
    const currentMove = moves;
    const { game } = match;
    //If mesh
    if (mesh) {
      if (currentMove.length === 0) {
        if (mesh.color === currentPlayer) {
          //If no current move has been selected, and mesh belongs to current player
          displayPieceMoves(mesh, currentMove, game, sceneManager.gameScreen!);
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
          this.updateMeshesRender(game, sceneManager);
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
              this.updateMeshesRender(game, sceneManager);
              displayPieceMoves(
                mesh,
                currentMove,
                game,
                sceneManager.gameScreen!
              );
            }
          } else {
            //If second selected piece is not a castling piece
            currentMove.length = 0;
            this.updateMeshesRender(game, sceneManager);
            displayPieceMoves(
              mesh,
              currentMove,
              game,
              sceneManager.gameScreen!
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

  prepGameScreen(sceneManager: SceneManager, game: Game, team?: string) {
    sceneManager.homeScreen?.detachControl();
    this.updateMeshesRender(game, sceneManager);
    this.resetCamera(sceneManager, game, team);
    sceneManager.gameScreen?.attachControl();
  }

  turnAnimation(
    sceneManager: SceneManager,
    ...props: [originPoint: Point, targetPoint: Point, turnHistory: TurnHistory]
  ) {
    return calcTurnAnimation(sceneManager.gameScreen!, ...props);
  }

  initGameInput(sceneManager: SceneManager, match: Match) {
    sceneManager.gameScreen!.onPointerDown = async (
      e: any,
      pickResult: any
    ) => {
      this.resolveInput(match, sceneManager, pickResult);
    };
  }
}

// selectedPromotionPiece(
//   selection: string,
//   match: Match,
//   sceneManager: SceneManager
// ) {
//   const turnHistory = match.game.turnHistory.at(-1);
//   if (turnHistory !== undefined) {
//     const square = turnHistory.targetSquare.square;
//     turnHistory.promotedPiece = selection;
//     const { color, point, movement } = turnHistory.originPiece!;
//     turnHistory.targetSquare.on = new GamePiece(
//       selection,
//       color,
//       point,
//       movement
//     );
//     const symbol = turnHistory.targetSquare.on.getSymbol();
//     const annotations = match.game.annotations;
//     annotations[annotations.length - 1] = `${square}${symbol}`;
//     sceneManager.updateMeshesRender(match.game);
//     match.switchPlayer();
//     sceneManager.rotateCamera(match.game);
//   }
// }

// boardReset(match: Match, sceneManager: SceneManager) {
//   match.resetMatch();
//   sceneManager.prepGameScreen(match.game);
// }

// undoMove(match: Match, sceneManager: SceneManager) {
//   if (match.current.isActive) {
//     const undo = match.undoTurn();
//     if (undo) sceneManager.updateGameView(match.game);
//   }
// }

// resetCamera(match: Match, sceneManager: SceneManager) {
//   sceneManager.resetCamera(match.game);
// }
