import { ArcRotateCamera } from "@babylonjs/core/Cameras/arcRotateCamera.js";
import { Engine } from "@babylonjs/core/Engines/engine";
import { HemisphericLight } from "@babylonjs/core/Lights/hemisphericLight.js";
import {
  ISceneLoaderAsyncResult,
  SceneLoader,
} from "@babylonjs/core/Loading/sceneLoader";
import { Material } from "@babylonjs/core/Materials/material";
import { Space } from "@babylonjs/core/Maths/math.axis";
import { Vector3 } from "@babylonjs/core/Maths/math.vector.js";
import { AbstractMesh } from "@babylonjs/core/Meshes/abstractMesh";
import { Scene } from "@babylonjs/core/scene.js";
import type { Nullable } from "@babylonjs/core/types";
import bishop from "../../../assets/pieces/bishopv3.gltf";
import board from "../../../assets/pieces/board.gltf";
import king from "../../../assets/pieces/kingv3.gltf";
import knight from "../../../assets/pieces/knightv3.gltf";
import pawn from "../../../assets/pieces/pawnv3.gltf";
import queen from "../../../assets/pieces/queenv3.gltf";
import rook from "../../../assets/pieces/rookv3.gltf";
import { createCelestialSphere } from "./celestial-shere/celestial-sphere";
import { DisplayMesh } from "./display-mesh";
import { createMeshMaterials } from "./materials";
import { CustomScene } from "./scene-manager";

export const createHomeScene = async (
  engine: Engine
): Promise<CustomScene<{}>> => {
  const scene = new Scene(engine);
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

  createCelestialSphere(scene);

  const materials = createMeshMaterials(scene);

  const importedBoardMesh = await SceneLoader.ImportMeshAsync(
    "",
    board,
    "",
    scene
  );
  const importedPiecesMeshes = await Promise.all(
    [king, queen, knight, bishop, rook, pawn].map((mesh) =>
      SceneLoader.ImportMeshAsync("", mesh, "", scene)
    )
  );

  const displayedMeshes: DisplayMesh[] = [];

  for (let i = 0; i < 4; i++) {
    createDisplayPieces({
      finalArray: displayedMeshes,
      meshes: importedPiecesMeshes,
      materials: [materials.white, materials.black],
    });
  }
  const [boardMesh, boardClone] = createDisplayBoard(importedBoardMesh);

  function animateScene() {
    boardMesh.rotate(new Vector3(0, -1, 0), 0.004, Space.LOCAL);
    if (boardClone) {
      boardClone.rotate(new Vector3(0, 1, 0), 0.008, Space.LOCAL);
    }

    displayedMeshes.forEach((mesh) => {
      mesh.animate();
    });
  }

  scene.onPrePointerObservable.add((pointerInfo) => {
    pointerInfo.skipOnPointerObservable = true;
  });

  scene.onBeforeRenderObservable.add(() => {
    animateScene();
  });

  await scene.whenReadyAsync();

  return {
    scene,
    data: {},
  };
};

function createDisplayPieces({
  finalArray,
  meshes,
  materials,
}: {
  finalArray: DisplayMesh[];
  meshes: ISceneLoaderAsyncResult[];
  materials: Material[];
}) {
  meshes.forEach((mesh) => {
    try {
      const name: string = mesh.meshes[1].id;
      const clone1 = new DisplayMesh({
        material: materials[0],
        mesh: mesh.meshes[1].clone(name, null),
      });
      const clone2 = new DisplayMesh({
        material: materials[1],
        mesh: mesh.meshes[1].clone(name, null),
      });
      finalArray.push(clone1);
      finalArray.push(clone2);
    } catch (e) {
      console.log(e);
    }
  });
}

function createDisplayBoard(
  board: ISceneLoaderAsyncResult
): [AbstractMesh, Nullable<AbstractMesh>] {
  const boardMesh = board.meshes[0];
  const boardClone = boardMesh.clone("Board", null);
  boardMesh.position = new Vector3(30, -30, 30);
  boardMesh.rotation = new Vector3(-1.5, 0, 0.5);
  if (boardClone) {
    boardClone.position = new Vector3(10, 0, -10);
    boardClone.rotation = new Vector3(0.2, 0, 0);
  }
  return [boardMesh, boardClone];
}
