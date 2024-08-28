import { Material } from "@babylonjs/core/Materials/material";
import { Vector3 } from "@babylonjs/core/Maths/math.vector.js";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import Game from "../components/game-logic/game";
import { Move } from "../components/game-logic/game-piece";
import { GameScene } from "../components/scene-manager";
import type { ChessPieceMesh } from "../view/game-assets";
import { pointIndexMap, pointPositionMap } from "./point-map-data";

const displayPieceMoves = (
  mesh: ChessPieceMesh,
  currentMove: Point[],
  game: Game,
  gameScene: GameScene
) => {
  const piece = game.lookupPiece(
    findByPoint({
      get: "index",
      point: [mesh.position.z, mesh.position.x],
      externalMesh: true,
    })
  )!;
  displayPieceMarker(piece.point, gameScene);
  currentMove.push(piece!.point);
  //Display valid moves on canvas
  const movesToDisplay = game.getValidMoves(piece);
  movesToDisplay.forEach((move) => {
    displayMovementSquares(move!, gameScene);
  });
};

const displayMovementSquares = (move: Move, gameScene: GameScene) => {
  const [point, type] = move;
  const plane: any = MeshBuilder.CreatePlane(`plane`, {
    width: 2.5,
    height: 2.5,
  });
  [plane.position.z, plane.position.x] = findByPoint({
    get: "position",
    point,
    externalMesh: false,
  });
  plane.position.y += 0.52;
  plane.rotation = new Vector3(Math.PI / 2, 0, 0);
  plane.material = findMaterial(type, gameScene);
  gameScene.data.meshesToRender.push(plane);
};

const displayPieceMarker = (move: Point, gameScene: GameScene) => {
  let type = "piece";
  const torus: any = MeshBuilder.CreateTorus("torus", {
    diameter: 2.6,
    thickness: 0.2,
    tessellation: 16,
  });
  [torus.position.z, torus.position.x] = findByPoint({
    get: "position",
    point: move,
    externalMesh: false,
  }); //Z is X ---- X is Y
  torus.position.y += 0.51;
  torus.material = findMaterial(type, gameScene);
  gameScene.data.meshesToRender.push(torus);
};

const matLookupTable: { [key: string]: string } = {
  capture: "redMat",
  movement: "orangeMat",
  enPassant: "purpleMat",
  castling: "blueMat",
  piece: "greenMat",
};

const findMaterial = (moveType: string, gameScene: GameScene) => {
  const lookupValue = matLookupTable[moveType];
  const material = gameScene.scene.materials.find(
    (mat: Material) => mat.id === lookupValue
  );
  return material;
};

const findByPoint = ({
  get,
  point,
  externalMesh,
}: {
  get: "index" | "position";
  point: Point;
  externalMesh: boolean;
}) => {
  try {
    const [x, y] = point;
    const map = get === "index" ? pointIndexMap : pointPositionMap;
    const positionX = map.get(x);
    const positionY = map.get(y);
    if (!positionX || !positionY) {
      throw new Error("Invalid position");
    }
    //External Meshes have flipped Y coordinates on canvas from blender import
    const finalY = externalMesh ? positionY.externalY : positionY.y;
    const result: Point = [positionX.x, finalY];
    return result;
  } catch (error) {
    console.error(error);
    //# Refactor this error handling
    return point;
  }
};

export { displayPieceMoves, findByPoint };
