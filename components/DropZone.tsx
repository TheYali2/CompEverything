import React, { useCallback, useState } from 'react';
import { Upload, FileCode, Image as ImageIcon, FileText, Archive } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileType } from '../types';

interface DropZoneProps {
  onFilesDropped: (files: File[]) => void;
  accept: string;
  activeType: FileType;
}

export const DropZone: React.FC<DropZoneProps> = ({ onFilesDropped, accept, activeType }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFilesDropped(Array.from(e.dataTransfer.files));
    }
  }, [onFilesDropped]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFilesDropped(Array.from(e.target.files));
    }
  }, [onFilesDropped]);

  const getIcon = () => {
    const props = { className: "w-12 h-12 stroke-[1.5]" };
    switch (activeType) {
      case 'IMAGE': return <ImageIcon {...props} />;
      case 'CODE': return <FileCode {...props} />;
      case 'PDF': return <FileText {...props} />;
      case 'ARCHIVE': return <Archive {...props} />;
      default: return <Upload {...props} />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full mb-10"
    >
      <label
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          relative flex flex-col items-center justify-center w-full h-56 
          rounded-3xl cursor-pointer transition-all duration-500 overflow-hidden group
          border border-dashed
          ${isDragging 
            ? 'border-primary bg-primary/5 scale-[1.01]' 
            : 'border-zinc-700 hover:border-zinc-500 bg-white/[0.02] hover:bg-white/[0.04]'
          }
        `}
      >
        <div className={`absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10 transition-opacity duration-500 ${isDragging ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`} />
        
        <div className="flex flex-col items-center justify-center z-10 p-6 text-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeType}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className={`mb-5 p-4 rounded-2xl bg-gradient-to-br from-zinc-800 to-zinc-900 shadow-xl border border-zinc-700/50 text-zinc-300 group-hover:text-primary group-hover:scale-110 transition-all duration-300`}
            >
              {getIcon()}
            </motion.div>
          </AnimatePresence>
          
          <h3 className="text-xl font-semibold text-zinc-200 mb-1 group-hover:text-white transition-colors">
            Drop your files here
          </h3>
          <p className="text-sm text-zinc-500 font-light">
            or click to browse
          </p>
        </div>
        <input 
          type="file" 
          className="hidden" 
          multiple 
          accept={accept} 
          onChange={handleFileInput}
        />
      </label>
    </motion.div>
  );
};