import { resolveMove, isCheckmate, annotate } from "./helper/game-helpers";
import { setPieces, createGrid } from "./helper/board-helpers";
import Board from "./component/board";
import {Data, State} from "./data/chess-data-import"
import { TurnHistory } from "./helper/game-helpers";
import { Console } from "console";

class Game {
  state: State;
  teams: string[];
  turnCounter: number;
  board;
  moves: Point[];
  annotations: string[];
  turnHistory: TurnHistory[];
  player: undefined;

  constructor(chessData: Data) {
    this.state = chessData.initialState;
    this.teams = chessData.teams;
    this.board = new Board(chessData);
    this.moves = [];
    this.annotations = [];
    this.turnHistory = [];
    this.turnCounter = 1;
    this.player;
    this.setBoard();
  }

  playerMove(originPoint: Point, targetPoint: Point) : boolean {
    const lastTurn = this.turnHistory[this.turnHistory.length - 1];
    const resolve = resolveMove(originPoint, targetPoint, this.state, this.board.grid, lastTurn);
    if(typeof resolve !== "boolean"){
      resolve.result
      ? (() => {
          resolve.turn = this.turnCounter;
          const annotation = annotate(resolve, this.state, this.board.grid, lastTurn);
          this.annotations.push(annotation);
          this.turnHistory.push(resolve);
        })()
      : null;
    return resolve.result;
    }
    return false
  }

  changePlayer() {
    this.state.currentPlayer = this.state.currentPlayer === this.teams[0] ? this.teams[1] : this.teams[0];
    console.log(`${this.state.currentPlayer} team's turn!`);
  }

  switchTurn(state = this.state, grid = this.board.grid) {
    const lastTurn = this.turnHistory[this.turnHistory.length - 1];
    this.turnCounter++;
    this.changePlayer();
    isCheckmate(state, grid, lastTurn) ? this.endGame() : null;
  }

  undoTurn() {
    const lastTurn = this.turnHistory.at(-1);
    if(lastTurn !== undefined){
      lastTurn.originPiece!.moveCounter === 1 ? lastTurn.originPiece!.moved = false : null;
      lastTurn.originPiece!.moveCounter--;
      lastTurn.castling? lastTurn.castling.forEach(square => square.on = undefined) : null;
      lastTurn.originSquare.on = lastTurn.originPiece;
      lastTurn.originPiece!.point = lastTurn.origin
      lastTurn.targetSquare.on = lastTurn.targetPiece;
      this.turnHistory.length = this.turnHistory.length - 1;
      this.annotations.length = this.annotations.length -1;
      this.turnCounter--;
      this.changePlayer();
      }
  }

  endGame() {
    const winningTeam = this.state.currentPlayer === this.teams[0] ? this.teams[1] : this.teams[0];
    alert(`Game is over, ${winningTeam} player wins!`);
  }

  setBoard() {
    setPieces(this.board.grid, this.board.pieceInitialPoints, this.board.movementArray);
  }

  resetBoard() {
    this.board.grid = createGrid(this.board.boardSize, this.board.columnNames);
    this.setBoard();
    this.state.currentPlayer = this.teams[0];
    this.annotations = [];
    this.turnHistory = [];
    this.turnCounter = 1;
    return console.log("Board Has Been Reset!");
  }
}

export default Game;
