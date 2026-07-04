import { MessageSquare, BarChart3, FileText, Users, Settings, LayoutDashboard, Car, UserRound, Map as MapIcon } from "lucide-react";
import brandIcon from "@/assets/drivedesk-icon.png.asset.json";
import { kpiToday, drivers, statusColor, APP_TAGLINE } from "@/lib/mock-data";

export type Section = "overview" | "rides" | "map" | "inbox" | "drivers" | "clients" | "analytics" | "reports" | "settings";

const nav: { id: Section; label: string; icon: typeof MessageSquare }[] = [
  { id: "rides", label: "Corridas", icon: Car },
  { id: "map", label: "Mapa da frota", icon: MapIcon },
  { id: "overview", label: "Painel", icon: LayoutDashboard },
  { id: "inbox", label: "Inbox", icon: MessageSquare },
  { id: "clients", label: "Clientes", icon: UserRound },
  { id: "drivers", label: "Motoristas", icon: Users },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
  { id: "reports", label: "Relatórios", icon: FileText },
  { id: "settings", label: "Configurações", icon: Settings },
];


export function Sidebar({
  active,
  onChange,
}: {
  active: Section;
  onChange: (s: Section) => void;
}) {
  const activeCount = drivers.filter((d) => d.status !== "offline").length;

  return (
    <aside className="w-72 h-full shrink-0 bg-panel border-r border-hairline flex flex-col">
      <div className="p-6 border-b border-hairline">
        <div className="flex items-center gap-2.5">
          <div className="size-9 bg-navy rounded flex items-center justify-center relative overflow-hidden">
            <img src={brandIcon.url} alt="DriveDesk" className="size-7 object-contain" />
            <span className="absolute -top-0.5 -right-0.5 size-2 bg-ember rounded-full ring-2 ring-panel" />
          </div>
          <div>
            <h1 className="font-bold text-[15px] tracking-tight leading-none uppercase">
              Driver<span className="text-ember">Desk</span>
            </h1>
            <p className="text-[10px] text-muted-foreground mt-1 uppercase tracking-widest">
              {APP_TAGLINE}
            </p>
          </div>
        </div>
      </div>

      <nav className="p-3 border-b border-hairline">
        {nav.map((item) => {
          const Icon = item.icon;
          const isActive = active === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onChange(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive
                  ? "bg-navy text-navy-foreground"
                  : "text-foreground/70 hover:text-foreground hover:bg-muted"
              }`}
            >
              <Icon className="size-4" strokeWidth={2} />
              {item.label}
            </button>
          );
        })}
      </nav>

      <div className="p-6 flex-1 overflow-y-auto">
        <div className="flex justify-between items-end mb-4">
          <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
            Motoristas
          </span>
          <span className="text-[10px] font-bold text-ember bg-ember/10 px-2 py-0.5 rounded">
            {activeCount}/{drivers.length} ATIVOS
          </span>
        </div>

        <div className="space-y-1.5">
          {drivers.map((d) => (
            <div
              key={d.id}
              className="p-2.5 border border-hairline rounded-lg bg-background/60 hover:bg-muted transition-colors"
            >
              <div className="flex justify-between mb-1 items-center">
                <span className="font-semibold text-[13px] truncate">{d.name}</span>
                <span className="text-[10px] text-muted-foreground shrink-0">
                  {d.lastActivity}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className={`size-1.5 rounded-full ${statusColor(d.status)}`} />
                  <span className="text-[11px] text-muted-foreground">
                    TR: {d.avgResponse}
                  </span>
                </div>
                {d.unread > 0 && (
                  <span className="size-4 bg-ember text-ember-foreground text-[10px] font-bold rounded-full flex items-center justify-center">
                    {d.unread}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="p-6 border-t border-hairline">
        <h3 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-3">
          Performance Hoje
        </h3>
        <div>
          <div className="flex justify-between text-xs mb-1.5">
            <span className="text-muted-foreground">Volume total</span>
            <span className="font-bold tabular-nums">
              {kpiToday.messages.toLocaleString("pt-BR")} msgs
            </span>
          </div>
          <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-navy" style={{ width: "75%" }} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 mt-3">
          <div className="bg-muted/60 p-2 rounded">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
              TMR Médio
            </p>
            <p className="text-sm font-bold tabular-nums">{kpiToday.avgResponse}</p>
          </div>
          <div className="bg-muted/60 p-2 rounded">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
              Pico
            </p>
            <p className="text-sm font-bold tabular-nums">{kpiToday.peakWindow}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
