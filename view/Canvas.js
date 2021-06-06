import Game from "../src/Game";
import assetsLoader from "./assetLoader";
import assetTransforms from "./assetTransforms";

async function createCanvas(engine, canvas, BABYLON, chessData) {
  const scene = new BABYLON.Scene(engine);

  scene.finalMeshList = await assetsLoader(BABYLON);
  await assetTransforms(scene.finalMeshList, chessData);

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
  console.log(scene);
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
