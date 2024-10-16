import { Material } from "@babylonjs/core/Materials/material";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { Scene } from "@babylonjs/core/scene";
import { Move, Point } from "../../shared/game";
import { pointIndexMap, pointPositionMap } from "../data/point-map-data";
import { GameScene } from "./scene-manager";

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
  const disc = MeshBuilder.CreateDisc(`disc`, {
    radius: 1,
  });
  disc.isPickable = false;
  const [z, x] = getPositionFromPoint({
    point,
    externalMesh: false,
  });
  disc.setPositionWithLocalVector(new Vector3(x, Y_ABOVE_FLOOR, z));
  disc.rotation = new Vector3(Math.PI / 2, 0, 0);
  const material = findMaterial(type, gameScene.scene);
  if (material) {
    if (!visibleMoves) {
      material.alpha = 0;
    }
    disc.material = material;
  }

  gameScene.data.meshesToRender.push(disc);
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
  torus.isPickable = false;
  const [z, x] = getPositionFromPoint({
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

export const getPointFromPosition = ({
  position,
  externalMesh,
}: {
  position: Point;
  externalMesh: boolean;
}): Point => {
  const [x, y] = position;
  const pointX = pointIndexMap.get(x)!;
  const pointY = pointIndexMap.get(y)!;
  //External Meshes have flipped Y coordinates on canvas from blender import
  const finalY = externalMesh ? pointY.externalY : pointY.y;
  const result: Point = [pointX.x, finalY];
  return result;
};

export const getPositionFromPoint = ({
  point,
  externalMesh,
}: {
  point: Point;
  externalMesh: boolean;
}) => {
  const [x, y] = point;
  const positionX = pointPositionMap.get(x)!;
  const positionY = pointPositionMap.get(y)!;
  //External Meshes have flipped Y coordinates on canvas from blender import
  const finalY = externalMesh ? positionY.externalY : positionY.y;
  const result: Point = [positionX.x, finalY];
  return result;
};
