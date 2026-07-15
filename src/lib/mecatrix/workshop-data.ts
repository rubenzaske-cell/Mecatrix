// Mecatrix Virtual Workshop — interactive simulator data layer.
// Tools, fasteners (bolts) per engine, repair procedures, tool↔bolt compatibility.

import type { EngineModel } from "@/data/catalog";

export type BoltType = "hex" | "allen" | "torx" | "clamp";
export type BoltState = "tight" | "loosening" | "removed";
export type CompState = "installed" | "removing" | "removed";

export interface BoltDef {
  id: string;
  componentId: string;
  pos: [number, number, number];
  size: number; // mm
  type: BoltType;
}

export interface WorkshopTool {
  id: string;
  name: string;
  category: ToolCategory;
  icon: string; // lucide icon key (resolved in view)
  shape: ToolShape;
  color: string;
  size?: number;
  fitsBoltSizes?: number[];
  fitsBoltTypes?: BoltType[];
  compatibleComponentIds?: string[]; // for diagnostic/special tools
  special?: "torque" | "impact" | "electrical" | "scan" | "lift" | "pull" | "grip" | "persuade";
  description: string;
}

export type ToolCategory =
  | "Llaves" | "Dados" | "Allen / Torx" | "Destornilladores"
  | "Pinzas y Martillo" | "Torque e Impacto" | "Diagnóstico" | "Elevación" | "Especiales";

export type ToolShape =
  | "wrench" | "socket" | "allen" | "torx" | "screwdriver" | "pliers"
  | "hammer" | "torque" | "impact" | "multimeter" | "scanner" | "jack" | "puller";

