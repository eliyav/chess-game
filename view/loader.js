// import * as BABYLON from "babylonjs";
// import board from "../../public/board.gltf";
// import square_green from "../../public/square-green.gltf";
// import square_red from "../../public/square-red.gltf";
// import pawnWhite from "../../public/white pieces/pawn-white.gltf";
// import rookWhite from "../../public/white pieces/rook-white.gltf";
// import bishopWhite from "../../public/white pieces/bishop-white.gltf";
// import knightWhite from "../../public/white pieces/knight-white.gltf";
// import kingWhite from "../../public/white pieces/king-white.gltf";
// import queenWhite from "../../public/white pieces/queen-white.gltf";
// import pawnBlack from "../../public/black pieces/pawn-black.gltf";
// import rookBlack from "../../public/black pieces/rook-black.gltf";
// import bishopBlack from "../../public/black pieces/bishop-black.gltf";
// import knightBlack from "../../public/black pieces/knight-black.gltf";
// import kingBlack from "../../public/black pieces/king-black.gltf";
// import queenBlack from "../../public/black pieces/queen-black.gltf";

// const assetsLoader = async () => {
//   let meshesToLoad = [
//     board,
//     square_green,
//     square_red,
//     pawnWhite,
//     rookWhite,
//     bishopWhite,
//     knightWhite,
//     kingWhite,
//     queenWhite,
//     pawnBlack,
//     rookBlack,
//     bishopBlack,
//     knightBlack,
//     kingBlack,
//     queenBlack,
//   ];

//   const meshesLoader = await Promise.all(meshesToLoad.map((mesh) => BABYLON.SceneLoader.ImportMeshAsync("", mesh, "")));

//   const finalMeshList = [[], [], []];

//   //Sort the loaded meshes
//   meshesLoader.forEach((mesh) => {
//     if (mesh.meshes[1].id.includes("-")) {
//       let finalMesh = mesh.meshes[1];
//       [finalMesh.$meshName, finalMesh.$teamName, finalMesh.isPickable = false] = finalMesh.id.split("-");

//       return finalMesh.$teamName === "White"
//         ? finalMeshList[0].push(finalMesh)
//         : finalMesh.$teamName === "Black"
//         ? finalMeshList[1].push(finalMesh)
//         : finalMeshList[2].push(mesh.meshes);
//     }
//     mesh.meshes.forEach((mesh) => (mesh.isPickable = false));
//     finalMeshList[2].push(mesh.meshes);
//   });

//   //Clone needed pieces
//   const teams = 2;
//   const clonesNeeded = {
//     Pawn: 7,
//     Rook: 1,
//     Bishop: 1,
//     Knight: 1,
//   };

//   for (let i = 0; i < teams; i++) {
//     Object.entries(clonesNeeded).forEach(([key, value]) => {
//       let meshToClone = finalMeshList[i].find((ele) => ele.$meshName === key);
//       for (let j = 0; j < value; j++) {
//         let clone = meshToClone.clone(key + " Clone " + j);
//         finalMeshList[i].push(clone);
//       }
//     });
//   }

//   return finalMeshList;
// };
// export default assetsLoader;
