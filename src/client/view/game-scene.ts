import { ArcRotateCamera } from "@babylonjs/core/Cameras/arcRotateCamera.js";
import "@babylonjs/core/Culling/ray.js";
import { Engine } from "@babylonjs/core/Engines/engine";
import { PhotoDome } from "@babylonjs/core/Helpers/photoDome.js";
import { HemisphericLight } from "@babylonjs/core/Lights/hemisphericLight.js";
import { SpotLight } from "@babylonjs/core/Lights/spotLight.js";
import { Color3 } from "@babylonjs/core/Maths/math.color.js";
import { Vector3 } from "@babylonjs/core/Maths/math.vector.js";
import { Scene } from "@babylonjs/core/scene.js";
import space from "../../../assets/space.webp";
import { createAnimations } from "./animation/create-animations";
import { CustomScene, gameAssets } from "./game-assets";
import { createMovementMaterials } from "./materials";

export const gameScene = async (
  canvas: HTMLCanvasElement,
  engine: Engine
): Promise<CustomScene> => {
  const scene: CustomScene = new Scene(engine);
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

  const photoDome = new PhotoDome("spaceDome", space, { size: 500 }, scene);
  photoDome.rotation = new Vector3(0, 1, 1.5);

  createMovementMaterials(scene);
  scene.finalMeshes = await gameAssets(scene);
  scene.animationsContainer = await createAnimations(scene);

  return scene;
};
