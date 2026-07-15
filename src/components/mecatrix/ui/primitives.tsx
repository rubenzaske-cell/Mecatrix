"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import type { Status } from "@/data/catalog";

export function PageContainer({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("px-4 py-6 sm:px-6 lg:px-8 lg:py-8 max-w-7xl mx-auto w-full", className)}>
      {children}
    </div>
  );
}

export function PageHeading({
  eyebrow, title, description, actions,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between mb-6">
      <div className="min-w-0">
        {eyebrow && (
          <div className="text-[11px] font-semibold tracking-[0.2em] uppercase text-amber mb-1.5">
            {eyebrow}
          </div>
        )}
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">{title}</h2>
        {description && (
          <p className="text-sm text-muted-foreground mt-1.5 max-w-2xl">{description}</p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
    </div>
  );
}

export function GlassCard({ children, className, ...props }: React.ComponentProps<typeof Card>) {
  return (
    <Card
      className={cn("mcx-glass mcx-inset-ring border-border/60 rounded-2xl", className)}
      {...props}
    >
      {children}
    </Card>
  );
}

// Normalize various status naming conventions to the canonical ok/warn/crit.
function normalizeStatus(status: string): Status {
  const s = String(status || "").toLowerCase();
  if (s === "ok" || s === "normal" || s === "healthy" || s === "good") return "ok";
  if (s === "warn" || s === "inspection" || s === "inspect" || s === "warning" || s === "moderate") return "warn";
  if (s === "crit" || s === "critical" || s === "severe" || s === "fail" || s === "failed") return "crit";
  return "ok";
}

export function StatusDot({ status, className }: { status: Status | string; className?: string }) {
  const st = normalizeStatus(status);
  const map: Record<Status, string> = {
    ok: "bg-[oklch(0.72_0.17_150)]",
    warn: "bg-[oklch(0.78_0.17_75)]",
    crit: "bg-[oklch(0.68_0.21_25)]",
  };
  return (
    <span className={cn("relative inline-flex h-2.5 w-2.5 rounded-full", map[st], className)}>
      <span className={cn("absolute inline-flex h-full w-full rounded-full opacity-60 animate-ping", map[st])} />
    </span>
  );
}

export function StatusBadge({ status, label }: { status: Status | string; label?: string }) {
  const st = normalizeStatus(status);
  const map: Record<Status, { cls: string; text: string }> = {
    ok: { cls: "mcx-bg-ok text-[oklch(0.72_0.17_150)] border-[oklch(0.72_0.17_150)_/_0.3]", text: label ?? "Normal" },
    warn: { cls: "mcx-bg-warn text-[oklch(0.78_0.17_75)] border-[oklch(0.78_0.17_75)_/_0.3]", text: label ?? "Inspect" },
    crit: { cls: "mcx-bg-crit text-[oklch(0.68_0.21_25)] border-[oklch(0.68_0.21_25)_/_0.3]", text: label ?? "Critical" },
  };
  const s = map[st];
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium", s.cls)}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {s.text}
    </span>
  );
}

export function LevelBadge({ level }: { level: string }) {
  const colors: Record<string, string> = {
    Beginner: "bg-emerald/15 text-emerald border-emerald/30",
    Intermediate: "bg-amber/15 text-amber border-amber/30",
    Advanced: "bg-[oklch(0.78_0.17_75)]/15 text-[oklch(0.78_0.17_75)] border-[oklch(0.78_0.17_75)]/30",
    Expert: "bg-[oklch(0.68_0.21_25)]/15 text-[oklch(0.68_0.21_25)] border-[oklch(0.68_0.21_25)]/30",
    Easy: "bg-emerald/15 text-emerald border-emerald/30",
    Medium: "bg-amber/15 text-amber border-amber/30",
    Hard: "bg-[oklch(0.68_0.21_25)]/15 text-[oklch(0.68_0.21_25)] border-[oklch(0.68_0.21_25)]/30",
  };
  return (
    <span className={cn("inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold", colors[level] ?? "bg-muted text-muted-foreground border-border")}>
      {level}
    </span>
  );
}

export function SectionTitle({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <h3 className={cn("text-sm font-semibold tracking-wide text-muted-foreground uppercase", className)}>
      {children}
    </h3>
  );
}

export function Stat({ label, value, sub, accent }: { label: string; value: React.ReactNode; sub?: string; accent?: string }) {
  return (
    <div className="rounded-xl border border-border/60 bg-card/50 p-3.5">
      <div className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className={cn("text-xl font-bold mt-1", accent)}>{value}</div>
      {sub && <div className="text-[11px] text-muted-foreground mt-0.5">{sub}</div>}
    </div>
  );
}

export function ProgressRing({ value, size = 56, stroke = 5, color = "var(--amber)" }: { value: number; size?: number; stroke?: number; color?: string }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (Math.min(100, Math.max(0, value)) / 100) * c;
  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="currentColor" strokeWidth={stroke} className="text-muted/30" />
      <circle
        cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke}
        strokeDasharray={c} strokeDashoffset={offset} strokeLinecap="round"
        style={{ transition: "stroke-dashoffset 0.6s ease" }}
      />
    </svg>
  );
}
