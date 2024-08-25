import { Material } from "@babylonjs/core/Materials/material";
import { Space } from "@babylonjs/core/Maths/math.axis";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { AbstractMesh } from "@babylonjs/core/Meshes/abstractMesh";

const STARTING_Y_POSITION = 35;
const ROTATION_SCALES = [
  -5, -4, -3, -2, -1, 1, 2, 3, 4, 5, 1.5, 2.5, 3.5, 4.5, 5.5, -1.5, -2.5, -3.5,
  -4.5, -5.5,
];
const VECTOR_ALPHA = Math.PI / 2;
const VECTOR_BETA = Math.PI / 1.5;
const VECTOR_GAMMA = Math.PI / 1;

export class DisplayMesh {
  private speed: number;
  private rotationIndex: [number, number, number];
  private mesh: AbstractMesh;
  private material: Material;
  private endingPosition = -75;

  constructor(meshOptions: { material: Material; mesh: AbstractMesh | null }) {
    if (!meshOptions.mesh) {
      throw new Error("Mesh is required");
    }
    this.speed = Math.random() * 0.1;
    this.rotationIndex = [
      calcRandomNumber(),
      calcRandomNumber(),
      calcRandomNumber(),
    ];
    this.material = meshOptions.material;
    this.mesh = meshOptions.mesh;
    this.mesh.scalingDeterminant = 40;
    this.mesh.position.y = STARTING_Y_POSITION * Math.random();
    this.mesh.position.x = 10;
    this.mesh.position.z = calcRandomZ();
    this.mesh.material = this.material;
  }

  public animate() {
    this.moveMesh();
    this.resetMesh();
    this.rotate();
  }

  private moveMesh() {
    this.mesh.position.y -= this.speed;
  }

  private rotate() {
    this.mesh.rotate(
      new Vector3(
        VECTOR_ALPHA * ROTATION_SCALES[this.rotationIndex[0]],
        VECTOR_BETA * ROTATION_SCALES[this.rotationIndex[1]],
        VECTOR_GAMMA * ROTATION_SCALES[this.rotationIndex[2]]
      ),
      (3 * Math.PI) / 500,
      Space.LOCAL
    );
  }

  private resetMesh() {
    if (this.mesh.position.y < this.endingPosition) {
      this.mesh.position.z = calcRandomZ();
      this.mesh.position.y = STARTING_Y_POSITION;
      this.speed = Math.random();
      this.rotationIndex = [
        calcRandomNumber(),
        calcRandomNumber(),
        calcRandomNumber(),
      ];
    }
  }
}

function calcRandomZ() {
  const pos = Math.random() > 0.5 ? 30 : -30;
  return Math.random() * pos;
}

function calcRandomNumber() {
  return Math.floor(Math.random() * 20);
}
