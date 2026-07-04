export type DriverStatus = "online" | "idle" | "offline";
export type Priority = "critical" | "high" | "normal";

export type LabelId =
  | "frete"
  | "aguardando"
  | "em-viagem"
  | "descarga"
  | "parado"
  | "problema-mecanico"
  | "nota-fiscal"
  | "pedagio"
  | "combustivel";

export interface LabelDef {
  id: LabelId;
  name: string;
  color: string; // tailwind bg class
  text: string; // tailwind text class
}

export const LABELS: LabelDef[] = [
  { id: "frete", name: "Frete", color: "bg-navy/15", text: "text-navy" },
  { id: "aguardando", name: "Aguardando", color: "bg-warning/20", text: "text-warning" },
  { id: "em-viagem", name: "Em viagem", color: "bg-success/20", text: "text-success" },
  { id: "descarga", name: "Descarga", color: "bg-navy/15", text: "text-navy" },
  { id: "parado", name: "Parado", color: "bg-muted", text: "text-muted-foreground" },
  { id: "problema-mecanico", name: "Problema mecânico", color: "bg-destructive/15", text: "text-destructive" },
  { id: "nota-fiscal", name: "Nota Fiscal", color: "bg-ember/15", text: "text-ember" },
  { id: "pedagio", name: "Pedágio", color: "bg-muted", text: "text-foreground" },
  { id: "combustivel", name: "Combustível", color: "bg-ember/15", text: "text-ember" },
];

export function labelById(id: LabelId): LabelDef {
  return LABELS.find((l) => l.id === id)!;
}

export interface Driver {
  id: string;
  code: string;
  name: string;
  initials: string;
  phone: string;
  status: DriverStatus;
  route: string;
  lastActivity: string;
  avgResponse: string;
  unread: number;
  messagesToday: number;
  activity7d: number[];
  deliveriesDone: number;
  deliveriesTotal: number;
  priority: Priority;
  labels: LabelId[];
  minutesSinceReply: number;
}

export interface Message {
  id: string;
  driverId: string;
  direction: "in" | "out";
  text: string;
  time: string;
  status?: "sent" | "delivered" | "read";
  kind?: "text" | "audio" | "image";
}

export const APP_NAME = "DriveDesk";
export const APP_TAGLINE = "Dispatch v1.0";
export const CENTRAL_NUMBER = "+55 (11) 99876-5432";
export const CENTRAL_LABEL = "Central de Controle";

export const drivers: Driver[] = [
  {
    id: "d1",
    code: "M-001",
    name: "Ricardo Silva",
    initials: "RS",
    phone: "+55 (11) 98842-1293",
    status: "online",
    route: "Rod. dos Bandeirantes • CD Jundiaí",
    lastActivity: "2 min",
    avgResponse: "45s",
    unread: 3,
    messagesToday: 42,
    activity7d: [12, 24, 18, 36, 28, 30, 42],
    deliveriesDone: 8,
    deliveriesTotal: 12,
    priority: "high",
    labels: ["em-viagem", "nota-fiscal"],
    minutesSinceReply: 2,
  },
  {
    id: "d2",
    code: "M-002",
    name: "Marcos Oliveira",
    initials: "MO",
    phone: "+55 (11) 98211-4477",
    status: "idle",
    route: "BR-116 • KM 242",
    lastActivity: "15 min",
    avgResponse: "1m 20s",
    unread: 2,
    messagesToday: 27,
    activity7d: [8, 14, 22, 19, 24, 20, 27],
    deliveriesDone: 5,
    deliveriesTotal: 9,
    priority: "critical",
    labels: ["parado", "problema-mecanico"],
    minutesSinceReply: 15,
  },
  {
    id: "d3",
    code: "M-003",
    name: "Ana Paula Ferreira",
    initials: "AP",
    phone: "+55 (11) 97744-2210",
    status: "online",
    route: "Marginal Tietê • Rota Centro",
    lastActivity: "agora",
    avgResponse: "32s",
    unread: 0,
    messagesToday: 31,
    activity7d: [18, 22, 26, 20, 34, 28, 31],
    deliveriesDone: 6,
    deliveriesTotal: 10,
    priority: "normal",
    labels: ["descarga"],
    minutesSinceReply: 1,
  },
  {
    id: "d4",
    code: "M-004",
    name: "Thiago Santos",
    initials: "TS",
    phone: "+55 (11) 96633-8850",
    status: "online",
    route: "Pátio 3 • Guarulhos",
    lastActivity: "5 min",
    avgResponse: "58s",
    unread: 0,
    messagesToday: 19,
    activity7d: [10, 12, 15, 17, 20, 18, 19],
    deliveriesDone: 4,
    deliveriesTotal: 7,
    priority: "normal",
    labels: ["aguardando", "nota-fiscal"],
    minutesSinceReply: 5,
  },
  {
    id: "d5",
    code: "M-005",
    name: "André Souza",
    initials: "AS",
    phone: "+55 (11) 95522-9911",
    status: "offline",
    route: "Check-out realizado",
    lastActivity: "2h",
    avgResponse: "1m 45s",
    unread: 0,
    messagesToday: 12,
    activity7d: [22, 18, 20, 14, 16, 10, 12],
    deliveriesDone: 9,
    deliveriesTotal: 9,
    priority: "normal",
    labels: ["frete"],
    minutesSinceReply: 120,
  },
];

