import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Menu } from "lucide-react";
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "@fontsource/inter/700.css";

import { Sidebar, type Section } from "@/components/dashboard/Sidebar";
import { TopBar } from "@/components/dashboard/TopBar";
import { ChatPanel } from "@/components/dashboard/ChatPanel";
import { Analytics } from "@/components/dashboard/Analytics";
import { DriversView } from "@/components/dashboard/DriversView";
import { ReportsView } from "@/components/dashboard/ReportsView";
import { SettingsView } from "@/components/dashboard/SettingsView";
import { OverviewDashboard } from "@/components/dashboard/OverviewDashboard";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "DriverDesk — Central de despacho WhatsApp" },
      {
        name: "description",
        content:
          "Dashboard operacional em tempo real para gerenciar conversas de WhatsApp entre a central e até cinco motoristas, com prioridades, etiquetas e alertas.",
      },
      { property: "og:title", content: "DriverDesk — Central de despacho WhatsApp" },
      {
        property: "og:description",
        content:
          "Painel operacional ao vivo, inbox unificada com prioridades e etiquetas, e notificações da frota.",
      },
      { property: "og:type", content: "website" },
    ],
  }),
  component: Dashboard,
});

const titles: Record<Section, { title: string; subtitle: string }> = {
  overview: { title: "Painel operacional", subtitle: "Frota, filas e alertas em tempo real" },
  inbox: { title: "Inbox unificada", subtitle: "5 conversas em tempo real com os motoristas" },
  drivers: { title: "Motoristas", subtitle: "Cadastro e status da frota conectada" },
  analytics: { title: "Analytics", subtitle: "Volume, tempo de resposta e horários de pico" },
  reports: { title: "Relatórios", subtitle: "Exportações de desempenho por período" },
  settings: { title: "Configurações", subtitle: "Integração WhatsApp e número central" },
};

function Dashboard() {
  const [section, setSection] = useState<Section>("overview");
  const [navOpen, setNavOpen] = useState(false);
  const [inboxFocusDriver, setInboxFocusDriver] = useState<string | undefined>(undefined);
  const t = titles[section];

  function openInbox(driverId?: string) {
    setInboxFocusDriver(driverId);
    setSection("inbox");
  }

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      {navOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => setNavOpen(false)}
        />
      )}
      <div
        className={`fixed inset-y-0 left-0 z-50 transition-transform lg:static lg:translate-x-0 ${
          navOpen ? "translate-x-0" : "-translate-x-full"
        } lg:flex`}
      >
        <Sidebar
          active={section}
          onChange={(s) => {
            setSection(s);
            setNavOpen(false);
          }}
        />
      </div>

      <main className="flex-1 flex flex-col min-w-0">
        <TopBar onMenuClick={() => setNavOpen(true)} onOpenDriver={openInbox} />
        <div className="px-4 sm:px-6 lg:px-8 py-4 lg:py-5 border-b border-hairline bg-panel flex items-center gap-3">
          <button
            onClick={() => setNavOpen(true)}
            className="lg:hidden p-2 -ml-2 rounded hover:bg-muted"
            aria-label="Abrir menu"
          >
            <Menu className="size-5" />
          </button>
          <div className="min-w-0">
            <h2 className="text-lg lg:text-xl font-bold tracking-tight truncate">{t.title}</h2>
            <p className="text-xs text-muted-foreground mt-1 truncate">{t.subtitle}</p>
          </div>
        </div>
        <div className="flex-1 min-h-0 overflow-auto p-3 sm:p-4 lg:p-6">
          {section === "overview" && <OverviewDashboard onOpenInbox={openInbox} />}
          {section === "inbox" && <ChatPanel focusDriverId={inboxFocusDriver} />}
          {section === "drivers" && <DriversView />}
          {section === "analytics" && <Analytics />}
          {section === "reports" && <ReportsView />}
          {section === "settings" && <SettingsView />}
        </div>
      </main>
    </div>
  );
}
