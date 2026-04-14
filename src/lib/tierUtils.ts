export type TierName =
  | "Rookie"
  | "Contender"
  | "Athlete"
  | "Champion"
  | "Elite"
  | "Legend"
  | "Icon"
  | "Titan";

const XP_THRESHOLDS: [TierName, number][] = [
  ["Rookie",    0],
  ["Contender", 500],
  ["Athlete",   1200],
  ["Champion",  2500],
  ["Elite",     4500],
  ["Legend",    7500],
  ["Icon",      12000],
  ["Titan",     25000],
];

export function getTierFromXp(xp: number): TierName {
  let result: TierName = "Rookie";
  for (const [name, min] of XP_THRESHOLDS) {
    if (xp >= min) result = name;
    else break;
  }
  return result;
}

export interface TierFrameConfig {
  color: string;
  colorAlt: string;
  ringBg?: string;       // gradient string for static tiers (used in inline style)
  ringClass?: string;    // CSS class for animated tiers (defined in globals.css)
  glowClass?: string;    // CSS class for pulsing glow (animated tiers only)
  staticGlow: string;    // box-shadow for static glow (static tiers) or base glow
  innerShadow: string;   // inset box-shadow for depth
  badgeBg: string;
  badgeBorder: string;
  badgeGlow?: string;
  badgeShape: "circle" | "roundedSquare" | "hexagon";
  ornamentColor: string;
  ornamentGlow: string;
  ornamentShape: "dot" | "diamond" | "star";
  ornamentPositions: "compass4" | "clock6" | "clock8" | "none";
  topAccent: "none" | "crown" | "swords" | "flame" | "trident";
  icon: string;
}

