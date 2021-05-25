const filterToFinalMoves = (board, color, targetArray, finalObj) => {
  const movementsArrays = Object.values(finalObj);
  movementsArrays.forEach((array, idx) => {
    for (let i = 0; i < array.length; i++) {
      let [x, y] = array[i];
      const square = board[x][y];
      if (square.on === undefined) {
        targetArray.push(array[i]);
      } else if (square.on.color === color) {
        break;
      } else {
        targetArray.push(array[i]);
        break;
      }
    }
  });
};

const bounds = (num, grid) => num >= grid.length - grid.length && num <= grid.length - 1;

const calcHorizontalMovements = (grid, currentPoint, move, finalObj) => {
  for (const [key, value] of Object.entries(finalObj)) {
    switch (key) {
      case "upRight":
        calcUpRight(grid, currentPoint, move, value);
        break;
      case "upLeft":
        calcUpLeft(grid, currentPoint, move, value);
        break;
      case "downRight":
        calcDownRight(grid, currentPoint, move, value);
        break;
      case "downLeft":
        calcDownLeft(grid, currentPoint, move, value);
        break;
      default:
        throw new Error("Unknown horizontal movement, please use upRight, upLeft, downRight, downLeft as array names");
    }
  }
};

const calcVerticalMovements = (grid, currentPoint, move, finalObj) => {
  for (const [key, value] of Object.entries(finalObj)) {
    switch (key) {
      case "up":
        calcUp(grid, currentPoint, move, value);
        break;
      case "down":
        calcDown(grid, currentPoint, move, value);
        break;
      case "right":
        calcRight(grid, currentPoint, move, value);
        break;
      case "left":
        calcLeft(grid, currentPoint, move, value);
        break;
      default:
        throw new Error("Unknown vertical movement, please use up, down, right, left as array names");
    }
  }
};

const calcPawnMovement = (grid, currentPoint, direction, moved, color, finalObj) => {
  let [x, y] = currentPoint;

  //Calculate Movements
  if (moved) {
    const movement = [x, y + 1 * direction];
    const [moveX, moveY] = movement;
    if (bounds(moveX, grid) && bounds(moveY, grid)) {
      finalObj.finalMoves.push(movement);
    }
  } else {
    const movement1 = [x, y + 1 * direction];
    const movement2 = [x, y + 2 * direction];
    const [move1X, move1Y] = movement1;
    const [move2X, move2Y] = movement2;
    if (bounds(move1X, grid) && bounds(move1Y, grid)) {
      finalObj.finalMoves.push(movement1);
    }
    if (bounds(move2X, grid) && bounds(move2Y, grid)) {
      finalObj.finalMoves.push(movement2);
    }
  }

  //Calculate Captures
  const capture1 = [x - direction, y + direction];
  const capture2 = [x + direction, y + direction];
  const [capture1X, capture1Y] = capture1;
  const [capture2X, capture2Y] = capture2;
  //refactor with function or completely
  if (bounds(capture1X, grid) && bounds(capture1Y, grid)) {
    const captureSquare1 = grid[capture1X][capture1Y];
    if (captureSquare1.on === undefined) {
    } else if (captureSquare1.on.color !== color) {
      finalObj.finalMoves.push(capture1);
    }
  }
  if (bounds(capture2X, grid) && bounds(capture2Y, grid)) {
    const captureSquare2 = grid[capture2X][capture2Y];
    if (captureSquare2.on === undefined) {
    } else if (captureSquare2.on.color !== color) {
      finalObj.finalMoves.push(capture2);
    }
  }
};

const calcKnightMovement = (grid, currentPoint, color, moves, finalArray) => {
  let [x, y] = currentPoint;
  moves.forEach((move) => {
    const [moveX, moveY] = move;
    const resultX = x + moveX;
    const resultY = y + moveY;
    if (bounds(resultX, grid) && bounds(resultY, grid)) {
      const square = grid[resultX][resultY];
      if (square.on === undefined || square.on.color !== color) {
        finalArray.push([resultX, resultY]);
      }
    }
  });
};

const calcKingMoves = (grid, currentPoint, color, moves, finalArray) => {
  let [x, y] = currentPoint;
  moves.forEach((move) => {
    const [moveX, moveY] = move;
    const resultX = x + moveX;
    const resultY = y + moveY;
    if (bounds(resultX, grid) && bounds(resultY, grid)) {
      const square = grid[resultX][resultY];
      if (square.on === undefined || square.on.color !== color) {
        finalArray.push([resultX, resultY]);
      }
    }
  });
};

const calcUpRight = (grid, currentPoint, movement, finalArray) => {
  let [x, y] = currentPoint;
  let upRightX = x + movement;
  let upRightY = y + movement;
  if (bounds(upRightX, grid) && bounds(upRightY, grid)) {
    finalArray.push([upRightX, upRightY]);
  }
};

const calcUpLeft = (grid, currentPoint, movement, finalArray) => {
  let [x, y] = currentPoint;
  let upRightX = x - movement;
  let upRightY = y + movement;
  if (bounds(upRightX, grid) && bounds(upRightY, grid)) {
    finalArray.push([upRightX, upRightY]);
  }
};

const calcDownRight = (grid, currentPoint, movement, finalArray) => {
  let [x, y] = currentPoint;
  let upRightX = x + movement;
  let upRightY = y - movement;
  if (bounds(upRightX, grid) && bounds(upRightY, grid)) {
    finalArray.push([upRightX, upRightY]);
  }
};

const calcDownLeft = (grid, currentPoint, movement, finalArray) => {
  let [x, y] = currentPoint;
  let upRightX = x - movement;
  let upRightY = y - movement;
  if (bounds(upRightX, grid) && bounds(upRightY, grid)) {
    finalArray.push([upRightX, upRightY]);
  }
};

const calcUp = (grid, currentPoint, movement, finalArray) => {
  let [x, y] = currentPoint;
  let upY = y + movement;
  if (bounds(upY, grid)) {
    finalArray.push([x, upY]);
  }
};
const calcDown = (grid, currentPoint, movement, finalArray) => {
  let [x, y] = currentPoint;
  let downY = y - movement;
  if (bounds(downY, grid)) {
    finalArray.push([x, downY]);
  }
};
const calcRight = (grid, currentPoint, movement, finalArray) => {
  let [x, y] = currentPoint;
  let rightX = x + movement;
  if (bounds(rightX, grid)) {
    finalArray.push([rightX, y]);
  }
};
const calcLeft = (grid, currentPoint, movement, finalArray) => {
  let [x, y] = currentPoint;
  let leftX = x - movement;
  if (bounds(leftX, grid)) {
    finalArray.push([leftX, y]);
  }
};

export { filterToFinalMoves, calcHorizontalMovements, calcVerticalMovements, calcPawnMovement, calcKnightMovement, calcKingMoves };
