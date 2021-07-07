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
  const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(1, 1, 0), scene);
  //#endregion

  //#region 3D UI manager --Maybe incorporate later instead of x/y coordinates
  // const manager = new GUI.GUI3DManager(scene);
  // const anchor = new BABYLON.AbstractMesh("anchor", scene);
  // const button = new GUI.HolographicButton("test");
  // manager.addControl(button);
  // button.linkToTransformNode(anchor);
  // button.position.y = 1;
  // button.node.rotation.x = 1.58;
  // button.node.rotation.y = 1.58;

  // button.text = "rotate";
  // // button.onPointerUpObservable.add(function () {
  // //   donut.rotation.x -= 0.05;
  // // });
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
