import * as BABYLON from "babylonjs";
import { Engine } from "babylonjs/Engines/engine";
import space from "../../assets/space.jpg";
import assetsLoader from "./asset-loader";

const startScreen = async (canvas: HTMLCanvasElement, engine: Engine) => {
  const scene: BABYLON.Scene = new BABYLON.Scene(engine);
  const camera = new BABYLON.ArcRotateCamera("camera", Math.PI / 1, Math.PI / 3.5, 30, new BABYLON.Vector3(0, 0, 0), scene);
  camera.useFramingBehavior = false;

  const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);

  const photoDome = new BABYLON.PhotoDome("spaceDome", space, { size: 500 }, scene);

//@ts-ignore
  scene.finalMeshes = await assetsLoader(scene, "startScreen");

  return scene;
};

export default startScreen;
