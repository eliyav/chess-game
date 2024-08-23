import {
  ISceneLoaderAsyncResult,
  SceneLoader,
} from "@babylonjs/core/Loading/sceneLoader";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { Color3 } from "@babylonjs/core/Maths/math";
import { Vector3 } from "@babylonjs/core/Maths/math.vector.js";
import { AbstractMesh } from "@babylonjs/core/Meshes/abstractMesh";
import { Scene } from "@babylonjs/core/scene.js";
import "@babylonjs/loaders/glTF";
import board from "../../../assets/board.gltf";
import bishop from "../../../assets/pieces/bishopv3.gltf";
import king from "../../../assets/pieces/kingv3.gltf";
import knight from "../../../assets/pieces/knightv3.gltf";
import pawn from "../../../assets/pieces/pawnv3.gltf";
import queen from "../../../assets/pieces/queenv3.gltf";
import rook from "../../../assets/pieces/rookv3.gltf";
import type { AnimationContainer } from "./animation/create-animations";
import { createMeshMaterials } from "./materials";

export const gameAssets = async (scene: Scene) => {
  const materials = createMeshMaterials(scene);
  //Game Scene
  let meshesToLoad = [king, queen, knight, bishop, rook, pawn];

  const loadedBoardMesh: ISceneLoaderAsyncResult =
    await SceneLoader.ImportMeshAsync("", board, "");

  const loadedMeshes: ISceneLoaderAsyncResult[] = await Promise.all(
    meshesToLoad.map((mesh) => SceneLoader.ImportMeshAsync("", mesh, ""))
  );

  const piecesMeshes: ChessPieceMesh[] = [];
  const boardMeshes: AbstractMesh[] = [];

  const loadMeshSettings = (mesh: any, color: string) => {
    const name: string = mesh.meshes[1].id;
    let finalMesh: ChessPieceMesh = mesh.meshes[1].clone(name, null)!;
    finalMesh.name = name;
    finalMesh.color = color;
    finalMesh.isPickable = true;
    (finalMesh.isVisible = false), (finalMesh.scalingDeterminant = 50);
    finalMesh.position.y = 0.5;
    finalMesh.name === "Knight" && finalMesh.color === "White"
      ? (finalMesh.rotation = new Vector3(0, Math.PI, 0))
      : null;
    finalMesh.color === "White"
      ? (finalMesh.material = materials.white)
      : (finalMesh.material = materials.black);

    return piecesMeshes.push(finalMesh);
  };

  //Sort the loaded meshes
  loadedMeshes.forEach((mesh) => {
    loadMeshSettings(mesh, "White");
    loadMeshSettings(mesh, "Black");
  });

  loadedBoardMesh.meshes.forEach((mesh, idx) => {
    mesh.isPickable = false;
    if (idx !== 1) {
      mesh.material = materials.board;
    }
    boardMeshes.push(mesh);
  });

  boardMeshes.forEach((mesh, idx) => {
    if (idx === 2) {
      const material = new StandardMaterial("light", scene);
      material.diffuseColor = new Color3(0.01, 0.01, 0.01);
      material.specularColor = new Color3(0.01, 0.01, 0.01);
      mesh.material = material;
    }
  });

  return { piecesMeshes, boardMeshes };
};

export interface CustomScene extends Scene {
  finalMeshes?: {
    piecesMeshes: ChessPieceMesh[];
    boardMeshes: AbstractMesh[];
  };
  meshesToRender?: AbstractMesh[];
  animationsContainer?: AnimationContainer;
}

export interface ChessPieceMesh extends AbstractMesh {
  name: string;
  color?: string;
}
