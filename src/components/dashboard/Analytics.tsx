import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { drivers, heatmap, kpiToday, messagesLast14Days } from "@/lib/mock-data";

export function Analytics() {
  const maxHeat = Math.max(...heatmap);
  const hours = ["08h", "10h", "12h", "14h", "16h", "18h", "20h"];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-4 gap-4">
        <Kpi label="Mensagens hoje" value={kpiToday.messages.toLocaleString("pt-BR")} delta="+12%" />
        <Kpi
          label="Motoristas ativos"
          value={`${kpiToday.activeDrivers}/${kpiToday.totalDrivers}`}
          delta="Estável"
          neutral
        />
        <Kpi label="TMR médio" value={kpiToday.avgResponse} delta="−8s" positive />
        <Kpi label="Taxa de resolução" value={kpiToday.resolutionRate} delta="+2.1%" positive />
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 bg-panel border border-hairline rounded-xl p-6">
          <div className="flex items-baseline justify-between mb-4">
            <h3 className="text-sm font-bold">Volume de mensagens · últimos 14 dias</h3>
            <div className="flex items-center gap-4 text-[11px] text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <span className="size-2 rounded-sm bg-navy" /> Recebidas
              </span>
              <span className="flex items-center gap-1.5">
                <span className="size-2 rounded-sm bg-ember" /> Enviadas
              </span>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={messagesLast14Days} margin={{ top: 4, right: 8, left: -12, bottom: 0 }}>
                <defs>
                  <linearGradient id="rec" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--navy)" stopOpacity={0.28} />
                    <stop offset="100%" stopColor="var(--navy)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="env" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--ember)" stopOpacity={0.28} />
                    <stop offset="100%" stopColor="var(--ember)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="var(--hairline)" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} width={40} />
                <Tooltip
                  contentStyle={{
                    background: "var(--panel)",
                    border: "1px solid var(--hairline)",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="recebidas"
                  stroke="var(--navy)"
                  strokeWidth={2}
                  fill="url(#rec)"
                />
                <Area
                  type="monotone"
                  dataKey="enviadas"
                  stroke="var(--ember)"
                  strokeWidth={2}
                  fill="url(#env)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-panel border border-hairline rounded-xl p-6">
          <h3 className="text-sm font-bold mb-4">Heatmap · horários de pico</h3>
          <div className="grid grid-cols-7 gap-1">
            {heatmap.map((v, i) => {
              const intensity = v / maxHeat;
              return (
                <div
                  key={i}
                  className="aspect-square rounded-sm"
                  style={{
                    background:
                      intensity < 0.15
                        ? "var(--muted)"
                        : `color-mix(in oklab, var(--ember) ${Math.round(intensity * 100)}%, transparent)`,
                  }}
                  title={`${v} msgs`}
                />
              );
            })}
          </div>
          <div className="mt-2 flex justify-between text-[10px] text-muted-foreground uppercase font-medium">
            {hours.map((h) => <span key={h}>{h}</span>)}
          </div>
          <div className="mt-4 text-xs text-muted-foreground">
            Pico da operação: <span className="font-bold text-foreground">{kpiToday.peakWindow}</span>
          </div>
        </div>
      </div>

      <div className="bg-panel border border-hairline rounded-xl p-6">
        <h3 className="text-sm font-bold mb-4">Volume por motorista (hoje)</h3>
        <div className="space-y-3">
          {drivers.map((d) => {
            const max = Math.max(...drivers.map((x) => x.messagesToday));
            const pct = (d.messagesToday / max) * 100;
            return (
              <div key={d.id}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-medium">
                    {d.name} <span className="text-muted-foreground">· #{d.code}</span>
                  </span>
                  <span className="font-bold tabular-nums">{d.messagesToday}</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-navy rounded-full"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function Kpi({
  label,
  value,
  delta,
  positive,
  neutral,
}: {
  label: string;
  value: string;
  delta: string;
  positive?: boolean;
  neutral?: boolean;
}) {
  return (
    <div className="bg-panel border border-hairline rounded-xl p-5">
      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
        {label}
      </p>
      <p className="text-2xl font-bold tabular-nums mt-2">{value}</p>
      <p
        className={`text-[11px] font-semibold mt-1 ${
          neutral
            ? "text-muted-foreground"
            : positive
              ? "text-success"
              : "text-ember"
        }`}
      >
        {delta} vs ontem
      </p>
    </div>
  );
}
