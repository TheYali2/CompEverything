import React from 'react';
import { motion } from 'framer-motion';
import { HardDrive, ArrowDownCircle, Activity } from 'lucide-react';
import { CompressionStats } from '../types';
import { formatBytes } from '../utils/formatters';

interface StatsDashboardProps {
  stats: CompressionStats;
}

export const StatsDashboard: React.FC<StatsDashboardProps> = ({ stats }) => {
  const savedBytes = Math.max(0, stats.totalOriginal - stats.totalCompressed);
  const percentage = stats.totalOriginal > 0
    ? ((savedBytes / stats.totalOriginal) * 100).toFixed(1)
    : '0';

  const items = [
    {
      label: 'Original Size',
      value: formatBytes(stats.totalOriginal),
      icon: HardDrive,
      color: 'from-blue-500 to-cyan-400',
      bg: 'bg-blue-500/10'
    },
    {
      label: 'Saved Space',
      value: formatBytes(savedBytes),
      icon: ArrowDownCircle,
      color: 'from-emerald-400 to-teal-400',
      bg: 'bg-emerald-500/10'
    },
    {
      label: 'Efficiency',
      value: `${percentage}%`,
      icon: Activity,
      color: 'from-violet-500 to-fuchsia-400',
      bg: 'bg-violet-500/10'
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10 w-full">
      {items.map((item, index) => (
        <motion.div
          key={item.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="glass-panel p-5 rounded-2xl relative overflow-hidden group"
        >
          <div className={`absolute -right-10 -top-10 w-24 h-24 bg-gradient-to-br ${item.color} rounded-full blur-3xl opacity-0 group-hover:opacity-20 transition-opacity duration-500`}></div>

          <div className="flex items-center space-x-4 relative z-10">
            <div className={`p-3 rounded-xl ${item.bg}`}>
              <item.icon className={`w-6 h-6 text-transparent bg-clip-text bg-gradient-to-br ${item.color}`} />
            </div>
            <div>
              <p className="text-xs text-zinc-500 uppercase tracking-wider font-semibold mb-1">{item.label}</p>
              <h3 className="text-2xl font-bold text-zinc-100">{item.value}</h3>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};