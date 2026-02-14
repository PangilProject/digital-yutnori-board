import React from 'react';
import { Button } from '@/components/ui/button';
import { X, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface OnboardingTooltipProps {
  isVisible: boolean;
  step: string;
  targetStep: string;
  title: string;
  content: string;
  onNext: () => void;
  onSkip: () => void;
  position?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
}

export const OnboardingTooltip = ({
  isVisible,
  step,
  targetStep,
  title,
  content,
  onNext,
  onSkip,
  position = 'bottom',
  className = ''
}: OnboardingTooltipProps) => {
  if (!isVisible || step !== targetStep) return null;

  const positionClasses = {
    top: 'bottom-full mb-4 left-1/2 -translate-x-1/2',
    bottom: 'top-full mt-4 left-1/2 -translate-x-1/2',
    left: 'right-full mr-4 top-1/2 -translate-y-1/2',
    right: 'left-full ml-4 top-1/2 -translate-y-1/2',
  };

  const arrowClasses = {
    top: 'top-full left-1/2 -translate-x-1/2 border-t-primary border-x-transparent border-b-transparent',
    bottom: 'bottom-full left-1/2 -translate-x-1/2 border-b-primary border-x-transparent border-t-transparent',
    left: 'left-full top-1/2 -translate-y-1/2 border-l-primary border-y-transparent border-r-transparent',
    right: 'right-full top-1/2 -translate-y-1/2 border-r-primary border-y-transparent border-l-transparent',
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: position === 'bottom' ? -10 : 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className={`absolute z-[100] w-[calc(100vw-40px)] max-w-64 p-4 bg-primary text-primary-foreground rounded-xl shadow-2xl ${positionClasses[position]} ${className}`}
      >
        {/* Arrow */}
        <div className={`absolute border-[8px] ${arrowClasses[position]}`} />

        <div className="flex justify-between items-start mb-2">
          <h4 className="font-bold text-sm flex items-center gap-1.5">
            ✨ {title}
          </h4>
          <button onClick={onSkip} className="p-0.5 hover:bg-white/20 rounded-md transition-colors">
            <X size={14} />
          </button>
        </div>
        
        <p className="text-xs leading-relaxed mb-4 opacity-90">
          {content}
        </p>

        <div className="flex justify-between items-center">
          <button 
            onClick={onSkip}
            className="text-[10px] font-bold uppercase tracking-wider opacity-60 hover:opacity-100 transition-opacity"
          >
            Pass Guide
          </button>
          <Button 
            size="sm" 
            variant="secondary" 
            onClick={onNext}
            className="h-8 px-3 text-xs font-bold gap-1"
          >
            Next <ChevronRight size={14} />
          </Button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
