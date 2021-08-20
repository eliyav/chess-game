import { pieceClasses } from "./board-helpers";

const resolveMove = (originPoint, targetPoint, gameState, grid, turnHistory) => {
  const squaresandPieces = getSquaresandPieces(originPoint, targetPoint, grid);
  const { originSquare, originPiece, targetSquare, targetPiece } = squaresandPieces;

  //Check for castling
  const castling = originPiece.name === "King" && originPiece.color === gameState.currentPlayer;
  let castling2 = false;
  if (targetPiece !== undefined) {
    castling2 = targetPiece.name === "Rook" && targetPiece.color === gameState.currentPlayer;
    if (castling && castling2) {
      console.log("just left to switch squares");
      const a = getX(originPoint);
      const b = getX(targetPoint);
      let c = a - b;
      c < 0 ? (c = 1) : (c = -1);
      castlingMove(c, squaresandPieces, grid);
      return {
        result: true,
        type: "castling",
        direction: c,
        origin: originPoint,
        target: targetPoint,
        originPiece: originPiece,
        targetPiece: targetPiece,
        originSquare: originSquare,
        targetSquare: targetSquare,
      };
    }
  }

  //Check for EnPassant
  const enPassant = isEnPassantAvailable(turnHistory);
  if (enPassant.result) {
    //If moving piece is a pawn
    if (originPiece.name === "Pawn") {
      //Moving piece is on its 5th rank
      let rank;
      let color = originPiece.color;
      color === "White" ? (rank = 4) : (rank = 3);
      let y = originPiece.point[1] === rank;
      let x = turnHistory.origin[0];
      let x1 = x - 1;
      let x2 = x + 1;
      let finalX = originPiece.point[0] === x1 || originPiece.point[0] === x2;
      //Then find a way to let the can valid move resolve function handle the fact en passant worked
      if (y && finalX) {
        if (doMovesMatch(enPassant.enPassantSquare, targetPoint)) {
          if (canValidMoveResolve(squaresandPieces, targetPoint, gameState, grid, turnHistory)) {
            turnHistory.targetSquare.on = undefined;
            return {
              result: true,
              origin: originPoint,
              target: targetPoint,
              originPiece: originPiece,
              targetPiece: targetPiece,
              originSquare: originSquare,
              targetSquare: targetSquare,
            };
          }
        }
      }
    }
  }
  //Calculate the origin piece's all available moves
  let availableMoves;
  if (originPiece.name === "Pawn") {
    availableMoves = originSquare.on.calculateAvailableMoves(grid, turnHistory);
  } else if (originPiece.name === "King") {
    availableMoves = originSquare.on.calculateAvailableMoves(grid, gameState, turnHistory);
  } else {
    availableMoves = originSquare.on.calculateAvailableMoves(grid);
  }
  //Check if the entered targetPoint is a match for an available moves
  const validMove = availableMoves.find((possibleMove) => doMovesMatch(possibleMove[0], targetPoint));
  if (validMove) {
    //Will resolving move be valid
    if (canValidMoveResolve(squaresandPieces, targetPoint, gameState, grid, turnHistory)) {
      //Checks for Pawn Promotion
      let promotion;
      if (originPiece.name === "Pawn" && (originPiece.point[1] === 0 || originPiece.point[1] === 7)) {
        promotion = checkForPawnPromotion(squaresandPieces);
      }
      originPiece.moved = true;
      console.log("Move is Valid! Board is updated.");

      return {
        result: true,
        origin: originPoint,
        target: targetPoint,
        originPiece: originPiece,
        targetPiece: targetPiece,
        originSquare: originSquare,
        targetSquare: targetSquare,
        promotion: promotion,
      };
    } else {
      //Switch squares back after valid move resolve check --------Try and find a fix for this..
      switchSquaresBack(squaresandPieces, originPoint);
      console.log(`${gameState.currentPlayer} King will be in check if move is resolved`);
      return false;
    }
  } else {
    console.log(`Target point ${targetPoint} is not a valid move for game piece!`);
    return false;
  }
};

