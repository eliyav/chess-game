import { EnPassant, Move, PIECE, Point, TurnHistory } from "../../shared/game";
import { TEAM } from "../../shared/match";
import { Board, type Grid } from "./board";
import { kingInitialPoints } from "./chess-data-import";

type LateralDirection = "up" | "down" | "right" | "left";
type DiagonalDirection = "upRight" | "upLeft" | "downRight" | "downLeft";
type Movements = Partial<Record<LateralDirection | DiagonalDirection, Point[]>>;

export function getPieceMoves({
  grid,
  point,
  piece: { type, team },
  turnHistory,
  checkForCastling,
  skipCastling = false,
}: {
  grid: Grid;
  point: Point;
  piece: { type: PIECE; team: TEAM };
  turnHistory: TurnHistory[];
  skipCastling: boolean;
  checkForCastling: ({
    kingPoint,
    team,
    grid,
    turnHistory,
  }: {
    kingPoint: Point;
    team: TEAM;
    grid: Grid;
    turnHistory: TurnHistory[];
  }) => Move[];
}) {
  const lastTurnHistory = turnHistory.at(-1);
  switch (type) {
    case PIECE.P:
      return calcPawnMoves({
        point,
        team,
        grid,
        turnHistory: lastTurnHistory,
      });
    case PIECE.R:
      return calcRookMoves({ team, point, grid });
    case PIECE.B:
      return calcBishopMoves({ team, point, grid });
    case PIECE.N:
      return calcKnightMoves({ grid, team, point });
    case PIECE.Q:
      return calcQueenMoves({ team, point, grid });
    case PIECE.K:
      return calcKingMoves({
        point,
        grid,
        team,
        turnHistory,
        checkForCastling,
        skipCastling,
      });
  }
}

export const isEnPassantAvailable = ({
  turnHistory,
  grid,
}: {
  turnHistory: TurnHistory;
  grid: Grid;
}): EnPassant | undefined => {
  const { target } = turnHistory;
  const pieceOnLastTurnTargetSquare = Board.getPiece({ grid, point: target });
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
  grid,
}: {
  team: TEAM;
  point: Point;
  grid: Grid;
}) {
  const lateralMovements = calcLateralMovements({
    point,
  });
  return getMovePath({
    origin: point,
    grid,
    team,
    movements: lateralMovements,
    movingPiece: PIECE.R,
  });
}

function calcQueenMoves({
  team,
  point,
  grid,
}: {
  team: TEAM;
  point: Point;
  grid: Grid;
}) {
  const lateralMovements = calcLateralMovements({
    point,
  });
  const diagonalMovements = calcDiagonalMovements({
    point,
  });
  const lateralMoves = getMovePath({
    origin: point,
    grid,
    team,
    movements: lateralMovements,
    movingPiece: PIECE.Q,
  });
  const diagonalMoves = getMovePath({
    origin: point,
    grid,
    team,
    movements: diagonalMovements,
    movingPiece: PIECE.Q,
  });
  return [...lateralMoves, ...diagonalMoves];
}

