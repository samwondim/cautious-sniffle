"use client";

import { MotionConfig } from "motion/react";
import type { ReactNode } from "react";

/**
 * Honours the operating system's "Reduced Motion" setting for every motion
 * component on the public site: transform and layout animations are dropped,
 * opacity animations are kept, so a reveal becomes a plain fade.
 *
 * `MotionConfig` is a client component, hence this wrapper — the site layout
 * and the sections it wraps stay server components, and their markup passes
 * through as children.
 */
export function MotionProvider({ children }: { children: ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
