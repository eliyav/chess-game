import { Engine } from "@babylonjs/core/Engines/engine";
import type { ShadowGenerator } from "@babylonjs/core/Lights/Shadows/shadowGenerator";
import { AbstractMesh } from "@babylonjs/core/Meshes/abstractMesh";
import { Scene } from "@babylonjs/core/scene";
import { APP_ROUTES } from "../../shared/routes";
import { AnimationContainer } from "./animation/create-animations";
import { createGameScene } from "./game-scene";
import { createHomeScene } from "./home-scene";

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
  PROMOTION,
}

export type ScenesDict = {
  [Scenes.HOME]: CustomScene<{}>;
  [Scenes.GAME]: GameScene;
  [Scenes.PROMOTION]?: CustomScene<{}>;
};

const sceneRouting: Partial<Record<APP_ROUTES, { [state: string]: Scenes }>> = {
  [APP_ROUTES.GAME]: {
    ["/"]: Scenes.GAME,
    ["promote"]: Scenes.PROMOTION,
  },
  [APP_ROUTES.HOME]: {
    ["/"]: Scenes.HOME,
  },
  [APP_ROUTES.LOBBY_SELECT]: {
    ["/"]: Scenes.HOME,
  },
  [APP_ROUTES.LOBBY]: {
    ["/"]: Scenes.HOME,
  },
};

export async function createSceneManager(canvas: HTMLCanvasElement) {
  const engine = new Engine(canvas, true);
  const [homeScene, gameScene] = await Promise.all([
    createHomeScene(engine),
    createGameScene(canvas, engine),
  ]);
  return new SceneManager({
    engine,
    homeScene,
    gameScene,
  });
}

export class SceneManager {
  private engine: Engine;
  private scenes: ScenesDict;
  private activeSceneId: Scenes;

  constructor({
    homeScene,
    gameScene,
    engine,
  }: {
    engine: Engine;
    homeScene: ScenesDict[Scenes.HOME];
    gameScene: ScenesDict[Scenes.GAME];
  }) {
    this.engine = engine;
    this.activeSceneId = Scenes.HOME;
    this.scenes = { [Scenes.HOME]: homeScene, [Scenes.GAME]: gameScene };
    this.render();
    window.addEventListener("resize", () => this.engine?.resize());
  }

  public getScene<T extends Scenes>(scene: T): ScenesDict[T] {
    return this.scenes[scene];
  }

  public switchScene(path: APP_ROUTES, state?: string) {
    const id = this.getActiveSceneId(path, state);
    this.detachScene(this.activeSceneId);
    return this.setScene(id);
  }

  private getActiveSceneId(path: APP_ROUTES, state?: string) {
    return sceneRouting[path]?.[state ?? "/"] ?? Scenes.HOME;
  }

  private setScene<T extends Scenes>(scene: T): ScenesDict[T] {
    this.activeSceneId = scene;
    const currentScene = this.getScene(scene);
    currentScene?.scene.attachControl();
    return currentScene;
  }

  private detachScene(scene: Scenes) {
    const currentScene = this.getScene(scene);
    if (currentScene) {
      currentScene.scene.detachControl();
    }
  }

  private render() {
    this.engine.runRenderLoop(() => {
      const scene = this.scenes[this.activeSceneId];
      if (!scene) return;
      scene.scene.render();
    });
  }
}
