import Match from "../component/match";
import { doMovesMatch } from "../helper/game-helpers";
import { findIndex, displayPieceMoves } from "../helper/canvas-helpers";
import { ChessPieceMesh } from "../view/asset-loader";
import { CanvasView } from "../view/view-init";

const inputController = (
  mesh: ChessPieceMesh,
  view: CanvasView,
  match: Match
) => {
  if (!match.timer.gamePaused) {
    if (match.matchSettings.mode === "Online") {
      if (match.matchSettings.player === match.game.state.currentPlayer) {
        return processMove();
      }
    } else {
      return processMove();
    }
  }
  function processMove() {
    const currentMove = match.game.moves;
    //If mesh
    if (mesh) {
      if (currentMove.length === 0) {
        if (mesh.color === match.game.state.currentPlayer) {
          //If no current move has been selected, and mesh belongs to current player
          displayPieceMoves(
            mesh,
            currentMove,
            match.game,
            view.scenes.gameScene
          );
        }
      } else if (mesh.color === match.game.state.currentPlayer) {
        //If there is already a mesh selected, and you select another of your own meshes
        const originalPiece = match.game.lookupPiece(currentMove[0])!;
        const newPiece = match.game.lookupPiece(
          findIndex([mesh.position.z, mesh.position.x], true)
        )!;
        if (originalPiece === newPiece) {
          //If both selected pieces are the same, reset current move
          currentMove.length = 0;
          view.updateMeshesRender(match.game);
        } else {
          if (newPiece.name === "Rook" && originalPiece.name === "King") {
            //Checks for castling
            const isItCastling = match.game
              .calculateAvailableMoves(originalPiece, true)
              .filter((move) => doMovesMatch(move[0], newPiece.point));
            if (isItCastling.length > 0) {
              currentMove.push(newPiece.point);
            } else {
              //If rook is selected second and not castling, show rooks moves
              currentMove.length = 0;
              view.updateMeshesRender(match.game);
              displayPieceMoves(
                mesh,
                currentMove,
                match.game,
                view.scenes.gameScene
              );
            }
          } else {
            //If second selected piece is not a castling piece
            currentMove.length = 0;
            view.updateMeshesRender(match.game);
            displayPieceMoves(
              mesh,
              currentMove,
              match.game,
              view.scenes.gameScene
            );
          }
        }
      } else if (mesh.color && mesh.color !== match.game.state.currentPlayer) {
        //If second selection is an enemy mesh, calculate move of original piece and push move if matches
        const opponentsPiece = match.game.lookupPiece(
          findIndex([mesh.position.z, mesh.position.x], true)
        )!;
        const originalPiece = match.game.lookupPiece(currentMove[0])!;
        const isValidMove = match.game
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
  }
};

export default inputController;
