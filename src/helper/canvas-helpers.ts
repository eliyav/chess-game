import Game from "../components/game-logic/game";
import { Material } from "babylonjs/Materials/material";
import { ChessPieceMesh, CustomGameScene } from "../view/game-assets";
import { Move } from "../components/game-logic/game-piece";

const displayPieceMoves = (
  mesh: ChessPieceMesh,
  currentMove: Point[],
  game: Game,
  gameScene: CustomGameScene
) => {
  const piece = game.lookupPiece(
    findIndex([mesh.position.z, mesh.position.x], true)
  )!;
  displayPieceMarker(piece.point, gameScene);
  currentMove.push(piece!.point);
  //Display valid moves on canvas
  const movesToDisplay = game.getValidMoves(piece);
  movesToDisplay.forEach((move) => {
    displayMovementSquares(move!, gameScene);
  });
};

const displayMovementSquares = (move: Move, gameScene: CustomGameScene) => {
  const [point, type] = move;
  const plane: any = BABYLON.MeshBuilder.CreatePlane(`plane`, {
    width: 2.5,
    height: 2.5,
  });
  [plane.position.z, plane.position.x] = findPosition(point, false);
  plane.position.y += 0.52;
  plane.rotation = new BABYLON.Vector3(Math.PI / 2, 0, 0);
  plane.material = findMaterial(type, gameScene);
  gameScene.meshesToRender!.push(plane);
};

const displayPieceMarker = (move: Point, gameScene: CustomGameScene) => {
  let type = "piece";
  const torus: any = BABYLON.MeshBuilder.CreateTorus("torus", {
    diameter: 2.6,
    thickness: 0.2,
    tessellation: 16,
  });
  [torus.position.z, torus.position.x] = findPosition(move, false); //Z is X ---- X is Y
  torus.position.y += 0.51;
  torus.material = findMaterial(type, gameScene);
  gameScene.meshesToRender!.push(torus);
};

const matLookupTable: { [key: string]: string } = {
  capture: "redMat",
  movement: "orangeMat",
  enPassant: "purpleMat",
  castling: "blueMat",
  piece: "greenMat",
};

const findMaterial = (moveType: string, gameScene: CustomGameScene) => {
  const lookupValue = matLookupTable[moveType];
  const material = gameScene.materials.find(
    (mat: Material) => mat.id === lookupValue
  );
  return material;
};

//External Meshes have flipped Y coordinates on canvas from blender import
const findPosition = (point: Point, externalMesh: boolean) => {
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
  if (externalMesh) {
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
  } else {
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
  }

  const result: Point = [gridX, gridY];
  return result;
};

//External Meshes have flipped Y coordinates on canvas from blender import
const findIndex = (position: Point, externalMesh: boolean) => {
  const [x, y] = position;
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
  if (externalMesh) {
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
  } else {
    if (y === -10.5) {
      indexY = 0;
    } else if (y === -7.5) {
      indexY = 1;
    } else if (y === -4.5) {
      indexY = 2;
    } else if (y === -1.5) {
      indexY = 3;
    } else if (y === 1.5) {
      indexY = 4;
    } else if (y === 4.5) {
      indexY = 5;
    } else if (y === 7.5) {
      indexY = 6;
    } else {
      indexY = 7;
    }
  }
  const result: Point = [indexX, indexY];
  return result;
};

export { displayPieceMoves, findIndex, findPosition };