const isEnPassantAvailable = (history) => {
  let moved;
  let direction;
  let x;
  let y;
  history === undefined
    ? null
    : (() => {
        if (history.originPiece.name === "Pawn") {
          const targetY = history.target[1];
          const originY = history.origin[1];
          moved = Math.abs(targetY - originY);
          direction = history.originPiece.color === "White" ? 1 : -1;
          x = history.target[0];
          y = history.origin[1] + direction;
        }
      })();
  return {
    result: moved === 2 ? true : false,
    enPassantSquare: [x, y],
  };
};

const canValidMoveResolve = (squaresandPieces, targetPoint, gameState, grid, turnHistory) => {
  //Resolve switch of squares
  switchSquares(squaresandPieces, targetPoint);
  //Check if resolve causes current players king to be check
  const kingSquare = findKing(gameState, grid);
  return isChecked(gameState, grid, turnHistory, kingSquare) ? false : true;
};

const isChecked = (gameState, grid, turnHistory, kingSquare) => {
  const opponentsPieces = getOpponentsPieces(gameState, grid);
  const opponentsAvailableMoves = getMoves(grid, gameState, turnHistory, opponentsPieces);
  const kingIsChecked = opponentsAvailableMoves.find((move) => doMovesMatch(move[0], kingSquare.on.point));
  //Returns an array with the kings location if checked
  return kingIsChecked;
};

const isEnemyChecked = (gameState, grid, turnHistory) => {
  const kingSquare = findEnemyKing(gameState, grid);
  const myPieces = getMyPieces(gameState, grid);
  const myAvailableMoves = getMoves(grid, gameState, turnHistory, myPieces);
  const kingIsChecked = myAvailableMoves.find((move) => doMovesMatch(move[0], kingSquare.on.point));
  //Returns an array with the kings location if checked
  return kingIsChecked;
};

const calcCastling = (grid, gameState, turnHistory, currentPoint, movesObj) => {
  const [x, y] = currentPoint;
  const piece = grid[x][y].on;
  let targetPiece;
  let targetPiece2;

  if (piece.color === "White") {
    targetPiece = grid[0][0].on;
    targetPiece2 = grid[7][0].on;
  } else {
    targetPiece = grid[0][7].on;
    targetPiece2 = grid[7][7].on;
  }
  console.log(targetPiece);
  console.log(targetPiece2);
  //Check for castling move
  const castling1 = piece.name === "King" && !piece.moved;
  const castling2 = targetPiece.name === "Rook" && !targetPiece.moved;
  if (castling1 && castling2) {
    const resolve = checkForCastling(piece.point, targetPiece.point, gameState, grid, turnHistory, movesObj);
    if (resolve !== false) {
      console.log(resolve);
      resolve[0] ? movesObj.push(resolve[1]) : null;
    }
  }

  //Check for second castling move
  const castling3 = piece.name === "King" && !piece.moved;
  const castling4 = targetPiece2.name === "Rook" && !targetPiece2.moved;
  if (castling3 && castling4) {
    const resolve = checkForCastling(piece.point, targetPiece2.point, gameState, grid, turnHistory, movesObj);
    if (resolve !== false) {
      console.log(resolve);
      resolve[0] ? movesObj.push(resolve[1]) : null;
    }
  }
};