export const WORKSHOP_TOOLS: WorkshopTool[] = [
  // Llaves combinadas
  { id: "wrench-10", name: "Llave combinada 10 mm", category: "Llaves", icon: "wrench", shape: "wrench", color: "#c89045", size: 10, fitsBoltSizes: [10], fitsBoltTypes: ["hex"], description: "Llave abocinada + estriada de 10 mm para pernos hexagonales pequeños." },
  { id: "wrench-12", name: "Llave combinada 12 mm", category: "Llaves", icon: "wrench", shape: "wrench", color: "#c89045", size: 12, fitsBoltSizes: [12], fitsBoltTypes: ["hex"], description: "Llave de 12 mm, muy usada en abrazaderes y tornillos de admisión." },
  { id: "wrench-14", name: "Llave combinada 14 mm", category: "Llaves", icon: "wrench", shape: "wrench", color: "#c89045", size: 14, fitsBoltSizes: [14], fitsBoltTypes: ["hex"], description: "Llave de 14 mm para pernos de líneas de aceite y escape." },
  // Dados / matraca
  { id: "socket-10", name: "Juego de dados 10 mm", category: "Dados", icon: "circle-dot", shape: "socket", color: "#d8a44a", size: 10, fitsBoltSizes: [10], fitsBoltTypes: ["hex"], description: "Dado de 10 mm con matraca para trabajo rápido en espacios reducidos." },
  { id: "socket-12", name: "Juego de dados 12 mm", category: "Dados", icon: "circle-dot", shape: "socket", color: "#d8a44a", size: 12, fitsBoltSizes: [12], fitsBoltTypes: ["hex"], description: "Dado de 12 mm con matraca, ideal para tornillería de cubierta." },
  { id: "socket-14", name: "Juego de dados 14 mm", category: "Dados", icon: "circle-dot", shape: "socket", color: "#d8a44a", size: 14, fitsBoltSizes: [14], fitsBoltTypes: ["hex"], description: "Dado de 14 mm con matraca para pernos de alta resistencia." },
  // Allen / Torx
  { id: "allen-8", name: "Llave Allen 8 mm", category: "Allen / Torx", icon: "hexagon", shape: "allen", color: "#9aa3b3", size: 8, fitsBoltSizes: [8], fitsBoltTypes: ["allen"], description: "Llave Allen en L de 8 mm para tornillos de cabeza hexagonal interna." },
  { id: "torx-8", name: "Llave Torx T40", category: "Allen / Torx", icon: "star", shape: "torx", color: "#9aa3b3", size: 8, fitsBoltSizes: [8], fitsBoltTypes: ["torx"], description: "Punta Torx T40 para tornillería de precisión de tapas de distribución." },
  // Destornilladores
  { id: "screwdriver-ph", name: "Destornillador Phillips", category: "Destornilladores", icon: "screwdriver", shape: "screwdriver", color: "#c8443a", fitsBoltTypes: ["clamp"], description: "Destornillador Phillips para abrazaderas de mangueras." },
  { id: "screwdriver-flat", name: "Destornillador plano", category: "Destornilladores", icon: "screwdriver", shape: "screwdriver", color: "#c8443a", fitsBoltTypes: ["clamp"], description: "Destornillador plano para palancas suaves y abrazaderas." },
  // Pinzas / Martillo
  { id: "pliers", name: "Alicates", category: "Pinzas y Martillo", icon: "grip", shape: "pliers", color: "#b88838", special: "grip", description: "Alicates para sujetar conectores y mangueras." },
  { id: "hammer", name: "Martillo de goma", category: "Pinzas y Martillo", icon: "hammer", shape: "hammer", color: "#b88838", special: "persuade", description: "Martillo de goma para aflojar piezas agarrotadas sin dañarlas." },
  // Torque / Impacto
  { id: "torque-wrench", name: "Torquímetro", category: "Torque e Impacto", icon: "gauge", shape: "torque", color: "#4aa876", size: 12, fitsBoltSizes: [10, 12, 14], fitsBoltTypes: ["hex"], special: "torque", description: "Llave de torque de clic para apriete preciso según especificación." },
  { id: "impact-gun", name: "Pistola de impacto", category: "Torque e Impacto", icon: "zap", shape: "impact", color: "#4aa876", fitsBoltSizes: [10, 12, 14], fitsBoltTypes: ["hex"], special: "impact", description: "Pistola de impacto neumática para aflojar pernos muy apretados." },
  // Diagnóstico
  { id: "multimeter", name: "Multímetro", category: "Diagnóstico", icon: "activity", shape: "multimeter", color: "#4aa8e0", special: "electrical", compatibleComponentIds: ["alternator", "battery"], description: "Multímetro digital para pruebas de voltaje, corriente y resistencia." },
  { id: "obd2-scanner", name: "Escáner OBD-II", category: "Diagnóstico", icon: "scan-line", shape: "scanner", color: "#4aa8e0", special: "scan", compatibleComponentIds: ["alternator", "battery", "injectors", "turbo"], description: "Escáner OBD-II para leer códigos y datos en vivo de la ECU." },
  // Elevación
  { id: "hydraulic-jack", name: "Gato hidráulico", category: "Elevación", icon: "arrow-up-from-line", shape: "jack", color: "#c8443a", special: "lift", description: "Gato hidráulico para levantar componentes pesados con seguridad." },
  // Especiales
  { id: "puller", name: "Extractor de 3 mordazas", category: "Especiales", icon: "git-pull-request", shape: "puller", color: "#b88838", special: "pull", compatibleComponentIds: ["timing", "alternator"], description: "Extractor para retirar piezas ajustadas a presión (poleas, engranajes)." },
];

export const TOOL_BY_ID: Record<string, WorkshopTool> = Object.fromEntries(
  WORKSHOP_TOOLS.map((t) => [t.id, t])
);

