import React from "react";

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

export const Root = ({ children }: RootProps) => <>{children}</>;

export const Pin = ({ children, pinSpacerClassName }: PinProps) => (
  <div className={pinSpacerClassName}>{children}</div>
);

export const Animation = ({ children }: AnimationProps) => <>{children}</>;

export const Stagger = ({ children }: StaggerProps) => <>{children}</>;

export const Waypoint = (_props: WaypointProps) => null;

export default {
  Root,
  Pin,
  Animation,
  Stagger,
  Waypoint,
};
