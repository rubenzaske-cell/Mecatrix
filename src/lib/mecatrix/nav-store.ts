"use client";

import { create } from "zustand";

export type ViewId =
  | "home"
  | "meca-ai"
  | "diagnose"
  | "workshop"
  | "engines"
  | "vehicles"
  | "tools"
  | "courses"
  | "training"
  | "history"
  | "profile"
  | "settings";

interface NavState {
  view: ViewId;
  /** Optional payload, e.g. an engine id to open in the workshop. */
  params: Record<string, string>;
  setView: (view: ViewId, params?: Record<string, string>) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export const useNav = create<NavState>((set) => ({
  view: "home",
  params: {},
  setView: (view, params = {}) => set({ view, params, sidebarOpen: false }),
  sidebarOpen: false,
  setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
}));
