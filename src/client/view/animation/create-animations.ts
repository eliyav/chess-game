import {
  ISceneLoaderAsyncResult,
  SceneLoader,
} from "@babylonjs/core/Loading/sceneLoader";
import pawnAnimation from "../../../../assets/piece-animations/pawn-animation.gltf";
import rookAnimation from "../../../../assets/piece-animations/rook-animation.gltf";
import bishopAnimation from "../../../../assets/piece-animations/bishop-animation.gltf";
import knightAnimation from "../../../../assets/piece-animations/knight-animation.gltf";
import queenAnimation from "../../../../assets/piece-animations/queen-animation.gltf";
import { AssetContainer } from "@babylonjs/core/assetContainer";
import { Scene } from "@babylonjs/core/scene";
import "@babylonjs/core/Animations/animatable.js";

const animationsGltf = [
  { id: "Pawn", animation: pawnAnimation },
  { id: "Rook", animation: rookAnimation },
  { id: "Bishop", animation: bishopAnimation },
  { id: "Knight", animation: knightAnimation },
  { id: "Queen", animation: queenAnimation },
];

export async function createAnimations(scene: Scene) {
  const animationPromises = animationsGltf.map((piece) => {
    return SceneLoader.ImportMeshAsync("", piece.animation, "");
  });
  const loadedAnimations = await Promise.all(animationPromises);
  loadedAnimations.forEach((animation) => {
    animation.animationGroups.forEach((group) => {
      group.loopAnimation = false;
    });
  });
  const animations = animationsGltf.reduce<
    Record<string, ISceneLoaderAsyncResult>
  >((acc, curr, idx) => {
    acc[curr.id] = loadedAnimations[idx];
    return acc;
  }, {});

  const animationsContainer = Object.entries(
    animations
  ).reduce<AnimationContainer>((acc, [key, value]) => {
    const container = new AssetContainer(scene);
    value.meshes.forEach((mesh) => container.meshes.push(mesh));
    value.animationGroups.forEach((anim) =>
      container.animationGroups.push(anim)
    );
    container.removeAllFromScene();
    acc[key] = container;
    return acc;
  }, {});

  return animationsContainer;
}

export type AnimationContainer = Record<string, AssetContainer>;
