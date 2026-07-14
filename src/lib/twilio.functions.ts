import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

const schema = z.object({
  from: z.string().min(6), // ex: +14155238886 (Twilio WhatsApp Sandbox)
  to: z.string().min(6),   // ex: +5544991365212 (número já registrado no sandbox)
  body: z.string().min(1).max(1500),
});

/**
 * Envia mensagem WhatsApp via Twilio (Sandbox ou número aprovado)
 * usando o Lovable Connector Gateway. O gateway injeta Account SID e auth
 * automaticamente — só passamos From/To/Body.
 */
export const sendTwilioWhatsapp = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => schema.parse(input))
  .handler(async ({ data }) => {
    const lovableKey = process.env.LOVABLE_API_KEY;
    const twilioKey = process.env.TWILIO_API_KEY;

    if (!lovableKey || !twilioKey) {
      return {
        ok: false as const,
        error:
          "Twilio não configurado. Faltam LOVABLE_API_KEY ou TWILIO_API_KEY (reconecte o Twilio em Integrações).",
      };
    }

    const normalize = (n: string) => {
      const trimmed = n.trim();
      if (trimmed.startsWith("whatsapp:")) return trimmed;
      const digits = trimmed.replace(/[^\d+]/g, "");
      const plus = digits.startsWith("+") ? digits : `+${digits}`;
      return `whatsapp:${plus}`;
    };

    const form = new URLSearchParams({
      From: normalize(data.from),
      To: normalize(data.to),
      Body: data.body,
    });

    const resp = await fetch(
      "https://connector-gateway.lovable.dev/twilio/Messages.json",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${lovableKey}`,
          "X-Connection-Api-Key": twilioKey,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: form.toString(),
      },
    );

    const text = await resp.text();
    let json: any = {};
    try {
      json = JSON.parse(text);
    } catch {
      // resposta não-JSON (raro)
    }

    if (!resp.ok) {
      console.error("[twilio send] HTTP", resp.status, text);
      return {
        ok: false as const,
        status: resp.status,
        error:
          json?.message ??
          json?.error?.message ??
          `Falha Twilio (HTTP ${resp.status}). ${text.slice(0, 300)}`,
        code: json?.code ?? null,
      };
    }

    return {
      ok: true as const,
      sid: json?.sid ?? null,
      status: json?.status ?? "queued",
      to: json?.to ?? null,
      from: json?.from ?? null,
    };
  });
