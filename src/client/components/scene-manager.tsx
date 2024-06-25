import { homeScene } from "../view/home-scene";
import { CustomScene } from "../view/game-assets";
import { Engine } from "@babylonjs/core/Engines/engine";

export const enum Scenes {
  HOME,
  GAME,
}

export type ScenesDict = {
  [key in Scenes]?: CustomScene | null;
};

export class SceneManager {
  private canvas: HTMLCanvasElement;
  private engine: Engine;
  private scenes: ScenesDict;
  private activeScene: Scenes;

  constructor({ canvas }: { canvas: HTMLCanvasElement }) {
    this.canvas = canvas;
    this.engine = new Engine(canvas, true);
    this.scenes = {};
    this.activeScene = Scenes.HOME;
  }

  public init() {
    this.loadScene(Scenes.HOME);
    this.render();
    window.addEventListener("resize", () => this.engine.resize());
    return this;
  }

  public async loadScene(scene: Scenes) {
    if (scene === Scenes.HOME) {
      await this.loadHome();
    } else if (scene === Scenes.GAME) {
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

  public getScene(scene?: Scenes) {
    return this.scenes[scene || this.activeScene]!;
  }

  private async loadHome() {
    const homeScreen = await homeScene(this.engine, {
      id: this.activeScene,
    });
    this.scenes[Scenes.HOME] = homeScreen;
  }

  private async loadGame() {
    const { gameScene } = await import("../view/game-scene");
    this.scenes[Scenes.GAME] = await gameScene(this.canvas, this.engine);
  }

  private setScene(scene: Scenes) {
    this.activeScene = scene;
    const currentScene = this.getScene();
    if (currentScene) {
      currentScene.attachControl();
    }
  }

  private render() {
    this.engine.runRenderLoop(() => {
      const scene = this.getScene();
      console.log(scene);
      if (!scene) return;
      scene.render();
    });
  }
}
