import { doMovesMatch } from "../helper/game-helpers";
import { renderScene, calcIndexFromMeshPosition, displayPieceMoves } from "../helper/canvas-helpers";

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
          displayPieceMoves(mesh, currentMove, game, gameScene);
        }
        //If there is already a mesh selected, and you select another of your own meshes
      } else if (mesh.color === game.gameState.currentPlayer) {
        currentMove.length = 0;
        renderScene(game, gameScene);
        displayPieceMoves(mesh, currentMove, game, gameScene);
      } else if (mesh.id === "plane") {
        currentMove.push(mesh.point);
      } else if (mesh.color) {
        //If second selection is an enemy piece, calculate move of original piece and push move if matches
        if (mesh.color !== game.gameState.currentPlayer) {
          const [x, y] = calcIndexFromMeshPosition([mesh.position.z, mesh.position.x]);
          const opponentsPiece = game.board.grid[x][y].on;
          const [originalPieceX, originalPieceY] = currentMove[0];
          const originalPiece = game.board.grid[originalPieceX][originalPieceY].on;
          let moves;
          if (originalPiece.name === "Pawn") {
            moves = originalPiece.calculateAvailableMoves(grid, turnHistory);
          } else if (originalPiece.name === "King") {
            moves = originalPiece.calculateAvailableMoves(grid, gameState, turnHistory);
          } else {
            moves = originalPiece.calculateAvailableMoves(grid);
          }
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