//Checks if castling is valid
const checkForCastling = (originPoint, targetPoint, gameState, grid, turnHistory, movesObj) => {
  const squaresandPieces = getSquaresandPieces(originPoint, targetPoint, grid);
  const { originPiece, targetPiece, originSquare, targetSquare } = squaresandPieces;
  //Check for valid castling pieces
  if (originPiece.moved === false && targetPiece.moved === false) {
    if (originPiece.name === "King" && targetPiece.name === "Rook") {
      //Check for valid team
      if (originPiece.color === gameState.currentPlayer && targetPiece.color === gameState.currentPlayer) {
        //Check if king is currently in check
        const kingSquare = findKing(gameState, grid);
        const isKingChecked = isChecked(gameState, grid, turnHistory, kingSquare);
        if (isKingChecked) {
          //console.log("King is checked!");
          return false;
        } else {
          //Check squares between king and rook are unoccupied.
          const a = getX(originPoint);
          const b = getX(targetPoint);
          const y = getY(originPoint);
          let c = a - b;
          let d;
          c < 0 ? (d = c * -1 - 1) : (d = c - 1);

          const squaresInBetween = [];
          for (let i = 1; i <= d; i++) {
            if (a - b > 0) {
              const point = [a - i, y];
              squaresInBetween.push(point);
            } else {
              const point = [a + i, y];
              squaresInBetween.push(point);
            }
          }
          const squaresInUse = squaresInBetween
            .map((point) => {
              const square = grid[getX(point)][getY(point)];
              return square.on === undefined ? false : true;
            })
            .filter((result) => result === true);

          if (squaresInUse.length) {
            //console.log("Squares in between are in use by other game pieces, Castling not available!");
            return false;
          } else {
            //Check if opponents pieces, threathen any of the spaces in between
            const opponentsPieces = getOpponentsPieces(gameState, grid);
            const opponentsAvailableMoves = getMoves(grid, gameState, turnHistory, opponentsPieces);
            const isThereOverlap = [];
            for (let i = 0; i < squaresInBetween.length; i++) {
              const square = squaresInBetween[i];
              for (let k = 0; k < opponentsAvailableMoves.length; k++) {
                const availableMove = opponentsAvailableMoves[k];
                const doesMoveMatchSquare = doMovesMatch(availableMove[0], square);
                doesMoveMatchSquare ? isThereOverlap.push(doesMoveMatchSquare) : null;
              }
            }
            if (isThereOverlap.length === 0) {
              console.log("Castling Available!");
              return [true, [targetPoint, "castling"]];
            } else {
              //console.log("Castling Not Available!, One of Squares is under Enemy Threat!");
              return false;
            }
          }
        }
      } else {
        //console.log("Pieces must belong to currentPlayer!");
        return false;
      }
    } else {
      //console.log("Moving piece must be King, target piece needs to be Rook!");
      return false;
    }
  } else {
    //console.log("Both King and Rook need to have not moved!");
    return false;
  }
};

const castlingMove = (direction, squaresandPieces, grid) => {
  const { originSquare, originPiece, targetSquare, targetPiece } = squaresandPieces;
  const { name, color, point, movement } = originPiece;
  const { name: name2, color: color2, movement: movement2 } = targetPiece;
  originSquare.on = undefined;
  targetSquare.on = undefined;
  //Move King 2 Spaces from current location in the direction of rook
  //Move the Rook 1 space in that same direction from the kings original location
  const newKingX = getX(point) + direction * 2;
  const newRookX = getX(point) + direction;
  const y = getY(point);
  const newKingPoint = [newKingX, y];
  const newRookPoint = [newRookX, y];
  const newKingSquare = grid[newKingX][y];
  const newRookSquare = grid[newRookX][y];
  newKingSquare.on = new pieceClasses[name](name, color, newKingPoint, movement);
  newRookSquare.on = new pieceClasses[name2](name2, color2, newRookPoint, movement2);
};

//Checks for pawn promotion ---------------------------------Needs update for UI later to new piece, or wait for UI refactor
const checkForPawnPromotion = (squaresandPieces) => {
  const { targetSquare, originPiece } = squaresandPieces;
  const y = getY(originPiece.point);
  if (y === 7 || y === 0) {
    const newClass = prompt(
      "Piece Promoted! Please type your new piece. Your Choices are: Queen, Knight, Bishop, Rook",
      "Enter class name here"
    ); //Change with UI prompt-------------------------------------------------
    const { color, point, movement } = originPiece;
    targetSquare.on = new pieceClasses[newClass](newClass, color, point, movement);
    const string = newClass.toString();
    return string;
  }
};

//Functions to switch game pieces back and forth between squares once move is entered
const switchSquares = (squaresandPieces, point) => {
  const { originSquare, targetSquare, originPiece } = squaresandPieces;
  targetSquare.on = originPiece;
  targetSquare.on.point = [getX(point), getY(point)];
  originSquare.on = undefined;
  return true;
};

