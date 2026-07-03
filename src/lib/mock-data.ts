export type DriverStatus = "online" | "idle" | "offline";

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
}

export interface Message {
  id: string;
  driverId: string;
  direction: "in" | "out";
  text: string;
  time: string; // HH:mm
  status?: "sent" | "delivered" | "read";
  kind?: "text" | "audio" | "image";
}

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

// heatmap: 2 rows (manhã/tarde) x 7 cols (08h-20h em 2h)
export const heatmap: number[] = [
  10, 22, 45, 60, 55, 30, 12, // manhã à tarde
  18, 40, 78, 92, 70, 42, 20, // tarde à noite
];

export const kpiToday = {
  messages: 1240,
  activeDrivers: 4,
  totalDrivers: 5,
  avgResponse: "52s",
  resolutionRate: "92.4%",
  peakWindow: "14h–16h",
};

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
