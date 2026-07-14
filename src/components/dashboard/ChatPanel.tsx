import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, Info, Paperclip, Send, Smile, X } from "lucide-react";
import {
  drivers as mockDrivers,
  messagesByDriver,
  statusColor,
  statusLabel,
  LABELS,
  labelById,
  priorityMeta,
  type Driver,
  type Message,
  type LabelId,
} from "@/lib/mock-data";
import { useRides } from "@/lib/rides-store";

export function ChatPanel({ focusDriverId }: { focusDriverId?: string } = {}) {
  const { drivers: realDrivers } = useRides();

  // Merge: real DB drivers first, plus any mock-only ids (for demo conversations).
  const allDrivers = useMemo<Driver[]>(() => {
    const byId = new Map<string, Driver>();
    for (const d of realDrivers) byId.set(d.id, d);
    for (const d of mockDrivers) if (!byId.has(d.id)) byId.set(d.id, d);
    return Array.from(byId.values());
  }, [realDrivers]);

  const resolveId = (id: string | undefined, list: Driver[]) => {
    if (list.length === 0) return "";
    if (!id) return list[0].id;
    return list.some((d) => d.id === id) ? id : list[0].id;
  };

  const [selectedId, setSelectedId] = useState<string>(() => resolveId(focusDriverId, allDrivers));
  const [threads, setThreads] = useState<Record<string, Message[]>>(() => ({
    ...messagesByDriver,
  }));
  const [draft, setDraft] = useState("");
  const [mobileView, setMobileView] = useState<"list" | "chat">(focusDriverId ? "chat" : "list");
  const [contextOpen, setContextOpen] = useState(false);
  const [filter, setFilter] = useState<LabelId | "all">("all");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (focusDriverId) {
      setSelectedId(resolveId(focusDriverId, allDrivers));
      setMobileView("chat");
    }
  }, [focusDriverId, allDrivers]);

  // If the current selection disappears (e.g. drivers loaded after mount), fall back.
  useEffect(() => {
    if (allDrivers.length > 0 && !allDrivers.some((d) => d.id === selectedId)) {
      setSelectedId(allDrivers[0].id);
    }
  }, [allDrivers, selectedId]);

  const filteredDrivers = useMemo(
    () => (filter === "all" ? allDrivers : allDrivers.filter((d) => d.labels.includes(filter))),
    [filter, allDrivers],
  );

  const selected: Driver | undefined =
    allDrivers.find((d) => d.id === selectedId) ?? allDrivers[0] ?? mockDrivers[0];
  const messages = selected ? threads[selected.id] ?? [] : [];

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [selectedId, messages.length]);

  function send() {
    const text = draft.trim();
    if (!text) return;
    const now = new Date();
    const time = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
    const msg: Message = {
      id: `m-${Date.now()}`,
      driverId: selectedId,
      direction: "out",
      text,
      time,
      status: "sent",
    };
    setThreads((prev) => ({
      ...prev,
      [selectedId]: [...(prev[selectedId] ?? []), msg],
    }));
    setDraft("");
  }

  return (
    <div className="lg:grid lg:grid-cols-12 lg:gap-6 h-full min-h-0 flex flex-col">
      {!selected && (
        <div className="col-span-12 p-8 text-center text-sm text-muted-foreground">
          Nenhum motorista disponível ainda. Cadastre um motorista para iniciar conversas.
        </div>
      )}
      {selected && (<>

      {/* Conversations list */}
      <div
        className={`lg:col-span-3 bg-panel border border-hairline rounded-xl flex-col overflow-hidden ${
          mobileView === "list" ? "flex" : "hidden"
        } lg:flex h-full min-h-0`}
      >
        <div className="px-4 py-3 border-b border-hairline">
          <h3 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
            Conversas
          </h3>
        </div>
        <div className="px-3 py-2 border-b border-hairline flex gap-1 overflow-x-auto">
          <FilterChip active={filter === "all"} onClick={() => setFilter("all")}>
            Todas
          </FilterChip>
          {LABELS.map((l) => (
            <FilterChip
              key={l.id}
              active={filter === l.id}
              onClick={() => setFilter(l.id)}
            >
              {l.name}
            </FilterChip>
          ))}
        </div>
        <div className="flex-1 overflow-y-auto divide-y divide-hairline">
          {filteredDrivers.map((d) => (
            <ConversationRow
              key={d.id}
              driver={d}
              last={threads[d.id]?.at(-1)}
              active={d.id === selectedId}
              onClick={() => {
                setSelectedId(d.id);
                setMobileView("chat");
              }}
            />
          ))}
          {filteredDrivers.length === 0 && (
            <div className="px-4 py-8 text-center text-xs text-muted-foreground">
              Nenhuma conversa com esta etiqueta
            </div>
          )}
        </div>
      </div>

      {/* Chat window */}
      <div
        className={`lg:col-span-6 bg-panel border border-hairline rounded-xl flex-col overflow-hidden ${
          mobileView === "chat" ? "flex" : "hidden"
        } lg:flex h-full min-h-0`}
      >
        <div className="p-3 sm:p-4 border-b border-hairline flex justify-between items-center bg-muted/40 gap-3">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <button
              onClick={() => setMobileView("list")}
              className="lg:hidden p-1.5 -ml-1 rounded hover:bg-muted shrink-0"
              aria-label="Voltar"
            >
              <ArrowLeft className="size-4" />
            </button>
            <div className="size-9 rounded-full bg-muted flex items-center justify-center text-xs font-bold shrink-0">
              {selected.initials}
            </div>
            <div className="min-w-0">
              <h4 className="text-sm font-bold flex items-center gap-2 truncate">
                <span className="truncate">{selected.name}</span>
                <span className="text-[10px] font-normal text-muted-foreground shrink-0">
                  #{selected.code}
                </span>
              </h4>
              <p className="text-[11px] text-success font-medium flex items-center gap-1.5 truncate">
                <span className={`size-1.5 rounded-full shrink-0 ${statusColor(selected.status)}`} />
                <span className="truncate">
                  {statusLabel(selected.status)} • {selected.route}
                </span>
              </p>
            </div>
          </div>
          <button
            onClick={() => setContextOpen(true)}
            className="text-[11px] font-semibold text-muted-foreground hover:text-foreground px-2 py-1 rounded hover:bg-muted transition-colors flex items-center gap-1 shrink-0"
          >
            <Info className="size-3.5 lg:hidden" />
            <span className="hidden lg:inline">Detalhes</span>
          </button>
        </div>

        <div ref={scrollRef} className="flex-1 p-4 sm:p-6 space-y-4 overflow-y-auto bg-background/40">
          {messages.map((m) => (
            <MessageBubble key={m.id} m={m} />
          ))}
        </div>

        <div className="p-2 sm:p-3 border-t border-hairline bg-panel">
          <div className="flex items-end gap-1.5 sm:gap-2">
            <button className="p-2 text-muted-foreground hover:text-foreground rounded hover:bg-muted transition-colors hidden sm:block">
              <Paperclip className="size-4" />
            </button>
            <button className="p-2 text-muted-foreground hover:text-foreground rounded hover:bg-muted transition-colors hidden sm:block">
              <Smile className="size-4" />
            </button>
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send();
                }
              }}
              rows={1}
              placeholder={`Responder a ${selected.name.split(" ")[0]}…`}
              className="flex-1 resize-none bg-muted/50 border border-hairline rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ember/40 max-h-32 min-w-0"
            />
            <button
              onClick={send}
              disabled={!draft.trim()}
              className="bg-navy text-navy-foreground px-3 sm:px-4 py-2 rounded-lg text-sm font-bold hover:bg-navy/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 active:scale-95 shrink-0"
            >
              <Send className="size-4" />
              <span className="hidden sm:inline">Enviar</span>
            </button>
          </div>
        </div>
      </div>

      {/* Driver context panel - desktop */}
      <div className="col-span-3 space-y-4 min-h-0 overflow-y-auto hidden lg:block">
        <DriverContext driver={selected} />
      </div>

      {/* Driver context - mobile drawer */}
      {contextOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="flex-1 bg-black/40" onClick={() => setContextOpen(false)} />
          <div className="w-80 max-w-[85vw] bg-background border-l border-hairline overflow-y-auto p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold">Detalhes</h3>
              <button
                onClick={() => setContextOpen(false)}
                className="p-1.5 rounded hover:bg-muted"
                aria-label="Fechar"
              >
                <X className="size-4" />
              </button>
            </div>
            <DriverContext driver={selected} />
          </div>
        </div>
      )}
    </div>
  );
}

