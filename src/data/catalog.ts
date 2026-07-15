// Mecatrix static catalogs — engines, vehicles, tools, courses.
// These power the Library / Workshop / Training views.

export type Status = "ok" | "warn" | "crit";

export interface EngineComponent {
  id: string;
  name: string;
  function: string;
  symptoms?: string;
  causes?: string[];
  inspection?: string[];
  tools?: string[];
  difficulty?: "Easy" | "Moderate" | "Hard" | "Expert";
  // 3D placement (normalized 0..1 within engine bounding box) + color
  pos: [number, number, number];
  scale: [number, number, number];
  shape: "block" | "cyl" | "sphere" | "torus" | "cone" | "panel";
  color: string;
}

export interface EngineModel {
  id: string;
  name: string;
  category: "Gasoline" | "Diesel" | "Hybrid" | "Electric";
  vehicleType: "Car" | "Motorcycle" | "Tricycle" | "Pickup" | "Heavy Truck";
  displacement: string;
  cylinders?: number;
  fuelSystem: string;
  power: string;
  torque: string;
  year: string;
  summary: string;
  accent: string;
  components: EngineComponent[];
}

// A reusable component palette so every engine feels populated.
const baseComponents = (offset: [number, number, number] = [0, 0, 0]): EngineComponent[] => [
  {
    id: "block",
    name: "Engine Block",
    function: "Main structural housing containing the cylinders where combustion occurs.",
    symptoms: "Coolant loss, overheating, metallic knocking, oil/coolant mixing.",
    causes: ["Cracked block", "Failed head gasket", "Porosity", "Freezing damage"],
    inspection: ["Pressure test cooling system", "Check for external leaks", "Inspect oil for coolant"],
    tools: ["Coolant pressure tester", "Flashlight", "Borescope"],
    difficulty: "Expert",
    pos: [0 + offset[0], 0 + offset[1], 0 + offset[2]],
    scale: [2.4, 1.5, 1.5],
    shape: "block",
    color: "#7a8290",
  },
  {
    id: "cyl-head",
    name: "Cylinder Head",
    function: "Seals the top of the cylinders, houses valves, camshafts and combustion chamber.",
    symptoms: "Overheating, white smoke, misfire, compression loss.",
    causes: ["Warped head", "Blown head gasket", "Cracked head", "Valve seat failure"],
    inspection: ["Check flatness with straightedge", "Compression test", "Leak-down test"],
    tools: ["Straightedge", "Feeler gauge", "Torque wrench"],
    difficulty: "Hard",
    pos: [0 + offset[0], 1.05 + offset[1], 0 + offset[2]],
    scale: [2.4, 0.5, 1.5],
    shape: "block",
    color: "#8a93a3",
  },
  {
    id: "pistons",
    name: "Pistons & Connecting Rods",
    function: "Convert combustion pressure into linear motion transferred to the crankshaft.",
    symptoms: "Piston slap, low compression, blow-by, knocking under load.",
    causes: ["Worn rings", "Piston scuffing", "Cracked skirt", "Bearing wear"],
    inspection: ["Compression test", "Borescope cylinder walls", "Oil analysis"],
    tools: ["Compression tester", "Borescope", "Micrometer"],
    difficulty: "Expert",
    pos: [-0.6 + offset[0], 0.2 + offset[1], 0 + offset[2]],
    scale: [0.55, 1.1, 0.55],
    shape: "cyl",
    color: "#9aa3b3",
  },
  {
    id: "crank",
    name: "Crankshaft",
    function: "Converts reciprocating piston motion into rotational torque to drive the wheels.",
    symptoms: "Deep knock, vibration, oil pressure loss.",
    causes: ["Bearing wear", "Crankshaft fracture", "Twist", "Journal scoring"],
    inspection: ["Measure journal runout", "Oil pressure test", "Bearing visual"],
    tools: ["Micrometer", "Dial indicator", "Plastigauge"],
    difficulty: "Expert",
    pos: [0 + offset[0], -0.85 + offset[1], 0 + offset[2]],
    scale: [2.1, 0.45, 0.45],
    shape: "cyl",
    color: "#6a727f",
  },
  {
    id: "intake",
    name: "Intake Manifold",
    function: "Distributes air (and fuel on port-injected engines) evenly to each cylinder.",
    symptoms: "Vacuum leak, rough idle, lean codes, hesitation.",
    causes: ["Leaking gasket", "Cracked plastic", "Carbon buildup", "Loose bolts"],
    inspection: ["Smoke test", "Spray carb cleaner test", "Scan fuel trims"],
    tools: ["Smoke machine", "OBD-II scanner", "Torque wrench"],
    difficulty: "Moderate",
    pos: [0 + offset[0], 0.7 + offset[1], -1.05 + offset[2]],
    scale: [2.0, 0.5, 0.45],
    shape: "panel",
    color: "#5a6270",
  },
  {
    id: "exhaust",
    name: "Exhaust Manifold",
    function: "Collects combustion gases from cylinders and routes them to the exhaust system.",
    symptoms: "Ticking noise, exhaust smell, reduced power, glowing manifold.",
    causes: ["Cracked manifold", "Leaking gasket", "Broken studs", "Warpage"],
    inspection: ["Visual for cracks", "Listen for ticks", "Back-pressure test"],
    tools: ["Inspection mirror", "Stethoscope", "Exhaust back-pressure gauge"],
    difficulty: "Hard",
    pos: [0 + offset[0], 0.7 + offset[1], 1.05 + offset[2]],
    scale: [2.0, 0.5, 0.45],
    shape: "panel",
    color: "#4a505c",
  },
  {
    id: "timing",
    name: "Timing Chain / Belt",
    function: "Synchronizes crankshaft and camshaft rotation so valves open at the correct time.",
    symptoms: "Rattle on startup, cam/crank correlation codes, no-start after slip.",
    causes: ["Stretched chain", "Worn tensioner", "Broken belt", "Mis-timing"],
    inspection: ["Check timing marks", "Scan cam/crank sync", "Tensioner travel"],
    tools: ["Timing light", "OBD-II scanner", "Special locking tools"],
    difficulty: "Hard",
    pos: [1.35 + offset[0], 0.4 + offset[1], 0 + offset[2]],
    scale: [0.35, 0.9, 0.9],
    shape: "torus",
    color: "#b08a4a",
  },
  {
    id: "turbo",
    name: "Turbocharger",
    function: "Forces compressed air into the engine to increase power output.",
    symptoms: "Loss of boost, whining, oil consumption, black smoke.",
    causes: ["Worn journal bearings", "Damaged impeller", "Wastegate stuck", "Boost leak"],
    inspection: ["Boost leak test", "Check shaft play", "Inspect compressor wheel"],
    tools: ["Boost pressure gauge", "Boost leak tester", "Boroscope"],
    difficulty: "Hard",
    pos: [-1.5 + offset[0], 1.4 + offset[1], 0 + offset[2]],
    scale: [0.7, 0.7, 0.7],
    shape: "sphere",
    color: "#c0843a",
  },
  {
    id: "injectors",
    name: "Fuel Injectors",
    function: "Spray precise amounts of fuel into the intake port or directly into the cylinder.",
    symptoms: "Misfire, rough idle, fuel smell, lean/rich codes.",
    causes: ["Clogged nozzle", "Leaking seal", "Failed coil", "Worn pintle"],
    inspection: ["Balance test via scanner", "Listen with stethoscope", "Ohm test"],
    tools: ["OBD-II scanner", "Noid light", "Multimeter"],
    difficulty: "Moderate",
    pos: [0.7 + offset[0], 1.0 + offset[1], -0.4 + offset[2]],
    scale: [0.18, 0.7, 0.18],
    shape: "cyl",
    color: "#d8a44a",
  },
  {
    id: "alternator",
    name: "Alternator",
    function: "Charges the battery and powers the electrical system while the engine runs.",
    symptoms: "Battery light, dim lights, dead battery, voltage drops.",
    causes: ["Worn brushes", "Bad voltage regulator", "Faulty diode", "Slipping belt"],
    inspection: ["Charging voltage test (13.8–14.4V)", "Load test", "Belt tension"],
    tools: ["Multimeter", "Battery load tester", "Belt tension gauge"],
    difficulty: "Moderate",
    pos: [1.4 + offset[0], -0.4 + offset[1], 0.7 + offset[2]],
    scale: [0.6, 0.6, 0.6],
    shape: "cyl",
    color: "#9aa3b3",
  },
  {
    id: "battery",
    name: "Battery",
    function: "Stores electrical energy to start the engine and buffer the electrical system.",
    symptoms: "Slow crank, no-start, warning lights, electrical glitches.",
    causes: ["Sulfation", "Low electrolyte", "Bad cell", "Parasitic drain"],
    inspection: ["Voltage at rest (>12.4V)", "Load test", "Parasitic draw test"],
    tools: ["Multimeter", "Battery load tester", "Hydrometer"],
    difficulty: "Easy",
    pos: [-1.5 + offset[0], -0.5 + offset[1], 0.7 + offset[2]],
    scale: [0.7, 0.5, 0.5],
    shape: "block",
    color: "#2f343c",
  },
];

