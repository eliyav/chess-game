import { TurnHistory } from "../helper/game-helpers";
import { Timer } from "./match-logic/timer";
import Game from "./game-logic/game";

export class Match {
  game: Game;
  matchDetails: {
    teams: string[];
    turn: number;
    player: { id: string };
    moves: Point[];
  };
  isActive: boolean;
  timer: Timer;
  endMatch: () => void;

  constructor(time = 0, endMatch: () => void) {
    this.isActive = false;
    this.matchDetails = this.setMatch();
    this.game = new Game(this.matchDetails.player);
    this.endMatch = endMatch;
    //Refactor timer
    this.timer = new Timer(
      time,
      this.matchDetails.player,
      this.endMatch.bind(this)
    );
  }

  setMatch() {
    const matchDefaults = {
      teams: ["White", "Black"],
      turn: 1,
      player: { id: "White" },
      moves: [],
    };
    return matchDefaults;
  }

  nextTurn() {
    this.matchDetails.turn++;
    this.switchPlayer();
    if (this.game.isCheckmate()) return this.endMatch();
  }

  switchPlayer() {
    const player =
      this.matchDetails.turn % 2
        ? this.matchDetails.teams[0]
        : this.matchDetails.teams[1];
    this.matchDetails.player.id = player;
  }

  resetMatch() {
    this.matchDetails = this.setMatch();
    this.game.resetGame(this.matchDetails.player);
    this.timer.resetTimers(this.matchDetails.player);
  }

  startMatch() {
    this.isActive = true;
    this.timer.startTimer();
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
        this.matchDetails.turn--;
        this.switchPlayer();
      }
      return true;
    }
    return false;
  }

  resetMoves() {
    this.matchDetails.moves = [];
  }
}
