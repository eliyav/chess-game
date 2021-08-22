import * as BABYLON from "babylonjs";
import space from "../../assets/space.jpg";

const promotionScreen = async (canvas, engine) => {
  const scene = new BABYLON.Scene(engine);
  const camera = new BABYLON.ArcRotateCamera("camera", Math.PI / 1, Math.PI / 3.5, 30, new BABYLON.Vector3(0, 0, 0), scene);
  camera.useFramingBehavior = false;

  const light = new BABYLON.HemisphericLight("light3", new BABYLON.Vector3(0, 1, 0), scene);

  const photoDome = new BABYLON.PhotoDome("spacedome", space, { size: 500 }, scene);

  return scene;
};

export default promotionScreen;
