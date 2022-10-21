import * as BABYLON from "babylonjs";
import Game from "./game-logic/game";
import calcTurnAnimation from "../view/animation/turn-animation";
import { homeScene } from "../view/home-scene";
import { ChessPieceMesh, CustomScene } from "../view/game-assets";
import { doMovesMatch, TurnHistory } from "../helper/game-helpers";
import {
  displayPieceMoves,
  findIndex,
  findPosition,
} from "../helper/canvas-helpers";
import { Match } from "./match";
import { EventEmitter } from "../events/event-emitter";

export type SceneTypes = "home" | "game";

//Add GameManager extended
export class SceneManager {
  canvasRef: HTMLCanvasElement;
  engine: BABYLON.Engine;
  homeScreen: CustomScene | null;
  gameScreen: CustomScene | null;
  isInitDone: boolean;
  activeScene: { id: SceneTypes };

  constructor(canvasRef: HTMLCanvasElement) {
    this.canvasRef = canvasRef;
    this.engine = new BABYLON.Engine(canvasRef, true);
    this.activeScene = { id: "home" };
    this.homeScreen = null;
    this.gameScreen = null;
    this.isInitDone = false;
    this.init();
  }

  async init() {
    await this.loadHome();
    this.render();
  }

  async loadHome() {
    const homeScreen = await homeScene(this.engine, this.activeScene);
    this.homeScreen = homeScreen;
  }

  async loadGame(match: Match, matchControl: EventEmitter, online: boolean) {
    const { gameScene } = await import("../view/game-scene");
    this.gameScreen = await gameScene(this.canvasRef, this.engine);
    this.activeScene.id = "game";
    this.prepGameScreen(match.game);
    this.initGameInput(match, matchControl, online);
  }

  render() {
    this.engine.runRenderLoop(() => {
      switch (this.activeScene.id) {
        case "home":
          this.homeScreen?.render();
          break;
        case "game":
          this.gameScreen!.render();
          break;
      }
    });
  }

  stopRender() {
    this.engine.stopRenderLoop();
  }

  resize() {
    this.engine.resize();
  }

  //Refactor
  //Move to controller maybe
  initGameInput(
    match: Match,
    matchControl: EventEmitter,
    online: boolean,
    team?: string
  ) {
    this.gameScreen!.onPointerDown = async (e: any, pickResult: any) => {
      if (!match.timer.paused) {
        if (online) {
          team === match.game.currentPlayer.id
            ? this.resolveInput(match, matchControl, pickResult)
            : null;
        } else {
          this.resolveInput(match, matchControl, pickResult);
        }
      }
    };
  }

  resolveInput(match: Match, matchControl: EventEmitter, pickResult: any) {
    if (pickResult.pickedMesh !== null) {
      const mesh: ChessPieceMesh = pickResult.pickedMesh;
      const isCompleteMove = this.gameInput(mesh, match);
      if (isCompleteMove) {
        const [originPoint, targetPoint] = match.matchDetails.current.moves;
        this.updateMeshesRender(match.game);
        const resolved = match.takeTurn(originPoint, targetPoint);
        if (typeof resolved !== "boolean" && resolved.result) {
          matchControl.emit("resolveMove", originPoint, targetPoint, resolved);
        }
        match.resetMoves();
      }
    }
  }

  gameInput(mesh: ChessPieceMesh, match: Match) {
    const {
      current: {
        moves,
        player: { id: currentPlayer },
      },
    } = match.matchDetails;
    const currentMove = moves;
    const { game } = match;
    //If mesh
    if (mesh) {
      if (currentMove.length === 0) {
        if (mesh.color === currentPlayer) {
          //If no current move has been selected, and mesh belongs to current player
          displayPieceMoves(mesh, currentMove, game, this.gameScreen!);
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
          this.updateMeshesRender(game);
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
              this.updateMeshesRender(game);
              displayPieceMoves(mesh, currentMove, game, this.gameScreen!);
            }
          } else {
            //If second selected piece is not a castling piece
            currentMove.length = 0;
            this.updateMeshesRender(game);
            displayPieceMoves(mesh, currentMove, game, this.gameScreen!);
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

  turnAnimation(
    ...props: [originPoint: Point, targetPoint: Point, turnHistory: TurnHistory]
  ) {
    return calcTurnAnimation(this.gameScreen!, ...props);
  }

  prepGameScreen(game: Game, team?: string) {
    this.homeScreen?.detachControl();
    this.updateMeshesRender(game);
    this.resetCamera(game, team);
    this.gameScreen?.attachControl();
  }

  updateMeshesRender(game: Game) {
    //Clears old meshes/memory usage
    !this.gameScreen?.meshesToRender
      ? (this.gameScreen!.meshesToRender = [])
      : null;
    if (this.gameScreen?.meshesToRender.length) {
      for (let i = 0; i < this.gameScreen?.meshesToRender.length; i++) {
        const mesh = this.gameScreen?.meshesToRender[i];
        this.gameScreen?.removeMesh(mesh);
        mesh.dispose();
      }
      this.gameScreen!.meshesToRender = [];
    }
    //Final Piece Mesh List
    const meshesList = this.gameScreen!.finalMeshes!.piecesMeshes;
    //For each active piece, creates a mesh clone and places on board
    game.allPieces().forEach((square) => {
      const { name, color, point } = square.on!;
      const foundMesh = meshesList.find(
        (mesh) => mesh.name === name && mesh.color === color
      );
      const clone = foundMesh!.clone(name, null);
      [clone!.position.z, clone!.position.x] = findPosition(point, true);
      clone!.isVisible = true;
      this.gameScreen?.meshesToRender!.push(clone!);
    });
  }

  updateGameView(game: Game) {
    this.updateMeshesRender(game);
    this.rotateCamera(game);
  }

  resetCamera(game: Game, team?: string) {
    let camera: any = this.gameScreen?.cameras[0];
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

  rotateCamera(game: Game) {
    let currentPlayer = game.currentPlayer.id;
    let camera: any = this.gameScreen?.cameras[0];
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
}
