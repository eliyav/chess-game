"use strict";
(globalThis["webpackChunkchess"] = globalThis["webpackChunkchess"] || []).push([["src_view_game-scene_ts"],{

/***/ "./src/view/game-assets.ts":
/*!*********************************!*\
  !*** ./src/view/game-assets.ts ***!
  \*********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "gameAssets": () => (/* binding */ gameAssets)
/* harmony export */ });
/* harmony import */ var babylonjs__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! babylonjs */ "./node_modules/babylonjs/babylon.js");
/* harmony import */ var babylonjs__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(babylonjs__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _assets_board_gltf__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../assets/board.gltf */ "./assets/board.gltf");
/* harmony import */ var _assets_pieces_kingv3_gltf__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../assets/pieces/kingv3.gltf */ "./assets/pieces/kingv3.gltf");
/* harmony import */ var _assets_pieces_queenv3_gltf__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../assets/pieces/queenv3.gltf */ "./assets/pieces/queenv3.gltf");
/* harmony import */ var _assets_pieces_bishopv3_gltf__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../assets/pieces/bishopv3.gltf */ "./assets/pieces/bishopv3.gltf");
/* harmony import */ var _assets_pieces_knightv3_gltf__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../assets/pieces/knightv3.gltf */ "./assets/pieces/knightv3.gltf");
/* harmony import */ var _assets_pieces_rookv3_gltf__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../../assets/pieces/rookv3.gltf */ "./assets/pieces/rookv3.gltf");
/* harmony import */ var _assets_pieces_pawnv3_gltf__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../../assets/pieces/pawnv3.gltf */ "./assets/pieces/pawnv3.gltf");
/* harmony import */ var _materials__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./materials */ "./src/view/materials.ts");
/* harmony import */ var _assets_piece_animations_pawn_animation_gltf__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ../../assets/piece-animations/pawn-animation.gltf */ "./assets/piece-animations/pawn-animation.gltf");
/* harmony import */ var _assets_piece_animations_rook_animation_gltf__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ../../assets/piece-animations/rook-animation.gltf */ "./assets/piece-animations/rook-animation.gltf");
/* harmony import */ var _assets_piece_animations_bishop_animation_gltf__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ../../assets/piece-animations/bishop-animation.gltf */ "./assets/piece-animations/bishop-animation.gltf");
/* harmony import */ var _assets_piece_animations_knight_animation_gltf__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ../../assets/piece-animations/knight-animation.gltf */ "./assets/piece-animations/knight-animation.gltf");
/* harmony import */ var _assets_piece_animations_queen_animation_gltf__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! ../../assets/piece-animations/queen-animation.gltf */ "./assets/piece-animations/queen-animation.gltf");














