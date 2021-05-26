import board from "../assets/board.gltf";

const assetsLoader = async (BABYLON) => {
  const meshesToLoad = [board];

  const meshesLoader = await Promise.all(meshesToLoad.map((mesh) => BABYLON.SceneLoader.ImportMeshAsync("", mesh, "")));

  //const finalMeshList = [[], [], []];

  //   //Sort the loaded meshes
  //   meshesLoader.forEach((mesh) => {
  //     if (mesh.meshes[1].id.includes("-")) {
  //       let finalMesh = mesh.meshes[1];
  //       [finalMesh.$meshName, finalMesh.$teamName, finalMesh.isPickable = false] = finalMesh.id.split("-");

  //       return finalMesh.$teamName === "White"
  //         ? finalMeshList[0].push(finalMesh)
  //         : finalMesh.$teamName === "Black"
  //         ? finalMeshList[1].push(finalMesh)
  //         : finalMeshList[2].push(mesh.meshes);
  //     }
  //     mesh.meshes.forEach((mesh) => (mesh.isPickable = false));
  //     finalMeshList[2].push(mesh.meshes);
  //   });

  //   //Clone needed pieces
  //   const teams = 2;
  //   const clonesNeeded = {
  //     Pawn: 7,
  //     Rook: 1,
  //     Bishop: 1,
  //     Knight: 1,
  //   };

  //   for (let i = 0; i < teams; i++) {
  //     Object.entries(clonesNeeded).forEach(([key, value]) => {
  //       let meshToClone = finalMeshList[i].find((ele) => ele.$meshName === key);
  //       for (let j = 0; j < value; j++) {
  //         let clone = meshToClone.clone(key + " Clone " + j);
  //         finalMeshList[i].push(clone);
  //       }
  //     });
  //   }

  return;
};
export default assetsLoader;
