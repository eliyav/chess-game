import * as BABYLON from "babylonjs";
import * as GUI from "babylonjs-gui";
import assetsLoader from "./asset-loader";
import sky from "../../assets/sky.jpg";

const gameScreen = async (canvas, appContext) => {
  const scene = new BABYLON.Scene(appContext.engine);
  const camera = new BABYLON.ArcRotateCamera("camera", -Math.PI / 1, Math.PI / 3.5, 30, new BABYLON.Vector3(0, 0, 0), scene);
  camera.attachControl(canvas, true);
  camera.useFramingBehavior = false;
  scene.meshesToRender = [];
  const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(10, 1, 0), scene);
  const light2 = new BABYLON.HemisphericLight("light2", new BABYLON.Vector3(-10, 1, 0), scene);
  const light3 = new BABYLON.HemisphericLight("light3", new BABYLON.Vector3(0, 1, 0), scene);

  const photoDome = new BABYLON.PhotoDome("skydome", sky, { size: 1000 }, scene);

  scene.finalMeshes = await assetsLoader();

  return scene;
};

export default gameScreen;
