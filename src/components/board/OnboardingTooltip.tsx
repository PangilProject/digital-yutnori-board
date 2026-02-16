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
  className = ''
}: OnboardingTooltipProps) => {
  if (!isVisible || step !== targetStep) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20, x: '-50%' }}
        animate={{ opacity: 1, y: 0, x: '-50%' }}
        exit={{ opacity: 0, y: 20, x: '-50%' }}
        className={`fixed bottom-8 left-1/2 z-[100] w-[calc(100vw-40px)] max-w-sm p-5 bg-slate-900/95 text-white rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.5)] border border-white/10 ${className}`}
      >
        <div className="flex justify-between items-start mb-3">
          <h4 className="font-bold text-base flex items-center gap-2 text-blue-400">
            ✨ {title}
          </h4>
          <button onClick={onSkip} className="p-1 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white">
            <X size={16} />
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
