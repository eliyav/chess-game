import * as BABYLON from "babylonjs";
import assetsLoader from "./asset-loader";
import space from "../../assets/space.jpg";
import { createMovementMaterials } from "../component/materials";

const gameScreen = async (canvas, engine) => {
  const scene = new BABYLON.Scene(engine);
  const camera = new BABYLON.ArcRotateCamera("camera", Math.PI, Math.PI / 4, 35, new BABYLON.Vector3(0, 0, 0), scene);
  camera.attachControl(canvas, true);
  camera.lowerRadiusLimit = 25;
  camera.upperRadiusLimit = 200;
  scene.meshesToRender = [];

  const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 100, 0), scene);
  light.intensity = 0.7;

  const light2 = new BABYLON.SpotLight("spotLight", new BABYLON.Vector3(0, 0, 30), new BABYLON.Vector3(0, 0, -30), 90, 1, scene);
  light2.intensity = 1;
  light2.diffuse = new BABYLON.Color3(0, 0, 0);

  const light3 = new BABYLON.SpotLight("spotLight2", new BABYLON.Vector3(0, 0, -30), new BABYLON.Vector3(0, 0, 30), 90, 1, scene);
  light3.intensity = 1;
  light3.diffuse = new BABYLON.Color3(0, 0, 0);

  const photoDome = new BABYLON.PhotoDome("spaceDome", space, { size: 1000 }, scene);

  createMovementMaterials(scene);

  scene.finalMeshes = await assetsLoader(scene, "gameScreen");

  return scene;
};

export default gameScreen;
