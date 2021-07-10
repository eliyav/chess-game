import * as BABYLON from "babylonjs";

function createScene(canvas) {
  const engine = new BABYLON.Engine(canvas, true);
  const scene = new BABYLON.Scene(engine);
  scene.meshesToRender = [];

  const camera = new BABYLON.ArcRotateCamera("camera", -Math.PI / 1, Math.PI / 3.5, 30, new BABYLON.Vector3(0, 0, 0), scene);
  //camera.attachControl(canvas, true);
  camera.useFramingBehavior = false;

  const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(10, 1, 0), scene);
  const light2 = new BABYLON.HemisphericLight("light2", new BABYLON.Vector3(-10, 1, 0), scene);
  const light3 = new BABYLON.HemisphericLight("light3", new BABYLON.Vector3(0, 1, 0), scene);

  const animateDistance = () => {
    requestAnimationFrame(() => {
      animateDistance();
    });
  };

  return { engine, scene };
}

export default createScene;
