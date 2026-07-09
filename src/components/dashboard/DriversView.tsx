import { useState } from "react";
import { Send, MessageSquare } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { opStatusMeta, type OpStatus } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRides } from "@/lib/rides-store";
import { rideStatusMeta } from "@/lib/mock-data";
import { toast } from "sonner";

const OP_OPTIONS: OpStatus[] = [
  "disponivel",
  "indo_buscar",
  "cliente_embarcado",
  "finalizando",
  "pausa",
  "offline",
];

export function DriversView({ onOpenInbox }: { onOpenInbox?: (driverId: string) => void }) {
  const { opStatus, setDriverStatus, rides, assignRide, getClient, drivers, settings, loading, addDriver } = useRides();
  const [sendDriverId, setSendDriverId] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newCode, setNewCode] = useState("");
  const pendingRides = rides.filter((r) => !r.driverId && r.status !== "cancelada" && r.status !== "concluida");

  const submitDriver = () => {
    addDriver({ name: newName, phone: newPhone, code: newCode });
    setNewName("");
    setNewPhone("");
    setNewCode("");
    setAddOpen(false);
  };

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
            <p className="text-lg font-bold tabular-nums">{settings.centralNumber}</p>
            <p className="text-[11px] text-success font-semibold uppercase tracking-widest">
              {settings.whatsappConnected ? "Conectado" : "Pendente"}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-panel border border-hairline rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-hairline flex items-center justify-between">
          <h3 className="text-sm font-bold">Motoristas cadastrados ({drivers.length})</h3>
          <button
            onClick={() => setAddOpen(true)}
            className="text-[11px] font-bold uppercase tracking-widest text-ember hover:text-ember/80"
          >
            + Adicionar motorista
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[880px]">
            <thead className="bg-muted/50 text-[10px] uppercase tracking-widest text-muted-foreground">
              <tr>
                <th className="text-left px-6 py-3 font-semibold">Motorista</th>
                <th className="text-left px-6 py-3 font-semibold">Telefone</th>
                <th className="text-left px-6 py-3 font-semibold">Status operacional</th>
                <th className="text-left px-6 py-3 font-semibold">Rota / Localização</th>
                <th className="text-right px-6 py-3 font-semibold">TMR</th>
                <th className="text-right px-6 py-3 font-semibold">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline">
              {drivers.map((d) => {
                const st = opStatus[d.id] ?? "offline";
                const meta = opStatusMeta(st);
                return (
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
                      <Select
                        value={st}
                        onValueChange={(v) => setDriverStatus(d.id, v as OpStatus)}
                      >
                        <SelectTrigger className="h-8 w-[190px]">
                          <SelectValue>
                            <span className={`inline-flex items-center gap-1.5 px-1.5 py-0.5 rounded text-[11px] font-semibold ${meta.chip}`}>
                              {meta.emoji} {meta.label}
                            </span>
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {OP_OPTIONS.map((o) => {
                            const om = opStatusMeta(o);
                            return (
                              <SelectItem key={o} value={o}>
                                {om.emoji} {om.label}
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="px-6 py-3 text-muted-foreground text-xs">{d.route}</td>
                    <td className="px-6 py-3 text-right tabular-nums">{d.avgResponse}</td>
                    <td className="px-6 py-3">
                      <div className="flex justify-end gap-1.5">
                        <Button
                          size="sm"
                          onClick={() => setSendDriverId(d.id)}
                          className="gap-1.5 h-8"
                        >
                          <Send className="size-3.5" /> Enviar corrida
                        </Button>
                        {onOpenInbox && (
                          <Button
                            size="icon"
                            variant="outline"
                            onClick={() => onOpenInbox(d.id)}
                            className="h-8 w-8"
                            aria-label="Abrir conversa"
                          >
                            <MessageSquare className="size-3.5" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {drivers.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-sm text-muted-foreground">
                    {loading ? "Carregando motoristas do banco…" : "Nenhum motorista cadastrado."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={!!sendDriverId} onOpenChange={(o) => !o && setSendDriverId(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Enviar corrida</DialogTitle>
            <DialogDescription>
              Escolha uma corrida sem motorista para enviar a{" "}
              <strong>{drivers.find((x) => x.id === sendDriverId)?.name}</strong>.
            </DialogDescription>
          </DialogHeader>
          {pendingRides.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              Nenhuma corrida disponível. Crie uma em "Corridas".
            </p>
          ) : (
            <div className="space-y-2">
              {pendingRides.map((r) => {
                const c = getClient(r.clientId);
                const sm = rideStatusMeta(r.status);
                return (
                  <button
                    key={r.id}
                    onClick={() => {
                      if (sendDriverId) assignRide(r.id, sendDriverId);
                      setSendDriverId(null);
                    }}
                    className="w-full text-left p-3 border border-hairline rounded-lg hover:bg-muted transition-colors"
                  >
                    <div className="flex justify-between items-start gap-2">
                      <div className="min-w-0">
                        <p className="font-semibold text-sm truncate">{c?.name}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {r.origin} → {r.destination}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-bold tabular-nums">
                          {r.price.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                        </p>
                        <span className={`inline-flex mt-0.5 px-1.5 py-0.5 rounded text-[10px] font-semibold ${sm.chip}`}>
                          {sm.label}
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
