import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import brandIcon from "@/assets/drivedesk-icon.png.asset.json";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Entrar — DriveDesk" },
      { name: "description", content: "Acesse o painel operacional do DriveDesk." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuthPage,
});

type Mode = "signin" | "signup" | "forgot";

async function routeByRole(userId: string, navigate: (path: string) => void) {
  const { data } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId);
  const roles = (data ?? []).map((r) => r.role);
  if (roles.includes("admin") || roles.includes("operator")) {
    navigate("/");
  } else {
    toast.error("Sua conta ainda não tem acesso ao painel. Fale com um administrador.");
    await supabase.auth.signOut();
  }
}

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) routeByRole(data.user.id, (p) => navigate({ to: p }));
    });
  }, [navigate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "forgot") {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: window.location.origin + "/reset-password",
        });
        if (error) throw error;
        toast.success("Enviamos um link de recuperação para o seu e-mail.");
        setMode("signin");
      } else if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { name },
          },
        });
        if (error) throw error;
        if (data.user) {
          toast.success("Conta criada. Entrando...");
          await routeByRole(data.user.id, (p) => navigate({ to: p }));
        } else {
          toast.success("Verifique seu e-mail para confirmar a conta.");
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        if (data.user) await routeByRole(data.user.id, (p) => navigate({ to: p }));
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Falha na autenticação");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setLoading(true);
    try {
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin + "/auth",
      });
      if (result.error) throw result.error;
      const { data } = await supabase.auth.getUser();
      if (data.user) await routeByRole(data.user.id, (p) => navigate({ to: p }));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Falha no login Google");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-3">
          <div className="mx-auto size-14 rounded-xl bg-navy flex items-center justify-center overflow-hidden">
            <img src={brandIcon.url} alt="DriveDesk" className="size-10 object-contain" />
          </div>
          <CardTitle className="text-2xl">DriveDesk</CardTitle>
          <CardDescription>
            {mode === "signin"
              ? "Entre no painel operacional"
              : mode === "signup"
                ? "Crie sua conta de operador"
                : "Recuperar acesso à sua conta"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={handleGoogle}
            disabled={loading}
          >
            Continuar com Google
          </Button>

          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <div className="h-px flex-1 bg-border" />
            ou
            <div className="h-px flex-1 bg-border" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            {mode === "signup" && (
              <div className="space-y-1.5">
                <Label htmlFor="name">Nome</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  autoComplete="name"
                />
              </div>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                autoComplete={mode === "signin" ? "current-password" : "new-password"}
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {mode === "signin" ? "Entrar" : "Criar conta"}
            </Button>
          </form>

          <button
            type="button"
            onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
            className="w-full text-xs text-muted-foreground hover:text-foreground"
          >
            {mode === "signin"
              ? "Não tem conta? Criar conta de operador"
              : "Já tem conta? Entrar"}
          </button>
        </CardContent>
      </Card>
    </div>
  );
}
