import * as BABYLON from "babylonjs";
import { homeScene } from "../view/home-scene";
import { CustomScene } from "../view/game-assets";

export type SceneTypes = "home" | "game";

export class SceneManager {
  canvasRef: HTMLCanvasElement;
  engine: BABYLON.Engine;
  homeScreen: CustomScene | null;
  gameScreen: CustomScene | null;
  isInitDone: boolean;
  activeScene: { id: SceneTypes };

  constructor(canvasRef: HTMLCanvasElement) {
    this.canvasRef = canvasRef;
    this.engine = new BABYLON.Engine(canvasRef, true);
    this.activeScene = { id: "home" };
    this.homeScreen = null;
    this.gameScreen = null;
    this.isInitDone = false;
    this.init();
  }

  async init() {
    await this.loadHome();
    this.render();

    window.addEventListener("resize", () => this.resize());
  }

  async loadHome() {
    const homeScreen = await homeScene(this.engine, this.activeScene);
    this.homeScreen = homeScreen;
  }

  async loadGame() {
    const { gameScene } = await import("../view/game-scene");
    this.gameScreen = await gameScene(this.canvasRef, this.engine);
    this.activeScene.id = "game";
  }

  render() {
    this.engine.runRenderLoop(() => {
      switch (this.activeScene.id) {
        case "home":
          this.homeScreen?.render();
          break;
        case "game":
          this.gameScreen!.render();
          break;
      }
    });
  }

  stopRender() {
    this.engine.stopRenderLoop();
  }

  resize() {
    this.engine.resize();
  }
}
