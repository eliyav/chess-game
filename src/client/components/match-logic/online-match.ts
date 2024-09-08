import { Socket } from "socket.io-client";
import { LOBBY, LobbySettings, Player } from "../../../shared/match";
import { BaseMatch, MatchLogic } from "./base-match";
import { Point } from "../../helper/movement-helpers";
import GamePiece from "../game-logic/game-piece";
import { Controller } from "./controller";
import { SetStateAction } from "react";
import { Message } from "../modals/message-modal";

export class OnlineMatch extends BaseMatch implements MatchLogic {
  mode: LOBBY.ONLINE;
  socket: Socket;

  constructor({
    lobby,
    player,
    socket,
  }: {
    lobby: LobbySettings;
    player: Player;
    socket: Socket;
  }) {
    super({ lobby, player });
    this.mode = LOBBY.ONLINE;
    this.socket = socket;
  }

  resolveMove({
    originPoint,
    targetPoint,
  }: {
    originPoint: Point;
    targetPoint: Point;
  }) {
    return this.getGame().resolveMove(originPoint, targetPoint);
  }

  isValidMove({
    pickedPiece,
    selectedPiece,
  }: {
    pickedPiece: GamePiece;
    selectedPiece: GamePiece;
  }) {
    const isCurrentPlayersPiece = this.isCurrentPlayersPiece(pickedPiece);
    return this.getGame().isValidMove(
      selectedPiece,
      pickedPiece.point,
      isCurrentPlayersPiece
    );
  }

  resetRequest() {
    this.socket.emit("reset-match-request", { key: this.lobby.key });
    return false;
  }

  isPlayersTurn() {
    const currentPlayer = this.getGame().getCurrentPlayer();
    return currentPlayer === this.player.team;
  }

  getPlayerTeam() {
    return this.player.team;
  }

  isCurrentPlayersPiece(piece: GamePiece) {
    return piece.color === this.getPlayerTeam();
  }

  nextTurn() {
    return this.getGame().nextTurn();
  }

  undoTurn() {
    return this.getGame().undoTurn();
  }

  setPromotion(selection: string) {
    this.getGame().setPromotionPiece(selection);
  }

  subscribeMatchEvents({
    controller,
    setMessage,
  }: {
    controller: Controller;
    setMessage: (value: React.SetStateAction<Message | null>) => void;
  }) {
    this.socket.on("reset-match-requested", () => {
      setMessage({
        question: "Opponent requested a match reset. Do you accept?",
        onConfirm: () => {
          this.socket.emit("reset-match-response", {
            answer: true,
            key: this.lobby.key,
          });
          setMessage(null);
        },
        onReject: () => {
          this.socket.emit("reset-match-response", {
            answer: false,
            key: this.lobby.key,
          });
          setMessage(null);
        },
      });
    });

    this.socket.on("reset-match-resolve", ({ answer }) => {
      if (answer) {
        controller.match.reset();
        controller.resetView();

        setMessage({
          question: "Match reset successfully!",
          onConfirm: () => setMessage(null),
        });
      }
    });
  }

  unsubscribeMatchEvents() {
    this.socket.off("reset-match-requested");
    this.socket.off("reset-match-resolve");
  }
}
