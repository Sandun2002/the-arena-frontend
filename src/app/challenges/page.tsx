"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { ArrowLeft, Trophy, Zap, CheckCircle, Clock, Infinity as InfinityIcon } from "lucide-react";
import { useAuth } from "@/services/authContext";
import { playerService } from "@/services/playerService";
import { Challenge, UserAchievement } from "@/types";
import { gsap } from "gsap";
import { useRequireAuth, AuthLoadingSpinner } from "@/components/auth/RequireAuth";

// ─────────────────────────────────────────────────────────────────────────────
// Category Configuration
// ─────────────────────────────────────────────────────────────────────────────
type Category = "all" | "weekly" | "explorer" | "loyalty" | "streak" | "timing" | "milestone";

const CATEGORIES: { key: Category; label: string; icon: string; accentColor: string; gradientFrom: string; gradientTo: string; borderColor: string; glowColor: string; tabBg: string; barFrom: string; barTo: string }[] = [
    { key: "all",       label: "All",               icon: "✨", accentColor: "text-white",       gradientFrom: "#0a0a0f", gradientTo: "#111118",   borderColor: "rgba(255,255,255,0.1)",  glowColor: "rgba(255,255,255,0.1)", tabBg: "#374151", barFrom: "#10b981", barTo: "#06b6d4" },
    { key: "weekly",    label: "Weekly Grind",       icon: "🔥", accentColor: "text-blue-400",    gradientFrom: "#030720", gradientTo: "#0a1a4a",   borderColor: "rgba(59,130,246,0.35)",  glowColor: "rgba(59,130,246,0.3)", tabBg: "#2563eb", barFrom: "#3b82f6", barTo: "#06b6d4" },
    { key: "explorer",  label: "Explorer",           icon: "🌍", accentColor: "text-purple-400",  gradientFrom: "#0d0520", gradientTo: "#1a0a40",   borderColor: "rgba(168,85,247,0.35)",  glowColor: "rgba(168,85,247,0.3)", tabBg: "#7c3aed", barFrom: "#a855f7", barTo: "#818cf8" },
    { key: "loyalty",   label: "Loyalty",            icon: "❤️", accentColor: "text-rose-400",   gradientFrom: "#200510", gradientTo: "#3d0a1a",   borderColor: "rgba(244,63,94,0.35)",   glowColor: "rgba(244,63,94,0.3)",  tabBg: "#e11d48", barFrom: "#f43f5e", barTo: "#fb7185" },
    { key: "streak",    label: "Streak",             icon: "⚡", accentColor: "text-orange-400", gradientFrom: "#1a0a00", gradientTo: "#3d1a00",   borderColor: "rgba(249,115,22,0.35)",  glowColor: "rgba(249,115,22,0.3)", tabBg: "#ea580c", barFrom: "#f97316", barTo: "#fbbf24" },
    { key: "timing",    label: "Timing",             icon: "⏰", accentColor: "text-teal-400",   gradientFrom: "#001a18", gradientTo: "#003830",   borderColor: "rgba(20,184,166,0.35)",  glowColor: "rgba(20,184,166,0.3)", tabBg: "#0f766e", barFrom: "#14b8a6", barTo: "#34d399" },
    { key: "milestone", label: "Milestones",         icon: "🏆", accentColor: "text-amber-400",  gradientFrom: "#1a1000", gradientTo: "#3d2800",   borderColor: "rgba(245,158,11,0.35)",  glowColor: "rgba(245,158,11,0.3)", tabBg: "#d97706", barFrom: "#f59e0b", barTo: "#fde68a" },
];

// ─────────────────────────────────────────────────────────────────────────────
// Rarity Configuration
// ─────────────────────────────────────────────────────────────────────────────
const RARITY = [
    { key: "mythic",    minXp: 350, label: "MYTHIC",    border: "rgba(239,68,68,0.6)",   glow: "rgba(239,68,68,0.35)",   bar: ["#ef4444","#f97316"], text: "#f87171" },
    { key: "legendary", minXp: 200, label: "LEGENDARY", border: "rgba(245,158,11,0.65)", glow: "rgba(245,158,11,0.4)",   bar: ["#f59e0b","#fde68a"], text: "#fbbf24" },
    { key: "epic",      minXp: 125, label: "EPIC",      border: "rgba(168,85,247,0.55)", glow: "rgba(168,85,247,0.35)",  bar: ["#a855f7","#c084fc"], text: "#c084fc" },
    { key: "rare",      minXp: 75,  label: "RARE",      border: "rgba(99,102,241,0.5)",  glow: "rgba(99,102,241,0.3)",   bar: ["#6366f1","#818cf8"], text: "#818cf8" },
    { key: "common",    minXp: 0,   label: "COMMON",    border: "rgba(148,163,184,0.3)", glow: "rgba(148,163,184,0.15)", bar: ["#64748b","#94a3b8"], text: "#94a3b8" },
];

