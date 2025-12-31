import imageCompression from 'browser-image-compression';

export const compressImage = async (file: File, onProgress?: (p: number) => void): Promise<Blob> => {
  const options = {
    maxSizeMB: 1,
    maxWidthOrHeight: 1920,
    useWebWorker: true,
    initialQuality: 0.8,
    onProgress: (progress: number) => {
      if (onProgress) onProgress(progress);
    }
  };

  try {
    return await imageCompression(file, options);
  } catch (error) {
    throw error;
  }
};