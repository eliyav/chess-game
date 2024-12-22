import { Move, PIECE } from "../../shared/game";
import { TEAM } from "../../shared/match";
/*
 * Piece Square Tables, adapted from Sunfish.py:
 * https://github.com/thomasahle/sunfish/blob/master/sunfish.py
 */

const weights = {
  [PIECE.P]: 100,
  [PIECE.N]: 280,
  [PIECE.B]: 320,
  [PIECE.R]: 479,
  [PIECE.Q]: 929,
  [PIECE.K]: 60000,
};

const positionsWhite = {
  [PIECE.P]: [
    [0, -31, -22, -26, -17, 7, 78, 100],
    [0, 8, 9, 3, 16, 29, 83, 100],
    [0, -7, 5, 10, -2, 21, 86, 100],
    [0, -37, -11, 9, 15, 44, 73, 100],
    [0, -36, -10, 6, 14, 40, 102, 105],
    [0, -14, -2, 1, 0, 31, 82, 100],
    [0, 3, 3, 0, 15, 44, 85, 100],
    [0, -31, -19, -23, -13, 7, 90, 100],
  ],
  [PIECE.N]: [
    [-74, -23, -18, -1, 24, 10, -3, -66],
    [-23, -15, 10, 5, 24, 67, -6, -53],
    [-26, 2, 13, 31, 45, 1, 100, -75],
    [-24, 0, 22, 21, 37, 74, -36, -75],
    [-19, 2, 18, 22, 33, 73, 4, -10],
    [-35, 11, 15, 35, 41, 27, 62, -55],
    [-22, -23, 11, 2, 25, 62, -4, -58],
    [-69, -20, -14, 0, 17, -2, -14, -70],
  ],
  [PIECE.B]: [
    [-7, 19, 14, 13, 25, -9, -11, -59],
    [2, 20, 25, 10, 17, 39, 20, -78],
    [-15, 11, 24, 17, 20, -32, 35, -82],
    [-12, 6, 15, 23, 34, 41, -42, -76],
    [-14, 7, 8, 17, 26, 52, -39, -23],
    [-15, 6, 25, 16, 25, -10, 31, -107],
    [-10, 20, 20, 0, 15, 28, 2, -37],
    [-10, 16, 15, 7, 10, -14, -22, -50],
  ],
  [PIECE.R]: [
    [-30, -53, -42, -28, 0, 19, 55, 35],
    [-24, -38, -28, -35, 5, 35, 29, 29],
    [-18, -31, -42, -16, 16, 28, 56, 33],
    [5, -26, -25, -21, 13, 33, 67, 4],
    [-2, -29, -25, -13, 18, 45, 55, 37],
    [-18, -43, -35, -29, -4, 27, 62, 33],
    [-31, -44, -26, -46, -9, 25, 34, 56],
    [-32, -53, -46, -30, -6, 15, 60, 50],
  ],
  [PIECE.Q]: [
    [-39, -36, -30, -27, -22, -6, 2, 24],
    [-30, -18, -6, -16, -15, -13, 43, 57],
    [-31, 0, -13, -11, -2, 20, 32, 76],
    [-13, -19, -11, 25, -5, 17, 60, 20],
    [-31, -15, -16, -1, -10, 25, 72, -10],
    [-36, -15, -11, -10, -2, 20, 63, 60],
    [-34, -21, -16, -13, -20, -13, 43, 57],
    [-42, -38, -27, -22, -6, 2, 24, 88],
  ],
  [PIECE.K]: [
    [17, -4, -47, -55, -55, -62, -32, 4],
    [30, 3, -42, -43, -52, 12, 10, 54],
    [-3, -14, -43, 11, -57, 55, 47],
    [-14, -50, -79, -28, 44, 56, -99],
    [6, -57, -64, -51, -67, 56, -99],
    [-1, -18, -32, -47, 28, 55, 60],
    [40, 13, -29, -8, 37, 10, 83],
    [18, 4, -32, -50, -31, 3, -62],
  ],
  // Endgame King Table
  // k_e: [
  //   [-50, -30, -30, -30, -30, -30, -30, -50],
  //   [-30, -30, -10, -10, -10, -10, -20, -40],
  //   [-30, 0, 20, 30, 30, 30, 20, -10, -30],
  //   [-30, 0, 30, 40, 40, 40, 30, 0, -20],
  //   [-30, 0, 30, 40, 40, 40, 30, 0, -20],
  //   [-30, 0, 20, 30, 30, 30, 20, -10, -30],
  //   [-30, -30, -10, -10, -10, -10, -20, -30],
  //   [-50, -30, -30, -30, -30, -30, -30, -50],
  // ],
};
const positionsBlack = {
  [PIECE.P]: positionsWhite[PIECE.P]
    .slice()
    .reverse()
    .map((row) => row.slice().reverse()),
  [PIECE.N]: positionsWhite[PIECE.N]
    .slice()
    .reverse()
    .map((row) => row.slice().reverse()),
  [PIECE.B]: positionsWhite[PIECE.B]
    .slice()
    .reverse()
    .map((row) => row.slice().reverse()),
  [PIECE.R]: positionsWhite[PIECE.R]
    .slice()
    .reverse()
    .map((row) => row.slice().reverse()),
  [PIECE.Q]: positionsWhite[PIECE.Q]
    .slice()
    .reverse()
    .map((row) => row.slice().reverse()),
  [PIECE.K]: positionsWhite[PIECE.K]
    .slice()
    .reverse()
    .map((row) => row.slice().reverse()),
};

export function evaluateBoardPositions({
  team,
  sum,
  move,
}: {
  team: TEAM;
  sum: number;
  move: Move;
}) {
  let score = 0;
  const piecePositionTable =
    team === TEAM.WHITE ? positionsWhite : positionsBlack;
  const movingPiece = move.movingPiece;
  const [originX, originY] = move.origin;
  const [targetX, targetY] = move.target;

  if (move.type === "capture" || move.type === "enPassant") {
    const capturedPiece = move.capturedPiece!;
    const capturedPieceWeight = weights[capturedPiece];
    score += capturedPieceWeight;
    score += 100;
  } else if (move.type === "castle") {
    score += 50;
  } else if (move.type === "movement") {
    score += 0;
  } else if (move.type === "enPassant") {
    score += 50;
  } else {
    score += 0;
  }

  if (move.promotion) {
    score += 1000;
  }

  const originPositionValue = piecePositionTable[movingPiece][originX][originY];
  const targetPositionValue = piecePositionTable[movingPiece][targetX][targetY];
  const positionDifference = targetPositionValue - originPositionValue;
  score += positionDifference;

  if (team === TEAM.WHITE) {
    sum += score;
  } else {
    sum -= score;
  }

  return sum;
}