export const messagesByDriver: Record<string, Message[]> = {
  d1: [
    { id: "m1", driverId: "d1", direction: "in", text: "Bom dia, saindo do CD agora com a carga completa.", time: "08:12" },
    { id: "m2", driverId: "d1", direction: "out", text: "Bom dia, Ricardo. Boa viagem. Confirme quando passar pelo pedágio.", time: "08:14", status: "read" },
    { id: "m3", driverId: "d1", direction: "in", text: "Cheguei no CD de Jundiaí, mas a nota fiscal está com erro no valor do frete. Como procedo?", time: "14:20" },
    { id: "m4", driverId: "d1", direction: "out", text: "Pode aguardar 5 minutos? Estou verificando com o financeiro agora mesmo.", time: "14:22", status: "read" },
    { id: "m5", driverId: "d1", direction: "in", text: "Áudio (0:12)", time: "14:25", kind: "audio" },
    { id: "m6", driverId: "d1", direction: "in", text: "Financeiro liberou. Posso seguir para descarga?", time: "14:31" },
  ],
  d2: [
    { id: "m7", driverId: "d2", direction: "in", text: "Pneu furado na BR-116 próximo ao KM 242. Chamando suporte.", time: "13:47" },
    { id: "m8", driverId: "d2", direction: "out", text: "Ciente. Acionei a assistência 24h. Tempo estimado 40 min.", time: "13:49", status: "delivered" },
    { id: "m9", driverId: "d2", direction: "in", text: "Guincho a caminho. Vou aguardar em local seguro.", time: "14:05" },
  ],
  d3: [
    { id: "m10", driverId: "d3", direction: "in", text: "Descarga concluída no cliente da Sé. Seguindo para próximo ponto.", time: "13:22" },
    { id: "m11", driverId: "d3", direction: "out", text: "Ótimo, Ana. Próxima parada Barra Funda.", time: "13:24", status: "read" },
  ],
  d4: [
    { id: "m12", driverId: "d4", direction: "in", text: "Aguardando liberação da nota fiscal no pátio 3.", time: "13:58" },
    { id: "m13", driverId: "d4", direction: "out", text: "Copiado. Falando com o pátio agora.", time: "14:00", status: "delivered" },
  ],
  d5: [
    { id: "m14", driverId: "d5", direction: "in", text: "Todas as entregas realizadas. Fazendo check-out.", time: "12:28" },
    { id: "m15", driverId: "d5", direction: "out", text: "Obrigado, André. Bom descanso.", time: "12:30", status: "read" },
  ],
};

export const messagesLast14Days = [
  { day: "01/10", recebidas: 220, enviadas: 180 },
  { day: "02/10", recebidas: 245, enviadas: 210 },
  { day: "03/10", recebidas: 198, enviadas: 175 },
  { day: "04/10", recebidas: 260, enviadas: 220 },
  { day: "05/10", recebidas: 280, enviadas: 240 },
  { day: "06/10", recebidas: 190, enviadas: 165 },
  { day: "07/10", recebidas: 150, enviadas: 130 },
  { day: "08/10", recebidas: 305, enviadas: 260 },
  { day: "09/10", recebidas: 322, enviadas: 285 },
  { day: "10/10", recebidas: 340, enviadas: 300 },
  { day: "11/10", recebidas: 295, enviadas: 255 },
  { day: "12/10", recebidas: 210, enviadas: 190 },
  { day: "13/10", recebidas: 275, enviadas: 240 },
  { day: "14/10", recebidas: 348, enviadas: 302 },
];

