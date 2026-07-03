import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import {
  clients as seedClients,
  initialRides,
  initialOpStatus,
  drivers,
  type Client,
  type Ride,
  type RideStatus,
  type OpStatus,
} from "@/lib/mock-data";
import { toast } from "sonner";

interface RidesStore {
  clients: Client[];
  rides: Ride[];
  opStatus: Record<string, OpStatus>;
  createRide: (r: Omit<Ride, "id" | "status" | "createdAt"> & { scheduledFor?: string }) => Ride;
  updateRide: (id: string, patch: Partial<Ride>) => void;
  cancelRide: (id: string) => void;
  assignRide: (rideId: string, driverId: string) => void;
  setRideStatus: (id: string, status: RideStatus) => void;
  setDriverStatus: (driverId: string, status: OpStatus) => void;
  addClient: (c: Omit<Client, "id" | "ridesTotal" | "lastRide" | "rating" | "favorites"> & Partial<Client>) => Client;
  getClient: (id: string) => Client | undefined;
  getDriverName: (id?: string) => string;
  ridesByClient: (clientId: string) => Ride[];
  ridesByDriver: (driverId: string) => Ride[];
}

const Ctx = createContext<RidesStore | null>(null);

export function RidesProvider({ children }: { children: ReactNode }) {
  const [clientsList, setClients] = useState<Client[]>(seedClients);
  const [rides, setRides] = useState<Ride[]>(initialRides);
  const [opStatus, setOp] = useState<Record<string, OpStatus>>(initialOpStatus);

  const now = () => new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

  const createRide: RidesStore["createRide"] = useCallback((r) => {
    const ride: Ride = {
      id: `r${Date.now()}`,
      status: r.driverId ? "aceita" : "procurando",
      createdAt: now(),
      ...r,
    };
    setRides((rs) => [ride, ...rs]);
    toast.success("Corrida criada", { description: `${ride.origin} → ${ride.destination}` });
    return ride;
  }, []);

  const updateRide: RidesStore["updateRide"] = useCallback((id, patch) => {
    setRides((rs) => rs.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }, []);

  const cancelRide = useCallback((id: string) => {
    setRides((rs) => rs.map((r) => (r.id === id ? { ...r, status: "cancelada" as RideStatus } : r)));
    toast("Corrida cancelada");
  }, []);

  const assignRide: RidesStore["assignRide"] = useCallback((rideId, driverId) => {
    setRides((rs) =>
      rs.map((r) => (r.id === rideId ? { ...r, driverId, status: "aceita" as RideStatus } : r)),
    );
    const d = drivers.find((x) => x.id === driverId);
    toast.success(`Enviada para ${d?.name ?? "motorista"}`, {
      description: "Notificação WhatsApp simulada.",
    });
  }, []);

  const setRideStatus: RidesStore["setRideStatus"] = useCallback((id, status) => {
    setRides((rs) => rs.map((r) => (r.id === id ? { ...r, status } : r)));
  }, []);

  const setDriverStatus: RidesStore["setDriverStatus"] = useCallback((driverId, status) => {
    setOp((o) => ({ ...o, [driverId]: status }));
  }, []);

  const addClient: RidesStore["addClient"] = useCallback((c) => {
    const client: Client = {
      id: `c${Date.now()}`,
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
    toast.success("Cliente cadastrado", { description: client.name });
    return client;
  }, []);

  const value = useMemo<RidesStore>(
    () => ({
      clients: clientsList,
      rides,
      opStatus,
      createRide,
      updateRide,
      cancelRide,
      assignRide,
      setRideStatus,
      setDriverStatus,
      addClient,
      getClient: (id) => clientsList.find((c) => c.id === id),
      getDriverName: (id) => (id ? drivers.find((d) => d.id === id)?.name ?? "—" : "—"),
      ridesByClient: (id) => rides.filter((r) => r.clientId === id),
      ridesByDriver: (id) => rides.filter((r) => r.driverId === id),
    }),
    [clientsList, rides, opStatus, createRide, updateRide, cancelRide, assignRide, setRideStatus, setDriverStatus, addClient],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useRides() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useRides must be used within RidesProvider");
  return v;
}
