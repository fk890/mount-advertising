declare module 'gsap' {
  export interface ScrollTrigger {
    kill(reset?: boolean): void;
  }

  namespace gsap {
    function registerPlugin(...args: any[]): void;
    function to(targets: any, vars: any): any;
    function from(targets: any, vars: any): any;
    function fromTo(targets: any, fromVars: any, toVars: any): any;
    function timeline(vars?: any): any;
    function set(targets: any, vars: any): any;
    function delayedCall(delay: number, callback: Function, params?: any[], scope?: any): any;
    function matchMedia(matchMedia: object): any;
    
    function getProperty(target: any, property: string): any;
    function quickSetter(target: any, property: string, unit?: string): (value: any) => void;
    function quickTo(target: any, property: string, vars?: any): (value: any) => void;
    
    const utils: {
      selector(selector: any): any;
      toArray(targets: any): any[];
      wrap(value: number, min: number, max: number): number;
      normalize(value: number, min: number, max: number): number;
      interpolate(startValue: any, endValue: any, progress: number): any;
      clamp(value: number, min: number, max: number): number;
      mapRange(inMin: number, inMax: number, outMin: number, outMax: number, value: number): number;
      pipe(...functions: Function[]): Function;
      unitize(fn: Function, unit: string): Function;
      snap(snapTo: any, value: number): number;
      distribute(config: object): Function;
      random(min: number, max: number, roundingIncrement?: number): number;
      splitColor(color: string, hsl?: boolean): number[];
      parseColor(color: string, outRGB?: boolean): string | number[];
      getUnit(value: string): string;
      wrapYoyo(index: number, min: number, max: number): number;
      shuffle(array: any[]): any[];
      selector(selector: any): any;
    };

    const core: {
      globals: any;
      Timeline: any;
      Tween: any;
      version: string;
      ticker: any;
    };
  }

  export default gsap;
}

declare module 'gsap/ScrollTrigger' {
  const ScrollTrigger: {
    create(vars: any): any;
    refresh(hard?: boolean): void;
    update(reset?: boolean): void;
    clearMatchMedia(): void;
    getAll(): any[];
    kill(reset?: boolean): void;
    defaults(obj: any): void;
    saveStyles(elements: any): void;
    revert(revert?: boolean, kill?: boolean): void;
    config(config: any): void;
    getInstance(element: Element): any;
    getMaxScrollTop(element: Element): number;
    scrollerProxy(element: Element, vars?: object): void;
    enable(enable?: boolean, refresh?: boolean): void;
    isTouch: number;
    getVelocity(scrollerOrElement: any): number;
    sort(func?: Function): void;
    observe(vars?: object): any;
    normalizeScroll(enable?: boolean | object): void;
    disable(reset?: boolean): void;
  };
  export { ScrollTrigger };
}

declare module '@gsap/react' {
  import React from 'react';
  
  interface UseGSAPConfig {
    scope?: React.RefObject<Element>;
    revertOnUpdate?: boolean;
    dependencies?: any[];
    persist?: boolean;
    immediateRender?: boolean;
    preventOverwrite?: boolean;
    paused?: boolean;
    yoyo?: boolean;
    repeat?: number;
    repeatDelay?: number;
    delay?: number;
    [key: string]: any;
  }
  
  export function useGSAP(callback: () => void, config?: UseGSAPConfig): void;
  export function useGSAP(callback: () => void, dependencies?: any[], config?: UseGSAPConfig): void;
  export function useSplitText(target: object | string, config?: object): any;
  export function useInertia(values: object, config?: object): any;
  export function useDraggable(target: object | string, vars?: object): any;
  export function useScrollTrigger(vars: object): any;
  export function useTimeline(vars?: object): any;
}
