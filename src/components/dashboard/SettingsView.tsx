import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, Send } from "lucide-react";
import { useRides } from "@/lib/rides-store";
import { sendTwilioWhatsapp } from "@/lib/twilio.functions";

export function SettingsView() {
  const { settings, updateCentralNumber } = useRides();
  const [centralNumber, setCentralNumber] = useState(settings.centralNumber);

  // Twilio WhatsApp Sandbox — padrão global do Twilio
  const [from, setFrom] = useState("+14155238886");
  const [to, setTo] = useState("+12295364396");
  const [body, setBody] = useState("Olá! Teste do DriverDesk via Twilio Sandbox 🚀");
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<
    | { kind: "ok"; sid: string | null; status: string }
    | { kind: "err"; message: string; code?: number | null }
    | null
  >(null);

  const sendWa = useServerFn(sendTwilioWhatsapp);

  async function handleSend() {
    setSending(true);
    setResult(null);
    try {
      const res = await sendWa({ data: { from, to, body } });
      if (res.ok) {
        setResult({ kind: "ok", sid: res.sid, status: res.status });
      } else {
        setResult({ kind: "err", message: res.error, code: res.code ?? null });
      }
    } catch (e: any) {
      setResult({ kind: "err", message: e?.message ?? "Erro inesperado" });
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Twilio WhatsApp Sandbox Test */}
      <div className="bg-panel border border-hairline rounded-xl p-6">
        <h3 className="text-sm font-bold mb-1">Teste WhatsApp (Twilio Sandbox)</h3>
        <p className="text-xs text-muted-foreground mb-4">
          Antes de testar: abra WhatsApp no seu celular e envie{" "}
          <code className="text-[11px] bg-muted px-1 py-0.5 rounded">join &lt;seu-código&gt;</code>{" "}
          para o número Sandbox do Twilio (padrão{" "}
          <code className="text-[11px] bg-muted px-1 py-0.5 rounded">+1 415 523 8886</code>). O
          código aparece em Twilio Console → Messaging → Try it out → Send a WhatsApp message.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label className="block">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              From (Sandbox Twilio)
            </span>
            <input
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              placeholder="+14155238886"
              className="mt-1.5 w-full bg-background border border-hairline rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-ember/40"
            />
          </label>
          <label className="block">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              To (seu número registrado)
            </span>
            <input
              value={to}
              onChange={(e) => setTo(e.target.value)}
              placeholder="+5544991365212"
              className="mt-1.5 w-full bg-background border border-hairline rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-ember/40"
            />
          </label>
          <label className="block sm:col-span-2">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              Mensagem
            </span>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={3}
              className="mt-1.5 w-full bg-background border border-hairline rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ember/40 resize-none"
            />
          </label>
        </div>

        <div className="flex items-center justify-between mt-5 gap-3 flex-wrap">
          <div className="text-[11px]">
            {result?.kind === "ok" && (
              <span className="text-success font-semibold">
                ✓ Enviado — status: {result.status}
                {result.sid ? ` · SID: ${result.sid.slice(0, 12)}…` : ""}
              </span>
            )}
            {result?.kind === "err" && (
              <span className="text-destructive font-semibold">
                ✗ {result.message}
                {result.code ? ` (code ${result.code})` : ""}
              </span>
            )}
          </div>
          <button
            onClick={handleSend}
            disabled={sending || !from.trim() || !to.trim() || !body.trim()}
            className="text-xs font-bold px-4 py-2 rounded-lg bg-navy text-navy-foreground hover:bg-navy/90 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {sending ? (
              <>
                <Loader2 className="size-3.5 animate-spin" /> Enviando…
              </>
            ) : (
              <>
                <Send className="size-3.5" /> Enviar teste
              </>
            )}
          </button>
        </div>
      </div>

      <div className="bg-panel border border-hairline rounded-xl p-6">
        <h3 className="text-sm font-bold mb-1">Número central</h3>
        <p className="text-xs text-muted-foreground mb-4">
          Todas as respostas do painel saem deste número.
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
        </div>
        <div className="flex items-center justify-between mt-5">
          <div className="flex items-center gap-3">
            <span className="tabular-nums font-bold">{settings.centralNumber}</span>
            <span className="text-[10px] font-bold uppercase tracking-widest bg-success/15 text-success px-2 py-0.5 rounded">
              {settings.whatsappConnected ? "Ativo" : "Pendente"}
            </span>
          </div>
          <button
            onClick={() => updateCentralNumber(centralNumber)}
            className="text-xs font-bold px-4 py-2 rounded-lg bg-navy text-navy-foreground hover:bg-navy/90 transition-colors"
          >
            Salvar
          </button>
        </div>
      </div>
    </div>
  );
}
