import { Teams } from "../../../shared/match";
import Game from "../game-logic/game";

interface MatchLogic {
  isPlayersTurn(): boolean;
  getPlayerTeam(): Teams;
  shouldCameraRotate(): boolean;
}

export class BaseMatch implements MatchLogic {
  game: Game;

  constructor() {
    this.game = new Game();
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
    return this.game.isCheckmate();
  }

  //   getWinner() {
  //     return this.game.;
  //   }

  //   getGameStatus() {
  //     return this.game.getGameStatus();
  //   }

  //   getGameHistory() {
  //     return this.game.getGameHistory();
  //   }

  isPlayersTurn() {
    return true;
  }

  getPlayerTeam() {
    return this.game.getCurrentPlayer();
  }

  shouldCameraRotate() {
    return true;
  }
}
