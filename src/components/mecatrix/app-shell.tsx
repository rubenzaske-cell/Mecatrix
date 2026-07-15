"use client";

import * as React from "react";
import { Sidebar } from "./sidebar";
import { MobileNav } from "./mobile-nav";
import { DesktopHeader } from "./desktop-header";
import { Footer } from "./footer";
import { useNav } from "@/lib/mecatrix/nav-store";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function AppShell({ children }: { children: React.ReactNode }) {
  const { view } = useNav();

  return (
    <div className="min-h-screen flex bg-background text-foreground">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 lg:pl-[270px]">
        <MobileNav />
        <DesktopHeader />
        <main className="flex-1 flex flex-col min-w-0">
          <div className="relative flex-1">
            {/* Ambient background */}
            <div className="pointer-events-none absolute inset-0 mcx-grid-bg opacity-60" />
            <div className="pointer-events-none absolute inset-x-0 top-0 h-[420px] mcx-spotlight" />
            <AnimatePresence mode="wait">
              <motion.div
                key={view}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                className="relative"
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </div>
          <Footer />
        </main>
      </div>
    </div>
  );
}
