"use client";

import * as React from "react";
import Link from "next/link";
import { useNav } from "@/lib/mecatrix/nav-store";
import { NAV_ITEMS, GROUP_LABELS, type NavItem } from "@/lib/mecatrix/nav-config";
import { MecatrixLogo } from "./logo";
import { ThemeToggle } from "./theme-toggle";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Sidebar() {
  const { view, setView, sidebarOpen, setSidebarOpen } = useNav();

  const groups = React.useMemo(() => {
    const map: Record<string, NavItem[]> = {};
    for (const item of NAV_ITEMS) {
      (map[item.group] ||= []).push(item);
    }
    return map;
  }, []);

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-[270px] flex flex-col",
          "bg-sidebar text-sidebar-foreground border-r border-sidebar-border",
          "transition-transform duration-300 ease-out lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 h-16 border-b border-sidebar-border shrink-0">
          <button onClick={() => setView("home")} className="transition-opacity hover:opacity-80">
            <MecatrixLogo />
          </button>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden h-9 w-9"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto mcx-scroll px-3 py-4 space-y-6">
          {(Object.keys(groups) as NavItem["group"][]).map((g) => (
            <div key={g}>
              <div className="px-3 mb-2 text-[10px] font-semibold tracking-[0.18em] uppercase text-muted-foreground">
                {GROUP_LABELS[g]}
              </div>
              <div className="space-y-1">
                {groups[g].map((item) => {
                  const active = view === item.id;
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setView(item.id)}
                      className={cn(
                        "group relative w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all",
                        active
                          ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                          : "text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent/60"
                      )}
                    >
                      {active && (
                        <span className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-r-full bg-amber" />
                      )}
                      <Icon className={cn("h-[18px] w-[18px] shrink-0", active && "text-amber")} />
                      <span className="truncate">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer status */}
        <div className="px-3 pb-4 pt-3 border-t border-sidebar-border shrink-0">
          <div className="flex items-center justify-between rounded-xl bg-sidebar-accent/60 p-3">
            <div className="flex items-center gap-2.5">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full rounded-full bg-emerald opacity-75 animate-ping" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald" />
              </span>
              <div className="text-xs">
                <div className="font-medium">MecaAI Online</div>
                <div className="text-muted-foreground text-[10px]">Engineer mode</div>
              </div>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </aside>
    </>
  );
}