export const ENGINES: EngineModel[] = [
  {
    id: "gas-i4-turbo",
    name: "MecaTurbo I4 2.0T",
    category: "Gasoline",
    vehicleType: "Car",
    displacement: "2.0L",
    cylinders: 4,
    fuelSystem: "Direct Injection + Turbo",
    power: "252 hp @ 5500 rpm",
    torque: "370 Nm @ 1800 rpm",
    year: "2024",
    summary:
      "A modern turbocharged inline-4 with direct injection, variable valve timing and a liquid-cooled intercooler. Common in compact and mid-size sedans.",
    accent: "#e07a2f",
    components: baseComponents(),
  },
  {
    id: "diesel-i6",
    name: "MecaTorque I6 3.0D",
    category: "Diesel",
    vehicleType: "Pickup",
    displacement: "3.0L",
    cylinders: 6,
    fuelSystem: "Common-Rail Direct Injection",
    power: "286 hp @ 4000 rpm",
    torque: "650 Nm @ 1500 rpm",
    year: "2023",
    summary:
      "Inline-6 common-rail diesel built for towing and heavy duty. High-pressure fuel system, EGR, DPF and SCR aftertreatment.",
    accent: "#d8a44a",
    components: baseComponents([0, 0.1, 0]),
  },
  {
    id: "hybrid-atkinson",
    name: "MecaHybrid 2.5 Atkinson",
    category: "Hybrid",
    vehicleType: "Car",
    displacement: "2.5L",
    cylinders: 4,
    fuelSystem: "Port Injection + e-CVT Hybrid",
    power: "215 hp combined",
    torque: "300 Nm combined",
    year: "2024",
    summary:
      "Atkinson-cycle gasoline engine paired with dual electric motors and a planetary e-CVT. Optimized for thermal efficiency above 40%.",
    accent: "#4aa876",
    components: baseComponents(),
  },
  {
    id: "electric-powertrain",
    name: "MecaVolt EV Powertrain",
    category: "Electric",
    vehicleType: "Car",
    displacement: "—",
    cylinders: 0,
    fuelSystem: "800V Battery + Inverter",
    power: "480 kW (644 hp)",
    torque: "820 Nm instant",
    year: "2025",
    summary:
      "Dual permanent-magnet motors, 800V silicon-carbide inverter and a liquid-cooled lithium-ion pack. No moving combustion parts.",
    accent: "#4aa8e0",
    components: baseComponents().map((c) => ({
      ...c,
      color: c.id === "battery" ? "#1f8f5a" : c.color,
    })),
  },
  {
    id: "gas-v8",
    name: "MecaV8 5.0L",
    category: "Gasoline",
    vehicleType: "Pickup",
    displacement: "5.0L",
    cylinders: 8,
    fuelSystem: "Multi-Point Injection",
    power: "395 hp @ 6500 rpm",
    torque: "520 Nm @ 4200 rpm",
    year: "2023",
    summary:
      "Naturally-aspirated V8 with cross-plane crankshaft, favored for trucks and performance vehicles requiring low-end torque.",
    accent: "#c8443a",
    components: baseComponents([0, 0.2, 0]),
  },
  {
    id: "moto-twin",
    name: "MecaMoto Parallel-Twin 900",
    category: "Gasoline",
    vehicleType: "Motorcycle",
    displacement: "900cc",
    cylinders: 2,
    fuelSystem: "Ride-by-Wire EFI",
    power: "105 hp @ 8500 rpm",
    torque: "92 Nm @ 6500 rpm",
    year: "2024",
    summary:
      "Compact parallel-twin for adventure motorcycles. 270° crank for V-twin character, 6-speed assist-and-slipper clutch.",
    accent: "#e0a23a",
    components: baseComponents().map((c) => ({ ...c, scale: c.scale.map((s) => s * 0.7) as [number, number, number] })),
  },
  {
    id: "tricycle-cargo",
    name: "MecaCargo Trike 200",
    category: "Gasoline",
    vehicleType: "Tricycle",
    displacement: "200cc",
    cylinders: 1,
    fuelSystem: "Carburetor",
    power: "18 hp @ 8000 rpm",
    torque: "16 Nm @ 6000 rpm",
    year: "2024",
    summary:
      "Single-cylinder air-cooled engine for cargo three-wheelers. Simple, serviceable design tuned for low-end torque and fuel economy.",
    accent: "#c8753a",
    components: baseComponents().map((c) => ({ ...c, scale: c.scale.map((s) => s * 0.55) as [number, number, number] })),
  },
  {
    id: "heavy-diesel-v8",
    name: "MecaHaul V8 15L Diesel",
    category: "Diesel",
    vehicleType: "Heavy Truck",
    displacement: "15.0L",
    cylinders: 8,
    fuelSystem: "High-Pressure Common Rail",
    power: "605 hp @ 1900 rpm",
    torque: "2780 Nm @ 1100 rpm",
    year: "2024",
    summary:
      "Class-8 heavy truck V8 diesel with massive low-end torque, dual turbo, engine brake and telemetry-grade sensors.",
    accent: "#b88838",
    components: baseComponents().map((c) => ({ ...c, scale: c.scale.map((s) => s * 1.35) as [number, number, number] })),
  },
];

