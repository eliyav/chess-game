import { GAMESTATUS, Move, PIECE, Point, TurnHistory } from "../../shared/game";
import GamePiece from "./game-piece";
import { TEAM } from "../../shared/match";
import { Board, Grid } from "./board";
import { doPointsMatch, getPieceMoves, isEnPassantAvailable } from "./moves";
import { evaluateBoardPositions } from "./ai-opponent";

class Game {
  teams: TEAM[];
  current: {
    grid: Grid;
    annotations: string[];
    turnHistory: TurnHistory[];
    status: GAMESTATUS;
  };

  constructor() {
    this.teams = [TEAM.WHITE, TEAM.BLACK];
    this.current = this.createGame();
  }

  private createGame() {
    return {
      grid: Board.createGrid(),
      annotations: [],
      turnHistory: [],
      status: GAMESTATUS.INPROGRESS,
    };
  }

  public getCurrentTeam() {
    const remainder = this.getTurn() % 2;
    const index = remainder ? 0 : 1;
    return this.teams[index];
  }

  public getCurrentTeamsOpponent() {
    const remainder = this.getTurn() % 2;
    const index = remainder ? 1 : 0;
    return this.teams[index];
  }

  public getGameState() {
    return this.current;
  }

  private nextTurn() {
    if (this.isCheckmate({ grid: this.current.grid })) {
      this.current.status = GAMESTATUS.CHECKMATE;
    }
  }

  public getTurn() {
    return this.current.turnHistory.length + 1;
  }

  public move({
    origin,
    target,
    grid = this.current.grid,
  }: {
    origin: Point;
    target: Point;
    grid?: Grid;
  }) {
    if (this.current.status === GAMESTATUS.CHECKMATE) return;
    const move = this.findMove({ grid, origin, target });
    if (!move) return;
    const resolved = this.resolveBoard({
      origin,
      move,
      grid,
    });
    if (!resolved) return;
    this.annotate(resolved);
    this.nextTurn();
    return resolved;
  }

  private resolveBoard({
    origin,
    move,
    grid,
    dontUpdatePiece = false,
  }: {
    origin: Point;
    move: Move;
    grid: Grid;
    dontUpdatePiece?: boolean;
  }) {
    const [target, moveType] = move;
    const originPiece = Board.getPiece({ grid, point: origin });
    if (!originPiece) return;
    if (!dontUpdatePiece) originPiece.update();
    if (moveType === "movement") {
      return this.resolveMovement({ origin, move, grid });
    } else if (moveType === "capture") {
      return this.resolveCapture({ origin, move, grid });
    } else if (moveType === "enPassant") {
      return this.resolveEnPassant({ origin, move, grid });
    } else if (moveType === "castle") {
      const targetPiece = Board.getPiece({ grid, point: target });
      if (!dontUpdatePiece) targetPiece?.update();
      return this.resolveCastling({ origin, move, grid });
    }
  }

  private resolveMovement({
    origin,
    move,
    grid,
  }: {
    origin: Point;
    move: Move;
    grid: Grid;
  }): TurnHistory | undefined {
    const [target] = move;
    const originPiece = this.lookupPiece({ grid, point: origin });
    if (!originPiece) return;
    Board.addPiece({ grid, point: target, piece: originPiece });
    Board.removePiece({ grid, point: origin });
    const promotion = this.checkPromotion({
      piece: originPiece,
      point: target,
    });
    if (promotion) {
      this.setPromotionPiece({
        target,
        originPiece,
        selection: PIECE.Q,
        grid,
      });
    }
    const isOpponentInCheck =
      this.isChecked({
        team: this.getCurrentTeamsOpponent(),
        grid,
      }) !== undefined;
    return {
      type: "movement",
      origin,
      target,
      promotion,
      isOpponentInCheck,
    };
  }

