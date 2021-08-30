import * as BABYLON from "babylonjs";
import { createMeshMaterials } from "../component/materials";
import board from "../../assets/board.gltf";
import chessText from "../../assets/chess.gltf";
import pawnWhite from "../../assets/white-pieces/pawn-white.gltf";
import rookWhite from "../../assets/white-pieces/rook-white.gltf";
import bishopWhite from "../../assets/white-pieces/bishop-white.gltf";
import knightWhite from "../../assets/white-pieces/knight-white.gltf";
import kingWhite from "../../assets/white-pieces/king-white.gltf";
import queenWhite from "../../assets/white-pieces/queen-white.gltf";
import pawnBlack from "../../assets/black-pieces/pawn-black.gltf";
import rookBlack from "../../assets/black-pieces/rook-black.gltf";
import bishopBlack from "../../assets/black-pieces/bishop-black.gltf";
import knightBlack from "../../assets/black-pieces/knight-black.gltf";
import kingBlack from "../../assets/black-pieces/king-black.gltf";
import queenBlack from "../../assets/black-pieces/queen-black.gltf";
import moon from "../../assets/moon.jpg";

const assetsLoader = async (scene, description) => {
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

    const loadedMeshes = await Promise.all(meshesToLoad.map((mesh) => BABYLON.SceneLoader.ImportMeshAsync("", mesh, "")));
    const piecesMeshes = [];
    const boardMeshes = [];

    //Sort the loaded meshes
    loadedMeshes.forEach((mesh) => {
      if (mesh.meshes[1].id.includes("-")) {
        let finalMesh = mesh.meshes[1];
        [
          finalMesh.name,
          finalMesh.color,
          finalMesh.isPickable = true,
          finalMesh.isVisible = false,
          finalMesh.scalingDeterminant = 50,
          finalMesh.position.y = 0.5,
        ] = finalMesh.id.split("-");
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
      const finalMesh = mesh.meshes[1];
      [finalMesh.name, finalMesh.color, finalMesh.scalingDeterminant = 40, finalMesh.position.y = 17, finalMesh.position.x = 10] =
        finalMesh.id.split("-");
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

    const boardClone = loadedBoardMeshes.meshes[0].clone("Board");
    const boardClone2 = loadedBoardMeshes.meshes[0].clone("Board2");
    loadedBoardMeshes.meshes.forEach((mesh) => {
      mesh.isVisible = false;
    });

    //Back/UP/Side
    boardClone.position = new BABYLON.Vector3(10, 0, -10);
    boardClone.rotation = new BABYLON.Vector3(0.2, 0, 0);
    boardClone2.position = new BABYLON.Vector3(30, -30, 30);
    boardClone2.rotation = new BABYLON.Vector3(-0.2, 0, 0.8);

    let alpha = Math.PI / 2;
    let beta = Math.PI / 1.5;
    let gamma = Math.PI / 1;

    const animateDistance = () => {
      requestAnimationFrame(() => {
        alpha += 0.02;
        beta += 0.02;
        gamma += 0.02;
        boardClone.rotate(new BABYLON.Vector3(0, beta, 0), Math.PI / 500, BABYLON.Space.LOCAL);
        boardClone2.rotate(new BABYLON.Vector3(0, -beta * 2, 0), Math.PI / 500, BABYLON.Space.LOCAL);
        loadedPiecesMeshes.forEach((mesh) => {
          const piece = mesh.meshes[1];
          piece.position.y -= piece.speed;
          if (piece.position.y < -15) {
            resetMesh(piece);
          }
          piece.rotate(
            new BABYLON.Vector3(
              alpha * rotationArray[piece.rotationIndex],
              beta * rotationArray[piece.rotationIndex2],
              gamma * rotationArray[piece.rotationIndex3]
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

const calcRandomIndex = (length) => {
  const index = Math.floor(Math.random() * length);
  return index;
};

const resetMesh = (piece) => {
  const speed = Math.random() * 0.1;
  piece.speed = speed;
  piece.position.z = calcRandomZ();
  piece.position.y = 20;
};

export default assetsLoader;
