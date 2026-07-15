"use client";

import * as React from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, ContactShadows } from "@react-three/drei";
import { EngineAssembly } from "@/components/mecatrix/three/engine-assembly";
import { WorkshopEnvironment } from "@/components/mecatrix/three/workshop-environment";
import { HeldTool } from "@/components/mecatrix/three/held-tool";
import { PageContainer, PageHeading, GlassCard } from "@/components/mecatrix/ui/primitives";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { useNav } from "@/lib/mecatrix/nav-store";
import { ENGINES, getEngine } from "@/data/catalog";
import {
  WORKSHOP_TOOLS, TOOL_BY_ID, getBoltsForEngine, compatibleBoltIds,
  compatibleComponentIds, proceduresForEngine, gradeExam,
  type WorkshopTool, type BoltDef, type BoltState, type CompState,
  type RepairProcedure,
} from "@/lib/mecatrix/workshop-data";
import {
  Wrench, Layers, Eye, RotateCw, Activity, X, ChevronRight, Cpu,
  Hand, Play, GraduationCap, ClipboardCheck, RotateCcw, Lightbulb,
  ShieldAlert, CheckCircle2, XCircle, Clock, Trophy, Bot, Loader2,
  Hammer, Gauge, Zap, ScanLine, ArrowUpFromLine, GitPullRequest,
  Star, Hexagon, CircleDot, Grip, Activity as ActivityIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

type Mode = "practice" | "guided" | "exam";

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  wrench: Wrench, "circle-dot": CircleDot, hexagon: Hexagon, star: Star,
  screwdriver: Wrench, grip: Grip, hammer: Hammer, gauge: Gauge,
  zap: Zap, activity: ActivityIcon, "scan-line": ScanLine,
  "arrow-up-from-line": ArrowUpFromLine, "git-pull-request": GitPullRequest,
};