function getRarity(xp: number) {
    return RARITY.find(r => xp >= r.minXp) || RARITY[RARITY.length - 1];
}

// ─────────────────────────────────────────────────────────────────────────────
// Tier display config
// ─────────────────────────────────────────────────────────────────────────────
const TIER_STYLES: Record<string, { glow: string; gradient: string; icon: string }> = {
    Rookie:    { glow: "rgba(113,113,122,0.5)",  gradient: "linear-gradient(135deg,#71717a,#52525b)",  icon: "🥉" },
    Contender: { glow: "rgba(59,130,246,0.5)",   gradient: "linear-gradient(135deg,#3b82f6,#1d4ed8)",  icon: "🥈" },
    Athlete:   { glow: "rgba(16,185,129,0.5)",   gradient: "linear-gradient(135deg,#10b981,#059669)",  icon: "🏅" },
    Champion:  { glow: "rgba(234,179,8,0.5)",    gradient: "linear-gradient(135deg,#eab308,#ca8a04)",  icon: "🥇" },
    Elite:     { glow: "rgba(249,115,22,0.55)",  gradient: "linear-gradient(135deg,#f97316,#ea580c)",  icon: "🔥" },
    Legend:    { glow: "rgba(239,68,68,0.55)",   gradient: "linear-gradient(135deg,#ef4444,#dc2626)",  icon: "⚔️" },
    Icon:      { glow: "rgba(168,85,247,0.6)",   gradient: "linear-gradient(135deg,#a855f7,#7c3aed)",  icon: "👑" },
};

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────
function getDaysUntilMonday(): number {
    const day = new Date().getDay();
    return day === 1 ? 7 : (8 - day) % 7;
}

function getNudgeText(current: number, target: number): string | null {
    const remaining = target - current;
    const pct = current / target;
    if (pct >= 0.8 && remaining > 0) return `🔥 Just ${remaining} more!`;
    if (pct >= 0.5 && remaining > 0) return `⚡ ${remaining} to go!`;
    return null;
}

