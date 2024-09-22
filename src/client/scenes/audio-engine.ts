import type { AudioEngine } from "@babylonjs/core/Audio/audioEngine";
import type { GameScene } from "./scene-manager";
import type { Scene } from "@babylonjs/core/scene";
import { Sound } from "@babylonjs/core/Audio";
import selectSound from "../../../assets/audio/click.mp3";
import crumbleSounds from "../../../assets/audio/crumble.mp3";

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
    const selectAudio = new Sound("select", selectSound, scene, null, {
      autoplay: false,
    });
    const crumbleAudio = new Sound("crumble", crumbleSounds, scene, null, {
      autoplay: false,
    });
    audioEngine.setGlobalVolume(0.5);
    selectAudio.setVolume(0.2);
    crumbleAudio.setVolume(0.2);
    gameScene.data.audio.select = selectAudio;
    gameScene.data.audio.crumble = crumbleAudio;
    document.removeEventListener("click", unlockAudio);
  });
}
