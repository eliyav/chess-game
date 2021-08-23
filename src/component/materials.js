import * as BABYLON from "babylonjs";

function createMovementMaterials(scene) {
  const greenMat = new BABYLON.StandardMaterial("greenMat", scene);
  greenMat.diffuseColor = new BABYLON.Color3(0, 1, 0.2);
  greenMat.specularColor = new BABYLON.Color3(0.15, 0.15, 0.15);

  const orangeMat = new BABYLON.StandardMaterial("orangeMat", scene);
  orangeMat.diffuseColor = new BABYLON.Color3(1, 0.64, 0);
  orangeMat.specularColor = new BABYLON.Color3(0.15, 0.15, 0.15);

  const redMat = new BABYLON.StandardMaterial("redMat", scene);
  redMat.diffuseColor = new BABYLON.Color3(1, 0, 0);
  redMat.specularColor = new BABYLON.Color3(0.15, 0.15, 0.15);

  const purpleMat = new BABYLON.StandardMaterial("purpleMat", scene);
  purpleMat.diffuseColor = new BABYLON.Color3(1, 0, 1);
  purpleMat.specularColor = new BABYLON.Color3(0.15, 0.15, 0.15);

  const blueMat = new BABYLON.StandardMaterial("blueMat", scene);
  blueMat.diffuseColor = new BABYLON.Color3(0, 0.2, 0.8);
  blueMat.specularColor = new BABYLON.Color3(0.15, 0.15, 0.15);
}

function createMeshMaterials(scene) {
  const white = new BABYLON.StandardMaterial("white", scene);
  white.specularPower = 2;
  white.diffuseColor = new BABYLON.Color3(0, 0, 0);
  white.emissiveColor = new BABYLON.Color3(0.6, 0.6, 0.6);

  // Fresnel
  white.reflectionFresnelParameters = new BABYLON.FresnelParameters();
  white.reflectionFresnelParameters.bias = 0.5;

  white.diffuseFresnelParameters = new BABYLON.FresnelParameters();
  white.diffuseFresnelParameters.leftColor = new BABYLON.Color3.White();
  white.diffuseFresnelParameters.rightColor = new BABYLON.Color3.Black();
  white.diffuseFresnelParameters.power = 6;
  white.diffuseFresnelParameters.bias = 0.5;

  white.emissiveFresnelParameters = new BABYLON.FresnelParameters();
  white.emissiveFresnelParameters.bias = 0.5;
  white.emissiveFresnelParameters.power = 3;
  white.emissiveFresnelParameters.leftColor = BABYLON.Color3.Black();
  white.emissiveFresnelParameters.rightColor = BABYLON.Color3.Black();

  const black = new BABYLON.StandardMaterial("black", scene);
  black.specularPower = 16;
  black.diffuseColor = new BABYLON.Color3(0, 0, 0);
  black.emissiveColor = new BABYLON.Color3(0, 0, 0);

  // Fresnel
  black.reflectionFresnelParameters = new BABYLON.FresnelParameters();
  black.reflectionFresnelParameters.bias = 0.5;

  black.diffuseFresnelParameters = new BABYLON.FresnelParameters();
  black.diffuseFresnelParameters.leftColor = new BABYLON.Color3.Black();
  black.diffuseFresnelParameters.rightColor = new BABYLON.Color3.Black();
  black.diffuseFresnelParameters.power = 24;
  black.diffuseFresnelParameters.bias = 0.8;

  black.emissiveFresnelParameters = new BABYLON.FresnelParameters();
  black.emissiveFresnelParameters.bias = 0.8;
  black.emissiveFresnelParameters.power = 24;
  black.emissiveFresnelParameters.leftColor = BABYLON.Color3.Black();
  black.emissiveFresnelParameters.rightColor = BABYLON.Color3.White();

  const board = new BABYLON.StandardMaterial("board", scene);
  board.diffuseFresnelParameters = new BABYLON.FresnelParameters();
  board.diffuseFresnelParameters.leftColor = new BABYLON.Color3.Black();
  board.diffuseFresnelParameters.rightColor = new BABYLON.Color3.Black();

  return { white, black, board };
}
export { createMovementMaterials, createMeshMaterials };
