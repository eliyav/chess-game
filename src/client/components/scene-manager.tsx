import { homeScene } from "../view/home-scene";
import { CustomScene } from "../view/game-assets";
import { Engine } from "@babylonjs/core/Engines/engine";

export enum Scenes {
  HOME = "HOME",
  GAME = "GAME",
}

export type ScenesDict = {
  [key in Scenes]: CustomScene | null;
};

export class SceneManager {
  canvas: HTMLCanvasElement;
  engine: Engine;
  scenes: ScenesDict;
  activeScene: Scenes;

  constructor({ canvas }: { canvas: HTMLCanvasElement }) {
    this.canvas = canvas;
    this.engine = new Engine(canvas, true);
    this.scenes = { HOME: null, GAME: null };
    this.activeScene = Scenes.HOME;
  }

  public init() {
    this.loadScene(Scenes.HOME);
    this.render();
    window.addEventListener("resize", () => this.engine.resize());
  }

  public async loadScene(scene: Scenes) {
    if (scene === "HOME") {
      await this.loadHome();
    } else if (scene === "GAME") {
      await this.loadGame();
    }
    this.switchScene(scene);
  }

  public switchScene(scene: Scenes) {
    const currentScene = this.getScene();
    if (currentScene) {
      currentScene.detachControl();
    }
    this.setScene(scene);
  }

  private async loadHome() {
    const homeScreen = await homeScene(this.engine, {
      id: this.activeScene,
    });
    this.scenes.HOME = homeScreen;
  }

  private async loadGame() {
    const { gameScene } = await import("../view/game-scene");
    this.scenes.GAME = await gameScene(this.canvas, this.engine);
  }

  private setScene(scene: Scenes) {
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
