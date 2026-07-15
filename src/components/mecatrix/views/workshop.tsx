"use client";

import * as React from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment, ContactShadows, Float, Grid, Bounds } from "@react-three/drei";
import { EngineModel3D } from "@/components/mecatrix/three/engine-model";
import { PageContainer, GlassCard, PageHeading, StatusBadge } from "@/components/mecatrix/ui/primitives";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { useNav } from "@/lib/mecatrix/nav-store";
import { ENGINES, getEngine, type Status } from "@/data/catalog";
import {
  ZoomIn, Layers, Eye, RotateCw, Activity, X, ChevronRight,
  Cpu, Wrench, AlertTriangle, Lightbulb, Search, RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

// A demo diagnostic map (could be wired to a real diagnosis result)
const DEMO_DIAGNOSTICS: Record<string, Status> = {
  injectors: "warn",
  turbo: "crit",
  "cyl-head": "warn",
  battery: "ok",
};

export function WorkshopView() {
  const { params, setView } = useNav();
  const [engineId, setEngineId] = React.useState(params.engineId || ENGINES[0].id);
  const engine = getEngine(engineId);
  const [exploded, setExploded] = React.useState(0);
  const [transparent, setTransparent] = React.useState(false);
  const [animate, setAnimate] = React.useState(true);
  const [diagnosticMode, setDiagnosticMode] = React.useState(false);
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [hovered, setHovered] = React.useState(false);
  const controlsRef = React.useRef<{ reset: () => void } | null>(null);

  const selected = engine.components.find((c) => c.id === selectedId) || null;

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8 max-w-7xl mx-auto w-full">
      <PageHeading
        eyebrow="Immersive 3D"
        title="Virtual Workshop"
        description="Rotate, explode and inspect interactive engine models. Select any component for full technical details."
        actions={
          <Select value={engineId} onValueChange={(v) => { setEngineId(v); setSelectedId(null); }}>
            <SelectTrigger className="w-[220px] rounded-xl bg-card/60">
              <SelectValue placeholder="Select engine" />
            </SelectTrigger>
            <SelectContent>
              {ENGINES.map((e) => (
                <SelectItem key={e.id} value={e.id}>
                  <span className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full" style={{ background: e.accent }} />
                    {e.name}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        }
      />

      <div className="grid lg:grid-cols-3 gap-4">
        {/* 3D Canvas */}
        <div className="lg:col-span-2">
          <GlassCard className="relative overflow-hidden p-0 h-[460px] sm:h-[560px] lg:h-[640px]">
            {/* Scanline overlay */}
            {!hovered && (
              <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden opacity-40">
                <div className="mcx-scanline" />
              </div>
            )}
            {/* HUD top-left */}
            <div className="absolute top-3 left-3 z-20 flex flex-col gap-1.5">
              <Badge variant="outline" className="bg-background/70 backdrop-blur border-border/60 gap-1.5">
                <Cpu className="h-3 w-3 text-amber" />
                {engine.name}
              </Badge>
              <Badge variant="outline" className="bg-background/70 backdrop-blur border-border/60 w-fit">
                {engine.category} · {engine.displacement}
              </Badge>
            </div>
            {/* HUD top-right spec */}
            <div className="absolute top-3 right-3 z-20 hidden sm:block">
              <div className="rounded-lg bg-background/70 backdrop-blur border border-border/60 px-3 py-2 text-[10px] text-muted-foreground space-y-0.5">
                <div>Power <span className="text-amber font-medium ml-1">{engine.power}</span></div>
                <div>Torque <span className="text-amber font-medium ml-1">{engine.torque}</span></div>
                <div>Cylinders <span className="text-amber font-medium ml-1">{engine.cylinders || "—"}</span></div>
              </div>
            </div>

            <Canvas
              shadows
              camera={{ position: [5, 3, 6], fov: 42 }}
              dpr={[1, 2]}
              onPointerMissed={() => setSelectedId(null)}
              onPointerEnter={() => setHovered(true)}
              onPointerLeave={() => setHovered(false)}
            >
              <color attach="background" args={["#0a0b12"]} />
              <ambientLight intensity={0.45} />
              <directionalLight
                position={[6, 8, 4]} intensity={1.4} castShadow
                shadow-mapSize-width={1024} shadow-mapSize-height={1024}
              />
              <directionalLight position={[-6, 4, -4]} intensity={0.5} color="#e07a2f" />
              <pointLight position={[0, -3, 0]} intensity={0.3} color="#4aa876" />

              <Bounds fit observe margin={1.4}>
                <Float speed={animate && !selectedId ? 1.2 : 0} rotationIntensity={0.15} floatIntensity={0.25}>
                  <EngineModel3D
                    engine={engine}
                    exploded={exploded}
                    transparent={transparent}
                    animate={animate}
                    selectedId={selectedId}
                    diagnosticMode={diagnosticMode}
                    diagnosticMap={DEMO_DIAGNOSTICS}
                    onSelect={setSelectedId}
                  />
                </Float>
              </Bounds>

              <ContactShadows position={[0, -2.1, 0]} opacity={0.45} scale={14} blur={2.6} far={5} />
              <Grid
                position={[0, -2.1, 0]} args={[24, 24]}
                cellSize={0.6} cellThickness={0.6} cellColor="#2a2f3a"
                sectionSize={3} sectionThickness={1} sectionColor="#3a4150"
                fadeDistance={22} fadeStrength={1.5} infiniteGrid
              />
              <Environment preset="warehouse" />
              <OrbitControls
                enablePan={false}
                minDistance={4}
                maxDistance={14}
                maxPolarAngle={Math.PI / 1.8}
                autoRotate={false}
              />
            </Canvas>

            {/* Controls bar */}
            <div className="absolute bottom-3 inset-x-3 z-20 flex flex-wrap items-center justify-center gap-2">
              <ControlToggle active={exploded > 0.5} onClick={() => setExploded((e) => (e > 0.5 ? 0 : 1))} icon={Layers} label="Exploded" />
              <ControlToggle active={transparent} onClick={() => setTransparent((t) => !t)} icon={Eye} label="Transparent" />
              <ControlToggle active={animate} onClick={() => setAnimate((a) => !a)} icon={RotateCw} label="Animate" />
              <ControlToggle
                active={diagnosticMode}
                onClick={() => setDiagnosticMode((d) => !d)}
                icon={Activity}
                label="Diagnosis"
                accent="emerald"
              />
            </div>
          </GlassCard>

          {/* Engine summary card */}
          <GlassCard className="p-4 mt-4">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${engine.accent}22`, color: engine.accent }}>
                <Cpu className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <div className="font-semibold text-sm">{engine.name}</div>
                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{engine.summary}</p>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  <Badge variant="outline" className="text-[10px]">{engine.fuelSystem}</Badge>
                  <Badge variant="outline" className="text-[10px]">{engine.vehicleType}</Badge>
                  <Badge variant="outline" className="text-[10px]">{engine.year}</Badge>
                </div>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Right panel: component list + info */}
        <div className="space-y-4">
          {/* Component list */}
          <GlassCard className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-sm flex items-center gap-2">
                <Search className="h-4 w-4 text-amber" />
                Components
              </h3>
              <span className="text-[11px] text-muted-foreground">{engine.components.length} parts</span>
            </div>
            <ScrollArea className="h-[300px] pr-2 mcx-scroll">
              <div className="space-y-1.5">
                {engine.components.map((c) => {
                  const status = diagnosticMode ? (DEMO_DIAGNOSTICS[c.id] ?? "ok") : null;
                  const active = selectedId === c.id;
                  return (
                    <button
                      key={c.id}
                      onClick={() => setSelectedId(active ? null : c.id)}
                      className={cn(
                        "w-full flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm transition-colors border",
                        active
                          ? "bg-amber/10 border-amber/40"
                          : "border-transparent hover:bg-card/60"
                      )}
                    >
                      <span
                        className="h-2.5 w-2.5 rounded-full shrink-0"
                        style={{ background: status ? (status === "ok" ? "#3ee08a" : status === "warn" ? "#ffc23d" : "#ff5a4a") : c.color }}
                      />
                      <span className="flex-1 min-w-0 truncate">{c.name}</span>
                      {status && status !== "ok" && (
                        <span className={cn(
                          "h-1.5 w-1.5 rounded-full",
                          status === "warn" ? "bg-[oklch(0.78_0.17_75)]" : "bg-[oklch(0.68_0.21_25)]"
                        )} />
                      )}
                      <ChevronRight className={cn("h-3.5 w-3.5 text-muted-foreground transition-transform", active && "rotate-90 text-amber")} />
                    </button>
                  );
                })}
              </div>
            </ScrollArea>
          </GlassCard>

          {/* Selected component info */}
          <AnimatePresence mode="wait">
            {selected ? (
              <motion.div key={selected.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <ComponentInfo
                  component={selected}
                  status={diagnosticMode ? (DEMO_DIAGNOSTICS[selected.id] ?? "ok") : null}
                  onClose={() => setSelectedId(null)}
                  onAsk={() => setView("meca-ai")}
                />
              </motion.div>
            ) : (
              <GlassCard className="p-5 text-center">
                <div className="h-10 w-10 rounded-xl bg-amber/10 flex items-center justify-center text-amber mx-auto mb-2">
                  <Wrench className="h-5 w-5" />
                </div>
                <div className="text-sm font-medium">Select a component</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Click any part of the engine or pick from the list to see its function, symptoms, causes and inspection steps.
                </p>
              </GlassCard>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function ControlToggle({
  active, onClick, icon: Icon, label, accent = "amber",
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  accent?: "amber" | "emerald";
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium border backdrop-blur transition-colors",
        active
          ? accent === "emerald"
            ? "bg-emerald/20 border-emerald/40 text-emerald"
            : "bg-amber/20 border-amber/40 text-amber"
          : "bg-background/70 border-border/60 text-muted-foreground hover:text-foreground"
      )}
    >
      <Icon className={cn("h-3.5 w-3.5", active && "animate-pulse")} />
      {label}
    </button>
  );
}

function ComponentInfo({
  component, status, onClose, onAsk,
}: {
  component: import("@/data/catalog").EngineComponent;
  status: Status | null;
  onClose: () => void;
  onAsk: () => void;
}) {
  return (
    <GlassCard className="p-4">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full" style={{ background: status ? (status === "ok" ? "#3ee08a" : status === "warn" ? "#ffc23d" : "#ff5a4a") : component.color }} />
          <h3 className="font-semibold text-sm">{component.name}</h3>
        </div>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
          <X className="h-4 w-4" />
        </button>
      </div>
      {status && (
        <div className="mb-2">
          <StatusBadge status={status} />
        </div>
      )}
      <p className="text-xs text-muted-foreground leading-relaxed mb-3">{component.function}</p>

      {component.symptoms && (
        <InfoBlock icon={AlertTriangle} label="Symptoms when faulty" color="text-[oklch(0.78_0.17_75)]">
          {component.symptoms}
        </InfoBlock>
      )}
      {component.causes && component.causes.length > 0 && (
        <InfoBlock icon={Activity} label="Possible causes" color="text-[oklch(0.68_0.21_25)]">
          <ul className="space-y-0.5">
            {component.causes.map((c, i) => <li key={i} className="flex gap-1.5"><span>•</span>{c}</li>)}
          </ul>
        </InfoBlock>
      )}
      {component.inspection && component.inspection.length > 0 && (
        <InfoBlock icon={Search} label="Inspection steps" color="text-amber">
          <ul className="space-y-0.5">
            {component.inspection.map((c, i) => <li key={i} className="flex gap-1.5"><span>{i + 1}.</span>{c}</li>)}
          </ul>
        </InfoBlock>
      )}
      {component.tools && component.tools.length > 0 && (
        <InfoBlock icon={Wrench} label="Required tools" color="text-emerald">
          <div className="flex flex-wrap gap-1">
            {component.tools.map((t) => (
              <span key={t} className="rounded-md bg-emerald/10 border border-emerald/20 px-1.5 py-0.5 text-[10px] text-emerald">{t}</span>
            ))}
          </div>
        </InfoBlock>
      )}
      {component.difficulty && (
        <div className="flex items-center justify-between text-[11px] mt-3 pt-3 border-t border-border/60">
          <span className="text-muted-foreground">Repair difficulty</span>
          <Badge variant="outline" className={cn(
            "text-[10px]",
            component.difficulty === "Easy" && "border-emerald/30 text-emerald",
            component.difficulty === "Moderate" && "border-amber/30 text-amber",
            component.difficulty === "Hard" && "border-[oklch(0.78_0.17_75)]/30 text-[oklch(0.78_0.17_75)]",
            component.difficulty === "Expert" && "border-[oklch(0.68_0.21_25)]/30 text-[oklch(0.68_0.21_25)]"
          )}>
            {component.difficulty}
          </Badge>
        </div>
      )}
      <Button onClick={onAsk} variant="outline" size="sm" className="w-full mt-3 gap-2 border-amber/30 text-amber hover:bg-amber/10">
        <Lightbulb className="h-3.5 w-3.5" />
        Ask MecaAI about this
      </Button>
    </GlassCard>
  );
}

function InfoBlock({
  icon: Icon, label, color, children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  color: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-2.5">
      <div className={cn("flex items-center gap-1.5 mb-1 text-[11px] font-semibold uppercase tracking-wider", color)}>
        <Icon className="h-3 w-3" />
        {label}
      </div>
      <div className="text-[11px] text-muted-foreground leading-relaxed pl-4">{children}</div>
    </div>
  );
}