function calcPawnMoves({
  point,
  team,
  grid,
  turnHistory,
}: {
  point: Point;
  team: TEAM;
  grid: Grid;
  turnHistory: TurnHistory | undefined;
}) {
  const availableMoves: Move[] = [];
  const direction = Board.getDirection(team);
  const [x, y] = point;
  //Calculate Pawn Movement based on current point
  const range = 1;
  const newY = y + range * direction;
  const moveResult = getSpecificMove({
    type: "movement",
    origin: point,
    target: [x, newY],
    team,
    grid,
    movingPiece: PIECE.P,
  });
  if (moveResult) {
    availableMoves.push(moveResult);
    //If he has a move forward and hasnt moved, then can move 2 spaces
    if ((team === TEAM.WHITE && y === 1) || (team === TEAM.BLACK && y === 6)) {
      const extendedRange = 2;
      const newY = y + extendedRange * direction;
      const moveResult = getSpecificMove({
        type: "movement",
        origin: point,
        target: [x, newY],
        team,
        grid,
        movingPiece: PIECE.P,
      });
      if (moveResult) {
        availableMoves.push(moveResult);
      }
    }
  }

  //Calculates Capture points and pushes them in final movement obj if are valid
  const captureMove = getSpecificMove({
    type: "capture",
    origin: point,
    target: [x - direction, y + direction],
    team,
    grid,
    movingPiece: PIECE.P,
  });
  if (captureMove) {
    availableMoves.push(captureMove);
  }
  const captureMove2 = getSpecificMove({
    type: "capture",
    origin: point,
    target: [x + direction, y + direction],
    team,
    grid,
    movingPiece: PIECE.P,
  });
  if (captureMove2) {
    availableMoves.push(captureMove2);
  }

  if (turnHistory) {
    const enPassant = isEnPassantAvailable({ turnHistory, grid });
    if (enPassant) {
      const [x, y] = point;
      const direction = Board.getDirection(team);
      const x1 = x - 1;
      const x2 = x + 1;
      const newY = y + direction;
      const potential1: Point = [x1, newY];
      const potential2: Point = [x2, newY];
      if (
        doPointsMatch(potential1, enPassant.enPassantPoint) ||
        doPointsMatch(potential2, enPassant.enPassantPoint)
      ) {
        availableMoves.push({
          origin: point,
          target: enPassant.enPassantPoint,
          type: "enPassant",
          movingPiece: PIECE.P,
          capturedPiece: PIECE.P,
        });
      }
    }
  }
  return availableMoves;
}

function calcKnightMoves({
  team,
  point,
  grid,
}: {
  team: TEAM;
  point: Point;
  grid: Grid;
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
    const target: Point = [x + moveX, y + moveY];
    const moveResult = getStandardMove({
      origin: point,
      target,
      team,
      grid,
      movingPiece: PIECE.N,
    });
    if (moveResult) {
      availableMoves.push(moveResult);
    }
  });
  return availableMoves;
}

function calcKingMoves({
  point,
  grid,
  turnHistory,
  team,
  checkForCastling,
  skipCastling = false,
}: {
  point: Point;
  grid: Grid;
  turnHistory: TurnHistory[];
  team: TEAM;
  checkForCastling: ({
    kingPoint,
    team,
    grid,
    turnHistory,
  }: {
    kingPoint: Point;
    team: TEAM;
    grid: Grid;
    turnHistory: TurnHistory[];
  }) => Move[];
  skipCastling: boolean;
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
    const target: Point = [x + moveX, y + moveY];
    const moveResult = getStandardMove({
      origin: point,
      target,
      team,
      grid,
      movingPiece: PIECE.K,
    });
    if (moveResult) {
      availableMoves.push(moveResult);
    }
  });

  const isKingInIntialPoint = kingInitialPoints.teams
    .find((teamData) => teamData.name === team)
    ?.startingPoints.some((initialPoint) => doPointsMatch(initialPoint, point));
  if (!isKingInIntialPoint) return availableMoves;
  const hasKingMoved = turnHistory.some((turn) =>
    doPointsMatch(turn.origin, point)
  );
  if (!hasKingMoved && !skipCastling) {
    const castlingMoves = checkForCastling({
      kingPoint: point,
      team,
      grid,
      turnHistory,
    });
    if (castlingMoves.length) {
      availableMoves.push(...castlingMoves);
    }
  }

  return availableMoves;
}

function calcBishopMoves({
  point,
  team,
  grid,
}: {
  point: Point;
  team: TEAM;
  grid: Grid;
}) {
  const diagonalMovements = calcDiagonalMovements({
    point,
  });
  return getMovePath({
    origin: point,
    grid,
    team,
    movingPiece: PIECE.B,
    movements: diagonalMovements,
  });
}

//Filters the moves from the final movements object and enters them in the available moves array
const getMovePath = ({
  origin,
  grid,
  team,
  movements,
  movingPiece,
}: {
  origin: Point;
  grid: Grid;
  team: TEAM;
  movements: Movements;
  movingPiece: PIECE;
}) => {
  const availableMoves: Move[] = [];
  for (const [_, points] of Object.entries(movements)) {
    for (let i = 0; i < points.length; i++) {
      const move = getStandardMove({
        origin,
        target: points[i],
        team,
        grid,
        movingPiece,
      });
      //If no move it means your own piece is blocking the path or out of bounds
      if (!move) break;
      availableMoves.push(move);
      //Since you cant skip over pieces, if a piece is found in the path, break the loop
      if (move.type === "capture") {
        break;
      }
    }
  }
  return availableMoves;
};

