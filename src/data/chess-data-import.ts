import { PieceInitialPoints } from "../component/board"

type State = {
  currentPlayer: string,
}

interface Data {
  boardSize: number;
  columnNames: string[][];
  teams: string[];
  pieces: string[];
  movement: number[];
  initialState: State;
  pieceInitialPoints: PieceInitialPoints[][];
  gridInitialPoints: PieceInitialPoints[][];
}

const chessData: Data = {
  boardSize: 8,
  columnNames: [["a"], ["b"], ["c"], ["d"], ["e"], ["f"], ["g"], ["h"]],
  teams: ["White", "Black"],
  pieces: ["Pawn", "Rook", "Bishop", "Knight", "King", "Queen"],
  movement: [1, 2, 3, 4, 5, 6, 7],
  initialState: {
    currentPlayer: "White",
  },
  pieceInitialPoints: [
    [
      {
        name: "Pawn",
        color: "White",
        points: [
          [0, 1],
          [1, 1],
          [2, 1],
          [3, 1],
          [4, 1],
          [5, 1],
          [6, 1],
          [7, 1],
        ],
      },
      {
        name: "Rook",
        color: "White",
        points: [
          [0, 0],
          [7, 0],
        ],
      },
      {
        name: "Bishop",
        color: "White",
        points: [
          [2, 0],
          [5, 0],
        ],
      },
      {
        name: "Knight",
        color: "White",
        points: [
          [1, 0],
          [6, 0],
        ],
      },
      {
        name: "King",
        color: "White",
        points: [[4, 0]],
      },
      {
        name: "Queen",
        color: "White",
        points: [[3, 0]],
      },
    ],
    [
      {
        name: "Pawn",
        color: "Black",
        points: [
          [0, 6],
          [1, 6],
          [2, 6],
          [3, 6],
          [4, 6],
          [5, 6],
          [6, 6],
          [7, 6],
        ],
      },
      {
        name: "Rook",
        color: "Black",
        points: [
          [0, 7],
          [7, 7],
        ],
      },
      {
        name: "Bishop",
        color: "Black",
        points: [
          [2, 7],
          [5, 7],
        ],
      },
      {
        name: "Knight",
        color: "Black",
        points: [
          [1, 7],
          [6, 7],
        ],
      },
      {
        name: "King",
        color: "Black",
        points: [[4, 7]],
      },
      {
        name: "Queen",
        color: "Black",
        points: [[3, 7]],
      },
    ],
  ],
  gridInitialPoints: [
    [
      {
        name: "Pawn",
        color: "White",
        points: [
          [7.5, 10.5],
          [7.5, 7.5],
          [7.5, 4.5],
          [7.5, 1.5],
          [7.5, -1.5],
          [7.5, -4.5],
          [7.5, -7.5],
          [7.5, -10.5],
        ],
      },
      {
        name: "Rook",
        color: "White",
        points: [
          [10.5, 10.5],
          [10.5, -10.5],
        ],
      },
      {
        name: "Bishop",
        color: "White",
        points: [
          [10.5, 4.5],
          [10.5, -4.5],
        ],
      },
      {
        name: "Knight",
        color: "White",
        points: [
          [10.5, 7.5],
          [10.5, -7.5],
        ],
      },
      {
        name: "King",
        color: "White",
        points: [[10.5, -1.5]],
      },
      {
        name: "Queen",
        color: "White",
        points: [[10.5, 1.5]],
      },
    ],
    [
      {
        name: "Pawn",
        color: "Black",
        points: [
          [-7.5, 10.5],
          [-7.5, 7.5],
          [-7.5, 4.5],
          [-7.5, 1.5],
          [-7.5, -1.5],
          [-7.5, -4.5],
          [-7.5, -7.5],
          [-7.5, -10.5],
        ],
      },
      {
        name: "Rook",
        color: "Black",
        points: [
          [-10.5, 10.5],
          [-10.5, -10.5],
        ],
      },
      {
        name: "Bishop",
        color: "Black",
        points: [
          [-10.5, 4.5],
          [-10.5, -4.5],
        ],
      },
      {
        name: "Knight",
        color: "Black",
        points: [
          [-10.5, 7.5],
          [-10.5, -7.5],
        ],
      },
      {
        name: "King",
        color: "Black",
        points: [[-10.5, -1.5]],
      },
      {
        name: "Queen",
        color: "Black",
        points: [[-10.5, 1.5]],
      },
    ],
  ],
};

export default chessData;
