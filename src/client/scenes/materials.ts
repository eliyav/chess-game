import { Texture } from "@babylonjs/core/Materials/Textures/texture";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { Color3 } from "@babylonjs/core/Maths/math.color";
import { Scene } from "@babylonjs/core/scene";
import noiseUrl from "../../../assets/space/noise.png";

function createMovementMaterials(scene: Scene) {
  const texture = new Texture(noiseUrl, scene);

  const pieceMaterial = new StandardMaterial("piece", scene);
  pieceMaterial.diffuseColor = new Color3(0, 1, 0.2);
  pieceMaterial.specularColor = new Color3(0.15, 0.15, 0.15);

  const checkedPieceMaterial = new StandardMaterial("checkedPiece", scene);
  checkedPieceMaterial.diffuseColor = new Color3(1, 0, 0.2);
  checkedPieceMaterial.specularColor = new Color3(0.15, 0.15, 0.15);

  const movementMaterial = new StandardMaterial("movement", scene);
  movementMaterial.diffuseColor = new Color3(1, 0.64, 0);
  movementMaterial.specularColor = new Color3(0.15, 0.15, 0.15);
  movementMaterial.diffuseTexture = texture;

  const captureMaterial = new StandardMaterial("capture", scene);
  captureMaterial.diffuseColor = new Color3(1, 0, 0);
  captureMaterial.specularColor = new Color3(0.15, 0.15, 0.15);
  captureMaterial.diffuseTexture = texture;

  const enPassantMaterial = new StandardMaterial("enPassant", scene);
  enPassantMaterial.diffuseColor = new Color3(1, 0, 1);
  enPassantMaterial.specularColor = new Color3(0.15, 0.15, 0.15);
  enPassantMaterial.diffuseTexture = texture;

  const castleMaterial = new StandardMaterial("castle", scene);
  castleMaterial.diffuseColor = new Color3(0, 0.2, 0.8);
  castleMaterial.specularColor = new Color3(0.15, 0.15, 0.15);
  castleMaterial.diffuseTexture = texture;

  const squareMaterial = new StandardMaterial("square", scene);
  squareMaterial.alpha = 0;

  const previousTurnMaterial = new StandardMaterial("previousTurn", scene);
  previousTurnMaterial.diffuseColor = new Color3(0.5, 0.5, 0.5);
  previousTurnMaterial.specularColor = new Color3(0.15, 0.15, 0.15);
  previousTurnMaterial.diffuseTexture = texture;

  return {
    pieceMaterial,
    movementMaterial,
    captureMaterial,
    enPassantMaterial,
    castleMaterial,
    squareMaterial,
    previousTurnMaterial,
    checkedPieceMaterial,
  };
}

type Materials = {
  white: StandardMaterial;
  black: StandardMaterial;
};

function createMeshMaterials(scene: Scene): Materials {
  const white = new StandardMaterial("white", scene);
  white.specularPower = 12;
  white.diffuseColor = new Color3(0.85, 0.63, 0.42);
  white.specularColor = new Color3(0.4, 0.4, 0.4);
  white.emissiveColor = new Color3(0.05, 0.05, 0.05);

  const black = new StandardMaterial("black", scene);
  black.specularPower = 12;
  black.diffuseColor = new Color3(0.04, 0.18, 0.21);
  black.specularColor = new Color3(0.8, 0.8, 0.8);
  black.emissiveColor = new Color3(0.05, 0.05, 0.05);

  return { white, black };
}
export { createMeshMaterials, createMovementMaterials };
