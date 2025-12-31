import { PDFDocument } from 'pdf-lib';

export const compressPDF = async (file: File): Promise<Blob> => {
  try {
    const arrayBuffer = await file.arrayBuffer();

    const pdfDoc = await PDFDocument.load(arrayBuffer);

    const compressedBytes = await pdfDoc.save({
      useObjectStreams: true,
      addDefaultPage: false
    });

    return new Blob([compressedBytes], { type: 'application/pdf' });
  } catch (error) {
    console.error("PDF Compression failed", error);
    throw error;
  }
};
