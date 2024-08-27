import { AbstractMesh, AssetContainer } from "@babylonjs/core";
import { Animation } from "@babylonjs/core/Animations/animation.js";
import GamePiece from "../../components/game-logic/game-piece";
import { GameScene } from "../../components/scene-manager";
import { findIndex, findPosition } from "../../helper/canvas-helpers";
import { doMovesMatch, TurnHistory } from "../../helper/game-helpers";

export default function calcTurnAnimation(
  gameScene: GameScene,
  originPoint: Point,
  targetPoint: Point,
  turnHistory: TurnHistory
) {
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
  if (
    turnHistory.targetPiece &&
    (turnHistory.type === "standard" || turnHistory.type === "enPassant")
  ) {
    pieceBreakAnimation({
      target: turnHistory.targetPiece,
    });
  }

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

    const myAnimX = new Animation(
      "moveSquares",
      "position.x",
      frameRate,
      Animation.ANIMATIONTYPE_FLOAT,
      Animation.ANIMATIONLOOPMODE_CONSTANT,
      false
    );

    const myAnimY = new Animation(
      "moveSquares",
      "position.z",
      frameRate,
      Animation.ANIMATIONTYPE_FLOAT,
      Animation.ANIMATIONLOOPMODE_CONSTANT,
      false
    );

    const myAnimZ = new Animation(
      "moveSquares",
      "position.y",
      frameRate,
      Animation.ANIMATIONTYPE_FLOAT,
      Animation.ANIMATIONLOOPMODE_CONSTANT,
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

    gameScene.scene.beginAnimation(mesh, 0, frameRate, false);
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

  function findMeshFromPoint(point: Point) {
    return gameScene.data.meshesToRender.find((mesh) => {
      const meshPoint = findIndex([mesh.position.z, mesh.position.x], true);
      return doMovesMatch(meshPoint, point);
    })!;
  }
}