// Generate fasteners dynamically based on the engine's components.
export function getBoltsForEngine(engine: EngineModel): BoltDef[] {
  const bolts: BoltDef[] = [];
  const head = engine.components.find((c) => c.id === "cyl-head");
  if (head) {
    const y = head.pos[1] + head.scale[1] / 2 + 0.08;
    const hx = head.scale[0] / 2 - 0.4;
    const hz = head.scale[2] / 2 - 0.25;
    bolts.push({ id: `${engine.id}-b-vc-1`, componentId: "cyl-head", pos: [-hx, y, -hz], size: 10, type: "hex" });
    bolts.push({ id: `${engine.id}-b-vc-2`, componentId: "cyl-head", pos: [hx, y, -hz], size: 10, type: "hex" });
    bolts.push({ id: `${engine.id}-b-vc-3`, componentId: "cyl-head", pos: [-hx, y, hz], size: 10, type: "hex" });
    bolts.push({ id: `${engine.id}-b-vc-4`, componentId: "cyl-head", pos: [hx, y, hz], size: 10, type: "hex" });
  }
  const intake = engine.components.find((c) => c.id === "intake");
  if (intake) {
    const z = intake.pos[2] - intake.scale[2] / 2 - 0.04;
    bolts.push({ id: `${engine.id}-b-int-1`, componentId: "intake", pos: [-0.7, intake.pos[1], z], size: 12, type: "hex" });
    bolts.push({ id: `${engine.id}-b-int-2`, componentId: "intake", pos: [0.7, intake.pos[1], z], size: 12, type: "hex" });
  }
  const exhaust = engine.components.find((c) => c.id === "exhaust");
  if (exhaust) {
    const z = exhaust.pos[2] + exhaust.scale[2] / 2 + 0.04;
    bolts.push({ id: `${engine.id}-b-ex-1`, componentId: "exhaust", pos: [-0.6, exhaust.pos[1], z], size: 14, type: "hex" });
    bolts.push({ id: `${engine.id}-b-ex-2`, componentId: "exhaust", pos: [0.6, exhaust.pos[1], z], size: 14, type: "hex" });
  }
  const turbo = engine.components.find((c) => c.id === "turbo");
  if (turbo) {
    bolts.push({ id: `${engine.id}-b-turbo-1`, componentId: "turbo", pos: [turbo.pos[0], turbo.pos[1] + 0.5, 0.35], size: 14, type: "hex" });
    bolts.push({ id: `${engine.id}-b-turbo-2`, componentId: "turbo", pos: [turbo.pos[0], turbo.pos[1] + 0.5, -0.35], size: 14, type: "hex" });
  }
  const timing = engine.components.find((c) => c.id === "timing");
  if (timing) {
    bolts.push({ id: `${engine.id}-b-tc-1`, componentId: "timing", pos: [timing.pos[0] + 0.3, timing.pos[1] + 0.45, 0.3], size: 8, type: "torx" });
    bolts.push({ id: `${engine.id}-b-tc-2`, componentId: "timing", pos: [timing.pos[0] + 0.3, timing.pos[1] + 0.45, -0.3], size: 8, type: "torx" });
  }
  const injectors = engine.components.find((c) => c.id === "injectors");
  if (injectors) {
    bolts.push({ id: `${engine.id}-b-inj-1`, componentId: "injectors", pos: [injectors.pos[0], injectors.pos[1] + 0.45, injectors.pos[2]], size: 10, type: "hex" });
  }
  return bolts;
}

// Compatibility logic
export function toolFitsBolt(tool: WorkshopTool, bolt: BoltDef): boolean {
  if (tool.fitsBoltSizes?.includes(bolt.size) && tool.fitsBoltTypes?.includes(bolt.type)) return true;
  if (tool.special === "impact" && bolt.type === "hex" && tool.fitsBoltSizes?.includes(bolt.size)) return true;
  return false;
}

export function toolCompatibleWithComponent(
  tool: WorkshopTool,
  componentId: string,
  boltsOfComponent: BoltDef[]
): boolean {
  if (tool.compatibleComponentIds?.includes(componentId)) return true;
  return boltsOfComponent.some((b) => toolFitsBolt(tool, b));
}

// Returns bolt ids this tool can currently act on (tight bolts that fit).
export function compatibleBoltIds(
  tool: WorkshopTool | null,
  bolts: BoltDef[],
  boltStates: Record<string, BoltState>
): string[] {
  if (!tool) return [];
  return bolts.filter((b) => boltStates[b.id] === "tight" && toolFitsBolt(tool, b)).map((b) => b.id);
}

// Returns component ids this tool is compatible with (for highlight + special tools).
export function compatibleComponentIds(
  tool: WorkshopTool | null,
  engine: EngineModel,
  bolts: BoltDef[]
): string[] {
  if (!tool) return [];
  const set = new Set<string>();
  for (const c of engine.components) {
    const cb = bolts.filter((b) => b.componentId === c.id);
    if (toolCompatibleWithComponent(tool, c.id, cb)) set.add(c.id);
  }
  return Array.from(set);
}

// ===== Repair procedures =====
export type RepairAction = "select-tool" | "loosen-bolt" | "remove-component" | "verify";

