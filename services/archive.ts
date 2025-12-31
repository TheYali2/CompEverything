import JSZip from 'jszip';

export const compressToZip = async (file: File): Promise<Blob> => {
  const zip = new JSZip();
  zip.file(file.name, file);

  const blob = await zip.generateAsync({
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: {
      level: 9
    }
  });

  return blob;
};