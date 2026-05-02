"use client";

import { useEffect, useRef, ElementType } from "react";
import { Player } from "@lordicon/react";

export type LordIconTrigger = "hover" | "click" | "loop" | "morph" | "boomerang" | "in";

export interface LordIconProps {
  /** The imported Lottie JSON data, or undefined if not available yet */
  icon?: object | null;
  /** Fallback Phosphor icon component to show if JSON is missing */
  fallback?: ElementType;
  /** Size in pixels (applies to both width and height) */
  size?: number;
  /** The animation trigger behavior */
  trigger?: LordIconTrigger;
  /** Custom colors mapping. Example: "primary:#121331,secondary:#08a88a" */
  colors?: string;
  /** Optional CSS class name */
  className?: string;
  /** Whether the icon should play once on mount */
  playOnMount?: boolean;
}

export default function LordIcon({
  icon,
  size = 24,
  trigger = "hover",
  colors,
  className,
  playOnMount = false,
  fallback: FallbackIcon,
}: LordIconProps) {
  const playerRef = useRef<Player>(null);

  useEffect(() => {
    if (playOnMount && icon) {
      playerRef.current?.playFromBeginning();
    }
  }, [playOnMount, icon]);

  return (
    <div className={`inline-flex items-center justify-center ${className || ""}`} style={{ width: size, height: size }}>
      {icon ? (
        <Player
          ref={playerRef}
          icon={icon}
          size={size}
          state={trigger === "morph" ? "morph-state" : undefined}
          onComplete={() => {
            if (trigger === "loop") {
              playerRef.current?.playFromBeginning();
            }
          }}
        />
      ) : FallbackIcon ? (
        <FallbackIcon size={size} weight="duotone" />
      ) : null}
    </div>
  );
}
