import { createHomeScene } from "../view/home-scene";
import { Engine } from "@babylonjs/core/Engines/engine";
import { AbstractMesh } from "@babylonjs/core/Meshes/abstractMesh";
import { AnimationContainer } from "../view/animation/create-animations";
import { Scene } from "@babylonjs/core/scene";

export type CustomScene<T> = {
  scene: Scene;
  data: T;
  requestAnimation?: () => void;
};

export type GameScene = CustomScene<{
  finalMeshes: {
    piecesMeshes: ChessPieceMesh[];
    boardMeshes: AbstractMesh[];
  };
  meshesToRender: AbstractMesh[];
  animationsContainer: AnimationContainer;
}>;

export const enum Scenes {
  HOME,
  GAME,
}

export type ScenesDict = {
  [Scenes.HOME]?: CustomScene<{}>;
  [Scenes.GAME]?: GameScene;
};

export interface ChessPieceMesh extends AbstractMesh {
  name: string;
  color?: string;
}

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
    this.loadGame();
  }

  public switchScene(scene: Scenes) {
    this.detachScene(this.activeSceneId);
    this.setScene(scene);
  }

  private setScene(scene: Scenes) {
    this.activeSceneId = scene;
    const currentScene = this.getScene(scene);
    if (currentScene) {
      currentScene.scene.attachControl();
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

  private async loadGame() {
    const { gameScene } = await import("../view/game-scene");
    this.scenes[Scenes.GAME] = await gameScene(this.canvas, this.engine);
  }

  private render() {
    this.engine.runRenderLoop(() => {
      const scene = this.scenes[this.activeSceneId];
      if (!scene) return;
      scene.requestAnimation?.();
      scene.scene.render();
    });
  }
}
