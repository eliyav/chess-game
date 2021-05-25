const resolveMove = (originPoint, targetPoint, gameState, grid, endGame) => {
  const originSquare = grid[getX(originPoint)][getY(originPoint)];
  const targetSquare = grid[getX(targetPoint)][getY(targetPoint)];
  const originPiece = originSquare.on;
  const targetPiece = targetSquare.on;
  //Check if square has game piece on it
  if (originSquare.on === undefined) {
    console.log("No Piece Exists at source point!");
    return false;
  }
  //Check if game piece using square belongs to current player
  else if (originSquare.on.color === gameState.currentPlayer) {
    const possibleMoves = originSquare.on.calculateAvailableMoves(originPoint, grid);
    //Check if the entered targetPoint is a valid move for current game piece
    const validMove = possibleMoves.find((movePoint) => doPointsMatch(movePoint, targetPoint));
    if (validMove) {
      //Will resolving move be valid
      if (canValidMoveResolve(originSquare, targetSquare, originPiece, targetPiece, targetPoint, gameState, grid, endGame)) {
        //***Check for pawn promotion here********************
        originPiece.moved = true;
        console.log("Move is Valid! Board is updated.");
        return true;
      } else {
        //Switch squares back after valid move resolve check --------Try and find a fix for this..
        switchSquaresBack(originSquare, targetSquare, originPiece, targetPiece, originPoint);
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

const canValidMoveResolve = (originSquare, targetSquare, originPiece, targetPiece, targetPoint, gameState, grid, endGame) => {
  //If target square is King, end game
  targetSquare.on !== undefined ? (targetSquare.on.name === "King" ? endGame() : null) : null;
  //Resolve Switch squares
  switchSquares(originSquare, targetSquare, originPiece, targetPiece, targetPoint);
  //Check if resolve causes current players king to be check
  const kingSquare = findKing(gameState, grid);
  return isChecked(gameState, grid, kingSquare) ? false : true;
};

const isChecked = (gameState, grid, kingSquare) => {
  const opponentsPieces = getOpponentsPieces(gameState, grid);
  const opponentsAvailableMoves = getMoves(grid, opponentsPieces);
  const kingIsChecked = opponentsAvailableMoves.find((move) => doPointsMatch(move, kingSquare.on.point));
  //Returns an array with the kings location if checked
  return kingIsChecked;
};

const isCheckmate = (gameState, grid) => {
  const kingSquare = findKing(gameState, grid);
  if (kingSquare) {
    if (isChecked(gameState, grid, kingSquare) ? true : false) {
      console.log("King is checked!");
      return simulateCheckmate(gameState, grid) ? true : false;
    }
  } else {
    return false;
  }
};

const simulateCheckmate = (gameState, grid, endGame) => {
  //*********************** use grid clone to make this way more efficient

  const finalResults = [];
  //Find all current Pieces
  const currentPlayerPieces = getCurrentPlayerPieces(gameState, grid);
  const pieces = currentPlayerPieces.map((piece) => piece.on);
  //For each piece, iterate on its available moves
  pieces.forEach((piece) => {
    const availableMoves = piece.calculateAvailableMoves(piece.point, grid);
    const originPoint = [...piece.point];
    //Later update this so resolve move does not use the .on but instead creates new object
    //For Each available move, check if after resolving it, the player is still in check.
    const isItCheckmate = availableMoves.map((move) => {
      const originSquare = grid[getX(originPoint)][getY(originPoint)];
      const targetSquare = grid[getX(move)][getY(move)];
      const originPiece = originSquare.on;
      const targetPiece = targetSquare.on;
      return simulateResolveMove(originPoint, move, gameState, grid, endGame)
        ? switchSquaresBack(originSquare, targetSquare, originPiece, targetPiece, originPoint)
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

const doPointsMatch = (movement, targetPoint) => getX(movement) == getX(targetPoint) && getY(movement) == getY(targetPoint);

const getX = (point) => {
  const [x, y] = point;
  return x;
};

const getY = (point) => {
  const [x, y] = point;
  return y;
};

const getOpponentsPieces = (gameState, grid) => {
  const piecesArray = grid.flat().filter((square) => {
    if (square.on !== undefined) return square.on.color !== gameState.currentPlayer ? true : false;
  });
  return piecesArray;
};

const getCurrentPlayerPieces = (gameState, grid) => {
  const piecesArray = grid.flat().filter((square) => {
    if (square.on !== undefined) return square.on.color === gameState.currentPlayer ? true : false;
  });
  return piecesArray;
};

const getMoves = (grid, gamePieces) => {
  const availableMoves = gamePieces
    .map((piece) => piece.on.calculateAvailableMoves(piece.on.point, grid))
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

const switchSquares = (originSquare, targetSquare, originPiece, targetPiece, point) => {
  targetSquare.on = originPiece;
  targetSquare.on.point = [getX(point), getY(point)];
  originSquare.on = undefined;
  return true;
};

const switchSquaresBack = (originSquare, targetSquare, originPiece, targetPiece, point) => {
  originSquare.on = originPiece;
  originSquare.on.point = [getX(point), getY(point)];
  targetSquare.on = targetPiece;
  return true;
};

const simulateResolveMove = (originPoint, targetPoint, gameState, grid, endGame) => {
  const originSquare = grid[getX(originPoint)][getY(originPoint)];
  const targetSquare = grid[getX(targetPoint)][getY(targetPoint)];
  const originPiece = originSquare.on;
  const targetPiece = targetSquare.on;
  //Check if square has game piece on it
  if (originSquare.on === undefined) {
    console.log("No Piece Exists at source point!");
    return false;
  }
  //Check if game piece using square belongs to current player
  else if (originSquare.on.color === gameState.currentPlayer) {
    const possibleMoves = originSquare.on.calculateAvailableMoves(originPoint, grid);
    //Check if the entered targetPoint is a valid move for current game piece
    const validMove = possibleMoves.find((movePoint) => doPointsMatch(movePoint, targetPoint));
    if (validMove) {
      //Will resolving move be valid
      if (canValidMoveResolve(originSquare, targetSquare, originPiece, targetPiece, targetPoint, gameState, grid, endGame)) {
        //***Check for pawn promotion here********************
        console.log("Move is Valid! Board is updated.");
        return true;
      } else {
        //Switch squares back after valid move resolve check --------Try and find a fix for this..
        switchSquaresBack(originSquare, targetSquare, originPiece, targetPiece, originPoint);
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

export { resolveMove, isCheckmate, simulateCheckmate };
