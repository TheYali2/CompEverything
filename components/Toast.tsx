import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, X } from 'lucide-react';

interface ToastProps {
  message: string | null;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, onClose }) => {
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        onClose();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [message, onClose]);

  return (
    <AnimatePresence>
      {message && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.9 }}
          className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 flex items-center gap-3 px-6 py-4 bg-zinc-900/90 backdrop-blur-md border border-red-500/20 text-red-200 rounded-2xl shadow-2xl shadow-black/50"
        >
          <div className="p-2 bg-red-500/10 rounded-full">
            <AlertCircle className="w-5 h-5 text-red-500" />
          </div>
          <span className="font-medium text-sm md:text-base">{message}</span>
          <button 
            onClick={onClose}
            className="ml-2 p-1 hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};