  private resolveCapture({
    origin,
    move,
    grid,
  }: {
    origin: Point;
    move: Move;
    grid: Grid;
  }): TurnHistory | undefined {
    const [target] = move;
    const originPiece = this.lookupPiece({ grid, point: origin });
    const targetPiece = this.lookupPiece({ grid, point: target });
    if (!originPiece || !targetPiece) return;
    Board.addPiece({ grid, point: target, piece: originPiece });
    Board.removePiece({ grid, point: origin });
    const promotion = this.checkPromotion({
      piece: originPiece,
      point: target,
    });
    if (promotion) {
      this.setPromotionPiece({
        target,
        originPiece,
        selection: PIECE.Q,
        grid,
      });
    }
    const isOpponentInCheck =
      this.isChecked({ team: this.getCurrentTeamsOpponent(), grid }) !==
      undefined;
    return {
      type: "capture",
      origin,
      target,
      promotion,
      isOpponentInCheck,
      capturedPiece: targetPiece,
    };
  }

  private resolveEnPassant({
    origin,
    move,
    grid,
  }: {
    origin: Point;
    move: Move;
    grid: Grid;
  }): TurnHistory | undefined {
    const [target] = move;
    const originPiece = this.lookupPiece({ grid, point: origin });
    if (!originPiece) return;
    const lastTurnHistory = this.current.turnHistory.at(-1);
    if (!lastTurnHistory) return;
    const enPassant = isEnPassantAvailable({
      turnHistory: lastTurnHistory,
      grid,
    });
    if (enPassant) {
      Board.addPiece({ grid, point: target, piece: originPiece });
      Board.removePiece({ grid, point: origin });
      Board.removePiece({ grid, point: enPassant.capturedPiecePoint });
      const isOpponentInCheck =
        this.isChecked({
          team: this.getCurrentTeamsOpponent(),
          grid,
        }) !== undefined;
      return {
        type: "enPassant",
        origin,
        target,
        isOpponentInCheck,
        enPassant,
      };
    }
  }

  private resolveCastling({
    origin,
    move,
    grid,
  }: {
    origin: Point;
    move: Move;
    grid: Grid;
  }): TurnHistory | undefined {
    const [target] = move;
    const originPiece = this.lookupPiece({ grid, point: origin });
    const targetPiece = this.lookupPiece({ grid, point: target });
    if (!originPiece || !targetPiece) return;
    const [originX, OriginY] = origin;
    const [targetX] = target;
    const c = originX - targetX;
    const direction = c < 0 ? 1 : -1;
    const newKingPoint: Point = [originX + direction * 2, OriginY];
    const newRookPoint: Point = [originX + direction, OriginY];
    Board.addPiece({ grid, point: newKingPoint, piece: originPiece });
    Board.addPiece({ grid, point: newRookPoint, piece: targetPiece });
    Board.removePiece({ grid, point: origin });
    Board.removePiece({ grid, point: target });
    const isOpponentInCheck =
      this.isChecked({
        team: this.getCurrentTeamsOpponent(),
        grid,
      }) !== undefined;
    return {
      type: "castle",
      origin,
      target,
      castling: {
        direction,
        kingTarget: newKingPoint,
        rookTarget: newRookPoint,
      },
      isOpponentInCheck,
    };
  }

  public undoTurn(grid = this.current.grid) {
    const lastTurn = this.current.turnHistory.at(-1);
    if (lastTurn) {
      if (lastTurn.type === "movement") {
        const { origin, target } = lastTurn;
        Board.addPiece({
          grid: this.current.grid,
          point: origin,
          piece: Board.getPiece({ grid, point: target })!,
        });
        Board.removePiece({ grid, point: target });
      } else if (lastTurn.type === "capture") {
        const { origin, target, capturedPiece } = lastTurn;
        Board.addPiece({
          grid,
          point: origin,
          piece: Board.getPiece({ grid, point: target })!,
        });
        Board.addPiece({
          grid,
          point: target,
          piece: new GamePiece(capturedPiece),
        });
      } else if (lastTurn.type === "enPassant") {
        const { origin, target, enPassant } = lastTurn;
        Board.addPiece({
          grid,
          point: origin,
          piece: Board.getPiece({ grid, point: target })!,
        });
        Board.addPiece({
          grid,
          point: enPassant.capturedPiecePoint,
          piece: new GamePiece(enPassant.capturedPiece),
        });
        Board.removePiece({ grid, point: enPassant.enPassantPoint });
      } else if (lastTurn.type === "castle") {
        const { origin, target, castling } = lastTurn;
        const { kingTarget, rookTarget } = castling;
        const kingPiece = Board.getPiece({ grid, point: kingTarget })!;
        const rookPiece = Board.getPiece({ grid, point: rookTarget })!;
        kingPiece.resetPieceMovement();
        rookPiece.resetPieceMovement();
        Board.addPiece({ grid, point: origin, piece: kingPiece });
        Board.addPiece({ grid, point: target, piece: rookPiece });
        Board.removePiece({ grid, point: kingTarget });
        Board.removePiece({ grid, point: rookTarget });
      }
      this.current.turnHistory.pop();
      this.current.annotations.pop();
      return true;
    }
    return false;
  }

