const assetTransforms = async (meshList, chessData) => {
  //#region temp scaling
  meshList[2][0][1].scalingDeterminant = 50;
  meshList[2][0][2].scalingDeterminant = 50;
  meshList[2][0][3].scalingDeterminant = 50;
  meshList.forEach((array) => array.forEach((mesh) => (mesh.scalingDeterminant = 50)));
  //#endregion

  chessData.pieceInitialPoints.forEach((array, index) =>
    array.forEach((dataForPiece, index2) => {
      const { name, color, points } = dataForPiece;
      const filteredPieces = meshList.flat().filter((mesh) => mesh.color === color && mesh.name === name);
      const gridFilteredPositions = chessData.gridInitialPoints[index][index2];
      points.forEach((point, idx) => {
        const gridPoint = gridFilteredPositions.points[idx];
        filteredPieces[idx].point = [point[0], point[1]];
        filteredPieces[idx].position.x = gridPoint[0];
        filteredPieces[idx].position.z = gridPoint[1];
      });
    })
  );
};

export default assetTransforms;
