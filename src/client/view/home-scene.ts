import { Scene } from "@babylonjs/core/scene.js";
import { Engine } from "@babylonjs/core/Engines/engine";
import { ArcRotateCamera } from "@babylonjs/core/Cameras/arcRotateCamera.js";
import { Vector3 } from "@babylonjs/core/Maths/math.vector.js";
import { HemisphericLight } from "@babylonjs/core/Lights/hemisphericLight.js";
import { PhotoDome } from "@babylonjs/core/Helpers/photoDome.js";
import space from "../../../assets/space.webp";
import { CustomScene } from "./game-assets";
import { displayAssets } from "./display-assets";
import { Scenes } from "../components/scene-manager";

export const homeScene = async (
  engine: Engine,
  activeScene: { id: Scenes }
): Promise<CustomScene> => {
  const scene: CustomScene = new Scene(engine);
  const camera = new ArcRotateCamera(
    "camera",
    Math.PI * 1.2,
    Math.PI / 4.5,
    60,
    new Vector3(0, 0, 0),
    scene
  );
  camera.useFramingBehavior = false;

  new HemisphericLight("light", new Vector3(0, 1, 0), scene);
  new PhotoDome("spaceDome", space, { size: 250 }, scene);

  await displayAssets(scene, activeScene);

  return scene;
};
