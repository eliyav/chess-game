import { Animation } from "@babylonjs/core/Animations/animation.js";
import GamePiece from "../../game-logic/game-piece";
import { GameScene } from "../scene-manager";
import { doMovesMatch, TurnHistory } from "../../game-logic/game-helpers";
import { findByPoint } from "../scene-helpers";
import { AbstractMesh } from "@babylonjs/core/Meshes/abstractMesh";
import { AssetContainer } from "@babylonjs/core/assetContainer";
import { Point } from "../../../shared/game";

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

  if (
    turnHistory.targetPiece &&
    (turnHistory.type === "standard" || turnHistory.type === "enPassant")
  ) {
    pieceBreakAnimation({
      target: turnHistory.targetPiece,
    });
  }

  //Animate Piece Movement
  const animateZ = movingMesh.name === "Knight" ? false : true;
  if (turnHistory.type === "castling") {
    const targetMesh = findMeshFromPoint(target);
    if (!targetMesh) return;
    return await animateMovements({
      meshes: [movingMesh, targetMesh],
      animateZ,
    });
  } else {
    return await animateMovements({ meshes: [movingMesh], animateZ });
  }
  //Animate Target Piece breaking animation

  function animateMovements({
    meshes,
    animateZ,
  }: {
    meshes: AbstractMesh[];
    animateZ: boolean;
  }) {
    return new Promise<void>((resolve) => {
      meshes.forEach((mesh, i) => {
        let position;
        let targetPosition;
        if (turnHistory.type === "castling" && mesh.name === "King") {
          const {
            point: [x, y],
          } = turnHistory.originPiece!;
          const direction = turnHistory.direction!;
          const newKingX = x + direction * 2;
          const newKingPoint: Point = [newKingX, y];
          position = findByPoint({
            get: "position",
            point: origin,
            externalMesh: true,
          });
          targetPosition = findByPoint({
            get: "position",
            point: newKingPoint,
            externalMesh: true,
          });
        } else if (turnHistory.type === "castling" && mesh.name === "Rook") {
          const {
            point: [x, y],
          } = turnHistory.originPiece!;
          const direction = turnHistory.direction!;
          const newRookX = x + direction;
          const newRookPoint: Point = [newRookX, y];
          position = findByPoint({
            get: "position",
            point: target,
            externalMesh: true,
          });
          targetPosition = findByPoint({
            get: "position",
            point: newRookPoint,
            externalMesh: true,
          });
        } else {
          position = findByPoint({
            get: "position",
            point: origin,
            externalMesh: true,
          });
          targetPosition = findByPoint({
            get: "position",
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

  function pieceBreakAnimation({ target }: { target: GamePiece }) {
    //Look up animation group based on piece breaking,
    const { type, team, point } = target;
    const targetMesh = gameScene.data.meshesToRender.find((mesh) => {
      const meshPoint = findByPoint({
        get: "index",
        point: [mesh.position.z, mesh.position.x],
        externalMesh: true,
      });
      return doMovesMatch(meshPoint, point);
    });

    if (targetMesh) {
      gameScene.scene.removeMesh(targetMesh);
    }
    const animationContainer = gameScene.data.animationsContainer[type];
    animatePieceBreak({
      container: animationContainer,
      point,
      team,
    });
  }

  function animatePieceBreak({
    container,
    point,
    team,
  }: {
    container: AssetContainer;
    point: Point;
    team: string;
  }) {
    const [z, x] = findByPoint({
      get: "position",
      point,
      externalMesh: true,
    });
    const material = gameScene.scene.getMaterialByName(
      team.toLocaleLowerCase()
    );
    const entries = container.instantiateModelsToScene();
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
}
