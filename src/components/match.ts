import { TurnHistory } from "../helper/game-helpers";
import { Timer } from "./match-logic/timer";
import Game from "./game-logic/game";

export class Match {
  game: Game;
  current: {
    teams: string[];
    turn: number;
    player: { id: string };
    moves: Point[];
    isActive: boolean;
  };

  constructor() {
    this.current = this.setMatch();
    this.game = new Game(this.current.player);
    // this.timer = new Timer(time, this.matchDetails.player);
  }

  setMatch() {
    const matchDefaults = {
      teams: ["White", "Black"],
      turn: 1,
      player: { id: "White" },
      moves: [],
      isActive: false,
    };
    return matchDefaults;
  }

  nextTurn() {
    this.current.turn++;
    this.switchPlayer();
    if (this.game.isCheckmate()) return; //On end match return true/false
  }

  switchPlayer() {
    const player =
      this.current.turn % 2 ? this.current.teams[0] : this.current.teams[1];
    this.current.player.id = player;
  }

  resetMatch() {
    this.current = this.setMatch();
    this.game.resetGame(this.current.player);
    // this.timer.resetTimers(this.data.player);
  }

  startMatch() {
    this.current.isActive = true;
    // this.timer.startTimer();
  }

  takeTurn(originPoint: Point, targetPoint: Point): TurnHistory | boolean {
    const resolve = this.game.resolveMove(originPoint, targetPoint);
    if (resolve) {
      this.nextTurn();
      return resolve;
    }
    return false;
  }

  undoTurn() {
    const lastTurn = this.game.turnHistory.at(-1);
    if (lastTurn !== undefined) {
      if (lastTurn.originPiece) {
        lastTurn.originPiece.resetPieceMovement();
        if (lastTurn.castling)
          lastTurn.castling.forEach((square) => (square.on = undefined));

        lastTurn.originSquare.on = lastTurn.originPiece;
        lastTurn.originPiece.point = lastTurn.origin;
        lastTurn.targetSquare.on = lastTurn.targetPiece;
        this.game.turnHistory.length = this.game.turnHistory.length - 1;
        this.game.annotations.length = this.game.annotations.length - 1;
        this.current.turn--;
        this.switchPlayer();
      }
      return true;
    }
    return false;
  }

  resetMoves() {
    this.current.moves = [];
  }
}
