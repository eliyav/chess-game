import { Piece, Point } from "../../shared/game";
import { TEAM } from "../../shared/match";

type Data = {
  boardSize: number;
  columnNames: string[];
  initialPositions: InitialPositions[];
};

type InitialPositions = {
  type: Piece;
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

export const chessData: Data = {
  boardSize: 8,
  columnNames: ["a", "b", "c", "d", "e", "f", "g", "h"],
  initialPositions: [
    {
      type: Piece.P,
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
      type: Piece.R,
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
      type: Piece.B,
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
      type: Piece.N,
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
      type: Piece.K,
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
      type: Piece.Q,
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
