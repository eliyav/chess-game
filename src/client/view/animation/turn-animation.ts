import { AbstractMesh, AssetContainer } from "@babylonjs/core";
import { Animation } from "@babylonjs/core/Animations/animation.js";
import GamePiece from "../../components/game-logic/game-piece";
import { GameScene } from "../../components/scene-manager";
import { findIndex, findPosition } from "../../helper/canvas-helpers";
import { doMovesMatch, TurnHistory } from "../../helper/game-helpers";

export default function calcTurnAnimation({
  gameScene,
  onMoveSuccess,
  findMeshFromPoint,
  turnHistory,
}: {
  gameScene: GameScene;
  onMoveSuccess: () => void;
  findMeshFromPoint: (point: Point) => AbstractMesh | undefined;
  turnHistory: TurnHistory;
}) {
  const { origin, target } = turnHistory;
  const movingMesh = findMeshFromPoint(origin);

  if (!movingMesh) return;

  //Animate Piece Movement
  const animateZ = movingMesh.name === "Knight" ? false : true;
  if (turnHistory.type === "castling") {
    const targetMesh = findMeshFromPoint(target);
    if (!targetMesh) return;
    animateMovements({ meshes: [movingMesh, targetMesh], animateZ });
  } else {
    animateMovements({ meshes: [movingMesh], animateZ });
  }
  //Animate Target Piece breaking animation
  if (
    turnHistory.targetPiece &&
    (turnHistory.type === "standard" || turnHistory.type === "enPassant")
  ) {
    pieceBreakAnimation({
      target: turnHistory.targetPiece,
    });
  }

  function animateMovements({
    meshes,
    animateZ,
  }: {
    meshes: AbstractMesh[];
    animateZ: boolean;
  }) {
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
        position = findPosition(origin, true);
        targetPosition = findPosition(newKingPoint, true);
      } else if (turnHistory.type === "castling" && mesh.name === "Rook") {
        const {
          point: [x, y],
        } = turnHistory.originPiece!;
        const direction = turnHistory.direction!;
        const newRookX = x + direction;
        const newRookPoint: Point = [newRookX, y];
        position = findPosition(target, true);
        targetPosition = findPosition(newRookPoint, true);
      } else {
        position = findPosition(origin, true);
        targetPosition = findPosition(target, true);
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
          if (lastMesh) onMoveSuccess();
        }
      );
    });
  }

  function pieceBreakAnimation({ target }: { target: GamePiece }) {
    //Look up animation group based on piece breaking,
    const { name, color: team, point } = target;
    const targetMesh = gameScene.data.meshesToRender.find((mesh) => {
      const meshPoint = findIndex([mesh.position.z, mesh.position.x], true);
      return doMovesMatch(meshPoint, point);
    });

    if (targetMesh) {
      gameScene.scene.removeMesh(targetMesh);
    }
    const animationContainer = gameScene.data.animationsContainer[name];
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
    const [z, x] = findPosition(point, true);
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
