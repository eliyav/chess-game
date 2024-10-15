import { Animation } from "@babylonjs/core/Animations/animation";
import { AbstractMesh } from "@babylonjs/core/Meshes/abstractMesh";
import { PIECE, Point, TurnHistory } from "../../../shared/game";
import { TEAM } from "../../../shared/match";
import { doPointsMatch } from "../../game-logic/moves";
import { getPointFromPosition, getPositionFromPoint } from "../scene-helpers";
import { GameScene } from "../scene-manager";

export default async function calcTurnAnimation({
  gameScene,
  findMeshFromPoint,
  turnHistory,
}: {
  gameScene: GameScene;
  findMeshFromPoint: (point: Point) => AbstractMesh | undefined;
  turnHistory: TurnHistory;
}) {
  const { origin, target } = turnHistory;
  const movingMesh = findMeshFromPoint(origin);
  if (!movingMesh) return;

  if (turnHistory.type === "capture") {
    animateMeshBreaking({
      point: turnHistory.target,
      target: turnHistory.capturedPiece,
      gameScene,
    });
  } else if (turnHistory.type === "enPassant") {
    //Update enpassant turn history to have the enpassant point
    animateMeshBreaking({
      point: turnHistory.enPassant.capturedPiecePoint,
      target: turnHistory.enPassant.capturedPiece,
      gameScene,
    });
  }

  //Animate Piece Movement
  const animateZ = movingMesh.name === "Knight" ? false : true;
  const targetMesh = findMeshFromPoint(target)!;
  const meshes =
    turnHistory.type === "castle" ? [movingMesh, targetMesh] : [movingMesh];
  return await animateMeshMovement({
    meshes,
    animateZ,
    turnHistory,
    gameScene,
  });
}

function animateMeshMovement({
  meshes,
  animateZ,
  turnHistory,
  gameScene,
}: {
  meshes: AbstractMesh[];
  animateZ: boolean;
  turnHistory: TurnHistory;
  gameScene: GameScene;
}) {
  const { origin, target } = turnHistory;
  return new Promise<void>((resolve) => {
    meshes.forEach((mesh, i) => {
      let position;
      let targetPosition;
      if (turnHistory.type === "castle" && mesh.name === "King") {
        position = getPositionFromPoint({
          point: origin,
          externalMesh: true,
        });
        targetPosition = getPositionFromPoint({
          point: turnHistory.castling.kingTarget,
          externalMesh: true,
        });
      } else if (turnHistory.type === "castle" && mesh.name === "Rook") {
        position = getPositionFromPoint({
          point: target,
          externalMesh: true,
        });
        targetPosition = getPositionFromPoint({
          point: turnHistory.castling.rookTarget,
          externalMesh: true,
        });
      } else {
        position = getPositionFromPoint({
          point: origin,
          externalMesh: true,
        });
        targetPosition = getPositionFromPoint({
          point: target,
          externalMesh: true,
        });
      }

      const frameRate = 1;

      const myAnimX = new Animation(
        "moveSquaresX",
        "position.x",
        frameRate,
        Animation.ANIMATIONTYPE_FLOAT,
        Animation.ANIMATIONLOOPMODE_CONSTANT,
        false
      );

      const myAnimY = new Animation(
        "moveSquaresZ",
        "position.z",
        frameRate,
        Animation.ANIMATIONTYPE_FLOAT,
        Animation.ANIMATIONLOOPMODE_CONSTANT,
        false
      );

      const myAnimZ = new Animation(
        "moveSquaresY",
        "position.y",
        frameRate,
        Animation.ANIMATIONTYPE_FLOAT,
        Animation.ANIMATIONLOOPMODE_CONSTANT,
        false
      );

      const keyFramesX = [
        {
          frame: 0,
          value: position[1],
        },
        {
          frame: frameRate,
          value: targetPosition[1],
        },
      ];

      const keyFramesY = [
        {
          frame: 0,
          value: position[0],
        },
        {
          frame: frameRate,
          value: targetPosition[0],
        },
      ];

      const keyFramesZ = [
        {
          frame: 0,
          value: 0.5,
        },
        {
          frame: frameRate / 2,
          value: 5,
        },
        {
          frame: frameRate,
          value: 0.5,
        },
      ];

      myAnimX.setKeys(keyFramesX);
      myAnimY.setKeys(keyFramesY);
      myAnimZ.setKeys(keyFramesZ);

      const animations = animateZ
        ? [myAnimX, myAnimY]
        : [myAnimX, myAnimY, myAnimZ];

      gameScene.scene.beginDirectAnimation(
        mesh,
        animations,
        0,
        frameRate,
        false,
        undefined,
        () => {
          const lastMesh = meshes.length - 1 === i;
          if (lastMesh) resolve();
        }
      );
    });
  });
}

function animateMeshBreaking({
  point,
  target,
  gameScene,
}: {
  point: Point;
  target: {
    type: PIECE;
    team: TEAM;
  };
  gameScene: GameScene;
}) {
  const { type, team } = target;
  //Look up animation group based on piece breaking,
  const targetMesh = gameScene.data.meshesToRender.find((mesh) => {
    const meshPoint = getPointFromPosition({
      position: [mesh.position.z, mesh.position.x],
      externalMesh: true,
    });
    return doPointsMatch(meshPoint, point);
  });

  if (targetMesh) {
    gameScene.scene.removeMesh(targetMesh);
  }
  const animationContainer = gameScene.data.animationsContainer[type];
  const [z, x] = getPositionFromPoint({
    point,
    externalMesh: true,
  });
  const material = gameScene.scene.getMaterialByName(team.toLocaleLowerCase());
  const entries = animationContainer.instantiateModelsToScene();
  const LastAnimation = entries.animationGroups.at(-1);
  if (LastAnimation) {
    LastAnimation.onAnimationGroupEndObservable.addOnce(() => {
      entries.dispose();
    });
  }
  entries.rootNodes.forEach((node) => {
    const mesh = node as AbstractMesh;
    mesh.getChildMeshes().forEach((mesh) => (mesh.material = material));
    mesh.position.y = 0.4;
    mesh.position.x = -x;
    mesh.position.z = z;
  });
  for (const group of entries.animationGroups) {
    group.play();
  }
}
