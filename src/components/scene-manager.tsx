import * as BABYLON from "babylonjs";
import { CustomGameScene } from "../view/game-assets";
import { homeScene } from "../view/home-scene";

export class SceneManager {
  engine: BABYLON.Engine;
  scenes: CustomGameScene[];
  isInitDone: boolean;
  activeScene: number;

  constructor(canvasRef: HTMLCanvasElement) {
    this.engine = new BABYLON.Engine(canvasRef, true);
    this.scenes = [];
    this.isInitDone = false;
    this.activeScene = 0;
    this.init();
  }

  async init() {
    await this.loadHomeScreen();
    this.render();
  }

  async loadHomeScreen() {
    this.scenes.push(await homeScene(this.engine));
  }

  render() {
    this.engine.runRenderLoop(() => {
      this.scenes[this.activeScene].render();
    });
  }

  stopRender() {
    this.engine.stopRenderLoop();
  }

  resize() {
    this.engine.resize();
  }
}
