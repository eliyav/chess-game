import { EnPassant, Move, PIECE, Point, TurnHistory } from "../../shared/game";
import GamePiece from "./game-piece";
import { TEAM } from "../../shared/match";
import Board, { type Grid } from "./board";

type LateralDirection = "up" | "down" | "right" | "left";
type DiagonalDirection = "upRight" | "upLeft" | "downRight" | "downLeft";
type Movements = Partial<Record<LateralDirection | DiagonalDirection, Point[]>>;
type LateralMovements = Record<LateralDirection, Point[]>;
type DiagonalMovements = Record<DiagonalDirection, Point[]>;

export function getPieceMoves({
  board,
  point,
  piece: { type, team, moved },
  lastTurnHistory,
}: {
  board: Board;
  point: Point;
  piece: { type: PIECE; team: TEAM; moved: boolean };
  lastTurnHistory: TurnHistory | undefined;
}) {
  switch (type) {
    case PIECE.P:
      return calcPawnMoves({
        point,
        team: team,
        board,
        turnHistory: lastTurnHistory,
      });
    case PIECE.R:
      return calcRookMoves({ team, point, board });
    case PIECE.B:
      return calcBishopMoves({ team, point, board });
    case PIECE.N:
      return calcKnightMoves({ board, team, point });
    case PIECE.Q:
      return calcQueenMoves({ team, point, board });
    case PIECE.K:
      return calcKingMoves({
        point,
        board,
        moved,
        team,
        lastTurnHistory,
      });
  }
}

export const isEnPassantAvailable = (
  turnHistory: TurnHistory,
  board: Board
): EnPassant | undefined => {
  const { target } = turnHistory;
  const pieceOnLastTurnTargetSquare = board.getPiece(target);
  if (
    !pieceOnLastTurnTargetSquare ||
    pieceOnLastTurnTargetSquare.type !== PIECE.P
  )
    return;
  const targetY = turnHistory.target[1];
  const originY = turnHistory.origin[1];
  const moved = Math.abs(targetY - originY);
  if (moved !== 2) return;
  const direction = pieceOnLastTurnTargetSquare.team === TEAM.WHITE ? 1 : -1;
  const x = turnHistory.target[0];
  const y = turnHistory.origin[1] + direction;
  const enPassantPoint: Point = [x, y];
  return {
    enPassantPoint: enPassantPoint,
    capturedPiecePoint: target,
    capturedPiece: pieceOnLastTurnTargetSquare,
  };
};

export const doPointsMatch = (point: Point, point2: Point) =>
  point[0] == point2[0] && point[1] == point2[1];

function calcRookMoves({
  team,
  point,
  board,
}: {
  team: TEAM;
  point: Point;
  board: Board;
}) {
  const movements = [1, 2, 3, 4, 5, 6, 7];
  const lateralMovements = calcLateralMovements({
    grid: board.grid,
    currentPoint: point,
    movements,
  });
  return getMoves({ board, team, movements: lateralMovements });
}

function calcQueenMoves({
  team,
  point,
  board,
}: {
  team: TEAM;
  point: Point;
  board: Board;
}) {
  const movements = [1, 2, 3, 4, 5, 6, 7];
  const lateralMovements = calcLateralMovements({
    grid: board.grid,
    currentPoint: point,
    movements,
  });
  const diagonalMovements = calcDiagonalMovements({
    grid: board.grid,
    currentPoint: point,
    movements,
  });
  const lateralMoves = getMoves({
    board,
    team,
    movements: lateralMovements,
  });
  const diagonalMoves = getMoves({
    board,
    team,
    movements: diagonalMovements,
  });
  return [...lateralMoves, ...diagonalMoves];
}

