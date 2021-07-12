import * as BABYLON from "babylonjs";
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

const introScene = async () => {
  let meshesToLoad = [
    board,
    // pawnWhite,
    // rookWhite,
    // bishopWhite,
    // knightWhite,
    // kingWhite,
    // queenWhite,
    // pawnBlack,
    // rookBlack,
    // bishopBlack,
    // knightBlack,
    // kingBlack,
    // queenBlack,
  ];

  const meshesLoader = await Promise.all(meshesToLoad.map((mesh) => BABYLON.SceneLoader.ImportMeshAsync("", mesh, "")));

  //Sort the loaded meshes
  const boardMesh = meshesLoader[0].meshes;

  boardMesh.forEach((mesh) => {
    mesh.scalingDeterminant = 8;
  });

  let boardClone = boardMesh[0].clone("Board1");
  let boardClone2 = boardMesh[0].clone("Board2");

  boardMesh.forEach((mesh) => {
    mesh.isVisible = false;
  });

  //Back/UP/Side
  boardClone.position = new BABYLON.Vector3(10, 0, -10);
  boardClone2.position = new BABYLON.Vector3(30, -30, 30);

  boardClone.rotation = new BABYLON.Vector3(0.2, 0, 0);
  boardClone2.rotation = new BABYLON.Vector3(-0.2, 0, 0.8);

  return [boardClone, boardClone2];
};

export default introScene;
