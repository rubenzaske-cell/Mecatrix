"use client";

import * as React from "react";
import { useNav } from "@/lib/mecatrix/nav-store";
import { HomeView } from "./views/home";
import { MecaAIView } from "./views/meca-ai";
import { DiagnoseView } from "./views/diagnose";
import { WorkshopView } from "./views/workshop";
import { EnginesView } from "./views/engines";
import { VehiclesView } from "./views/vehicles";
import { ToolsView } from "./views/tools";
import { CoursesView } from "./views/courses";
import { TrainingView } from "./views/training";
import { HistoryView } from "./views/history";
import { ProfileView } from "./views/profile";
import { SettingsView } from "./views/settings";

export function ViewRouter() {
  const { view } = useNav();

  switch (view) {
    case "home": return <HomeView />;
    case "meca-ai": return <MecaAIView />;
    case "diagnose": return <DiagnoseView />;
    case "workshop": return <WorkshopView />;
    case "engines": return <EnginesView />;
    case "vehicles": return <VehiclesView />;
    case "tools": return <ToolsView />;
    case "courses": return <CoursesView />;
    case "training": return <TrainingView />;
    case "history": return <HistoryView />;
    case "profile": return <ProfileView />;
    case "settings": return <SettingsView />;
    default: return <HomeView />;
  }
}
