
export type FileType = 'IMAGE' | 'CODE' | 'PDF' | 'ARCHIVE';

export type CompressionStatus = 'IDLE' | 'COMPRESSING' | 'DONE' | 'ERROR';

export interface CompressedFile {
  id: string;
  originalFile: File;
  compressedBlob: Blob | null;
  status: CompressionStatus;
  originalSize: number;
  compressedSize: number;
  progress: number;
  type: FileType;
  error?: string;
}

export interface CompressionStats {
  totalOriginal: number;
  totalCompressed: number;
  filesCount: number;
}