//Calculates Horizontal Movements by calculating each direction from the current point and adds them to the final movements object
const calcDiagonalMovements = ({ point }: { point: Point }) => {
  const upRight = calculateMovements({
    direction: "upRight",
    point,
  });
  const upLeft = calculateMovements({
    direction: "upLeft",
    point,
  });
  const downRight = calculateMovements({
    direction: "downRight",
    point,
  });
  const downLeft = calculateMovements({
    direction: "downLeft",
    point,
  });
  return {
    upRight,
    upLeft,
    downRight,
    downLeft,
  };
};

//Calculates Vertical Movements by calculating each direction from the current point and adds them to the final movements object
const calcLateralMovements = ({ point }: { point: Point }) => {
  const up = calculateMovements({
    direction: "up",
    point,
  });
  const down = calculateMovements({
    direction: "down",
    point,
  });
  const right = calculateMovements({
    direction: "right",
    point,
  });
  const left = calculateMovements({
    direction: "left",
    point,
  });
  return {
    up,
    down,
    right,
    left,
  };
};

function getStandardMove({
  origin,
  target,
  movingPiece,
  grid,
  team,
}: {
  origin: Point;
  target: Point;
  grid: Grid;
  team: TEAM;
  movingPiece: PIECE;
}): Move | undefined {
  const [x, y] = target;
  const isInBounds = bounds(x, grid) && bounds(y, grid);
  if (!isInBounds) return;
  const pieceOnPoint = Board.getPiece({ grid, point: target });
  if (pieceOnPoint) {
    if (pieceOnPoint.team !== team) {
      return {
        origin,
        target,
        type: "capture",
        movingPiece,
        capturedPiece: pieceOnPoint.type,
      };
    }
  } else {
    return {
      origin,
      target,
      type: "movement",
      movingPiece,
    };
  }
}

function getSpecificMove({
  type,
  origin,
  target,
  grid,
  team,
  movingPiece,
}: {
  type: "movement" | "capture";
  origin: Point;
  target: Point;
  grid: Grid;
  team: TEAM;
  movingPiece: PIECE;
}): Move | undefined {
  const [x, y] = target;
  const isInBounds = bounds(x, grid) && bounds(y, grid);
  if (!isInBounds) return;
  const pieceOnPoint = Board.getPiece({ grid, point: target });
  if (type === "capture") {
    if (pieceOnPoint) {
      if (pieceOnPoint.team !== team) {
        return {
          origin,
          target,
          type: "capture",
          movingPiece,
          capturedPiece: pieceOnPoint.type,
        };
      }
    }
  } else {
    if (!pieceOnPoint) {
      return {
        origin,
        target,
        type: "movement",
        movingPiece,
      };
    }
  }
}

const bounds = (num: number, grid: Grid) => num >= 0 && num <= grid.length - 1;

type Direction =
  | "up"
  | "down"
  | "right"
  | "left"
  | "upRight"
  | "upLeft"
  | "downRight"
  | "downLeft";

const directionMap: {
  [key: string]: (x: number, y: number, move: number) => Point;
} = {
  upRight: (x, y, move) => [x + move, y + move],
  upLeft: (x, y, move) => [x - move, y + move],
  downRight: (x, y, move) => [x + move, y - move],
  downLeft: (x, y, move) => [x - move, y - move],
  up: (x, y, move) => [x, y + move],
  down: (x, y, move) => [x, y - move],
  right: (x, y, move) => [x + move, y],
  left: (x, y, move) => [x - move, y],
};

const calculateMovements = ({
  direction,
  point,
}: {
  direction: Direction;
  point: Point;
}): Point[] => {
  const movements = [1, 2, 3, 4, 5, 6, 7]; //Max number of squares a piece can move in a direction;
  const [x, y] = point;
  const transform = directionMap[direction];
  if (!transform) throw new Error(`Invalid direction: ${direction}`);
  return movements.map((move) => transform(x, y, move));
};
