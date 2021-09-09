import * as BABYLON from "babylonjs";
import board from "../../assets/board.gltf";
import chessText from "../../assets/chess.gltf";
import pawnWhite from "../../assets/white-pieces/pawn-white.gltf";
import rookWhite from "../../assets/white-pieces/rook-whitev3.gltf";
import bishopWhite from "../../assets/white-pieces/bishop-whitev2.gltf";
import knightWhite from "../../assets/white-pieces/knight-whitev2.gltf";
import kingWhite from "../../assets/white-pieces/king-whitev2.gltf";
import queenWhite from "../../assets/white-pieces/queen-whitev2.gltf";
import pawnBlack from "../../assets/black-pieces/pawn-black.gltf";
import rookBlack from "../../assets/black-pieces/rook-blackv3.gltf";
import bishopBlack from "../../assets/black-pieces/bishop-blackv2.gltf";
import knightBlack from "../../assets/black-pieces/knight-blackv2.gltf";
import kingBlack from "../../assets/black-pieces/king-blackv2.gltf";
import queenBlack from "../../assets/black-pieces/queen-blackv2.gltf";
import moon from "../../assets/moon.jpg";
import { createMeshMaterials } from "../component/materials";
import { Scene } from "babylonjs/scene";
import { ISceneLoaderAsyncResult } from "babylonjs/Loading/sceneLoader";
import { AbstractMesh } from "babylonjs/Meshes/abstractMesh";

export interface ChessPieceMesh extends AbstractMesh {
  name: string,
  color?: string,
  point?: Point,
}

interface DisplayMesh extends AbstractMesh {
  name: string,
  color?: string,
  point?: Point,
  speed?: number,
  rotationIndex?: number,
  rotationIndex2?: number,
  rotationIndex3?: number,
}

const assetsLoader = async (scene: Scene, description: string) => {
  const materials = createMeshMaterials(scene);
  if (description === "gameScreen") {
    //Game Scene
    let meshesToLoad = [
      board,
      pawnWhite,
      rookWhite,
      bishopWhite,
      knightWhite,
      kingWhite,
      queenWhite,
      pawnBlack,
      rookBlack,
      bishopBlack,
      knightBlack,
      kingBlack,
      queenBlack,
    ];

    const loadedMeshes: ISceneLoaderAsyncResult[] = await Promise.all(meshesToLoad.map((mesh) => BABYLON.SceneLoader.ImportMeshAsync("", mesh, "")));
    const piecesMeshes: ChessPieceMesh[] = [];
    const boardMeshes: ISceneLoaderAsyncResult[] = [];

    //Sort the loaded meshes
    loadedMeshes.forEach((mesh) => {
      if (mesh.meshes[1].id.includes("-")) {
        let finalMesh: ChessPieceMesh = mesh.meshes[1];
        [finalMesh.name, finalMesh.color] = finalMesh.id.split("-");
        finalMesh.isPickable = true,
        finalMesh.isVisible = false,
        finalMesh.scalingDeterminant = 50,
        finalMesh.position.y = 0.5,
        finalMesh.id === "Knight-White" ? (finalMesh.rotation = new BABYLON.Vector3(0, Math.PI, 0)) : null;
        finalMesh.color === "White" ? (finalMesh.material = materials.white) : (finalMesh.material = materials.black);
        return piecesMeshes.push(finalMesh);
      } else {
        mesh.meshes.forEach((mesh) => {
          mesh.isPickable = false;
        });
        boardMeshes.push(mesh);
      }
    });

    boardMeshes[0].meshes[0].material = materials.board;
    boardMeshes[0].meshes[2].material = materials.board;
    boardMeshes[0].meshes[3].material = materials.board;

    return { piecesMeshes, boardMeshes };
  } else if (description === "startScreen") {
    //Start Scene
    let boardMesh = board;

    let textMeshes = [chessText];

    let boardPieces = [
      pawnWhite,
      rookWhite,
      bishopWhite,
      knightWhite,
      kingWhite,
      queenWhite,
      pawnBlack,
      rookBlack,
      bishopBlack,
      knightBlack,
      kingBlack,
      queenBlack,
    ];

    const loadedBoardMeshes = await BABYLON.SceneLoader.ImportMeshAsync("", boardMesh, "", scene);
    const loadedPiecesMeshes = await Promise.all(boardPieces.map((mesh) => BABYLON.SceneLoader.ImportMeshAsync("", mesh, "", scene)));
    const loadedTextMeshes = await Promise.all(textMeshes.map((mesh) => BABYLON.SceneLoader.ImportMeshAsync("", mesh, "")));

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

    loadedPiecesMeshes.forEach((mesh) => {
      const finalMesh: DisplayMesh = mesh.meshes[1];
      [finalMesh.name, finalMesh.color] = finalMesh.id.split("-");
      finalMesh.scalingDeterminant = 40, 
      finalMesh.position.y = 17, 
      finalMesh.position.x = 10,
      finalMesh.color === "White" ? (finalMesh.material = materials.white) : (finalMesh.material = materials.black);
      finalMesh.speed = Math.random() * 0.6;
      finalMesh.position.z = calcRandomZ();
      finalMesh.rotationIndex = calcRandomIndex(rotationArray.length);
      finalMesh.rotationIndex2 = calcRandomIndex(rotationArray.length);
      finalMesh.rotationIndex3 = calcRandomIndex(rotationArray.length);
    });

    loadedBoardMeshes.meshes[0].material = materials.board;
    loadedBoardMeshes.meshes[2].material = materials.board;
    loadedBoardMeshes.meshes[3].material = materials.board;

    const boardClone = loadedBoardMeshes.meshes[0].clone("Board", null , false);
    const boardClone2 = loadedBoardMeshes.meshes[0].clone("Board2", null, false);
    loadedBoardMeshes.meshes.forEach((mesh: { isVisible: boolean; }) => {
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
        boardClone!.rotate(new BABYLON.Vector3(0, beta, 0), Math.PI / 500, BABYLON.Space.LOCAL);
        boardClone2!.rotate(new BABYLON.Vector3(0, -beta * 2, 0), Math.PI / 500, BABYLON.Space.LOCAL);
        loadedPiecesMeshes.forEach((mesh) => {
          const piece: DisplayMesh = mesh.meshes[1];
          piece.position.y -= piece.speed!;
          if (piece.position.y < -15) {
            resetMesh(piece);
          }
          piece.rotate(
            new BABYLON.Vector3(
              alpha * rotationArray[piece.rotationIndex!],
              beta * rotationArray[piece.rotationIndex2!],
              gamma * rotationArray[piece.rotationIndex3!]
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