export interface ToolItem {
  id: string;
  name: string;
  category: "Wrenches" | "Sockets" | "Screwdrivers" | "Specialty" | "Diagnostic" | "Lifting";
  icon: string;
  description: string;
  uses: string[];
  procedure: string[];
  applications: string[];
  color: string;
}

export const TOOLS: ToolItem[] = [
  {
    id: "combo-wrench",
    name: "Combination Wrench Set",
    category: "Wrenches",
    icon: "wrench",
    description: "Open-end on one side, box-end on the other. The mechanic's primary hand tool for hex fasteners.",
    uses: ["Tighten/loosen bolts and nuts", "Hold counter-nuts", "Work in confined spaces"],
    procedure: ["Select correct metric size", "Seat fully on fastener", "Pull toward you; never push", "Use box-end for final torque"],
    applications: ["Drain plugs", "Bracket bolts", "Hose fittings"],
    color: "#c89045",
  },
  {
    id: "socket-set",
    name: "Socket & Ratchet Set",
    category: "Sockets",
    icon: "circle-dot",
    description: "Ratchet with interchangeable sockets in 1/4, 3/8 and 1/2 drives for speed and torque.",
    uses: ["High-speed removal", "Torque-critical fasteners", "Deep recess bolts"],
    procedure: ["Match drive to torque needed", "Use extensions for depth", "Set ratchet direction", "Use breaker bar for stubborn bolts"],
    applications: ["Cylinder head bolts", "Wheel lugs", "Exhaust flanges"],
    color: "#d8a44a",
  },
  {
    id: "torque-wrench",
    name: "Click-Type Torque Wrench",
    category: "Specialty",
    icon: "gauge",
    description: "Precision instrument that clicks when a preset torque is reached, preventing over- or under-tightening.",
    uses: ["Critical fasteners", "Engine internals", "Wheel installation"],
    procedure: ["Set target torque", "Pull smoothly until click", "Stop immediately at click", "Return to lowest setting for storage"],
    applications: ["Head bolts", "Con rod caps", "Wheel lugs", "Spark plugs"],
    color: "#4aa876",
  },
  {
    id: "multimeter",
    name: "Digital Multimeter",
    category: "Diagnostic",
    icon: "activity",
    description: "Measures voltage, current and resistance — essential for electrical and sensor diagnostics.",
    uses: ["Check battery & charging", "Test sensors", "Find parasitic draws", "Continuity checks"],
    procedure: ["Select correct mode & range", "Connect leads properly", "Probe across component", "Compare reading to spec"],
    applications: ["Alternator output", "O2 sensors", "Ground integrity", "Blown fuses"],
    color: "#4aa8e0",
  },
  {
    id: "obd2-scanner",
    name: "OBD-II Diagnostic Scanner",
    category: "Diagnostic",
    icon: "scan-line",
    description: "Reads and clears diagnostic trouble codes and live data from the vehicle's ECU.",
    uses: ["Read & clear DTCs", "View live sensor data", "Monitor readiness", "Component testing"],
    procedure: ["Locate OBD-II port (under dash)", "Plug in with key off", "Turn key to ON", "Read codes & freeze frame", "Clear after repair"],
    applications: ["Check Engine light", "Emissions readiness", "Misfire diagnosis", "Sensor validation"],
    color: "#4aa8e0",
  },
  {
    id: "hydraulic-jack",
    name: "Hydraulic Floor Jack",
    category: "Lifting",
    icon: "arrow-up-from-line",
    description: "Lifts the vehicle using hydraulic pressure. Always pair with rated jack stands.",
    uses: ["Lift vehicle for undercarriage work", "Tire rotation", "Brake service"],
    procedure: ["Chock opposite wheels", "Place jack on lift point", "Pump to lift", "Support with jack stands", "Lower onto stands"],
    applications: ["Tire service", "Suspension", "Exhaust", "Oil changes"],
    color: "#c8443a",
  },
  {
    id: "puller",
    name: "3-Jaw Gear Puller",
    category: "Specialty",
    icon: "git-pull-request",
    description: "Removes press-fit parts like pulleys, gears and bearings without damage.",
    uses: ["Remove crank pulleys", "Pull bearings", "Extract steering arms"],
    procedure: ["Center puller on part", "Engage jaws securely", "Tighten center bolt evenly", "Apply penetrating oil if stuck"],
    applications: ["Harmonic balancer", "Wheel bearings", "Tie-rod ends"],
    color: "#b88838",
  },
  {
    id: "screwdriver-set",
    name: "Insulated Screwdriver Set",
    category: "Screwdrivers",
    icon: "screwdriver",
    description: "Phillips, flat, Torx and hex drivers with insulated handles for electrical safety.",
    uses: ["Interior trim", "Electrical connectors", "Small fasteners"],
    procedure: ["Match tip to fastener", "Apply downward pressure while turning", "Replace stripped tips"],
    applications: ["Panel removal", "Sensor mounts", "Battery terminals"],
    color: "#9aa3b3",
  },
];

