import * as BABYLON from "babylonjs";
import * as GUI from "babylonjs-gui";
import assetsLoader from "./asset-loader";
import space from "../../assets/space.jpg";
import space2 from "../../assets/space2.jpg";
import blackMetal from "../../assets/black-metal.jpg";
import whiteMetal from "../../assets/white-metal.jpg";

const gameScreen = async (canvas, engine) => {
  const scene = new BABYLON.Scene(engine);
  const camera = new BABYLON.ArcRotateCamera("camera", -Math.PI / 1, Math.PI / 3.5, 30, new BABYLON.Vector3(0, 0, 0), scene);
  camera.attachControl(canvas, true);
  camera.useFramingBehavior = false;
  scene.meshesToRender = [];

  const light = new BABYLON.HemisphericLight("light3", new BABYLON.Vector3(0, 1, 0), scene);

  const greenMat = new BABYLON.StandardMaterial("greenMat", scene);

  const photoDome = new BABYLON.PhotoDome("spacedome", space, { size: 1000 }, scene);

  const materialWhite = new BABYLON.StandardMaterial("White", scene);
  materialWhite.diffuseTexture = new BABYLON.Texture(whiteMetal, scene);
  materialWhite.refractionTexture = new BABYLON.Texture(space2, scene);

  const materialBlack = new BABYLON.StandardMaterial("Black", scene);
  materialBlack.diffuseTexture = new BABYLON.Texture(blackMetal, scene);
  materialBlack.refractionTexture = new BABYLON.Texture(space2, scene);

  scene.finalMeshes = await assetsLoader(materialWhite, materialBlack);

  return scene;
};

export default gameScreen;
