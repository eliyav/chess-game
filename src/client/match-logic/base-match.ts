import { GAMESTATUS, Point, Turn } from "../../shared/game";
import { Lobby } from "../../shared/lobby";
import { MATCH_TYPE, Player, TEAM } from "../../shared/match";
import Game from "../game-logic/game";
import { Controller } from "./controller";
import { MatchTimer } from "./match-timer";

export interface MatchLogic {
  isPlayersTurn(): boolean;
  getCurrentTeam(): TEAM | undefined;
  isCurrentPlayersPiece(point: Point): boolean;
  resetRequest(): boolean;
  undoTurnRequest(): boolean;
  subscribe({ controller }: { controller: Controller }): void;
}

export class BaseMatch {
  private game: Game;
  lobby: Lobby;
  player: Player;
  timer: MatchTimer | undefined;

  constructor({
    lobby,
    player,
    onTimeUpdate,
    onTimeEnd,
  }: {
    lobby: Lobby;
    player: Player;
    onTimeUpdate: (timers: { [key in TEAM]: number }) => void;
    onTimeEnd: (player: TEAM) => void;
  }) {
    this.game = new Game();
    this.lobby = lobby;
    this.player = player;
    if (lobby.time) {
      this.timer = new MatchTimer({
        time: lobby.time,
        initialPlayer: TEAM.WHITE,
        onTimeUpdate,
        onTimeEnd,
      });
    }
  }

  start() {
    this.game.current.status = GAMESTATUS.INPROGRESS;
    this.timer?.start();
  }

  async move({ from, to }: { from: Point; to: Point }): Promise<{
    turn: Turn | undefined;
    callback?: () => void;
  }> {
    return {
      turn: await this.getGame().move({
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
    if (currentPlayer?.type === "computer") return false;
    if (this.lobby.mode === MATCH_TYPE.ONLINE) {
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
    if (this.timer) this.timer.reset();
  }

  cleanup() {
    if (this.timer) this.timer.stop();
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
    return this.game.getState().status !== GAMESTATUS.INPROGRESS;
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

  endMatch(reason: "time" | "checkmate" | "resign") {
    if (this.timer) this.timer.stop();
    if (reason === "time") {
      this.game.current.status = GAMESTATUS.TIMER;
    } else if (reason === "checkmate") {
      this.game.current.status = GAMESTATUS.CHECKMATE;
    } else if (reason === "resign") {
      this.game.current.status = GAMESTATUS.CHECKMATE;
    }
  }

  state(): Lobby {
    const lobby = this.lobby;
    return {
      ...lobby,
      currentTeam: this.getCurrentTeam(),
      timers: this.timer?.getTimers(),
    };
  }
}