const switchSquaresBack = (squaresandPieces, point) => {
  const { originSquare, targetSquare, originPiece, targetPiece } = squaresandPieces;
  originSquare.on = originPiece;
  originSquare.on.point = [getX(point), getY(point)];
  targetSquare.on = targetPiece;
  return true;
};

//General Helper functions
const getX = (point) => {
  const [x, y] = point;
  return x;
};

const getY = (point) => {
  const [x, y] = point;
  return y;
};

const doMovesMatch = (move, move2) => getX(move) == getX(move2) && getY(move) == getY(move2);

const getOpponentsPieces = (gameState, grid) => {
  const piecesArray = grid.flat().filter((square) => {
    return square.on !== undefined ? (square.on.color !== gameState.currentPlayer ? true : false) : null;
  });
  return piecesArray;
};

const getMyPieces = (gameState, grid) => {
  const piecesArray = grid.flat().filter((square) => {
    return square.on !== undefined ? (square.on.color === gameState.currentPlayer ? true : false) : null;
  });
  return piecesArray;
};

const getCurrentPlayerPieces = (gameState, grid) => {
  const piecesArray = grid.flat().filter((square) => {
    return square.on !== undefined ? (square.on.color === gameState.currentPlayer ? true : false) : null;
  });
  return piecesArray;
};

const getMoves = (grid, gameState, turnHistory, gamePieces) => {
  const availableMoves = gamePieces
    .map((square) => {
      if (square.on.name === "Pawn") {
        return square.on.calculateAvailableMoves(grid, turnHistory);
      } else if (square.on.name === "King") {
        return square.on.calculateAvailableMoves(grid, gameState, turnHistory);
      } else {
        return square.on.calculateAvailableMoves(grid);
      }
    })
    .flat()
    .filter((move) => (move[0] !== undefined ? true : false));

  return availableMoves;
};

const findKing = (gameState, grid) => {
  const findKing = grid
    .flat()
    .filter((square) => (square.on !== undefined ? true : false))
    .find((square) => square.on.name === "King" && square.on.color === gameState.currentPlayer);

  return findKing;
};

const findEnemyKing = (gameState, grid) => {
  const findKing = grid
    .flat()
    .filter((square) => (square.on !== undefined ? true : false))
    .find((square) => square.on.name === "King" && square.on.color !== gameState.currentPlayer);

  return findKing;
};

//Function that returns Squares and Pieces from designated move
const getSquaresandPieces = (originPoint, targetPoint, grid) => {
  const originSquare = grid[getX(originPoint)][getY(originPoint)];
  const targetSquare = grid[getX(targetPoint)][getY(targetPoint)];
  const originPiece = originSquare.on;
  const targetPiece = targetSquare.on;
  return { originSquare, targetSquare, originPiece, targetPiece };
};

//Simulation For Checkmate Checks ---------Need to update with board clone later
const isCheckmate = (gameState, grid, turnHistory) => {
  const kingSquare = findKing(gameState, grid);
  return kingSquare
    ? (isChecked(gameState, grid, turnHistory, kingSquare) ? true : false)
      ? simulateCheckmate(gameState, grid, turnHistory)
        ? true
        : false
      : null
    : null;
};

const simulateCheckmate = (gameState, grid, turnHistory) => {
  //** Use grid clone to make this way more efficient
  const finalResults = [];
  //Find all current Pieces
  const currentPlayerPieces = getCurrentPlayerPieces(gameState, grid);
  const pieces = currentPlayerPieces.map((piece) => piece.on);
  //For each piece, iterate on its available moves
  pieces.forEach((piece) => {
    let availableMoves;
    if (piece.name === "Pawn") {
      availableMoves = piece.calculateAvailableMoves(grid, turnHistory);
    } else if (piece.name === "King") {
      availableMoves = piece.calculateAvailableMoves(grid, gameState, turnHistory);
    } else {
      availableMoves = piece.calculateAvailableMoves(grid);
    }
    const originPoint = [...piece.point];
    //For Each available move, check if after resolving it, the player is still in check.
    const isItCheckmate = availableMoves.map((move) => {
      const squaresandPieces = getSquaresandPieces(originPoint, move[0], grid);
      return simulateResolveMove(originPoint, move[0], gameState, grid, turnHistory)
        ? switchSquaresBack(squaresandPieces, originPoint)
          ? false
          : true
        : true;
    });
    finalResults.push.apply(finalResults, isItCheckmate);
  });

  const isCheckmate = finalResults.filter((result) => result === false);
  //If any return true, you are not in checkmate
  return isCheckmate.length ? false : true;
};

