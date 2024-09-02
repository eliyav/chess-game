import { Engine } from "@babylonjs/core/Engines/engine";
import type { ShadowGenerator } from "@babylonjs/core/Lights/Shadows/shadowGenerator";
import { AbstractMesh } from "@babylonjs/core/Meshes/abstractMesh";
import { Scene } from "@babylonjs/core/scene";
import { AnimationContainer } from "../view/animation/create-animations";
import { createHomeScene } from "../view/home-scene";

export type CustomScene<T> = {
  scene: Scene;
  data: T;
};

export type GameScene = CustomScene<{
  meshesToRender: AbstractMesh[];
  animationsContainer: AnimationContainer;
  shadowGenerator: ShadowGenerator[];
}>;

export const enum Scenes {
  HOME,
  GAME,
}

export type ScenesDict = {
  [Scenes.HOME]?: CustomScene<{}>;
  [Scenes.GAME]?: GameScene;
};

export class SceneManager {
  private canvas: HTMLCanvasElement;
  private engine: Engine;
  private scenes: ScenesDict;
  private activeSceneId: Scenes;

  constructor({
    canvas,
    setInitialized,
  }: {
    canvas: HTMLCanvasElement;
    setInitialized: () => void;
  }) {
    this.canvas = canvas;
    this.engine = new Engine(canvas, true);
    this.scenes = {};
    this.activeSceneId = Scenes.HOME;
    this.initHomeScene({ setInitialized });
    this.render();
    window.addEventListener("resize", () => this.engine?.resize());
    this.initGameScene();
  }

  public switchScene<T extends Scenes>(scene: T): ScenesDict[T] | undefined {
    this.detachScene(this.activeSceneId);
    return this.setScene(scene);
  }

  private setScene<T extends Scenes>(scene: T): ScenesDict[T] | undefined {
    this.activeSceneId = scene;
    const currentScene = this.getScene(scene);
    if (currentScene) {
      currentScene.scene.attachControl();
      return currentScene;
    }
  }

  private detachScene(scene: Scenes) {
    const currentScene = this.getScene(scene);
    if (currentScene) {
      currentScene.scene.detachControl();
    }
  }

  public getScene<T extends Scenes>(scene: T): ScenesDict[T] | undefined {
    return this.scenes?.[scene];
  }

  private async initHomeScene({
    setInitialized,
  }: {
    setInitialized: () => void;
  }) {
    const homeScreen = await createHomeScene(this.engine);
    this.scenes[Scenes.HOME] = homeScreen;
    setInitialized();
  }

  private async initGameScene() {
    const { gameScene } = await import("../view/game-scene");
    this.scenes[Scenes.GAME] = await gameScene(this.canvas, this.engine);
  }

  private render() {
    this.engine.runRenderLoop(() => {
      const scene = this.scenes[this.activeSceneId];
      if (!scene) return;
      scene.scene.render();
    });
  }
}
