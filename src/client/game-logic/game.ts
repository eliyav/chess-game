import { GAMESTATUS, Move, PIECE, Point, Turn } from "../../shared/game";
import { TEAM } from "../../shared/match";
import { Board, Grid } from "./board";
import { rookInitialPoints } from "./chess-data-import";
import GamePiece from "./game-piece";
import { doPointsMatch, getPieceMoves, isEnPassantAvailable } from "./moves";
import { evaluateBoardPositions } from "./ai-opponent";

class Game {
  teams: TEAM[];
  current: {
    grid: Grid;
    annotations: string[];
    turns: Turn[];
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
      turns: [],
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
    } else if (this.isStalemate({ grid: this.current.grid })) {
      this.current.status = GAMESTATUS.STALEMATE;
    }
  }

  public getTurn() {
    return this.current.turns.length + 1;
  }

  public move({
    origin,
    target,
    grid = this.current.grid,
    simulate,
  }: {
    origin: Point;
    target: Point;
    grid?: Grid;
    simulate?: boolean;
  }) {
    if (this.current.status !== GAMESTATUS.INPROGRESS) return;
    const move = this.findMove({ grid, origin, target });
    if (!move) return;
    const resolved = this.resolveBoard({
      move,
      grid,
    });
    if (!resolved) return;
    this.annotate(resolved);
    if (!simulate) {
      this.nextTurn();
    }
    return resolved;
  }

  private resolveBoard({ move, grid }: { move: Move; grid: Grid }) {
    const { type: moveType, origin, target } = move;
    const originPiece = Board.getPiece({ grid, point: origin });
    if (!originPiece) return;
    let resolvedMove;
    if (moveType === "movement") {
      resolvedMove = this.resolveMovement({ move, grid });
    } else if (moveType === "capture") {
      resolvedMove = this.resolveCapture({ move, grid });
    } else if (moveType === "enPassant") {
      resolvedMove = this.resolveEnPassant({ move, grid });
    } else {
      resolvedMove = this.resolveCastling({ move, grid });
    }
    if (!resolvedMove) return;

    if (resolvedMove.promotion) {
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

    resolvedMove.isOpponentInCheck = isOpponentInCheck;
    return resolvedMove;
  }

  private resolveMovement({
    move,
    grid,
  }: {
    move: Move;
    grid: Grid;
  }): Turn | undefined {
    const { origin, target, promotion } = move;
    const originPiece = this.lookupPiece({ grid, point: origin });
    if (!originPiece) return;
    Board.addPiece({ grid, point: target, piece: originPiece });
    Board.removePiece({ grid, point: origin });
    return {
      type: "movement",
      origin,
      target,
      promotion,
      isOpponentInCheck: false,
    };
  }

  private resolveCapture({
    move,
    grid,
  }: {
    move: Move;
    grid: Grid;
  }): Turn | undefined {
    const { origin, target, promotion } = move;
    const originPiece = this.lookupPiece({ grid, point: origin });
    const targetPiece = this.lookupPiece({ grid, point: target });
    if (!originPiece || !targetPiece) return;
    Board.addPiece({ grid, point: target, piece: originPiece });
    Board.removePiece({ grid, point: origin });
    return {
      type: "capture",
      origin,
      target,
      promotion,
      capturedPiece: targetPiece,
      isOpponentInCheck: false,
    };
  }

  private resolveEnPassant({
    move,
    grid,
  }: {
    move: Move;
    grid: Grid;
  }): Turn | undefined {
    const { origin, target } = move;
    const originPiece = this.lookupPiece({ grid, point: origin });
    if (!originPiece) return;
    const lastTurn = this.current.turns.at(-1);
    if (!lastTurn) return;
    const enPassant = isEnPassantAvailable({
      turn: lastTurn,
      grid,
    });
    if (enPassant) {
      Board.addPiece({ grid, point: target, piece: originPiece });
      Board.removePiece({ grid, point: origin });
      Board.removePiece({ grid, point: enPassant.capturedPiecePoint });

      return {
        type: "enPassant",
        origin,
        target,
        enPassant,
        isOpponentInCheck: false,
      };
    }
  }

  private resolveCastling({
    move,
    grid,
  }: {
    move: Move;
    grid: Grid;
  }): Turn | undefined {
    const { origin, target } = move;
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

    return {
      type: "castle",
      origin,
      target,
      castling: {
        direction,
        kingTarget: newKingPoint,
        rookTarget: newRookPoint,
      },
      isOpponentInCheck: false,
    };
  }

  public undoTurn(grid = this.current.grid) {
    const lastTurn = this.current.turns.at(-1);
    if (lastTurn) {
      if (lastTurn.promotion) {
        const { origin, target } = lastTurn;
        const originPiece = new GamePiece({
          team: this.getCurrentTeamsOpponent(),
          type: PIECE.P,
        });
        Board.removePiece({ grid, point: target });
        Board.addPiece({ grid, point: origin, piece: originPiece });
        if (lastTurn.type === "capture") {
          const { capturedPiece } = lastTurn;
          Board.addPiece({
            grid,
            point: target,
            piece: new GamePiece(capturedPiece),
          });
        }
      } else if (lastTurn.type === "movement") {
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
        Board.addPiece({ grid, point: origin, piece: kingPiece });
        Board.addPiece({ grid, point: target, piece: rookPiece });
        Board.removePiece({ grid, point: kingTarget });
        Board.removePiece({ grid, point: rookTarget });
      }
      this.current.turns.pop();
      this.current.annotations.pop();
      return true;
    }
    return false;
  }

  public getMoves({
    point,
    grid = this.current.grid,
    skipResolveCheck,
    skipCastling = false,
  }: {
    point: Point;
    grid?: Grid;
    skipResolveCheck?: boolean;
    skipCastling?: boolean;
  }): Move[] {
    const piece = this.lookupPiece({ point });
    if (!piece) return [];
    const { type, team } = piece;
    const availableMoves = getPieceMoves({
      point,
      piece: { type, team },
      grid,
      turns: this.current.turns,
      skipCastling,
      checkForCastling: this.checkForCastling.bind(this),
    });
    if (skipResolveCheck) {
      return availableMoves;
    } else {
      return availableMoves.filter((move) => {
        return this.canMoveResolve({ move, team });
      });
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
    if (!piece || piece.team !== this.getCurrentTeam()) return;
    const availableMoves = this.getMoves({
      point: origin,
      grid,
    });
    const move = availableMoves.find(({ target: moveTarget }) =>
      doPointsMatch(moveTarget, target)
    );
    return move;
  }

  private canMoveResolve({
    move,
    team,
    grid = this.current.grid,
  }: {
    move: Move;
    team: TEAM;
    grid?: Grid;
  }) {
    //Clone board to test if move is resolvable without affecting current board
    const clonedGrid = Board.cloneGrid({ grid });
    this.resolveBoard({
      move,
      grid: clonedGrid,
    });
    //Check if resolving above switch would put player in check
    const isMoveResolvable = this.isChecked({
      team,
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
    const opponentsPieces = pieces.filter(({ piece }) => {
      return piece?.team !== team;
    });
    const opponentsAvailableMoves = opponentsPieces
      .map(({ point }) =>
        this.getMoves({
          point,
          grid,
          skipResolveCheck: true,
          skipCastling: true,
        })
      )
      .flat();
    const isKingChecked = opponentsAvailableMoves.find(({ target }) =>
      doPointsMatch(target, king.point)
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
      .map(({ point }) => {
        return this.getMoves({
          point,
          grid,
        });
      })
      .flat();
    //If you have available moves, you are not in checkmate so return false
    return anyAvailableMoves.length ? false : true;
  }

  private isStalemate({ grid }: { grid: Grid }) {
    //Find teams current pieces
    const currentPlayerPieces = this.getAllPieces(grid).filter(
      ({ piece }) => piece?.team === this.getCurrentTeam()
    );
    //For each piece, iterate on its available moves
    const anyAvailableMoves = currentPlayerPieces
      .map(({ point }) => {
        return this.getMoves({
          point,
          grid,
        });
      })
      .flat();
    const playerInCheck = this.isChecked({
      team: this.getCurrentTeam(),
      grid,
    });
    //If you have no available moves, and you are not checked, you are in stalemate
    return anyAvailableMoves.length === 0 && !playerInCheck ? true : false;
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
    return this.current.turns;
  }

  private annotate(history: Turn) {
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
    this.current.turns.push(history);
  }

  getBestMove({
    depth,
    maximizingPlayer,
  }: {
    depth: number;
    maximizingPlayer: boolean;
  }) {
    let sum = 0;
    const result = this.minimax({
      grid: this.current.grid,
      depth,
      maximizingPlayer,
      alpha: Number.NEGATIVE_INFINITY,
      beta: Number.POSITIVE_INFINITY,
      sum,
    });
    if (!result.bestMove) return;
    const { origin, target } = result.bestMove;
    return { origin, target };
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
    bestMove: Move | null;
    value: number;
  } {
    if (depth === 0) {
      const returnValue = { bestMove: null, value: sum };
      sum = 0;
      return returnValue;
    }
    const currentTeam = this.getCurrentTeam();
    const pieces = Board.getPieces({ grid, team: currentTeam });
    const availableMoves = pieces.flatMap(({ point }) => {
      return this.getMoves({
        point,
        grid,
      });
    });

    let bestMove: Move | null = null;
    let maxValue = Number.NEGATIVE_INFINITY;
    let minValue = Number.POSITIVE_INFINITY;
    for (let i = 0; i < availableMoves.length; i++) {
      const move = availableMoves[i];
      const { origin, target } = move;
      this.move({ origin, target, simulate: true });
      const newSum = evaluateBoardPositions({
        sum,
        move,
        team: currentTeam,
      });
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

  checkForCastling({
    kingPoint,
    team,
    grid,
    turns,
  }: {
    kingPoint: Point;
    team: TEAM;
    grid: Grid;
    turns: Turn[];
  }) {
    const moves: Move[] = [];
    const playersRooks = Board.getPieces({ grid }).filter(({ piece }) => {
      return piece?.type === PIECE.R && piece?.team === team;
    });
    if (!playersRooks.length) return moves;
    playersRooks.forEach(({ point: rookPoint }) => {
      const isRookInInitalPosition = rookInitialPoints.teams
        .find((teamData) => teamData.name === team)
        ?.startingPoints.some((initialPoint) =>
          doPointsMatch(initialPoint, rookPoint)
        );
      if (!isRookInInitalPosition) return moves;
      const hasRookMoved = turns.some((turn) =>
        doPointsMatch(turn.origin, rookPoint)
      );
      if (!hasRookMoved) {
        const resolve = this.isCastlingValid({
          kingPoint,
          rookPoint,
          team,
          grid,
        });
        if (resolve) {
          moves.push({
            origin: kingPoint,
            target: rookPoint,
            type: "castle",
            movingPiece: PIECE.K,
          });
        }
      }
    });
    return moves;
  }

  isCastlingValid({
    kingPoint,
    rookPoint,
    team,
    grid,
  }: {
    kingPoint: Point;
    rookPoint: Point;
    team: TEAM;
    grid: Grid;
  }) {
    const squaresToCheckForPiecesObstruction: Point[] = [];
    const squaresToCheckEnemyThreat = [kingPoint];
    const [kingX, kingY] = kingPoint;
    const [rookX] = rookPoint;
    const spaceBetween = kingX - rookX;
    const maxKingDistance = 2;
    const direction = spaceBetween < 0 ? 1 : -1;
    const distance =
      spaceBetween < 0 ? spaceBetween * -1 - 1 : spaceBetween - 1;
    //Calculate the squares in between King and Rook
    for (let i = 1; i <= distance; i++) {
      const distanceToMove = direction * i;
      squaresToCheckForPiecesObstruction.push([kingX + distanceToMove, kingY]);
      if (i <= maxKingDistance) {
        squaresToCheckEnemyThreat.push([kingX + distanceToMove, kingY]);
      }
    }
    //Check if squares in between are used by any pieces
    const piecesInBetween = squaresToCheckForPiecesObstruction.filter(
      (point) => {
        return Board.getPiece({ grid, point }) !== undefined;
      }
    );
    if (piecesInBetween.length) return false;
    //Check if opponents pieces, threathen any of the spaces in between
    const opponentsPieces = Board.getPieces({ grid }).filter(({ piece }) => {
      return piece && piece.team !== team;
    });
    const opponentsAvailableMoves = opponentsPieces
      .map(({ point }) =>
        this.getMoves({
          point,
          grid,
          skipCastling: true,
        })
      )
      .flat();
    const squaresUnderEnemyThreat = [];
    for (let i = 0; i < squaresToCheckEnemyThreat.length; i++) {
      const square = squaresToCheckEnemyThreat[i];
      for (let k = 0; k < opponentsAvailableMoves.length; k++) {
        const availableMove = opponentsAvailableMoves[k];
        const doesMoveMatchSquare = doPointsMatch(availableMove.origin, square);
        doesMoveMatchSquare
          ? squaresUnderEnemyThreat.push(doesMoveMatchSquare)
          : null;
      }
    }
    if (squaresUnderEnemyThreat.length) return false;
    //Otherwise if castling can occur return true
    return true;
  }
}

export default Game;
