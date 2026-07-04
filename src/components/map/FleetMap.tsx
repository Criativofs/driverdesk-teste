import { useEffect, useMemo, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { drivers, initialDriverLocations, MAP_CENTER, opStatusMeta, type OpStatus } from "@/lib/mock-data";
import { useRides } from "@/lib/rides-store";
import { Button } from "@/components/ui/button";

const BROWSER_KEY = import.meta.env.VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_BROWSER_KEY as string | undefined;
const TRACKING_ID = import.meta.env.VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_TRACKING_ID as string | undefined;

declare global {
  interface Window {
    google?: any;
    __initFleetMap__?: () => void;
    __gmapsLoading__?: Promise<void>;
  }
}

function loadGoogleMaps(): Promise<void> {
  if (typeof window === "undefined") return Promise.reject(new Error("no window"));
  if (window.google?.maps) return Promise.resolve();
  if (window.__gmapsLoading__) return window.__gmapsLoading__;
  if (!BROWSER_KEY) return Promise.reject(new Error("Google Maps browser key ausente"));

  window.__gmapsLoading__ = new Promise<void>((resolve, reject) => {
    window.__initFleetMap__ = () => resolve();
    const channel = TRACKING_ID ? `&channel=${encodeURIComponent(TRACKING_ID)}` : "";
    const s = document.createElement("script");
    s.src = `https://maps.googleapis.com/maps/api/js?key=${BROWSER_KEY}&loading=async&callback=__initFleetMap__${channel}`;
    s.async = true;
    s.defer = true;
    s.onerror = () => reject(new Error("Falha ao carregar Google Maps"));
    document.head.appendChild(s);
  });
  return window.__gmapsLoading__;
}

// SVG marker colored per status
function pinSvg(color: string) {
  return {
    path: "M12 2C7.6 2 4 5.6 4 10c0 6 8 12 8 12s8-6 8-12c0-4.4-3.6-8-8-8z",
    fillColor: color,
    fillOpacity: 1,
    strokeColor: "#ffffff",
    strokeWeight: 2,
    scale: 1.6,
    anchor: null as any,
    labelOrigin: null as any,
  };
}

function statusColorHex(s: OpStatus): string {
  switch (s) {
    case "disponivel": return "#10b981";
    case "indo_buscar": return "#1e3a5f";
    case "cliente_embarcado": return "#f97316";
    case "finalizando": return "#f59e0b";
    case "pausa": return "#94a3b8";
    case "offline": return "#64748b";
  }
}

export function FleetMap({ compact = false }: { compact?: boolean }) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<Record<string, any>>({});
  const infoRef = useRef<any>(null);
  const [locations, setLocations] = useState(initialDriverLocations);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const { opStatus, rides, assignRide } = useRides();

  // Load Maps + init
  useEffect(() => {
    let cancelled = false;
    loadGoogleMaps()
      .then(() => {
        if (cancelled || !containerRef.current || !window.google) return;
        const g = window.google;
        mapRef.current = new g.maps.Map(containerRef.current, {
          center: MAP_CENTER,
          zoom: 12,
          disableDefaultUI: compact,
          zoomControl: !compact,
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: !compact,
          styles: [
            { featureType: "poi", stylers: [{ visibility: "off" }] },
            { featureType: "transit", stylers: [{ visibility: "off" }] },
          ],
        });
        infoRef.current = new g.maps.InfoWindow();
        setStatus("ready");
      })
      .catch((e: Error) => {
        setErrorMsg(e.message);
        setStatus("error");
      });
    return () => {
      cancelled = true;
    };
  }, [compact]);

  // Simulate drift
  useEffect(() => {
    const id = setInterval(() => {
      setLocations((prev) => {
        const next: typeof prev = { ...prev };
        for (const d of drivers) {
          const s = opStatus[d.id];
          if (s === "offline" || s === "pausa") continue;
          const cur = prev[d.id];
          if (!cur) continue;
          next[d.id] = {
            lat: cur.lat + (Math.random() - 0.5) * 0.004,
            lng: cur.lng + (Math.random() - 0.5) * 0.004,
          };
        }
        return next;
      });
    }, 3500);
    return () => clearInterval(id);
  }, [opStatus]);

  const pendingRides = useMemo(() => rides.filter((r) => r.status === "procurando"), [rides]);

  // Sync markers
  useEffect(() => {
    if (status !== "ready" || !mapRef.current || !window.google) return;
    const g = window.google;
    for (const d of drivers) {
      const loc = locations[d.id];
      if (!loc) continue;
      const s = opStatus[d.id] ?? "offline";
      const color = statusColorHex(s);
      let marker = markersRef.current[d.id];
      if (!marker) {
        marker = new g.maps.Marker({
          position: loc,
          map: mapRef.current,
          title: d.name,
          icon: pinSvg(color),
        });
        marker.addListener("click", () => {
          const meta = opStatusMeta(s);
          const html = `
            <div style="font-family:Inter,sans-serif;min-width:200px">
              <div style="font-weight:700;font-size:13px;margin-bottom:2px">${d.name}</div>
              <div style="font-size:11px;color:#64748b;margin-bottom:6px">${d.code} • ${meta.emoji} ${meta.label}</div>
              <div style="font-size:11px;color:#64748b">${d.route}</div>
              ${pendingRides.length ? `<button id="assign-${d.id}" style="margin-top:8px;background:#f97316;color:#fff;border:0;border-radius:6px;padding:6px 10px;font-size:12px;font-weight:600;cursor:pointer;width:100%">Enviar corrida (${pendingRides.length})</button>` : ""}
            </div>`;
          infoRef.current.setContent(html);
          infoRef.current.open({ anchor: marker, map: mapRef.current });
          if (pendingRides.length) {
            g.maps.event.addListenerOnce(infoRef.current, "domready", () => {
              const btn = document.getElementById(`assign-${d.id}`);
              btn?.addEventListener("click", () => {
                assignRide(pendingRides[0].id, d.id);
                infoRef.current.close();
              });
            });
          }
        });
        markersRef.current[d.id] = marker;
      } else {
        marker.setPosition(loc);
        marker.setIcon(pinSvg(color));
      }
    }
  }, [locations, opStatus, status, pendingRides, assignRide]);

  if (!BROWSER_KEY) {
    return (
      <div className="h-full min-h-[300px] flex items-center justify-center text-sm text-muted-foreground border border-dashed border-hairline rounded-xl">
        Conecte o Google Maps para exibir o mapa da frota.
      </div>
    );
  }

  return (
    <div className="relative h-full w-full">
      <div ref={containerRef} className="h-full w-full rounded-xl overflow-hidden bg-muted" />
      {status === "loading" && (
        <div className="absolute inset-0 flex items-center justify-center bg-panel/70 rounded-xl">
          <Loader2 className="size-5 animate-spin text-muted-foreground" />
        </div>
      )}
      {status === "error" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-panel/90 rounded-xl p-4 text-center">
          <p className="text-sm font-semibold">Não foi possível carregar o mapa</p>
          <p className="text-xs text-muted-foreground">{errorMsg}</p>
          <Button size="sm" variant="outline" onClick={() => window.location.reload()}>
            Tentar novamente
          </Button>
        </div>
      )}
      {!compact && (
        <div className="absolute top-3 left-3 bg-panel/95 border border-hairline rounded-lg p-3 shadow-sm text-[11px] space-y-1.5">
          <div className="font-semibold text-muted-foreground uppercase tracking-widest text-[10px] mb-1">
            Legenda
          </div>
          {(["disponivel", "indo_buscar", "cliente_embarcado", "finalizando", "pausa", "offline"] as OpStatus[]).map((s) => {
            const m = opStatusMeta(s);
            return (
              <div key={s} className="flex items-center gap-2">
                <span className="size-2.5 rounded-full" style={{ background: statusColorHex(s) }} />
                <span>{m.label}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
