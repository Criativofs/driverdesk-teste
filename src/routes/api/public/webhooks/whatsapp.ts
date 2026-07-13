import { createFileRoute } from "@tanstack/react-router";

/**
 * WhatsApp Cloud API webhook (Meta).
 * - GET: verificação inicial (hub.challenge) usando WHATSAPP_VERIFY_TOKEN
 * - POST: recebe mensagens de entrada e status de entrega e grava em public.messages
 *
 * URL pública desta rota:
 *   https://project--663d18aa-5a0c-45a8-924b-4abf93585c91.lovable.app/api/public/webhooks/whatsapp
 */
export const Route = createFileRoute("/api/public/webhooks/whatsapp")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const mode = url.searchParams.get("hub.mode");
        const token = url.searchParams.get("hub.verify_token");
        const challenge = url.searchParams.get("hub.challenge");

        const expected = process.env.WHATSAPP_VERIFY_TOKEN;
        if (mode === "subscribe" && token && expected && token === expected) {
          return new Response(challenge ?? "", { status: 200 });
        }
        return new Response("forbidden", { status: 403 });
      },

      POST: async ({ request }) => {
        const raw = await request.text();
        let payload: any;
        try {
          payload = JSON.parse(raw);
        } catch {
          return new Response("bad json", { status: 400 });
        }

        try {
          const { supabaseAdmin } = await import(
            "@/integrations/supabase/client.server"
          );

          const entries = payload?.entry ?? [];
          for (const entry of entries) {
            const changes = entry?.changes ?? [];
            for (const change of changes) {
              const value = change?.value ?? {};

              // Mensagens recebidas
              const messages = value.messages ?? [];
              for (const msg of messages) {
                const fromPhone = String(msg.from ?? "");
                const waId = String(msg.id ?? "");
                const kind: "text" | "image" | "audio" =
                  msg.type === "image"
                    ? "image"
                    : msg.type === "audio"
                      ? "audio"
                      : "text";
                const body =
                  msg.text?.body ??
                  msg.button?.text ??
                  msg.interactive?.button_reply?.title ??
                  msg.interactive?.list_reply?.title ??
                  null;
                const mediaUrl = msg.image?.id ?? msg.audio?.id ?? msg.document?.id ?? null;

                // Tenta casar com um motorista pelo telefone (últimos 10 dígitos)
                const digits = fromPhone.replace(/\D/g, "");
                const tail = digits.slice(-10);
                let driverId: string | null = null;
                if (tail.length >= 8) {
                  const { data: driver } = await supabaseAdmin
                    .from("drivers")
                    .select("id")
                    .ilike("phone", `%${tail}`)
                    .maybeSingle();
                  driverId = driver?.id ?? null;
                }

                await supabaseAdmin.from("messages").insert({
                  driver_id: driverId,
                  direction: "in",
                  kind,
                  body,
                  media_url: mediaUrl,
                  wa_message_id: waId,
                  status: "delivered",
                });
              }

              // Atualizações de status de entrega
              const statuses = value.statuses ?? [];
              const allowed = ["queued", "sent", "delivered", "read", "failed"] as const;
              type WaStatus = (typeof allowed)[number];
              for (const st of statuses) {
                const waId = String(st.id ?? "");
                const status = String(st.status ?? "") as WaStatus;
                if (!waId || !allowed.includes(status)) continue;
                await supabaseAdmin
                  .from("messages")
                  .update({ status })
                  .eq("wa_message_id", waId);
              }
            }
          }
        } catch (err) {
          console.error("[whatsapp webhook] error", err);
          // Sempre respondemos 200 para Meta não reenviar em loop
        }

        return new Response("ok", { status: 200 });
      },
    },
  },
});
