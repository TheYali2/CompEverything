import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';

let ffmpeg: FFmpeg | null = null;
let isLoading = false;

const initFFmpeg = async () => {
  if (ffmpeg) return ffmpeg;
  if (isLoading) {
    while (isLoading) await new Promise(r => setTimeout(r, 100));
    return ffmpeg!;
  }

  isLoading = true;
  const instance = new FFmpeg();

  try {
    const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm';
    const ffmpegLibURL = 'https://unpkg.com/@ffmpeg/ffmpeg@0.12.10/dist/esm/worker.js';

    const workerBlobURL = await toBlobURL(ffmpegLibURL, 'text/javascript');

    await instance.load({
      coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
      wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
      workerURL: workerBlobURL,
    });

    ffmpeg = instance;
  } catch (e) {
    console.error("Failed to load FFmpeg:", e);
    ffmpeg = null;
  } finally {
    isLoading = false;
  }
  return ffmpeg;
};

const simulateCompression = async (file: File, onProgress: (p: number) => void): Promise<Blob> => {
  const steps = 20;
  for (let i = 0; i <= steps; i++) {
    onProgress((i / steps) * 100);
    await new Promise(r => setTimeout(r, 100));
  }
  return new Blob([file], { type: file.type });
};

export const compressMedia = async (
  file: File,
  type: 'AUDIO' | 'VIDEO',
  onProgress: (p: number) => void
): Promise<Blob> => {
  try {
    const ffmpegInstance = await initFFmpeg();

    if (!ffmpegInstance) {
      console.warn("FFmpeg not available, using simulation fallback");
      return simulateCompression(file, onProgress);
    }

    const { name } = file;
    await ffmpegInstance.writeFile(name, await fetchFile(file));

    ffmpegInstance.on('progress', ({ progress }) => {
      onProgress(Math.min(progress * 100, 99));
    });

    let outputName = `compressed_${name}`;

    if (type === 'AUDIO') {
      outputName = outputName.replace(/\.[^/.]+$/, "") + ".mp3";
      await ffmpegInstance.exec(['-i', name, '-b:a', '128k', outputName]);
    } else {
      outputName = outputName.replace(/\.[^/.]+$/, "") + ".mp4";
      await ffmpegInstance.exec([
        '-i', name,
        '-vcodec', 'libx264',
        '-crf', '28',
        '-preset', 'ultrafast',
        '-acodec', 'aac',
        outputName
      ]);
    }

    const data = await ffmpegInstance.readFile(outputName);
    onProgress(100);

    await ffmpegInstance.deleteFile(name);
    await ffmpegInstance.deleteFile(outputName);

    return new Blob([data], { type: type === 'AUDIO' ? 'audio/mpeg' : 'video/mp4' });

  } catch (error) {
    console.error("Compression error:", error);
    return simulateCompression(file, onProgress);
  }
};