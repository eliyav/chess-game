import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { Color3 } from "@babylonjs/core/Maths/math.color";
import { Scene } from "@babylonjs/core/scene";

const materials = [
  {
    name: "piece",
    diffuseColor: new Color3(0, 1, 0.2),
    specularColor: new Color3(0.15, 0.15, 0.15),
  },
  {
    name: "movement",
    diffuseColor: new Color3(1, 0.64, 0),
    specularColor: new Color3(0.15, 0.15, 0.15),
  },
  {
    name: "capture",
    diffuseColor: new Color3(1, 0, 0),
    specularColor: new Color3(0.15, 0.15, 0.15),
  },
  {
    name: "enPassant",
    diffuseColor: new Color3(1, 0, 1),
    specularColor: new Color3(0.15, 0.15, 0.15),
  },
  {
    name: "castle",
    diffuseColor: new Color3(0, 0.2, 0.8),
    specularColor: new Color3(0.15, 0.15, 0.15),
  },
];

function createMovementMaterials(scene: Scene): void {
  materials.forEach((material) => {
    const { name, diffuseColor, specularColor } = material;
    const mat = new StandardMaterial(name, scene);
    mat.diffuseColor = diffuseColor;
    mat.specularColor = specularColor;
  });
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
