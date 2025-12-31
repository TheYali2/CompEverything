import React from 'react';
import { motion } from 'framer-motion';
import { Download, CheckCircle, Loader2, XCircle, FileType, FileText, FileCode, Image as ImageIcon, Archive } from 'lucide-react';
import { CompressedFile } from '../types';
import { formatBytes } from '../utils/formatters';

interface FileCardProps {
  file: CompressedFile;
}

export const FileCard: React.FC<FileCardProps> = ({ file }) => {
  const percentage = file.status === 'DONE' && file.originalSize > 0
    ? ((1 - file.compressedSize / file.originalSize) * 100).toFixed(1)
    : 0;

  const handleDownload = () => {
    if (!file.compressedBlob) return;
    const url = URL.createObjectURL(file.compressedBlob);
    const link = document.createElement('a');
    link.href = url;

    if (file.type === 'ARCHIVE') {
      link.download = `${file.originalFile.name}.zip`;
    } else {
      let extPrefix = "min_";
      link.download = `${extPrefix}${file.originalFile.name}`;
    }

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const getIcon = () => {
    const props = { className: "w-5 h-5" };
    switch (file.type) {
      case 'IMAGE': return <ImageIcon {...props} />;
      case 'CODE': return <FileCode {...props} />;
      case 'PDF': return <FileText {...props} />;
      case 'ARCHIVE': return <Archive {...props} />;
      default: return <FileType {...props} />;
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="glass-panel rounded-xl p-3 md:p-4 flex items-center justify-between group hover:bg-white/[0.03] transition-colors relative overflow-hidden"
    >
      {file.status === 'COMPRESSING' && (
        <motion.div
          className="absolute bottom-0 left-0 h-[2px] bg-gradient-to-r from-primary to-secondary"
          initial={{ width: 0 }}
          animate={{ width: `${file.progress}%` }}
          transition={{ ease: "linear" }}
        />
      )}

      <div className="flex items-center space-x-4 overflow-hidden flex-1">
        <div className={`
          w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0
          ${file.status === 'DONE' ? 'bg-emerald-500/10 text-emerald-400' :
            file.status === 'ERROR' ? 'bg-red-500/10 text-red-500' :
              'bg-zinc-800 text-zinc-400'}
        `}>
          {file.status === 'COMPRESSING' ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : file.status === 'DONE' ? (
            <CheckCircle className="w-5 h-5" />
          ) : file.status === 'ERROR' ? (
            <XCircle className="w-5 h-5" />
          ) : (
            getIcon()
          )}
        </div>

        <div className="flex flex-col min-w-0">
          <h4 className="text-zinc-200 font-medium truncate text-sm md:text-base" title={file.originalFile.name}>
            {file.originalFile.name}
          </h4>
          <div className="flex items-center space-x-2 text-xs text-zinc-500">
            <span>{formatBytes(file.originalSize)}</span>
            {file.status === 'COMPRESSING' && (
              <span className="text-primary ml-1">
                Processing {Math.round(file.progress)}%
              </span>
            )}
            {file.status === 'DONE' && (
              <>
                <span className="text-zinc-600">→</span>
                <span className="text-zinc-300">{formatBytes(file.compressedSize)}</span>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-4 pl-4">
        {file.status === 'DONE' && (
          <span className="hidden md:block px-2 py-1 bg-emerald-500/10 text-emerald-400 rounded text-xs font-semibold border border-emerald-500/20">
            -{percentage}%
          </span>
        )}

        {file.status === 'DONE' && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleDownload}
            className="p-2 bg-zinc-100 text-zinc-900 rounded-lg shadow hover:bg-white transition-colors"
          >
            <Download className="w-4 h-4" />
          </motion.button>
        )}
      </div>
    </motion.div>
  );
};