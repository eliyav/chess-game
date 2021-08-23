import { doMovesMatch } from "../helper/game-helpers";
import { renderScene, calcIndexFromMeshPosition, displayPieceMoves } from "../helper/canvas-helpers";

const inputController = (mesh, game, gameMode, gameScene) => {
  const currentMove = game.moves;

  //Check if online mode
  if (gameMode.player === game.state.currentPlayer || gameMode.player === undefined) {
    //If mesh
    if (mesh) {
      //If no current move has been selected
      if (currentMove.length === 0) {
        //If mesh belongs to current player
        if (mesh.color === game.state.currentPlayer) {
          displayPieceMoves(mesh, currentMove, game, gameScene);
        }
        //If there is already a mesh selected, and you select another of your own meshes
      } else if (mesh.color === game.state.currentPlayer) {
        const [x, y] = currentMove[0];
        const originalPiece = game.board.grid[x][y].on;
        const [meshX, meshY] = calcIndexFromMeshPosition([mesh.position.z, mesh.position.x]);
        const newPiece = game.board.grid[meshX][meshY].on;
        if (originalPiece === newPiece) {
          currentMove.length = 0;
          renderScene(game, gameScene);
        } else {
          if (mesh.name === "Rook" && originalPiece.name === "King") {
            //Checks for castling
            const turnHistory = game.turnHistory[game.turnHistory.length - 1];
            const castlingPiece = game.board.grid[x][y].on;
            const castlingMoves = castlingPiece.calculateAvailableMoves(game.board.grid, game.state, turnHistory, true);
            const isItCastling = castlingMoves.filter((move) => doMovesMatch(move[0], [meshX, meshY]));
            if (isItCastling.length > 0) {
              currentMove.push([meshX, meshY]);
            } else {
              currentMove.length = 0;
              renderScene(game, gameScene);
              displayPieceMoves(mesh, currentMove, game, gameScene);
            }
          } else {
            currentMove.length = 0;
            renderScene(game, gameScene);
            displayPieceMoves(mesh, currentMove, game, gameScene);
          }
        }
      } else if (mesh.id === "plane") {
        currentMove.push(mesh.point);
      } else if (mesh.color) {
        //If second selection is an enemy piece, calculate move of original piece and push move if matches
        if (mesh.color !== game.state.currentPlayer) {
          const [x, y] = calcIndexFromMeshPosition([mesh.position.z, mesh.position.x]);
          const opponentsPiece = game.board.grid[x][y].on;
          const [originalPieceX, originalPieceY] = currentMove[0];
          const originalPiece = game.board.grid[originalPieceX][originalPieceY].on;
          const turnHistory = game.turnHistory[game.turnHistory.length - 1];
          let moves;
          if (originalPiece.name === "Pawn") {
            moves = originalPiece.calculateAvailableMoves(game.board.grid, turnHistory);
          } else if (originalPiece.name === "King") {
            moves = originalPiece.calculateAvailableMoves(game.board.grid, game.state, turnHistory);
          } else {
            moves = originalPiece.calculateAvailableMoves(game.board.grid);
          }
          const checkIfTrue = moves.find((move) => doMovesMatch(move[0], opponentsPiece.point));
          if (checkIfTrue) {
            const [x, y] = calcIndexFromMeshPosition([mesh.position.z, mesh.position.x]);
            const piece = game.board.grid[x][y].on;
            currentMove.push(opponentsPiece.point);
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
