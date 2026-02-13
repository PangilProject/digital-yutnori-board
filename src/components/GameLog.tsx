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
      <h3 className="text-lg font-bold mb-2 text-foreground">📜 게임 로그</h3>
      <ScrollArea className="flex-1 border border-border rounded-md bg-card p-3">
        <div className="space-y-1">
          {logs.map((log, i) => (
            <p key={i} className="text-sm text-card-foreground">
              <span className="text-muted-foreground mr-2 text-xs">{i + 1}.</span>
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
