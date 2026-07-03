import { useMemo, useState } from "react";
import { Plus, Star, Phone, MapPin } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useRides } from "@/lib/rides-store";
import { rideStatusMeta, type Client } from "@/lib/mock-data";
import { toast } from "sonner";

function money(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function ClientsView() {
  const { clients, ridesByClient, getDriverName } = useRides();
  const [selected, setSelected] = useState<Client | null>(null);
  const [newOpen, setNewOpen] = useState(false);
  const [q, setQ] = useState("");

  const filtered = useMemo(
    () =>
      clients.filter(
        (c) =>
          c.name.toLowerCase().includes(q.toLowerCase()) ||
          c.phone.includes(q),
      ),
    [clients, q],
  );

  return (
    <div className="space-y-4 lg:space-y-6">
      <div className="bg-panel border border-hairline rounded-xl p-3 sm:p-4 flex flex-col sm:flex-row gap-3 sm:items-center">
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar cliente por nome ou telefone…"
          className="flex-1"
        />
        <Button onClick={() => setNewOpen(true)} className="gap-2">
          <Plus className="size-4" /> Novo cliente
        </Button>
      </div>

      <div className="bg-panel border border-hairline rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[720px]">
            <thead className="bg-muted/50 text-[10px] uppercase tracking-widest text-muted-foreground">
              <tr>
                <th className="text-left px-4 py-3 font-semibold">Cliente</th>
                <th className="text-left px-4 py-3 font-semibold">Telefone</th>
                <th className="text-right px-4 py-3 font-semibold">Corridas</th>
                <th className="text-right px-4 py-3 font-semibold">Faturado</th>
                <th className="text-left px-4 py-3 font-semibold">Última</th>
                <th className="text-left px-4 py-3 font-semibold">Avaliação</th>
                <th className="text-left px-4 py-3 font-semibold">Motorista fav.</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline">
              {filtered.map((c) => {
                const list = ridesByClient(c.id);
                const total = list.filter((r) => r.status === "concluida").reduce((s, r) => s + r.price, 0);
                return (
                  <tr
                    key={c.id}
                    onClick={() => setSelected(c)}
                    className="hover:bg-muted/30 cursor-pointer"
                  >
                    <td className="px-4 py-3 font-semibold">{c.name}</td>
                    <td className="px-4 py-3 tabular-nums text-muted-foreground">{c.phone}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{c.ridesTotal}</td>
                    <td className="px-4 py-3 text-right tabular-nums font-bold">{money(total)}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{c.lastRide}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 text-xs font-semibold">
                        <Star className="size-3 fill-ember text-ember" />
                        {c.rating.toFixed(1)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs">{getDriverName(c.favoriteDriverId)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <ClientDrawer client={selected} onClose={() => setSelected(null)} />
      <NewClientDialog open={newOpen} onOpenChange={setNewOpen} />
    </div>
  );
}

function ClientDrawer({ client, onClose }: { client: Client | null; onClose: () => void }) {
  const { ridesByClient, getDriverName } = useRides();
  const list = client ? ridesByClient(client.id) : [];
  const total = list.filter((r) => r.status === "concluida").reduce((s, r) => s + r.price, 0);

  return (
    <Sheet open={!!client} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        {client && (
          <>
            <SheetHeader>
              <SheetTitle>{client.name}</SheetTitle>
              <SheetDescription className="flex items-center gap-2">
                <Phone className="size-3" /> {client.phone}
              </SheetDescription>
            </SheetHeader>
            <div className="mt-6 space-y-6">
              <div className="grid grid-cols-3 gap-2">
                <Stat label="Corridas" value={String(client.ridesTotal)} />
                <Stat label="Faturado" value={money(total)} />
                <Stat label="Avaliação" value={client.rating.toFixed(1)} />
              </div>

              <div>
                <h4 className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-2">
                  Endereços favoritos
                </h4>
                <ul className="space-y-1.5">
                  {client.favorites.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm">
                      <MapPin className="size-3.5 text-muted-foreground" /> {f}
                    </li>
                  ))}
                  {client.favorites.length === 0 && (
                    <li className="text-xs text-muted-foreground">Nenhum endereço salvo.</li>
                  )}
                </ul>
              </div>

              {client.favoriteDriverId && (
                <div>
                  <h4 className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-2">
                    Motorista favorito
                  </h4>
                  <p className="text-sm font-medium">{getDriverName(client.favoriteDriverId)}</p>
                </div>
              )}

              <div>
                <h4 className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-2">
                  Histórico ({list.length})
                </h4>
                <div className="space-y-1.5">
                  {list.map((r) => {
                    const sm = rideStatusMeta(r.status);
                    return (
                      <div
                        key={r.id}
                        className="p-2.5 border border-hairline rounded-lg flex items-start justify-between gap-2"
                      >
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">
                            {r.origin} → {r.destination}
                          </p>
                          <p className="text-[11px] text-muted-foreground tabular-nums">
                            {r.scheduledFor ?? r.createdAt} · {getDriverName(r.driverId)}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-sm font-bold tabular-nums">{money(r.price)}</p>
                          <span className={`inline-flex mt-1 px-1.5 py-0.5 rounded text-[10px] font-semibold ${sm.chip}`}>
                            {sm.label}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                  {list.length === 0 && (
                    <p className="text-xs text-muted-foreground">Sem corridas ainda.</p>
                  )}
                </div>
              </div>

              {client.notes && (
                <div>
                  <h4 className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-2">
                    Observações
                  </h4>
                  <p className="text-sm">{client.notes}</p>
                </div>
              )}
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-muted/60 rounded-lg p-2 text-center">
      <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</p>
      <p className="text-sm font-bold tabular-nums mt-0.5">{value}</p>
    </div>
  );
}

function NewClientDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const { addClient } = useRides();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");

  function submit() {
    if (!name.trim() || !phone.trim()) return toast.error("Nome e telefone são obrigatórios.");
    addClient({ name: name.trim(), phone: phone.trim(), notes: notes.trim() || undefined });
    setName("");
    setPhone("");
    setNotes("");
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Novo cliente</DialogTitle>
        </DialogHeader>
        <div className="grid gap-3">
          <div>
            <Label>Nome</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <Label>Telefone</Label>
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+55 (11) …" />
          </div>
          <div>
            <Label>Observações</Label>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={submit}>Cadastrar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
