import type { AudioEngine } from "@babylonjs/core/Audio/audioEngine";
import type { GameScene } from "./scene-manager";
import type { Scene } from "@babylonjs/core/scene";
import { Sound } from "@babylonjs/core/Audio";
import selectSound from "../../../assets/audio/click.mp3";

export function handleAudioEngine({
  audioEngine,
  gameScene,
  scene,
}: {
  audioEngine: AudioEngine;
  gameScene: GameScene;
  scene: Scene;
}): void {
  function unlockAudio() {
    audioEngine.unlock();
  }
  document.addEventListener("click", unlockAudio);

  audioEngine.onAudioUnlockedObservable.add(() => {
    audioEngine.setGlobalVolume(0.5);
    const selectAudio = new Sound("select", selectSound, scene, null, {
      autoplay: false,
    });
    gameScene.data.audio.select = selectAudio;
    document.removeEventListener("click", unlockAudio);
  });
}
