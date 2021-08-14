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
import space2 from "../../assets/space2.jpg";
import blackMetal from "../../assets/black-metal.jpg";
import whiteMetal from "../../assets/white-metal.jpg";

const assetsLoader = async (scene, description) => {
  const materialWhite = new BABYLON.StandardMaterial("White", scene);
  materialWhite.diffuseTexture = new BABYLON.Texture(whiteMetal, scene);
  //materialWhite.refractionTexture = new BABYLON.Texture(space2, scene);

  const materialBlack = new BABYLON.StandardMaterial("Black", scene);
  materialBlack.diffuseTexture = new BABYLON.Texture(blackMetal, scene);
  //materialBlack.refractionTexture = new BABYLON.Texture(space2, scene);

  if (description === "gameScreen") {
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

    const meshesLoader = await Promise.all(meshesToLoad.map((mesh) => BABYLON.SceneLoader.ImportMeshAsync("", mesh, "")));
    const finalMeshList = [];
    const boardMesh = [];

    //Sort the loaded meshes
    meshesLoader.forEach((mesh) => {
      if (mesh.meshes[1].id.includes("-")) {
        let finalMesh = mesh.meshes[1];
        [finalMesh.name, finalMesh.color, finalMesh.isPickable = true, finalMesh.isVisible = false, finalMesh.scalingDeterminant = 50] =
          finalMesh.id.split("-");
        finalMesh.id === "Knight-White" ? (finalMesh.rotation = new BABYLON.Vector3(0, Math.PI, 0)) : null;
        finalMesh.color === "White" ? (finalMesh.material = materialWhite) : (finalMesh.material = materialBlack);
        return finalMeshList.push(finalMesh);
      } else {
        mesh.meshes.forEach((mesh) => {
          mesh.scalingDeterminant = 50;
          mesh.isPickable = false;
        });
        boardMesh.push(mesh);
      }
    });
    return { finalMeshList, boardMesh };
  } else if (description === "startScreen") {
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
      const finalMesh = mesh.meshes[1];
      [finalMesh.name, finalMesh.color] = finalMesh.id.split("-");
      finalMesh.color === "White" ? (finalMesh.material = materialWhite) : (finalMesh.material = materialBlack);
      finalMesh.scalingDeterminant = 40;
      finalMesh.position.y = 15;
      finalMesh.position.x = 10;
      const num = Math.random();
      const test = num > 0.5 ? -1 : 1;
      finalMesh.position.z = Math.random() * 15 * test;
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

    const rotationMultiplier = [1, -2, 3, -4, 5, -3, 1, -2, 2, -3, -4, -1];
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
          mesh.meshes[1].position.y > -15 ? (mesh.meshes[1].position.y -= 0.02) : (mesh.meshes[1].position.y = 15);
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
  }
};

export default assetsLoader;