export function WorkshopView() {
  const { params, setView } = useNav();
  const [engineId, setEngineId] = React.useState(params.engineId || "gas-i4-turbo");
  const engine = getEngine(engineId);
  const bolts = React.useMemo(() => getBoltsForEngine(engine), [engine]);

  const [mode, setMode] = React.useState<Mode>("practice");
  const [equippedTool, setEquippedTool] = React.useState<WorkshopTool | null>(null);
  const [boltStates, setBoltStates] = React.useState<Record<string, BoltState>>({});
  const [componentStates, setComponentStates] = React.useState<Record<string, CompState>>({});
  const [hiddenComponents, setHiddenComponents] = React.useState<string[]>([]);
  const [exploded, setExploded] = React.useState(0);
  const [transparent, setTransparent] = React.useState(false);
  const [animate, setAnimate] = React.useState(true);

  // Guided mode
  const [procedures] = React.useState<RepairProcedure[]>(() => proceduresForEngine(engineId));
  const [procIndex, setProcIndex] = React.useState(0);
  const [stepIndex, setStepIndex] = React.useState(0);
  const procedure = procedures[procIndex];
  const [aiThinking, setAiThinking] = React.useState(false);
  const [aiExtra, setAiExtra] = React.useState<string | null>(null);
  const [wrongToolMsg, setWrongToolMsg] = React.useState<string | null>(null);

  // Exam mode
  const [examStart, setExamStart] = React.useState(0);
  const [examMistakes, setExamMistakes] = React.useState(0);
  const [examToolsUsed, setExamToolsUsed] = React.useState<Set<string>>(new Set());
  const [examDamages, setExamDamages] = React.useState(0);
  const [examAvoided, setExamAvoided] = React.useState(0);
  const [examStepsDone, setExamStepsDone] = React.useState(0);
  const [examResult, setExamResult] = React.useState<ReturnType<typeof gradeExam> | null>(null);

  const examProcedure = procedures[0];

  // Reset assembly when engine or mode changes
  React.useEffect(() => {
    setBoltStates({});
    setComponentStates({});
    setHiddenComponents([]);
    setStepIndex(0);
    setEquippedTool(null);
    setExamResult(null);
    setExamMistakes(0);
    setExamToolsUsed(new Set());
    setExamDamages(0);
    setExamAvoided(0);
    setExamStepsDone(0);
    setWrongToolMsg(null);
    setAiExtra(null);
  }, [engineId, mode]);

  // Highlighting: compatible bolts/components for equipped tool
  const highlightBolts = React.useMemo(
    () => compatibleBoltIds(equippedTool, bolts, boltStates),
    [equippedTool, bolts, boltStates]
  );
  const highlightComponents = React.useMemo(
    () => compatibleComponentIds(equippedTool, engine, bolts),
    [equippedTool, engine, bolts]
  );

  // Current guided step target
  const currentStep = procedure?.steps[stepIndex];
  const targetBoltId = (mode === "guided" && currentStep?.action === "loosen-bolt") ? currentStep.targetBoltId ?? null : null;
  const targetComponentId = (mode === "guided" && currentStep?.action === "remove-component") ? currentStep.targetComponentId ?? null : null;

  // ===== Actions =====
  function equipTool(tool: WorkshopTool | null) {
    setEquippedTool((prev) => (prev?.id === tool?.id ? null : tool));
    setWrongToolMsg(null);
    if (mode === "exam" && tool) {
      setExamToolsUsed((s) => new Set(s).add(tool.id));
    }
    // Guided: check tool matches step's required tool (select-tool action)
    if (mode === "guided" && currentStep?.action === "select-tool" && tool) {
      if (tool.id === currentStep.toolId) {
        completeCurrentStep();
      } else {
        reactWrongTool(tool, currentStep.toolId);
      }
    }
  }

  function onBoltClick(boltId: string) {
    const bolt = bolts.find((b) => b.id === boltId);
    if (!bolt) return;
    if (!equippedTool) {
      toast.info("Selecciona una herramienta del panel primero.");
      return;
    }

    if (mode === "guided") {
      if (!currentStep) return;
      if (currentStep.action === "loosen-bolt" && boltId === currentStep.targetBoltId) {
        // Must use correct tool
        if (equippedTool.id !== currentStep.toolId) {
          reactWrongTool(equippedTool, currentStep.toolId);
          return;
        }
        loosenBolt(boltId);
        completeCurrentStep();
      } else {
        setWrongToolMsg("Ese no es el perno indicado para este paso. Sigue la guía de MecaIA.");
      }
      return;
    }

    if (mode === "exam") {
      // Allow loosening any tight bolt the tool fits
      if (!highlightBolts.includes(boltId)) {
        // Wrong tool for this bolt
        setExamMistakes((m) => m + 1);
        reactWrongTool(equippedTool, null, bolt);
        return;
      }
      loosenBolt(boltId);
      setExamStepsDone((s) => s + 1);
      return;
    }

    // Practice mode: free — loosen if tool fits
    if (!highlightBolts.includes(boltId)) {
      reactWrongTool(equippedTool, null, bolt);
      return;
    }
    loosenBolt(boltId);
  }

  function onComponentClick(componentId: string) {
    if (!equippedTool) {
      toast.info("Selecciona una herramienta del panel primero.");
      return;
    }
    const compBolts = bolts.filter((b) => b.componentId === componentId);
    const allLoose = compBolts.every((b) => boltStates[b.id] === "removed");
    const comp = engine.components.find((c) => c.id === componentId);
    if (!comp) return;

    if (mode === "guided") {
      if (!currentStep) return;
      if (currentStep.action === "remove-component" && componentId === currentStep.targetComponentId) {
        if (!allLoose && compBolts.length > 0) {
          setWrongToolMsg("Aún hay pernos sujetando esta pieza. Afloja todos primero.");
          setExamDamages((d) => d + 1);
          return;
        }
        if (equippedTool.id !== currentStep.toolId) {
          reactWrongTool(equippedTool, currentStep.toolId);
          return;
        }
        removeComponent(componentId);
        completeCurrentStep();
      } else {
        setWrongToolMsg("Esa no es la pieza objetivo de este paso.");
      }
      return;
    }

    if (mode === "exam") {
      if (!allLoose && compBolts.length > 0) {
        // Forced removal = damage
        setExamDamages((d) => d + 1);
        setExamMistakes((m) => m + 1);
        toast.error("¡Daño! Intentaste retirar una pieza con los pernos puestos.");
        return;
      }
      removeComponent(componentId);
      setExamStepsDone((s) => s + 1);
      setExamAvoided((a) => a + 1);
      // Exam completes when the procedure's final component is removed
      const targetComp = examProcedure?.steps.find((s) => s.action === "remove-component")?.targetComponentId;
      if (targetComp && componentId === targetComp) {
        finishExam();
      }
      return;
    }

    // Practice
    if (!allLoose && compBolts.length > 0) {
      toast.warning("Hay pernos aún. En modo práctica puedes forzar, pero en la vida real dañarías la pieza.");
    }
    removeComponent(componentId);
  }

  function loosenBolt(boltId: string) {
    setBoltStates((s) => ({ ...s, [boltId]: "loosening" }));
    // After animation, mark removed
    window.setTimeout(() => {
      setBoltStates((s) => ({ ...s, [boltId]: "removed" }));
    }, 1400);
  }

  function removeComponent(componentId: string) {
    setComponentStates((s) => ({ ...s, [componentId]: "removing" }));
    window.setTimeout(() => {
      setComponentStates((s) => ({ ...s, [componentId]: "removed" }));
    }, 1150);
  }

  function completeCurrentStep() {
    setWrongToolMsg(null);
    setAiExtra(null);
    setStepIndex((i) => i + 1);
  }

  async function reactWrongTool(tool: WorkshopTool, expectedToolId: string | null, bolt?: BoltDef) {
    setExamMistakes((m) => m + 1);
    const expected = expectedToolId ? TOOL_BY_ID[expectedToolId] : null;
    const instant = expected
      ? `"${tool.name}" no es la herramienta adecuada para este componente. ${expected.name} es la correcta, porque ${reasonFor(expected, currentStep)}.`
      : `"${tool.name}" no encaja en este perno ${bolt ? `de ${bolt.size} mm tipo ${bolt.type}` : ""}. Selecciona una herramienta compatible.`;
    setWrongToolMsg(instant);
    toast.error("Herramienta incorrecta — MecaAI te explica.");

    // Ask MecaAI for a deeper explanation (best-effort)
    setAiThinking(true);
    try {
      const res = await fetch("/api/meca-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          skillLevel: "intermediate",
          messages: [{
            role: "user",
            content: `Un aprendiz intenta usar "${tool.name}" en un motor donde ${expected ? `debería usar "${expected.name}"` : "esa herramienta no encaja"}. ${bolt ? `El perno es de ${bolt.size} mm tipo ${bolt.type}.` : ""} Explica en 2-3 frases por qué es incorrecto, qué daño podría causar, y sugiere la herramienta correcta. Sé directo y profesional.`,
          }],
        }),
      });
      const data = await res.json();
      if (data?.reply) setWrongToolMsg(data.reply);
    } catch {
      // keep instant message
    } finally {
      setAiThinking(false);
    }
  }

  function reasonFor(tool: WorkshopTool, step: typeof currentStep): string {
    if (!step) return "";
    if (tool.special === "torque") return "garantiza el par de apriete exacto sin sobrecargar la rosca";
    if (tool.shape === "socket") return "permite trabajar rápido con la matraca en espacios sobre el motor";
    if (tool.shape === "wrench") return `encaja exactamente en pernos de ${tool.size} mm sin redondear la cabeza`;
    return "es la indicada para este paso";
  }

  async function askAiMore() {
    if (!currentStep) return;
    setAiThinking(true);
    setAiExtra(null);
    try {
      const res = await fetch("/api/meca-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          skillLevel: "intermediate",
          messages: [{
            role: "user",
            content: `Estoy reparando un motor. Paso actual: "${currentStep.instruction}". Pieza: ${currentStep.targetComponentId || "—"}. Explica en 3-4 frases qué estoy haciendo, para qué sirve la pieza, qué error común debo evitar y un consejo de seguridad.`,
          }],
        }),
      });
      const data = await res.json();
      setAiExtra(data?.reply || "Sin respuesta.");
    } catch {
      toast.error("MecaAI no respondió.");
    } finally {
      setAiThinking(false);
    }
  }

  function finishExam() {
    const total = examProcedure?.steps.length ?? 7;
    const elapsed = Date.now() - examStart;
    const result = gradeExam(total, examStepsDone, examMistakes, examDamages, examAvoided, examToolsUsed.size, elapsed);
    setExamResult(result);
  }

  function startExam() {
    setBoltStates({}); setComponentStates({});
    setExamStart(Date.now());
    setExamMistakes(0); setExamToolsUsed(new Set());
    setExamDamages(0); setExamAvoided(0); setExamStepsDone(0);
    setExamResult(null);
    setEquippedTool(null);
    toast.info("Examen iniciado. Sin ayuda. ¡Demuestra tu habilidad!");
  }

  function resetAssembly() {
    setBoltStates({});
    setComponentStates({});
    setHiddenComponents([]);
    setStepIndex(0);
    setWrongToolMsg(null);
    setAiExtra(null);
    setExamResult(null);
    toast.success("Montaje reiniciado");
  }

  function toggleHide(componentId: string) {
    setHiddenComponents((h) => h.includes(componentId) ? h.filter((x) => x !== componentId) : [...h, componentId]);
  }

  const guidedComplete = mode === "guided" && procedure && stepIndex >= procedure.steps.length;

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8 max-w-[1500px] mx-auto w-full">
      <PageHeading
        eyebrow="Simulador Profesional 3D"
        title="Taller Virtual"
        description="Un taller mecánico inmersivo. Sujeta herramientas, desmonta motores y aprende con MecaAI como instructor."
        actions={
          <div className="flex items-center gap-2">
            <Select value={engineId} onValueChange={setEngineId}>
              <SelectTrigger className="w-[200px] rounded-xl bg-card/60"><SelectValue /></SelectTrigger>
              <SelectContent>
                {ENGINES.map((e) => (
                  <SelectItem key={e.id} value={e.id}>
                    <span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full" style={{ background: e.accent }} />{e.name}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" onClick={resetAssembly} className="gap-1.5"><RotateCcw className="h-4 w-4" /> Reiniciar</Button>
          </div>
        }
      />

      {/* Mode selector */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <ModeTab active={mode === "practice"} onClick={() => setMode("practice")} icon={Hand} label="Práctica Libre" color="amber" />
        <ModeTab active={mode === "guided"} onClick={() => setMode("guided")} icon={GraduationCap} label="Reparación Guiada" color="emerald" />
        <ModeTab active={mode === "exam"} onClick={() => setMode("exam")} icon={ClipboardCheck} label="Modo Examen" color="crit" />
        <div className="flex-1" />
        {/* Immersive controls */}
        <ControlToggle active={exploded > 0.5} onClick={() => setExploded((e) => (e > 0.5 ? 0 : 1))} icon={Layers} label="Vista explosada" />
        <ControlToggle active={transparent} onClick={() => setTransparent((t) => !t)} icon={Eye} label="Transparente" />
        <ControlToggle active={animate} onClick={() => setAnimate((a) => !a)} icon={RotateCw} label="Auto-rotación" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[200px_1fr_320px] gap-4">
        {/* LEFT: tool pegboard */}
        <GlassCard className="p-3 lg:max-h-[640px] lg:overflow-hidden flex flex-col">
          <div className="flex items-center gap-1.5 px-1 mb-2 text-[11px] font-semibold uppercase tracking-wider text-amber">
            <Wrench className="h-3.5 w-3.5" /> Herramientas
          </div>
          {equippedTool && (
            <div className="mb-2 rounded-lg bg-amber/10 border border-amber/30 p-2 text-[11px]">
              <div className="flex items-center justify-between">
                <span className="text-amber font-medium">En mano:</span>
                <button onClick={() => equipTool(null)} className="text-muted-foreground hover:text-foreground"><X className="h-3 w-3" /></button>
              </div>
              <div className="text-foreground font-medium truncate">{equippedTool.name}</div>
            </div>
          )}
          <ScrollArea className="flex-1 pr-1 mcx-scroll">
            <ToolPegboard
              equippedId={equippedTool?.id}
              onEquip={equipTool}
            />
          </ScrollArea>
        </GlassCard>

        {/* CENTER: 3D canvas */}
        <GlassCard className="relative overflow-hidden p-0 h-[440px] sm:h-[540px] lg:h-[640px]">
          {/* HUD */}
          <div className="absolute top-3 left-3 z-20 flex flex-col gap-1.5">
            <Badge variant="outline" className="bg-background/70 backdrop-blur border-border/60 gap-1.5">
              <Cpu className="h-3 w-3 text-amber" />{engine.name}
            </Badge>
            <Badge variant="outline" className="bg-background/70 backdrop-blur border-border/60 w-fit capitalize">
              {mode === "practice" ? "Práctica" : mode === "guided" ? "Guiada" : "Examen"}
            </Badge>
          </div>
          {equippedTool && (
            <div className="absolute top-3 right-3 z-20 rounded-lg bg-background/70 backdrop-blur border border-amber/40 px-2.5 py-1.5 text-[11px]">
              <span className="text-amber font-medium">Sosteniendo: </span>{equippedTool.name}
            </div>
          )}

          <Canvas
            shadows
            camera={{ position: [6, 3.5, 7], fov: 42 }}
            dpr={[1, 2]}
            onPointerMissed={() => {}}
          >
            <color attach="background" args={["#0a0b12"]} />
            <ambientLight intensity={0.5} />
            <directionalLight position={[6, 9, 4]} intensity={1.3} castShadow shadow-mapSize-width={1024} shadow-mapSize-height={1024} />
            <directionalLight position={[-6, 5, -4]} intensity={0.4} color="#e07a2f" />

            <WorkshopEnvironment />
            <group position={[0, 0.5, 0]}>
              <EngineAssembly
                engine={engine}
                bolts={bolts}
                boltStates={boltStates}
                componentStates={componentStates}
                hiddenComponents={hiddenComponents}
                exploded={exploded}
                transparent={transparent}
                animate={animate}
                highlightBolts={highlightBolts}
                highlightComponents={highlightComponents}
                targetBoltId={targetBoltId}
                targetComponentId={targetComponentId}
                onBoltClick={onBoltClick}
                onComponentClick={onComponentClick}
              />
            </group>

            <HeldTool tool={equippedTool} />
            <OrbitControls enablePan={false} minDistance={5} maxDistance={16} maxPolarAngle={Math.PI / 1.8} />
          </Canvas>

          {/* Bottom helper */}
          <div className="absolute bottom-3 inset-x-3 z-20 flex items-center justify-center">
            <div className="rounded-full bg-background/70 backdrop-blur border border-border/60 px-3 py-1.5 text-[11px] text-muted-foreground">
              {equippedTool
                ? "Clic en una pieza resaltada para usar la herramienta"
                : "Equipa una herramienta del panel izquierdo"}
            </div>
          </div>
        </GlassCard>

        {/* RIGHT: mode panel */}
        <div className="space-y-4">
          {mode === "practice" && (
            <PracticePanel
              engine={engine}
              bolts={bolts}
              boltStates={boltStates}
              componentStates={componentStates}
              hiddenComponents={hiddenComponents}
              onToggleHide={toggleHide}
              onReset={resetAssembly}
            />
          )}
          {mode === "guided" && (
            <GuidedPanel
              procedure={procedure}
              stepIndex={stepIndex}
              complete={guidedComplete}
              currentStep={currentStep}
              aiThinking={aiThinking}
              aiExtra={aiExtra}
              wrongToolMsg={wrongToolMsg}
              onAskMore={askAiMore}
              onReset={resetAssembly}
              onSelectProc={(i) => { setProcIndex(i); setStepIndex(0); resetAssembly(); }}
              procIndex={procIndex}
              procedures={procedures}
            />
          )}
          {mode === "exam" && (
            <ExamPanel
              mistakes={examMistakes}
              toolsUsed={examToolsUsed.size}
              damages={examDamages}
              avoided={examAvoided}
              started={examStart > 0}
              result={examResult}
              onStart={startExam}
              onReset={resetAssembly}
            />
          )}
        </div>
      </div>
    </div>
  );
}

// ===== Tool Pegboard =====
function ToolPegboard({
  equippedId, onEquip, disabled,
}: {
  equippedId?: string;
  onEquip: (t: WorkshopTool | null) => void;
  disabled?: boolean;
}) {
  const categories = Array.from(new Set(WORKSHOP_TOOLS.map((t) => t.category)));
  return (
    <div className="space-y-3">
      {categories.map((cat) => (
        <div key={cat}>
          <div className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground px-1 mb-1">{cat}</div>
          <div className="grid grid-cols-2 gap-1.5">
            {WORKSHOP_TOOLS.filter((t) => t.category === cat).map((t) => {
              const Icon = ICONS[t.icon] || Wrench;
              const active = equippedId === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => onEquip(t)}
                  disabled={disabled && !active}
                  title={t.name}
                  className={cn(
                    "flex flex-col items-center gap-1 rounded-lg border p-1.5 text-center transition-all",
                    active ? "bg-amber/15 border-amber/50" : "bg-card/40 border-border/60 hover:border-amber/30",
                    disabled && !active && "opacity-40 cursor-not-allowed"
                  )}
                >
                  <Icon className="h-4 w-4" style={{ color: active ? "var(--amber)" : t.color }} />
                  <span className="text-[9px] leading-tight text-muted-foreground line-clamp-2">{t.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

// ===== Practice Panel =====
function PracticePanel({
  engine, bolts, boltStates, componentStates, hiddenComponents, onToggleHide, onReset,
}: {
  engine: ReturnType<typeof getEngine>;
  bolts: BoltDef[];
  boltStates: Record<string, BoltState>;
  componentStates: Record<string, CompState>;
  hiddenComponents: string[];
  onToggleHide: (id: string) => void;
  onReset: () => void;
}) {
  const removedCount = Object.values(componentStates).filter((s) => s === "removed").length;
  const looseCount = Object.values(boltStates).filter((s) => s === "removed").length;
  return (
    <>
      <GlassCard className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Hand className="h-4 w-4 text-amber" />
          <h3 className="font-semibold text-sm">Modo Práctica</h3>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Desmonta libremente sin restricciones ni penalizaciones. Equipa una herramienta, observa las piezas compatibles resaltadas y experimenta.
        </p>
        <div className="grid grid-cols-2 gap-2 mt-3">
          <MiniStat label="Pernos retirados" value={`${looseCount}/${bolts.length}`} />
          <MiniStat label="Piezas retiradas" value={`${removedCount}`} />
        </div>
      </GlassCard>

      <GlassCard className="p-4">
        <h3 className="font-semibold text-sm mb-2">Piezas del motor</h3>
        <div className="space-y-1 max-h-[260px] overflow-y-auto mcx-scroll pr-1">
          {engine.components.map((c) => {
            const removed = componentStates[c.id] === "removed";
            const hidden = hiddenComponents.includes(c.id);
            return (
              <div key={c.id} className="flex items-center gap-2 rounded-lg border border-border/60 bg-card/40 p-2">
                <span className="h-2 w-2 rounded-full shrink-0" style={{ background: c.color }} />
                <span className="text-xs flex-1 truncate">{c.name}</span>
                <button onClick={() => onToggleHide(c.id)} className={cn("text-[10px] px-1.5 py-0.5 rounded", hidden ? "text-muted-foreground" : "text-amber")}>
                  {hidden ? <Eye className="h-3 w-3" /> : <Eye className="h-3 w-3 opacity-40" />}
                </button>
                {removed && <span className="text-[9px] text-[oklch(0.68_0.21_25)]">retirada</span>}
              </div>
            );
          })}
        </div>
      </GlassCard>
    </>
  );
}

// ===== Guided Panel =====
function GuidedPanel({
  procedure, stepIndex, complete, currentStep, aiThinking, aiExtra, wrongToolMsg,
  onAskMore, onReset, onSelectProc, procIndex, procedures,
}: {
  procedure?: RepairProcedure;
  stepIndex: number;
  complete: boolean;
  currentStep?: RepairProcedure["steps"][number];
  aiThinking: boolean;
  aiExtra: string | null;
  wrongToolMsg: string | null;
  onAskMore: () => void;
  onReset: () => void;
  onSelectProc: (i: number) => void;
  procIndex: number;
  procedures: RepairProcedure[];
}) {
  if (complete) {
    return (
      <GlassCard className="p-5 text-center">
        <div className="h-12 w-12 rounded-xl bg-emerald/15 flex items-center justify-center text-emerald mx-auto mb-2"><Trophy className="h-6 w-6" /></div>
        <div className="font-semibold text-sm">¡Reparación completada!</div>
        <p className="text-xs text-muted-foreground mt-1">MecaAI ha guiado cada paso. ¿Listo para el modo examen?</p>
        <Button onClick={onReset} className="mt-3 w-full gap-2 bg-emerald text-emerald-foreground hover:bg-emerald/90"><RotateCcw className="h-4 w-4" /> Otra reparación</Button>
      </GlassCard>
    );
  }
  if (!procedure) {
    return (
      <GlassCard className="p-5 text-center">
        <p className="text-xs text-muted-foreground">No hay procedimientos definidos para este motor. Prueba el MecaTurbo I4.</p>
      </GlassCard>
    );
  }
  const progress = (stepIndex / procedure.steps.length) * 100;
  return (
    <>
      <GlassCard className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <GraduationCap className="h-4 w-4 text-emerald" />
          <h3 className="font-semibold text-sm">Reparación Guiada</h3>
        </div>
        {procedures.length > 1 && (
          <Select value={String(procIndex)} onValueChange={(v) => onSelectProc(Number(v))}>
            <SelectTrigger className="h-8 text-xs mb-2 bg-card/60"><SelectValue /></SelectTrigger>
            <SelectContent>
              {procedures.map((p, i) => <SelectItem key={p.id} value={String(i)}>{p.title}</SelectItem>)}
            </SelectContent>
          </Select>
        )}
        <p className="text-xs text-muted-foreground mb-2">{procedure.description}</p>
        <Progress value={progress} className="h-1.5 mb-1" />
        <div className="text-[10px] text-muted-foreground">Paso {Math.min(stepIndex + 1, procedure.steps.length)} de {procedure.steps.length}</div>
      </GlassCard>

      {/* Current step */}
      {currentStep && (
        <GlassCard className="p-4 mcx-border-gradient">
          <div className="flex items-center gap-2 mb-2">
            <span className="h-6 w-6 rounded-full bg-emerald text-emerald-foreground text-[10px] font-bold flex items-center justify-center">{stepIndex + 1}</span>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald">{currentStep.title}</span>
          </div>
          <p className="text-sm font-medium leading-snug mb-3">{currentStep.instruction}</p>

          {/* MecaAI instructor bubble */}
          <div className="rounded-lg bg-emerald/5 border border-emerald/20 p-2.5 mb-2">
            <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-emerald mb-1">
              <Bot className="h-3 w-3" /> MecaAI Instructor
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed">{currentStep.aiGuidance}</p>
            {currentStep.safetyTip && (
              <div className="flex gap-1.5 mt-2 text-[11px] text-amber"><ShieldAlert className="h-3 w-3 shrink-0 mt-0.5" /><span>{currentStep.safetyTip}</span></div>
            )}
            {currentStep.commonMistake && (
              <div className="flex gap-1.5 mt-1 text-[11px] text-[oklch(0.78_0.17_75)]"><XCircle className="h-3 w-3 shrink-0 mt-0.5" /><span>{currentStep.commonMistake}</span></div>
            )}
          </div>

          <Button onClick={onAskMore} size="sm" variant="outline" className="w-full gap-1.5 border-emerald/30 text-emerald hover:bg-emerald/10 h-8 text-xs" disabled={aiThinking}>
            {aiThinking ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Lightbulb className="h-3.5 w-3.5" />}
            {aiThinking ? "MecaAI explicando…" : "Explicar más a fondo"}
          </Button>
          {aiExtra && (
            <div className="mt-2 rounded-lg bg-card/60 border border-border/60 p-2.5 text-[11px] text-muted-foreground leading-relaxed whitespace-pre-wrap">{aiExtra}</div>
          )}
        </GlassCard>
      )}

      {/* Wrong tool feedback */}
      <AnimatePresence>
        {wrongToolMsg && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <GlassCard className="p-3 border-[oklch(0.68_0.21_25)]/40">
              <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-[oklch(0.68_0.21_25)] mb-1">
                <XCircle className="h-3 w-3" /> Herramienta incorrecta
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">{wrongToolMsg}</p>
              {aiThinking && <div className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1"><Loader2 className="h-3 w-3 animate-spin" /> MecaAI analizando…</div>}
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Steps list */}
      <GlassCard className="p-4">
        <h3 className="font-semibold text-sm mb-2">Progreso del procedimiento</h3>
        <div className="space-y-1 max-h-[180px] overflow-y-auto mcx-scroll pr-1">
          {procedure.steps.map((s, i) => {
            const done = i < stepIndex;
            const active = i === stepIndex;
            return (
              <div key={s.id} className={cn("flex items-start gap-2 rounded-lg p-2 text-xs", active ? "bg-emerald/10 border border-emerald/30" : done ? "bg-card/30" : "bg-card/20 opacity-60")}>
                <span className={cn("h-4 w-4 rounded-full flex items-center justify-center text-[9px] shrink-0 mt-0.5", done ? "bg-emerald text-emerald-foreground" : active ? "bg-emerald text-emerald-foreground" : "bg-muted text-muted-foreground")}>
                  {done ? <CheckCircle2 className="h-3 w-3" /> : i + 1}
                </span>
                <span className="leading-snug">{s.instruction}</span>
              </div>
            );
          })}
        </div>
      </GlassCard>
    </>
  );
}

// ===== Exam Panel =====
function ExamPanel({
  mistakes, toolsUsed, damages, avoided, started, result, onStart, onReset,
}: {
  mistakes: number; toolsUsed: number; damages: number; avoided: number;
  started: boolean; result: ReturnType<typeof gradeExam> | null;
  onStart: () => void; onReset: () => void;
}) {
  if (result) {
    return (
      <GlassCard className="p-5 mcx-border-gradient">
        <div className="text-center mb-4">
          <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-amber/20 to-emerald/20 flex items-center justify-center text-amber mx-auto mb-2"><Trophy className="h-7 w-7" /></div>
          <div className="font-bold text-lg">{result.finalGrade}/100</div>
          <Badge variant="outline" className="mt-1 bg-amber/10 text-amber border-amber/30">{result.rank}</Badge>
        </div>
        <div className="grid grid-cols-2 gap-2 mb-3">
          <ExamMetric label="Precisión" value={`${result.precision}%`} good={result.precision >= 75} />
          <ExamMetric label="Tiempo" value={result.timeTaken} good />
          <ExamMetric label="Herramientas" value={String(result.toolsUsed)} good />
          <ExamMetric label="Errores" value={String(result.mistakes)} good={result.mistakes === 0} />
          <ExamMetric label="Daños causados" value={String(result.damagesCaused)} good={result.damagesCaused === 0} />
          <ExamMetric label="Daños evitados" value={String(result.damagesAvoided)} good />
        </div>
        <Button onClick={onReset} className="w-full gap-2 bg-amber text-amber-foreground hover:bg-amber/90"><RotateCcw className="h-4 w-4" /> Repetir examen</Button>
      </GlassCard>
    );
  }
  return (
    <>
      <GlassCard className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <ClipboardCheck className="h-4 w-4 text-[oklch(0.68_0.21_25)]" />
          <h3 className="font-semibold text-sm">Modo Examen</h3>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed mb-3">
          Sin ayuda ni guía. Retira el turbo del MecaTurbo I4 usando solo tus conocimientos: pernos primero, luego la pieza. Cada error y daño penaliza tu calificación.
        </p>
        {!started ? (
          <Button onClick={onStart} className="w-full gap-2 bg-[oklch(0.68_0.21_25)] text-white hover:opacity-90"><Play className="h-4 w-4" /> Iniciar examen</Button>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            <ExamStat label="Errores" value={mistakes} color="text-[oklch(0.68_0.21_25)]" />
            <ExamStat label="Herramientas" value={toolsUsed} color="text-amber" />
            <ExamStat label="Daños" value={damages} color="text-[oklch(0.68_0.21_25)]" />
            <ExamStat label="Evitados" value={avoided} color="text-emerald" />
          </div>
        )}
      </GlassCard>
      {started && (
        <GlassCard className="p-4">
          <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-amber mb-1"><Clock className="h-3 w-3" /> Objetivo</div>
          <p className="text-xs text-muted-foreground">Retira correctamente el turbocharger: afloja sus pernos en orden y luego desmóntalo. Evita forzar piezas.</p>
        </GlassCard>
      )}
    </>
  );
}

// ===== Small components =====
function ModeTab({ active, onClick, icon: Icon, label, color }: {
  active: boolean; onClick: () => void; icon: React.ComponentType<{ className?: string }>; label: string; color: "amber" | "emerald" | "crit";
}) {
  const colorMap = {
    amber: active ? "bg-amber/15 text-amber border-amber/40" : "",
    emerald: active ? "bg-emerald/15 text-emerald border-emerald/40" : "",
    crit: active ? "bg-[oklch(0.68_0.21_25)]/15 text-[oklch(0.68_0.21_25)] border-[oklch(0.68_0.21_25)]/40" : "",
  };
  return (
    <button onClick={onClick} className={cn("flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium border transition-colors", active ? colorMap[color] : "bg-card/50 text-muted-foreground border-border hover:text-foreground")}>
      <Icon className="h-3.5 w-3.5" /> {label}
    </button>
  );
}

function ControlToggle({ active, onClick, icon: Icon, label }: {
  active: boolean; onClick: () => void; icon: React.ComponentType<{ className?: string }>; label: string;
}) {
  return (
    <button onClick={onClick} className={cn("flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium border transition-colors", active ? "bg-amber/15 text-amber border-amber/40" : "bg-card/50 text-muted-foreground border-border hover:text-foreground")}>
      <Icon className={cn("h-3.5 w-3.5", active && "animate-pulse")} /> {label}
    </button>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border/60 bg-card/40 p-2 text-center">
      <div className="text-sm font-bold text-amber">{value}</div>
      <div className="text-[9px] uppercase tracking-wider text-muted-foreground">{label}</div>
    </div>
  );
}

function ExamStat({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="rounded-lg border border-border/60 bg-card/40 p-2 text-center">
      <div className={cn("text-lg font-bold", color)}>{value}</div>
      <div className="text-[9px] uppercase tracking-wider text-muted-foreground">{label}</div>
    </div>
  );
}

function ExamMetric({ label, value, good }: { label: string; value: string; good: boolean }) {
  return (
    <div className={cn("rounded-lg border p-2.5 text-center", good ? "bg-emerald/5 border-emerald/20" : "bg-[oklch(0.68_0.21_25)]/5 border-[oklch(0.68_0.21_25)]/20")}>
      <div className={cn("text-lg font-bold", good ? "text-emerald" : "text-[oklch(0.68_0.21_25)]")}>{value}</div>
      <div className="text-[9px] uppercase tracking-wider text-muted-foreground">{label}</div>
    </div>
  );
}
