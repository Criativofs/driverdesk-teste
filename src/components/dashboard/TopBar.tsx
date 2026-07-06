import { LogOut, Menu } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { NotificationBell } from "./NotificationBell";
import { supabase } from "@/integrations/supabase/client";
import { useRides } from "@/lib/rides-store";


export function TopBar({
  operator = "Matriz Sul",
  onMenuClick,
  onOpenDriver,
}: {
  operator?: string;
  onMenuClick?: () => void;
  onOpenDriver?: (driverId: string) => void;
}) {
  const navigate = useNavigate();
  const { settings } = useRides();
  async function handleSignOut() {
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <header className="h-16 shrink-0 bg-panel border-b border-hairline px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-3">
      <div className="flex items-center gap-3 min-w-0">
        {onMenuClick && (
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 -ml-2 rounded hover:bg-muted shrink-0"
            aria-label="Abrir menu"
          >
            <Menu className="size-5" />
          </button>
        )}
        <div className="flex items-center gap-2 min-w-0">
          <span className="relative flex size-2 shrink-0">
            <span className="absolute inline-flex h-full w-full rounded-full bg-success opacity-60 animate-ping" />
            <span className="relative inline-flex rounded-full size-2 bg-success" />
          </span>
          <span className="text-xs sm:text-sm font-medium truncate">
            Central: {settings.centralNumber}
          </span>
          <span className="hidden sm:inline text-[10px] uppercase font-bold tracking-widest text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
            Real
          </span>
        </div>
      </div>
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        <NotificationBell onOpenDriver={onOpenDriver} />
        <div className="text-right hidden sm:block">
          <p className="text-xs font-bold">Operador: {operator}</p>
          <p className="text-[10px] text-muted-foreground">Sessão iniciada há 4h 12m</p>
        </div>
        <div className="size-8 bg-navy text-navy-foreground rounded-full flex items-center justify-center text-xs font-bold">
          MS
        </div>
        <button
          onClick={handleSignOut}
          className="p-2 rounded hover:bg-muted text-muted-foreground hover:text-foreground"
          aria-label="Sair"
          title="Sair"
        >
          <LogOut className="size-4" />
        </button>
      </div>
    </header>

  );
}

