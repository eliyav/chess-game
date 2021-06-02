const resolveMove = (originPoint, targetPoint, gameState, grid, endGame) => {
  const squaresandPieces = getSquaresandPieces(originPoint, targetPoint, grid);
  const { originSquare, originPiece } = squaresandPieces;

  //Check if square has game piece on it
  if (originSquare.on === undefined) {
    console.log("No Piece Exists at source point!");
    return false;
  }
  //Check if game piece using square belongs to current player
  else if (originSquare.on.color === gameState.currentPlayer) {
    const availableMoves = originSquare.on.calculateAvailableMoves(grid);
    console.log(grid); //---------------------------------------------------------------------------------------delete console.log
    //Check if the entered targetPoint is a valid move for current game piece
    const validMove = availableMoves.find((possibleMove) => doMovesMatch(possibleMove, targetPoint));
    if (validMove) {
      //Will resolving move be valid
      if (canValidMoveResolve(squaresandPieces, targetPoint, gameState, grid, endGame)) {
        //***Check for pawn promotion here********************
        originPiece.moved = true;
        console.log("Move is Valid! Board is updated.");
        return true;
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
  } else {
    console.log(`Piece doesn't belong to the ${gameState.currentPlayer} team!`);
    return false;
  }
};

const canValidMoveResolve = (squaresandPieces, targetPoint, gameState, grid, endGame) => {
  const { targetSquare } = squaresandPieces;
  //If target square is King, end game
  targetSquare.on !== undefined ? (targetSquare.on.name === "King" ? endGame() : null) : null;
  //Resolve switch of squares
  switchSquares(squaresandPieces, targetPoint);
  //Check if resolve causes current players king to be check
  const kingSquare = findKing(gameState, grid);
  return isChecked(gameState, grid, kingSquare) ? false : true;
};

const isChecked = (gameState, grid, kingSquare) => {
  const opponentsPieces = getOpponentsPieces(gameState, grid);
  const opponentsAvailableMoves = getMoves(grid, opponentsPieces);
  const kingIsChecked = opponentsAvailableMoves.find((move) => doMovesMatch(move, kingSquare.on.point));
  //Returns an array with the kings location if checked
  return kingIsChecked;
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

const getCurrentPlayerPieces = (gameState, grid) => {
  const piecesArray = grid.flat().filter((square) => {
    return square.on !== undefined ? (square.on.color === gameState.currentPlayer ? true : false) : null;
  });
  return piecesArray;
};

const getMoves = (grid, gamePieces) => {
  const availableMoves = gamePieces
    .map((piece) => piece.on.calculateAvailableMoves(grid))
    .flat()
    .filter((move) => (move !== undefined ? true : false));
  return availableMoves;
};

const findKing = (gameState, grid) => {
  const findKing = grid
    .flat()
    .filter((square) => (square.on !== undefined ? true : false))
    .find((square) => square.on.name === "King" && square.on.color === gameState.currentPlayer);

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
const isCheckmate = (gameState, grid, endGame) => {
  const kingSquare = findKing(gameState, grid);
  return kingSquare
    ? (isChecked(gameState, grid, kingSquare) ? true : false)
      ? simulateCheckmate(gameState, grid, endGame)
        ? true
        : false
      : null
    : null;
};

const simulateCheckmate = (gameState, grid, endGame) => {
  //** Use grid clone to make this way more efficient
  const finalResults = [];
  //Find all current Pieces
  const currentPlayerPieces = getCurrentPlayerPieces(gameState, grid);
  const pieces = currentPlayerPieces.map((piece) => piece.on);
  //For each piece, iterate on its available moves
  pieces.forEach((piece) => {
    const availableMoves = piece.calculateAvailableMoves(grid);
    const originPoint = [...piece.point];
    //For Each available move, check if after resolving it, the player is still in check.
    const isItCheckmate = availableMoves.map((move) => {
      const squaresandPieces = getSquaresandPieces(originPoint, move, grid);
      return simulateResolveMove(originPoint, move, gameState, grid, endGame)
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

const simulateResolveMove = (originPoint, targetPoint, gameState, grid, endGame) => {
  const squaresandPieces = getSquaresandPieces(originPoint, targetPoint, grid);
  const { originSquare } = squaresandPieces;

  //Check if origin square has game piece on it
  if (originSquare.on === undefined) {
    console.log("No Piece Exists at source point!");
    return false;
  } else if (originSquare.on.color === gameState.currentPlayer) {
    //Checks if the moving game piece belongs to current player
    const availableMoves = originSquare.on.calculateAvailableMoves(grid);
    //Check if the entered targetPoint is a valid move for current game piece
    const validMove = availableMoves.find((possibleMove) => doMovesMatch(possibleMove, targetPoint));
    if (validMove) {
      //Will resolving move be valid
      if (canValidMoveResolve(squaresandPieces, targetPoint, gameState, grid, endGame)) {
        //***Check for pawn promotion here********************
        console.log("Move is Valid! Board is updated.");
        return true;
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
  } else {
    console.log(`Piece doesn't belong to the ${gameState.currentPlayer} team!`);
    return false;
  }
};

export { resolveMove, isCheckmate };