function ConversationRow({
  driver,
  last,
  active,
  onClick,
}: {
  driver: Driver;
  last?: Message;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-4 py-3 transition-colors relative ${
        active ? "bg-muted/70" : "hover:bg-muted/40"
      }`}
    >
      {active && <span className="absolute left-0 top-0 bottom-0 w-0.5 bg-ember" />}
      <div className="flex items-start gap-3">
        <span
          className={`size-1.5 rounded-full mt-3 shrink-0 ${priorityMeta(driver.priority).dot}`}
          title={`Prioridade ${priorityMeta(driver.priority).label}`}
        />
        <div className={`size-9 rounded-full bg-muted flex items-center justify-center text-[11px] font-bold shrink-0 relative ring-2 ${priorityMeta(driver.priority).ring}`}>
          {driver.initials}
          <span
            className={`absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full ring-2 ring-panel ${statusColor(
              driver.status,
            )}`}
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-baseline gap-2">
            <span className="text-sm font-semibold truncate">{driver.name}</span>
            <span className="text-[10px] text-muted-foreground shrink-0 tabular-nums">
              {last?.time ?? "—"}
            </span>
          </div>
          <p className="text-[12px] text-muted-foreground truncate">
            {last?.direction === "out" ? "Você: " : ""}
            {last?.text ?? "Sem mensagens"}
          </p>
          {driver.labels.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1.5">
              {driver.labels.slice(0, 3).map((l) => {
                const def = labelById(l);
                return (
                  <span
                    key={l}
                    className={`text-[9px] font-semibold px-1.5 py-0.5 rounded ${def.color} ${def.text}`}
                  >
                    {def.name}
                  </span>
                );
              })}
            </div>
          )}
        </div>
        {driver.unread > 0 && (
          <span className="size-4 bg-ember text-ember-foreground text-[10px] font-bold rounded-full flex items-center justify-center shrink-0 self-center">
            {driver.unread}
          </span>
        )}
      </div>
    </button>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`shrink-0 text-[10px] font-semibold uppercase tracking-wider px-2 py-1 rounded-full border transition-colors ${
        active
          ? "bg-navy text-navy-foreground border-navy"
          : "bg-transparent text-muted-foreground border-hairline hover:text-foreground hover:border-foreground/30"
      }`}
    >
      {children}
    </button>
  );
}

function MessageBubble({ m }: { m: Message }) {
  const out = m.direction === "out";
  return (
    <div className={`flex flex-col ${out ? "items-end" : "items-start"}`}>
      <div
        className={`p-3 rounded-2xl max-w-[85%] sm:max-w-[80%] text-sm leading-relaxed ${
          out
            ? "bg-navy text-navy-foreground rounded-tr-sm"
            : "bg-muted text-foreground rounded-tl-sm"
        } ${m.kind === "audio" ? "italic" : ""}`}
      >
        {m.kind === "audio" ? "▶ " : ""}
        {m.text}
      </div>
      <span className="text-[10px] text-muted-foreground mt-1 tabular-nums">
        {m.time}
        {out && m.status ? ` · ${m.status === "read" ? "✓✓" : "✓"}` : ""}
      </span>
    </div>
  );
}

function DriverContext({ driver }: { driver: Driver }) {
  const max = Math.max(...driver.activity7d);
  const days = ["S", "T", "Q", "Q", "S", "S", "D"];
  return (
    <>
      <div className="bg-panel border border-hairline rounded-xl p-5">
        <h3 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-4">
          Motorista
        </h3>
        <div className="flex items-center gap-3 mb-4">
          <div className="size-11 rounded-full bg-navy text-navy-foreground flex items-center justify-center text-sm font-bold shrink-0">
            {driver.initials}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold leading-tight truncate">{driver.name}</p>
            <p className="text-[11px] text-muted-foreground truncate">{driver.phone}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 mb-4">
          <Stat label="Msgs hoje" value={driver.messagesToday.toString()} />
          <Stat label="TMR" value={driver.avgResponse} accent />
        </div>

        <h4 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mt-5 mb-2">
          Atividade 7d
        </h4>
        <div className="flex items-end gap-1 h-20">
          {driver.activity7d.map((v, i) => (
            <div
              key={i}
              className={`flex-1 rounded-t-sm ${
                i === driver.activity7d.length - 1 ? "bg-ember" : "bg-navy/20"
              }`}
              style={{ height: `${(v / max) * 100}%` }}
              title={`${v} msgs`}
            />
          ))}
        </div>
        <div className="flex justify-between text-[10px] text-muted-foreground mt-1 font-medium">
          {days.map((d, i) => <span key={i}>{d}</span>)}
        </div>
      </div>

      <div className="bg-panel border border-hairline rounded-xl p-5">
        <h3 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-3">
          Operação
        </h3>
        <div className="flex justify-between items-center text-xs mb-2">
          <span className="text-muted-foreground">Entregas hoje</span>
          <span className="font-bold tabular-nums">
            {driver.deliveriesDone} / {driver.deliveriesTotal}
          </span>
        </div>
        <div className="w-full bg-muted h-1.5 rounded-full overflow-hidden">
          <div
            className="bg-ember h-full"
            style={{ width: `${(driver.deliveriesDone / driver.deliveriesTotal) * 100}%` }}
          />
        </div>
        <div className="mt-4 space-y-2 text-xs">
          <div className="flex justify-between gap-2">
            <span className="text-muted-foreground shrink-0">Rota atual</span>
            <span className="font-medium text-right truncate">{driver.route}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Última atividade</span>
            <span className="font-medium">{driver.lastActivity}</span>
          </div>
        </div>
      </div>
    </>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="bg-muted/60 p-2.5 rounded">
      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</p>
      <p className={`text-sm font-bold tabular-nums ${accent ? "text-ember" : ""}`}>{value}</p>
    </div>
  );
}
