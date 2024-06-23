import { Scene } from "@babylonjs/core/scene.js";
import { Engine } from "@babylonjs/core/Engines/engine";
import { ArcRotateCamera } from "@babylonjs/core/Cameras/arcRotateCamera.js";
import { Vector3 } from "@babylonjs/core/Maths/math.vector.js";
import { HemisphericLight } from "@babylonjs/core/Lights/hemisphericLight.js";
import { SpotLight } from "@babylonjs/core/Lights/spotLight.js";
import { PhotoDome } from "@babylonjs/core/Helpers/photoDome.js";
import { Color3 } from "@babylonjs/core/Maths/math.color.js";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { AssetContainer } from "@babylonjs/core/assetContainer";
import space from "../../../assets/space.webp";
import { gameAssets } from "./game-assets";
import { createMovementMaterials } from "./materials";
import { CustomScene } from "./game-assets";
import "@babylonjs/core/Animations/animatable.js";
import "@babylonjs/core/Culling/ray.js";

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

  //#region Animations
  //Pawn Animations
  const pawnAnimationContainer = new AssetContainer(scene);

  scene.finalMeshes?.animations?.Pawn.meshes.forEach((mesh) =>
    pawnAnimationContainer!.meshes.push(mesh)
  );

  scene.finalMeshes?.animations?.Pawn.animationGroups.forEach((anim) =>
    pawnAnimationContainer!.animationGroups.push(anim)
  );

  // pawnAnimationContainer.meshes.forEach(mesh => mesh.)
  pawnAnimationContainer.removeAllFromScene();

  // Rook Animations
  const rookAnimationContainer = new AssetContainer(scene);

  scene.finalMeshes?.animations?.Rook.meshes.forEach((mesh) =>
    rookAnimationContainer!.meshes.push(mesh)
  );
  scene.finalMeshes?.animations?.Rook.animationGroups.forEach((anim) =>
    rookAnimationContainer!.animationGroups.push(anim)
  );

  rookAnimationContainer.removeAllFromScene();

  // Bishop Animations
  const bishopAnimationContainer = new AssetContainer(scene);

  scene.finalMeshes?.animations?.Bishop.meshes.forEach((mesh) =>
    bishopAnimationContainer!.meshes.push(mesh)
  );
  scene.finalMeshes?.animations?.Bishop.animationGroups.forEach((anim) =>
    bishopAnimationContainer!.animationGroups.push(anim)
  );

  bishopAnimationContainer.removeAllFromScene();

  // Knight Animations
  const knightAnimationContainer = new AssetContainer(scene);

  scene.finalMeshes?.animations?.Knight.meshes.forEach((mesh) =>
    knightAnimationContainer!.meshes.push(mesh)
  );
  scene.finalMeshes?.animations?.Knight.animationGroups.forEach((anim) =>
    knightAnimationContainer!.animationGroups.push(anim)
  );

  knightAnimationContainer.removeAllFromScene();

  // Queen Animations
  const queenAnimationContainer = new AssetContainer(scene);

  scene.finalMeshes?.animations?.Queen.meshes.forEach((mesh) =>
    queenAnimationContainer!.meshes.push(mesh)
  );
  scene.finalMeshes?.animations?.Queen.animationGroups.forEach((anim) =>
    queenAnimationContainer!.animationGroups.push(anim)
  );

  queenAnimationContainer.removeAllFromScene();

  //#endregion

  scene.animationsContainer = {
    Pawn: pawnAnimationContainer,
    Bishop: bishopAnimationContainer,
    Rook: rookAnimationContainer,
    Knight: knightAnimationContainer,
    Queen: queenAnimationContainer,
  };

  scene.finalMeshes?.boardMeshes.forEach((mesh, idx) => {
    if (idx === 2) {
      const material = new StandardMaterial("light", scene);
      material.diffuseColor = new Color3(0.01, 0.01, 0.01);
      material.specularColor = new Color3(0.01, 0.01, 0.01);
      mesh.material = material;
    }
  });

  return scene;
};
