import { TurnHistory } from "../helper/game-helpers";
import { Timer } from "../timer/timer";
import Game from "./game-logic/game";

//Refactor
//End Match might need to be in constructor
export class Match {
  game: Game;
  matchDetails: {
    current: { player: { id: string }; moves: Point[] };
    teams: string[];
    turn: number;
  };
  isActive: boolean;
  timer: Timer;

  constructor(time = 0) {
    this.isActive = false;
    this.matchDetails = this.setMatch();
    this.game = new Game(this.matchDetails.current.player);
    //Refactor timer
    this.timer = new Timer(
      time,
      this.matchDetails.current.player,
      this.endMatch.bind(this)
    );
  }

  setMatch() {
    const matchDefaults = {
      current: { player: { id: "White" }, moves: [] },
      teams: ["White", "Black"],
      turn: 1,
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
    this.matchDetails.current.player.id = player;
  }

  resetMatch() {
    this.isActive = false;
    this.matchDetails = this.setMatch();
    this.game.resetGame(this.matchDetails.current.player);
    this.timer.resetTimers();
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
    this.matchDetails.current.moves = [];
  }

  //Have end match func be an input
  endMatch() {
    this.isActive = false;
    // const winningTeam =
    //   offlineMatch.current?.game.state.currentPlayer ===
    //   offlineMatch.current?.game.teams[0]
    //     ? offlineMatch.current?.game.teams[1]
    //     : offlineMatch.current?.game.teams[0];
    // offlineEmitter.current?.emit("end-match", winningTeam);
  }
}