export interface Course {
  id: string;
  slug: string;
  title: string;
  level: "Beginner" | "Intermediate" | "Advanced" | "Expert";
  duration: string;
  lessons: number;
  category: string;
  description: string;
  topics: string[];
  accent: string;
}

export const COURSES: Course[] = [
  {
    id: "c1",
    slug: "engine-fundamentals",
    title: "Engine Fundamentals: The 4-Stroke Cycle",
    level: "Beginner",
    duration: "1h 40m",
    lessons: 8,
    category: "Theory",
    description: "Understand intake, compression, power and exhaust — the heartbeat of every combustion engine.",
    topics: ["Thermodynamics basics", "Valve timing", "Combustion pressure", "Volumetric efficiency"],
    accent: "#e07a2f",
  },
  {
    id: "c2",
    slug: "electrical-diagnosis",
    title: "Modern Electrical Diagnosis",
    level: "Intermediate",
    duration: "3h 10m",
    lessons: 14,
    category: "Electrical",
    description: "Master wiring diagrams, multimeters and systematic troubleshooting of sensors and actuators.",
    topics: ["Reading schematics", "Voltage drop testing", "CAN bus basics", "Parasitic draws"],
    accent: "#4aa8e0",
  },
  {
    id: "c3",
    slug: "brake-systems",
    title: "Brake Systems: Hydraulics to ABS",
    level: "Intermediate",
    duration: "2h 25m",
    lessons: 11,
    category: "Chassis",
    description: "From master cylinder to ABS module — diagnose pulsations, spongy pedals and uneven wear.",
    topics: ["Hydraulic principles", "Bleeding techniques", "ABS/ESC", "Rotor runout"],
    accent: "#c8443a",
  },
  {
    id: "c4",
    slug: "ev-powertrain",
    title: "EV Powertrain Service",
    level: "Advanced",
    duration: "4h 00m",
    lessons: 16,
    category: "Electric",
    description: "High-voltage safety, battery diagnostics and inverter servicing for modern electric vehicles.",
    topics: ["HV safety protocols", "Battery BMS", "Inverter cooling", "Motor diagnostics"],
    accent: "#4aa876",
  },
  {
    id: "c5",
    slug: "diesel-aftertreatment",
    title: "Diesel Aftertreatment Systems",
    level: "Expert",
    duration: "3h 50m",
    lessons: 13,
    category: "Diesel",
    description: "DPF, SCR, EGR and DEF — diagnose regen failures and emissions fault codes.",
    topics: ["DPF regeneration", "DEF system", "NOx sensors", "EGR failures"],
    accent: "#b88838",
  },
  {
    id: "c6",
    slug: "diagnostic-strategy",
    title: "The Diagnostic Mindset",
    level: "Advanced",
    duration: "2h 15m",
    lessons: 9,
    category: "Methodology",
    description: "A repeatable framework to find the root cause fast — symptom, system, component, verify.",
    topics: ["Symptom verification", "Split-half method", "Data-driven decisions", "No-fault-found cases"],
    accent: "#d8a44a",
  },
];

