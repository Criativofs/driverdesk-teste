import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  type Client,
  type Driver,
  type DriverStatus,
  type LabelId,
  type Priority,
  type Ride,
  type RideStatus,
  type OpStatus,
} from "@/lib/mock-data";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

interface AppSettings {
  centralNumber: string;
  centralLabel: string;
  whatsappConnected: boolean;
}

interface RidesStore {
  clients: Client[];
  drivers: Driver[];
  rides: Ride[];
  loading: boolean;
  settings: AppSettings;
  opStatus: Record<string, OpStatus>;
  createRide: (r: Omit<Ride, "id" | "status" | "createdAt"> & { scheduledFor?: string }) => Ride;
  updateRide: (id: string, patch: Partial<Ride>) => void;
  cancelRide: (id: string) => void;
  assignRide: (rideId: string, driverId: string) => void;
  setRideStatus: (id: string, status: RideStatus) => void;
  setDriverStatus: (driverId: string, status: OpStatus) => void;
  addClient: (c: Omit<Client, "id" | "ridesTotal" | "lastRide" | "rating" | "favorites"> & Partial<Client>) => Client;
  addDriver: (d: { name: string; phone: string; code?: string }) => void;
  updateCentralNumber: (centralNumber: string) => void;
  getClient: (id: string) => Client | undefined;
  getDriverName: (id?: string) => string;
  ridesByClient: (clientId: string) => Ride[];
  ridesByDriver: (driverId: string) => Ride[];
}

const Ctx = createContext<RidesStore | null>(null);
const DEFAULT_SETTINGS: AppSettings = {
  centralNumber: "+55 (11) 99876-5432",
  centralLabel: "Central de Controle",
  whatsappConnected: false,
};

