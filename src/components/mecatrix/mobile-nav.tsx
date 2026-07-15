"use client";

import { useNav } from "@/lib/mecatrix/nav-store";
import { NAV_ITEMS, MOBILE_PRIMARY } from "@/lib/mecatrix/nav-config";
import { cn } from "@/lib/utils";
import { Menu, MoreHorizontal, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "./theme-toggle";
import { MecatrixLogo } from "./logo";

export function MobileNav() {
  const { view, setView, setSidebarOpen } = useNav();

  const primary = MOBILE_PRIMARY.map((id) => NAV_ITEMS.find((n) => n.id === id)!).filter(Boolean);

  return (
    <>
      {/* Mobile top bar */}
      <header className="lg:hidden sticky top-0 z-30 h-14 flex items-center justify-between px-3 bg-background/80 backdrop-blur-xl border-b border-border">
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9"
          onClick={() => setSidebarOpen(true)}
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </Button>
        <button onClick={() => setView("home")} aria-label="Mecatrix home">
          <MecatrixLogo withText />
        </button>
        <ThemeToggle />
      </header>

      {/* Mobile bottom nav */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-30 mcx-glass border-t border-border mcx-safe-b" aria-label="Primary">
        <div className="grid grid-cols-5 max-w-md mx-auto">
          {primary.map((item) => {
            const active = view === item.id;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setView(item.id)}
                className={cn(
                  "relative flex flex-col items-center justify-center gap-1 py-2.5 text-[10px] font-medium transition-colors min-h-[52px]",
                  active ? "text-amber" : "text-muted-foreground"
                )}
              >
                {active && <span className="absolute top-0 h-0.5 w-8 rounded-full bg-amber" />}
                <Icon className="h-[20px] w-[20px]" />
                <span className="truncate max-w-[60px]">{item.short}</span>
              </button>
            );
          })}
          <button
            onClick={() => setSidebarOpen(true)}
            className="flex flex-col items-center justify-center gap-1 py-2.5 text-[10px] font-medium text-muted-foreground min-h-[52px]"
          >
            <MoreHorizontal className="h-[20px] w-[20px]" />
            <span>More</span>
          </button>
        </div>
      </nav>
    </>
  );
}