function calcPawnMoves({
  point,
  team,
  board,
  turnHistory,
}: {
  point: Point;
  team: TEAM;
  board: Board;
  turnHistory: TurnHistory | undefined;
}) {
  const availableMoves: Move[] = [];
  const direction = board.getDirection(team);
  const [x, y] = point;
  //Calculate Pawn Movement based on current point
  const range = 1;
  const newY = y + range * direction;
  const move1: Point = [x, newY];
  const moveResult = getStandardMove({
    point: move1,
    team,
    board,
    onlyMovement: true,
  });
  if (moveResult) {
    availableMoves.push(moveResult);
  }
  //If he hasnt moved, then can move 2 spaces
  if ((team === TEAM.WHITE && y === 1) || (team === TEAM.BLACK && y === 6)) {
    const extendedRange = 2;
    const newY = y + extendedRange * direction;
    const move2: Point = [x, newY];
    const moveResult = getStandardMove({
      point: move2,
      team,
      board,
      onlyMovement: true,
    });
    if (moveResult) {
      availableMoves.push(moveResult);
    }
  }
  //Calculates Capture points and pushes them in final movement obj if are valid
  const capturePoint1: Point = [x - direction, y + direction];
  const capturePoint2: Point = [x + direction, y + direction];
  const captureMove = getStandardMove({
    point: capturePoint1,
    team,
    board,
    onlyCapture: true,
  });
  const captureMove2 = getStandardMove({
    point: capturePoint2,
    team,
    board,
    onlyCapture: true,
  });
  if (captureMove) {
    availableMoves.push(captureMove);
  }
  if (captureMove2) {
    availableMoves.push(captureMove2);
  }

  if (turnHistory) {
    const enPassant = isEnPassantAvailable(turnHistory, board);
    if (enPassant) {
      const [x, y] = point;
      const direction = board.getDirection(team);
      const x1 = x - 1;
      const x2 = x + 1;
      const newY = y + direction;
      const potential1: Point = [x1, newY];
      const potential2: Point = [x2, newY];
      if (
        doPointsMatch(potential1, enPassant.enPassantPoint) ||
        doPointsMatch(potential2, enPassant.enPassantPoint)
      ) {
        availableMoves.push([enPassant.enPassantPoint, "enPassant"]);
      }
    }
  }
  return availableMoves;
}

function calcKnightMoves({
  team,
  point,
  board,
}: {
  team: TEAM;
  point: Point;
  board: Board;
}) {
  const availableMoves: Move[] = [];
  const movements: Point[] = [
    [1, 2],
    [2, 1],
    [2, -1],
    [1, -2],
    [-1, 2],
    [-2, 1],
    [-2, -1],
    [-1, -2],
  ];
  const [x, y] = point;
  movements.forEach(([moveX, moveY]) => {
    const point: Point = [x + moveX, y + moveY];
    const moveResult = getStandardMove({ point: point, team, board });
    if (moveResult) {
      availableMoves.push(moveResult);
    }
  });
  return availableMoves;
}

function calcKingMoves({
  point,
  board,
  lastTurnHistory,
  moved,
  team,
}: {
  point: Point;
  board: Board;
  lastTurnHistory: TurnHistory | undefined;
  moved: boolean;
  team: TEAM;
}) {
  const kingMovements: Point[] = [
    [0, 1],
    [1, 0],
    [1, 1],
    [1, -1],
    [0, -1],
    [-1, -1],
    [-1, 0],
    [-1, 1],
  ];
  const availableMoves: Move[] = [];
  const [x, y] = point;
  kingMovements.forEach(([moveX, moveY]) => {
    const point: Point = [x + moveX, y + moveY];
    const moveResult = getStandardMove({ point, team, board });
    if (moveResult) {
      availableMoves.push(moveResult);
    }
  });

  if (!moved) {
    calcCastling(point, team, board, lastTurnHistory, availableMoves);
  }

  return availableMoves;
}

function calcBishopMoves({
  point,
  team,
  board,
}: {
  point: Point;
  team: TEAM;
  board: Board;
}) {
  const movements = [1, 2, 3, 4, 5, 6, 7];
  const diagonalMovements = calcDiagonalMovements({
    grid: board.grid,
    currentPoint: point,
    movements,
  });
  return getMoves({ board, team, movements: diagonalMovements });
}

