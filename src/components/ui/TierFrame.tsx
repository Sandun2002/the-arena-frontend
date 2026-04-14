"use client";

import { User as UserIcon } from "lucide-react";
import { getTierConfig, TierName } from "@/lib/tierUtils";

export type FrameSize = "sm" | "md" | "lg" | "xl";

interface TierFrameProps {
  tier?: string;
  level?: number;
  src?: string | null;
  size?: FrameSize;
  className?: string;
  alt?: string;
  hideBadge?: boolean;
  placeholder?: React.ReactNode;
}

// ─── Size table ───────────────────────────────────────────────────────────────
// total  = outer wrapper (px)
// avatar = inner image area (px)
// ring   = colored ring thickness (px) — padding of the ring div
// sep    = black separator between ring and avatar (px)
const SIZES = {
  sm:  { total: 36,  avatar: 26,  ring: 3, sep: 1, badge: 0,  dotSize: 0, showBadge: false, showOrn: false },
  md:  { total: 52,  avatar: 38,  ring: 5, sep: 2, badge: 18, dotSize: 0, showBadge: true,  showOrn: false },
  lg:  { total: 130, avatar: 110, ring: 8, sep: 2, badge: 28, dotSize: 7, showBadge: true,  showOrn: true  },
  xl:  { total: 162, avatar: 138, ring: 9, sep: 3, badge: 34, dotSize: 9, showBadge: true,  showOrn: true  },
} as const;

// ─── Ornament dot positions (% from top-left of container) ───────────────────
const COMPASS_4 = [
  { top: 3.5,  left: 50   },
  { top: 50,   left: 96.5 },
  { top: 96.5, left: 50   },
  { top: 50,   left: 3.5  },
];
const CLOCK_6 = [
  { top: 3.5,   left: 50   },
  { top: 26.75, left: 90.3 },
  { top: 73.25, left: 90.3 },
  { top: 96.5,  left: 50   },
  { top: 73.25, left: 9.7  },
  { top: 26.75, left: 9.7  },
];
const CLOCK_8 = [
  { top: 3.5,  left: 50   },
  { top: 17.1, left: 82.9 },
  { top: 50,   left: 96.5 },
  { top: 82.9, left: 82.9 },
  { top: 96.5, left: 50   },
  { top: 82.9, left: 17.1 },
  { top: 50,   left: 3.5  },
  { top: 17.1, left: 17.1 },
];

function getOrnamentPositions(key: string) {
  if (key === "compass4") return COMPASS_4;
  if (key === "clock6")   return CLOCK_6;
  if (key === "clock8")   return CLOCK_8;
  return [];
}

// ─── Badge clip-paths ─────────────────────────────────────────────────────────
function badgeStyle(shape: string, bg: string, border: string, glow?: string) {
  const base: React.CSSProperties = {
    background: bg,
    border: `1.5px solid ${border}`,
    boxShadow: glow ?? "none",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  };
  if (shape === "hexagon") {
    return { ...base, clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)", borderRadius: 0, border: "none" };
  }
  if (shape === "roundedSquare") {
    return { ...base, borderRadius: "28%", transform: "rotate(0deg)" };
  }
  return { ...base, borderRadius: "9999px" }; // circle
}

