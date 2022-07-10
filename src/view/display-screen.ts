import * as BABYLON from "babylonjs";
import "babylonjs-loaders";
import space from "../../assets/space.webp";
import { CustomGameScene } from "./game-assets";
import { Scene } from "babylonjs/scene";
import { ChessPieceMesh } from "./game-assets";
import { AbstractMesh } from "babylonjs/Meshes/abstractMesh";
import { displayAssets } from "./display-assets";

export const displayScreen = async (
  engine: BABYLON.Engine
): Promise<CustomGameScene> => {
  const scene: CustomGameScene = new BABYLON.Scene(engine);
  const camera = new BABYLON.ArcRotateCamera(
    "camera",
    Math.PI / 1,
    Math.PI / 3.5,
    40,
    new BABYLON.Vector3(0, 0, 0),
    scene
  );
  camera.useFramingBehavior = false;

  new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);
  new BABYLON.PhotoDome("spaceDome", space, { size: 250 }, scene);

  await displayAssets(scene);

  return scene;
};

export interface DisplayScene extends Scene {
  finalMeshes?: {
    piecesMeshes: ChessPieceMesh[];
    boardMeshes: AbstractMesh[];
  };
  meshesToRender?: AbstractMesh[];
}
