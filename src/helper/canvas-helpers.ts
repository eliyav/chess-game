import Game from "../component/game-logic/game";
import { Material } from "babylonjs/Materials/material";
import { CustomScene } from "../view/start-screen";
import { ChessPieceMesh } from "../view/asset-loader";
import { Move } from "../component/game-logic/game-piece";

const renderScene = (game: Game, gameScene: CustomScene) => {
  //Clears old meshes/memory usage
  !gameScene.meshesToRender ? (gameScene.meshesToRender = []) : null;
  if (gameScene.meshesToRender.length) {
    for (let i = 0; i < gameScene.meshesToRender.length; i++) {
      const mesh = gameScene.meshesToRender[i];
      gameScene.removeMesh(mesh);
      mesh.dispose();
    }
    gameScene.meshesToRender = [];
  }
  //Final Piece Mesh List
  const meshesList = gameScene.finalMeshes!.piecesMeshes;
  //For each active piece, creates a mesh clone and places on board
  game.allPieces().forEach((square) => {
    const { name, color, point } = square.on!;
    const foundMesh = meshesList.find(
      (mesh) => mesh.name === name && mesh.color === color
    );
    const clone = foundMesh!.clone(name, null);
    [clone!.position.z, clone!.position.x] = findPosition(point, true);
    clone!.isVisible = true;
    gameScene.meshesToRender!.push(clone!);
  });
};

const displayPieceMoves = (
  mesh: ChessPieceMesh,
  currentMove: Point[],
  game: Game,
  gameScene: CustomScene
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

const displayMovementSquares = (move: Move, gameScene: CustomScene) => {
  const [point, type] = move;
  const plane: any = BABYLON.MeshBuilder.CreatePlane(`plane`, {
    width: 2.8,
    height: 2.8,
  });
  [plane.position.z, plane.position.x] = findPosition(point, false);
  plane.position.y += 0.51;
  plane.rotation = new BABYLON.Vector3(Math.PI / 2, 0, 0);

  plane.material = findMaterial(type, gameScene);
  gameScene.meshesToRender!.push(plane);
};

const displayPieceMarker = (move: Point, gameScene: CustomScene) => {
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

const findMaterial = (moveType: string, gameScene: CustomScene) => {
  const lookupValue = matLookupTable[moveType];
  const material = gameScene.materials.find(
    (mat: Material) => mat.id === lookupValue
  );
  return material;
};

const rotateCamera = (currentPlayer: string, gameScene: CustomScene) => {
  let camera: any = gameScene.cameras[0];
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

  const animateCameraRotation = (currentPlayer: string) => {
    requestAnimationFrame(() => {
      const playerFlag = currentPlayer === "Black" ? true : false;
      const rotateAmount = remainingDistance > 0.05 ? 0.05 : 0.01;
      rotateCam(playerFlag, rotateAmount);
    });

    const rotateCam = (playerFlag: boolean, rotateAmount: number) => {
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
    };
  };
  animateCameraRotation(currentPlayer);
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

export { renderScene, rotateCamera, displayPieceMoves, findIndex };
