import { Material } from "@babylonjs/core/Materials/material";
import { Vector3 } from "@babylonjs/core/Maths/math.vector.js";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { GameScene } from "./scene-manager";
import { pointIndexMap, pointPositionMap } from "../data/point-map-data";
import GamePiece from "../../shared/game-piece";
import { Scene } from "@babylonjs/core/scene";
import { Move, Point } from "../../shared/game";

const Y_ABOVE_FLOOR = 0.51;

export const displayPieceMoves = ({
  point,
  moves,
  gameScene,
  visibleMoves,
}: {
  point: Point;
  moves: Move[];
  gameScene: GameScene;
  visibleMoves: boolean;
}) => {
  highlightPiece({ move: point, gameScene });
  moves.forEach((move) => {
    highlightValidMoves({ move, gameScene, visibleMoves });
  });
};

const highlightValidMoves = ({
  move,
  gameScene,
  visibleMoves,
}: {
  move: Move;
  gameScene: GameScene;
  visibleMoves: boolean;
}) => {
  const [point, type] = move;
  const plane = MeshBuilder.CreatePlane(`plane`, {
    width: 2.5,
    height: 2.5,
  });
  const [z, x] = findByPoint({
    get: "position",
    point,
    externalMesh: false,
  });
  plane.setPositionWithLocalVector(new Vector3(x, Y_ABOVE_FLOOR, z));
  plane.rotation = new Vector3(Math.PI / 2, 0, 0);
  const material = findMaterial(type, gameScene.scene);
  if (material) {
    if (!visibleMoves) {
      material.alpha = 0;
    }
    plane.material = material;
  }

  gameScene.data.meshesToRender.push(plane);
};

const highlightPiece = ({
  move,
  gameScene,
}: {
  move: Point;
  gameScene: GameScene;
}) => {
  const torus = MeshBuilder.CreateTorus("torus", {
    diameter: 2.6,
    thickness: 0.2,
    tessellation: 16,
  });
  const [z, x] = findByPoint({
    get: "position",
    point: move,
    externalMesh: false,
  });
  torus.setPositionWithLocalVector(new Vector3(x, Y_ABOVE_FLOOR, z));
  const material = findMaterial("piece", gameScene.scene);
  if (material) {
    torus.material = material;
  }
  gameScene.data.meshesToRender.push(torus);
};

const findMaterial = (name: string, scene: Scene) => {
  return scene.materials.find((mat: Material) => mat.id === name);
};

export const findByPoint = ({
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
    // console.error(error);
    //# Refactor this error handling
    return point;
  }
};
