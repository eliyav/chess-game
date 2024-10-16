import { PIECE, Point } from "../../shared/game";
import { TEAM } from "../../shared/match";

type Data = {
  boardSize: number;
  columnNames: string[];
  initialPositions: InitialPositions[];
  boardPoints: Point[];
};

type InitialPositions = {
  type: PIECE;
  teams: [
    {
      name: TEAM.WHITE;
      startingPoints: Point[];
    },
    {
      name: TEAM.BLACK;
      startingPoints: Point[];
    }
  ];
};

const boardPoints: Point[] = [];
for (let x = 0; x < 8; x++) {
  for (let z = 0; z < 8; z++) {
    boardPoints.push([x, z]);
  }
}

export const chessData: Data = {
  boardSize: 8,
  columnNames: ["a", "b", "c", "d", "e", "f", "g", "h"],
  boardPoints,
  initialPositions: [
    {
      type: PIECE.P,
      teams: [
        {
          name: TEAM.WHITE,
          startingPoints: [
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
          name: TEAM.BLACK,
          startingPoints: [
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
      ],
    },
    {
      type: PIECE.R,
      teams: [
        {
          name: TEAM.WHITE,
          startingPoints: [
            [0, 0],
            [7, 0],
          ],
        },
        {
          name: TEAM.BLACK,
          startingPoints: [
            [0, 7],
            [7, 7],
          ],
        },
      ],
    },
    {
      type: PIECE.B,
      teams: [
        {
          name: TEAM.WHITE,
          startingPoints: [
            [2, 0],
            [5, 0],
          ],
        },
        {
          name: TEAM.BLACK,
          startingPoints: [
            [2, 7],
            [5, 7],
          ],
        },
      ],
    },
    {
      type: PIECE.N,
      teams: [
        {
          name: TEAM.WHITE,
          startingPoints: [
            [1, 0],
            [6, 0],
          ],
        },
        {
          name: TEAM.BLACK,
          startingPoints: [
            [1, 7],
            [6, 7],
          ],
        },
      ],
    },
    {
      type: PIECE.K,
      teams: [
        {
          name: TEAM.WHITE,
          startingPoints: [[4, 0]],
        },
        {
          name: TEAM.BLACK,
          startingPoints: [[4, 7]],
        },
      ],
    },
    {
      type: PIECE.Q,
      teams: [
        {
          name: TEAM.WHITE,
          startingPoints: [[3, 0]],
        },
        {
          name: TEAM.BLACK,
          startingPoints: [[3, 7]],
        },
      ],
    },
  ],
};

export default chessData;
