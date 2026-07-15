"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { useNav } from "@/lib/mecatrix/nav-store";
import { NAV_ITEMS } from "@/lib/mecatrix/nav-config";
import { PageContainer, GlassCard, Stat } from "@/components/mecatrix/ui/primitives";
import { cn } from "@/lib/utils";
import { ENGINES, TOOLS, COURSES } from "@/data/catalog";
import {
  ArrowRight, Bot, Stethoscope, Boxes, Cpu, Car, Wrench,
  GraduationCap, ClipboardList, Activity, Zap, ShieldCheck, Sparkles,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const FEATURE_CARDS = [
  {
    view: "diagnose" as const,
    title: "Diagnose My Vehicle",
    desc: "Multi-modal AI diagnosis from photos, engine audio & video.",
    icon: Stethoscope,
    accent: "from-amber/20 to-amber/5",
    iconColor: "text-amber",
    badge: "AI Vision + Audio",
    span: "lg:col-span-2",
  },
  {
    view: "workshop" as const,
    title: "3D Virtual Workshop",
    desc: "Navigate, rotate & disassemble engines in a real workshop.",
    icon: Boxes,
    accent: "from-emerald/20 to-emerald/5",
    iconColor: "text-emerald",
    badge: "Immersive 3D",
    span: "lg:col-span-2",
  },
  {
    view: "meca-ai" as const,
    title: "MecaAI Assistant",
    desc: "Your AI mechanic mentor — explains, guides & teaches.",
    icon: Bot,
    accent: "from-emerald/15 to-amber/10",
    iconColor: "text-emerald",
    badge: "Online",
    span: "",
  },
  {
    view: "engines" as const,
    title: "Engine Library",
    desc: `${ENGINES.length} interactive 3D engine models.`,
    icon: Cpu,
    accent: "from-amber/15 to-amber/5",
    iconColor: "text-amber",
    badge: `${ENGINES.length} models`,
    span: "",
  },
  {
    view: "vehicles" as const,
    title: "Vehicle Library",
    desc: "Manage your registered vehicles & specs.",
    icon: Car,
    accent: "from-amber/10 to-emerald/10",
    iconColor: "text-amber",
    badge: "Garage",
    span: "",
  },
  {
    view: "tools" as const,
    title: "Tool Collection",
    desc: `${TOOLS.length} interactive tools with tutorials.`,
    icon: Wrench,
    accent: "from-amber/10 to-emerald/5",
    iconColor: "text-amber",
    badge: `${TOOLS.length} tools`,
    span: "",
  },
  {
    view: "courses" as const,
    title: "Training Courses",
    desc: `${COURSES.length} structured learning paths.`,
    icon: GraduationCap,
    accent: "from-emerald/15 to-emerald/5",
    iconColor: "text-emerald",
    badge: `${COURSES.length} courses`,
    span: "",
  },
  {
    view: "training" as const,
    title: "Virtual Training",
    desc: "Practice diagnosing simulated faults safely.",
    icon: ClipboardList,
    accent: "from-[oklch(0.78_0.17_75)]/15 to-amber/5",
    iconColor: "text-[oklch(0.78_0.17_75)]",
    badge: "Simulator",
    span: "",
  },
];

export function HomeView() {
  const { setView } = useNav();

  return (
    <PageContainer>
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden rounded-3xl mb-8 mcx-border-gradient"
      >
        <GlassCard className="relative p-6 sm:p-8 lg:p-10 overflow-hidden">
          <div className="absolute inset-0 mcx-grid-bg opacity-40" />
          <div className="absolute -right-10 -top-10 h-56 w-56 rounded-full bg-amber/10 blur-3xl" />
          <div className="absolute -left-10 -bottom-16 h-56 w-56 rounded-full bg-emerald/10 blur-3xl" />
          <div className="relative">
            <div className="inline-flex items-center gap-2 rounded-full border border-amber/30 bg-amber/10 px-3 py-1 text-xs font-medium text-amber mb-4">
              <Sparkles className="h-3.5 w-3.5" />
              Next-generation automotive intelligence
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight max-w-3xl leading-[1.1]">
              Master vehicle mechanics with{" "}
              <span className="mcx-text-gradient">AI & immersive 3D</span>
            </h1>
            <p className="mt-4 text-sm sm:text-base text-muted-foreground max-w-xl">
              Diagnose, learn, and repair with confidence. Mecatrix combines AI vision,
              engine audio analysis, and a full interactive 3D workshop — safe for beginners,
              powerful for professionals.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button
                onClick={() => setView("diagnose")}
                className="rounded-full bg-gradient-to-r from-amber to-amber/80 text-amber-foreground hover:opacity-90 gap-2"
              >
                Start a Diagnosis
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                onClick={() => setView("meca-ai")}
                className="rounded-full gap-2 border-emerald/30 text-emerald hover:bg-emerald/10"
              >
                <Bot className="h-4 w-4" />
                Ask MecaAI
              </Button>
            </div>
          </div>
        </GlassCard>
      </motion.div>

      {/* Stats strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        <Stat label="Engine Models" value={ENGINES.length} sub="Interactive 3D" accent="text-amber" />
        <Stat label="Tools" value={TOOLS.length} sub="With tutorials" accent="text-amber" />
        <Stat label="Courses" value={COURSES.length} sub="Across all systems" accent="text-emerald" />
        <Stat label="AI Accuracy" value="94%" sub="Diagnostic confidence" accent="text-emerald" />
      </div>

      {/* Feature grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {FEATURE_CARDS.map((card, i) => {
          const Icon = card.icon;
          return (
            <motion.button
              key={card.view}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.05 * i, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ y: -4 }}
              onClick={() => setView(card.view)}
              className={cn(
                "group text-left relative overflow-hidden rounded-2xl",
                card.span
              )}
            >
              <GlassCard className="h-full p-5 relative overflow-hidden transition-all hover:border-amber/40">
                <div className={cn("absolute inset-0 bg-gradient-to-br opacity-80", card.accent)} />
                <div className="relative flex flex-col h-full">
                  <div className="flex items-start justify-between mb-4">
                    <div className={cn("h-11 w-11 rounded-xl flex items-center justify-center bg-background/60 border border-border/60", card.iconColor)}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="text-[10px] font-semibold tracking-wider uppercase text-muted-foreground/80 rounded-full border border-border/60 bg-background/40 px-2 py-0.5">
                      {card.badge}
                    </span>
                  </div>
                  <h3 className="font-semibold text-[15px] mb-1">{card.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed flex-1">{card.desc}</p>
                  <div className="mt-4 flex items-center gap-1 text-xs font-medium text-amber opacity-0 group-hover:opacity-100 transition-opacity">
                    Open
                    <ChevronRight className="h-3.5 w-3.5" />
                  </div>
                </div>
              </GlassCard>
            </motion.button>
          );
        })}
      </div>

      {/* Quick links secondary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-2">
        {(["history", "profile", "settings"] as const).map((v) => {
          const item = NAV_ITEMS.find((n) => n.id === v)!;
          const Icon = item.icon;
          return (
            <button
              key={v}
              onClick={() => setView(v)}
              className="flex items-center gap-3 rounded-xl border border-border/60 bg-card/40 px-4 py-3 text-sm hover:border-amber/40 hover:bg-card/70 transition-colors"
            >
              <Icon className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{item.label}</span>
            </button>
          );
        })}
        <div className="flex items-center gap-3 rounded-xl border border-emerald/30 bg-emerald/5 px-4 py-3 text-sm">
          <ShieldCheck className="h-4 w-4 text-emerald" />
          <span className="font-medium text-emerald">Safe practice mode</span>
        </div>
      </div>

      {/* Capability banner */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        {[
          { icon: Zap, title: "Instant AI Diagnosis", desc: "Combine photos + audio + symptoms into a confidence-ranked report." },
          { icon: Activity, title: "Animated 3D Engines", desc: "Rotate, explode, and watch engines run — learn by seeing." },
          { icon: GraduationCap, title: "Guided Repair Mode", desc: "Step-by-step procedures synced to 3D demonstrations." },
        ].map((f, i) => {
          const Icon = f.icon;
          return (
            <GlassCard key={i} className="p-5">
              <div className="h-9 w-9 rounded-lg bg-amber/10 flex items-center justify-center text-amber mb-3">
                <Icon className="h-[18px] w-[18px]" />
              </div>
              <div className="font-semibold text-sm mb-1">{f.title}</div>
              <p className="text-xs text-muted-foreground leading-relaxed">{f.desc}</p>
            </GlassCard>
          );
        })}
      </motion.div>
    </PageContainer>
  );
}
