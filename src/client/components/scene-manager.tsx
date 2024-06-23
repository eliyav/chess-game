import { homeScene } from "../view/home-scene";
import { CustomScene } from "../view/game-assets";
import { Engine } from "@babylonjs/core/Engines/engine";

export type SceneTypes = {
  home?: CustomScene;
  game?: CustomScene;
};

export class SceneManager {
  canvas: HTMLCanvasElement;
  engine: Engine;
  scenes: SceneTypes;
  activeScene: keyof SceneTypes;

  constructor({ canvas }: { canvas: HTMLCanvasElement }) {
    this.canvas = canvas;
    this.engine = new Engine(canvas, true);
    this.scenes = {};
    this.activeScene = "home";
  }

  public init() {
    this.loadHome();
    this.render();
    window.addEventListener("resize", () => this.engine.resize());
  }

  public async loadHome() {
    const homeScreen = await homeScene(this.engine, { id: this.activeScene });
    this.scenes.home = homeScreen;
    this.setScene("home");
  }

  public async loadGame() {
    const { gameScene } = await import("../view/game-scene");
    this.scenes.game = await gameScene(this.canvas, this.engine);
    this.setScene("game");
  }

  public switchScene(scene: keyof SceneTypes) {
    const currentScene = this.getScene();
    if (currentScene) {
      currentScene.detachControl();
    }
    this.setScene(scene);
  }

  private setScene(scene: keyof SceneTypes) {
    this.activeScene = scene;
  }

  private getScene() {
    return this.scenes[this.activeScene];
  }

  private render() {
    this.engine.runRenderLoop(() => {
      const scene = this.getScene();
      if (!scene) return;
      scene.render();
    });
  }
}
