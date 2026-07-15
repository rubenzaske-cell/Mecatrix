"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { PageContainer, GlassCard, PageHeading } from "@/components/mecatrix/ui/primitives";
import { useNav } from "@/lib/mecatrix/nav-store";
import { ENGINES, type EngineModel } from "@/data/catalog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Cpu, Gauge, Fuel, Zap, ArrowRight, Car } from "lucide-react";
import { cn } from "@/lib/utils";

const CATEGORIES = ["All", "Gasoline", "Diesel", "Hybrid", "Electric"] as const;

export function EnginesView() {
  const { setView } = useNav();
  const [cat, setCat] = React.useState<(typeof CATEGORIES)[number]>("All");
  const filtered = cat === "All" ? ENGINES : ENGINES.filter((e) => e.category === cat);

  return (
    <PageContainer>
      <PageHeading
        eyebrow="3D Library"
        title="Engine Library"
        description={`${ENGINES.length} interactive high-fidelity 3D engine models across every powertrain type.`}
      />

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            onClick={() => setCat(c)}
            className={cn(
              "rounded-full px-3.5 py-1.5 text-xs font-medium border transition-colors",
              cat === c
                ? "bg-amber/15 text-amber border-amber/40"
                : "bg-card/50 text-muted-foreground border-border hover:text-foreground"
            )}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((e, i) => (
          <motion.div
            key={e.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.04 * i }}
          >
            <EngineCard engine={e} onOpen={() => setView("workshop", { engineId: e.id })} />
          </motion.div>
        ))}
      </div>
    </PageContainer>
  );
}

function EngineCard({ engine, onOpen }: { engine: EngineModel; onOpen: () => void }) {
  return (
    <GlassCard className="overflow-hidden group hover:border-amber/40 transition-colors h-full flex flex-col">
      {/* Visual header */}
      <div className="relative h-36 overflow-hidden" style={{ background: `radial-gradient(circle at 30% 20%, ${engine.accent}33, transparent 70%)` }}>
        <div className="absolute inset-0 mcx-grid-bg opacity-40" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative">
            <div className="absolute inset-0 rounded-full blur-2xl opacity-50" style={{ background: engine.accent }} />
            <Cpu className="relative h-16 w-16 mcx-float" style={{ color: engine.accent }} strokeWidth={1.2} />
          </div>
        </div>
        <Badge variant="outline" className="absolute top-3 left-3 bg-background/70 backdrop-blur border-border/60">
          {engine.category}
        </Badge>
        <Badge variant="outline" className="absolute top-3 right-3 bg-background/70 backdrop-blur border-border/60">
          {engine.vehicleType}
        </Badge>
      </div>

      <div className="p-4 flex-1 flex flex-col">
        <div className="font-semibold text-sm">{engine.name}</div>
        <p className="text-xs text-muted-foreground mt-1 leading-relaxed line-clamp-2 flex-1">{engine.summary}</p>

        <div className="grid grid-cols-2 gap-2 mt-3 text-[11px]">
          <Spec icon={Gauge} label="Power" value={engine.power} />
          <Spec icon={Zap} label="Torque" value={engine.torque} />
          <Spec icon={Fuel} label="Fuel" value={engine.fuelSystem} />
          <Spec icon={Car} label="Year" value={engine.year} />
        </div>

        <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/60">
          <span className="text-[11px] text-muted-foreground">{engine.components.length} components</span>
          <Button size="sm" variant="ghost" onClick={onOpen} className="gap-1 text-amber hover:text-amber hover:bg-amber/10 h-8">
            Explore 3D <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </GlassCard>
  );
}

function Spec({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string }) {
  return (
    <div className="flex items-start gap-1.5">
      <Icon className="h-3 w-3 text-muted-foreground mt-0.5 shrink-0" />
      <div className="min-w-0">
        <div className="text-[9px] uppercase text-muted-foreground">{label}</div>
        <div className="text-[11px] font-medium truncate">{value}</div>
      </div>
    </div>
  );
}
