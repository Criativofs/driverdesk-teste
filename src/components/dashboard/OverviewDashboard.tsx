import { Activity, AlertTriangle, MessageCircle, Users, Clock, Inbox } from "lucide-react";
import {
  drivers,
  kpiToday,
  notifications,
  priorityMeta,
  statusColor,
  statusLabel,
  labelById,
  type Driver,
} from "@/lib/mock-data";

export function OverviewDashboard({ onOpenInbox }: { onOpenInbox?: (driverId?: string) => void }) {
  const online = drivers.filter((d) => d.status === "online");
  const silent = drivers.filter((d) => d.minutesSinceReply >= 10 && d.status !== "offline");
  const open = drivers.filter((d) => d.status !== "offline");
  const critical = drivers.filter((d) => d.priority === "critical");
  const queue = drivers.reduce((sum, d) => sum + d.unread, 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 sm:gap-4">
        <LiveKpi icon={Users} label="Motoristas online" value={`${online.length}/${drivers.length}`} tone="success" />
        <LiveKpi icon={AlertTriangle} label="Sem responder" value={silent.length.toString()} tone={silent.length ? "warning" : "muted"} />
        <LiveKpi icon={MessageCircle} label="Conversas abertas" value={open.length.toString()} tone="navy" />
        <LiveKpi icon={Activity} label="Conversas críticas" value={critical.length.toString()} tone={critical.length ? "destructive" : "muted"} />
        <LiveKpi icon={Clock} label="Tempo médio" value={kpiToday.avgResponse} tone="ember" />
        <LiveKpi icon={Inbox} label="Fila (não lidas)" value={queue.toString()} tone="ember" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
        <div className="lg:col-span-2 bg-panel border border-hairline rounded-xl p-4 sm:p-6">
          <div className="flex items-baseline justify-between mb-4">
            <h3 className="text-sm font-bold">Filas em tempo real</h3>
            <span className="text-[11px] text-muted-foreground font-medium">
              Ordenado por prioridade
            </span>
          </div>
          <div className="space-y-2">
            {[...drivers]
              .sort((a, b) => {
                const rank = { critical: 0, high: 1, normal: 2 } as const;
                return rank[a.priority] - rank[b.priority] || b.unread - a.unread;
              })
              .map((d) => (
                <QueueRow key={d.id} driver={d} onOpen={() => onOpenInbox?.(d.id)} />
              ))}
          </div>
        </div>

        <div className="bg-panel border border-hairline rounded-xl p-4 sm:p-6">
          <div className="flex items-baseline justify-between mb-4">
            <h3 className="text-sm font-bold">Alertas recentes</h3>
            <span className="text-[10px] text-ember font-bold bg-ember/10 px-2 py-0.5 rounded">
              {notifications.filter((n) => n.unread).length} novos
            </span>
          </div>
          <div className="space-y-2">
            {notifications.slice(0, 6).map((n) => (
              <button
                key={n.id}
                onClick={() => n.driverId && onOpenInbox?.(n.driverId)}
                className="w-full text-left p-2.5 rounded-lg border border-hairline bg-background/60 hover:bg-muted transition-colors flex items-start gap-2"
              >
                <span className={`size-1.5 rounded-full mt-1.5 shrink-0 ${n.unread ? "bg-ember" : "bg-muted-foreground/30"}`} />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium leading-snug">{n.title}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{n.time}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function LiveKpi({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: typeof Users;
  label: string;
  value: string;
  tone: "success" | "warning" | "destructive" | "navy" | "ember" | "muted";
}) {
  const toneMap = {
    success: "text-success bg-success/10",
    warning: "text-warning bg-warning/10",
    destructive: "text-destructive bg-destructive/10",
    navy: "text-navy bg-navy/10",
    ember: "text-ember bg-ember/10",
    muted: "text-muted-foreground bg-muted",
  }[tone];

  return (
    <div className="bg-panel border border-hairline rounded-xl p-3 sm:p-4">
      <div className="flex items-center justify-between mb-2">
        <span className={`size-7 rounded flex items-center justify-center ${toneMap}`}>
          <Icon className="size-3.5" strokeWidth={2.5} />
        </span>
        <span className="size-1.5 rounded-full bg-success animate-pulse" title="Ao vivo" />
      </div>
      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest leading-tight">
        {label}
      </p>
      <p className="text-xl sm:text-2xl font-bold tabular-nums mt-1">{value}</p>
    </div>
  );
}

function QueueRow({ driver, onOpen }: { driver: Driver; onOpen: () => void }) {
  const pm = priorityMeta(driver.priority);
  const silent = driver.minutesSinceReply >= 10 && driver.status !== "offline";
  return (
    <button
      onClick={onOpen}
      className="w-full text-left p-3 rounded-lg border border-hairline bg-background/60 hover:bg-muted transition-colors flex items-center gap-3"
    >
      <span className={`size-2 rounded-full shrink-0 ${pm.dot}`} title={`Prioridade ${pm.label}`} />
      <div className={`size-9 rounded-full bg-muted flex items-center justify-center text-[11px] font-bold shrink-0 relative ring-2 ${pm.ring}`}>
        {driver.initials}
        <span className={`absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full ring-2 ring-panel ${statusColor(driver.status)}`} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-sm font-semibold truncate">{driver.name}</span>
          <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${pm.chip}`}>
            {pm.label}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-1">
          {driver.labels.slice(0, 2).map((l) => {
            const def = labelById(l);
            return (
              <span key={l} className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${def.color} ${def.text}`}>
                {def.name}
              </span>
            );
          })}
          <span className="text-[10px] text-muted-foreground ml-1 truncate">
            {statusLabel(driver.status)} · {silent ? `sem resposta há ${driver.minutesSinceReply}m` : `resposta ${driver.avgResponse}`}
          </span>
        </div>
      </div>
      {driver.unread > 0 && (
        <span className="size-5 bg-ember text-ember-foreground text-[10px] font-bold rounded-full flex items-center justify-center shrink-0">
          {driver.unread}
        </span>
      )}
    </button>
  );
}
