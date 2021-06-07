import { getX, getY } from "./gameHelpers";

const updateScene = (originPoint, targetPoint, gameState, scene) => {
  //Update the 3D Board
  const team = gameState.currentPlayer;
  const index = team === "White" ? 0 : 1;
  const targetIndex = team === "White" ? 1 : 0;
  const movingMesh = scene.finalMeshList[index].find((mesh) => mesh.point[0] === originPoint[0] && mesh.point[1] === originPoint[1]);
  const targetMesh = scene.finalMeshList[targetIndex].find((mesh) => mesh.point[0] === targetPoint[0] && mesh.point[1] === targetPoint[1]);
  //Calculate new Board Position
  const xDiff = (getY(originPoint) - getY(targetPoint)) * 3;
  const zDiff = (getX(originPoint) - getX(targetPoint)) * 3;
  movingMesh.position.x += xDiff;
  movingMesh.position.z += zDiff;
  //console.log(movingMesh.position);

  //Update Mesh point
  movingMesh.point = targetPoint;
  //Get rid of eaten piece
  if (targetMesh) {
    targetMesh.point = null;
    targetMesh.isVisible = false;
  }
};

export { updateScene };
