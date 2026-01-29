"use client";

// Re-export everything from the actual scrollytelling package which is built locally
import * as _ScrollytellingModule from "@bsmnt/scrollytelling";

// Use `any`-typed wrappers to avoid TypeScript declaration emission issues in downstream builds
const Scrollytelling: any = _ScrollytellingModule;

export default Scrollytelling;

export const Root: any = Scrollytelling.Root;
export const Animation: any = Scrollytelling.Animation;
export const Parallax: any = Scrollytelling.Parallax;
export const Pin: any = Scrollytelling.Pin;
export const RegisterGsapPlugins: any = Scrollytelling.RegisterGsapPlugins;
export const Waypoint: any = Scrollytelling.Waypoint;
export const Stagger: any = Scrollytelling.Stagger;
export const ImageSequenceCanvas: any = Scrollytelling.ImageSequenceCanvas;
export const useScrollytelling: any = Scrollytelling.useScrollytelling;
export const useScrollToLabel: any = Scrollytelling.useScrollToLabel;
