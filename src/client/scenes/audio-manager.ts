import {
  AudioEngineV2,
  CreateSoundAsync,
  StaticSound,
} from "@babylonjs/core/AudioV2/abstractAudio";
import { CreateAudioEngineAsync } from "@babylonjs/core/AudioV2/webAudio/webAudioEngine";
import selectSound from "../../../assets/audio/click.mp3";
import crumbleSounds from "../../../assets/audio/crumble.mp3";

export async function createAudioManager(): Promise<{
  audioEngine: AudioEngineV2;
  selectAudio: StaticSound;
  crumbleAudio: StaticSound;
}> {
  const audioEngine = await CreateAudioEngineAsync();

  const selectAudio = await CreateSoundAsync("select", selectSound, {
    volume: 0.5,
  });
  const crumbleAudio = await CreateSoundAsync("crumble", crumbleSounds, {
    volume: 0.5,
  });

  return {
    audioEngine,
    selectAudio,
    crumbleAudio,
  };
}

export const audioManager = await createAudioManager();