export interface RepairStep {
  id: string;
  title: string;
  instruction: string;
  toolId: string;
  action: RepairAction;
  targetBoltId?: string;       // for loosen-bolt (full bolt id)
  targetComponentId?: string;  // for remove-component
  aiGuidance: string;
  safetyTip?: string;
  commonMistake?: string;
}

export interface RepairProcedure {
  id: string;
  title: string;
  engineId: string;
  description: string;
  steps: RepairStep[];
}

function b(engineId: string, key: string) {
  return `${engineId}-b-${key}`;
}

export const PROCEDURES: RepairProcedure[] = [
  {
    id: "proc-turbo",
    title: "Inspección y retiro del Turbocharger",
    engineId: "gas-i4-turbo",
    description: "Desmontaje seguro del turbo para inspección de holgura axial y marcas de roce.",
    steps: [
      {
        id: "s1", title: "Paso 1", action: "select-tool", toolId: "wrench-14",
        instruction: "Selecciona la llave combinada de 14 mm.",
        aiGuidance: "El turbo se sujeta con pernos de línea de aceite de 14 mm. La llave combinada te da el apalancamiento correcto sin redondear la cabeza.",
        safetyTip: "Verifica que el motor esté frío antes de tocar el turbo: puede superar los 400 °C en uso.",
        commonMistake: "Usar una llave de 13 mm parece entrar pero redondea la cabeza del perno.",
      },
      {
        id: "s2", title: "Paso 2", action: "loosen-bolt", toolId: "wrench-14", targetBoltId: b("gas-i4-turbo", "turbo-1"),
        instruction: "Gira la llave en sentido antihorario para aflojar el primer perno de suministro de aceite.",
        aiGuidance: "Sentido antihorario siempre afloja. Gira media vuelta primero para romper el torque inicial, luego continúa.",
        safetyTip: "Sujeta el turbo con la otra mano para que no gire el conjunto.",
      },
      {
        id: "s3", title: "Paso 3", action: "loosen-bolt", toolId: "wrench-14", targetBoltId: b("gas-i4-turbo", "turbo-2"),
        instruction: "Afloja el segundo perno de suministro de aceite.",
        aiGuidance: "Afloja en patrón cruzado para que la tensión se libere de forma uniforme y no se deformen las bridas.",
        commonMistake: "Quitar un solo perno por completo primero puede inclinar el turbo y dañar la rosca del otro.",
      },
      {
        id: "s4", title: "Paso 4", action: "select-tool", toolId: "wrench-12",
        instruction: "Ahora selecciona la llave de 12 mm para la abrazadera de admisión.",
        aiGuidance: "La abrazadera que une el intake al compressor usa perno de 12 mm. Es más liviana y no necesita la 14.",
      },
      {
        id: "s5", title: "Paso 5", action: "loosen-bolt", toolId: "wrench-12", targetBoltId: b("gas-i4-turbo", "int-1"),
        instruction: "Afloja la abrazadera de admisión girando en antihorario.",
        aiGuidance: "Solo afloja lo suficiente para deslizar la manguera, no retire el perno por completo.",
      },
      {
        id: "s6", title: "Paso 6", action: "remove-component", toolId: "wrench-14", targetComponentId: "turbo",
        instruction: "Retira el turbocharger tirando hacia arriba con cuidado.",
        aiGuidance: "Con todos los pernos aflojados, el turbo sale verticalmente. Mantén el eje horizontal para no dañar las aspas del compresor.",
        safetyTip: "El turbo puede pesar 6–10 kg. Usa guantes y soporta su peso al extraerlo.",
        commonMistake: "Forzar el turbo hacia un lado daña la rosca de la línea de aceite.",
      },
      {
        id: "s7", title: "Paso 7", action: "verify", toolId: "wrench-14",
        instruction: "Inspecciona las aspas del compresor buscando marcas de roce o desgaste.",
        aiGuidance: "Gira el eje suavemente: no debe haber juego axial perceptible ni roce del compresor contra la carcasa.",
        safetyTip: "Si hay holgura axial, NO reinstales el turbo: fallarácatastróficamente.",
      },
    ],
  },
  {
    id: "proc-valve-cover",
    title: "Retiro de la cubierta de balancines",
    engineId: "gas-i4-turbo",
    description: "Desmontaje de la tapa de válvulas para inspección de árbol de levas y lash de válvulas.",
    steps: [
      {
        id: "s1", title: "Paso 1", action: "select-tool", toolId: "socket-10",
        instruction: "Selecciona el dado de 10 mm con matraca.",
        aiGuidance: "La tapa de balancines usa 4 pernos de 10 mm. La matraca acelera el trabajo en el espacio reducido sobre el motor.",
      },
      {
        id: "s2", title: "Paso 2", action: "loosen-bolt", toolId: "socket-10", targetBoltId: b("gas-i4-turbo", "vc-1"),
        instruction: "Afloja el perno superior izquierdo en sentido antihorario.",
        aiGuidance: "Sigue un patrón de aflojado de fuera hacia adentro para no deformar la cubierta de aluminio.",
        commonMistake: "Aflojar en secuencia lineal deforma la cubierta y causa futuras fugas de aceite.",
      },
      {
        id: "s3", title: "Paso 3", action: "loosen-bolt", toolId: "socket-10", targetBoltId: b("gas-i4-turbo", "vc-2"),
        instruction: "Afloja el perno superior derecho.",
        aiGuidance: "Patrón cruzado: ahora el opuesto al anterior.",
      },
      {
        id: "s4", title: "Paso 4", action: "loosen-bolt", toolId: "socket-10", targetBoltId: b("gas-i4-turbo", "vc-3"),
        instruction: "Afloja el perno inferior izquierdo.",
        aiGuidance: "Continúa el patrón cruzado.",
      },
      {
        id: "s5", title: "Paso 5", action: "loosen-bolt", toolId: "socket-10", targetBoltId: b("gas-i4-turbo", "vc-4"),
        instruction: "Afloja el último perno inferior derecho.",
        aiGuidance: "Todos los pernos deben estar sueltos antes de levantar la cubierta.",
      },
      {
        id: "s6", title: "Paso 6", action: "remove-component", toolId: "socket-10", targetComponentId: "cyl-head",
        instruction: "Levanta la cubierta de balancines hacia arriba.",
        aiGuidance: "La junta de goma puede quedar pegada. Tira verticalmente; si resiste, golpes suaves con martillo de goma.",
        safetyTip: "No introduzcas herramientas metálicas entre la cubierta y la cabeza: rayarás la superficie de sellado.",
        commonMistake: "Palancar con destornillador daña la junta y la superficie mecanizada.",
      },
      {
        id: "s7", title: "Paso 7", action: "verify", toolId: "socket-10",
        instruction: "Inspecciona el árbol de levas y la holgura de válvulas.",
        aiGuidance: "Busca desgaste en los lóbulos de levas y verifica que no haya lodo oxidado en los conductos de aceite.",
      },
    ],
  },
];

