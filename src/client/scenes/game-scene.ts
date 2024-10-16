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
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { Point } from "../../shared/game";
import { Material } from "@babylonjs/core/Materials/material";
import { Color3 } from "@babylonjs/core/Maths/math";
import { StandardMaterial } from "@babylonjs/core";
import { getPositionFromPoint } from "./scene-helpers";

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

  const pointLight = new PointLight(
    "pointLight",
    new Vector3(15, 20, 0),
    scene
  );
  const pointLight2 = new PointLight(
    "pointLight2",
    new Vector3(-15, 20, 0),
    scene
  );
  pointLight.intensity = 0.5;
  pointLight2.intensity = 0.5;

  const shadowGenerator = new ShadowGenerator(2048, pointLight);
  const shadowGenerator2 = new ShadowGenerator(2048, pointLight2);

  createCelestialSphere(scene);
  createMovementMaterials(scene);
  createMeshMaterials(scene);

  const chessBoardPoints: Point[] = [];
  for (let x = 0; x < 8; x++) {
    for (let z = 0; z < 8; z++) {
      chessBoardPoints.push([x, z]);
    }
  }

  chessBoardPoints.forEach((point) => {
    const plane = MeshBuilder.CreatePlane(`plane`, {
      size: 2.8,
    });
    const [z, x] = getPositionFromPoint({
      point,
      externalMesh: false,
    });
    plane.setPositionWithLocalVector(new Vector3(x, 0.51, z));
    plane.rotation = new Vector3(Math.PI / 2, 0, 0);
    plane.material = new StandardMaterial("planeMaterial", scene);
    plane.material.alpha = 0;
    scene.addMesh(plane);
  });

  await loadGameAssets(scene);

  const gameScene: GameScene = {
    scene,
    data: {
      meshesToRender: [],
      animationsContainer: await createAnimations(scene),
      shadowGenerator: [shadowGenerator, shadowGenerator2],
      audio: {},
    },
  };

  gameSceneAudio({ audioEngine, gameScene });

  return gameScene;
};
