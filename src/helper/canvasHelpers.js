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
    targetMesh.point = [8, 8];
    targetMesh.isVisible = false;
  }
};

const renderScene = () => {
  //Have database of different meshes
  //Read grid for locations of all pieces
  //Get point/name/color of each grid piece
  //Render each mesh accordingly using calculatePoint
};

const calculatePoint = (x, y) => {
  //Calculate X
  if (x > 9 && x < 12) {
    x = 0;
  } else if (x > 6 && x < 9) {
    x = 1;
  } else if (x > 3 && x < 6) {
    x = 2;
  } else if (x > 0 && x < 3) {
    x = 3;
  } else if (x < 0 && x > -3) {
    x = 4;
  } else if (x < -3 && x > -6) {
    x = 5;
  } else if (x < -6 && x > -9) {
    x = 6;
  } else if (x < -9 && x > -12) {
    x = 7;
  } else {
    return console.log("You have not clicked a valid X coordinate", x);
  }
  //Calculate Y
  if (y < -9 && y > -12) {
    y = 0;
  } else if (y < -6 && y > -9) {
    y = 1;
  } else if (y < -3 && y > -6) {
    y = 2;
  } else if (y < 0 && y > -3) {
    y = 3;
  } else if (y > 0 && y < 3) {
    y = 4;
  } else if (y > 3 && y < 6) {
    y = 5;
  } else if (y > 6 && y < 9) {
    y = 6;
  } else if (y > 9 && y < 12) {
    y = 7;
  } else {
    return console.log("You have not clicked a valid Y coordinate", y);
  }

  const canvasX = x;
  const canvasY = y;
  return [canvasX, canvasY];
};

export { updateScene, calculatePoint };