// ─────────────────────────────────────────────────────────────────────────────
// ChallengeCard
// ─────────────────────────────────────────────────────────────────────────────
function ChallengeCard({ challenge, achievement, catConfig, animated }: {
    challenge: Challenge;
    achievement: UserAchievement | undefined;
    catConfig: typeof CATEGORIES[0];
    animated: boolean;
}) {
    const progress = achievement ? Math.min(100, Math.round((achievement.progress / challenge.target_count) * 100)) : 0;
    const current = achievement?.progress || 0;
    const completed = achievement?.is_completed ?? false;
    const rarity = getRarity(challenge.xp_reward);
    const nudge = !completed ? getNudgeText(current, challenge.target_count) : null;
    const daysLeft = getDaysUntilMonday();
    const isWeekly = challenge.category === "weekly";
    const isPermanent = challenge.is_permanent;
    const isLegendaryPlus = rarity.key === "legendary" || rarity.key === "mythic";

    return (
        <div
            className="challenge-card group relative overflow-hidden rounded-2xl transition-transform duration-300 hover:-translate-y-1 hover:scale-[1.02] cursor-default select-none"
            style={{
                background: `linear-gradient(145deg, ${catConfig.gradientFrom}, ${catConfig.gradientTo})`,
                border: `1.5px solid ${completed ? rarity.border : catConfig.borderColor}`,
                boxShadow: completed
                    ? `0 0 20px ${rarity.glow}, 0 4px 24px rgba(0,0,0,0.5)`
                    : isLegendaryPlus
                        ? `0 0 16px ${rarity.glow}, 0 4px 20px rgba(0,0,0,0.4)`
                        : `0 4px 20px rgba(0,0,0,0.4)`,
            }}
        >
            {/* Shimmer sweep */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                style={{ background: "linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.04) 50%, transparent 70%)", backgroundSize: "200% 100%", animation: "shimmerSweep 1.5s ease-in-out" }} />

            {/* Legendary pulse ring */}
            {isLegendaryPlus && !completed && (
                <div className="absolute inset-0 rounded-2xl pointer-events-none animate-pulse"
                    style={{ boxShadow: `inset 0 0 0 1px ${rarity.border}`, opacity: 0.5 }} />
            )}

            {/* OBTAINED stamp */}
            {completed && (
                <div className="absolute top-4 right-4 z-20 pointer-events-none">
                    <div className="px-2.5 py-0.5 rounded text-[10px] font-black tracking-[0.15em] border-2 rotate-12 opacity-90"
                        style={{ background: "transparent", borderColor: rarity.text, color: rarity.text }}>
                        OBTAINED
                    </div>
                </div>
            )}

            {/* Permanent badge */}
            {isPermanent && (
                <div className="absolute top-3 left-3 z-20">
                    <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-black tracking-widest"
                        style={{ background: "rgba(245,158,11,0.15)", border: "1px solid rgba(245,158,11,0.4)", color: "#fbbf24" }}>
                        <InfinityIcon className="w-2.5 h-2.5" />
                        <span>PERMANENT</span>
                    </div>
                </div>
            )}

            <div className="p-5">
                {/* Top row: category chip + rarity + XP */}
                <div className="flex items-center justify-between mb-4">
                    <span className="text-[10px] font-black tracking-widest uppercase px-2 py-0.5 rounded-full"
                        style={{ background: `${catConfig.tabBg}22`, color: catConfig.tabBg, border: `1px solid ${catConfig.tabBg}55` }}>
                        {catConfig.icon} {catConfig.label}
                    </span>
                    <span className="text-[10px] font-black tracking-widest" style={{ color: rarity.text }}>
                        {rarity.label}
                    </span>
                </div>

                {/* Icon orb */}
                <div className="flex justify-center mb-4">
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-4xl relative"
                        style={{
                            background: `radial-gradient(circle at 40% 35%, ${catConfig.tabBg}33, ${catConfig.gradientTo})`,
                            border: `1px solid ${catConfig.borderColor}`,
                            boxShadow: `0 0 20px ${catConfig.glowColor}`,
                        }}>
                        {challenge.icon}
                        {completed && (
                            <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center"
                                style={{ background: rarity.bar[0] }}>
                                <CheckCircle className="w-3.5 h-3.5 text-white" />
                            </div>
                        )}
                    </div>
                </div>

                {/* Title + description */}
                <h3 className="text-base font-black text-white text-center mb-1 leading-tight">{challenge.title}</h3>
                <p className="text-xs text-center mb-4 leading-relaxed" style={{ color: "rgba(255,255,255,0.45)" }}>{challenge.description}</p>

                {/* Progress bar */}
                <div className="mb-3">
                    <div className="flex justify-between text-[10px] font-bold mb-1.5" style={{ color: "rgba(255,255,255,0.4)" }}>
                        <span>{completed ? "Completed!" : "Progress"}</span>
                        <span style={{ color: "rgba(255,255,255,0.7)" }}>{current} / {challenge.target_count}</span>
                    </div>
                    <div className="h-2.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                        <div
                            className="h-full rounded-full transition-all duration-[1200ms] ease-out"
                            style={{
                                width: animated ? `${progress}%` : "0%",
                                background: completed
                                    ? `linear-gradient(90deg, ${rarity.bar[0]}, ${rarity.bar[1]})`
                                    : `linear-gradient(90deg, ${catConfig.barFrom}, ${catConfig.barTo})`,
                                boxShadow: progress > 0 ? `0 0 8px ${catConfig.glowColor}` : "none",
                            }}
                        />
                    </div>
                </div>

                {/* Nudge / timer footer */}
                {nudge && !completed && (
                    <p className="text-[11px] font-bold text-center" style={{ color: catConfig.tabBg }}>{nudge}</p>
                )}
                {isWeekly && !completed && !isPermanent && (
                    <div className="flex items-center justify-center gap-1 mt-1">
                        <Clock className="w-3 h-3" style={{ color: daysLeft <= 2 ? "#ef4444" : "#78716c" }} />
                        <span className="text-[10px] font-bold"
                            style={{ color: daysLeft <= 2 ? "#ef4444" : daysLeft <= 4 ? "#f97316" : "#57534e" }}>
                            Resets in {daysLeft}d
                        </span>
                    </div>
                )}
                {completed && !nudge && (
                    <p className="text-[11px] font-bold text-center" style={{ color: rarity.text }}>+{challenge.xp_reward} XP Earned</p>
                )}
            </div>

            {/* Completed shimmer overlay */}
            {completed && (
                <div className="absolute inset-0 pointer-events-none rounded-2xl"
                    style={{ background: `linear-gradient(135deg, ${rarity.glow} 0%, transparent 60%)` }} />
            )}
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────────────────────────────────────
export default function ChallengesPage() {
    const { user } = useAuth();
    const isAuthPending = useRequireAuth();
    const [gamification, setGamification] = useState<{ challenges: Challenge[], achievements: UserAchievement[] } | null>(null);
    const [stats, setStats] = useState<any>(null);
    const [selectedCategory, setSelectedCategory] = useState<Category>("all");
    const [animated, setAnimated] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (user) {
            playerService.getChallenges().then(setGamification);
            playerService.getStats().then(setStats);
        }
    }, [user]);

    useEffect(() => {
        if (gamification && containerRef.current) {
            const t = setTimeout(() => setAnimated(true), 100);
            gsap.fromTo(
                ".challenge-card",
                { y: 40, opacity: 0 },
                { y: 0, opacity: 1, stagger: 0.06, duration: 0.5, ease: "power3.out" }
            );
            return () => clearTimeout(t);
        }
    }, [gamification, selectedCategory]);

    if (isAuthPending || !user) return <AuthLoadingSpinner />;

    const xp = stats?.xp ?? user.xp ?? 0;
    const level = stats?.level ?? 1;
    const tier = stats?.tier ?? "Rookie";
    const tierMinXp = stats?.tier_min_xp ?? 0;
    const nextTierMinXp = stats?.next_tier_min_xp ?? null;
    const nextTier = stats?.next_tier ?? null;
    const tierStyle = TIER_STYLES[tier] || TIER_STYLES.Rookie;
    const xpInTier = xp - tierMinXp;
    const xpRangeForTier = nextTierMinXp ? nextTierMinXp - tierMinXp : 1;
    const tierProgress = nextTierMinXp ? Math.min(100, Math.round((xpInTier / xpRangeForTier) * 100)) : 100;

    const getAchievement = (id: string | number) =>
        gamification?.achievements.find(a => a.challenge_id === id);

    const getCatConfig = (cat: string) =>
        CATEGORIES.find(c => c.key === cat) || CATEGORIES[0];

    const completedCount = gamification?.achievements.filter(a => a.is_completed).length || 0;
    const totalCount = gamification?.challenges.length || 0;

    const categoryCounts = (cat: string) => {
        const chs = gamification?.challenges.filter(c => c.category === cat) || [];
        const done = chs.filter(c => getAchievement(c.id)?.is_completed).length;
        return { done, total: chs.length };
    };

    const orderedChallenges = (() => {
        const all = gamification?.challenges || [];
        const filtered = selectedCategory === "all" ? all : all.filter(c => c.category === selectedCategory);
        return [...filtered].sort((a, b) => {
            const aAch = getAchievement(a.id);
            const bAch = getAchievement(b.id);
            if (aAch?.is_completed && !bAch?.is_completed) return 1;
            if (!aAch?.is_completed && bAch?.is_completed) return -1;
            const aPct = aAch ? aAch.progress / a.target_count : 0;
            const bPct = bAch ? bAch.progress / b.target_count : 0;
            return bPct - aPct;
        });
    })();

    const groupedByCategory = (() => {
        if (selectedCategory !== "all") return null;
        const groups: { cat: typeof CATEGORIES[0]; challenges: Challenge[] }[] = [];
        const categoryOrder: Category[] = ["weekly", "milestone", "streak", "explorer", "loyalty", "timing"];
        for (const catKey of categoryOrder) {
            const catChallenges = orderedChallenges.filter(c => c.category === catKey);
            if (catChallenges.length > 0) {
                const catConfig = CATEGORIES.find(c => c.key === catKey)!;
                groups.push({ cat: catConfig, challenges: catChallenges });
            }
        }
        const uncategorized = orderedChallenges.filter(c => !categoryOrder.includes(c.category as Category));
        if (uncategorized.length > 0) groups.push({ cat: CATEGORIES[0], challenges: uncategorized });
        return groups;
    })();

    return (
        <main className="min-h-screen pb-16 pt-20 selection:bg-purple-500/20 relative overflow-x-hidden"
            style={{ background: "radial-gradient(ellipse at 20% 0%, rgba(30,20,60,0.8) 0%, #050508 50%), radial-gradient(ellipse at 80% 100%, rgba(20,50,30,0.5) 0%, transparent 60%)" }}>

            {/* Background hex grid */}
            <div className="fixed inset-0 pointer-events-none opacity-[0.025]"
                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='52' viewBox='0 0 60 52' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0L60 17.3v17.3L30 52 0 34.6V17.3L30 0z' fill='none' stroke='%23ffffff' stroke-width='1'/%3E%3C/svg%3E")`, backgroundSize: "60px 52px" }} />

            {/* Decorative orbs */}
            <div className="fixed top-0 left-1/4 w-96 h-96 rounded-full pointer-events-none blur-[120px] opacity-20" style={{ background: "radial-gradient(circle, rgba(99,102,241,0.6), transparent)" }} />
            <div className="fixed bottom-1/4 right-0 w-80 h-80 rounded-full pointer-events-none blur-[100px] opacity-15" style={{ background: "radial-gradient(circle, rgba(245,158,11,0.5), transparent)" }} />

            <div className="container mx-auto max-w-6xl px-4" ref={containerRef}>

                {/* Nav */}
                <div className="flex items-center justify-between mb-8">
                    <Link href="/profile" className="inline-flex items-center text-sm font-medium text-zinc-500 hover:text-white transition-colors group">
                        <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" /> Profile
                    </Link>
                    <div className="flex items-center gap-2 px-4 py-1.5 rounded-full border border-zinc-800 bg-zinc-900/80 backdrop-blur-sm">
                        <Zap className="w-3.5 h-3.5 text-yellow-400" />
                        <span className="text-xs font-black text-white">{xp.toLocaleString()} XP</span>
                    </div>
                </div>

                {/* ── HERO SECTION ── */}
                <div className="relative rounded-3xl overflow-hidden mb-8 p-6 md:p-8"
                    style={{ background: `linear-gradient(135deg, rgba(15,10,30,0.95), rgba(5,5,8,0.9))`, border: `1px solid rgba(255,255,255,0.06)` }}>

                    {/* Glow orb behind trophy */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full pointer-events-none blur-3xl opacity-30"
                        style={{ background: `radial-gradient(circle, ${tierStyle.glow}, transparent)` }} />

                    <div className="relative z-10 flex flex-col md:flex-row items-center gap-6 md:gap-10">

                        {/* Trophy orb */}
                        <div className="relative flex-shrink-0">
                            <div className="w-24 h-24 md:w-28 md:h-28 rounded-3xl flex items-center justify-center text-5xl md:text-6xl shadow-2xl"
                                style={{ background: tierStyle.gradient, boxShadow: `0 0 40px ${tierStyle.glow}, 0 8px 32px rgba(0,0,0,0.6)` }}>
                                {tierStyle.icon}
                            </div>
                            {/* Pulse ring */}
                            <div className="absolute inset-0 rounded-3xl animate-ping opacity-20 pointer-events-none"
                                style={{ boxShadow: `0 0 0 4px ${tierStyle.glow}` }} />
                        </div>

                        {/* Info */}
                        <div className="flex-1 text-center md:text-left w-full">
                            <div className="flex items-center justify-center md:justify-start gap-3 mb-3">
                                <span className="text-3xl md:text-4xl font-black text-white">Level {level}</span>
                                <span className="px-3 py-1 rounded-full text-sm font-black"
                                    style={{ background: `${tierStyle.glow}`, color: "white", border: `1px solid ${tierStyle.glow}` }}>
                                    {tier}
                                </span>
                            </div>

                            {/* XP segmented bar */}
                            <div className="mb-3 max-w-md mx-auto md:mx-0">
                                <div className="flex justify-between text-xs font-bold text-zinc-500 mb-1.5">
                                    <span>{tierMinXp.toLocaleString()} XP</span>
                                    <span>{nextTierMinXp ? nextTierMinXp.toLocaleString() : "MAX"} XP</span>
                                </div>
                                <div className="h-3 rounded-full overflow-hidden relative" style={{ background: "rgba(255,255,255,0.06)" }}>
                                    <div className="h-full rounded-full transition-all duration-[1500ms] ease-out"
                                        style={{
                                            width: animated ? `${tierProgress}%` : "0%",
                                            background: tierStyle.gradient,
                                            boxShadow: `0 0 12px ${tierStyle.glow}`,
                                        }} />
                                </div>
                                <p className="text-xs text-zinc-500 mt-1.5 text-right">
                                    {nextTier ? <>{stats?.xp_to_next_tier} XP to <span className="text-zinc-300 font-bold">{nextTier}</span></> : <span className="text-yellow-400 font-bold">👑 Max Tier Reached</span>}
                                </p>
                            </div>

                            {/* Stats strip */}
                            <div className="flex items-center justify-center md:justify-start gap-4 flex-wrap">
                                <StatPill icon="✅" value={`${completedCount} / ${totalCount}`} label="Challenges" />
                                <StatPill icon="⚡" value={xp.toLocaleString()} label="Total XP" />
                                <StatPill icon="⏱" value={`${getDaysUntilMonday()}d`} label="Weekly Reset" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── CATEGORY TABS ── */}
                <div className="flex gap-2 overflow-x-auto pb-2 mb-8 scrollbar-hide">
                    {CATEGORIES.map(cat => {
                        const counts = cat.key !== "all" ? categoryCounts(cat.key) : null;
                        const isActive = selectedCategory === cat.key;
                        return (
                            <button key={cat.key}
                                onClick={() => setSelectedCategory(cat.key)}
                                className="flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all duration-200"
                                style={{
                                    background: isActive ? `${cat.tabBg}` : "rgba(255,255,255,0.04)",
                                    border: `1px solid ${isActive ? cat.tabBg : "rgba(255,255,255,0.07)"}`,
                                    color: isActive ? "white" : "rgba(255,255,255,0.5)",
                                    boxShadow: isActive ? `0 0 16px ${cat.glowColor}` : "none",
                                }}>
                                <span>{cat.icon}</span>
                                <span className="whitespace-nowrap">{cat.label}</span>
                                {counts && (
                                    <span className="text-[10px] font-black px-1.5 py-0.5 rounded-full"
                                        style={{ background: isActive ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.06)" }}>
                                        {counts.done}/{counts.total}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* ── CHALLENGE GRID ── */}
                {selectedCategory === "all" && groupedByCategory ? (
                    <div className="space-y-10">
                        {groupedByCategory.map(({ cat, challenges }) => {
                            const counts = categoryCounts(cat.key);
                            return (
                                <div key={cat.key}>
                                    {/* Section header */}
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-xl flex items-center justify-center text-lg"
                                                style={{ background: `${cat.tabBg}22`, border: `1px solid ${cat.tabBg}44` }}>
                                                {cat.icon}
                                            </div>
                                            <h2 className="text-lg font-black text-white tracking-tight">{cat.label}</h2>
                                            <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                                                style={{ background: `${cat.tabBg}22`, color: cat.tabBg, border: `1px solid ${cat.tabBg}44` }}>
                                                {counts.done}/{counts.total}
                                            </span>
                                        </div>
                                        <button onClick={() => setSelectedCategory(cat.key)}
                                            className="text-xs font-bold transition-colors hover:text-white"
                                            style={{ color: cat.tabBg }}>
                                            See all →
                                        </button>
                                    </div>

                                    {/* Mobile: horizontal scroll */}
                                    <div className="md:hidden flex gap-4 overflow-x-auto pb-3 scrollbar-hide -mx-4 px-4">
                                        {challenges.map(ch => (
                                            <div key={ch.id} className="flex-shrink-0 w-52">
                                                <ChallengeCard challenge={ch} achievement={getAchievement(ch.id)} catConfig={cat} animated={animated} />
                                            </div>
                                        ))}
                                    </div>

                                    {/* Desktop: grid */}
                                    <div className="hidden md:grid md:grid-cols-3 lg:grid-cols-4 gap-4">
                                        {challenges.map(ch => (
                                            <ChallengeCard key={ch.id} challenge={ch} achievement={getAchievement(ch.id)} catConfig={cat} animated={animated} />
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {orderedChallenges.map(ch => (
                                <ChallengeCard key={ch.id} challenge={ch} achievement={getAchievement(ch.id)}
                                    catConfig={getCatConfig(ch.category)} animated={animated} />
                            ))}
                        </div>
                        {orderedChallenges.length === 0 && (
                            <div className="text-center py-20 text-zinc-600">
                                <Trophy className="w-12 h-12 mx-auto mb-3 opacity-30" />
                                <p className="text-sm">No challenges in this category yet.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>

        </main>
    );
}

function StatPill({ icon, value, label }: { icon: string; value: string; label: string }) {
    return (
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <span>{icon}</span>
            <span className="font-black text-white">{value}</span>
            <span className="text-zinc-500">{label}</span>
        </div>
    );
}
