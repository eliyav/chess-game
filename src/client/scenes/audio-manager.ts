import selectSound from "../../../assets/audio/click.mp3";
import crumbleSounds from "../../../assets/audio/crumble.mp3";

type AudioBufferNames = "select" | "crumble";

export const audioManager = await createAudioManager();

async function createAudioManager() {
  const decodedBuffers: Partial<Record<AudioBufferNames, AudioBuffer>> = {};
  const audioSounds: { name: AudioBufferNames; path: string }[] = [
    { name: "select", path: selectSound },
    { name: "crumble", path: crumbleSounds },
  ];
  try {
    const audioContext = new window.AudioContext();
    if (!audioContext) {
      throw new Error("AudioContext not supported in this environment.");
    }

    audioSounds.forEach(async (sound) => {
      const arrayBuffer = await fetchAudio(sound.path);
      if (arrayBuffer) {
        decodedBuffers[sound.name] = await decodeAudio(
          audioContext,
          arrayBuffer
        );
      }
    });

    return {
      play: (bufferName: keyof typeof decodedBuffers) =>
        playBuffer({
          audioContext,
          buffer: decodedBuffers[bufferName],
          name: bufferName,
        }),
    };
  } catch (error) {
    console.error("Error creating AudioContext:", error);
  }
}

function playBuffer({
  audioContext,
  buffer,
  name,
}: {
  audioContext: AudioContext;
  buffer: AudioBuffer | undefined;
  name: string;
}) {
  if (!buffer) {
    console.warn(`Buffer ${name} is not loaded yet.`);
    return;
  }
  const source = createSource({
    audioContext,
    buffer,
  });
  source.start();
}

function createSource({
  audioContext,
  buffer,
}: {
  audioContext: AudioContext;
  buffer: AudioBuffer;
}) {
  const source = audioContext.createBufferSource();
  source.buffer = buffer;
  source.connect(audioContext.destination);
  source.onended = () => {
    source.disconnect();
  };
  return source;
}

function decodeAudio(audioContext: AudioContext, arrayBuffer: ArrayBuffer) {
  return new Promise<AudioBuffer>((resolve, reject) => {
    audioContext.decodeAudioData(arrayBuffer, resolve, reject);
  });
}

function fetchAudio(url: string) {
  return fetch(url)
    .then((response) => {
      if (!response.ok) {
        throw new Error(
          `Audio network response was not ok: ${response.statusText}`
        );
      }
      return response.arrayBuffer();
    })
    .catch((error) => {
      console.error("Error fetching audio file:", error);
    });
}
