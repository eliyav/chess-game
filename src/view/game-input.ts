import Game from "../component/game-logic/game";
import { doMovesMatch } from "../../src/helper/game-helpers";
import { findIndex, displayPieceMoves } from "../../src/helper/canvas-helpers";
import { ChessPieceMesh } from "./game-assets";
import { CanvasView } from "../../src/view/create-view";

const gameInput = (mesh: ChessPieceMesh, view: CanvasView, game: Game) => {
  const currentMove = game.moves;
  //If mesh
  if (mesh) {
    if (currentMove.length === 0) {
      if (mesh.color === game.state.currentPlayer) {
        //If no current move has been selected, and mesh belongs to current player
        displayPieceMoves(mesh, currentMove, game, view.gameScene);
      }
    } else if (mesh.color === game.state.currentPlayer) {
      //If there is already a mesh selected, and you select another of your own meshes
      const originalPiece = game.lookupPiece(currentMove[0])!;
      const newPiece = game.lookupPiece(
        findIndex([mesh.position.z, mesh.position.x], true)
      )!;
      if (originalPiece === newPiece) {
        //If both selected pieces are the same, reset current move
        currentMove.length = 0;
        view.updateMeshesRender(game);
      } else {
        if (newPiece.name === "Rook" && originalPiece.name === "King") {
          //Checks for castling
          const isItCastling = game
            .calculateAvailableMoves(originalPiece, true)
            .filter((move) => doMovesMatch(move[0], newPiece.point));
          if (isItCastling.length > 0) {
            currentMove.push(newPiece.point);
          } else {
            //If rook is selected second and not castling, show rooks moves
            currentMove.length = 0;
            view.updateMeshesRender(game);
            displayPieceMoves(mesh, currentMove, game, view.gameScene);
          }
        } else {
          //If second selected piece is not a castling piece
          currentMove.length = 0;
          view.updateMeshesRender(game);
          displayPieceMoves(mesh, currentMove, game, view.gameScene);
        }
      }
    } else if (mesh.color && mesh.color !== game.state.currentPlayer) {
      //If second selection is an enemy mesh, calculate move of original piece and push move if matches
      const opponentsPiece = game.lookupPiece(
        findIndex([mesh.position.z, mesh.position.x], true)
      )!;
      const originalPiece = game.lookupPiece(currentMove[0])!;
      const isValidMove = game
        .calculateAvailableMoves(originalPiece, false)
        .find((move) => doMovesMatch(move[0], opponentsPiece.point));
      isValidMove ? currentMove.push(opponentsPiece.point) : null;
    } else if (mesh.id === "plane") {
      //If the second mesh selected is one of the movement squares
      const point = findIndex([mesh.position.z, mesh.position.x], false);
      currentMove.push(point);
    }
    //If complete move return true
    return currentMove.length === 2 ? true : false;
  }
};

export default gameInput;
