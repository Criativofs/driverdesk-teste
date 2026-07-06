import { useState } from "react";
import { useRides } from "@/lib/rides-store";

export function SettingsView() {
  const { settings, updateCentralNumber } = useRides();
  const [centralNumber, setCentralNumber] = useState(settings.centralNumber);

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="bg-panel border border-hairline rounded-xl p-6">
        <h3 className="text-sm font-bold mb-1">Integração WhatsApp</h3>
        <p className="text-xs text-muted-foreground mb-5">
          O painel já está conectado ao banco real. Salve o número central usado na operação.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label className="block">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              Número central
            </span>
            <input
              value={centralNumber}
              onChange={(event) => setCentralNumber(event.target.value)}
              placeholder="+55 (11) 99999-9999"
              className="mt-1.5 w-full bg-background border border-hairline rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ember/40"
            />
          </label>
          <Field label="Phone Number ID" placeholder="ex: 105954172352xxx" />
          <Field label="WhatsApp Business Account ID" placeholder="ex: 108764729xxx" />
          <Field label="Access Token" placeholder="EAAG..." type="password" />
        </div>
        <div className="flex justify-end mt-6">
          <button
            onClick={() => updateCentralNumber(centralNumber)}
            className="text-xs font-bold px-4 py-2 rounded-lg bg-navy text-navy-foreground hover:bg-navy/90 transition-colors"
          >
            Salvar conexão
          </button>
        </div>
      </div>

      <div className="bg-panel border border-hairline rounded-xl p-6">
        <h3 className="text-sm font-bold mb-1">Número central</h3>
        <p className="text-xs text-muted-foreground mb-4">
          Todas as respostas do painel saem deste número.
        </p>
        <div className="flex items-center gap-3">
          <span className="tabular-nums font-bold">{settings.centralNumber}</span>
          <span className="text-[10px] font-bold uppercase tracking-widest bg-success/15 text-success px-2 py-0.5 rounded">
            {settings.whatsappConnected ? "Ativo" : "Pendente"}
          </span>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  placeholder,
  type = "text",
}: {
  label: string;
  placeholder?: string;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
        {label}
      </span>
      <input
        type={type}
        placeholder={placeholder}
        className="mt-1.5 w-full bg-background border border-hairline rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ember/40"
      />
    </label>
  );
}