export const heatmap: number[] = [
  10, 22, 45, 60, 55, 30, 12,
  18, 40, 78, 92, 70, 42, 20,
];

export const kpiToday = {
  messages: 1240,
  activeDrivers: 4,
  totalDrivers: 5,
  avgResponse: "52s",
  resolutionRate: "92.4%",
  peakWindow: "14h–16h",
};

export type NotificationKind = "photo" | "silence" | "offline" | "nf" | "info";

export interface AppNotification {
  id: string;
  kind: NotificationKind;
  driverId?: string;
  title: string;
  time: string;
  unread: boolean;
}

export const notifications: AppNotification[] = [
  { id: "n1", kind: "photo", driverId: "d1", title: "Ricardo enviou uma foto da nota fiscal", time: "há 2 min", unread: true },
  { id: "n2", kind: "silence", driverId: "d2", title: "Marcos não responde há 15 minutos", time: "há 15 min", unread: true },
  { id: "n3", kind: "nf", driverId: "d4", title: "NF rejeitada — pátio 3 Guarulhos", time: "há 22 min", unread: true },
  { id: "n4", kind: "offline", driverId: "d5", title: "André ficou offline após check-out", time: "há 2 h", unread: false },
  { id: "n5", kind: "info", title: "Pico de operação detectado (14h–16h)", time: "há 3 h", unread: false },
];

export function statusColor(s: DriverStatus) {
  if (s === "online") return "bg-success";
  if (s === "idle") return "bg-warning";
  return "bg-muted-foreground/40";
}

export function statusLabel(s: DriverStatus) {
  if (s === "online") return "Online";
  if (s === "idle") return "Em pausa";
  return "Offline";
}

export function priorityMeta(p: Priority) {
  if (p === "critical") return { label: "Crítica", dot: "bg-destructive", ring: "ring-destructive/40", chip: "bg-destructive/15 text-destructive" };
  if (p === "high") return { label: "Alta", dot: "bg-ember", ring: "ring-ember/40", chip: "bg-ember/15 text-ember" };
  return { label: "Normal", dot: "bg-muted-foreground/40", ring: "ring-transparent", chip: "bg-muted text-muted-foreground" };
}

// ============================================================================
// Corridas ("Uber Particular")
// ============================================================================

export type OpStatus =
  | "disponivel"
  | "indo_buscar"
  | "cliente_embarcado"
  | "finalizando"
  | "pausa"
  | "offline";

export function opStatusMeta(s: OpStatus) {
  switch (s) {
    case "disponivel":
      return { label: "Disponível", emoji: "🟢", chip: "bg-success/15 text-success", dot: "bg-success" };
    case "indo_buscar":
      return { label: "Indo buscar", emoji: "🚗", chip: "bg-navy/15 text-navy", dot: "bg-navy" };
    case "cliente_embarcado":
      return { label: "Cliente embarcado", emoji: "👤", chip: "bg-ember/15 text-ember", dot: "bg-ember" };
    case "finalizando":
      return { label: "Finalizando", emoji: "🏁", chip: "bg-warning/20 text-warning", dot: "bg-warning" };
    case "pausa":
      return { label: "Em pausa", emoji: "☕", chip: "bg-muted text-muted-foreground", dot: "bg-muted-foreground/60" };
    case "offline":
      return { label: "Offline", emoji: "🔴", chip: "bg-muted text-muted-foreground", dot: "bg-muted-foreground/40" };
  }
}

// Mapa inicial: status de mensagem → status operacional
export const initialOpStatus: Record<string, OpStatus> = {
  d1: "cliente_embarcado",
  d2: "pausa",
  d3: "indo_buscar",
  d4: "disponivel",
  d5: "offline",
};

// Coordenadas iniciais (São Paulo) para simulação de frota
export const initialDriverLocations: Record<string, { lat: number; lng: number }> = {
  d1: { lat: -23.5505, lng: -46.6333 }, // Sé
  d2: { lat: -23.5975, lng: -46.6892 }, // Pinheiros
  d3: { lat: -23.5613, lng: -46.6565 }, // Av. Paulista
  d4: { lat: -23.5320, lng: -46.7920 }, // Osasco
  d5: { lat: -23.6820, lng: -46.7050 }, // Santo Amaro
};

