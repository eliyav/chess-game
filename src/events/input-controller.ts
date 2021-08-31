import { doMovesMatch } from "../helper/game-helpers"; 
import { renderScene, calcIndexFromMeshPosition, displayPieceMoves } from "../helper/canvas-helpers";
import Game from "../game";
import { Scene } from "babylonjs/scene";

const inputController = (mesh: any, game: Game, gameScene: Scene) => { //Fix this any call
  const currentMove = game.moves;
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
        //@ts-ignore
      const [meshX, meshY] = calcIndexFromMeshPosition([mesh.position.z, mesh.position.x]);
      const newPiece = game.board.grid[meshX][meshY].on;
      if (originalPiece === newPiece) {
        currentMove.length = 0;
        renderScene(game, gameScene);
      } else {
        if (mesh.name === "Rook" && originalPiece!.name === "King") {
          //Checks for castling
          const turnHistory = game.turnHistory[game.turnHistory.length - 1];
          const castlingPiece = game.board.grid[x][y].on;
          const castlingMoves = castlingPiece!.calculateAvailableMoves(game.board.grid, game.state, turnHistory, true);
          //@ts-ignore
          const isItCastling = castlingMoves.filter((move: any) => doMovesMatch(move[0], [meshX, meshY]));
          if (isItCastling.length > 0) {
            currentMove.push([meshX, meshY]);
          } else {
            currentMove.length = 0;
            renderScene(game, gameScene);
            displayPieceMoves(mesh, currentMove, game, gameScene);
          }
        } else {
          //If not castling
          currentMove.length = 0;
          renderScene(game, gameScene);
          displayPieceMoves(mesh, currentMove, game, gameScene);
        }
      }
    } else if (mesh.id === "plane") {
      currentMove.push(mesh.point);
    } else if (mesh.color) {
      //If second selection is an enemy mesh, calculate move of original piece and push move if matches
      if (mesh.color !== game.state.currentPlayer) {
        const [x, y] = calcIndexFromMeshPosition([mesh.position.z, mesh.position.x]);
        const opponentsPiece = game.board.grid[x][y].on;
        const [originalPieceX, originalPieceY] = currentMove[0];
        const originalPiece = game.board.grid[originalPieceX][originalPieceY].on;
        const turnHistory = game.turnHistory[game.turnHistory.length - 1];
        let moves = originalPiece!.calculateAvailableMoves(game.board.grid, game.state, turnHistory, false);
        //@ts-ignore
        const checkIfTrue = moves.find((move) => doMovesMatch(move[0], opponentsPiece!.point));
        checkIfTrue ? currentMove.push(opponentsPiece!.point) : null;
      }
    }
  }
  //If complete move return true
  return currentMove.length === 2 ? true : false;
};

export default inputController;
