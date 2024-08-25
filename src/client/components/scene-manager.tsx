import { homeScene } from "../view/home-scene";
import { Engine } from "@babylonjs/core/Engines/engine";
import { AbstractMesh } from "@babylonjs/core/Meshes/abstractMesh";
import { AnimationContainer } from "../view/animation/create-animations";
import { Scene } from "@babylonjs/core/scene";

export interface CustomScene<T> {
  scene: Scene;
  custom: T;
}

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
  private canvas?: HTMLCanvasElement;
  private engine?: Engine;
  private scenes: ScenesDict;
  private activeScene: Scenes;
  private initialized: boolean;

  constructor() {
    this.initialized = false;
    this.scenes = {};
    this.activeScene = Scenes.HOME;
  }

  public init({ canvas }: { canvas: HTMLCanvasElement }) {
    if (this.initialized) return this;
    this.initialized = true;
    this.canvas = canvas;
    this.engine = new Engine(canvas, true);
    this.loadHome();
    this.render();
    window.addEventListener("resize", () => this.engine?.resize());
    this.loadGame();
    return this;
  }

  public switchScene(scene: Scenes) {
    const currentScene = this.getScene();
    if (currentScene) {
      currentScene.detachControl();
    }
    this.setScene(scene);
  }

  private setScene(scene: Scenes) {
    this.activeScene = scene;
    const currentScene = this.getScene();
    if (currentScene) {
      currentScene.attachControl();
    }
  }

  public getScene(scene?: Scenes) {
    return this.scenes[scene || this.activeScene]!;
  }

  private async loadHome() {
    if (!this.engine) return;
    const homeScreen = await homeScene(this.engine, {
      id: this.activeScene,
    });
    this.scenes[Scenes.HOME] = homeScreen;
  }

  private async loadGame() {
    if (!this.canvas || !this.engine) return;
    const { gameScene } = await import("../view/game-scene");
    this.scenes[Scenes.GAME] = await gameScene(this.canvas, this.engine);
  }

  private render() {
    if (!this.engine) return;
    this.engine.runRenderLoop(() => {
      const scene = this.getScene();
      if (!scene) return;
      scene.scene.render();
    });
  }
}
