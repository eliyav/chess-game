import { Square } from "./board-helpers";
import { Move } from "../component/game-pieces/bishop";

type MovesObj = {
  up?: [number,number][]; 
  down?: [number,number][];
  right?: [number,number][]; 
  left?: [number,number][]; 
  upRight?: [number,number][];
  upLeft?: [number,number][]; 
  downRight?: [number,number][]; 
  downLeft?: [number,number][]; 
}

//Filters the moves from the final movements object and enters them in the available moves array 
const filterToFinalMoves = (grid: Square[][], color: string, movesObj: MovesObj, targetArray: Move[]) => {
  const movementsArrays = Object.values(movesObj);
  movementsArrays.forEach((array) => {
    for (let i = 0; i < array.length; i++) {
      let [x, y] = array[i];
      const square = grid[x][y];
      if (square.on !== undefined) {
        if (square.on.color !== color) {
          targetArray.push([array[i], "capture"]);
          break;
        } else if (square.on.color === color) {
          break;
        }
      } else {
        targetArray.push([array[i], "movement"]);
      }
    }
  });
};
 
//Calculates Horizontal Movements by calculating each direction from the current point and adds them to the final movements object
const calcHorizontalMovements = (grid: Square[][], currentPoint: [number, number], movement: number, finalObj: MovesObj) => {
  for (const [key, value] of Object.entries(finalObj)) {
    const moves: [number,number][] = value
    switch (key) {
      case "upRight":
        calcUpRight(grid, currentPoint, movement, moves);
        break;
      case "upLeft":
        calcUpLeft(grid, currentPoint, movement, moves);
        break;
      case "downRight":
        calcDownRight(grid, currentPoint, movement, moves);
        break;
      case "downLeft":
        calcDownLeft(grid, currentPoint, movement, moves);
        break;
      default:
        throw new Error("Unknown horizontal movement, please use upRight, upLeft, downRight, downLeft as key names for finalObj");
    }
  }
};

//Calculates Vertical Movements by calculating each direction from the current point and adds them to the final movements object
const calcVerticalMovements = (grid: Square[][], currentPoint: [number, number], movement: number, finalObj: MovesObj) => {
  for (const [key, value] of Object.entries(finalObj)) {
    const moves: [number,number][] = value
    switch (key) {
      case "up":
        calcUp(grid, currentPoint, movement, moves);
        break;
      case "down":
        calcDown(grid, currentPoint, movement, moves);
        break;
      case "right":
        calcRight(grid, currentPoint, movement, moves);
        break;
      case "left":
        calcLeft(grid, currentPoint, movement, moves);
        break;
      default:
        throw new Error("Unknown vertical movement, please use up, down, right, left as key names for finalObj");
    }
  }
};

const calcPawnMovement = (grid: Square[][], currentPoint: [number, number], direction: number, moved: boolean, color: string, finalObj: Move[]) => {
  //Calculate Pawn Movement based on current point
  let range = 1;
  const [x, y] = currentPoint;
  const movePoint1: [number, number] = [x, y + range * direction];
  const [moveX, moveY] = movePoint1;
  if (grid[moveX][moveY].on === undefined) {
    bounds(moveX, grid) && bounds(moveY, grid) ? finalObj.push([movePoint1, "movement"]) : null;
    //If he hasnt moved, then can move 2 spaces
    if (!moved) {
      range = 2;
      const movePoint2: [number, number] = [x, y + range * direction];
      const [moveX2, moveY2] = movePoint2;
      if (grid[moveX2][moveY2].on === undefined) {
        bounds(moveX2, grid) && bounds(moveY2, grid) ? finalObj.push([movePoint2, "movement"]) : null;
      }
    }
  }

  //Calculates Capture points and pushes them in final movement obj if are valid
  const capturePoint1: [number, number] = [x - direction, y + direction];
  const capturePoint2: [number, number] = [x + direction, y + direction];
  checkForValidPawnCapture(capturePoint1, color, grid, finalObj);
  checkForValidPawnCapture(capturePoint2, color, grid, finalObj);
};

const checkForValidPawnCapture = (capturePoint: [number,number], color: any, grid: Square[][], finalObj: Move[]) => {
  const [captureX, captureY] = capturePoint;
  if (bounds(captureX, grid) && bounds(captureY, grid)) {
    const captureSquare = grid[captureX][captureY];
    captureSquare.on === undefined ? null : captureSquare.on.color !== color ? finalObj.push([capturePoint, "capture"]) : null;
  }
};

