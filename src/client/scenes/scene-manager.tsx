import { AudioEngine } from "@babylonjs/core/Audio/audioEngine";
import type { Sound } from "@babylonjs/core/Audio/sound";
import { Engine } from "@babylonjs/core/Engines/engine";
import type { ShadowGenerator } from "@babylonjs/core/Lights/Shadows/shadowGenerator";
import { AbstractMesh } from "@babylonjs/core/Meshes/abstractMesh";
import { Scene } from "@babylonjs/core/scene";
import { AnimationContainer } from "./animation/create-animations";
import { createHomeScene } from "./home-scene";
import { APP_ROUTES } from "../../shared/routes";

export type CustomScene<T> = {
  scene: Scene;
  data: T;
};

export type GameScene = CustomScene<{
  meshesToRender: AbstractMesh[];
  animationsContainer: AnimationContainer;
  shadowGenerator: ShadowGenerator[];
  audio: {
    select?: Sound;
    crumble?: Sound;
  };
}>;

export const enum Scenes {
  HOME,
  GAME,
  PROMOTION,
}

export type ScenesDict = {
  [Scenes.HOME]?: CustomScene<{}>;
  [Scenes.GAME]?: GameScene;
  [Scenes.PROMOTION]?: CustomScene<{}>;
};

const sceneRouting: Record<APP_ROUTES, { [state: string]: Scenes }> = {
  [APP_ROUTES.Game]: {
    ["/"]: Scenes.GAME,
    ["promote"]: Scenes.PROMOTION,
  },
  [APP_ROUTES.Home]: {
    ["/"]: Scenes.HOME,
  },
  [APP_ROUTES.Lobby]: {
    ["/"]: Scenes.HOME,
  },
  [APP_ROUTES.OnlineLobby]: {
    ["/"]: Scenes.HOME,
  },
  [APP_ROUTES.OfflineLobby]: {
    ["/"]: Scenes.HOME,
  },
  [APP_ROUTES.NotFound]: {
    ["/"]: Scenes.HOME,
  },
};

export class SceneManager {
  private canvas: HTMLCanvasElement;
  private engine: Engine;
  private scenes: ScenesDict;
  private activeSceneId: Scenes;
  private audioEngine: AudioEngine;

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
    this.audioEngine = new AudioEngine(null, window.AudioContext);
    this.initGameScene();
  }

  public getScene<T extends Scenes>(scene: T): ScenesDict[T] | undefined {
    return this.scenes?.[scene];
  }

  public switchScene(path: APP_ROUTES, state?: string) {
    const id = this.getActiveSceneId(path, state);
    this.detachScene(this.activeSceneId);
    return this.setScene(id);
  }

  private getActiveSceneId(path: APP_ROUTES, state?: string) {
    return sceneRouting[path]?.[state ?? "/"];
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
    const { gameScene } = await import("./game-scene");
    this.scenes[Scenes.GAME] = await gameScene(
      this.canvas,
      this.engine,
      this.audioEngine
    );
  }

  private render() {
    this.engine.runRenderLoop(() => {
      const scene = this.scenes[this.activeSceneId];
      if (!scene) return;
      scene.scene.render();
    });
  }
}
