import type { AudioEngine } from "@babylonjs/core/Audio";
import { ArcRotateCamera } from "@babylonjs/core/Cameras/arcRotateCamera";
import "@babylonjs/core/Culling/ray";
import { Engine } from "@babylonjs/core/Engines/engine";
import { HemisphericLight } from "@babylonjs/core/Lights/hemisphericLight";
import { PointLight } from "@babylonjs/core/Lights/pointLight";
import { ShadowGenerator } from "@babylonjs/core/Lights/Shadows";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { Scene } from "@babylonjs/core/scene";
import { createAnimations } from "./animation/create-animations";
import { gameSceneAudio } from "./audio-engine";
import { createCelestialSphere } from "./celestial-shere/celestial-sphere";
import { loadGameAssets } from "./game-assets";
import { createMeshMaterials, createMovementMaterials } from "./materials";
import { GameScene } from "./scene-manager";

export const createGameScene = async (
  canvas: HTMLCanvasElement,
  engine: Engine,
  audioEngine: AudioEngine
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
  light.intensity = 0.2;

  const pointLight = new PointLight("pointLight", new Vector3(0, 20, 0), scene);

  const shadowGenerator = new ShadowGenerator(2048, pointLight);

  createCelestialSphere(scene);
  const meshMaterials = createMeshMaterials(scene);
  const movementMaterials = createMovementMaterials(scene);

  await loadGameAssets({ scene, meshMaterials, movementMaterials });

  const gameScene: GameScene = {
    scene,
    data: {
      meshesToRender: [],
      animationsContainer: await createAnimations(scene),
      shadowGenerator: [shadowGenerator],
      audio: {},
    },
  };

  gameSceneAudio({ audioEngine, gameScene });

  return gameScene;
};
