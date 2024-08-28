import Game from "./game-logic/game";

export class Match {
  game: Game;
  current: {
    teams: string[];
    turn: number;
    player: { id: string };
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
      isActive: false,
    };
    return matchDefaults;
  }

  nextTurn() {
    this.current.turn++;
    this.switchPlayer();
    if (this.game.isCheckmate()) return false;
    return true;
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

  takeTurn(originPoint: Point, targetPoint: Point) {
    return this.game.resolveMove(originPoint, targetPoint);
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

  getWinningTeam() {
    const team =
      this.current.player.id === this.current.teams[0]
        ? this.current.teams[1]
        : this.current.teams[0];
    return team;
  }
}
