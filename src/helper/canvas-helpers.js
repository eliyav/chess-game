const renderScene = (game, scene) => {
  //Clears old meshes/memory usage
  if (scene.meshesToRender.length > 0) {
    for (let i = 0; i < scene.meshesToRender.length; i++) {
      const mesh = scene.meshesToRender[i];
      scene.removeMesh(mesh);
      mesh.dispose();
    }
    scene.meshesToRender = [];
  }
  //Final Mesh List
  const meshes = scene.finalMeshes.finalMeshList;
  //Reads grid State
  const grid = game.board.grid;
  const filteredGrid = grid.flat().filter((square) => square.on !== undefined);
  //For each active piece, creates a mesh and places on board
  filteredGrid.forEach((square) => {
    const { color, name, point } = square.on;
    const match = meshes.find((mesh) => mesh.name === name && mesh.color === color);
    let clone = match.clone(name);
    const gridPoint = calculateGridPoint(point);
    clone.position.z = gridPoint[0];
    clone.position.x = gridPoint[1];
    clone.isVisible = true;
    scene.meshesToRender.push(clone);
  });
};

const calculateGridPoint = (point) => {
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
    return console.log("You have not clicked a valid Y coordinate", x);
  }

  return [gridX, gridY];
};

const reverseCalculateGridPoint = (point) => {
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

export { renderScene, calculatePoint, reverseCalculateGridPoint, calculateGridPoint };
