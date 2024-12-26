import { GAMESTATUS, Point, Turn } from "../../shared/game";
import { Lobby, LOBBY_TYPE, Player, TEAM } from "../../shared/match";
import Game from "../game-logic/game";

export interface MatchLogic {
  isPlayersTurn(): boolean;
  getCurrentTeam(): TEAM | undefined;
  isCurrentPlayersPiece(point: Point): boolean;
  resetRequest(): boolean;
  undoTurnRequest(): boolean;
}

export class BaseMatch {
  private game: Game;
  lobby: Lobby;
  player: Player;

  constructor({ lobby, player }: { lobby: Lobby; player: Player }) {
    this.game = new Game();
    this.lobby = lobby;
    this.player = player;
  }

  move({ from, to }: { from: Point; to: Point }): {
    turn: Turn | undefined;
    callback?: () => void;
  } {
    return {
      turn: this.getGame().move({
        from: from,
        to: to,
      }),
    };
  }

  getMoves(point: Point) {
    return this.game.getMoves({ point });
  }

  getCurrentTeam() {
    return this.game.getCurrentTeam();
  }

  isPlayersTurn() {
    const currentTeam = this.getCurrentTeam();
    if (!currentTeam) return false;
    const currentPlayer = this.lobby.players.find(
      (player) => player.team === currentTeam
    );
    if (currentPlayer?.type === "Computer") return false;
    if (this.lobby.mode === LOBBY_TYPE.ONLINE) {
      return currentPlayer?.team === this.player.team;
    } else {
      return true;
    }
  }

  isCurrentPlayersPiece(point: Point) {
    const piece = this.game.lookupPiece({ point });
    if (!piece) return false;
    return piece.team === this.getCurrentTeam();
  }

  reset() {
    this.game.resetGame();
  }

  saveGame() {
    //Save game state to database
  }

  loadGame() {
    //Load game state from database
  }

  getGame() {
    return this.game;
  }

  isGameOver() {
    return this.game.getGameState().status !== GAMESTATUS.INPROGRESS;
  }

  getWinner() {
    return this.game.getCurrentTeamsOpponent();
  }

  getGameHistory() {
    return this.game.getHistory();
  }

  getAllGamePieces() {
    return this.game.getAllPieces();
  }

  undoTurn() {
    return this.game.undoTurn();
  }

  lookupGamePiece(point: Point) {
    return this.game.lookupPiece({ point });
  }
}
