import { Material } from "babylonjs/Materials/material";
import { AbstractMesh } from "babylonjs/Meshes/abstractMesh";
import { Nullable } from "babylonjs/types";
import Game from "../game";
import { CustomScene } from "../view/start-screen";
import {
  getSquaresandPieces,
  canValidMoveResolve,
  switchSquaresBack,
} from "./game-helpers";
import { ChessPieceMesh } from "../view/asset-loader";
import { Move } from "../component/game-pieces/game-piece";

const renderScene = (game: Game, gameScene: CustomScene) => {
  //Clears old meshes/memory usage
  !gameScene.meshesToRender ? (gameScene.meshesToRender = []) : null;
  if (gameScene.meshesToRender.length > 0) {
    for (let i = 0; i < gameScene.meshesToRender.length; i++) {
      const mesh: AbstractMesh = gameScene.meshesToRender[i];
      gameScene.removeMesh(mesh);
      mesh.dispose();
    }
    gameScene.meshesToRender = [];
  }
  //Final Piece Mesh List
  const meshesList = gameScene.finalMeshes!.piecesMeshes;
  //Filters Grid state for all active squares

  const filteredSquares = game.board.grid
    .flat()
    .filter((square) => square.on !== undefined);
  //For each active piece, creates a mesh clone and places on board
  filteredSquares.forEach((square) => {
    const { name, color, point } = square.on!;
    const foundMesh = meshesList.find(
      (mesh) => mesh.name === name && mesh.color === color
    );
    const clone: AbstractMesh | Nullable<AbstractMesh> = foundMesh!.clone(
      name,
      null,
      false
    );
    [clone!.position.z, clone!.position.x, clone!.isVisible = true] =
      calcMeshCanvasPosition(point);
    gameScene.meshesToRender!.push(clone!);
  });
};

const displayPieceMoves = (
  mesh: ChessPieceMesh,
  currentMove: Point[],
  game: Game,
  gameScene: CustomScene
) => {
  const grid = game.board.grid;
  const state = game.state;
  const turnHistory = game.turnHistory[game.turnHistory.length - 1];
  const [x, y] = calcIndexFromMeshPosition([mesh.position.z, mesh.position.x]);
  const piece = grid[x][y].on;
  displayMovementSquares([[x, y], ""], gameScene, "piece");
  let moves = game.calculateAvailableMoves(piece!, true);
  currentMove.push(piece!.point);
  //Add filter to display only moves that can resolve
  const isValidMoveToDisplay = moves
    .map((move) => {
      //Check for checkmate if move resolves
      const [pieceX, pieceY] = piece!.point;
      const squaresandPieces = getSquaresandPieces(piece!.point, move[0], grid);
      const validMove = canValidMoveResolve(
        squaresandPieces,
        move[0],
        state,
        grid,
        turnHistory,
        game.calculateAvailableMoves
      );
      switchSquaresBack(squaresandPieces, [pieceX, pieceY]);
      return validMove ? move : null;
    })
    .filter((move) => move !== null)
    .forEach((point) => {
      displayMovementSquares(point!, gameScene, "target");
    });
};

const displayMovementSquares = (
  move: Move,
  gameScene: CustomScene,
  desc: string
) => {
  if (desc === "target") {
    const plane: any = BABYLON.MeshBuilder.CreatePlane(`plane`, {
      width: 2.8,
      height: 2.8,
    });
    [plane.position.z, plane.position.x] = calcBabylonCanvasPosition(move[0]); //Z is X ---- X is Y
    plane.point = move[0];
    plane.position.y += 0.51;
    plane.rotation = new BABYLON.Vector3(Math.PI / 2, 0, 0);
    if (move[1] === "capture") {
      plane.material = gameScene.materials.find(
        (material: Material) => material.id === "redMat"
      );
    } else if (move[1] === "movement") {
      plane.material = gameScene.materials.find(
        (material: Material) => material.id === "orangeMat"
      );
    } else if (move[1] === "enPassant") {
      plane.material = gameScene.materials.find(
        (material: Material) => material.id === "purpleMat"
      );
    } else if (move[1] === "castling") {
      plane.material = gameScene.materials.find(
        (material: Material) => material.id === "blueMat"
      );
    }
    gameScene.meshesToRender!.push(plane);
  } else if (desc === "piece") {
    const torus: any = BABYLON.MeshBuilder.CreateTorus("torus", {
      diameter: 2.6,
      thickness: 0.2,
      tessellation: 16,
    });
    [torus.position.z, torus.position.x] = calcBabylonCanvasPosition(move[0]); //Z is X ---- X is Y
    torus.point = move[0];
    torus.position.y += 0.51;
    torus.material = gameScene.materials.find(
      (material: Material) => material.id === "greenMat"
    );
    gameScene.meshesToRender!.push(torus);
  }
};

