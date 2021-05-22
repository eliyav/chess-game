const arePointsEqual = (movement, targetPoint) => getX(movement) == getX(targetPoint) && getY(movement) == getY(targetPoint);

const getX = (point) => {
  const [x, y] = point;
  return x;
};

const getY = (point) => {
  const [x, y] = point;
  return y;
};

const getOpponentsPieces = (grid, gameState) => {
  const piecesArray = grid.flat().filter((square) => {
    if (square.on !== undefined) return square.on.color !== gameState.currentPlayer ? true : false;
  });
  return piecesArray;
};

const getMoves = (gamePieces, clonedGrid) => {
  const availableMoves = gamePieces
    .map((piece) => piece.on.calculateAvailableMoves(piece.on.point, clonedGrid))
    .flat()
    .filter((move) => (move !== undefined ? true : false));
  return availableMoves;
};

const findCurrentPlayerKing = (gameState, grid) => {
  const findKing = grid //Change into find King function
    .flat()
    .filter((square) => (square.on !== undefined ? true : false))
    .find((square) => square.on.name === "King" && square.on.color === gameState.currentPlayer);

  return findKing;
};

const isCurrentPlayersKingInCheck = (gameState, grid, opponentsAvailableMoves) => {
  const kingLocation = findCurrentPlayerKing(gameState, grid).on.point;
  const findMatch = opponentsAvailableMoves.find((move) => arePointsEqual(move, kingLocation));

  return findMatch ? true : false;
};

const isResolveMoveValid = (originPoint, targetPoint, gameState, grid) => {
  //Clone Grid to get "board status" after the move for move checks
  const clonedGrid = [...grid];
  const originSquareClone = clonedGrid[getX(originPoint)][getY(originPoint)];
  const targetSquareClone = clonedGrid[getX(targetPoint)][getY(targetPoint)];
  //In the cloned grid, assume moves has been resolved
  targetSquareClone.on = originSquareClone.on;
  originSquareClone.on = undefined;
  //Calculate opponents moves after cloned grid has been updated
  const opponentsPieces = getOpponentsPieces(clonedGrid, gameState);
  const opponentsAvailableMoves = getMoves(opponentsPieces, clonedGrid);
  //Check if current player's king is in check to know if move is resolved
  return isCurrentPlayersKingInCheck(gameState, clonedGrid, opponentsAvailableMoves) ? false : true;
};

const resolveMove = (originPoint, targetPoint, gameState, grid) => {
  const originSquare = grid[getX(originPoint)][getY(originPoint)];
  const targetSquare = grid[getX(targetPoint)][getY(targetPoint)];
  //Check if square has game piece on it
  if (originSquare.on === undefined) {
    console.log("No Piece Exists at source point!");
    return false;
  }
  //Check if game piece using square belongs to current player
  else if (originSquare.on.color === gameState.currentPlayer) {
    const possibleMoves = originSquare.on.calculateAvailableMoves(originPoint, grid);
    const validMoves = possibleMoves.find((movePoint) => arePointsEqual(movePoint, targetPoint));
    //Check if the entered targetPoint is a valid move for current game piece
    if (validMoves) {
      //Will resolving move be valid
      if (isResolveMoveValid(originPoint, targetPoint, gameState, grid)) {
        targetSquare.on = originSquare.on;
        originSquare.on = undefined;
        console.log("Move is Valid! Board is updated.");
        return true;
      } else {
        console.log("Own King will be in check if move is resolved");
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

export { resolveMove };
