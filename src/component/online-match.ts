import chessData from "./game-logic/chess-data-import";
import Game from "./game-logic/game";

class OnlineMatch {
  game: Game;

  constructor() {
    this.game = new Game(chessData, this.endMatch.bind(this));
  }

  resetMatch() {
    this.game.resetGame();
  }

  endMatch() {
    const winningTeam =
      this.game.state.currentPlayer === this.game.teams[0]
        ? this.game.teams[1]
        : this.game.teams[0];
    return true;
  }
}

export default OnlineMatch;

export type OnlineMatchSettings = {
  mode: string | undefined;
  time: number | undefined;
};