const calcKnightMovement = (grid: Square[][], currentPoint: number[], color: string, moves: [number,number][], finalObj: Move[]) => {
  let [x, y] = currentPoint;
  moves.forEach((move) => {
    const [moveX, moveY] = move;
    const resultX = x + moveX;
    const resultY = y + moveY;
    if (bounds(resultX, grid) && bounds(resultY, grid)) {
      const square = grid[resultX][resultY];
      const result: [number,number] = [resultX, resultY];
      if (square.on !== undefined) {
        square.on.color !== color ? finalObj.push([result, "capture"]) : null;
      } else {
        finalObj.push([result, "movement"]);
      }
    }
  });
};

const calcKingMoves = (grid: Square[][], currentPoint: [number, number], color: string, moves: [number,number][], finalObj: Move[]) => {
  let [x, y] = currentPoint;
  moves.forEach((move) => {
    const [moveX, moveY] = move;
    const resultX = x + moveX;
    const resultY = y + moveY;
    if (bounds(resultX, grid) && bounds(resultY, grid)) {
      const square = grid[resultX][resultY];
      const result: [number,number] = [resultX, resultY];
      if (square.on !== undefined) {
        square.on.color !== color ? finalObj.push([result, "capture"]) : null;
      } else {
        finalObj.push([result, "movement"]);
      }
    }
  });
};

const bounds = (num: number, grid: Square[][]) => num >= grid.length - grid.length && num <= grid.length - 1;

const calcUpRight = (grid: Square[][], currentPoint: [number, number], movement: number, finalObj: [number,number][]) => {
  let [x, y] = currentPoint;
  let upRightX = x + movement;
  let upRightY = y + movement;
  bounds(upRightX, grid) && bounds(upRightY, grid) ? finalObj.push([upRightX, upRightY]) : null;
};

const calcUpLeft = (grid: Square[][], currentPoint: [number, number], movement: number, finalObj: [number,number][]) => {
  let [x, y] = currentPoint;
  let upLeftX = x - movement;
  let upLeftY = y + movement;
  bounds(upLeftX, grid) && bounds(upLeftY, grid) ? finalObj.push([upLeftX, upLeftY]) : null;
};

const calcDownRight = (grid: Square[][], currentPoint: [number, number], movement: number, finalObj: [number,number][]) => {
  let [x, y] = currentPoint;
  let downRightX = x + movement;
  let downRightY = y - movement;
  bounds(downRightX, grid) && bounds(downRightY, grid) ? finalObj.push([downRightX, downRightY]) : null;
};

const calcDownLeft = (grid: Square[][], currentPoint: [number, number], movement: number, finalObj: [number,number][]) => {
  let [x, y] = currentPoint;
  let downLeftX = x - movement;
  let downLeftY = y - movement;
  bounds(downLeftX, grid) && bounds(downLeftY, grid) ? finalObj.push([downLeftX, downLeftY]) : null;
};

const calcUp = (grid: Square[][], currentPoint: [number, number], movement: number, finalObj: [number,number][]) => {
  let [x, y] = currentPoint;
  let upY = y + movement;
  bounds(upY, grid) ? finalObj.push([x, upY]) : null;
};

const calcDown = (grid: Square[][], currentPoint: [number, number], movement: number, finalObj: [number,number][]) => {
  let [x, y] = currentPoint;
  let downY = y - movement;
  bounds(downY, grid) ? finalObj.push([x, downY]) : null;
};

const calcRight = (grid: Square[][], currentPoint: [number, number], movement: number, finalObj: [number,number][]) => {
  let [x, y] = currentPoint;
  let rightX = x + movement;
  bounds(rightX, grid) ? finalObj.push([rightX, y]) : null;
};

const calcLeft = (grid: Square[][], currentPoint: [number, number], movement: number, finalObj: [number,number][]) => {
  let [x, y] = currentPoint;
  let leftX = x - movement;
  bounds(leftX, grid) ? finalObj.push([leftX, y]) : null;
};

export { filterToFinalMoves, calcHorizontalMovements, calcVerticalMovements, calcPawnMovement, calcKnightMovement, calcKingMoves };
