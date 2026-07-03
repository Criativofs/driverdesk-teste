import { Download } from "lucide-react";
import { drivers, kpiToday } from "@/lib/mock-data";

export function ReportsView() {
  return (
    <div className="space-y-6">
      <div className="bg-panel border border-hairline rounded-xl p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold">Relatório operacional</h3>
          <p className="text-xs text-muted-foreground mt-1">
            Período: 01/10 – 14/10 · 5 motoristas · Central {kpiToday.messages.toLocaleString("pt-BR")} mensagens
          </p>
        </div>
        <div className="flex gap-2">
          <button className="text-xs font-semibold px-3 py-2 rounded-lg border border-hairline hover:bg-muted transition-colors flex items-center gap-2">
            <Download className="size-3.5" /> CSV
          </button>
          <button className="text-xs font-bold px-3 py-2 rounded-lg bg-navy text-navy-foreground hover:bg-navy/90 transition-colors flex items-center gap-2">
            <Download className="size-3.5" /> PDF
          </button>
        </div>
      </div>


      <div className="bg-panel border border-hairline rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-hairline">
          <h3 className="text-sm font-bold">Desempenho por motorista</h3>
        </div>
        <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[640px]">

          <thead className="bg-muted/50 text-[10px] uppercase tracking-widest text-muted-foreground">
            <tr>
              <th className="text-left px-6 py-3 font-semibold">Motorista</th>
              <th className="text-right px-6 py-3 font-semibold">Msgs (14d)</th>
              <th className="text-right px-6 py-3 font-semibold">TMR</th>
              <th className="text-right px-6 py-3 font-semibold">Entregas</th>
              <th className="text-right px-6 py-3 font-semibold">Score</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-hairline">
            {drivers.map((d) => {
              const total = d.activity7d.reduce((a, b) => a + b, 0) * 2;
              const score =
                Math.round(
                  (d.deliveriesDone / d.deliveriesTotal) * 60 +
                    (d.status === "online" ? 30 : d.status === "idle" ? 20 : 15) +
                    Math.min(10, total / 30),
                );
              return (
                <tr key={d.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-3">
                    <p className="font-semibold">{d.name}</p>
                    <p className="text-[10px] text-muted-foreground">#{d.code}</p>
                  </td>
                  <td className="px-6 py-3 text-right tabular-nums">{total}</td>
                  <td className="px-6 py-3 text-right tabular-nums">{d.avgResponse}</td>
                  <td className="px-6 py-3 text-right tabular-nums">
                    {d.deliveriesDone}/{d.deliveriesTotal}
                  </td>
                  <td className="px-6 py-3 text-right">
                    <span
                      className={`inline-flex px-2 py-0.5 rounded text-[11px] font-bold tabular-nums ${
                        score >= 85
                          ? "bg-success/15 text-success"
                          : score >= 65
                            ? "bg-warning/15 text-warning"
                            : "bg-danger/15 text-danger"
                      }`}
                    >
                      {score}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        </div>
      </div>

    </div>
  );
}
