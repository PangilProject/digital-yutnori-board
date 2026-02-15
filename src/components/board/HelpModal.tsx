import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { HelpCircle, Info, Move, Trophy, Users } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const HelpModal = () => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full w-10 h-10 shadow-md bg-white/10 hover:bg-white/20 text-white border border-white/10 backdrop-blur-sm">
          <HelpCircle className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden flex flex-col p-0">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <HelpCircle className="text-primary" /> 윷놀이 가이드
          </DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="rules" className="flex-1 flex flex-col">
          <div className="px-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="rules" className="flex items-center gap-1.5">
                <Info className="w-4 h-4" /> 규칙
              </TabsTrigger>
              <TabsTrigger value="controls" className="flex items-center gap-1.5">
                <Move className="w-4 h-4" /> 조작법
              </TabsTrigger>
              <TabsTrigger value="strategy" className="flex items-center gap-1.5">
                <Trophy className="w-4 h-4" /> 특수 룰
              </TabsTrigger>
            </TabsList>
          </div>

          <ScrollArea className="flex-1 p-6">
            <TabsContent value="rules" className="mt-0 space-y-6">
              <section>
                <h3 className="text-lg font-bold mb-3 flex items-center gap-2 border-b pb-1">
                  🎲 윷 결과와 이동
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {[
                    { name: '도', move: '1칸', emoji: '🌰', desc: '뒤집어진 윷 1개' },
                    { name: '개', move: '2칸', emoji: '🐕', desc: '뒤집어진 윷 2개' },
                    { name: '걸', move: '3칸', emoji: '🐑', desc: '뒤집어진 윷 3개' },
                    { name: '윷', move: '4칸', emoji: '🐂', desc: '뒤집어진 윷 4개 (+한번 더!)' },
                    { name: '모', move: '5칸', emoji: '🐎', desc: '평평한 윷 4개 (+한번 더!)' },
                    { name: '뒷도', move: '-1칸', emoji: '🔙', desc: '특수 표시된 윷 1개' },
                  ].map((item) => (
                    <div key={item.name} className="p-3 bg-muted rounded-lg border">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-bold text-primary">{item.name}</span>
                        <span>{item.emoji}</span>
                      </div>
                      <div className="text-sm font-bold">{item.move} 이동</div>
                      <div className="text-[10px] text-muted-foreground mt-1 leading-tight">{item.desc}</div>
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <h3 className="text-lg font-bold mb-3 flex items-center gap-2 border-b pb-1">
                  🏁 게임의 목표
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  자신의 팀에 속한 모든 말을 시작점에서 출발시켜 한 바퀴를 돌아 다시 <span className="text-foreground font-bold">골인(🏁)</span> 지점까지 먼저 통과시키면 승리합니다.
                </p>
              </section>
            </TabsContent>

            <TabsContent value="controls" className="mt-0 space-y-6">
              <section>
                <h3 className="text-lg font-bold mb-3 flex items-center gap-2 border-b pb-1">
                  🖱️ 말 이동하기
                </h3>
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <Move className="text-primary" />
                    </div>
                    <div>
                      <h4 className="font-bold">드래그 앤 드롭 (추천)</h4>
                      <p className="text-sm text-muted-foreground">말을 직접 마우스나 손가락으로 끌어서 원하는 위치에 놓으세요. 노드 근처에 가면 노란색 원이 표시되며 착 달라붙습니다.</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <Info className="text-primary" />
                    </div>
                    <div>
                      <h4 className="font-bold">이동 메뉴 사용</h4>
                      <p className="text-sm text-muted-foreground">말을 가볍게 한 번 클릭(탭)하면 이동 가능한 옵션들이 나타납니다. 원하는 이동 거리를 선택하면 자동으로 이동합니다.</p>
                    </div>
                  </div>
                </div>
              </section>

              <section>
                <h3 className="text-lg font-bold mb-3 flex items-center gap-2 border-b pb-1">
                  ⏭️ 턴 넘기기
                </h3>
                <p className="text-sm text-muted-foreground">
                  말을 모두 이동시킨 후에는 하단의 <span className="text-foreground font-bold">"턴 넘기기"</span> 버튼을 눌러 다음 팀에게 차례를 넘겨주세요.
                </p>
              </section>
            </TabsContent>

            <TabsContent value="strategy" className="mt-0 space-y-6">
              <section className="space-y-4">
                <div className="p-4 bg-primary/5 rounded-xl border border-primary/20">
                  <h4 className="font-bold text-primary flex items-center gap-2 mb-2">
                    ⚔️ 상대방 말 잡기
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    이동한 위치에 상대방의 말이 있다면 그 말을 잡을 수 있습니다! 잡힌 말은 다시 대기석으로 돌아가며, 말을 잡은 팀은 <span className="font-bold text-foreground">윷을 한 번 더 던질 수 있는 기회</span>를 얻습니다. (실제 윷을 한 번 더 던지시면 됩니다!)
                  </p>
                </div>

                <div className="p-4 bg-secondary/5 rounded-xl border border-secondary/20">
                  <h4 className="font-bold text-secondary-foreground flex items-center gap-2 mb-2">
                    👐 우리 팀 말 업기 (Stacking)
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    이동한 위치에 이미 우리 팀의 말이 있다면, 두 말을 하나로 합쳐서 <span className="font-bold text-foreground">함께 이동</span>할 수 있습니다. 이를 '업기'라고 하며, 여러 개의 말을 한꺼번에 이동시킬 수 있어 전략적으로 매우 유리합니다.
                  </p>
                </div>

                <div className="p-4 bg-accent/5 rounded-xl border border-accent/20">
                  <h4 className="font-bold flex items-center gap-2 mb-2">
                    ↗️ 지름길 활용
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    보드판의 모서리 노드(방석)나 중앙 노드에 멈추면 대각선 방향 등의 지름길로 이동할 수 있습니다. 지름길을 잘 활용하여 더 빠르게 골인 지점에 도달하세요!
                  </p>
                </div>
              </section>
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
