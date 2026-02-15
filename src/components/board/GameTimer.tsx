import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Clock } from 'lucide-react';

interface GameTimerProps {
  startTime?: number;
}

export const GameTimer = ({ startTime }: GameTimerProps) => {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!startTime) {
      setElapsed(0);
      return;
    }

    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime]);

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hrs > 0) {
      return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="flex items-center gap-2 px-4 py-2 bg-black/40 border-white/10 backdrop-blur-md text-white shadow-lg">
      <Clock className="w-4 h-4 text-blue-400" />
      <span className="font-mono font-bold text-lg tabular-nums tracking-wider text-blue-100">
        {formatTime(elapsed)}
      </span>
    </Card>
  );
};
