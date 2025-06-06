import { Animation } from "@babylonjs/core/Animations/animation";
import { AbstractMesh } from "@babylonjs/core/Meshes/abstractMesh";
import { PIECE, Point, Turn } from "../../../shared/game";
import { TEAM } from "../../../shared/match";
import { doPointsMatch } from "../../game-logic/moves";
import { getPointFromPosition, getPositionFromPoint } from "../scene-helpers";
import { GameScene } from "../scene-manager";

export default async function calcTurnAnimation({
  gameScene,
  findMeshFromPoint,
  turn,
}: {
  gameScene: GameScene;
  findMeshFromPoint: (point: Point) => AbstractMesh | undefined;
  turn: Turn;
}) {
  const { from, to } = turn;
  const movingMesh = findMeshFromPoint(from);
  if (!movingMesh) return;

  if (turn.type === "capture") {
    animateMeshBreaking({
      point: turn.to,
      target: turn.capturedPiece,
      gameScene,
    });
  } else if (turn.type === "enPassant") {
    //Update enpassant turn history to have the enpassant point
    animateMeshBreaking({
      point: turn.enPassant.capturedPiecePoint,
      target: turn.enPassant.capturedPiece,
      gameScene,
    });
  }

  //Animate Piece Movement
  const animateZ = movingMesh.name === "Knight" ? true : false;
  const targetMesh = findMeshFromPoint(to)!;
  const meshes =
    turn.type === "castle" ? [movingMesh, targetMesh] : [movingMesh];
  return await animateMeshMovement({
    meshes,
    animateZ,
    turn,
    gameScene,
  });
}

function animateMeshMovement({
  meshes,
  animateZ,
  turn,
  gameScene,
}: {
  meshes: AbstractMesh[];
  animateZ: boolean;
  turn: Turn;
  gameScene: GameScene;
}) {
  const { from, to } = turn;
  return new Promise<void>((resolve) => {
    meshes.forEach((mesh, i) => {
      let fromPosition;
      let toPosition;
      if (turn.type === "castle" && mesh.name === "King") {
        fromPosition = getPositionFromPoint({
          point: from,
          externalMesh: true,
        });
        toPosition = getPositionFromPoint({
          point: turn.castling.kingTarget,
          externalMesh: true,
        });
      } else if (turn.type === "castle" && mesh.name === "Rook") {
        fromPosition = getPositionFromPoint({
          point: to,
          externalMesh: true,
        });
        toPosition = getPositionFromPoint({
          point: turn.castling.rookTarget,
          externalMesh: true,
        });
      } else {
        fromPosition = getPositionFromPoint({
          point: from,
          externalMesh: true,
        });
        toPosition = getPositionFromPoint({
          point: to,
          externalMesh: true,
        });
      }

      const frameRate = 60; // 60 frames per second to move across board
      const ratePerSquare = frameRate / 7;
      const distancePerSquare = 3; //3 world position units per square
      const [fromX, fromY] = fromPosition;
      const [toX, toY] = toPosition;
      const squareDistanceX = Math.abs(toY - fromY) / distancePerSquare;
      const directionX = toPosition[1] - fromPosition[1] > 0 ? 1 : -1;
      const squareDistanceY = Math.abs(toX - fromX) / distancePerSquare;
      const directionY = toX - fromX > 0 ? 1 : -1;

      //Create keyframes based on distance
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

      const keyFramesX = Array.from({ length: squareDistanceX + 1 }, (_, i) => {
        const distanceToMove = directionX * distancePerSquare * i;
        return {
          frame: ratePerSquare * i,
          value: fromY + distanceToMove,
        };
      });

      const keyFramesY = Array.from({ length: squareDistanceY + 1 }, (_, i) => {
        const distanceToMove = directionY * distancePerSquare * i;
        return {
          frame: ratePerSquare * i,
          value: fromX + distanceToMove,
        };
      });

      //If knight, animate z
      const keyFramesZ = [
        {
          frame: 0,
          value: 0.5,
        },
        {
          frame: ratePerSquare / 2,
          value: 2.5,
        },
        {
          frame: ratePerSquare,
          value: 5,
        },
        {
          frame: ratePerSquare * 1.5,
          value: 2.5,
        },
        {
          frame: ratePerSquare * 2,
          value: 0.5,
        },
      ];

      myAnimX.setKeys(keyFramesX);
      myAnimY.setKeys(keyFramesY);
      myAnimZ.setKeys(keyFramesZ);

      const finalAnimations = [];
      if (keyFramesX.length > 1) finalAnimations.push(myAnimX);
      if (keyFramesY.length > 1) finalAnimations.push(myAnimY);
      if (animateZ) finalAnimations.push(myAnimZ);

      gameScene.scene.beginDirectAnimation(
        mesh,
        finalAnimations,
        0,
        frameRate,
        false,
        1,
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
