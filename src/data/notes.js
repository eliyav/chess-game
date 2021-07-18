//Method to clone grid
// class Wam {
//     constructor(name) {
//     this.name = name
//     }
//     }

//     const array = [[new Wam("Eliya"),{x:2},{}],[{y:1},{y:2},{y:3}]];

//     const arrayIndex1 = array[0];
//     const arrayIndex2 = array[1];

//     const arrayClone = [[...arrayIndex1], [...arrayIndex2]];
//     //const test = array[0][0];

//     array[0][2] = {...array[0][0]};
//     array[0][0] = {};

//     console.log(array)
//     console.log(arrayClone);

//Check kings moves against opponents moves
//const filteredKingMoves = kingsMoves.filter((move) => !opponentsAvailableMoves.find((oppMove) => doPointsMatch(move, oppMove)));
//const kingsMoves = kingSquare.on.calculateAvailableMoves(kingSquare.on.point, grid);

// if (kingSquare) {
//   if (isChecked(gameState, grid, kingSquare) ? true : false) {
//     console.log("King is checked!");
//     return simulateCheckmate(gameState, grid) ? true : false;
//   }
// } else {
//   return false;
// }

///After full canvas update didnt need below functions

// import activateEmitter from "./component/events/offline-emitter";
// import activateInput from "./component/events/activate-input";
// import { renderScene } from "./helper/canvas-helpers";
// import addEventListeners from "./component/events/add-event-listeners";
// import assetLoader from "./view/asset-loader";

//#region Start Game Modes

//   const createOnlineGame = async () => {
//     activateSockets();
//     socket.emit("request-room-id");
//     activateGame("Online");
//     activateEmitter();
//   };

//   const joinOnlineGame = async () => {
//     gameMode = "Online";
//     activateSockets();
//     await activateGame("Online");
//     activateEmitter();
//     room = prompt("Please enter the room key");
//     socket.emit("join-room", room);
//   };

// const activateOnlineGame = (user) => {
//   activateInput();
//   if (user === "White") {
//     player = "White";
//   } else {
//     player = "Black";
//     scene.cameras[0].alpha = 0;
//   }
// };
