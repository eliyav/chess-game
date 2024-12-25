import { GAMESTATUS, Point, Turn } from "../../shared/game";
import { Lobby, Player, TEAM } from "../../shared/match";
import Game from "../game-logic/game";

export interface MatchLogic {
  isPlayersTurn(): boolean;
  getPlayerTeam(): TEAM | undefined;
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