const gameAssets = async (scene) => {
    const materials = (0,_materials__WEBPACK_IMPORTED_MODULE_8__.createMeshMaterials)(scene);
    //Game Scene
    let meshesToLoad = [_assets_pieces_kingv3_gltf__WEBPACK_IMPORTED_MODULE_2__, _assets_pieces_queenv3_gltf__WEBPACK_IMPORTED_MODULE_3__, _assets_pieces_knightv3_gltf__WEBPACK_IMPORTED_MODULE_5__, _assets_pieces_bishopv3_gltf__WEBPACK_IMPORTED_MODULE_4__, _assets_pieces_rookv3_gltf__WEBPACK_IMPORTED_MODULE_6__, _assets_pieces_pawnv3_gltf__WEBPACK_IMPORTED_MODULE_7__];
    const loadedBoardMesh = await babylonjs__WEBPACK_IMPORTED_MODULE_0__.SceneLoader.ImportMeshAsync("", _assets_board_gltf__WEBPACK_IMPORTED_MODULE_1__, "");
    const loadedMeshes = await Promise.all(meshesToLoad.map((mesh) => babylonjs__WEBPACK_IMPORTED_MODULE_0__.SceneLoader.ImportMeshAsync("", mesh, "")));
    const loadedPawnAnimation = await babylonjs__WEBPACK_IMPORTED_MODULE_0__.SceneLoader.ImportMeshAsync("", _assets_piece_animations_pawn_animation_gltf__WEBPACK_IMPORTED_MODULE_9__, "");
    loadedPawnAnimation.animationGroups.forEach((animation) => {
        animation.loopAnimation = false;
    });
    const loadedRookAnimation = await babylonjs__WEBPACK_IMPORTED_MODULE_0__.SceneLoader.ImportMeshAsync("", _assets_piece_animations_rook_animation_gltf__WEBPACK_IMPORTED_MODULE_10__, "");
    loadedRookAnimation.animationGroups.forEach((animation) => {
        animation.loopAnimation = false;
    });
    const loadedBishopAnimation = await babylonjs__WEBPACK_IMPORTED_MODULE_0__.SceneLoader.ImportMeshAsync("", _assets_piece_animations_bishop_animation_gltf__WEBPACK_IMPORTED_MODULE_11__, "");
    loadedBishopAnimation.animationGroups.forEach((animation) => {
        animation.loopAnimation = false;
    });
    const loadedKnightAnimation = await babylonjs__WEBPACK_IMPORTED_MODULE_0__.SceneLoader.ImportMeshAsync("", _assets_piece_animations_knight_animation_gltf__WEBPACK_IMPORTED_MODULE_12__, "");
    loadedKnightAnimation.animationGroups.forEach((animation) => {
        animation.loopAnimation = false;
    });
    const loadedQueenAnimation = await babylonjs__WEBPACK_IMPORTED_MODULE_0__.SceneLoader.ImportMeshAsync("", _assets_piece_animations_queen_animation_gltf__WEBPACK_IMPORTED_MODULE_13__, "");
    loadedQueenAnimation.animationGroups.forEach((animation) => {
        animation.loopAnimation = false;
    });
    const piecesMeshes = [];
    const boardMeshes = [];
    const animations = {
        Pawn: loadedPawnAnimation,
        Rook: loadedRookAnimation,
        Bishop: loadedBishopAnimation,
        Knight: loadedKnightAnimation,
        Queen: loadedQueenAnimation,
    };
    const loadMeshSettings = (mesh, color) => {
        const name = mesh.meshes[1].id;
        let finalMesh = mesh.meshes[1].clone(name, null);
        finalMesh.name = name;
        finalMesh.color = color;
        finalMesh.isPickable = true;
        (finalMesh.isVisible = false), (finalMesh.scalingDeterminant = 50);
        finalMesh.position.y = 0.5;
        finalMesh.name === "Knight" && finalMesh.color === "White"
            ? (finalMesh.rotation = new babylonjs__WEBPACK_IMPORTED_MODULE_0__.Vector3(0, Math.PI, 0))
            : null;
        finalMesh.color === "White"
            ? (finalMesh.material = materials.white)
            : (finalMesh.material = materials.black);
        return piecesMeshes.push(finalMesh);
    };
    //Sort the loaded meshes
    loadedMeshes.forEach((mesh) => {
        loadMeshSettings(mesh, "White");
        loadMeshSettings(mesh, "Black");
    });
    loadedBoardMesh.meshes.forEach((mesh, idx) => {
        mesh.isPickable = false;
        if (idx !== 1) {
            mesh.material = materials.board;
        }
        boardMeshes.push(mesh);
    });
    return { piecesMeshes, boardMeshes, animations };
};


/***/ }),

/***/ "./src/view/game-scene.ts":
/*!********************************!*\
  !*** ./src/view/game-scene.ts ***!
  \********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "gameScene": () => (/* binding */ gameScene)
/* harmony export */ });
/* harmony import */ var babylonjs__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! babylonjs */ "./node_modules/babylonjs/babylon.js");
/* harmony import */ var babylonjs__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(babylonjs__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _assets_space_webp__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../assets/space.webp */ "./assets/space.webp");
/* harmony import */ var _game_assets__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./game-assets */ "./src/view/game-assets.ts");
/* harmony import */ var _materials__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./materials */ "./src/view/materials.ts");