export interface TrainingScenario {
  id: string;
  title: string;
  engineId: string;
  difficulty: "Easy" | "Medium" | "Hard";
  scenario: string;
  symptom: string;
  rootCause: string;
  correctComponentId: string;
  steps: string[];
  estimatedTime: string;
}

export const TRAINING_SCENARIOS: TrainingScenario[] = [
  {
    id: "t1",
    title: "The Mystery Misfire",
    engineId: "gas-i4-turbo",
    difficulty: "Medium",
    scenario: "A 2.0L turbo idles rough and sets a random misfire code under load.",
    symptom: "Rough idle, P0300, slight shake at 1500 rpm.",
    rootCause: "A clogged fuel injector is leaning out cylinder #3, causing intermittent misfire.",
    correctComponentId: "injectors",
    steps: [
      "Read DTCs and freeze frame",
      "Perform injector balance test via scanner",
      "Swap injector between cylinders to confirm follow",
      "Replace faulty injector and seal",
      "Clear codes and verify smooth idle",
    ],
    estimatedTime: "12 min",
  },
  {
    id: "t2",
    title: "Overheating Under Load",
    engineId: "diesel-i6",
    difficulty: "Hard",
    scenario: "A 3.0L diesel overheats only when towing uphill.",
    symptom: "Temp climbs past 110°C under load, EGT high, no external leak.",
    rootCause: "Head gasket breach between combustion chamber and coolant passage.",
    correctComponentId: "cyl-head",
    steps: [
      "Pressure-test cooling system",
      "Check for combustion gases in coolant",
      "Verify head flatness",
      "Replace head gasket, resurface head",
      "Retorque, bleed system, road test",
    ],
    estimatedTime: "18 min",
  },
  {
    id: "t3",
    title: "Silent Starter, Dim Lights",
    engineId: "hybrid-atkinson",
    difficulty: "Easy",
    scenario: "Vehicle won't crank; dashboard dims dramatically.",
    symptom: "Voltage at rest 11.9V, dim headlights, clicking solenoid.",
    rootCause: "Degraded battery with a bad cell cannot supply cranking current.",
    correctComponentId: "battery",
    steps: [
      "Measure resting voltage",
      "Perform battery load test",
      "Inspect terminals for corrosion",
      "Replace battery, register if required",
      "Verify charging voltage 13.8–14.4V",
    ],
    estimatedTime: "8 min",
  },
  {
    id: "t4",
    title: "Whining Power Loss",
    engineId: "gas-v8",
    difficulty: "Medium",
    scenario: "V8 loses power above 3000 rpm with a high-pitched whine.",
    symptom: "Boost/airflow low, whine increases with rpm, no smoke.",
    rootCause: "Turbocharger impeller contacting housing due to worn journal bearings.",
    correctComponentId: "turbo",
    steps: [
      "Inspect for shaft play",
      "Check boost pressure vs spec",
      "Inspect compressor wheel for rub marks",
      "Replace or rebuild turbocharger",
      "Change oil feed/return lines, verify boost",
    ],
    estimatedTime: "15 min",
  },
];

export function getEngine(id: string) {
  return ENGINES.find((e) => e.id === id) ?? ENGINES[0];
}