const simulateResolveMove = (originPoint, targetPoint, gameState, grid, turnHistory) => {
  const squaresandPieces = getSquaresandPieces(originPoint, targetPoint, grid);
  const { originPiece, originSquare } = squaresandPieces;
  //Check if origin square has game piece on it
  if (originSquare.on === undefined) {
    //console.log("No Piece Exists at source point!");
    return false;
  } else if (originSquare.on.color === gameState.currentPlayer) {
    //Checks if the moving game piece belongs to current player
    let availableMoves;
    if (originPiece.name === "Pawn") {
      availableMoves = originSquare.on.calculateAvailableMoves(grid, turnHistory);
    } else if (originPiece.name === "King") {
      availableMoves = originSquare.on.calculateAvailableMoves(grid, gameState, turnHistory);
    } else {
      availableMoves = originSquare.on.calculateAvailableMoves(grid);
    }
    //Check if the entered targetPoint is a valid move for current game piece
    const validMove = availableMoves.find((possibleMove) => doMovesMatch(possibleMove[0], targetPoint));
    if (validMove) {
      //Will resolving move be valid
      if (canValidMoveResolve(squaresandPieces, targetPoint, gameState, grid, turnHistory)) {
        //console.log("Move is Valid! Board is updated.");
        return true;
      } else {
        //Switch squares back after valid move resolve check --------Try and find a fix for this..
        switchSquaresBack(squaresandPieces, originPoint);
        //console.log(`${gameState.currentPlayer} King will be in check if move is resolved`);
        return false;
      }
    } else {
      //console.log(`Target point ${targetPoint} is not a valid move for game piece!`);
      return false;
    }
  } else {
    //console.log(`Piece doesn't belong to the ${gameState.currentPlayer} team!`);
    return false;
  }
};

const annotate = (result, gameState, grid, turnHistory) => {
  let string;
  const type = result.type;
  const promotion = result.promotion;
  if (type === "castling") {
    string = result.direction === 1 ? "O-O" : "O-O-O";
  } else if (promotion) {
    let finalString;
    let tempString = promotion;
    switch (tempString) {
      case "King":
        finalString = "K";
        break;
      case "Queen":
        finalString = "Q";
        break;
      case "Knight":
        finalString = "N";
        break;
      case "Bishop":
        finalString = "B";
        break;
      case "Rook":
        finalString = "R";
        break;
      default:
        finalString = "";
    }
    string = result.targetSquare.square + "=" + finalString;
  } else {
    let name = result.originPiece.name;
    let movingPiece;
    let isCapturing = result.targetPiece !== undefined ? true : false;
    let activeSquare = result.targetSquare.square;
    switch (name) {
      case "King":
        movingPiece = "K";
        break;
      case "Queen":
        movingPiece = "Q";
        break;
      case "Knight":
        movingPiece = "N";
        break;
      case "Bishop":
        movingPiece = "B";
        break;
      case "Rook":
        movingPiece = "R";
        break;
      default:
        movingPiece = "";
    }
    if (isCapturing) {
      if (name === "Pawn") {
        string = result.originSquare.square.charAt(0) + "x" + activeSquare;
      } else {
        string = movingPiece + "x" + activeSquare;
      }
    } else {
      string = movingPiece + activeSquare;
    }
    const isCheck = isEnemyChecked(gameState, grid, turnHistory);
    isCheck ? (string = string + "+") : null;
  }
  return string;
};

export {
  resolveMove,
  isCheckmate,
  checkForCastling,
  getX,
  getY,
  annotate,
  isEnemyChecked,
  doMovesMatch,
  getSquaresandPieces,
  isEnPassantAvailable,
  calcCastling,
  canValidMoveResolve,
  switchSquaresBack,
};
