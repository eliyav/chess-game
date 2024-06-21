import * as BABYLON from "babylonjs";
import "babylonjs-loaders";
import space from "../../../assets/space.webp";
import { CustomScene } from "./game-assets";
import { Scene } from "babylonjs/scene";
import { ChessPieceMesh } from "./game-assets";
import { AbstractMesh } from "babylonjs/Meshes/abstractMesh";
import { displayAssets } from "./display-assets";
import { SceneTypes } from "../components/scene-manager";

export const homeScene = async (
  engine: BABYLON.Engine,
  activeScene: { id: SceneTypes }
): Promise<CustomScene> => {
  const scene: CustomScene = new BABYLON.Scene(engine);
  const camera = new BABYLON.ArcRotateCamera(
    "camera",
    Math.PI * 1.2,
    Math.PI / 4.5,
    60,
    new BABYLON.Vector3(0, 0, 0),
    scene
  );
  camera.useFramingBehavior = false;

  new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);
  new BABYLON.PhotoDome("spaceDome", space, { size: 250 }, scene);

  await displayAssets(scene, activeScene);

  return scene;
};

export interface DisplayScene extends Scene {
  finalMeshes?: {
    piecesMeshes: ChessPieceMesh[];
    boardMeshes: AbstractMesh[];
  };
  meshesToRender?: AbstractMesh[];
}
