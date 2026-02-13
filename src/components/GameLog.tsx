import { ScrollArea } from '@/components/ui/scroll-area';
import { useEffect, useRef } from 'react';

interface GameLogProps {
  logs: string[];
}

const GameLog = ({ logs }: GameLogProps) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs.length]);

  return (
    <div className="flex flex-col h-full">
      <h3 className="text-lg font-bold mb-2 text-foreground flex items-center gap-2">
        📜 <span>게임 로그</span>
        <span className="text-xs font-normal text-muted-foreground">({logs.length})</span>
      </h3>
      <ScrollArea className="flex-1 border border-border rounded-xl bg-card/80 backdrop-blur-sm p-3 shadow-inner">
        <div className="space-y-1.5">
          {logs.map((log, i) => (
            <p key={i} className={`text-sm ${log.includes('💥') ? 'font-bold text-destructive' : 'text-card-foreground'}`}>
              <span className="text-muted-foreground mr-1.5 text-xs font-mono">{String(i + 1).padStart(2, '0')}</span>
              {log}
            </p>
          ))}
          <div ref={bottomRef} />
        </div>
      </ScrollArea>
    </div>
  );
};

export default GameLog;
