import { createFileRoute } from "@tanstack/react-router";

// One-shot bootstrap endpoint: sets a password for a given user id when the
// caller provides the matching BOOTSTRAP_TOKEN. Meant to be invoked once from
// the Lovable admin console, then removed.
export const Route = createFileRoute("/api/public/bootstrap-password")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const token = request.headers.get("x-bootstrap-token");
        const expected = process.env.BOOTSTRAP_TOKEN;
        if (!expected || token !== expected) {
          return new Response("Unauthorized", { status: 401 });
        }
        const { userId, password } = (await request.json()) as {
          userId: string;
          password: string;
        };
        if (!userId || !password || password.length < 8) {
          return new Response("Bad Request", { status: 400 });
        }
        const { supabaseAdmin } = await import(
          "@/integrations/supabase/client.server"
        );
        const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
          password,
        });
        if (error) {
          return new Response(error.message, { status: 500 });
        }
        return Response.json({ ok: true });
      },
    },
  },
});