const rotateCamera = (currentPlayer: string, gameScene: CustomScene) => {
  let camera: any = gameScene.cameras[0];
  let a = camera.alpha;
  let divisible;
  let subtractedDivisible;
  let piDistance;
  let remainingDistance: number;
  let remainder: number;
  if (currentPlayer === "Black") {
    if (a < 0) {
      divisible = Math.ceil(a / Math.PI);
      subtractedDivisible = a - divisible * Math.PI;
      piDistance = Math.abs(Math.PI + subtractedDivisible);
      remainder = divisible % 2;
      remainder
        ? (remainingDistance = piDistance)
        : (remainingDistance = Math.PI - piDistance);
    } else {
      divisible = Math.floor(a / Math.PI);
      subtractedDivisible = a - divisible * Math.PI;
      piDistance = Math.PI - subtractedDivisible;
      remainder = divisible % 2;
      remainder
        ? (remainingDistance = piDistance)
        : (remainingDistance = Math.PI - piDistance);
    }
  } else {
    if (a < 0) {
      divisible = Math.ceil(a / Math.PI);
      subtractedDivisible = a - divisible * Math.PI;
      piDistance = Math.abs(Math.PI + subtractedDivisible);
      remainder = divisible % 2;
      remainder
        ? (remainingDistance = Math.PI - piDistance)
        : (remainingDistance = piDistance);
    } else {
      divisible = Math.floor(a / Math.PI);
      subtractedDivisible = a - divisible * Math.PI;
      piDistance = Math.PI - subtractedDivisible;
      remainder = divisible % 2;
      remainder
        ? (remainingDistance = Math.PI - piDistance)
        : (remainingDistance = piDistance);
    }
  }

  const animateTurnSwitch = (currentPlayer: string = "") => {
    requestAnimationFrame(() => {
      if (currentPlayer === "Black") {
        if (remainingDistance > 0.05) {
          if (remainder) {
            if (remainder < 0) {
              camera.alpha -= 0.05;
            } else {
              camera.alpha += 0.05;
            }
          } else {
            if (a > 0) {
              camera.alpha -= 0.05;
            } else {
              camera.alpha += 0.05;
            }
          }
          remainingDistance -= 0.05;
          animateTurnSwitch(currentPlayer);
        } else if (remainingDistance > 0) {
          if (remainder) {
            if (remainder < 0) {
              camera.alpha -= 0.01;
            } else {
              camera.alpha += 0.01;
            }
          } else {
            if (a > 0) {
              camera.alpha -= 0.01;
            } else {
              camera.alpha += 0.01;
            }
          }
          remainingDistance -= 0.01;
          animateTurnSwitch(currentPlayer);
        }
      } else {
        //If other player
        if (remainingDistance > 0.05) {
          if (remainder) {
            if (remainder < 0) {
              camera.alpha += 0.05;
            } else {
              camera.alpha -= 0.05;
            }
          } else {
            if (a > 0) {
              camera.alpha += 0.05;
            } else {
              camera.alpha -= 0.05;
            }
          }
          remainingDistance -= 0.05;
          animateTurnSwitch(currentPlayer);
        } else if (remainingDistance > 0) {
          if (remainder) {
            if (remainder < 0) {
              camera.alpha += 0.01;
            } else {
              camera.alpha -= 0.01;
            }
          } else {
            if (a > 0) {
              camera.alpha += 0.01;
            } else {
              camera.alpha -= 0.01;
            }
          }
          remainingDistance -= 0.01;
          animateTurnSwitch(currentPlayer);
        }
      }
    });
  };
  animateTurnSwitch(currentPlayer);
};

