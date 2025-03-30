import { ImportMeshAsync } from "@babylonjs/core/Loading/sceneLoader";
import { Material } from "@babylonjs/core/Materials/material";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { Color3 } from "@babylonjs/core/Maths/math.color";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { AbstractMesh } from "@babylonjs/core/Meshes/abstractMesh";
import { Scene } from "@babylonjs/core/scene";
import board from "../../../assets/pieces/board.gltf";
import bishop from "../../../assets/pieces/bishopv3.gltf";
import king from "../../../assets/pieces/kingv3.gltf";
import knight from "../../../assets/pieces/knightv3.gltf";
import pawn from "../../../assets/pieces/pawnv3.gltf";
import queen from "../../../assets/pieces/queenv3.gltf";
import rook from "../../../assets/pieces/rookv3.gltf";
import { createMeshMaterials, createMovementMaterials } from "./materials";
import chessData from "../game-logic/chess-data-import";
import { CreatePlane } from "@babylonjs/core/Meshes/Builders/planeBuilder";
import { getPositionFromPoint } from "./scene-helpers";

export const loadGameAssets = async ({
  scene,
  meshMaterials,
  movementMaterials,
}: {
  scene: Scene;
  meshMaterials: ReturnType<typeof createMeshMaterials>;
  movementMaterials: ReturnType<typeof createMovementMaterials>;
}) => {
  const meshesToLoad = [king, queen, knight, bishop, rook, pawn];

  const loadedBoardMesh = await ImportMeshAsync(board, scene);

  const loadedPieceMeshes = await Promise.all(
    meshesToLoad.map((mesh) => ImportMeshAsync(mesh, scene))
  );

  loadedBoardMesh.meshes.forEach((mesh, idx) => {
    mesh.receiveShadows = true;
    if (idx === 0) {
      mesh.position = new Vector3(0.07, -0.4, 0);
    }
    if (idx === 1) {
      const material = new StandardMaterial("light", scene);
      material.diffuseColor = new Color3(1, 1, 1);
      mesh.material = material;
    }
    if (idx === 3) {
      const material = new StandardMaterial("light", scene);
      material.emissiveColor = Color3.White().scale(0.2);
      material.diffuseColor = Color3.Blue().scale(0.1);
      mesh.material = material;
    }
    mesh.isPickable = false;
  });

  const piecesMeshes: ChessPieceMesh[] = [];

  configureChessPieces({
    finalArray: piecesMeshes,
    meshes: loadedPieceMeshes,
    materials: [meshMaterials.white, meshMaterials.black],
  });

  //Create invisible mesh for each square on the board for raypicking
  chessData.boardPoints.forEach((point, i) => {
    const plane = CreatePlane(`plane-${i}`, {
      size: 2.8,
    });
    const [z, x] = getPositionFromPoint({
      point,
      externalMesh: false,
    });
    plane.setPositionWithLocalVector(new Vector3(x, 0.51, z));
    plane.rotation = new Vector3(Math.PI / 2, 0, 0);
    plane.material = movementMaterials.squareMaterial;
    scene.addMesh(plane);
  });

  return piecesMeshes;
};

type ChessPieceMetaData = {
  color: "White" | "Black";
};

export type ChessPieceMesh = AbstractMesh & { metadata: ChessPieceMetaData };

function configureChessPieces({
  finalArray,
  meshes,
  materials,
}: {
  finalArray: ChessPieceMesh[];
  meshes: Awaited<ReturnType<typeof ImportMeshAsync>>[];
  materials: Material[];
}) {
  meshes.forEach((mesh) => {
    try {
      const name: string = mesh.meshes[1].id;
      const clone = mesh.meshes[1].clone(name, null);
      if (clone) {
        clone.isPickable = false;
        finalArray.push(
          configure({
            mesh: clone,
            material: materials[0],
            metadata: { color: "White" },
          })
        );
      }
      const clone2 = mesh.meshes[1].clone(name, null);
      if (clone2) {
        clone2.isPickable = false;
        finalArray.push(
          configure({
            mesh: clone2,
            material: materials[1],
            metadata: { color: "Black" },
          })
        );
      }
    } catch (e) {
      console.log(e);
    }
  });
}

function configure({
  mesh,
  material,
  metadata,
}: {
  mesh: AbstractMesh;
  material: Material;
  metadata: ChessPieceMetaData;
}): ChessPieceMesh {
  mesh.metadata = metadata;
  mesh.isPickable = true;
  mesh.isVisible = false;
  mesh.scalingDeterminant = 50;
  mesh.position.y = 0.5;
  mesh.material = material;
  if (mesh.name === "Knight" && mesh.metadata.color === "White") {
    mesh.rotation = new Vector3(0, Math.PI, 0);
  }
  return mesh;
}
