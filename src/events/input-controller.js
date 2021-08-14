import { doMovesMatch } from "../helper/game-helpers";
import { renderScene, calcIndexFromMeshPosition, displayPieceMoves } from "../helper/canvas-helpers";
import { getSquaresandPieces, checkForCastling } from "../helper/game-helpers";

const inputController = (mesh, game, gameMode, gameScene) => {
  const currentMove = game.moves;

  //Check if online mode
  if (gameMode.player === game.gameState.currentPlayer || gameMode.player === undefined) {
    //If mesh
    if (mesh) {
      //If no current move has been selected
      if (currentMove.length === 0) {
        //If mesh belongs to current player
        if (mesh.color === game.gameState.currentPlayer) {
          displayPieceMoves(mesh, currentMove, game.board.grid, gameScene);
        }
        //If there is already a mesh selected, and you select another of your own meshes
      } else if (mesh.color === game.gameState.currentPlayer) {
        //Check for castling first
        const [x, y] = calcIndexFromMeshPosition([mesh.position.z, mesh.position.x]);
        const ownPiece = game.board.grid[x][y].on;
        const squaresandPieces = getSquaresandPieces(currentMove[0], ownPiece.point, game.board.grid);
        const { originSquare, originPiece, targetSquare, targetPiece } = squaresandPieces;
        //Check for castling move
        const castling = originPiece.name === "King" && originPiece.color === game.gameState.currentPlayer;
        let castling2 = false;
        castling2 = targetPiece.name === "Rook" && targetPiece.color === game.gameState.currentPlayer;
        if (castling && castling2) {
          const resolve = checkForCastling(currentMove[0], ownPiece.point, game.gameState, game.board.grid);
          console.log(resolve);
          resolve ? currentMove.push(ownPiece.point) : null;
        } else {
          currentMove.length = 0;
          renderScene(game, gameScene);
          displayPieceMoves(mesh, currentMove, game.board.grid, gameScene);
        }
      } else if (mesh.id === "plane") {
        currentMove.push(mesh.point);
      } else if (mesh.color) {
        //If second selection is an enemy piece, calculate move of original piece and push move if matches
        if (mesh.color !== game.gameState.currentPlayer) {
          const [x, y] = calcIndexFromMeshPosition([mesh.position.z, mesh.position.x]);
          const opponentsPiece = game.board.grid[x][y].on;
          const [originalPieceX, originalPieceY] = currentMove[0];
          const originalPiece = game.board.grid[originalPieceX][originalPieceY].on;
          const moves = originalPiece.calculateAvailableMoves(game.board.grid);
          const checkIfTrue = moves.find((move) => doMovesMatch(move[0], opponentsPiece.point));
          if (checkIfTrue) {
            const [x, y] = calcIndexFromMeshPosition([mesh.position.z, mesh.position.x]);
            const piece = game.board.grid[x][y].on;
            currentMove.push(piece.point);
          }
        }
      }
    }
    //If complete move return true
    if (currentMove.length === 2) {
      return true;
    }
  }
};

export default inputController;
