import { ArcRotateCamera } from "@babylonjs/core/Cameras/arcRotateCamera.js";
import "@babylonjs/core/Culling/ray.js";
import { Engine } from "@babylonjs/core/Engines/engine";
import { HemisphericLight } from "@babylonjs/core/Lights/hemisphericLight.js";
import { SpotLight } from "@babylonjs/core/Lights/spotLight.js";
import { Color3 } from "@babylonjs/core/Maths/math.color.js";
import { Vector3 } from "@babylonjs/core/Maths/math.vector.js";
import { Scene } from "@babylonjs/core/scene.js";
import { GameScene } from "../components/scene-manager";
import { createAnimations } from "./animation/create-animations";
import { createCelestialSphere } from "./celestial-shere/celestial-sphere";
import { loadGameAssets } from "./game-assets";
import { createMeshMaterials, createMovementMaterials } from "./materials";

export const gameScene = async (
  canvas: HTMLCanvasElement,
  engine: Engine
): Promise<GameScene> => {
  const scene = new Scene(engine);
  const camera = new ArcRotateCamera(
    "camera",
    Math.PI,
    Math.PI / 4,
    70,
    new Vector3(0, 0, 0),
    scene
  );
  camera.lowerRadiusLimit = 25;
  camera.upperRadiusLimit = 70;
  camera.attachControl(canvas, true);

  const light = new HemisphericLight("light", new Vector3(0, 100, 0), scene);
  light.intensity = 0.8;

  const light2 = new SpotLight(
    "spotLight",
    new Vector3(0, 20, 30),
    new Vector3(0, 0, -30),
    90,
    1,
    scene
  );
  light2.intensity = 0.8;
  light2.diffuse = new Color3(0, 0, 0);

  const light3 = new SpotLight(
    "spotLight2",
    new Vector3(0, 20, -30),
    new Vector3(0, 0, 30),
    90,
    1,
    scene
  );
  light3.intensity = 0.8;
  light3.diffuse = new Color3(0, 0, 0);

  createCelestialSphere(scene);
  createMovementMaterials(scene);
  createMeshMaterials(scene);

  await loadGameAssets(scene);

  const gameScene = {
    scene,
    data: {
      meshesToRender: [],
      animationsContainer: await createAnimations(scene),
    },
  };

  return gameScene;
};
