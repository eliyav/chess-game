import "@babylonjs/loaders/glTF";
import { AbstractMesh } from "@babylonjs/core/Meshes/abstractMesh";
import { SceneLoader } from "@babylonjs/core/Loading/sceneLoader";
import { Vector3 } from "@babylonjs/core/Maths/math.vector.js";
import { Space } from "@babylonjs/core/Maths/math.axis";
import board from "../../../assets/board.gltf";
import king from "../../../assets/pieces/kingv3.gltf";
import queen from "../../../assets/pieces/queenv3.gltf";
import bishop from "../../../assets/pieces/bishopv3.gltf";
import knight from "../../../assets/pieces/knightv3.gltf";
import rook from "../../../assets/pieces/rookv3.gltf";
import pawn from "../../../assets/pieces/pawnv3.gltf";
import { CustomScene } from "./game-assets";
import { createMeshMaterials } from "./materials";
import { SceneTypes } from "../components/scene-manager";

const startingPostion = 35;
const endingPosition = -75;

export const displayAssets = async (
  scene: CustomScene,
  activeScene: { id: keyof SceneTypes }
) => {
  const materials = createMeshMaterials(scene);
  let boardMesh = board;
  let boardPieces = [king, queen, knight, bishop, rook, pawn];

  const loadedBoardMeshes = await SceneLoader.ImportMeshAsync(
    "",
    boardMesh,
    "",
    scene
  );
  const loadedPiecesMeshes = await Promise.all(
    boardPieces.map((mesh) => SceneLoader.ImportMeshAsync("", mesh, "", scene))
  );

  const rotationArray = [-5, -4, -3, -2, -1, 1, 2, 3, 4, 5];

  const piecesMeshes: DisplayMesh[] = [];

  const loadMeshSettings = (mesh: any, color: string) => {
    const name: string = mesh.meshes[1].id;
    let finalMesh: DisplayMesh = mesh.meshes[1].clone(name, null)!;
    finalMesh.name = name;
    finalMesh.color = color;
    (finalMesh.scalingDeterminant = 40),
      (finalMesh.position.y = startingPostion),
      (finalMesh.position.x = 10),
      finalMesh.color === "White"
        ? (finalMesh.material = materials.white)
        : (finalMesh.material = materials.black);
    finalMesh.speed = Math.random() * 0.6;
    finalMesh.position.z = calcRandomZ();
    finalMesh.rotationIndex = calcRandomNumber();
    finalMesh.rotationIndex2 = calcRandomNumber();
    finalMesh.rotationIndex3 = calcRandomNumber();
    piecesMeshes.push(finalMesh);
  };

  loadedPiecesMeshes.forEach((mesh) => {
    loadMeshSettings(mesh, "White");
    loadMeshSettings(mesh, "Black");
  });

  loadedBoardMeshes.meshes.forEach((mesh, idx) => {
    if (idx !== 1) {
      mesh.material = materials.board;
    }
  });

  const boardClone = loadedBoardMeshes.meshes[0].clone("Board", null);
  const boardClone2 = loadedBoardMeshes.meshes[0].clone("Board2", null);

  loadedBoardMeshes.meshes.forEach((mesh) => {
    mesh.isVisible = false;
  });

  //Back/UP/Side
  boardClone!.rotation = new Vector3(0.2, 0, 0);
  boardClone!.position = new Vector3(10, 0, -10);
  boardClone2!.position = new Vector3(30, -30, 30);
  boardClone2!.rotation = new Vector3(-0.2, 0, 0.8);

  let alpha = Math.PI / 2;
  let beta = Math.PI / 1.5;
  let gamma = Math.PI / 1;

  const animateDistance = (activeScene: { id: keyof SceneTypes }) => {
    requestAnimationFrame(() => {
      piecesMeshes.forEach((mesh) => {
        mesh.position.y -= mesh.speed!;
        if (mesh.position.y < endingPosition) {
          resetMesh(mesh);
        }
        boardClone!.rotate(new Vector3(0, 1, 0), 0.0008, Space.LOCAL);
        boardClone2!.rotate(new Vector3(0.6, 1, 0.5), 0.0005, Space.LOCAL);

        mesh.rotate(
          new Vector3(
            alpha * rotationArray[mesh.rotationIndex!],
            beta * rotationArray[mesh.rotationIndex2!],
            gamma * rotationArray[mesh.rotationIndex3!]
          ),
          (3 * Math.PI) / 500,
          Space.LOCAL
        );
      });
      if (activeScene.id === "home") animateDistance(activeScene);
    });
  };
  animateDistance(activeScene);
};

function calcRandomZ() {
  const pos = Math.random() > 0.5 ? -1 : 1;
  const distance = 13;
  return Math.random() * distance * pos;
}

function calcRandomNumber() {
  return Math.floor(Math.random() * 10);
}

function resetMesh(piece: DisplayMesh) {
  piece.speed = Math.random() * 0.1;
  piece.position.z = calcRandomZ();
  piece.position.y = startingPostion;
  piece.rotationIndex = calcRandomNumber();
  piece.rotationIndex2 = calcRandomNumber();
  piece.rotationIndex3 = calcRandomNumber();
}

interface DisplayMesh extends AbstractMesh {
  name: string;
  color: string;
  speed: number;
  rotationIndex: number;
  rotationIndex2: number;
  rotationIndex3: number;
}
