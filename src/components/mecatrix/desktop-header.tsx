"use client";

import * as React from "react";
import { useNav } from "@/lib/mecatrix/nav-store";
import { NAV_ITEMS } from "@/lib/mecatrix/nav-config";
import { ThemeToggle } from "./theme-toggle";
import { Search, Bell, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function DesktopHeader() {
  const { view, setView } = useNav();
  const current = NAV_ITEMS.find((n) => n.id === view);
  const [time, setTime] = React.useState<string>("");

  React.useEffect(() => {
    const update = () =>
      setTime(
        new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
      );
    update();
    const t = setInterval(update, 30_000);
    return () => clearInterval(t);
  }, []);

  return (
    <header className="hidden lg:flex sticky top-0 z-20 h-16 items-center justify-between gap-4 px-6 bg-background/70 backdrop-blur-xl border-b border-border">
      <div className="flex items-center gap-3 min-w-0">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="text-[15px] font-semibold tracking-tight truncate">
              {current?.label ?? "Dashboard"}
            </h1>
            {current && (
              <span className="hidden xl:inline text-xs text-muted-foreground truncate">
                · {current.description}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="hidden xl:flex items-center gap-2 text-xs text-muted-foreground mr-2">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald animate-pulse" />
          All systems nominal · {time}
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 rounded-full"
          aria-label="Search"
        >
          <Search className="h-[18px] w-[18px]" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 rounded-full relative"
          aria-label="Notifications"
        >
          <Bell className="h-[18px] w-[18px]" />
          <span className="absolute top-2 right-2 h-1.5 w-1.5 rounded-full bg-amber" />
        </Button>
        <Button
          onClick={() => setView("meca-ai")}
          className={cn(
            "rounded-full h-9 gap-2 pl-3 pr-4",
            "bg-gradient-to-r from-amber to-amber/80 text-amber-foreground hover:opacity-90"
          )}
        >
          <Sparkles className="h-4 w-4" />
          Ask MecaAI
        </Button>
        <ThemeToggle />
      </div>
    </header>
  );
}
