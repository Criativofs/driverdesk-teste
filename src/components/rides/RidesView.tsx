import { useMemo, useState } from "react";
import { Plus, Send, X, MoreHorizontal, Calendar, Search } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRides } from "@/lib/rides-store";
import {
  drivers,
  rideStatusMeta,
  opStatusMeta,
  type Ride,
  type RideStatus,
} from "@/lib/mock-data";
import { toast } from "sonner";

const STATUS_FILTERS: { id: RideStatus | "todas" | "agendadas"; label: string }[] = [
  { id: "todas", label: "Todas" },
  { id: "procurando", label: "Procurando" },
  { id: "aceita", label: "Aceitas" },
  { id: "cliente_embarcado", label: "Em andamento" },
  { id: "concluida", label: "Concluídas" },
  { id: "cancelada", label: "Canceladas" },
  { id: "agendadas", label: "Agendadas" },
];

function money(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function RidesView() {
  const { rides, getClient, getDriverName, cancelRide, setRideStatus, updateRide } = useRides();
  const [filter, setFilter] = useState<(typeof STATUS_FILTERS)[number]["id"]>("todas");
  const [search, setSearch] = useState("");
  const [newOpen, setNewOpen] = useState(false);
  const [assignRide, setAssignRide] = useState<Ride | null>(null);
  const [priceRide, setPriceRide] = useState<Ride | null>(null);

  const filtered = useMemo(() => {
    return rides.filter((r) => {
      if (filter === "agendadas" && !r.scheduledFor) return false;
      if (filter !== "todas" && filter !== "agendadas" && r.status !== filter) return false;
      if (search) {
        const c = getClient(r.clientId);
        const hay = `${c?.name ?? ""} ${r.origin} ${r.destination}`.toLowerCase();
        if (!hay.includes(search.toLowerCase())) return false;
      }
      return true;
    });
  }, [rides, filter, search, getClient]);

  const counts = useMemo(
    () => ({
      procurando: rides.filter((r) => r.status === "procurando").length,
      andamento: rides.filter((r) =>
        ["aceita", "indo_buscar", "cliente_embarcado", "em_andamento", "finalizando"].includes(r.status),
      ).length,
      agendadas: rides.filter((r) => !!r.scheduledFor).length,
      concluidasHoje: rides.filter((r) => r.status === "concluida").length,
      faturado: rides.filter((r) => r.status === "concluida").reduce((s, r) => s + r.price, 0),
    }),
    [rides],
  );

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* KPI strip */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <KpiCard label="Procurando" value={counts.procurando.toString()} accent="text-warning" />
        <KpiCard label="Em andamento" value={counts.andamento.toString()} accent="text-ember" />
        <KpiCard label="Agendadas" value={counts.agendadas.toString()} accent="text-navy" />
        <KpiCard label="Concluídas hoje" value={counts.concluidasHoje.toString()} accent="text-success" />
        <KpiCard label="Faturado hoje" value={money(counts.faturado)} accent="text-foreground" />
      </div>

      {/* Toolbar */}
      <div className="bg-panel border border-hairline rounded-xl p-3 sm:p-4 flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="relative flex-1">
            <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar cliente, origem ou destino…"
              className="pl-9"
            />
          </div>
          <Button onClick={() => setNewOpen(true)} className="gap-2 shrink-0">
            <Plus className="size-4" /> Nova corrida
          </Button>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {STATUS_FILTERS.map((f) => {
            const active = filter === f.id;
            return (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={`px-3 py-1 rounded-full text-[11px] font-semibold uppercase tracking-widest transition-colors ${
                  active
                    ? "bg-navy text-navy-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/70"
                }`}
              >
                {f.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Table */}
      <div className="bg-panel border border-hairline rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[880px]">
            <thead className="bg-muted/50 text-[10px] uppercase tracking-widest text-muted-foreground">
              <tr>
                <th className="text-left px-4 py-3 font-semibold">Cliente</th>
                <th className="text-left px-4 py-3 font-semibold">Origem → Destino</th>
                <th className="text-right px-4 py-3 font-semibold">Valor</th>
                <th className="text-left px-4 py-3 font-semibold">Status</th>
                <th className="text-left px-4 py-3 font-semibold">Motorista</th>
                <th className="text-left px-4 py-3 font-semibold">Quando</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline">
              {filtered.map((r) => {
                const client = getClient(r.clientId);
                const sm = rideStatusMeta(r.status);
                return (
                  <tr key={r.id} className="hover:bg-muted/30">
                    <td className="px-4 py-3">
                      <p className="font-semibold">{client?.name ?? "—"}</p>
                      <p className="text-[11px] text-muted-foreground tabular-nums">
                        {client?.phone}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-[13px]">
                        <span className="text-muted-foreground">{r.origin}</span>{" "}
                        <span className="text-muted-foreground">→</span>{" "}
                        <span className="font-medium">{r.destination}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums font-bold">{money(r.price)}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-0.5 rounded text-[11px] font-semibold ${sm.chip}`}>
                        {sm.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[13px]">
                      {r.driverId ? (
                        getDriverName(r.driverId)
                      ) : (
                        <button
                          onClick={() => setAssignRide(r)}
                          className="text-ember font-semibold hover:underline"
                        >
                          Atribuir…
                        </button>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground tabular-nums whitespace-nowrap">
                      {r.scheduledFor ? (
                        <span className="inline-flex items-center gap-1 text-navy font-semibold">
                          <Calendar className="size-3" /> {r.scheduledFor}
                        </span>
                      ) : (
                        r.createdAt
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="size-8">
                            <MoreHorizontal className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setAssignRide(r)}>
                            <Send className="size-4" /> Trocar/enviar motorista
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setPriceRide(r)}>
                            Alterar valor
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {r.status !== "concluida" && (
                            <DropdownMenuItem onClick={() => setRideStatus(r.id, "concluida")}>
                              Marcar como concluída
                            </DropdownMenuItem>
                          )}
                          {r.driverId && r.status !== "cancelada" && (
                            <DropdownMenuItem
                              onClick={() => {
                                toast("Reenviando ao motorista…");
                              }}
                            >
                              Reenviar ao motorista
                            </DropdownMenuItem>
                          )}
                          {r.status !== "cancelada" && (
                            <DropdownMenuItem
                              onClick={() => cancelRide(r.id)}
                              className="text-destructive"
                            >
                              <X className="size-4" /> Cancelar corrida
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-sm text-muted-foreground">
                    Nenhuma corrida encontrada.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <NewRideDialog open={newOpen} onOpenChange={setNewOpen} />
      <AssignDialog ride={assignRide} onClose={() => setAssignRide(null)} />
      <PriceDialog
        ride={priceRide}
        onClose={() => setPriceRide(null)}
        onSave={(id, price) => updateRide(id, { price })}
      />
    </div>
  );
}

function KpiCard({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <div className="bg-panel border border-hairline rounded-xl p-3 lg:p-4">
      <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">
        {label}
      </p>
      <p className={`text-xl lg:text-2xl font-bold tabular-nums mt-1 ${accent ?? ""}`}>{value}</p>
    </div>
  );
}

function NewRideDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const { clients, createRide } = useRides();
  const [clientId, setClientId] = useState<string>(clients[0]?.id ?? "");
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [price, setPrice] = useState("");
  const [driverId, setDriverId] = useState<string>("__none");
  const [scheduledFor, setScheduledFor] = useState("");

  function reset() {
    setOrigin("");
    setDestination("");
    setPrice("");
    setDriverId("__none");
    setScheduledFor("");
  }

  function submit() {
    const priceNum = Number(price.replace(",", "."));
    if (!clientId || !origin.trim() || !destination.trim() || !priceNum) {
      toast.error("Preencha cliente, origem, destino e valor.");
      return;
    }
    createRide({
      clientId,
      origin: origin.trim(),
      destination: destination.trim(),
      price: priceNum,
      driverId: driverId === "__none" ? undefined : driverId,
      scheduledFor: scheduledFor.trim() || undefined,
    });
    reset();
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Nova corrida</DialogTitle>
          <DialogDescription>Crie uma corrida e opcionalmente já envie para um motorista.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-3">
          <div>
            <Label>Cliente</Label>
            <Select value={clientId} onValueChange={setClientId}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {clients.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.name} — {c.phone}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Origem</Label>
              <Input value={origin} onChange={(e) => setOrigin(e.target.value)} placeholder="Ex.: Rodoviária" />
            </div>
            <div>
              <Label>Destino</Label>
              <Input value={destination} onChange={(e) => setDestination(e.target.value)} placeholder="Ex.: Hospital" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Valor (R$)</Label>
              <Input value={price} onChange={(e) => setPrice(e.target.value)} inputMode="decimal" placeholder="42" />
            </div>
            <div>
              <Label>Agendar para (opcional)</Label>
              <Input value={scheduledFor} onChange={(e) => setScheduledFor(e.target.value)} placeholder="Amanhã 05:00" />
            </div>
          </div>
          <div>
            <Label>Motorista (opcional)</Label>
            <Select value={driverId} onValueChange={setDriverId}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="__none">Procurar depois</SelectItem>
                {drivers.map((d) => (
                  <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={submit}>Criar corrida</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function AssignDialog({ ride, onClose }: { ride: Ride | null; onClose: () => void }) {
  const { assignRide, opStatus, getClient } = useRides();
  const client = ride ? getClient(ride.clientId) : null;
  return (
    <Dialog open={!!ride} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Enviar corrida ao motorista</DialogTitle>
          {ride && (
            <DialogDescription>
              {client?.name} · {ride.origin} → {ride.destination} · {money(ride.price)}
            </DialogDescription>
          )}
        </DialogHeader>
        <div className="grid gap-2">
          {drivers.map((d) => {
            const meta = opStatusMeta(opStatus[d.id] ?? "offline");
            return (
              <button
                key={d.id}
                onClick={() => {
                  if (!ride) return;
                  assignRide(ride.id, d.id);
                  onClose();
                }}
                className="flex items-center justify-between p-3 border border-hairline rounded-lg hover:bg-muted transition-colors text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="size-9 rounded-full bg-muted flex items-center justify-center text-xs font-bold">
                    {d.initials}
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{d.name}</p>
                    <p className="text-[11px] text-muted-foreground">{d.phone}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`inline-flex px-2 py-0.5 rounded text-[11px] font-semibold ${meta.chip}`}>
                    {meta.emoji} {meta.label}
                  </span>
                  <Send className="size-4 text-ember" />
                </div>
              </button>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function PriceDialog({
  ride,
  onClose,
  onSave,
}: {
  ride: Ride | null;
  onClose: () => void;
  onSave: (id: string, price: number) => void;
}) {
  const [val, setVal] = useState("");
  return (
    <Dialog
      open={!!ride}
      onOpenChange={(o) => {
        if (!o) onClose();
        else if (ride) setVal(String(ride.price));
      }}
    >
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Alterar valor</DialogTitle>
        </DialogHeader>
        <div>
          <Label>Novo valor (R$)</Label>
          <Input value={val} onChange={(e) => setVal(e.target.value)} inputMode="decimal" />
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button
            onClick={() => {
              if (!ride) return;
              const n = Number(val.replace(",", "."));
              if (!n) return toast.error("Valor inválido");
              onSave(ride.id, n);
              toast.success("Valor atualizado");
              onClose();
            }}
          >
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
