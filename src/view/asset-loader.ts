import * as BABYLON from "babylonjs";
import board from "../../assets/board.gltf";
import chessText from "../../assets/chess.gltf";
import king from "../../assets/pieces/kingv3.gltf";
import queen from "../../assets/pieces/queenv3.gltf";
import bishop from "../../assets/pieces/bishopv3.gltf";
import knight from "../../assets/pieces/knightv3.gltf";
import rook from "../../assets/pieces/rookv3.gltf";
import pawn from "../../assets/pieces/pawnv3.gltf";
import moon from "../../assets/moon.jpg";
import { createMeshMaterials } from "./materials";
import { Scene } from "babylonjs/scene";
import { ISceneLoaderAsyncResult } from "babylonjs/Loading/sceneLoader";
import { AbstractMesh } from "babylonjs/Meshes/abstractMesh";

export interface ChessPieceMesh extends AbstractMesh {
  name: string;
  color?: string;
}

interface DisplayMesh extends AbstractMesh {
  name: string;
  color?: string;
  speed?: number;
  rotationIndex?: number;
  rotationIndex2?: number;
  rotationIndex3?: number;
}

const assetsLoader = async (scene: Scene, description: string) => {
  const materials = createMeshMaterials(scene);
  if (description === "gameScreen") {
    //Game Scene
    let meshesToLoad = [king, queen, knight, bishop, rook, pawn];

    const loadedBoardMesh: ISceneLoaderAsyncResult =
      await BABYLON.SceneLoader.ImportMeshAsync("", board, "");

    const loadedMeshes: ISceneLoaderAsyncResult[] = await Promise.all(
      meshesToLoad.map((mesh) =>
        BABYLON.SceneLoader.ImportMeshAsync("", mesh, "")
      )
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
        ? (finalMesh.rotation = new BABYLON.Vector3(0, Math.PI, 0))
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

    return { piecesMeshes, boardMeshes };
  } else if (description === "startScreen") {
    //Start Scene
    let boardMesh = board;

    let textMeshes = [chessText];

    let boardPieces = [king, queen, knight, bishop, rook, pawn];

    const loadedBoardMeshes = await BABYLON.SceneLoader.ImportMeshAsync(
      "",
      boardMesh,
      "",
      scene
    );
    const loadedPiecesMeshes = await Promise.all(
      boardPieces.map((mesh) =>
        BABYLON.SceneLoader.ImportMeshAsync("", mesh, "", scene)
      )
    );
    const loadedTextMeshes = await Promise.all(
      textMeshes.map((mesh) =>
        BABYLON.SceneLoader.ImportMeshAsync("", mesh, "")
      )
    );

    //Title Mesh
    const titleText = loadedTextMeshes[0].meshes[0];
    titleText.position.x = -20;
    titleText.position.z = 0.2;
    titleText.position.y = 16;
    titleText.rotation = new BABYLON.Vector3(-0.5, 2, -0.2);
    const titleMaterial = new BABYLON.StandardMaterial("TextMaterial", scene);
    titleMaterial.diffuseColor = new BABYLON.Color3(0.52, 0.52, 0.52);
    titleMaterial.diffuseTexture = new BABYLON.Texture(moon, scene);
    titleMaterial.specularColor = new BABYLON.Color3(0.3, 0.3, 0.3);
    loadedTextMeshes[0].meshes[1].material = titleMaterial;

    const rotationArray = [-5, -4, -3, -2, -1, 1, 2, 3, 4, 5];

    const piecesMeshes: DisplayMesh[] = [];

    const loadMeshSettings = (mesh: any, color: string) => {
      const name: string = mesh.meshes[1].id;
      let finalMesh: DisplayMesh = mesh.meshes[1].clone(name, null)!;
      finalMesh.name = name;
      finalMesh.color = color;
      (finalMesh.scalingDeterminant = 40),
        (finalMesh.position.y = 17),
        (finalMesh.position.x = 10),
        finalMesh.color === "White"
          ? (finalMesh.material = materials.white)
          : (finalMesh.material = materials.black);
      finalMesh.speed = Math.random() * 0.6;
      finalMesh.position.z = calcRandomZ();
      finalMesh.rotationIndex = calcRandomIndex(rotationArray.length);
      finalMesh.rotationIndex2 = calcRandomIndex(rotationArray.length);
      finalMesh.rotationIndex3 = calcRandomIndex(rotationArray.length);
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
    boardClone!.rotation = new BABYLON.Vector3(0.2, 0, 0);
    boardClone!.position = new BABYLON.Vector3(10, 0, -10);
    boardClone2!.position = new BABYLON.Vector3(30, -30, 30);
    boardClone2!.rotation = new BABYLON.Vector3(-0.2, 0, 0.8);

    let alpha = Math.PI / 2;
    let beta = Math.PI / 1.5;
    let gamma = Math.PI / 1;

    const animateDistance = () => {
      requestAnimationFrame(() => {
        alpha += 0.02;
        beta += 0.02;
        gamma += 0.02;
        boardClone!.rotate(
          new BABYLON.Vector3(0, beta, 0),
          Math.PI / 500,
          BABYLON.Space.LOCAL
        );
        boardClone2!.rotate(
          new BABYLON.Vector3(0, -beta * 2, 0),
          Math.PI / 500,
          BABYLON.Space.LOCAL
        );
        piecesMeshes.forEach((mesh) => {
          mesh.position.y -= mesh.speed!;
          if (mesh.position.y < -15) {
            resetMesh(mesh);
          }
          mesh.rotate(
            new BABYLON.Vector3(
              alpha * rotationArray[mesh.rotationIndex!],
              beta * rotationArray[mesh.rotationIndex2!],
              gamma * rotationArray[mesh.rotationIndex3!]
            ),
            (3 * Math.PI) / 500,
            BABYLON.Space.LOCAL
          );
        });
        animateDistance();
      });
    };
    animateDistance();
  }
};

const calcRandomZ = () => {
  const num = Math.random();
  const pos = num > 0.5 ? -1 : 1;
  const distance = 13;
  const z = Math.random() * distance * pos;
  return z;
};

const calcRandomIndex = (length: number) => {
  const index = Math.floor(Math.random() * length);
  return index;
};

const resetMesh = (piece: DisplayMesh) => {
  const speed = Math.random() * 0.1;
  piece.speed = speed;
  piece.position.z = calcRandomZ();
  piece.position.y = 20;
};

export default assetsLoader;