const gameScene = async (canvas, engine) => {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w;
    const scene = new babylonjs__WEBPACK_IMPORTED_MODULE_0__.Scene(engine);
    const camera = new babylonjs__WEBPACK_IMPORTED_MODULE_0__.ArcRotateCamera("camera", Math.PI, Math.PI / 4, 70, new babylonjs__WEBPACK_IMPORTED_MODULE_0__.Vector3(0, 0, 0), scene);
    camera.lowerRadiusLimit = 25;
    camera.upperRadiusLimit = 200;
    camera.attachControl(canvas, true);
    const light = new babylonjs__WEBPACK_IMPORTED_MODULE_0__.HemisphericLight("light", new babylonjs__WEBPACK_IMPORTED_MODULE_0__.Vector3(0, 100, 0), scene);
    light.intensity = 0.8;
    const light2 = new babylonjs__WEBPACK_IMPORTED_MODULE_0__.SpotLight("spotLight", new babylonjs__WEBPACK_IMPORTED_MODULE_0__.Vector3(0, 20, 30), new babylonjs__WEBPACK_IMPORTED_MODULE_0__.Vector3(0, 0, -30), 90, 1, scene);
    light2.intensity = 0.8;
    light2.diffuse = new babylonjs__WEBPACK_IMPORTED_MODULE_0__.Color3(0, 0, 0);
    const light3 = new babylonjs__WEBPACK_IMPORTED_MODULE_0__.SpotLight("spotLight2", new babylonjs__WEBPACK_IMPORTED_MODULE_0__.Vector3(0, 20, -30), new babylonjs__WEBPACK_IMPORTED_MODULE_0__.Vector3(0, 0, 30), 90, 1, scene);
    light3.intensity = 0.8;
    light3.diffuse = new babylonjs__WEBPACK_IMPORTED_MODULE_0__.Color3(0, 0, 0);
    const photoDome = new babylonjs__WEBPACK_IMPORTED_MODULE_0__.PhotoDome("spaceDome", _assets_space_webp__WEBPACK_IMPORTED_MODULE_1__, { size: 500 }, scene);
    photoDome.rotation = new babylonjs__WEBPACK_IMPORTED_MODULE_0__.Vector3(0, 1, 1.5);
    (0,_materials__WEBPACK_IMPORTED_MODULE_3__.createMovementMaterials)(scene);
    scene.finalMeshes = await (0,_game_assets__WEBPACK_IMPORTED_MODULE_2__.gameAssets)(scene);
    //#region Animations
    //Pawn Animations
    const pawnAnimationContainer = new babylonjs__WEBPACK_IMPORTED_MODULE_0__.AssetContainer(scene);
    (_b = (_a = scene.finalMeshes) === null || _a === void 0 ? void 0 : _a.animations) === null || _b === void 0 ? void 0 : _b.Pawn.meshes.forEach((mesh) => pawnAnimationContainer.meshes.push(mesh));
    (_d = (_c = scene.finalMeshes) === null || _c === void 0 ? void 0 : _c.animations) === null || _d === void 0 ? void 0 : _d.Pawn.animationGroups.forEach((anim) => pawnAnimationContainer.animationGroups.push(anim));
    // pawnAnimationContainer.meshes.forEach(mesh => mesh.)
    pawnAnimationContainer.removeAllFromScene();
    // Rook Animations
    const rookAnimationContainer = new babylonjs__WEBPACK_IMPORTED_MODULE_0__.AssetContainer(scene);
    (_f = (_e = scene.finalMeshes) === null || _e === void 0 ? void 0 : _e.animations) === null || _f === void 0 ? void 0 : _f.Rook.meshes.forEach((mesh) => rookAnimationContainer.meshes.push(mesh));
    (_h = (_g = scene.finalMeshes) === null || _g === void 0 ? void 0 : _g.animations) === null || _h === void 0 ? void 0 : _h.Rook.animationGroups.forEach((anim) => rookAnimationContainer.animationGroups.push(anim));
    rookAnimationContainer.removeAllFromScene();
    // Bishop Animations
    const bishopAnimationContainer = new babylonjs__WEBPACK_IMPORTED_MODULE_0__.AssetContainer(scene);
    (_k = (_j = scene.finalMeshes) === null || _j === void 0 ? void 0 : _j.animations) === null || _k === void 0 ? void 0 : _k.Bishop.meshes.forEach((mesh) => bishopAnimationContainer.meshes.push(mesh));
    (_m = (_l = scene.finalMeshes) === null || _l === void 0 ? void 0 : _l.animations) === null || _m === void 0 ? void 0 : _m.Bishop.animationGroups.forEach((anim) => bishopAnimationContainer.animationGroups.push(anim));
    bishopAnimationContainer.removeAllFromScene();
    // Knight Animations
    const knightAnimationContainer = new babylonjs__WEBPACK_IMPORTED_MODULE_0__.AssetContainer(scene);
    (_p = (_o = scene.finalMeshes) === null || _o === void 0 ? void 0 : _o.animations) === null || _p === void 0 ? void 0 : _p.Knight.meshes.forEach((mesh) => knightAnimationContainer.meshes.push(mesh));
    (_r = (_q = scene.finalMeshes) === null || _q === void 0 ? void 0 : _q.animations) === null || _r === void 0 ? void 0 : _r.Knight.animationGroups.forEach((anim) => knightAnimationContainer.animationGroups.push(anim));
    knightAnimationContainer.removeAllFromScene();
    // Queen Animations
    const queenAnimationContainer = new babylonjs__WEBPACK_IMPORTED_MODULE_0__.AssetContainer(scene);
    (_t = (_s = scene.finalMeshes) === null || _s === void 0 ? void 0 : _s.animations) === null || _t === void 0 ? void 0 : _t.Queen.meshes.forEach((mesh) => queenAnimationContainer.meshes.push(mesh));
    (_v = (_u = scene.finalMeshes) === null || _u === void 0 ? void 0 : _u.animations) === null || _v === void 0 ? void 0 : _v.Queen.animationGroups.forEach((anim) => queenAnimationContainer.animationGroups.push(anim));
    queenAnimationContainer.removeAllFromScene();
    //#endregion
    scene.animationsContainer = {
        Pawn: pawnAnimationContainer,
        Bishop: bishopAnimationContainer,
        Rook: rookAnimationContainer,
        Knight: knightAnimationContainer,
        Queen: queenAnimationContainer,
    };
    (_w = scene.finalMeshes) === null || _w === void 0 ? void 0 : _w.boardMeshes.forEach((mesh, idx) => {
        if (idx === 2) {
            const material = new babylonjs__WEBPACK_IMPORTED_MODULE_0__.StandardMaterial("light", scene);
            material.diffuseColor = new babylonjs__WEBPACK_IMPORTED_MODULE_0__.Color3(0.01, 0.01, 0.01);
            material.specularColor = new babylonjs__WEBPACK_IMPORTED_MODULE_0__.Color3(0.01, 0.01, 0.01);
            mesh.material = material;
        }
    });
    return scene;
};


