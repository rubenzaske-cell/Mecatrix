import {
  LayoutDashboard, Bot, Stethoscope, Boxes, Cpu, Car, Wrench,
  GraduationCap, ClipboardList, History, User, Settings,
} from "lucide-react";
import type { ViewId } from "@/lib/mecatrix/nav-store";

export interface NavItem {
  id: ViewId;
  label: string;
  short: string;
  icon: React.ComponentType<{ className?: string }>;
  group: "main" | "library" | "learning" | "account";
  description: string;
}

export const NAV_ITEMS: NavItem[] = [
  { id: "home", label: "Dashboard", short: "Home", icon: LayoutDashboard, group: "main", description: "Mission control overview" },
  { id: "diagnose", label: "Diagnose Vehicle", short: "Diagnose", icon: Stethoscope, group: "main", description: "AI-powered multi-modal diagnosis" },
  { id: "workshop", label: "3D Virtual Workshop", short: "Workshop", icon: Boxes, group: "main", description: "Interactive 3D engine bay" },
  { id: "meca-ai", label: "MecaAI Assistant", short: "MecaAI", icon: Bot, group: "main", description: "Your AI mechanic mentor" },

  { id: "engines", label: "Engine Library", short: "Engines", icon: Cpu, group: "library", description: "Interactive 3D engine models" },
  { id: "vehicles", label: "Vehicle Library", short: "Vehicles", icon: Car, group: "library", description: "Your registered vehicles" },
  { id: "tools", label: "Tool Collection", short: "Tools", icon: Wrench, group: "library", description: "Interactive tool catalog" },

  { id: "courses", label: "Training Courses", short: "Courses", icon: GraduationCap, group: "learning", description: "Structured learning paths" },
  { id: "training", label: "Virtual Training", short: "Training", icon: ClipboardList, group: "learning", description: "Simulated fault challenges" },
  { id: "history", label: "Maintenance History", short: "History", icon: History, group: "learning", description: "Digital service records" },

  { id: "profile", label: "User Profile", short: "Profile", icon: User, group: "account", description: "Your mechanic identity" },
  { id: "settings", label: "Settings", short: "Settings", icon: Settings, group: "account", description: "Preferences & theme" },
];

export const GROUP_LABELS: Record<NavItem["group"], string> = {
  main: "Operations",
  library: "Library",
  learning: "Learning",
  account: "Account",
};

// Items shown in the mobile bottom bar (compact, most-used).
export const MOBILE_PRIMARY: ViewId[] = ["home", "diagnose", "meca-ai", "workshop"];
