const renderScene = (game, gameScene) => {
  //Clears old meshes/memory usage
  if (gameScene.meshesToRender.length > 0) {
    for (let i = 0; i < gameScene.meshesToRender.length; i++) {
      const mesh = gameScene.meshesToRender[i];
      gameScene.removeMesh(mesh);
      mesh.dispose();
    }
    gameScene.meshesToRender = [];
  }
  //Final Mesh List
  const meshes = gameScene.finalMeshes.finalMeshList;
  //Reads grid State
  const grid = game.board.grid;
  const filteredGrid = grid.flat().filter((square) => square.on !== undefined);
  //For each active piece, creates a mesh and places on board
  filteredGrid.forEach((square) => {
    const { color, name, point } = square.on;
    const match = meshes.find((mesh) => mesh.name === name && mesh.color === color);
    let clone = match.clone(name);
    const gridPoint = calculateGridPosition(point);
    clone.position.z = gridPoint[0];
    clone.position.x = gridPoint[1];
    clone.isVisible = true;
    gameScene.meshesToRender.push(clone);
  });
};

const rotateCamera = (currentPlayer, gameScene) => {
  let target = currentPlayer === "Black" ? 0 : Math.PI;
  currentPlayer === "Black" ? (gameScene.cameras[0].alpha = Math.PI + 0.01) : (gameScene.cameras[0].alpha = 0 + 0.0001);
  const animateTurnSwitch = () => {
    requestAnimationFrame(() => {
      if (currentPlayer === "Black") {
        gameScene.cameras[0].alpha -= 0.05;
        gameScene.cameras[0].alpha < target ? null : animateTurnSwitch(currentPlayer);
      } else {
        gameScene.cameras[0].alpha += 0.05;
        gameScene.cameras[0].alpha > target ? null : animateTurnSwitch(currentPlayer);
      }
    });
  };
  animateTurnSwitch(currentPlayer);
};

const displayPieceMoves = (mesh, currentMove, grid, gameScene) => {
  const [x, y] = calcIndexFromMeshPosition([mesh.position.z, mesh.position.x]);
  const piece = grid[x][y].on;
  const moves = piece.calculateAvailableMoves(grid);
  currentMove.push(piece.point);
  moves.forEach((point) => {
    displayMovementSquares(point, gameScene);
  });
};

const displayMovementSquares = (point, gameScene) => {
  const plane = BABYLON.MeshBuilder.CreatePlane(`plane`, { width: 2.8, height: 2.8 });
  const gridPosition = calculatePlanePosition(point); //Spawned Plane has opposite Y then loaded Mesh
  plane.point = point;
  [plane.position.z, plane.position.x] = gridPosition; //Z is X ---- X is Y
  plane.position.y += 0.01;
  plane.material = gameScene.materials.find((material) => material.id === "greenMat");
  plane.material.diffuseColor = new BABYLON.Color3(0, 1, 0.2);
  plane.rotation = new BABYLON.Vector3(Math.PI / 2, 0, 0);
  gameScene.meshesToRender.push(plane);
};

const calculateGridPosition = (point) => {
  const [x, y] = point;
  let gridX, gridY;
  //Calculate X
  if (x === 0) {
    gridX = 10.5;
  } else if (x === 1) {
    gridX = 7.5;
  } else if (x === 2) {
    gridX = 4.5;
  } else if (x === 3) {
    gridX = 1.5;
  } else if (x === 4) {
    gridX = -1.5;
  } else if (x === 5) {
    gridX = -4.5;
  } else if (x === 6) {
    gridX = -7.5;
  } else if (x === 7) {
    gridX = -10.5;
  } else {
    return console.log("You have not clicked a valid X coordinate", x);
  }
  //Calculate Y
  if (y === 0) {
    gridY = 10.5;
  } else if (y === 1) {
    gridY = 7.5;
  } else if (y === 2) {
    gridY = 4.5;
  } else if (y === 3) {
    gridY = 1.5;
  } else if (y === 4) {
    gridY = -1.5;
  } else if (y === 5) {
    gridY = -4.5;
  } else if (y === 6) {
    gridY = -7.5;
  } else if (y === 7) {
    gridY = -10.5;
  } else {
    return console.log("You have not clicked a valid Y coordinate", y);
  }

  return [gridX, gridY];
};

const calculatePlanePosition = (point) => {
  const [x, y] = point;
  let gridX, gridY;
  //Calculate X
  if (x === 0) {
    gridX = 10.5;
  } else if (x === 1) {
    gridX = 7.5;
  } else if (x === 2) {
    gridX = 4.5;
  } else if (x === 3) {
    gridX = 1.5;
  } else if (x === 4) {
    gridX = -1.5;
  } else if (x === 5) {
    gridX = -4.5;
  } else if (x === 6) {
    gridX = -7.5;
  } else if (x === 7) {
    gridX = -10.5;
  } else {
    return console.log("You have not clicked a valid X coordinate", x);
  }
  //Calculate Y
  if (y === 0) {
    gridY = -10.5;
  } else if (y === 1) {
    gridY = -7.5;
  } else if (y === 2) {
    gridY = -4.5;
  } else if (y === 3) {
    gridY = -1.5;
  } else if (y === 4) {
    gridY = 1.5;
  } else if (y === 5) {
    gridY = 4.5;
  } else if (y === 6) {
    gridY = 7.5;
  } else if (y === 7) {
    gridY = 10.5;
  } else {
    return console.log("You have not clicked a valid Y coordinate", y);
  }

  return [gridX, gridY];
};

const calcIndexFromMeshPosition = (point) => {
  const [x, y] = point;
  let indexX, indexY;
  //Calculate X
  if (x === 10.5) {
    indexX = 0;
  } else if (x === 7.5) {
    indexX = 1;
  } else if (x === 4.5) {
    indexX = 2;
  } else if (x === 1.5) {
    indexX = 3;
  } else if (x === -1.5) {
    indexX = 4;
  } else if (x === -4.5) {
    indexX = 5;
  } else if (x === -7.5) {
    indexX = 6;
  } else if (x === -10.5) {
    indexX = 7;
  } else {
    return console.log("Error");
  }
  //Calculate Y
  if (y === 10.5) {
    indexY = 0;
  } else if (y === 7.5) {
    indexY = 1;
  } else if (y === 4.5) {
    indexY = 2;
  } else if (y === 1.5) {
    indexY = 3;
  } else if (y === -1.5) {
    indexY = 4;
  } else if (y === -4.5) {
    indexY = 5;
  } else if (y === -7.5) {
    indexY = 6;
  } else if (y === -10.5) {
    indexY = 7;
  } else {
    return console.log("Error");
  }

  return [indexX, indexY];
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

export { renderScene, calculatePoint, calcIndexFromMeshPosition, calculateGridPosition, displayPieceMoves, rotateCamera };
