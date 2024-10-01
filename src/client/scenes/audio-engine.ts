import type { AudioEngine } from "@babylonjs/core/Audio/audioEngine";
import type { GameScene } from "./scene-manager";
import type { Scene } from "@babylonjs/core/scene";
import { Sound } from "@babylonjs/core/Audio";
import selectSound from "../../../assets/audio/click.mp3";
import crumbleSounds from "../../../assets/audio/crumble.mp3";

export function handleAudioUnlock(audioEngine: AudioEngine) {
  function unlockAudio() {
    audioEngine.unlock();
  }
  document.addEventListener("click", unlockAudio);

  audioEngine.onAudioUnlockedObservable.add(() => {
    audioEngine.setGlobalVolume(0.5);
    document.removeEventListener("click", unlockAudio);
  });
}

export function gameSceneAudio({
  audioEngine,
  gameScene,
}: {
  audioEngine: AudioEngine;
  gameScene: GameScene;
}): void {
  audioEngine.onAudioUnlockedObservable.add(() => {
    const selectAudio = new Sound("select", selectSound, gameScene.scene);
    const crumbleAudio = new Sound("crumble", crumbleSounds, gameScene.scene);
    selectAudio.setVolume(0.5);
    crumbleAudio.setVolume(0.5);
    gameScene.data.audio.select = selectAudio;
    gameScene.data.audio.crumble = crumbleAudio;
  });
}
