import Game from "../src/Game";
import assetsLoader from "./assetLoader";

async function createCanvas(engine, canvas, BABYLON, GUI, movePiece) {
  const scene = new BABYLON.Scene(engine);

  await assetsLoader(BABYLON);

  //#region temp scaling
  scene.meshes[0].scalingDeterminant = 50;
  scene.meshes[1].scalingDeterminant = 50;
  scene.meshes[2].scalingDeterminant = 50;
  scene.meshes[3].scalingDeterminant = 50;
  //#endregion

  //#region camera
  const camera = new BABYLON.ArcRotateCamera("camera", -Math.PI / 1, Math.PI / 3, 40, new BABYLON.Vector3(0, 0, 0), scene);
  camera.attachControl(canvas, true);
  camera.useFramingBehavior = true;
  //#endregion

  //#region light
  const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(1, 1, 0), scene);
  //#endregion

  //#region 3D UI manager

  //#endregion

  //#region ticker
  const animateDistance = () => {
    requestAnimationFrame(() => {
      animateDistance();
    });
  };

  //#endregion

  animateDistance();
  return scene;
}

export default createCanvas;