function uuid() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function clock(value?: string | null) {
  const date = value ? new Date(value) : new Date();
  return date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

function relative(value?: string | null) {
  if (!value) return "agora";
  const minutes = Math.max(0, Math.round((Date.now() - new Date(value).getTime()) / 60000));
  if (minutes < 1) return "agora";
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h`;
  return `${Math.round(hours / 24)} dias`;
}

function lastRide(value?: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  const today = new Date();
  const sameDay = date.toDateString() === today.toDateString();
  return sameDay ? `hoje ${clock(value)}` : date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
}

function scheduleLabel(value?: string | null) {
  if (!value) return undefined;
  const date = new Date(value);
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const day = date.toDateString() === tomorrow.toDateString() ? "Amanhã" : date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
  return `${day} ${clock(value)}`;
}

function scheduleInputToIso(value?: string) {
  const text = value?.trim();
  if (!text) return null;
  const tomorrowMatch = text.match(/^amanh[ãa]\s+(\d{1,2}):(\d{2})$/i);
  if (tomorrowMatch) {
    const date = new Date();
    date.setDate(date.getDate() + 1);
    date.setHours(Number(tomorrowMatch[1]), Number(tomorrowMatch[2]), 0, 0);
    return date.toISOString();
  }
  const parsed = new Date(text);
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
}

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "M";
}

function labelsFor(opStatus: OpStatus): LabelId[] {
  if (opStatus === "cliente_embarcado") return ["em-viagem"];
  if (opStatus === "indo_buscar") return ["frete"];
  if (opStatus === "pausa") return ["parado"];
  if (opStatus === "finalizando") return ["descarga"];
  if (opStatus === "offline") return ["parado"];
  return ["aguardando"];
}

function priorityFor(status: DriverStatus, opStatus: OpStatus): Priority {
  if (opStatus === "pausa") return "critical";
  if (status === "idle" || opStatus === "finalizando") return "high";
  return "normal";
}

function mapDriver(row: Tables<"drivers">): Driver {
  const priority = priorityFor(row.status, row.op_status);
  const minutesSinceReply = row.last_activity_at
    ? Math.max(1, Math.round((Date.now() - new Date(row.last_activity_at).getTime()) / 60000))
    : row.status === "offline" ? 120 : 2;
  return {
    id: row.id,
    code: row.code,
    name: row.name,
    initials: initials(row.name),
    phone: row.phone,
    status: row.status,
    route: row.route ?? "Sem rota ativa",
    lastActivity: relative(row.last_activity_at ?? row.updated_at),
    avgResponse: "—",
    unread: priority === "critical" ? 2 : 0,
    messagesToday: 0,
    activity7d: [0, 0, 0, 0, 0, 0, 0],
    deliveriesDone: 0,
    deliveriesTotal: 1,
    priority,
    labels: labelsFor(row.op_status),
    minutesSinceReply,
  };
}

function mapClient(row: Tables<"clients">): Client {
  return {
    id: row.id,
    name: row.name,
    phone: row.phone,
    favorites: row.favorites ?? [],
    ridesTotal: row.rides_total,
    lastRide: lastRide(row.last_ride_at),
    rating: Number(row.rating),
    favoriteDriverId: row.favorite_driver_id ?? undefined,
    notes: row.notes ?? undefined,
  };
}

function mapRide(row: Tables<"rides">): Ride {
  return {
    id: row.id,
    clientId: row.client_id,
    driverId: row.driver_id ?? undefined,
    origin: row.origin,
    destination: row.destination,
    price: Number(row.price),
    status: row.status,
    createdAt: clock(row.created_at),
    scheduledFor: scheduleLabel(row.scheduled_for),
    notes: row.notes ?? undefined,
  };
}

export function RidesProvider({ children }: { children: ReactNode }) {
  const [clientsList, setClients] = useState<Client[]>([]);
  const [driversList, setDrivers] = useState<Driver[]>([]);
  const [rides, setRides] = useState<Ride[]>([]);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [opStatus, setOp] = useState<Record<string, OpStatus>>({});
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const [clientsRes, driversRes, ridesRes, settingsRes] = await Promise.all([
      supabase.from("clients").select("*").order("created_at", { ascending: false }),
      supabase.from("drivers").select("*").eq("active", true).order("code", { ascending: true }),
      supabase.from("rides").select("*").order("created_at", { ascending: false }),
      supabase.from("app_settings").select("*").eq("id", "main").maybeSingle(),
    ]);

    const error = clientsRes.error ?? driversRes.error ?? ridesRes.error ?? settingsRes.error;
    if (error) throw error;

    const driverRows = driversRes.data ?? [];
    setClients((clientsRes.data ?? []).map(mapClient));
    setDrivers(driverRows.map(mapDriver));
    setRides((ridesRes.data ?? []).map(mapRide));
    setOp(Object.fromEntries(driverRows.map((driver) => [driver.id, driver.op_status])));

    if (settingsRes.data) {
      setSettings({
        centralNumber: settingsRes.data.central_number,
        centralLabel: settingsRes.data.central_label,
        whatsappConnected: settingsRes.data.whatsapp_connected,
      });
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    refresh()
      .catch((error: Error) => toast.error(error.message || "Falha ao carregar dados do banco"))
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [refresh]);

  const createRide: RidesStore["createRide"] = useCallback((r) => {
    const ride: Ride = {
      id: uuid(),
      status: r.driverId ? "aceita" : "procurando",
      createdAt: clock(),
      ...r,
    };
    setRides((rs) => [ride, ...rs]);
    const insert: TablesInsert<"rides"> = {
      id: ride.id,
      client_id: ride.clientId,
      driver_id: ride.driverId ?? null,
      origin: ride.origin,
      destination: ride.destination,
      price: ride.price,
      status: ride.status,
      scheduled_for: scheduleInputToIso(ride.scheduledFor),
      notes: ride.notes ?? null,
    };
    void supabase.from("rides").insert(insert).then(({ error }) => {
      if (error) {
        toast.error(error.message || "Não foi possível criar a corrida");
        void refresh();
        return;
      }
      toast.success("Corrida criada", { description: `${ride.origin} → ${ride.destination}` });
      void refresh();
    });
    return ride;
  }, [refresh]);

  const updateRide: RidesStore["updateRide"] = useCallback((id, patch) => {
    setRides((rs) => rs.map((r) => (r.id === id ? { ...r, ...patch } : r)));
    const update: TablesUpdate<"rides"> = {};
    if (patch.clientId !== undefined) update.client_id = patch.clientId;
    if (patch.driverId !== undefined) update.driver_id = patch.driverId ?? null;
    if (patch.origin !== undefined) update.origin = patch.origin;
    if (patch.destination !== undefined) update.destination = patch.destination;
    if (patch.price !== undefined) update.price = patch.price;
    if (patch.status !== undefined) update.status = patch.status;
    if (patch.scheduledFor !== undefined) update.scheduled_for = scheduleInputToIso(patch.scheduledFor);
    if (patch.notes !== undefined) update.notes = patch.notes ?? null;
    void supabase.from("rides").update(update).eq("id", id).then(({ error }) => {
      if (error) {
        toast.error(error.message || "Não foi possível atualizar a corrida");
        void refresh();
      }
    });
  }, [refresh]);

  const cancelRide = useCallback((id: string) => {
    setRides((rs) => rs.map((r) => (r.id === id ? { ...r, status: "cancelada" as RideStatus } : r)));
    void supabase.from("rides").update({ status: "cancelada" }).eq("id", id).then(({ error }) => {
      if (error) {
        toast.error(error.message || "Não foi possível cancelar a corrida");
        void refresh();
      }
    });
    toast("Corrida cancelada");
  }, [refresh]);

  const assignRide: RidesStore["assignRide"] = useCallback((rideId, driverId) => {
    setRides((rs) =>
      rs.map((r) => (r.id === rideId ? { ...r, driverId, status: "aceita" as RideStatus } : r)),
    );
    void supabase.from("rides").update({ driver_id: driverId, status: "aceita" }).eq("id", rideId).then(({ error }) => {
      if (error) {
        toast.error(error.message || "Não foi possível enviar a corrida");
        void refresh();
      }
    });
    const d = driversList.find((x) => x.id === driverId);
    toast.success(`Enviada para ${d?.name ?? "motorista"}`, {
      description: "Corrida vinculada no banco real.",
    });
  }, [driversList, refresh]);

  const setRideStatus: RidesStore["setRideStatus"] = useCallback((id, status) => {
    setRides((rs) => rs.map((r) => (r.id === id ? { ...r, status } : r)));
    void supabase.from("rides").update({ status }).eq("id", id).then(({ error }) => {
      if (error) {
        toast.error(error.message || "Não foi possível alterar o status");
        void refresh();
      }
    });
  }, [refresh]);

  const setDriverStatus: RidesStore["setDriverStatus"] = useCallback((driverId, status) => {
    setOp((o) => ({ ...o, [driverId]: status }));
    void supabase.from("drivers").update({ op_status: status }).eq("id", driverId).then(({ error }) => {
      if (error) {
        toast.error(error.message || "Não foi possível atualizar o motorista");
        void refresh();
      }
    });
  }, [refresh]);

  const addClient: RidesStore["addClient"] = useCallback((c) => {
    const client: Client = {
      id: uuid(),
      name: c.name,
      phone: c.phone,
      favorites: c.favorites ?? [],
      ridesTotal: 0,
      lastRide: "—",
      rating: 5,
      notes: c.notes,
      favoriteDriverId: c.favoriteDriverId,
    };
    setClients((cs) => [client, ...cs]);
    const insert: TablesInsert<"clients"> = {
      id: client.id,
      name: client.name,
      phone: client.phone,
      favorites: client.favorites,
      rides_total: client.ridesTotal,
      rating: client.rating,
      favorite_driver_id: client.favoriteDriverId ?? null,
      notes: client.notes ?? null,
    };
    void supabase.from("clients").insert(insert).then(({ error }) => {
      if (error) {
        toast.error(error.message || "Não foi possível cadastrar o cliente");
        void refresh();
        return;
      }
      toast.success("Cliente cadastrado", { description: client.name });
      void refresh();
    });
    return client;
  }, [refresh]);

  const updateCentralNumber: RidesStore["updateCentralNumber"] = useCallback((centralNumber) => {
    const next = centralNumber.trim();
    if (!next) return toast.error("Informe o número central.");
    setSettings((current) => ({ ...current, centralNumber: next, whatsappConnected: true }));
    void supabase
      .from("app_settings")
      .upsert({ id: "main", central_number: next, central_label: settings.centralLabel, whatsapp_connected: true })
      .then(({ error }) => {
        if (error) {
          toast.error(error.message || "Não foi possível salvar o número");
          void refresh();
          return;
        }
        toast.success("Número central salvo no banco real");
      });
  }, [refresh, settings.centralLabel]);

  const value = useMemo<RidesStore>(
    () => ({
      clients: clientsList,
      drivers: driversList,
      rides,
      loading,
      settings,
      opStatus,
      createRide,
      updateRide,
      cancelRide,
      assignRide,
      setRideStatus,
      setDriverStatus,
      addClient,
      updateCentralNumber,
      getClient: (id) => clientsList.find((c) => c.id === id),
      getDriverName: (id) => (id ? driversList.find((d) => d.id === id)?.name ?? "—" : "—"),
      ridesByClient: (id) => rides.filter((r) => r.clientId === id),
      ridesByDriver: (id) => rides.filter((r) => r.driverId === id),
    }),
    [clientsList, driversList, rides, loading, settings, opStatus, createRide, updateRide, cancelRide, assignRide, setRideStatus, setDriverStatus, addClient, updateCentralNumber],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useRides() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useRides must be used within RidesProvider");
  return v;
}