//Filters the moves from the final movements object and enters them in the available moves array
const getMoves = ({
  board,
  team,
  movements,
}: {
  board: Board;
  team: TEAM;
  movements: Movements;
}) => {
  const availableMoves: Move[] = [];
  const movementsArrays = Object.values(movements);
  movementsArrays.forEach((array) => {
    for (let i = 0; i < array.length; i++) {
      const point = array[i];
      const move = getStandardMove({ point, team, board });
      if (!move) break;
      if (move) {
        availableMoves.push(move);
        if (move[1] === "capture") {
          break;
        }
      }
    }
  });
  return availableMoves;
};

//Calculates Horizontal Movements by calculating each direction from the current point and adds them to the final movements object
const calcDiagonalMovements = ({
  grid,
  currentPoint,
  movements,
}: {
  grid: Grid;
  currentPoint: Point;
  movements: number[];
}) => {
  const finalObj: DiagonalMovements = {
    upRight: [],
    upLeft: [],
    downRight: [],
    downLeft: [],
  };
  for (const [key, value] of Object.entries(finalObj)) {
    const moves: Point[] = value;
    switch (key) {
      case "upRight":
        calcUpRight(currentPoint, movements, moves);
        break;
      case "upLeft":
        calcUpLeft(currentPoint, movements, moves);
        break;
      case "downRight":
        calcDownRight(currentPoint, movements, moves);
        break;
      case "downLeft":
        calcDownLeft(currentPoint, movements, moves);
        break;
      default:
        throw new Error(
          "Unknown horizontal movement, please use upRight, upLeft, downRight, downLeft as key names for finalObj"
        );
    }
  }
  return finalObj;
};

//Calculates Vertical Movements by calculating each direction from the current point and adds them to the final movements object
const calcLateralMovements = ({
  grid,
  currentPoint,
  movements,
}: {
  grid: Grid;
  currentPoint: Point;
  movements: number[];
}) => {
  const finalObj: LateralMovements = {
    up: [],
    down: [],
    right: [],
    left: [],
  };
  for (const key of Object.keys(finalObj)) {
    switch (key) {
      case "up":
        calcUp(currentPoint, movements, finalObj[key]);
        break;
      case "down":
        calcDown(currentPoint, movements, finalObj[key]);
        break;
      case "right":
        calcRight(currentPoint, movements, finalObj[key]);
        break;
      case "left":
        calcLeft(currentPoint, movements, finalObj[key]);
        break;
      default:
        throw new Error(
          "Unknown vertical movement, please use up, down, right, left as key names for finalObj"
        );
    }
  }
  return finalObj;
};

function getStandardMove({
  point,
  board,
  team,
  onlyMovement,
  onlyCapture,
}: {
  point: Point;
  board: Board;
  team: TEAM;
  onlyMovement?: boolean;
  onlyCapture?: boolean;
}): Move | undefined {
  const [x, y] = point;
  const isInBounds = bounds(x, board.grid) && bounds(y, board.grid);
  if (!isInBounds) return;
  const pieceOnPoint = board.getPiece(point);
  if (pieceOnPoint) {
    if (onlyMovement) return;
    if (pieceOnPoint.team !== team) {
      return [point, "capture"];
    }
  } else {
    if (onlyCapture) return;
    return [point, "movement"];
  }
}

const bounds = (num: number, grid: Grid) => num >= 0 && num <= grid.length - 1;

const calcUpRight = (
  currentPoint: Point,
  movement: number[],
  finalObj: Point[]
) => {
  const [x, y] = currentPoint;
  movement.forEach((move) => {
    finalObj.push([x + move, y + move]);
  });
};

const calcUpLeft = (
  currentPoint: Point,
  movement: number[],
  finalObj: Point[]
) => {
  const [x, y] = currentPoint;
  movement.forEach((move) => {
    finalObj.push([x - move, y + move]);
  });
};

const calcDownRight = (
  currentPoint: Point,
  movement: number[],
  finalObj: Point[]
) => {
  const [x, y] = currentPoint;
  movement.forEach((move) => {
    finalObj.push([x + move, y - move]);
  });
};

const calcDownLeft = (
  currentPoint: Point,
  movement: number[],
  finalObj: Point[]
) => {
  const [x, y] = currentPoint;
  movement.forEach((move) => {
    finalObj.push([x - move, y - move]);
  });
};