/***/ }),

/***/ "./assets/piece-animations/bishop-animation.gltf":
/*!*******************************************************!*\
  !*** ./assets/piece-animations/bishop-animation.gltf ***!
  \*******************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

module.exports = __webpack_require__.p + "5d3772669d6fcd99641b.gltf";

/***/ }),

/***/ "./assets/piece-animations/knight-animation.gltf":
/*!*******************************************************!*\
  !*** ./assets/piece-animations/knight-animation.gltf ***!
  \*******************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

module.exports = __webpack_require__.p + "9a6cfc349a5f09f03531.gltf";

/***/ }),

/***/ "./assets/piece-animations/pawn-animation.gltf":
/*!*****************************************************!*\
  !*** ./assets/piece-animations/pawn-animation.gltf ***!
  \*****************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

module.exports = __webpack_require__.p + "49d63cd35abcc5954cfb.gltf";

/***/ }),

/***/ "./assets/piece-animations/queen-animation.gltf":
/*!******************************************************!*\
  !*** ./assets/piece-animations/queen-animation.gltf ***!
  \******************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

module.exports = __webpack_require__.p + "1ec3086b45597b25ee65.gltf";

/***/ }),

/***/ "./assets/piece-animations/rook-animation.gltf":
/*!*****************************************************!*\
  !*** ./assets/piece-animations/rook-animation.gltf ***!
  \*****************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

module.exports = __webpack_require__.p + "a694c3bce98c847a8321.gltf";

/***/ })

}]);
//# sourceMappingURL=src_view_game-scene_ts.js.map