export const TIER_FRAME_CONFIG: Record<TierName, TierFrameConfig> = {
  Rookie: {
    color: "#b45309",
    colorAlt: "#92400e",
    ringBg: "linear-gradient(135deg, #78350f 0%, #b45309 40%, #92400e 70%, #78350f 100%)",
    staticGlow: "0 0 10px #b4530933, 0 0 4px #b4530922",
    innerShadow: "inset 0 0 6px #b4530922",
    badgeBg: "#1c0a00",
    badgeBorder: "#b45309",
    badgeShape: "circle",
    ornamentColor: "#b45309",
    ornamentGlow: "#b45309",
    ornamentShape: "dot",
    ornamentPositions: "none",
    topAccent: "none",
    icon: "🥉",
  },
  Contender: {
    color: "#9ca3af",
    colorAlt: "#d1d5db",
    ringBg: "linear-gradient(135deg, #6b7280 0%, #e5e7eb 35%, #9ca3af 65%, #6b7280 100%)",
    staticGlow: "0 0 14px #9ca3af44, 0 0 28px #9ca3af22",
    innerShadow: "inset 0 0 8px #d1d5db22",
    badgeBg: "#111111",
    badgeBorder: "#9ca3af",
    badgeShape: "circle",
    ornamentColor: "#d1d5db",
    ornamentGlow: "#d1d5db",
    ornamentShape: "dot",
    ornamentPositions: "compass4",
    topAccent: "none",
    icon: "🥈",
  },
  Athlete: {
    color: "#ca8a04",
    colorAlt: "#fbbf24",
    ringBg: "linear-gradient(135deg, #92400e 0%, #f59e0b 30%, #fde68a 50%, #f59e0b 70%, #92400e 100%)",
    staticGlow: "0 0 18px #ca8a0455, 0 0 36px #ca8a0422",
    innerShadow: "inset 0 0 10px #ca8a0433",
    badgeBg: "#1a0f00",
    badgeBorder: "#ca8a04",
    badgeGlow: "0 0 8px #ca8a0466",
    badgeShape: "roundedSquare",
    ornamentColor: "#fbbf24",
    ornamentGlow: "#f59e0b",
    ornamentShape: "diamond",
    ornamentPositions: "compass4",
    topAccent: "none",
    icon: "🏅",
  },
  Champion: {
    color: "#f59e0b",
    colorAlt: "#fde68a",
    ringBg: "linear-gradient(135deg, #d97706 0%, #fbbf24 25%, #fde68a 45%, #fbbf24 65%, #f59e0b 80%, #d97706 100%)",
    staticGlow: "0 0 24px #f59e0b77, 0 0 48px #f59e0b33, 0 0 8px #fbbf2466",
    innerShadow: "inset 0 0 12px #f59e0b44, inset 0 0 4px #fde68a55",
    badgeBg: "#1a1000",
    badgeBorder: "#f59e0b",
    badgeGlow: "0 0 14px #f59e0b88",
    badgeShape: "hexagon",
    ornamentColor: "#fde68a",
    ornamentGlow: "#f59e0b",
    ornamentShape: "diamond",
    ornamentPositions: "compass4",
    topAccent: "none",
    icon: "🥇",
  },
  Elite: {
    color: "#ef4444",
    colorAlt: "#f97316",
    ringClass: "tier-ring-elite",
    glowClass: "tier-glow-elite",
    staticGlow: "0 0 32px #ef4444aa, 0 0 64px #f9731644",
    innerShadow: "inset 0 0 14px #ef444455",
    badgeBg: "#1a0000",
    badgeBorder: "#ef4444",
    badgeGlow: "0 0 18px #ef444499",
    badgeShape: "hexagon",
    ornamentColor: "#f97316",
    ornamentGlow: "#ef4444",
    ornamentShape: "dot",
    ornamentPositions: "clock6",
    topAccent: "flame",
    icon: "🔥",
  },
  Legend: {
    color: "#8b5cf6",
    colorAlt: "#3b82f6",
    ringClass: "tier-ring-legend",
    glowClass: "tier-glow-legend",
    staticGlow: "0 0 40px #8b5cf6cc, 0 0 80px #3b82f644, 0 0 10px #a78bfa55",
    innerShadow: "inset 0 0 16px #8b5cf677",
    badgeBg: "#0d0020",
    badgeBorder: "#8b5cf6",
    badgeGlow: "0 0 20px #8b5cf6aa",
    badgeShape: "hexagon",
    ornamentColor: "#c4b5fd",
    ornamentGlow: "#8b5cf6",
    ornamentShape: "star",
    ornamentPositions: "clock6",
    topAccent: "swords",
    icon: "⚔️",
  },
  Icon: {
    color: "#f59e0b",
    colorAlt: "#ffffff",
    ringClass: "tier-ring-icon",
    glowClass: "tier-glow-icon",
    staticGlow: "0 0 20px #f59e0bcc, 0 0 60px #f59e0b55, 0 0 100px #ffffff22, 0 0 8px #fde68aaa",
    innerShadow: "inset 0 0 20px #f59e0b66, inset 0 0 8px #ffffff44",
    badgeBg: "#100800",
    badgeBorder: "#f59e0b",
    badgeGlow: "0 0 24px #f59e0bcc, 0 0 8px #fde68a",
    badgeShape: "hexagon",
    ornamentColor: "#fde68a",
    ornamentGlow: "#f59e0b",
    ornamentShape: "star",
    ornamentPositions: "clock8",
    topAccent: "crown",
    icon: "👑",
  },
  Titan: {
    color: "#fde68a",
    colorAlt: "#fbbf24",
    ringClass: "tier-ring-titan",
    glowClass: "tier-glow-titan",
    staticGlow: "0 0 40px #fbbf24cc, 0 0 80px #f59e0b66, 0 0 120px #fde68a33, 0 0 10px #ffffffaa",
    innerShadow: "inset 0 0 20px #f59e0b55, inset 0 0 8px #fde68a44",
    badgeBg: "#0c0800",
    badgeBorder: "#fde68a",
    badgeGlow: "0 0 20px #fbbf24ee, 0 0 40px #f59e0b88, 0 0 8px #fde68a",
    badgeShape: "hexagon",
    ornamentColor: "#fde68a",
    ornamentGlow: "#fbbf24",
    ornamentShape: "star",
    ornamentPositions: "clock8",
    topAccent: "crown",
    icon: "👑",
  },
};

export function getTierConfig(tier: string): TierFrameConfig {
  return TIER_FRAME_CONFIG[tier as TierName] ?? TIER_FRAME_CONFIG.Rookie;
}
