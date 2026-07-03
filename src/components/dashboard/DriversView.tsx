import { drivers, statusColor, statusLabel, CENTRAL_NUMBER } from "@/lib/mock-data";

export function DriversView() {
  return (
    <div className="space-y-6">
      <div className="bg-panel border border-hairline rounded-xl p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-2">
          <div>
            <h3 className="text-sm font-bold">Número central de controle</h3>
            <p className="text-xs text-muted-foreground mt-1">
              Todas as mensagens são enviadas em nome deste número.
            </p>
          </div>
          <div className="sm:text-right">
            <p className="text-lg font-bold tabular-nums">{CENTRAL_NUMBER}</p>
            <p className="text-[11px] text-success font-semibold uppercase tracking-widest">
              Conectado
            </p>
          </div>
        </div>
      </div>


      <div className="bg-panel border border-hairline rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-hairline flex items-center justify-between">
          <h3 className="text-sm font-bold">Motoristas cadastrados ({drivers.length}/5)</h3>
          <button className="text-[11px] font-bold uppercase tracking-widest text-ember hover:text-ember/80">
            + Adicionar motorista
          </button>
        </div>
        <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[720px]">

          <thead className="bg-muted/50 text-[10px] uppercase tracking-widest text-muted-foreground">
            <tr>
              <th className="text-left px-6 py-3 font-semibold">Motorista</th>
              <th className="text-left px-6 py-3 font-semibold">Telefone</th>
              <th className="text-left px-6 py-3 font-semibold">Status</th>
              <th className="text-left px-6 py-3 font-semibold">Rota / Localização</th>
              <th className="text-right px-6 py-3 font-semibold">Msgs hoje</th>
              <th className="text-right px-6 py-3 font-semibold">TMR</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-hairline">
            {drivers.map((d) => (
              <tr key={d.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-6 py-3">
                  <div className="flex items-center gap-3">
                    <div className="size-8 rounded-full bg-muted flex items-center justify-center text-[11px] font-bold">
                      {d.initials}
                    </div>
                    <div>
                      <p className="font-semibold">{d.name}</p>
                      <p className="text-[10px] text-muted-foreground">#{d.code}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-3 tabular-nums text-muted-foreground">{d.phone}</td>
                <td className="px-6 py-3">
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold">
                    <span className={`size-2 rounded-full ${statusColor(d.status)}`} />
                    {statusLabel(d.status)}
                  </span>
                </td>
                <td className="px-6 py-3 text-muted-foreground text-xs">{d.route}</td>
                <td className="px-6 py-3 text-right font-bold tabular-nums">{d.messagesToday}</td>
                <td className="px-6 py-3 text-right tabular-nums">{d.avgResponse}</td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>

    </div>
  );
}
