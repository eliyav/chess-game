import * as BABYLON from "babylonjs";
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
  const materialWhite = new BABYLON.StandardMaterial("White", scene);
  materialWhite.specularPower = 2;
  materialWhite.diffuseColor = new BABYLON.Color3(0, 0, 0);
  materialWhite.emissiveColor = new BABYLON.Color3(0.6, 0.6, 0.6);

  // Fresnel
  materialWhite.reflectionFresnelParameters = new BABYLON.FresnelParameters();
  materialWhite.reflectionFresnelParameters.bias = 0.5;

  materialWhite.diffuseFresnelParameters = new BABYLON.FresnelParameters();
  materialWhite.diffuseFresnelParameters.leftColor = new BABYLON.Color3.White();
  materialWhite.diffuseFresnelParameters.rightColor = new BABYLON.Color3.Black();
  materialWhite.diffuseFresnelParameters.power = 12;
  materialWhite.diffuseFresnelParameters.bias = 0.5;

  materialWhite.emissiveFresnelParameters = new BABYLON.FresnelParameters();
  materialWhite.emissiveFresnelParameters.bias = 0.5;
  materialWhite.emissiveFresnelParameters.power = 3;
  materialWhite.emissiveFresnelParameters.leftColor = BABYLON.Color3.Black();
  materialWhite.emissiveFresnelParameters.rightColor = BABYLON.Color3.White();

  const materialBlack = new BABYLON.StandardMaterial("Black", scene);
  materialBlack.specularPower = 12;
  materialBlack.diffuseColor = new BABYLON.Color3(0, 0, 0);
  materialBlack.emissiveColor = new BABYLON.Color3(0, 0, 0);

  // Fresnel
  materialBlack.reflectionFresnelParameters = new BABYLON.FresnelParameters();
  materialBlack.reflectionFresnelParameters.bias = 0.5;

  materialBlack.diffuseFresnelParameters = new BABYLON.FresnelParameters();
  materialBlack.diffuseFresnelParameters.leftColor = new BABYLON.Color3.Black();
  materialBlack.diffuseFresnelParameters.rightColor = new BABYLON.Color3.Black();
  materialBlack.diffuseFresnelParameters.power = 24;
  materialBlack.diffuseFresnelParameters.bias = 0.8;

  materialBlack.emissiveFresnelParameters = new BABYLON.FresnelParameters();
  materialBlack.emissiveFresnelParameters.bias = 0.8;
  materialBlack.emissiveFresnelParameters.power = 24;
  materialBlack.emissiveFresnelParameters.leftColor = BABYLON.Color3.Black();
  materialBlack.emissiveFresnelParameters.rightColor = BABYLON.Color3.White();

  const boardMaterial = new BABYLON.StandardMaterial("Board", scene);
  boardMaterial.diffuseFresnelParameters = new BABYLON.FresnelParameters();
  boardMaterial.diffuseFresnelParameters.leftColor = new BABYLON.Color3.Black();
  boardMaterial.diffuseFresnelParameters.rightColor = new BABYLON.Color3.Black();

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
        finalMesh.position.y += 0.5;
        finalMesh.id === "Knight-White" ? (finalMesh.rotation = new BABYLON.Vector3(0, Math.PI, 0)) : null;
        finalMesh.color === "White" ? (finalMesh.material = materialWhite) : (finalMesh.material = materialBlack);
        return finalMeshList.push(finalMesh);
      } else {
        mesh.meshes.forEach((mesh) => {
          //mesh.scalingDeterminant = 50;
          mesh.isPickable = false;
        });
        boardMesh.push(mesh);
      }
    });

    boardMesh[0].meshes[0].material = boardMaterial;
    //boardMesh[0].meshes[1].material = boardMaterial; //Squares
    boardMesh[0].meshes[2].material = boardMaterial;
    boardMesh[0].meshes[3].material = boardMaterial;

    return { finalMeshList, boardMesh };

    //Start Screen
  } else if (description === "startScreen") {
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

    const loadedBoardMesh = await BABYLON.SceneLoader.ImportMeshAsync("", boardMesh, "", scene);
    const loadedBoardPieces = await Promise.all(boardPieces.map((mesh) => BABYLON.SceneLoader.ImportMeshAsync("", mesh, "", scene)));
    const textLoader = await Promise.all(textMeshes.map((mesh) => BABYLON.SceneLoader.ImportMeshAsync("", mesh, "")));

    const titleText = textLoader[0].meshes[0];
    titleText.position.x = -20;
    titleText.position.z = 0.2;
    titleText.position.y = 16;
    titleText.rotation = new BABYLON.Vector3(-0.5, 2, -0.2);

    const titleMaterial = new BABYLON.StandardMaterial("TextMaterial", scene);
    titleMaterial.diffuseColor = new BABYLON.Color3(0.52, 0.52, 0.52);
    titleMaterial.diffuseTexture = new BABYLON.Texture(moon, scene);
    titleMaterial.specularColor = new BABYLON.Color3(0.3, 0.3, 0.3);

    textLoader[0].meshes[1].material = titleMaterial;

    loadedBoardMesh.meshes.forEach((mesh) => {
      //mesh.scalingDeterminant = 8;
    });
    loadedBoardPieces.forEach((mesh) => {
      const finalMesh = mesh.meshes[1];
      [finalMesh.name, finalMesh.color] = finalMesh.id.split("-");
      finalMesh.color === "White" ? (finalMesh.material = materialWhite) : (finalMesh.material = materialBlack);
      finalMesh.scalingDeterminant = 40;
      finalMesh.position.y = 15;
      finalMesh.position.x = 10;
      const num = Math.random();
      const pos = num > 0.5 ? -1 : 1;
      const distance = 15;
      const speed = Math.random() * 0.5;
      finalMesh.speed = speed;
      finalMesh.position.z = Math.random() * distance * pos;
    });

    loadedBoardMesh.meshes[0].material = boardMaterial;
    //loadedBoardMesh[0].meshes[1].material = boardMaterial; //Squares
    loadedBoardMesh.meshes[2].material = boardMaterial;
    loadedBoardMesh.meshes[3].material = boardMaterial;

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
          mesh.meshes[1].position.y > -15 ? (mesh.meshes[1].position.y -= mesh.meshes[1].speed) : (mesh.meshes[1].position.y = 15);
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
