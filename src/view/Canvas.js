import assetsLoader from "./assetLoader";
import { renderScene } from "../helper/canvasHelpers";

async function Canvas(engine, canvas, game, BABYLON, GUI) {
  const scene = new BABYLON.Scene(engine);
  scene.meshesToRender = [];
  scene.finalMeshes = await assetsLoader(BABYLON);
  renderScene(game, scene, scene.finalMeshes);

  //#region camera
  const camera = new BABYLON.ArcRotateCamera("camera", -Math.PI / 1, Math.PI / 3.5, 30, new BABYLON.Vector3(0, 0, 0), scene);
  //camera.attachControl(canvas, true);
  camera.useFramingBehavior = false;
  //#endregion

  //#region light
  const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(10, 1, 0), scene);
  const light2 = new BABYLON.HemisphericLight("light2", new BABYLON.Vector3(-10, 1, 0), scene);
  const light3 = new BABYLON.HemisphericLight("light3", new BABYLON.Vector3(0, 1, 0), scene);
  //#endregion

  //#region ticker
  const animateDistance = () => {
    requestAnimationFrame(() => {
      animateDistance();
    });
  };
  // animateDistance();
  //#endregion

  return scene;
}

export default Canvas;