// ─── Top accent SVGs ──────────────────────────────────────────────────────────
function TopAccent({ type, color, size }: { type: string; color: string; size: number }) {
  const s = Math.round(size * 0.18);
  if (type === "crown") return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill={color} style={{ filter: `drop-shadow(0 0 4px ${color})` }}>
      <path d="M2 19h20l-3-10-4 6-3-8-3 8-4-6-3 10z" />
    </svg>
  );
  if (type === "swords") return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" style={{ filter: `drop-shadow(0 0 3px ${color})` }}>
      <path d="M14.5 9.5L3 21M20 4L9 15M14.5 9.5L20 4L21 8L14.5 9.5zM14.5 9.5L10 14"/>
    </svg>
  );
  if (type === "flame") return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill={color} style={{ filter: `drop-shadow(0 0 4px ${color})` }}>
      <path d="M12 2C8 8 8 12 12 14c-2-1-3-3-2-5 0 0 1 3 3 4 0-3 2-5 2-8 1 2 1 6-1 8 4-2 5-7 3-11z" />
    </svg>
  );
  if (type === "trident") return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ filter: `drop-shadow(0 0 5px ${color}) drop-shadow(0 0 10px #dc262688)` }}>
      {/* Center prong */}
      <line x1="12" y1="2" x2="12" y2="18" />
      {/* Left prong */}
      <path d="M12 6 L7 2 L7 8" />
      {/* Right prong */}
      <path d="M12 6 L17 2 L17 8" />
      {/* Handle base */}
      <line x1="12" y1="18" x2="12" y2="22" />
      <line x1="10" y1="22" x2="14" y2="22" />
    </svg>
  );
  return null;
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function TierFrame({
  tier = "Rookie",
  level = 1,
  src,
  size = "lg",
  className = "",
  alt = "Avatar",
  hideBadge = false,
  placeholder,
}: TierFrameProps) {
  const s = SIZES[size];
  const cfg = getTierConfig(tier);
  const isAnimated = !!cfg.ringClass;
  const orn = getOrnamentPositions(cfg.ornamentPositions);

  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 ${className}`}
      style={{ width: s.total, height: s.total }}
    >
      {/* ── Ambient glow (static for static tiers, pulsing for animated) ── */}
      <div
        className={`absolute inset-0 rounded-full pointer-events-none ${cfg.glowClass ?? ""}`}
        style={!isAnimated ? { boxShadow: cfg.staticGlow } : undefined}
      />

      {/* ── Ring wrapper (carries the tier color / animated gradient) ── */}
      <div
        className={`absolute inset-0 rounded-full ${cfg.ringClass ?? ""}`}
        style={!isAnimated ? { background: cfg.ringBg } : undefined}
      />

      {/* ── Black separator + avatar ── */}
      <div
        className="relative rounded-full bg-black flex items-center justify-center"
        style={{ width: s.total - s.ring * 2, height: s.total - s.ring * 2 }}
      >
        <div
          className="rounded-full overflow-hidden bg-zinc-900 flex items-center justify-center"
          style={{
            width: s.avatar,
            height: s.avatar,
            boxShadow: cfg.innerShadow,
          }}
        >
          {src ? (
            <img src={src} alt={alt} className="w-full h-full object-cover" draggable={false} />
          ) : placeholder ? (
            <>{placeholder}</>
          ) : (
            <UserIcon
              style={{ width: s.avatar * 0.45, height: s.avatar * 0.45, color: "#71717a" }}
            />
          )}
        </div>
      </div>

      {/* ── Ornament dots (skip bottom-center when badge visible to avoid overlap) ── */}
      {s.showOrn && orn.map((pos, i) => {
        if (!hideBadge && s.showBadge && pos.top > 90 && pos.left > 40 && pos.left < 60) return null;
        const isDiamond = cfg.ornamentShape === "diamond";
        const isStar    = cfg.ornamentShape === "star";
        const ds = s.dotSize;
        return (
          <div
            key={i}
            className="absolute pointer-events-none"
            style={{
              top: `${pos.top}%`,
              left: `${pos.left}%`,
              width: ds,
              height: ds,
              transform: `translate(-50%, -50%) ${isDiamond ? "rotate(45deg)" : ""}`,
              background: cfg.ornamentColor,
              borderRadius: isStar ? "2px" : isDiamond ? "2px" : "9999px",
              boxShadow: `0 0 ${ds + 2}px ${cfg.ornamentGlow}, 0 0 ${ds * 2}px ${cfg.ornamentGlow}66`,
              clipPath: isStar
                ? "polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)"
                : undefined,
            }}
          />
        );
      })}

      {/* ── Top accent (crown / swords / flame) ── */}
      {s.showOrn && cfg.topAccent !== "none" && (
        <div
          className="absolute pointer-events-none"
          style={{
            top: 0,
            left: "50%",
            transform: "translate(-50%, -20%)",
            zIndex: 10,
          }}
        >
          <TopAccent type={cfg.topAccent} color={cfg.colorAlt} size={s.total} />
        </div>
      )}

      {/* ── Level badge — centered at bottom, embedded in ring ── */}
      {!hideBadge && s.showBadge && (
        <div
          className="absolute z-20"
          style={{
            bottom: 0,
            left: "50%",
            transform: "translate(-50%, 40%)",
            width: s.badge,
            height: s.badge,
            ...badgeStyle(cfg.badgeShape, cfg.badgeBg, cfg.badgeBorder, cfg.badgeGlow),
          }}
        >
          {/* Black bg wrap so parent ring doesn't bleed through hexagon clip */}
          <span
            className="font-black text-white leading-none"
            style={{
              fontSize: s.badge * 0.42,
              color: cfg.color,
              textShadow: `0 0 8px ${cfg.color}`,
            }}
          >
            {level}
          </span>
        </div>
      )}
    </div>
  );
}
