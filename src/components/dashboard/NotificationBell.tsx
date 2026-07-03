import { useEffect, useRef, useState } from "react";
import { Bell } from "lucide-react";
import { notifications as initial, type AppNotification } from "@/lib/mock-data";

export function NotificationBell({ onOpenDriver }: { onOpenDriver?: (driverId: string) => void }) {
  const [items, setItems] = useState<AppNotification[]>(initial);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const unread = items.filter((n) => n.unread).length;

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  function markAllRead() {
    setItems((prev) => prev.map((n) => ({ ...n, unread: false })));
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative p-2 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
        aria-label="Notificações"
      >
        <Bell className="size-4" />
        {unread > 0 && (
          <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 bg-ember text-ember-foreground text-[9px] font-bold rounded-full flex items-center justify-center">
            {unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 max-w-[90vw] bg-panel border border-hairline rounded-xl shadow-lg z-50 overflow-hidden">
          <div className="px-4 py-3 border-b border-hairline flex items-center justify-between">
            <h3 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
              Notificações
            </h3>
            <button
              onClick={markAllRead}
              className="text-[10px] font-semibold text-ember hover:underline"
            >
              Marcar como lidas
            </button>
          </div>
          <div className="max-h-96 overflow-y-auto divide-y divide-hairline">
            {items.map((n) => (
              <button
                key={n.id}
                onClick={() => {
                  if (n.driverId) onOpenDriver?.(n.driverId);
                  setItems((prev) => prev.map((x) => x.id === n.id ? { ...x, unread: false } : x));
                  setOpen(false);
                }}
                className="w-full text-left px-4 py-3 hover:bg-muted transition-colors flex gap-2.5 items-start"
              >
                <span className={`size-1.5 rounded-full mt-1.5 shrink-0 ${n.unread ? "bg-ember" : "bg-transparent"}`} />
                <div className="min-w-0 flex-1">
                  <p className={`text-xs leading-snug ${n.unread ? "font-semibold" : "font-normal text-muted-foreground"}`}>
                    {n.title}
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{n.time}</p>
                </div>
              </button>
            ))}
            {items.length === 0 && (
              <div className="px-4 py-8 text-center text-xs text-muted-foreground">
                Nenhuma notificação
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
