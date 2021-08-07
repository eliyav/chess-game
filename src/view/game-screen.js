import * as BABYLON from "babylonjs";
import assetsLoader from "./asset-loader";
import space from "../../assets/space.jpg";

const gameScreen = async (canvas, engine) => {
  const scene = new BABYLON.Scene(engine);
  const camera = new BABYLON.ArcRotateCamera("camera", -Math.PI / 1, Math.PI / 3.5, 30, new BABYLON.Vector3(0, 0, 0), scene);
  camera.attachControl(canvas, true);
  camera.useFramingBehavior = false;
  scene.meshesToRender = [];

  const light = new BABYLON.HemisphericLight("light3", new BABYLON.Vector3(0, 1, 0), scene);

  const greenMat = new BABYLON.StandardMaterial("greenMat", scene);

  const photoDome = new BABYLON.PhotoDome("spacedome", space, { size: 1000 }, scene);

  scene.finalMeshes = await assetsLoader(scene, "gameScreen");

  return scene;
};

export default gameScreen;
