import * as BABYLON from "babylonjs";
import space from "../../assets/space.webp";
import { gameAssets } from "./game-assets";
import { createMovementMaterials } from "./materials";
import { CustomGameScene } from "./game-assets";

const gameScreen = async (
  canvas: HTMLCanvasElement,
  engine: BABYLON.Engine
): Promise<CustomGameScene> => {
  const scene: CustomGameScene = new BABYLON.Scene(engine);
  const camera = new BABYLON.ArcRotateCamera(
    "camera",
    Math.PI,
    Math.PI / 4,
    70,
    new BABYLON.Vector3(0, 0, 0),
    scene
  );
  camera.lowerRadiusLimit = 25;
  camera.upperRadiusLimit = 200;
  camera.attachControl(canvas, true);

  const light = new BABYLON.HemisphericLight(
    "light",
    new BABYLON.Vector3(0, 100, 0),
    scene
  );
  light.intensity = 0.8;

  const light2 = new BABYLON.SpotLight(
    "spotLight",
    new BABYLON.Vector3(0, 20, 30),
    new BABYLON.Vector3(0, 0, -30),
    90,
    1,
    scene
  );
  light2.intensity = 0.8;
  light2.diffuse = new BABYLON.Color3(0, 0, 0);

  const light3 = new BABYLON.SpotLight(
    "spotLight2",
    new BABYLON.Vector3(0, 20, -30),
    new BABYLON.Vector3(0, 0, 30),
    90,
    1,
    scene
  );
  light3.intensity = 0.8;
  light3.diffuse = new BABYLON.Color3(0, 0, 0);

  const photoDome = new BABYLON.PhotoDome(
    "spaceDome",
    space,
    { size: 500 },
    scene
  );
  photoDome.rotation = new BABYLON.Vector3(0, 1, 1.5);

  createMovementMaterials(scene);
  scene.finalMeshes = await gameAssets(scene);

  //#region Animations
  //Pawn Animations
  const pawnAnimationContainer = new BABYLON.AssetContainer(scene);

  scene.finalMeshes?.animations?.Pawn.meshes.forEach((mesh) =>
    pawnAnimationContainer!.meshes.push(mesh)
  );

  scene.finalMeshes?.animations?.Pawn.animationGroups.forEach((anim) =>
    pawnAnimationContainer!.animationGroups.push(anim)
  );

  // pawnAnimationContainer.meshes.forEach(mesh => mesh.)
  pawnAnimationContainer.removeAllFromScene();

  // Rook Animations
  const rookAnimationContainer = new BABYLON.AssetContainer(scene);

  scene.finalMeshes?.animations?.Rook.meshes.forEach((mesh) =>
    rookAnimationContainer!.meshes.push(mesh)
  );
  scene.finalMeshes?.animations?.Rook.animationGroups.forEach((anim) =>
    rookAnimationContainer!.animationGroups.push(anim)
  );

  rookAnimationContainer.removeAllFromScene();

  // Bishop Animations
  const bishopAnimationContainer = new BABYLON.AssetContainer(scene);

  scene.finalMeshes?.animations?.Bishop.meshes.forEach((mesh) =>
    bishopAnimationContainer!.meshes.push(mesh)
  );
  scene.finalMeshes?.animations?.Bishop.animationGroups.forEach((anim) =>
    bishopAnimationContainer!.animationGroups.push(anim)
  );

  bishopAnimationContainer.removeAllFromScene();

  // Knight Animations
  const knightAnimationContainer = new BABYLON.AssetContainer(scene);

  scene.finalMeshes?.animations?.Knight.meshes.forEach((mesh) =>
    knightAnimationContainer!.meshes.push(mesh)
  );
  scene.finalMeshes?.animations?.Knight.animationGroups.forEach((anim) =>
    knightAnimationContainer!.animationGroups.push(anim)
  );

  knightAnimationContainer.removeAllFromScene();

  // Queen Animations
  const queenAnimationContainer = new BABYLON.AssetContainer(scene);

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
      const material = new BABYLON.StandardMaterial("light", scene);
      material.diffuseColor = new BABYLON.Color3(0.01, 0.01, 0.01);
      material.specularColor = new BABYLON.Color3(0.01, 0.01, 0.01);
      mesh.material = material;
    }
  });

  scene.detachControl();
  return scene;
};

export default gameScreen;
