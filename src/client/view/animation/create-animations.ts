import "@babylonjs/core/Animations/animatable.js";
import { AssetContainer } from "@babylonjs/core/assetContainer";
import { SceneLoader } from "@babylonjs/core/Loading/sceneLoader";
import { Scene } from "@babylonjs/core/scene";
import bishopAnimation from "../../../../assets/piece-animations/bishop-animation.gltf";
import knightAnimation from "../../../../assets/piece-animations/knight-animation.gltf";
import pawnAnimation from "../../../../assets/piece-animations/pawn-animation.gltf";
import queenAnimation from "../../../../assets/piece-animations/queen-animation.gltf";
import rookAnimation from "../../../../assets/piece-animations/rook-animation.gltf";

const animationsGltf = [
  { id: "Pawn", animation: pawnAnimation },
  { id: "Rook", animation: rookAnimation },
  { id: "Bishop", animation: bishopAnimation },
  { id: "Knight", animation: knightAnimation },
  { id: "Queen", animation: queenAnimation },
];

export async function createAnimations(scene: Scene) {
  const loadedAnimations = await Promise.all(
    animationsGltf.map(async (piece) => {
      return SceneLoader.ImportMeshAsync("", piece.animation, "");
    })
  );
  const animationsContainer = loadedAnimations.reduce<AnimationContainer>(
    (acc, animation, i) => {
      const container = new AssetContainer(scene);
      container.meshes.push(...animation.meshes);
      container.animationGroups.push(...animation.animationGroups);
      container.removeAllFromScene();
      acc[animationsGltf[i].id] = container;
      return acc;
    },
    {}
  );

  return animationsContainer;
}

export type AnimationContainer = Record<string, AssetContainer>;
