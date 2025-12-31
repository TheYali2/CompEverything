import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2 } from 'lucide-react';
import { DropZone } from './components/DropZone';
import { FileCard } from './components/FileCard';
import { Toast } from './components/Toast';
import { compressImage } from './services/compression';
import { minifyCode } from './services/minification';
import { compressPDF } from './services/pdf';
import { compressToZip } from './services/archive';
import { CompressedFile, FileType } from './types';
import { v4 as uuidv4 } from 'uuid';

function App() {
  const activeTab: FileType = 'ARCHIVE';
  const [files, setFiles] = useState<CompressedFile[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const processFile = async (fileId: string, file: File, type: FileType) => {
    setFiles(prev => prev.map(f => f.id === fileId ? { ...f, status: 'COMPRESSING', progress: 0 } : f));

    const updateProgress = (progress: number) => {
      setFiles(prev => prev.map(f => f.id === fileId ? { ...f, progress } : f));
    };

    try {
      let compressedBlob: Blob;

      if (type === 'IMAGE') {
        if (file.type === 'image/svg+xml' || file.name.toLowerCase().endsWith('.svg')) {
          updateProgress(50);
          compressedBlob = await minifyCode(file);
        } else {
          compressedBlob = await compressImage(file, updateProgress);
        }
      } else if (type === 'CODE') {
        updateProgress(50);
        compressedBlob = await minifyCode(file);
      } else if (type === 'PDF') {
        updateProgress(30);
        compressedBlob = await compressPDF(file);
      } else if (type === 'ARCHIVE') {
        updateProgress(40);
        compressedBlob = await compressToZip(file);
      } else {
        throw new Error("Unsupported Type");
      }

      if (compressedBlob.size >= file.size) {
        setFiles(prev => prev.map(f => f.id === fileId ? {
          ...f,
          status: 'ERROR',
          error: 'Result larger than original'
        } : f));
        setToastMessage(`Could not compress "${file.name}" effectively (Result was larger).`);
        return;
      }

      updateProgress(100);

      setFiles(prev => prev.map(f => f.id === fileId ? {
        ...f,
        status: 'DONE',
        compressedBlob,
        compressedSize: compressedBlob.size,
        progress: 100
      } : f));
    } catch (error) {
      console.error(error);
      setFiles(prev => prev.map(f => f.id === fileId ? { ...f, status: 'ERROR', error: 'Failed' } : f));
      setToastMessage(`Error processing "${file.name}".`);
    }
  };

  const handleFilesDropped = useCallback(async (droppedFiles: File[]) => {
    const newFilesRecords: CompressedFile[] = droppedFiles.map(file => ({
      id: uuidv4(),
      originalFile: file,
      compressedBlob: null,
      status: 'IDLE',
      originalSize: file.size,
      compressedSize: 0,
      progress: 0,
      type: activeTab
    }));

    setFiles(prev => [...newFilesRecords, ...prev]);

    await Promise.all(newFilesRecords.map(record =>
      processFile(record.id, record.originalFile, activeTab)
    ));

  }, [activeTab]);

  const clearHistory = () => {
    setFiles([]);
  };

  return (
    <div className="min-h-screen p-4 md:p-8 font-sans text-slate-100 selection:bg-primary/30 flex flex-col items-center">

      <div className="fixed inset-0 pointer-events-none z-[-1]">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl mix-blend-screen animate-pulse" style={{ animationDuration: '4s' }}></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-3xl mix-blend-screen animate-pulse" style={{ animationDuration: '7s' }}></div>
      </div>

      <Toast message={toastMessage} onClose={() => setToastMessage(null)} />

      <div className="w-full max-w-5xl">
        <header className="flex flex-col items-center mb-10 pt-8 text-center relative">

          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-6xl font-bold mb-4 tracking-tight"
          >
            <span className="text-white">Comp</span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-purple-400 to-secondary animate-gradient bg-[length:200%_auto]">Everything</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-zinc-400 max-w-lg text-lg font-light leading-relaxed"
          >
            Fast, secure, and client-side.
          </motion.p>
        </header>

        <DropZone
          onFilesDropped={handleFilesDropped}
          activeType={activeTab}
          accept="*"
        />

        <AnimatePresence>
          {files.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="flex justify-end w-full mb-4"
            >
              <button
                onClick={clearHistory}
                className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all duration-300 text-sm font-medium border border-red-500/10 hover:border-red-500/30 group"
              >
                <Trash2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
                <span>Clear History</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 gap-3">
          <AnimatePresence mode="popLayout">
            {files.map((file) => (
              <FileCard key={file.id} file={file} />
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

export default App;