const calcUp = (currentPoint: Point, movement: number[], finalObj: Point[]) => {
  const [x, y] = currentPoint;
  movement.forEach((move) => {
    finalObj.push([x, y + move]);
  });
};

const calcDown = (
  currentPoint: Point,
  movement: number[],
  finalObj: Point[]
) => {
  const [x, y] = currentPoint;
  movement.forEach((move) => {
    finalObj.push([x, y - move]);
  });
};

const calcRight = (
  currentPoint: Point,
  movement: number[],
  finalObj: Point[]
) => {
  const [x, y] = currentPoint;
  movement.forEach((move) => {
    finalObj.push([x + move, y]);
  });
};

const calcLeft = (
  currentPoint: Point,
  movement: number[],
  finalObj: Point[]
) => {
  const [x, y] = currentPoint;
  movement.forEach((move) => {
    finalObj.push([x - move, y]);
  });
};

function calcCastling(
  kingPoint: Point,
  team: TEAM,
  board: Board,
  lastTurnHistory: TurnHistory | undefined,
  movesObj: Move[]
) {
  const playersRooks = board.getPieces().filter(({ piece }) => {
    return piece?.type === PIECE.R && piece?.team === team;
  });
  if (playersRooks.length) {
    playersRooks.forEach(({ piece: rook, point: rookPoint }) => {
      if (!rook) return;
      //Check for castling move
      if (!rook.moved) {
        const resolve = canCastlingResolve({
          kingPoint,
          rookPoint,
          team,
          board,
          lastTurnHistory,
        });
        if (resolve) {
          //If castling resolve returns true, push the move into available moves
          resolve[0] ? movesObj.push(resolve[1]) : null;
        }
      }
    });
  }
}

function canCastlingResolve({
  kingPoint,
  rookPoint,
  team,
  board,
  lastTurnHistory,
}: {
  kingPoint: Point;
  rookPoint: Point;
  team: TEAM;
  board: Board;
  lastTurnHistory: TurnHistory | undefined;
}) {
  const [kingX, kingY] = kingPoint;
  const [rookX] = rookPoint;
  const spaceBetween = kingX - rookX;
  let distance;
  spaceBetween < 0
    ? (distance = spaceBetween * -1 - 1)
    : (distance = spaceBetween - 1);

  //Calculate the squares in between King and Rook
  const squaresInBetween: Point[] = [];

  for (let step = 1; step <= distance; step++) {
    let stepDirection;
    spaceBetween < 0 ? (stepDirection = step * 1) : (stepDirection = step * -1);
    const point: Point = [kingX + stepDirection, kingY];
    squaresInBetween.push(point);
  }
  //Check if squares in between are used by any pieces
  const pieceInBetween = squaresInBetween.filter((point) => {
    return board.getPiece(point) !== undefined;
  });
  if (!pieceInBetween.length) {
    const squaresInUse = [...squaresInBetween, kingPoint, rookPoint];
    //Check if opponents pieces, threathen any of the spaces in between
    const opponentsPieces = board.getPieces().filter(({ piece }) => {
      return piece && piece.team !== team;
    }) as { piece: GamePiece; point: Point }[];
    const opponentsAvailableMoves = opponentsPieces
      .map(({ piece, point }) =>
        getPieceMoves({
          piece,
          point,
          board,
          lastTurnHistory,
        })
      )
      .flat();
    const isThereOverlap = [];
    for (let i = 0; i < squaresInUse.length; i++) {
      const square = squaresInUse[i];
      for (let k = 0; k < opponentsAvailableMoves.length; k++) {
        const availableMove = opponentsAvailableMoves[k];
        const doesMoveMatchSquare = doPointsMatch(availableMove[0], square);
        doesMoveMatchSquare ? isThereOverlap.push(doesMoveMatchSquare) : null;
      }
    }
    if (!isThereOverlap.length) {
      //If there is no overlap, return the possible castling move
      const returnResult: [boolean, Move] = [true, [rookPoint, "castle"]];
      return returnResult;
    }
  }
}
