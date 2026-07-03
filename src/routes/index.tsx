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

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "LogiFlow Hub — Central de despacho WhatsApp" },
      {
        name: "description",
        content:
          "Dashboard operacional para gerenciar conversas de WhatsApp entre um número central de controle e até cinco motoristas, com métricas em tempo real.",
      },
      { property: "og:title", content: "LogiFlow Hub — Central de despacho WhatsApp" },
      {
        property: "og:description",
        content:
          "Inbox unificada, respostas do número central e analytics de operação em um só painel.",
      },
      { property: "og:type", content: "website" },
    ],
  }),
  component: Dashboard,
});

const titles: Record<Section, { title: string; subtitle: string }> = {
  inbox: { title: "Inbox unificada", subtitle: "5 conversas em tempo real com os motoristas" },
  drivers: { title: "Motoristas", subtitle: "Cadastro e status da frota conectada" },
  analytics: { title: "Analytics", subtitle: "Volume, tempo de resposta e horários de pico" },
  reports: { title: "Relatórios", subtitle: "Exportações de desempenho por período" },
  settings: { title: "Configurações", subtitle: "Integração WhatsApp e número central" },
};

function Dashboard() {
  const [section, setSection] = useState<Section>("inbox");
  const [navOpen, setNavOpen] = useState(false);
  const t = titles[section];

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      {/* Mobile drawer overlay */}
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
        <TopBar onMenuClick={() => setNavOpen(true)} />
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
          {section === "inbox" && <ChatPanel />}
          {section === "drivers" && <DriversView />}
          {section === "analytics" && <Analytics />}
          {section === "reports" && <ReportsView />}
          {section === "settings" && <SettingsView />}
        </div>
      </main>
    </div>
  );
}
