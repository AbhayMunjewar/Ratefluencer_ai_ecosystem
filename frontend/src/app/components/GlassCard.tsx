import { motion } from 'motion/react';
import { ReactNode } from 'react';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  style?: React.CSSProperties;
  onClick?: () => void;
}

export function GlassCard({ children, className = '', hover = true, style, onClick }: GlassCardProps) {
  return (
    <motion.div
      className={`glass-card ${className}`}
      style={style}
      whileHover={hover ? { y: -4, borderColor: 'rgba(56,189,248,0.30)', backgroundColor: 'rgba(12,17,32,0.85)' } : undefined}
      transition={{ duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
      onClick={onClick}
    >
      {children}
    </motion.div>
  );
}
