'use client';

import { motion } from 'framer-motion';

import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function LoadingSpinner({ size = 'md', className }: LoadingSpinnerProps) {
  const _sizeClass = {
    sm: 'h-4 w-4 border-2',
    md: 'h-8 w-8 border-2',
    lg: 'h-12 w-12 border-3',
  };

  return (
    <motion.div
      className={cn(
        'rounded-full border-primary border-t-transparent animate-spin',
        sizeClass[size],
        className
      )}
      animate={{ rotate: 360 }}
      transition={{
        duration: 1,
        ease: 'linear',
        repeat: Infinity,
      }}
    />
  );
}
