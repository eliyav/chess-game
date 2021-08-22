import * as BABYLON from "babylonjs";
import assetsLoader from "./asset-loader";
import space from "../../assets/space.jpg";

const gameScreen = async (canvas, engine) => {
  const scene = new BABYLON.Scene(engine);
  const camera = new BABYLON.ArcRotateCamera("camera", Math.PI, Math.PI / 4, 35, new BABYLON.Vector3(0, 0, 0), scene);
  camera.attachControl(canvas, true);
  camera.useFramingBehavior = false;
  camera.lowerRadiusLimit = 25;
  camera.upperRadiusLimit = 200;
  scene.meshesToRender = [];

  const light = new BABYLON.HemisphericLight("light3", new BABYLON.Vector3(0, 100, 0), scene);
  light.intensity = 0.7;

  const light2 = new BABYLON.SpotLight("spotLight", new BABYLON.Vector3(0, 0, 30), new BABYLON.Vector3(0, 0, -30), 90, 1, scene);
  light2.intensity = 1;
  //light2.specular = new BABYLON.Color3(0, 0, 0);
  light2.diffuse = new BABYLON.Color3(0, 0, 0);

  const light3 = new BABYLON.SpotLight("spotLight", new BABYLON.Vector3(0, 0, -30), new BABYLON.Vector3(0, 0, 30), 90, 1, scene);
  light3.intensity = 1;
  //light2.specular = new BABYLON.Color3(0, 0, 0);
  light3.diffuse = new BABYLON.Color3(0, 0, 0);

  const greenMat = new BABYLON.StandardMaterial("greenMat", scene);
  greenMat.diffuseColor = new BABYLON.Color3(0, 1, 0.2);
  greenMat.specularColor = new BABYLON.Color3(0.15, 0.15, 0.15);

  const orangeMat = new BABYLON.StandardMaterial("orangeMat", scene);
  orangeMat.diffuseColor = new BABYLON.Color3(1, 0.64, 0);
  orangeMat.specularColor = new BABYLON.Color3(0.15, 0.15, 0.15);

  const redMat = new BABYLON.StandardMaterial("redMat", scene);
  redMat.diffuseColor = new BABYLON.Color3(1, 0, 0);
  redMat.specularColor = new BABYLON.Color3(0.15, 0.15, 0.15);

  const purpleMat = new BABYLON.StandardMaterial("purpleMat", scene);
  purpleMat.diffuseColor = new BABYLON.Color3(1, 0, 1);
  purpleMat.specularColor = new BABYLON.Color3(0.15, 0.15, 0.15);

  const blueMat = new BABYLON.StandardMaterial("blueMat", scene);
  blueMat.diffuseColor = new BABYLON.Color3(0, 0.2, 0.8);
  blueMat.specularColor = new BABYLON.Color3(0.15, 0.15, 0.15);

  const photoDome = new BABYLON.PhotoDome("spacedome", space, { size: 1000 }, scene);

  scene.finalMeshes = await assetsLoader(scene, "gameScreen");

  return scene;
};

export default gameScreen;
