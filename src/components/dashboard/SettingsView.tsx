import { CENTRAL_NUMBER } from "@/lib/mock-data";

export function SettingsView() {
  return (
    <div className="space-y-6 max-w-3xl">
      <div className="bg-panel border border-hairline rounded-xl p-6">
        <h3 className="text-sm font-bold mb-1">Integração WhatsApp</h3>
        <p className="text-xs text-muted-foreground mb-5">
          A operação está rodando em modo mock. Conecte a WhatsApp Cloud API (Meta)
          para começar a receber e enviar mensagens reais.
        </p>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Phone Number ID" placeholder="ex: 105954172352xxx" />
          <Field label="WhatsApp Business Account ID" placeholder="ex: 108764729xxx" />
          <Field label="Access Token" placeholder="EAAG..." type="password" />
          <Field label="Verify Token (webhook)" placeholder="logiflow-webhook-2026" />
        </div>
        <div className="flex justify-end mt-6">
          <button className="text-xs font-bold px-4 py-2 rounded-lg bg-navy text-navy-foreground hover:bg-navy/90 transition-colors">
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
          <span className="tabular-nums font-bold">{CENTRAL_NUMBER}</span>
          <span className="text-[10px] font-bold uppercase tracking-widest bg-success/15 text-success px-2 py-0.5 rounded">
            Ativo
          </span>
        </div>
      </div>

      <div className="bg-muted/40 border border-dashed border-hairline rounded-xl p-6">
        <h3 className="text-sm font-bold mb-1">Escalabilidade</h3>
        <p className="text-xs text-muted-foreground">
          O sistema foi estruturado para acomodar mais motoristas, times de operadores e
          integrações. Ative o Lovable Cloud para persistir mensagens, autenticar
          operadores e habilitar webhooks da Meta com URL fixa.
        </p>
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
