"use client";

import { useNav } from "@/lib/mecatrix/nav-store";
import { MecatrixLogo } from "./logo";
import { Shield, Github, Twitter } from "lucide-react";

export function Footer() {
  const { setView } = useNav();
  return (
    <footer className="mt-auto border-t border-border bg-background/60 backdrop-blur">
      <div className="px-6 py-5 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <MecatrixLogo withText={false} />
            <div className="text-xs text-muted-foreground">
              <span className="font-medium text-foreground">Mecatrix</span> · AI-Powered
              Automotive Intelligence · v1.0
            </div>
          </div>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <button onClick={() => setView("training")} className="hover:text-foreground transition-colors">
              Training
            </button>
            <button onClick={() => setView("courses")} className="hover:text-foreground transition-colors">
              Courses
            </button>
            <button onClick={() => setView("history")} className="hover:text-foreground transition-colors">
              History
            </button>
            <span className="hidden sm:flex items-center gap-1.5">
              <Shield className="h-3.5 w-3.5 text-emerald" />
              Diagnostics are estimates, not guarantees
            </span>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-border/60 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-[11px] text-muted-foreground">
          <p>© {new Date().getFullYear()} Mecatrix. Built for learners, students & professionals.</p>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald" /> Engineered with MecaAI
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
