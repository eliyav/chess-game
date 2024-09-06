import { LobbySettings } from "../../shared/lobby";
import Game from "./game-logic/game";

export class Match {
  game: Game;
  current: {
    key: string | null;
    mode: string;
    players: string[] | undefined;
    turn: number;
    player: string;
    isActive: boolean;
  };
  lobby: LobbySettings;
  player: string;

  constructor({ lobby, player }: { lobby: LobbySettings; player: string }) {
    this.lobby = lobby;
    this.player = player;
    this.current = this.setMatch({ lobby, player });
    this.game = new Game();
    // this.timer = new Timer(time, this.matchDetails.player);
  }

  setMatch({ lobby, player }: { lobby: LobbySettings; player: string }) {
    const matchDefaults = {
      key: lobby.key,
      mode: lobby.mode,
      players: lobby.players,
      turn: 1,
      player,
      isActive: false,
    };
    return matchDefaults;
  }

  nextTurn() {
    if (this.game.isCheckmate()) return false;
    this.current.turn++;
    this.game.setCurrentTeam(this.current.turn);
    return true;
  }

  isPlayersTurn() {
    if (this.current.players) {
      const currentPlayer =
        this.current.turn % 2
          ? this.current.players[0]
          : this.current.players[1];
      return currentPlayer === this.current.player;
    } else {
      return true;
    }
  }

  resetMatch() {
    this.current = this.setMatch({ lobby: this.lobby, player: this.player });
    this.game.resetGame();
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
        this.game.setCurrentTeam(this.current.turn);
      }
      return true;
    }
    return false;
  }

  getWinningTeam() {
    const currentPlayer =
      this.current.turn % 2 ? this.current.player[0] : this.current.player[1];
    return currentPlayer;
  }
}
