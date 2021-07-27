import { doMovesMatch } from "../helper/game-helpers";
import { renderScene, calcIndexFromMeshPosition, calculateGridPosition, displayPieceMoves } from "../helper/canvas-helpers";

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
        //Check for castling first -- add this below

        //If not castling, then show the available moves of the newly clicked piece
        currentMove.length = 0;
        renderScene(game, gameScene);
        displayPieceMoves(mesh, currentMove, game.board.grid, gameScene);
        //If selection is a movement square than push point
      } else if (mesh.id === "plane") {
        currentMove.push(mesh.point);
      } else if (mesh.color) {
        //If second selection is an enemy piece, calculate move of original piece and push move if matches
        if (mesh.color !== game.gameState.currentPlayer) {
          const [x, y] = calcIndexFromMeshPosition([mesh.position.z, mesh.position.x]);
          const opponentsPiece = game.board.grid[x][y].on;
          const [x2, y2] = currentMove[0];
          const originalPiece = game.board.grid[x2][y2].on;
          const moves = originalPiece.calculateAvailableMoves(game.board.grid);
          const checkIfTrue = moves.find((move) => doMovesMatch(move, opponentsPiece.point));
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
