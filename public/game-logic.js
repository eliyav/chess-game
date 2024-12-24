"use strict";
(() => {
  // src/shared/game.ts
  var PIECE = /* @__PURE__ */ ((PIECE2) => {
    PIECE2["P"] = "Pawn";
    PIECE2["R"] = "Rook";
    PIECE2["B"] = "Bishop";
    PIECE2["N"] = "Knight";
    PIECE2["K"] = "King";
    PIECE2["Q"] = "Queen";
    return PIECE2;
  })(PIECE || {});

  // src/client/game-logic/chess-data-import.ts
  var boardPoints = [];
  for (let x = 0; x < 8; x++) {
    for (let z = 0; z < 8; z++) {
      boardPoints.push([x, z]);
    }
  }
  var chessData = {
    boardSize: 8,
    columnNames: ["a", "b", "c", "d", "e", "f", "g", "h"],
    boardPoints,
    initialPositions: [
      {
        type: "Pawn" /* P */,
        teams: [
          {
            name: "White" /* WHITE */,
            startingPoints: [
              [0, 1],
              [1, 1],
              [2, 1],
              [3, 1],
              [4, 1],
              [5, 1],
              [6, 1],
              [7, 1]
            ]
          },
          {
            name: "Black" /* BLACK */,
            startingPoints: [
              [0, 6],
              [1, 6],
              [2, 6],
              [3, 6],
              [4, 6],
              [5, 6],
              [6, 6],
              [7, 6]
            ]
          }
        ]
      },
      {
        type: "Rook" /* R */,
        teams: [
          {
            name: "White" /* WHITE */,
            startingPoints: [
              [0, 0],
              [7, 0]
            ]
          },
          {
            name: "Black" /* BLACK */,
            startingPoints: [
              [0, 7],
              [7, 7]
            ]
          }
        ]
      },
      {
        type: "Bishop" /* B */,
        teams: [
          {
            name: "White" /* WHITE */,
            startingPoints: [
              [2, 0],
              [5, 0]
            ]
          },
          {
            name: "Black" /* BLACK */,
            startingPoints: [
              [2, 7],
              [5, 7]
            ]
          }
        ]
      },
      {
        type: "Knight" /* N */,
        teams: [
          {
            name: "White" /* WHITE */,
            startingPoints: [
              [1, 0],
              [6, 0]
            ]
          },
          {
            name: "Black" /* BLACK */,
            startingPoints: [
              [1, 7],
              [6, 7]
            ]
          }
        ]
      },
      {
        type: "King" /* K */,
        teams: [
          {
            name: "White" /* WHITE */,
            startingPoints: [[4, 0]]
          },
          {
            name: "Black" /* BLACK */,
            startingPoints: [[4, 7]]
          }
        ]
      },
      {
        type: "Queen" /* Q */,
        teams: [
          {
            name: "White" /* WHITE */,
            startingPoints: [[3, 0]]
          },
          {
            name: "Black" /* BLACK */,
            startingPoints: [[3, 7]]
          }
        ]
      }
    ]
  };
  var rookInitialPoints = chessData.initialPositions.find(
    (positions) => positions.type === "Rook" /* R */
  );
  var kingInitialPoints = chessData.initialPositions.find(
    (positions) => positions.type === "King" /* K */
  );
  var chess_data_import_default = chessData;

  // src/client/game-logic/game-piece.ts
  var GamePiece = class {
    type;
    team;
    constructor({ type, team }) {
      this.type = type;
      this.team = team;
    }
    getSymbol() {
      return Object.entries(PIECE).find(([_, value]) => value === this.type)?.[0];
    }
  };
  var game_piece_default = GamePiece;

  // src/client/game-logic/board.ts
  var Board = class {
    static cloneGrid({ grid }) {
      const clone = grid.map((row) => row.map((square) => square));
      return clone;
    }
    static setPieces({
      grid,
      initialPositions = chess_data_import_default.initialPositions
    }) {
      initialPositions.forEach((positions) => {
        const { type } = positions;
        positions.teams.forEach((team) => {
          team.startingPoints.forEach((point) => {
            this.addPiece({
              grid,
              point,
              piece: new game_piece_default({
                type,
                team: team.name
              })
            });
          });
        });
      });
    }
    static createGrid(boardSize = chess_data_import_default.boardSize) {
      const grid = Array.from(
        { length: boardSize },
        () => Array.from({ length: boardSize }, () => void 0)
      );
      this.setPieces({ grid });
      return grid;
    }
    static getPiece({ grid, point }) {
      const [x, y] = point;
      return grid[x][y];
    }
    static getPieces({ grid, team }) {
      const pieces = grid.flatMap(
        (row, x) => row.map((piece, y) => ({
          piece,
          point: [x, y]
        }))
      ).filter(({ piece }) => piece !== void 0);
      if (!team) return pieces;
      return pieces.filter(({ piece }) => piece?.team === team);
    }
    static removePiece({ grid, point }) {
      const [x, y] = point;
      grid[x][y] = void 0;
    }
    static addPiece({
      grid,
      point,
      piece
    }) {
      const [x, y] = point;
      grid[x][y] = piece;
    }
    static getDirection(team) {
      return team === "White" /* WHITE */ ? 1 : -1;
    }
    static getSquareName({ point }) {
      const [x, y] = point;
      return `${String.fromCharCode(65 + x)}${7 - y}`.toLowerCase();
    }
  };

  // src/client/game-logic/moves.ts
  function getPieceMoves({
    grid,
    point,
    piece: { type, team },
    turnHistory,
    checkForCastling,
    skipCastling = false
  }) {
    const lastTurnHistory = turnHistory.at(-1);
    switch (type) {
      case "Pawn" /* P */:
        return calcPawnMoves({
          point,
          team,
          grid,
          turnHistory: lastTurnHistory
        });
      case "Rook" /* R */:
        return calcRookMoves({ team, point, grid });
      case "Bishop" /* B */:
        return calcBishopMoves({ team, point, grid });
      case "Knight" /* N */:
        return calcKnightMoves({ grid, team, point });
      case "Queen" /* Q */:
        return calcQueenMoves({ team, point, grid });
      case "King" /* K */:
        return calcKingMoves({
          point,
          grid,
          team,
          turnHistory,
          checkForCastling,
          skipCastling
        });
    }
  }
  var isEnPassantAvailable = ({
    turnHistory,
    grid
  }) => {
    const { target } = turnHistory;
    const pieceOnLastTurnTargetSquare = Board.getPiece({ grid, point: target });
    if (!pieceOnLastTurnTargetSquare || pieceOnLastTurnTargetSquare.type !== "Pawn" /* P */)
      return;
    const targetY = turnHistory.target[1];
    const originY = turnHistory.origin[1];
    const moved = Math.abs(targetY - originY);
    if (moved !== 2) return;
    const direction = pieceOnLastTurnTargetSquare.team === "White" /* WHITE */ ? 1 : -1;
    const x = turnHistory.target[0];
    const y = turnHistory.origin[1] + direction;
    const enPassantPoint = [x, y];
    return {
      enPassantPoint,
      capturedPiecePoint: target,
      capturedPiece: pieceOnLastTurnTargetSquare
    };
  };
  var doPointsMatch = (point, point2) => point[0] == point2[0] && point[1] == point2[1];
  function calcRookMoves({
    team,
    point,
    grid
  }) {
    const lateralMovements = calcLateralMovements({
      point
    });
    return getMovePath({
      origin: point,
      grid,
      team,
      movements: lateralMovements,
      movingPiece: "Rook" /* R */
    });
  }
  function calcQueenMoves({
    team,
    point,
    grid
  }) {
    const lateralMovements = calcLateralMovements({
      point
    });
    const diagonalMovements = calcDiagonalMovements({
      point
    });
    const lateralMoves = getMovePath({
      origin: point,
      grid,
      team,
      movements: lateralMovements,
      movingPiece: "Queen" /* Q */
    });
    const diagonalMoves = getMovePath({
      origin: point,
      grid,
      team,
      movements: diagonalMovements,
      movingPiece: "Queen" /* Q */
    });
    return [...lateralMoves, ...diagonalMoves];
  }
  function calcPawnMoves({
    point,
    team,
    grid,
    turnHistory
  }) {
    const availableMoves = [];
    const direction = Board.getDirection(team);
    const [x, y] = point;
    const range = 1;
    const newY = y + range * direction;
    const promotion = checkPromotion({
      point: [x, newY]
    });
    const moveResult = getSpecificMove({
      type: "movement",
      origin: point,
      target: [x, newY],
      team,
      grid,
      movingPiece: "Pawn" /* P */
    });
    if (moveResult) {
      availableMoves.push({ ...moveResult, promotion });
      if (team === "White" /* WHITE */ && y === 1 || team === "Black" /* BLACK */ && y === 6) {
        const extendedRange = 2;
        const newY2 = y + extendedRange * direction;
        const moveResult2 = getSpecificMove({
          type: "movement",
          origin: point,
          target: [x, newY2],
          team,
          grid,
          movingPiece: "Pawn" /* P */
        });
        if (moveResult2) {
          availableMoves.push(moveResult2);
        }
      }
    }
    const captureMove = getSpecificMove({
      type: "capture",
      origin: point,
      target: [x - direction, y + direction],
      team,
      grid,
      movingPiece: "Pawn" /* P */
    });
    if (captureMove) {
      availableMoves.push({ ...captureMove, promotion });
    }
    const captureMove2 = getSpecificMove({
      type: "capture",
      origin: point,
      target: [x + direction, y + direction],
      team,
      grid,
      movingPiece: "Pawn" /* P */
    });
    if (captureMove2) {
      availableMoves.push({ ...captureMove2, promotion });
    }
    if (turnHistory) {
      const enPassant = isEnPassantAvailable({ turnHistory, grid });
      if (enPassant) {
        const [x2, y2] = point;
        const direction2 = Board.getDirection(team);
        const x1 = x2 - 1;
        const x22 = x2 + 1;
        const newY2 = y2 + direction2;
        const potential1 = [x1, newY2];
        const potential2 = [x22, newY2];
        if (doPointsMatch(potential1, enPassant.enPassantPoint) || doPointsMatch(potential2, enPassant.enPassantPoint)) {
          availableMoves.push({
            origin: point,
            target: enPassant.enPassantPoint,
            type: "enPassant",
            movingPiece: "Pawn" /* P */,
            capturedPiece: "Pawn" /* P */
          });
        }
      }
    }
    return availableMoves;
  }
  function checkPromotion({ point }) {
    if (point[1] === 0 || point[1] === 7) {
      return true;
    } else {
      return false;
    }
  }
  function calcKnightMoves({
    team,
    point,
    grid
  }) {
    const availableMoves = [];
    const movements = [
      [1, 2],
      [2, 1],
      [2, -1],
      [1, -2],
      [-1, 2],
      [-2, 1],
      [-2, -1],
      [-1, -2]
    ];
    const [x, y] = point;
    movements.forEach(([moveX, moveY]) => {
      const target = [x + moveX, y + moveY];
      const moveResult = getStandardMove({
        origin: point,
        target,
        team,
        grid,
        movingPiece: "Knight" /* N */
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
    skipCastling = false
  }) {
    const kingMovements = [
      [0, 1],
      [1, 0],
      [1, 1],
      [1, -1],
      [0, -1],
      [-1, -1],
      [-1, 0],
      [-1, 1]
    ];
    const availableMoves = [];
    const [x, y] = point;
    kingMovements.forEach(([moveX, moveY]) => {
      const target = [x + moveX, y + moveY];
      const moveResult = getStandardMove({
        origin: point,
        target,
        team,
        grid,
        movingPiece: "King" /* K */
      });
      if (moveResult) {
        availableMoves.push(moveResult);
      }
    });
    const isKingInIntialPoint = kingInitialPoints.teams.find((teamData) => teamData.name === team)?.startingPoints.some((initialPoint) => doPointsMatch(initialPoint, point));
    if (!isKingInIntialPoint) return availableMoves;
    const hasKingMoved = turnHistory.some(
      (turn) => doPointsMatch(turn.origin, point)
    );
    if (!hasKingMoved && !skipCastling) {
      const castlingMoves = checkForCastling({
        kingPoint: point,
        team,
        grid,
        turnHistory
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
    grid
  }) {
    const diagonalMovements = calcDiagonalMovements({
      point
    });
    return getMovePath({
      origin: point,
      grid,
      team,
      movingPiece: "Bishop" /* B */,
      movements: diagonalMovements
    });
  }
  var getMovePath = ({
    origin,
    grid,
    team,
    movements,
    movingPiece
  }) => {
    const availableMoves = [];
    for (const [_, points] of Object.entries(movements)) {
      for (let i = 0; i < points.length; i++) {
        const move = getStandardMove({
          origin,
          target: points[i],
          team,
          grid,
          movingPiece
        });
        if (!move) break;
        availableMoves.push(move);
        if (move.type === "capture") {
          break;
        }
      }
    }
    return availableMoves;
  };
  var calcDiagonalMovements = ({ point }) => {
    const upRight = calculateMovements({
      direction: "upRight",
      point
    });
    const upLeft = calculateMovements({
      direction: "upLeft",
      point
    });
    const downRight = calculateMovements({
      direction: "downRight",
      point
    });
    const downLeft = calculateMovements({
      direction: "downLeft",
      point
    });
    return {
      upRight,
      upLeft,
      downRight,
      downLeft
    };
  };
  var calcLateralMovements = ({ point }) => {
    const up = calculateMovements({
      direction: "up",
      point
    });
    const down = calculateMovements({
      direction: "down",
      point
    });
    const right = calculateMovements({
      direction: "right",
      point
    });
    const left = calculateMovements({
      direction: "left",
      point
    });
    return {
      up,
      down,
      right,
      left
    };
  };
  function getStandardMove({
    origin,
    target,
    movingPiece,
    grid,
    team
  }) {
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
          capturedPiece: pieceOnPoint.type
        };
      }
    } else {
      return {
        origin,
        target,
        type: "movement",
        movingPiece
      };
    }
  }
  function getSpecificMove({
    type,
    origin,
    target,
    grid,
    team,
    movingPiece
  }) {
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
            capturedPiece: pieceOnPoint.type
          };
        }
      }
    } else {
      if (!pieceOnPoint) {
        return {
          origin,
          target,
          type: "movement",
          movingPiece
        };
      }
    }
  }
  var bounds = (num, grid) => num >= 0 && num <= grid.length - 1;
  var directionMap = {
    upRight: (x, y, move) => [x + move, y + move],
    upLeft: (x, y, move) => [x - move, y + move],
    downRight: (x, y, move) => [x + move, y - move],
    downLeft: (x, y, move) => [x - move, y - move],
    up: (x, y, move) => [x, y + move],
    down: (x, y, move) => [x, y - move],
    right: (x, y, move) => [x + move, y],
    left: (x, y, move) => [x - move, y]
  };
  var calculateMovements = ({
    direction,
    point
  }) => {
    const movements = [1, 2, 3, 4, 5, 6, 7];
    const [x, y] = point;
    const transform = directionMap[direction];
    if (!transform) throw new Error(`Invalid direction: ${direction}`);
    return movements.map((move) => transform(x, y, move));
  };

  // src/client/game-logic/ai-opponent.ts
  var weights = {
    ["Pawn" /* P */]: 100,
    ["Knight" /* N */]: 280,
    ["Bishop" /* B */]: 320,
    ["Rook" /* R */]: 479,
    ["Queen" /* Q */]: 929,
    ["King" /* K */]: 6e4
  };
  var positionsWhite = {
    ["Pawn" /* P */]: [
      [0, -31, -22, -26, -17, 7, 78, 100],
      [0, 8, 9, 3, 16, 29, 83, 100],
      [0, -7, 5, 10, -2, 21, 86, 100],
      [0, -37, -11, 9, 15, 44, 73, 100],
      [0, -36, -10, 6, 14, 40, 102, 105],
      [0, -14, -2, 1, 0, 31, 82, 100],
      [0, 3, 3, 0, 15, 44, 85, 100],
      [0, -31, -19, -23, -13, 7, 90, 100]
    ],
    ["Knight" /* N */]: [
      [-74, -23, -18, -1, 24, 10, -3, -66],
      [-23, -15, 10, 5, 24, 67, -6, -53],
      [-26, 2, 13, 31, 45, 1, 100, -75],
      [-24, 0, 22, 21, 37, 74, -36, -75],
      [-19, 2, 18, 22, 33, 73, 4, -10],
      [-35, 11, 15, 35, 41, 27, 62, -55],
      [-22, -23, 11, 2, 25, 62, -4, -58],
      [-69, -20, -14, 0, 17, -2, -14, -70]
    ],
    ["Bishop" /* B */]: [
      [-7, 19, 14, 13, 25, -9, -11, -59],
      [2, 20, 25, 10, 17, 39, 20, -78],
      [-15, 11, 24, 17, 20, -32, 35, -82],
      [-12, 6, 15, 23, 34, 41, -42, -76],
      [-14, 7, 8, 17, 26, 52, -39, -23],
      [-15, 6, 25, 16, 25, -10, 31, -107],
      [-10, 20, 20, 0, 15, 28, 2, -37],
      [-10, 16, 15, 7, 10, -14, -22, -50]
    ],
    ["Rook" /* R */]: [
      [-30, -53, -42, -28, 0, 19, 55, 35],
      [-24, -38, -28, -35, 5, 35, 29, 29],
      [-18, -31, -42, -16, 16, 28, 56, 33],
      [5, -26, -25, -21, 13, 33, 67, 4],
      [-2, -29, -25, -13, 18, 45, 55, 37],
      [-18, -43, -35, -29, -4, 27, 62, 33],
      [-31, -44, -26, -46, -9, 25, 34, 56],
      [-32, -53, -46, -30, -6, 15, 60, 50]
    ],
    ["Queen" /* Q */]: [
      [-39, -36, -30, -27, -22, -6, 2, 24],
      [-30, -18, -6, -16, -15, -13, 43, 57],
      [-31, 0, -13, -11, -2, 20, 32, 76],
      [-13, -19, -11, 25, -5, 17, 60, 20],
      [-31, -15, -16, -1, -10, 25, 72, -10],
      [-36, -15, -11, -10, -2, 20, 63, 60],
      [-34, -21, -16, -13, -20, -13, 43, 57],
      [-42, -38, -27, -22, -6, 2, 24, 88]
    ],
    ["King" /* K */]: [
      [17, -4, -47, -55, -55, -62, -32, 4],
      [30, 3, -42, -43, -52, 12, 10, 54],
      [-3, -14, -43, 11, -57, 55, 47],
      [-14, -50, -79, -28, 44, 56, -99],
      [6, -57, -64, -51, -67, 56, -99],
      [-1, -18, -32, -47, 28, 55, 60],
      [40, 13, -29, -8, 37, 10, 83],
      [18, 4, -32, -50, -31, 3, -62]
    ]
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
  var positionsBlack = {
    ["Pawn" /* P */]: positionsWhite["Pawn" /* P */].slice().reverse().map((row) => row.slice().reverse()),
    ["Knight" /* N */]: positionsWhite["Knight" /* N */].slice().reverse().map((row) => row.slice().reverse()),
    ["Bishop" /* B */]: positionsWhite["Bishop" /* B */].slice().reverse().map((row) => row.slice().reverse()),
    ["Rook" /* R */]: positionsWhite["Rook" /* R */].slice().reverse().map((row) => row.slice().reverse()),
    ["Queen" /* Q */]: positionsWhite["Queen" /* Q */].slice().reverse().map((row) => row.slice().reverse()),
    ["King" /* K */]: positionsWhite["King" /* K */].slice().reverse().map((row) => row.slice().reverse())
  };
  function evaluateBoardPositions({
    team,
    sum,
    move
  }) {
    let score = 0;
    const piecePositionTable = team === "White" /* WHITE */ ? positionsWhite : positionsBlack;
    const movingPiece = move.movingPiece;
    const [originX, originY] = move.origin;
    const [targetX, targetY] = move.target;
    if (move.type === "capture" || move.type === "enPassant") {
      const capturedPiece = move.capturedPiece;
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
      score += 1e3;
    }
    const originPositionValue = piecePositionTable[movingPiece][originX][originY];
    const targetPositionValue = piecePositionTable[movingPiece][targetX][targetY];
    const absoluteValueOrigin = Math.abs(originPositionValue);
    const absoluteValueTarget = Math.abs(targetPositionValue);
    let difference = 0;
    if (absoluteValueOrigin > absoluteValueTarget) {
      difference = -(originPositionValue - targetPositionValue);
    } else if (absoluteValueOrigin < absoluteValueTarget) {
      difference = targetPositionValue - originPositionValue;
    } else {
      difference = 0;
    }
    score += difference;
    if (team === "White" /* WHITE */) {
      sum += score;
    } else {
      sum -= score;
    }
    return sum;
  }

  // src/client/game-logic/game.ts
  var Game = class {
    teams;
    current;
    constructor() {
      this.teams = ["White" /* WHITE */, "Black" /* BLACK */];
      this.current = this.createGame();
    }
    createGame() {
      return {
        grid: Board.createGrid(),
        annotations: [],
        turnHistory: [],
        status: "In Progress" /* INPROGRESS */
      };
    }
    getCurrentTeam() {
      const remainder = this.getTurn() % 2;
      const index = remainder ? 0 : 1;
      return this.teams[index];
    }
    getCurrentTeamsOpponent() {
      const remainder = this.getTurn() % 2;
      const index = remainder ? 1 : 0;
      return this.teams[index];
    }
    getGameState() {
      return this.current;
    }
    nextTurn() {
      if (this.isCheckmate({ grid: this.current.grid })) {
        this.current.status = "Checkmate" /* CHECKMATE */;
      } else if (this.isStalemate({ grid: this.current.grid })) {
        this.current.status = "Stalemate" /* STALEMATE */;
      }
    }
    getTurn() {
      return this.current.turnHistory.length + 1;
    }
    move({
      origin,
      target,
      grid = this.current.grid,
      simulate
    }) {
      if (this.current.status !== "In Progress" /* INPROGRESS */) return;
      const move = this.findMove({ grid, origin, target });
      if (!move) return;
      const resolved = this.resolveBoard({
        move,
        grid
      });
      if (!resolved) return;
      this.annotate(resolved);
      if (!simulate) {
        this.nextTurn();
      }
      return resolved;
    }
    resolveBoard({ move, grid }) {
      const { type: moveType, origin, target } = move;
      const originPiece = Board.getPiece({ grid, point: origin });
      if (!originPiece) return;
      let resolvedMove;
      if (moveType === "movement") {
        resolvedMove = this.resolveMovement({ move, grid });
      } else if (moveType === "capture") {
        resolvedMove = this.resolveCapture({ move, grid });
      } else if (moveType === "enPassant") {
        resolvedMove = this.resolveEnPassant({ move, grid });
      } else {
        resolvedMove = this.resolveCastling({ move, grid });
      }
      if (!resolvedMove) return;
      if (resolvedMove.promotion) {
        this.setPromotionPiece({
          target,
          originPiece,
          selection: "Queen" /* Q */,
          grid
        });
      }
      const isOpponentInCheck = this.isChecked({
        team: this.getCurrentTeamsOpponent(),
        grid
      }) !== void 0;
      return {
        ...resolvedMove,
        isOpponentInCheck
      };
    }
    resolveMovement({
      move,
      grid
    }) {
      const { origin, target, promotion } = move;
      const originPiece = this.lookupPiece({ grid, point: origin });
      if (!originPiece) return;
      Board.addPiece({ grid, point: target, piece: originPiece });
      Board.removePiece({ grid, point: origin });
      return {
        type: "movement",
        origin,
        target,
        promotion,
        isOpponentInCheck: false
      };
    }
    resolveCapture({
      move,
      grid
    }) {
      const { origin, target, promotion } = move;
      const originPiece = this.lookupPiece({ grid, point: origin });
      const targetPiece = this.lookupPiece({ grid, point: target });
      if (!originPiece || !targetPiece) return;
      Board.addPiece({ grid, point: target, piece: originPiece });
      Board.removePiece({ grid, point: origin });
      return {
        type: "capture",
        origin,
        target,
        promotion,
        capturedPiece: targetPiece,
        isOpponentInCheck: false
      };
    }
    resolveEnPassant({
      move,
      grid
    }) {
      const { origin, target } = move;
      const originPiece = this.lookupPiece({ grid, point: origin });
      if (!originPiece) return;
      const lastTurnHistory = this.current.turnHistory.at(-1);
      if (!lastTurnHistory) return;
      const enPassant = isEnPassantAvailable({
        turnHistory: lastTurnHistory,
        grid
      });
      if (enPassant) {
        Board.addPiece({ grid, point: target, piece: originPiece });
        Board.removePiece({ grid, point: origin });
        Board.removePiece({ grid, point: enPassant.capturedPiecePoint });
        return {
          type: "enPassant",
          origin,
          target,
          enPassant,
          isOpponentInCheck: false
        };
      }
    }
    resolveCastling({
      move,
      grid
    }) {
      const { origin, target } = move;
      const originPiece = this.lookupPiece({ grid, point: origin });
      const targetPiece = this.lookupPiece({ grid, point: target });
      if (!originPiece || !targetPiece) return;
      const [originX, OriginY] = origin;
      const [targetX] = target;
      const c = originX - targetX;
      const direction = c < 0 ? 1 : -1;
      const newKingPoint = [originX + direction * 2, OriginY];
      const newRookPoint = [originX + direction, OriginY];
      Board.addPiece({ grid, point: newKingPoint, piece: originPiece });
      Board.addPiece({ grid, point: newRookPoint, piece: targetPiece });
      Board.removePiece({ grid, point: origin });
      Board.removePiece({ grid, point: target });
      return {
        type: "castle",
        origin,
        target,
        castling: {
          direction,
          kingTarget: newKingPoint,
          rookTarget: newRookPoint
        },
        isOpponentInCheck: false
      };
    }
    undoTurn(grid = this.current.grid) {
      const lastTurn = this.current.turnHistory.at(-1);
      if (lastTurn) {
        if (lastTurn.promotion) {
          const { origin, target } = lastTurn;
          const originPiece = new game_piece_default({
            team: this.getCurrentTeamsOpponent(),
            type: "Pawn" /* P */
          });
          Board.removePiece({ grid, point: target });
          Board.addPiece({ grid, point: origin, piece: originPiece });
          if (lastTurn.type === "capture") {
            const { capturedPiece } = lastTurn;
            Board.addPiece({
              grid,
              point: target,
              piece: new game_piece_default(capturedPiece)
            });
          }
        } else if (lastTurn.type === "movement") {
          const { origin, target } = lastTurn;
          Board.addPiece({
            grid: this.current.grid,
            point: origin,
            piece: Board.getPiece({ grid, point: target })
          });
          Board.removePiece({ grid, point: target });
        } else if (lastTurn.type === "capture") {
          const { origin, target, capturedPiece } = lastTurn;
          Board.addPiece({
            grid,
            point: origin,
            piece: Board.getPiece({ grid, point: target })
          });
          Board.addPiece({
            grid,
            point: target,
            piece: new game_piece_default(capturedPiece)
          });
        } else if (lastTurn.type === "enPassant") {
          const { origin, target, enPassant } = lastTurn;
          Board.addPiece({
            grid,
            point: origin,
            piece: Board.getPiece({ grid, point: target })
          });
          Board.addPiece({
            grid,
            point: enPassant.capturedPiecePoint,
            piece: new game_piece_default(enPassant.capturedPiece)
          });
          Board.removePiece({ grid, point: enPassant.enPassantPoint });
        } else if (lastTurn.type === "castle") {
          const { origin, target, castling } = lastTurn;
          const { kingTarget, rookTarget } = castling;
          const kingPiece = Board.getPiece({ grid, point: kingTarget });
          const rookPiece = Board.getPiece({ grid, point: rookTarget });
          Board.addPiece({ grid, point: origin, piece: kingPiece });
          Board.addPiece({ grid, point: target, piece: rookPiece });
          Board.removePiece({ grid, point: kingTarget });
          Board.removePiece({ grid, point: rookTarget });
        }
        this.current.turnHistory.pop();
        this.current.annotations.pop();
        return true;
      }
      return false;
    }
    getMoves({
      point,
      grid = this.current.grid,
      skipResolveCheck,
      skipCastling = false
    }) {
      const piece = this.lookupPiece({ point });
      if (!piece) return [];
      const { type, team } = piece;
      const availableMoves = getPieceMoves({
        point,
        piece: { type, team },
        grid,
        turnHistory: this.current.turnHistory,
        skipCastling,
        checkForCastling: this.checkForCastling.bind(this)
      });
      if (skipResolveCheck) {
        return availableMoves;
      } else {
        return availableMoves.filter((move) => {
          return this.canMoveResolve({ move, team });
        });
      }
    }
    findMove({
      origin,
      target,
      grid
    }) {
      const piece = this.lookupPiece({ grid, point: origin });
      if (!piece || piece.team !== this.getCurrentTeam()) return;
      const availableMoves = this.getMoves({
        point: origin,
        grid
      });
      const move = availableMoves.find(
        ({ target: moveTarget }) => doPointsMatch(moveTarget, target)
      );
      return move;
    }
    canMoveResolve({
      move,
      team,
      grid = this.current.grid
    }) {
      const clonedGrid = Board.cloneGrid({ grid });
      this.resolveBoard({
        move,
        grid: clonedGrid
      });
      const isMoveResolvable = this.isChecked({
        team,
        grid: clonedGrid
      }) ? false : true;
      return isMoveResolvable;
    }
    getAllPieces(grid = this.current.grid) {
      return Board.getPieces({ grid });
    }
    lookupPiece({
      point,
      grid = this.current.grid
    }) {
      return Board.getPiece({ grid, point });
    }
    isChecked({ team, grid }) {
      const pieces = Board.getPieces({ grid });
      const king = pieces.find(({ piece }) => {
        return piece?.type === "King" /* K */ && piece?.team === team;
      });
      const opponentsPieces = pieces.filter(({ piece }) => {
        return piece?.team !== team;
      });
      const opponentsAvailableMoves = opponentsPieces.map(
        ({ point }) => this.getMoves({
          point,
          grid,
          skipResolveCheck: true,
          skipCastling: true
        })
      ).flat();
      const isKingChecked = opponentsAvailableMoves.find(
        ({ target }) => doPointsMatch(target, king.point)
      );
      return isKingChecked;
    }
    isCheckmate({ grid }) {
      const currentPlayerPieces = this.getAllPieces(grid).filter(
        ({ piece }) => piece?.team === this.getCurrentTeam()
      );
      const anyAvailableMoves = currentPlayerPieces.map(({ point }) => {
        return this.getMoves({
          point,
          grid
        });
      }).flat();
      return anyAvailableMoves.length ? false : true;
    }
    isStalemate({ grid }) {
      const currentPlayerPieces = this.getAllPieces(grid).filter(
        ({ piece }) => piece?.team === this.getCurrentTeam()
      );
      const anyAvailableMoves = currentPlayerPieces.map(({ point }) => {
        return this.getMoves({
          point,
          grid
        });
      }).flat();
      const playerInCheck = this.isChecked({
        team: this.getCurrentTeam(),
        grid
      });
      return anyAvailableMoves.length === 0 && !playerInCheck ? true : false;
    }
    setPromotionPiece({
      target,
      originPiece,
      selection,
      grid
    }) {
      Board.removePiece({ grid, point: target });
      const promotedPiece = new game_piece_default({
        type: selection,
        team: originPiece.team
      });
      Board.addPiece({ grid, point: target, piece: promotedPiece });
    }
    resetGame() {
      this.current = this.createGame();
    }
    getHistory() {
      return this.current.turnHistory;
    }
    annotate(history) {
      let annotation;
      const moveType = history.type;
      const promotion = history.promotion;
      const originPiece = Board.getPiece({
        grid: this.current.grid,
        point: history.target
      });
      const opponentInCheck = history.isOpponentInCheck;
      const originSquare = Board.getSquareName({
        point: history.origin
      });
      const targetSquare = Board.getSquareName({ point: history.target });
      const isCapturing = history.type === "capture";
      const symbol = originPiece?.getSymbol();
      if (moveType === "castle") {
        annotation = history.castling.direction === 1 ? "O-O" : "O-O-O";
      } else if (promotion) {
        annotation = `${targetSquare}${"Q"}`;
      } else if (isCapturing) {
        if (originPiece?.type === "Pawn") {
          annotation = `${originSquare.charAt(0)}x${targetSquare}`;
        } else {
          annotation = `${symbol}x${targetSquare}`;
        }
      } else {
        annotation = `${symbol}${targetSquare}`;
      }
      if (opponentInCheck) annotation = `${annotation}+`;
      this.current.annotations.push(annotation);
      this.current.turnHistory.push(history);
    }
    getBestMove({ depth }) {
      let sum = 0;
      const result = this.minimax({
        grid: this.current.grid,
        depth,
        maximizingPlayer: false,
        alpha: Number.NEGATIVE_INFINITY,
        beta: Number.POSITIVE_INFINITY,
        sum
      });
      if (!result.bestMove) return;
      const { origin, target } = result.bestMove;
      return { origin, target };
    }
    minimax({
      grid,
      depth,
      maximizingPlayer,
      alpha,
      beta,
      sum
    }) {
      if (depth === 0) {
        const returnValue = { bestMove: null, value: sum };
        sum = 0;
        return returnValue;
      }
      const currentTeam = this.getCurrentTeam();
      const pieces = Board.getPieces({ grid, team: currentTeam });
      const availableMoves = pieces.flatMap(({ point }) => {
        return this.getMoves({
          point,
          grid
        });
      });
      let bestMove = null;
      let maxValue = Number.NEGATIVE_INFINITY;
      let minValue = Number.POSITIVE_INFINITY;
      for (let i = 0; i < availableMoves.length; i++) {
        const move = availableMoves[i];
        const { origin, target } = move;
        this.move({ origin, target, simulate: true });
        const newSum = evaluateBoardPositions({
          sum,
          move,
          team: currentTeam
        });
        const { value: childValue } = this.minimax({
          grid: this.current.grid,
          depth: depth - 1,
          maximizingPlayer: !maximizingPlayer,
          alpha,
          beta,
          sum: newSum
        });
        this.undoTurn();
        if (maximizingPlayer) {
          if (childValue > maxValue) {
            maxValue = childValue;
            bestMove = availableMoves[i];
          }
          if (childValue > alpha) {
            alpha = childValue;
          }
        } else {
          if (childValue < minValue) {
            minValue = childValue;
            bestMove = availableMoves[i];
          }
          if (childValue < beta) {
            beta = childValue;
          }
        }
        if (alpha >= beta) {
          break;
        }
      }
      if (maximizingPlayer) {
        return {
          bestMove,
          value: maxValue
        };
      } else {
        return {
          bestMove,
          value: minValue
        };
      }
    }
    checkForCastling({
      kingPoint,
      team,
      grid,
      turnHistory
    }) {
      const moves = [];
      const playersRooks = Board.getPieces({ grid }).filter(({ piece }) => {
        return piece?.type === "Rook" /* R */ && piece?.team === team;
      });
      if (!playersRooks.length) return moves;
      playersRooks.forEach(({ point: rookPoint }) => {
        const isRookInInitalPosition = rookInitialPoints.teams.find((teamData) => teamData.name === team)?.startingPoints.some(
          (initialPoint) => doPointsMatch(initialPoint, rookPoint)
        );
        if (!isRookInInitalPosition) return moves;
        const hasRookMoved = turnHistory.some(
          (turn) => doPointsMatch(turn.origin, rookPoint)
        );
        if (!hasRookMoved) {
          const resolve = this.isCastlingValid({
            kingPoint,
            rookPoint,
            team,
            grid
          });
          if (resolve) {
            moves.push({
              origin: kingPoint,
              target: rookPoint,
              type: "castle",
              movingPiece: "King" /* K */
            });
          }
        }
      });
      return moves;
    }
    isCastlingValid({
      kingPoint,
      rookPoint,
      team,
      grid
    }) {
      const squaresToCheckForPiecesObstruction = [];
      const squaresToCheckEnemyThreat = [kingPoint];
      const [kingX, kingY] = kingPoint;
      const [rookX] = rookPoint;
      const spaceBetween = kingX - rookX;
      const maxKingDistance = 2;
      const direction = spaceBetween < 0 ? 1 : -1;
      const distance = spaceBetween < 0 ? spaceBetween * -1 - 1 : spaceBetween - 1;
      for (let i = 1; i <= distance; i++) {
        const distanceToMove = direction * i;
        squaresToCheckForPiecesObstruction.push([kingX + distanceToMove, kingY]);
        if (i <= maxKingDistance) {
          squaresToCheckEnemyThreat.push([kingX + distanceToMove, kingY]);
        }
      }
      const piecesInBetween = squaresToCheckForPiecesObstruction.filter(
        (point) => {
          return Board.getPiece({ grid, point }) !== void 0;
        }
      );
      if (piecesInBetween.length) return false;
      const opponentsPieces = Board.getPieces({ grid }).filter(({ piece }) => {
        return piece && piece.team !== team;
      });
      const opponentsAvailableMoves = opponentsPieces.map(
        ({ point }) => this.getMoves({
          point,
          grid,
          skipCastling: true
        })
      ).flat();
      const squaresUnderEnemyThreat = [];
      for (let i = 0; i < squaresToCheckEnemyThreat.length; i++) {
        const square = squaresToCheckEnemyThreat[i];
        for (let k = 0; k < opponentsAvailableMoves.length; k++) {
          const availableMove = opponentsAvailableMoves[k];
          const doesMoveMatchSquare = doPointsMatch(availableMove.origin, square);
          doesMoveMatchSquare ? squaresUnderEnemyThreat.push(doesMoveMatchSquare) : null;
        }
      }
      if (squaresUnderEnemyThreat.length) return false;
      return true;
    }
  };
  
var game_default = Game;
(function() {
  if (typeof Game !== 'undefined') {
    self.Game = Game;
  }
})();

})();
