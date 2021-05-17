const chessData = {
  boardSize: 8,
  columnNames: [["A"], ["B"], ["C"], ["D"], ["E"], ["F"], ["G"], ["H"]],
  teams: ["white", "black"],
  pieces: ["Pawn", "Rook", "Bishop", "Knight", "King", "Queen"],
  movement: [1, 2, 3, 4, 5, 6, 7],
  initialState: {
    currentPlayer: "white",
  },
  pieceInitialPoints: [
    [
      {
        name: "Pawn",
        color: "white",
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
        color: "white",
        points: [
          [0, 0],
          [7, 0],
        ],
      },
      {
        name: "Bishop",
        color: "white",
        points: [
          [2, 0],
          [5, 0],
        ],
      },
      {
        name: "Knight",
        color: "white",
        points: [
          [1, 0],
          [6, 0],
        ],
      },
      {
        name: "King",
        color: "white",
        points: [[4, 0]],
      },
      {
        name: "Queen",
        color: "white",
        points: [[3, 0]],
      },
    ],
    [
      {
        name: "Pawn",
        color: "black",
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
        color: "black",
        points: [
          [0, 7],
          [7, 7],
        ],
      },
      {
        name: "Bishop",
        color: "black",
        points: [
          [2, 7],
          [5, 7],
        ],
      },
      {
        name: "Knight",
        color: "black",
        points: [
          [1, 7],
          [6, 7],
        ],
      },
      {
        name: "King",
        color: "black",
        points: [[4, 7]],
      },
      {
        name: "Queen",
        color: "black",
        points: [[3, 7]],
      },
    ],
  ],
};

export default chessData;
