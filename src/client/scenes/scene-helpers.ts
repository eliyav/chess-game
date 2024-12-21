import { Material } from "@babylonjs/core/Materials/material";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { Scene } from "@babylonjs/core/scene";
import { Move, Point } from "../../shared/game";
import { pointIndexMap, pointPositionMap } from "../data/point-map-data";
import { GameScene } from "./scene-manager";

const Y_ABOVE_FLOOR = 0.51;
const Y_ABOVE_FLOOR_EXTENDED = 0.55;

export const showMoves = ({
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
  showSelectedPiece({ move: point, gameScene });
  if (visibleMoves) {
    for (const move of moves) {
      const { type } = move;
      const disc = createMovementDisc({ point, gameScene, type });
      gameScene.data.meshesToRender.push(disc);
    }
  }
};

const showSelectedPiece = ({
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

export const createMovementDisc = ({
  point,
  gameScene,
  type,
  name,
}: {
  point: Point;
  gameScene: GameScene;
  type: string;
  name?: string;
}) => {
  const [z, x] = getPositionFromPoint({
    point,
    externalMesh: false,
  });
  const disc = MeshBuilder.CreateDisc(name || "disc", {
    radius: 1.1,
  });
  disc.isPickable = false;
  //Needed so previous turn marker wont be above display moves
  if (type === "previousTurn") {
    disc.setPositionWithLocalVector(new Vector3(x, Y_ABOVE_FLOOR, z));
  } else {
    disc.setPositionWithLocalVector(new Vector3(x, Y_ABOVE_FLOOR_EXTENDED, z));
  }
  disc.rotation = new Vector3(Math.PI / 2, 0, 0);
  const material = findMaterial(type, gameScene.scene);
  if (material) {
    disc.material = material;
  }
  return disc;
};
