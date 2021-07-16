import * as BABYLON from "babylonjs";
import createScene from "./create-scene";
import sky from "../../assets/sky.jpg";
import board from "../../assets/board.gltf";
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
import queenBlack from "../../assets/black-pieces/queen-black2.gltf";

const startScreen = async (canvas, engine) => {
  const startScreen = createScene(canvas, engine);
  let boardMesh = board;

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

  const loadedBoardMesh = await BABYLON.SceneLoader.ImportMeshAsync("", boardMesh, "", startScreen);
  const loadedBoardPieces = await Promise.all(boardPieces.map((mesh) => BABYLON.SceneLoader.ImportMeshAsync("", mesh, "", startScreen)));
  //Sort the loaded meshes

  loadedBoardMesh.meshes.forEach((mesh) => {
    mesh.scalingDeterminant = 8;
  });

  loadedBoardPieces.forEach((mesh) => {
    mesh.meshes[1].scalingDeterminant = 40;
    mesh.meshes[1].position.y = 15;
    mesh.meshes[1].position.x = 10;
    const num = Math.random();
    const test = num > 0.5 ? -1 : 1;
    mesh.meshes[1].position.z = Math.random() * 15 * test;
  });

  let boardClone = loadedBoardMesh.meshes[0].clone("Board1");
  let boardClone2 = loadedBoardMesh.meshes[0].clone("Board2");

  loadedBoardMesh.meshes.forEach((mesh) => {
    mesh.isVisible = false;
  });

  //Back/UP/Side
  boardClone.position = new BABYLON.Vector3(10, 0, -10);
  boardClone2.position = new BABYLON.Vector3(30, -30, 30);

  boardClone.rotation = new BABYLON.Vector3(0.2, 0, 0);
  boardClone2.rotation = new BABYLON.Vector3(-0.2, 0, 0.8);

  const photoDome = new BABYLON.PhotoDome("skydome", sky, { size: 1000 }, startScreen);

  let rotationMultiplier = [1, -2, 3, -1, 5, -3, 1, -2, 2, -3, 1, -1];
  let alpha = Math.PI / 2;
  let beta = Math.PI / 2;
  let gamma = Math.PI / 2;

  const animateDistance = () => {
    requestAnimationFrame(() => {
      alpha += 0.02;
      beta += 0.02;
      gamma += 0.02;
      boardClone.rotate(new BABYLON.Vector3(0, beta, 0), (1 * Math.PI) / 500, BABYLON.Space.LOCAL);
      boardClone2.rotate(new BABYLON.Vector3(0, -beta * 2, 0), (1 * Math.PI) / 500, BABYLON.Space.LOCAL);
      loadedBoardPieces.forEach((mesh, idx) => {
        mesh.meshes[1].position.y > -15 ? (mesh.meshes[1].position.y -= 0.02) : (mesh.meshes[1].position.y = 15);
        mesh.meshes[1].rotate(
          new BABYLON.Vector3(
            alpha * rotationMultiplier[idx - 1],
            -beta * 2 * rotationMultiplier[idx + 2],
            gamma * rotationMultiplier[idx - 1]
          ),
          (3 * Math.PI) / 500,
          BABYLON.Space.LOCAL
        );
      });
      animateDistance();
    });
  };
  animateDistance();

  return startScreen;
};

export default startScreen;