  public getMoves({
    piece,
    point,
    grid = this.current.grid,
    skipResolveCheck,
  }: {
    piece: GamePiece | undefined;
    point: Point;
    grid?: Grid;
    skipResolveCheck?: boolean;
  }): Move[] {
    if (!piece) return [];
    const { type, team, moved } = piece;
    const lastTurnHistory = this.current.turnHistory.at(-1);
    const availableMoves = getPieceMoves({
      point,
      piece: { type, team, moved },
      grid,
      lastTurnHistory,
    });
    if (!skipResolveCheck) {
      return availableMoves.filter((move) => {
        return this.canMoveResolve({ origin: point, move });
      });
    } else {
      return availableMoves;
    }
  }

  private findMove({
    origin,
    target,
    grid,
  }: {
    origin: Point;
    target: Point;
    grid: Grid;
  }) {
    const piece = this.lookupPiece({ grid, point: origin });
    if (!piece) return;
    const availableMoves = this.getMoves({
      piece,
      point: origin,
      grid,
    });
    const move = availableMoves.find((move) => doPointsMatch(move[0], target));
    return move;
  }

  private canMoveResolve({
    origin,
    move,
    grid = this.current.grid,
  }: {
    origin: Point;
    move: Move;
    grid?: Grid;
  }) {
    //Clone board to test if move is resolvable without affecting current board
    const clonedGrid = Board.cloneGrid({ grid });
    this.resolveBoard({
      origin,
      move,
      grid: clonedGrid,
      dontUpdatePiece: true,
    });
    //Check if resolving above switch would put player in check
    const isMoveResolvable = this.isChecked({
      team: this.getCurrentTeam(),
      grid: clonedGrid,
    })
      ? false
      : true;
    return isMoveResolvable;
  }

  public getAllPieces(grid = this.current.grid) {
    return Board.getPieces({ grid });
  }

  public lookupPiece({
    point,
    grid = this.current.grid,
  }: {
    point: Point;
    grid?: Grid;
  }) {
    return Board.getPiece({ grid, point });
  }

  private isChecked({ team, grid }: { team: TEAM; grid: Grid }) {
    const pieces = Board.getPieces({ grid });
    const king = pieces.find(({ piece }) => {
      return piece?.type === PIECE.K && piece?.team === team;
    })!;
    const opponentsPieces = Board.getPieces({ grid }).filter(({ piece }) => {
      return piece?.team === this.getCurrentTeamsOpponent();
    });
    const opponentsAvailableMoves = opponentsPieces
      .map(({ piece, point }) =>
        this.getMoves({
          piece,
          point,
          grid,
          skipResolveCheck: true,
        })
      )
      .flat();
    const isKingChecked = opponentsAvailableMoves.find((move) =>
      doPointsMatch(move[0], king.point)
    );
    //Returns an array with the kings location if checked
    return isKingChecked;
  }

  private isCheckmate({ grid }: { grid: Grid }) {
    //Find teams current pieces
    const currentPlayerPieces = this.getAllPieces(grid).filter(
      ({ piece }) => piece?.team === this.getCurrentTeam()
    );
    //For each piece, iterate on its available moves
    const anyAvailableMoves = currentPlayerPieces
      .map(({ piece, point }) => {
        return this.getMoves({
          piece,
          point,
          grid,
        });
      })
      .flat();
    //If you have available moves, you are not in checkmate so return false
    return anyAvailableMoves.length ? false : true;
  }

  private checkPromotion({ piece, point }: { piece: GamePiece; point: Point }) {
    if (piece.type === PIECE.P && (point[1] === 0 || point[1] === 7)) {
      return true;
    }
    return false;
  }

