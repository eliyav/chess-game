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

const assetsLoader = async (sceneLoader) => {
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

  const meshesLoader = await Promise.all(meshesToLoad.map((mesh) => sceneLoader("", mesh, "")));

  const finalMeshList = [];
  const boardMesh = [];

  //Sort the loaded meshes
  meshesLoader.forEach((mesh) => {
    if (mesh.meshes[1].id.includes("-")) {
      let finalMesh = mesh.meshes[1];
      [finalMesh.name, finalMesh.color, finalMesh.isPickable = false, finalMesh.isVisible = false, finalMesh.scalingDeterminant = 50] =
        finalMesh.id.split("-");
      return finalMeshList.push(finalMesh);
    } else {
      mesh.meshes.forEach((mesh) => (mesh.scalingDeterminant = 50));
      boardMesh.push(mesh);
    }
  });
  return { finalMeshList, boardMesh };
};

export default assetsLoader;