export function proceduresForEngine(engineId: string): RepairProcedure[] {
  return PROCEDURES.filter((p) => p.engineId === engineId);
}

// ===== Exam grading =====
export interface ExamResult {
  precision: number;        // 0-100
  timeTaken: string;
  toolsUsed: number;
  mistakes: number;
  damagesAvoided: number;   // count of components removed correctly (bolts first)
  damagesCaused: number;
  finalGrade: number;       // 0-100
  rank: string;
}

export function gradeExam(
  stepsTotal: number,
  stepsCorrect: number,
  mistakes: number,
  damagesCaused: number,
  damagesAvoided: number,
  toolsUsed: number,
  elapsedMs: number
): ExamResult {
  const base = (stepsCorrect / Math.max(1, stepsTotal)) * 100;
  const penalty = mistakes * 8 + damagesCaused * 15;
  const precision = Math.max(0, Math.min(100, Math.round(base - penalty)));
  const min = Math.floor(elapsedMs / 60000);
  const sec = Math.floor((elapsedMs / 1000) % 60);
  const finalGrade = precision;
  let rank = "Aprendiz";
  if (finalGrade >= 90) rank = "Mecánico Maestro";
  else if (finalGrade >= 75) rank = "Mecánico Senior";
  else if (finalGrade >= 50) rank = "Mecánico Junior";
  return {
    precision,
    timeTaken: `${min}m ${sec}s`,
    toolsUsed,
    mistakes,
    damagesAvoided,
    damagesCaused,
    finalGrade,
    rank,
  };
}
