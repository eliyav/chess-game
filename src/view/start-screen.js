import * as BABYLON from "babylonjs";
import * as GUI from "babylonjs-gui";
import space from "../../assets/space.jpg";
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

const startScreen = async (canvas, appContext) => {
  const scene = new BABYLON.Scene(appContext.engine);
  const camera = new BABYLON.ArcRotateCamera("camera", -Math.PI / 1, Math.PI / 3.5, 30, new BABYLON.Vector3(0, 0, 0), scene);
  camera.attachControl(canvas, true);
  camera.useFramingBehavior = false;
  const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(10, 1, 0), scene);
  const light2 = new BABYLON.HemisphericLight("light2", new BABYLON.Vector3(-10, 1, 0), scene);
  const light3 = new BABYLON.HemisphericLight("light3", new BABYLON.Vector3(0, 1, 0), scene);

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

  const loadedBoardMesh = await BABYLON.SceneLoader.ImportMeshAsync("", boardMesh, "", scene);
  const loadedBoardPieces = await Promise.all(boardPieces.map((mesh) => BABYLON.SceneLoader.ImportMeshAsync("", mesh, "", scene)));

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

  const boardClone = loadedBoardMesh.meshes[0].clone("Board1");
  const boardClone2 = loadedBoardMesh.meshes[0].clone("Board2");
  loadedBoardMesh.meshes.forEach((mesh) => {
    mesh.isVisible = false;
  });

  //Back/UP/Side
  boardClone.position = new BABYLON.Vector3(10, 0, -10);
  boardClone.rotation = new BABYLON.Vector3(0.2, 0, 0);
  boardClone2.position = new BABYLON.Vector3(30, -30, 30);
  boardClone2.rotation = new BABYLON.Vector3(-0.2, 0, 0.8);

  const photoDome = new BABYLON.PhotoDome("spacedome", space, { size: 500 }, scene);

  const rotationMultiplier = [1, -2, 3, -1, 5, -3, 1, -2, 2, -3, 1, -1];
  let alpha = Math.PI / 2;
  let beta = Math.PI / 1.5;
  let gamma = Math.PI / 1;

  const animateDistance = () => {
    requestAnimationFrame(() => {
      alpha += 0.02;
      beta += 0.02;
      gamma += 0.02;
      boardClone.rotate(new BABYLON.Vector3(0, beta, 0), (1 * Math.PI) / 500, BABYLON.Space.LOCAL);
      boardClone2.rotate(new BABYLON.Vector3(0, -beta * 2, 0), (1 * Math.PI) / 500, BABYLON.Space.LOCAL);
      loadedBoardPieces.forEach((mesh, idx) => {
        //check the array index, might cause the problem with loading all of them
        mesh.meshes[1].position.y > -15 ? (mesh.meshes[0].position.y -= 0.02) : (mesh.meshes[0].position.y = 15);
        mesh.meshes[1].rotate(
          new BABYLON.Vector3(
            alpha * rotationMultiplier[rotationMultiplier.length - 1 - idx],
            -beta * 2 * rotationMultiplier[rotationMultiplier.length - 1 - idx],
            gamma * rotationMultiplier[rotationMultiplier.length - 1 - idx]
          ),
          (3 * Math.PI) / 500,
          BABYLON.Space.LOCAL
        );
      });
      animateDistance();
    });
  };
  animateDistance();

  return scene;
};

export default startScreen;