export const MAP_CENTER = { lat: -23.5629, lng: -46.6544 };


export interface Client {
  id: string;
  name: string;
  phone: string;
  favorites: string[];
  ridesTotal: number;
  lastRide: string;
  rating: number;
  favoriteDriverId?: string;
  notes?: string;
}

export const clients: Client[] = [
  {
    id: "c1",
    name: "João Almeida",
    phone: "+55 (11) 99111-2020",
    favorites: ["Aeroporto GRU", "Av. Paulista, 900"],
    ridesTotal: 15,
    lastRide: "hoje 09:14",
    rating: 4.9,
    favoriteDriverId: "d1",
    notes: "Prefere carro grande",
  },
  {
    id: "c2",
    name: "Maria Santos",
    phone: "+55 (11) 98422-3311",
    favorites: ["Shopping Ibirapuera", "Hosp. Sírio-Libanês"],
    ridesTotal: 22,
    lastRide: "ontem 18:40",
    rating: 5.0,
    favoriteDriverId: "d3",
  },
  {
    id: "c3",
    name: "Carlos Nogueira",
    phone: "+55 (11) 97788-1102",
    favorites: ["Rodoviária Tietê"],
    ridesTotal: 4,
    lastRide: "3 dias",
    rating: 4.6,
  },
  {
    id: "c4",
    name: "Beatriz Lima",
    phone: "+55 (11) 96500-8844",
    favorites: ["Casa", "Trabalho — Faria Lima"],
    ridesTotal: 38,
    lastRide: "hoje 07:52",
    rating: 4.8,
    favoriteDriverId: "d4",
  },
];

export type RideStatus =
  | "procurando"
  | "aceita"
  | "indo_buscar"
  | "cliente_embarcado"
  | "em_andamento"
  | "finalizando"
  | "concluida"
  | "cancelada";

export function rideStatusMeta(s: RideStatus) {
  switch (s) {
    case "procurando":
      return { label: "Procurando motorista", chip: "bg-warning/20 text-warning" };
    case "aceita":
      return { label: "Aceita", chip: "bg-navy/15 text-navy" };
    case "indo_buscar":
      return { label: "Indo buscar", chip: "bg-navy/15 text-navy" };
    case "cliente_embarcado":
      return { label: "Cliente embarcado", chip: "bg-ember/15 text-ember" };
    case "em_andamento":
      return { label: "Em andamento", chip: "bg-ember/15 text-ember" };
    case "finalizando":
      return { label: "Finalizando", chip: "bg-warning/20 text-warning" };
    case "concluida":
      return { label: "Concluída", chip: "bg-success/15 text-success" };
    case "cancelada":
      return { label: "Cancelada", chip: "bg-destructive/15 text-destructive" };
  }
}

export interface Ride {
  id: string;
  clientId: string;
  driverId?: string;
  origin: string;
  destination: string;
  price: number;
  status: RideStatus;
  createdAt: string; // HH:MM
  scheduledFor?: string; // e.g. "Amanhã 05:00"
  notes?: string;
}

export const initialRides: Ride[] = [
  {
    id: "r1",
    clientId: "c1",
    driverId: "d1",
    origin: "Aeroporto GRU T3",
    destination: "Av. Paulista, 900",
    price: 68,
    status: "cliente_embarcado",
    createdAt: "09:12",
  },
  {
    id: "r2",
    clientId: "c2",
    driverId: "d3",
    origin: "Shopping Ibirapuera",
    destination: "Hosp. Sírio-Libanês",
    price: 42,
    status: "aceita",
    createdAt: "13:48",
  },
  {
    id: "r3",
    clientId: "c3",
    origin: "Rodoviária Tietê",
    destination: "Bairro Vila Mariana",
    price: 35,
    status: "procurando",
    createdAt: "14:02",
  },
  {
    id: "r4",
    clientId: "c4",
    driverId: "d4",
    origin: "Casa — Perdizes",
    destination: "Trabalho — Faria Lima",
    price: 29,
    status: "concluida",
    createdAt: "07:52",
  },
  {
    id: "r5",
    clientId: "c2",
    origin: "Casa",
    destination: "Aeroporto GRU",
    price: 85,
    status: "aceita",
    createdAt: "—",
    scheduledFor: "Amanhã 05:00",
  },
];

