"use client";

import React, { createContext, useContext } from "react";

type RootProps = {
  children: React.ReactNode;
  defaults?: Record<string, unknown>;
  debug?: Record<string, unknown>;
  start?: string | number;
  end?: string | number;
  scrub?: boolean | number;
  [key: string]: unknown;
};

type PinProps = {
  children: React.ReactNode;
  childHeight?: string | number;
  pinSpacerHeight?: string | number;
  pinSpacerClassName?: string;
  [key: string]: unknown;
};

type AnimationProps = {
  children: React.ReactNode;
  tween?: unknown;
  [key: string]: unknown;
};

type StaggerProps = {
  children?: React.ReactNode;
  tween?: unknown;
  overlap?: number;
  [key: string]: unknown;
};

type WaypointProps = {
  at?: number;
  onCall?: () => void;
  onReverseCall?: () => void;
  tween?: unknown;
  [key: string]: unknown;
};

// Scrollytelling context for useScrollytelling hook
const ScrollytellingContext = createContext<{
  timeline: { scrollTrigger?: { progress: number } } | null;
}>({ timeline: null });

export const useScrollytelling = () => {
  return useContext(ScrollytellingContext);
};

export const Root = ({ children }: RootProps) => (
  <ScrollytellingContext.Provider value={{ timeline: { scrollTrigger: { progress: 0 } } }}>
    {children}
  </ScrollytellingContext.Provider>
);

export const Pin = ({ children, pinSpacerClassName }: PinProps) => (
  <div className={pinSpacerClassName}>{children}</div>
);

export const Animation = ({ children }: AnimationProps) => <>{children}</>;

export const Stagger = ({ children }: StaggerProps) => <>{children}</>;

export const Waypoint = (_props: WaypointProps) => null;

const scrollytellingExports = {
  Root,
  Pin,
  Animation,
  Stagger,
  Waypoint,
};

export default scrollytellingExports;