//Calculate canvas position for loaded meshes
const calcMeshCanvasPosition = (point: Point) => {
  const [x, y] = point;
  let gridX: number;
  let gridY: number;
  //Calculate X
  if (x === 0) {
    gridX = 10.5;
  } else if (x === 1) {
    gridX = 7.5;
  } else if (x === 2) {
    gridX = 4.5;
  } else if (x === 3) {
    gridX = 1.5;
  } else if (x === 4) {
    gridX = -1.5;
  } else if (x === 5) {
    gridX = -4.5;
  } else if (x === 6) {
    gridX = -7.5;
  } else {
    gridX = -10.5;
  }
  //Calculate Y
  if (y === 0) {
    gridY = 10.5;
  } else if (y === 1) {
    gridY = 7.5;
  } else if (y === 2) {
    gridY = 4.5;
  } else if (y === 3) {
    gridY = 1.5;
  } else if (y === 4) {
    gridY = -1.5;
  } else if (y === 5) {
    gridY = -4.5;
  } else if (y === 6) {
    gridY = -7.5;
  } else {
    gridY = -10.5;
  }

  const result: Point = [gridX, gridY];
  return result;
};

//For Babylon meshes, they have different x/y/z relation than loaded meshes
const calcBabylonCanvasPosition = (point: Point) => {
  const [x, y] = point;
  let gridX: number;
  let gridY: number;
  //Calculate X
  if (x === 0) {
    gridX = 10.5;
  } else if (x === 1) {
    gridX = 7.5;
  } else if (x === 2) {
    gridX = 4.5;
  } else if (x === 3) {
    gridX = 1.5;
  } else if (x === 4) {
    gridX = -1.5;
  } else if (x === 5) {
    gridX = -4.5;
  } else if (x === 6) {
    gridX = -7.5;
  } else {
    gridX = -10.5;
  }

  //Calculate Y
  if (y === 0) {
    gridY = -10.5;
  } else if (y === 1) {
    gridY = -7.5;
  } else if (y === 2) {
    gridY = -4.5;
  } else if (y === 3) {
    gridY = -1.5;
  } else if (y === 4) {
    gridY = 1.5;
  } else if (y === 5) {
    gridY = 4.5;
  } else if (y === 6) {
    gridY = 7.5;
  } else {
    gridY = 10.5;
  }

  const result: Point = [gridX, gridY];
  return result;
};

//For game pieces calculation as their index is flipped from blender importing
const calcIndexFromMeshPosition = (point: Point) => {
  const [x, y] = point;
  let indexX: number;
  let indexY: number;
  //Calculate X
  if (x === 10.5) {
    indexX = 0;
  } else if (x === 7.5) {
    indexX = 1;
  } else if (x === 4.5) {
    indexX = 2;
  } else if (x === 1.5) {
    indexX = 3;
  } else if (x === -1.5) {
    indexX = 4;
  } else if (x === -4.5) {
    indexX = 5;
  } else if (x === -7.5) {
    indexX = 6;
  } else {
    indexX = 7;
  }
  //Calculate Y
  if (y === 10.5) {
    indexY = 0;
  } else if (y === 7.5) {
    indexY = 1;
  } else if (y === 4.5) {
    indexY = 2;
  } else if (y === 1.5) {
    indexY = 3;
  } else if (y === -1.5) {
    indexY = 4;
  } else if (y === -4.5) {
    indexY = 5;
  } else if (y === -7.5) {
    indexY = 6;
  } else {
    indexY = 7;
  }
  const result: Point = [indexX, indexY];
  return result;
};

export {
  renderScene,
  rotateCamera,
  displayPieceMoves,
  calcIndexFromMeshPosition,
};