  private setPromotionPiece({
    target,
    originPiece,
    selection,
    grid,
  }: {
    target: Point;
    originPiece: GamePiece;
    selection: PIECE;
    grid: Grid;
  }) {
    Board.removePiece({ grid, point: target });
    const promotedPiece = new GamePiece({
      type: selection,
      team: originPiece.team,
    });
    Board.addPiece({ grid, point: target, piece: promotedPiece });
  }

  public resetGame() {
    this.current = this.createGame();
  }

  public getHistory() {
    return this.current.turnHistory;
  }

  private annotate(history: TurnHistory) {
    let annotation;
    const moveType = history.type;
    const promotion = history.promotion;
    const originPiece = Board.getPiece({
      grid: this.current.grid,
      point: history.target,
    });
    const opponentInCheck = history.isOpponentInCheck;
    const originSquare = Board.getSquareName({
      point: history.origin,
    });
    const targetSquare = Board.getSquareName({ point: history.target });
    const isCapturing = history.type === "capture";
    const symbol = originPiece?.getSymbol();
    if (moveType === "castle") {
      annotation = history.castling.direction === 1 ? "O-O" : "O-O-O";
    } else if (promotion) {
      //TO DO: Change to Q for now, will need to update to allow for selection
      annotation = `${targetSquare}${"Q"}`;
    } else if (isCapturing) {
      if (originPiece?.type === "Pawn") {
        annotation = `${originSquare.charAt(0)}x${targetSquare}`;
      } else {
        annotation = `${symbol}x${targetSquare}`;
      }
    } else {
      annotation = `${symbol}${targetSquare}`;
    }
    if (opponentInCheck) annotation = `${annotation}+`;
    this.current.annotations.push(annotation);
    this.current.turnHistory.push(history);
  }

  handleAIMove({ depth }: { depth: number }) {
    let sum = 0;
    const newGrid = Board.cloneGrid({ grid: this.current.grid });
    const result = this.minimax({
      grid: newGrid,
      depth,
      maximizingPlayer: false,
      alpha: -Infinity,
      beta: Infinity,
      sum,
    });
    if (!result.bestMove) return;
    const [origin, move] = result.bestMove;
    return this.move({ origin, target: move[0] });
  }

  minimax({
    grid,
    depth,
    maximizingPlayer,
    alpha,
    beta,
    sum,
  }: {
    grid: Grid;
    depth: number;
    maximizingPlayer: boolean;
    alpha: number;
    beta: number;
    sum: number;
  }): {
    bestMove: [Point, Move] | null;
    value: number;
  } {
    if (depth === 0) {
      return { bestMove: null, value: sum };
    }
    const availableMoves = Board.getPieces({
      grid,
      team: this.getCurrentTeam(),
    })
      .map(({ piece, point }) => {
        return getPieceMoves({
          piece: {
            type: piece!.type,
            team: piece!.team,
            moved: piece!.moved,
          },
          point,
          grid,
          lastTurnHistory: this.current.turnHistory.at(-1),
        }).map((move) => [point, move] as [Point, Move]);
      })
      .flat();

    let bestMove: [Point, Move] | null = null;
    let maxValue = Number.NEGATIVE_INFINITY;
    let minValue = Number.POSITIVE_INFINITY;
    for (let i = 0; i < availableMoves.length; i++) {
      const [origin, move] = availableMoves[i];
      this.move({ origin, target: move[0] });
      const newSum = sum + evaluateBoardPositions({ grid: this.current.grid });
      const { value: childValue } = this.minimax({
        grid: this.current.grid,
        depth: depth - 1,
        maximizingPlayer: !maximizingPlayer,
        alpha,
        beta,
        sum: newSum,
      });

      this.undoTurn();

      if (maximizingPlayer) {
        if (childValue > maxValue) {
          maxValue = childValue;
          bestMove = availableMoves[i];
        }
        if (childValue > alpha) {
          alpha = childValue;
        }
      } else {
        if (childValue < minValue) {
          minValue = childValue;
          bestMove = availableMoves[i];
        }
        if (childValue < beta) {
          beta = childValue;
        }
      }

      // Alpha-beta pruning
      if (alpha >= beta) {
        break;
      }
    }

    if (maximizingPlayer) {
      return {
        bestMove,
        value: maxValue,
      };
    } else {
      return {
        bestMove,
        value: minValue,
      };
    }
  }
}

export default Game;
