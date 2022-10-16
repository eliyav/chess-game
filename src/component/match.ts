import Game from "./game-logic/game";

class Match {
  game: Game;
  currentMatch: {
    current: { player: string };
    teams: string[];
    moves: never[];
    turn: number;
  };
  matchStarted: boolean;
  constructor() {
    this.matchStarted = false;
    this.game = new Game();
    this.currentMatch = this.setMatch();
  }

  setMatch() {
    const matchDefaults = {
      current: { player: "White" },
      teams: ["White", "Black"],
      moves: [],
      turn: 1,
    };
    return matchDefaults;
  }

  nextTurn() {
    this.currentMatch.turn++;
    this.currentMatch.current.player = this.switchPlayer();
    return this.game.isCheckmate() ? this.endMatch() : null;
  }

  switchPlayer() {
    return this.currentMatch.turn % 2
      ? this.currentMatch.teams[0]
      : this.currentMatch.teams[1];
  }

  resetMatch() {
    this.matchStarted = false;
    this.game.resetGame();
    this.currentMatch = {};
  }

  endMatch() {
    const winningTeam =
      offlineMatch.current?.game.state.currentPlayer ===
      offlineMatch.current?.game.teams[0]
        ? offlineMatch.current?.game.teams[1]
        : offlineMatch.current?.game.teams[0];
    offlineEmitter.current?.emit("end-match", winningTeam);
  }

  undoTurn() {
    const lastTurn = this.turnHistory.at(-1);
    if (lastTurn !== undefined) {
      lastTurn.originPiece!.moveCounter === 1
        ? (lastTurn.originPiece!.moved = false)
        : null;
      lastTurn.originPiece!.moveCounter--;
      lastTurn.castling
        ? lastTurn.castling.forEach((square) => (square.on = undefined))
        : null;
      lastTurn.originSquare.on = lastTurn.originPiece;
      lastTurn.originPiece!.point = lastTurn.origin;
      lastTurn.targetSquare.on = lastTurn.targetPiece;
      this.turnHistory.length = this.turnHistory.length - 1;
      this.annotations.length = this.annotations.length - 1;
      this.turnCounter--;
      this.changePlayer();
    }
  }
}
