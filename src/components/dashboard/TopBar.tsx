import { CENTRAL_NUMBER } from "@/lib/mock-data";

export function TopBar({ operator = "Matriz Sul" }: { operator?: string }) {
  return (
    <header className="h-16 shrink-0 bg-panel border-b border-hairline px-8 flex items-center justify-between">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <span className="relative flex size-2">
            <span className="absolute inline-flex h-full w-full rounded-full bg-success opacity-60 animate-ping" />
            <span className="relative inline-flex rounded-full size-2 bg-success" />
          </span>
          <span className="text-sm font-medium">Central: {CENTRAL_NUMBER}</span>
          <span className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
            Mock
          </span>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="text-xs font-bold">Operador: {operator}</p>
          <p className="text-[10px] text-muted-foreground">Sessão iniciada há 4h 12m</p>
        </div>
        <div className="size-8 bg-navy text-navy-foreground rounded-full flex items-center justify-center text-xs font-bold">
          MS
        </div>
      </div>
    </header>
  );
}
