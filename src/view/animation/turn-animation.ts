import { findIndex, findPosition } from "../../helper/canvas-helpers";
import { doMovesMatch, TurnHistory } from "../../helper/game-helpers";
import { CustomGameScene } from "../asset-loader";
import { createMeshMaterials } from "../materials";

export default function calcTurnAnimation(
  gameScene: CustomGameScene,
  originPoint: Point,
  targetPoint: Point,
  turnHistory: TurnHistory
) {
  const materials = createMeshMaterials(gameScene);

  const movingMesh = findMeshFromPoint(originPoint);
  const targetMesh = findMeshFromPoint(targetPoint);

  //Animate Piece Movement
  if (turnHistory.type === "castling") {
    animateMovement(movingMesh, true);
    animateMovement(targetMesh, true);
  } else {
    movingMesh.name === "Knight"
      ? animateMovement(movingMesh, false)
      : animateMovement(movingMesh, true);
  }
  //Animate Target Piece breaking animation
  pieceBreakAnimation(turnHistory);

  function animateMovement(mesh: any, slide: boolean) {
    let position;
    let targetPosition;
    if (turnHistory.type === "castling" && mesh.name === "King") {
      const {
        point: [x, y],
      } = turnHistory.originPiece!;
      const direction = turnHistory.direction!;
      const newKingX = x + direction * 2;
      const newKingPoint: Point = [newKingX, y];
      position = findPosition(originPoint, true);
      targetPosition = findPosition(newKingPoint, true);
    } else if (turnHistory.type === "castling" && mesh.name === "Rook") {
      const {
        point: [x, y],
      } = turnHistory.originPiece!;
      const direction = turnHistory.direction!;
      const newRookX = x + direction;
      const newRookPoint: Point = [newRookX, y];
      position = findPosition(targetPoint, true);
      targetPosition = findPosition(newRookPoint, true);
    } else {
      position = findPosition(originPoint, true);
      targetPosition = findPosition(targetPoint, true);
    }

    const frameRate = 1;

    const myAnimX = new BABYLON.Animation(
      "moveSquares",
      "position.x",
      frameRate,
      BABYLON.Animation.ANIMATIONTYPE_FLOAT,
      BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT,
      false
    );

    const myAnimY = new BABYLON.Animation(
      "moveSquares",
      "position.z",
      frameRate,
      BABYLON.Animation.ANIMATIONTYPE_FLOAT,
      BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT,
      false
    );

    const myAnimZ = new BABYLON.Animation(
      "moveSquares",
      "position.y",
      frameRate,
      BABYLON.Animation.ANIMATIONTYPE_FLOAT,
      BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT,
      false
    );

    const keyFramesX = [];
    const keyFramesY = [];
    const keyFramesZ = [];

    keyFramesX.push({
      frame: 0,
      value: position[1],
    });

    keyFramesX.push({
      frame: frameRate,
      value: targetPosition[1],
    });

    keyFramesY.push({
      frame: 0,
      value: position[0],
    });

    keyFramesY.push({
      frame: frameRate,
      value: targetPosition[0],
    });

    if (!slide) {
      keyFramesZ.push({
        frame: 0,
        value: 0.5,
      });

      keyFramesZ.push({
        frame: frameRate / 2,
        value: 5,
      });

      keyFramesZ.push({
        frame: frameRate,
        value: 0.5,
      });
      myAnimZ.setKeys(keyFramesZ);
      mesh.animations.push(myAnimZ);
    }

    myAnimX.setKeys(keyFramesX);
    myAnimY.setKeys(keyFramesY);

    mesh.animations.push(myAnimX);
    mesh.animations.push(myAnimY);

    gameScene.beginAnimation(mesh, 0, frameRate, false);
  }

  function pieceBreakAnimation(resolved: TurnHistory) {
    if (
      (resolved.type === "standard" && resolved.targetPiece) ||
      resolved.type === "enPassant"
    ) {
      //Look up animation group based on piece breaking,
      const name = resolved.targetPiece?.name;
      const team = resolved.targetPiece?.color;
      let newTargetPoint = resolved.targetPiece?.point!;

      const targetMesh = gameScene.meshesToRender?.find((mesh) => {
        const meshPoint = findIndex([mesh.position.z, mesh.position.x], true);
        return doMovesMatch(meshPoint, newTargetPoint);
      });

      removeMesh(targetMesh);

      const [z, x] = findPosition(newTargetPoint, true);
      duplicate(
        //@ts-ignore
        gameScene.animationsContainer![name],
        z,
        x,
        team?.toLocaleLowerCase(),
        2000
      );
    }
    //Function to play the full animation and then dispose resources
    //@ts-ignore
    function duplicate(container, z, x, team, delay) {
      let entries = container.instantiateModelsToScene();
      entries.rootNodes.forEach((mesh: any) =>
        mesh
          .getChildMeshes()
          //@ts-ignore
          .forEach((mesh2: any) => (mesh2.material = materials[team]))
      );
      for (var node of entries.rootNodes) {
        node.position.y = 0.4;
        node.position.x = -x;
        node.position.z = z;
      }

      for (var group of entries.animationGroups) {
        group.play();
      }

      setTimeout(() => {
        entries.rootNodes[0].dispose();
      }, delay);
    }
  }

  function findMeshFromPoint(point: Point) {
    return gameScene.meshesToRender?.find((mesh) => {
      const meshPoint = findIndex([mesh.position.z, mesh.position.x], true);
      return doMovesMatch(meshPoint, point);
    })!;
  }

  function removeMesh(mesh: any) {
    gameScene.removeMesh(mesh);
    mesh.dispose();
  }
}
