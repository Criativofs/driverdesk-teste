import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

const sendSchema = z.object({
  to: z.string().min(6), // telefone destino em E.164 (ex: 5544991365212)
  body: z.string().min(1).max(4000),
  driverId: z.string().uuid().optional(),
  rideId: z.string().uuid().optional(),
});

/**
 * Envia uma mensagem de texto pela WhatsApp Cloud API (Meta)
 * e registra em public.messages.
 */
export const sendWhatsappMessage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => sendSchema.parse(input))
  .handler(async ({ data, context }) => {
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
    const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;

    if (!phoneNumberId || !accessToken) {
      return {
        ok: false as const,
        error:
          "WhatsApp não configurado. Faltam WHATSAPP_PHONE_NUMBER_ID ou WHATSAPP_ACCESS_TOKEN.",
      };
    }

    const to = data.to.replace(/\D/g, "");

    const resp = await fetch(
      `https://graph.facebook.com/v21.0/${phoneNumberId}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          recipient_type: "individual",
          to,
          type: "text",
          text: { preview_url: false, body: data.body },
        }),
      },
    );

    const json = await resp.json().catch(() => ({}));
    if (!resp.ok) {
      console.error("[whatsapp send] error", json);
      return {
        ok: false as const,
        error:
          json?.error?.message ??
          `Falha ao enviar (HTTP ${resp.status}). Verifique o número e o token.`,
      };
    }

    const waMessageId: string | null =
      json?.messages?.[0]?.id ?? null;

    await context.supabase.from("messages").insert({
      driver_id: data.driverId ?? null,
      ride_id: data.rideId ?? null,
      direction: "out",
      kind: "text",
      body: data.body,
      wa_message_id: waMessageId,
      status: "sent",
      operator_id: context.userId,
    });

    return { ok: true as const, waMessageId };
  });
