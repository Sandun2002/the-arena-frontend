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
// Tier Ladder data
// ─────────────────────────────────────────────────────────────────────────────
const TIER_LADDER = [
    { name: "Rookie",    minXp: 0,     nextXp: 500,   icon: "🥉", color: "#71717a" },
    { name: "Contender", minXp: 500,   nextXp: 1200,  icon: "🥈", color: "#3b82f6" },
    { name: "Athlete",   minXp: 1200,  nextXp: 2500,  icon: "🏅", color: "#10b981" },
    { name: "Champion",  minXp: 2500,  nextXp: 4500,  icon: "🥇", color: "#eab308" },
    { name: "Elite",     minXp: 4500,  nextXp: 7500,  icon: "🔥", color: "#f97316" },
    { name: "Legend",    minXp: 7500,  nextXp: 12000, icon: "⚔️", color: "#ef4444" },
    { name: "Icon",      minXp: 12000, nextXp: null,  icon: "👑", color: "#a855f7" },
];

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────
function getDaysUntilMonday(): number {
    const day = new Date().getUTCDay();
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
    const accent = completed ? rarity.text : catConfig.tabBg;

    return (
        <div
            className="challenge-card group relative flex h-full min-h-[290px] flex-col overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-900/80 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-zinc-700 cursor-default select-none"
            style={{
                boxShadow: completed
                    ? `0 10px 30px rgba(0,0,0,0.35), 0 0 0 1px ${rarity.border}`
                    : isLegendaryPlus
                        ? `0 10px 30px rgba(0,0,0,0.35), 0 0 0 1px ${rarity.border}`
                        : `0 10px 30px rgba(0,0,0,0.28)`,
            }}
        >
            <div className="absolute inset-0 pointer-events-none opacity-90"
                style={{ background: `radial-gradient(circle at top right, ${completed ? rarity.glow : `${accent}20`}, transparent 34%)` }} />
            <div className="absolute inset-x-0 top-0 h-px opacity-70"
                style={{ background: `linear-gradient(90deg, transparent, ${completed ? rarity.text : catConfig.tabBg}, transparent)` }} />

            <div className="p-4 sm:p-5 flex h-full flex-col">
                <div className="mb-4 flex items-start justify-between gap-3">
                    <div className="flex min-w-0 flex-1 items-start gap-3">
                        <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border text-2xl"
                            style={{
                                background: `${completed ? rarity.text : catConfig.tabBg}15`,
                                borderColor: completed ? rarity.border : `${catConfig.tabBg}44`,
                            }}>
                            {challenge.icon}
                            {completed && (
                                <div className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full border border-zinc-900 bg-zinc-800">
                                    <CheckCircle className="w-3.5 h-3.5" style={{ color: rarity.text }} />
                                </div>
                            )}
                        </div>
                        <div className="min-w-0 flex-1">
                            <div className="mb-2 flex min-h-[28px] flex-wrap items-center gap-2">
                                <span className="rounded-full border px-2 py-0.5 text-[10px] font-black tracking-widest uppercase"
                                    style={{ background: `${catConfig.tabBg}18`, color: catConfig.tabBg, borderColor: `${catConfig.tabBg}40` }}>
                                    {catConfig.icon} {catConfig.label}
                                </span>
                                {isPermanent && (
                                    <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/20 bg-amber-500/10 px-2 py-0.5 text-[10px] font-black tracking-widest text-amber-300 uppercase">
                                        <InfinityIcon className="w-2.5 h-2.5" /> Permanent
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="flex w-[92px] shrink-0 flex-col items-end gap-1.5 text-right md:w-[104px]">
                        <span className="flex min-h-8 w-full items-center justify-center rounded-full border px-2.5 py-1 text-[11px] font-black text-white"
                            style={{
                                borderColor: `${rarity.text}44`,
                                background: `linear-gradient(135deg, rgba(24,24,27,0.92), ${rarity.glow})`,
                                boxShadow: `0 0 18px ${rarity.glow}`,
                            }}>
                            +{challenge.xp_reward} XP
                        </span>
                        <span className="flex min-h-6 w-full items-center justify-center rounded-full border px-2 py-0.5 text-[9px] font-black tracking-[0.18em] uppercase"
                            style={{ color: rarity.text, borderColor: `${rarity.text}33`, background: `${rarity.glow}` }}>
                            {rarity.label}
                        </span>
                    </div>
                </div>

                <div className="mb-5 min-h-[92px] md:min-h-[116px]">
                    <h3 className="mb-2 min-h-[56px] text-base font-black leading-[1.05] text-white sm:text-lg md:min-h-[60px]">{challenge.title}</h3>
                    <p className="min-h-[40px] text-sm leading-relaxed text-zinc-400">{challenge.description}</p>
                </div>

                <div className="mt-auto">
                    <div className="mb-2 flex items-center justify-between text-[11px] font-semibold text-zinc-500">
                        <span>{completed ? "Completed" : "Progress"}</span>
                        <span className="text-zinc-300">{current} / {challenge.target_count}</span>
                    </div>
                    <div className="h-2.5 overflow-hidden rounded-full border border-white/5 bg-black/40">
                        <div
                            className="h-full rounded-full transition-all duration-[1200ms] ease-out"
                            style={{
                                width: animated ? `${progress}%` : "0%",
                                background: completed
                                    ? `linear-gradient(90deg, ${rarity.bar[0]}, ${rarity.bar[1]})`
                                    : `linear-gradient(90deg, #10b981, ${catConfig.tabBg})`,
                                boxShadow: progress > 0 ? `0 0 10px ${completed ? rarity.glow : `${catConfig.tabBg}55`}` : "none",
                            }}
                        />
                    </div>

                    <div className="mt-3 flex min-h-9 items-end justify-between gap-3 text-[11px] font-semibold">
                        <div className="min-w-0 text-left">
                            {completed && (
                                <span className="inline-flex items-center gap-1 text-emerald-400">
                                    <CheckCircle className="w-3.5 h-3.5" /> Obtained
                                </span>
                            )}
                            {!completed && nudge && (
                                <span style={{ color: catConfig.tabBg }}>{nudge}</span>
                            )}
                            {!completed && !nudge && isWeekly && !isPermanent && (
                                <span className="inline-flex items-center gap-1"
                                    style={{ color: daysLeft <= 2 ? "#ef4444" : daysLeft <= 4 ? "#f59e0b" : "#71717a" }}>
                                    <Clock className="w-3.5 h-3.5" /> Resets in {daysLeft}d
                                </span>
                            )}
                        </div>

                        <span className="shrink-0 text-right font-bold" style={{ color: completed ? rarity.text : "#a1a1aa" }}>
                            {completed ? `+${challenge.xp_reward} XP earned` : `${100 - progress}% left`}
                        </span>
                    </div>
                </div>
            </div>

            {completed && (
                <div className="pointer-events-none absolute inset-0 rounded-3xl"
                    style={{ background: `linear-gradient(180deg, ${rarity.glow} 0%, transparent 30%)` }} />
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
    const [showTierLadder, setShowTierLadder] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (user) {
            playerService.getChallenges().then(setGamification);
            playerService.getStats().then(setStats);
        }
    }, [user]);

    useEffect(() => {
        if (gamification && stats && containerRef.current) {
            const t = setTimeout(() => setAnimated(true), 120);
            const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
            tl.fromTo(".premium-hero", { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 0.55 })
                .fromTo(".premium-ladder", { y: 18, opacity: 0 }, { y: 0, opacity: 1, duration: 0.45 }, "-=0.22")
                .fromTo(".premium-tabs", { y: 14, opacity: 0 }, { y: 0, opacity: 1, duration: 0.35 }, "-=0.18")
                .fromTo(".section-block", { y: 24, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.08, duration: 0.45 }, "-=0.1");
            return () => clearTimeout(t);
        }
    }, [gamification, stats]);

    useEffect(() => {
        if (gamification && containerRef.current) {
            gsap.fromTo(
                ".challenge-card",
                { y: 26, opacity: 0 },
                { y: 0, opacity: 1, stagger: 0.05, duration: 0.42, ease: "power3.out" }
            );
        }
    }, [gamification, selectedCategory]);

    useEffect(() => {
        if (showTierLadder) {
            gsap.fromTo(
                ".tier-card",
                { y: 18, opacity: 0, scale: 0.97 },
                { y: 0, opacity: 1, scale: 1, stagger: 0.05, duration: 0.38, ease: "power3.out" }
            );
        }
    }, [showTierLadder]);

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
    const xpToNextTier = stats?.xp_to_next_tier ?? 0;
    const weeklyResetDays = getDaysUntilMonday();
    const completedCount = gamification?.achievements.filter(a => a.is_completed).length || 0;
    const totalCount = gamification?.challenges.length || 0;
    const completionRate = totalCount ? Math.round((completedCount / totalCount) * 100) : 0;

    const getAchievement = (id: string | number) =>
        gamification?.achievements.find(a => a.challenge_id === id);

    const getCatConfig = (cat: string) =>
        CATEGORIES.find(c => c.key === cat) || CATEGORIES[0];

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
        <main className="min-h-screen bg-black pb-16 pt-20 selection:bg-emerald-500/20 relative overflow-x-hidden">

            {/* Background hex grid */}
            <div className="fixed inset-0 pointer-events-none opacity-[0.025]"
                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='52' viewBox='0 0 60 52' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0L60 17.3v17.3L30 52 0 34.6V17.3L30 0z' fill='none' stroke='%23ffffff' stroke-width='1'/%3E%3C/svg%3E")`, backgroundSize: "60px 52px" }} />

            {/* Decorative orbs */}
            <div className="fixed left-0 top-0 h-[22rem] w-[22rem] rounded-full pointer-events-none blur-[120px] opacity-20" style={{ background: "radial-gradient(circle, rgba(16,185,129,0.18), transparent)" }} />
            <div className="fixed bottom-0 right-0 h-[20rem] w-[20rem] rounded-full pointer-events-none blur-[110px] opacity-15" style={{ background: "radial-gradient(circle, rgba(59,130,246,0.14), transparent)" }} />

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
                <div className="premium-hero relative mb-8 overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-900/55 p-5 md:p-6 xl:p-8 backdrop-blur-sm">
                    <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent" />
                    <div className="absolute -left-8 top-8 h-32 w-32 rounded-full blur-3xl" style={{ background: "radial-gradient(circle, rgba(16,185,129,0.12), transparent 70%)" }} />

                    <div className="relative z-10 mb-5 flex items-start justify-between gap-4">
                        <div>
                            <p className="text-[11px] font-black uppercase tracking-[0.22em] text-emerald-400">Player Progression</p>
                            <div className="mt-2 flex flex-wrap items-center gap-3">
                                <h1 className="text-3xl font-black tracking-tight text-white md:text-4xl">{tier} Tier</h1>
                                <span className="rounded-full border px-3 py-1 text-sm font-black text-white"
                                    style={{ background: `${tierStyle.glow}`, borderColor: `${tierStyle.glow}` }}>
                                    Level {level}
                                </span>
                            </div>
                            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-zinc-400">
                                You&apos;ve earned {xp.toLocaleString()} XP and completed {completedCount} of {totalCount} active challenges. Every booking pushes you closer to {nextTier ?? "the top tier"}.
                            </p>
                        </div>

                        <div className="hidden md:flex items-center gap-2 rounded-full border border-zinc-800 bg-black/30 px-4 py-2">
                            <Zap className="h-3.5 w-3.5 text-yellow-400" />
                            <span className="text-xs font-black text-white">{xp.toLocaleString()} XP banked</span>
                        </div>
                    </div>

                    <div className="relative z-10 grid gap-4 lg:grid-cols-[220px,minmax(0,1fr),220px]">
                        <div className="rounded-[1.75rem] border border-zinc-800 bg-black/30 p-4">
                            <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-[1.35rem] border border-zinc-800 text-5xl shadow-2xl md:h-28 md:w-28 md:text-6xl"
                                style={{ background: tierStyle.gradient, boxShadow: `0 8px 24px ${tierStyle.glow}` }}>
                                {tierStyle.icon}
                            </div>
                            <div className="text-center">
                                <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-zinc-500">Current standing</div>
                                <div className="mt-2 text-3xl font-black tracking-tight text-white">Level {level}</div>
                                <div className="mt-2 inline-flex rounded-full border px-3 py-1 text-sm font-black text-white"
                                    style={{ background: `${tierStyle.glow}`, borderColor: `${tierStyle.glow}` }}>
                                    {tier}
                                </div>
                            </div>
                        </div>

                        <div className="rounded-[1.75rem] border border-zinc-800 bg-black/20 p-5 md:p-6">
                            <div className="mb-4 flex items-center justify-between gap-3">
                                <div>
                                    <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-zinc-500">Tier progress</div>
                                    <div className="mt-1 text-lg font-black text-white">{nextTier ? `${xpToNextTier} XP to ${nextTier}` : "Top tier reached"}</div>
                                </div>
                                <div className="text-right">
                                    <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-zinc-500">Progress</div>
                                    <div className="mt-1 text-xl font-black text-white">{tierProgress}%</div>
                                </div>
                            </div>

                            <div className="mb-4 max-w-3xl">
                                <div className="mb-2 flex justify-between text-xs font-bold text-zinc-500">
                                    <span>{tierMinXp.toLocaleString()} XP</span>
                                    <span>{nextTierMinXp ? nextTierMinXp.toLocaleString() : "MAX"} XP</span>
                                </div>
                                <div className="h-3 overflow-hidden rounded-full border border-zinc-800 bg-black/40">
                                    <div className="h-full rounded-full transition-all duration-[1500ms] ease-out"
                                        style={{
                                            width: animated ? `${tierProgress}%` : "0%",
                                            background: tierStyle.gradient,
                                        }} />
                                </div>
                                <p className="mt-2 text-xs text-zinc-500 md:text-right">
                                    {nextTier ? <>{xpToNextTier} XP to <span className="font-bold text-zinc-300">{nextTier}</span></> : <span className="font-bold text-amber-400">Max tier reached</span>}
                                </p>
                            </div>

                            <div className="grid gap-3 sm:grid-cols-3">
                                <HeroStatCard icon="✅" value={`${completedCount}/${totalCount}`} label="Challenges cleared" accent="text-emerald-400" />
                                <HeroStatCard icon="⚡" value={`${completionRate}%`} label="Completion rate" accent="text-white" />
                                <HeroStatCard icon="🏆" value={nextTier ? nextTier : "Maxed"} label="Next chase" accent="text-amber-400" />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="rounded-[1.5rem] border border-zinc-800 bg-black/25 p-4">
                                <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-zinc-500">Next target</div>
                                <div className="mt-2 text-lg font-black text-white">{nextTier ?? "Top tier unlocked"}</div>
                                <p className="mt-2 text-xs leading-relaxed text-zinc-400">
                                    {nextTier ? `${xpToNextTier} XP left to unlock ${nextTier}.` : "You already hold the highest tier available."}
                                </p>
                            </div>

                            <div className="rounded-[1.5rem] border border-zinc-800 bg-black/25 p-4">
                                <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-zinc-500">Weekly reset</div>
                                <div className="mt-2 text-lg font-black text-white">Monday</div>
                                <p className="mt-2 text-xs leading-relaxed text-zinc-400">
                                    Global reset for all players. {weeklyResetDays}d remaining based on the backend reset window.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── TIER LADDER ── */}
                <div className="premium-ladder mb-6">
                    <button
                        onClick={() => setShowTierLadder(v => !v)}
                        className="w-full flex items-center justify-between rounded-3xl border border-zinc-800 bg-zinc-900/70 px-5 py-4 transition-all duration-200 group shadow-[0_10px_30px_rgba(0,0,0,0.18)]">
                        <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-2xl border border-emerald-500/20 bg-emerald-500/10 text-base shadow-[0_0_20px_rgba(16,185,129,0.12)]">🏆</div>
                            <div>
                                <div className="text-sm font-black tracking-wide text-white">Tier Ladder</div>
                                <div className="hidden sm:block text-xs text-zinc-500">See every level, the XP required, and the next target to chase.</div>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-xs font-black text-emerald-400">{nextTier ? `${stats?.xp_to_next_tier} XP to ${nextTier}` : "Top tier unlocked"}</div>
                            <div className="text-[11px] font-bold text-zinc-500 group-hover:text-zinc-300 transition-colors">
                            {showTierLadder ? "▲ hide" : "▼ show"}
                            </div>
                        </div>
                    </button>

                    {showTierLadder && (
                        <div className="mt-3 overflow-x-auto scrollbar-hide -mx-4 px-4">
                            <div className="relative flex gap-4 pb-3 pt-1" style={{ width: "max-content" }}>
                                <div className="absolute left-6 right-6 top-[4.35rem] h-px bg-gradient-to-r from-zinc-800 via-zinc-700 to-zinc-800" />
                                {TIER_LADDER.map((t, i) => {
                                    const isCurrent = t.name === tier;
                                    const isUnlocked = xp >= t.minXp;
                                    const isNext = !isUnlocked && (i === 0 || xp >= TIER_LADDER[i - 1].minXp);
                                    const tierBarWidth = isCurrent ? `${tierProgress}%` : isUnlocked ? "100%" : "0%";
                                    return (
                                        <div key={t.name}
                                            className="tier-card relative w-[148px] rounded-[1.75rem] border p-4 flex flex-col items-center gap-2 transition-all duration-300"
                                            style={{
                                                background: isCurrent
                                                    ? `linear-gradient(180deg, rgba(24,24,27,0.98), ${t.color}20)`
                                                    : isNext
                                                        ? `linear-gradient(180deg, rgba(24,24,27,0.96), ${t.color}12)`
                                                        : "rgba(24,24,27,0.92)",
                                                borderColor: isCurrent ? t.color + "88" : isNext ? t.color + "55" : isUnlocked ? "rgba(82,82,91,1)" : "rgba(39,39,42,1)",
                                                boxShadow: isCurrent ? `0 0 28px ${t.color}22` : isNext ? `0 0 20px ${t.color}10` : "none",
                                                opacity: isUnlocked || isNext ? 1 : 0.56,
                                            }}>
                                            <div className="absolute left-4 top-4 text-[9px] font-black tracking-[0.18em] uppercase"
                                                style={{ color: isCurrent ? t.color : isNext ? "#eab308" : isUnlocked ? "#10b981" : "#52525b" }}>
                                                {isCurrent ? "Current" : isNext ? "Next" : isUnlocked ? "Unlocked" : "Locked"}
                                            </div>
                                            <div className="mt-4 flex h-14 w-14 items-center justify-center rounded-2xl border text-3xl"
                                                style={{ background: `${t.color}18`, borderColor: `${t.color}40`, boxShadow: `0 0 18px ${t.color}18` }}>
                                                {t.icon}
                                            </div>
                                            <span className="text-sm font-black text-center"
                                                style={{ color: isCurrent ? t.color : isUnlocked ? "#e4e4e7" : "#52525b" }}>
                                                {t.name}
                                            </span>
                                            <span className="text-[11px] text-center font-black"
                                                style={{ color: isCurrent || isNext ? t.color : isUnlocked ? "#d4d4d8" : "#52525b" }}>
                                                {t.minXp.toLocaleString()} XP
                                            </span>
                                            {t.nextXp && (
                                                <span className="text-[10px] text-center text-zinc-500">
                                                    up to {(t.nextXp - 1).toLocaleString()}
                                                </span>
                                            )}
                                            <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-black/40 border border-white/5">
                                                <div className="h-full rounded-full transition-all duration-500"
                                                    style={{ width: tierBarWidth, background: `linear-gradient(90deg, ${t.color}, ${t.color}aa)` }} />
                                            </div>
                                            {isCurrent && (
                                                <span className="text-[8px] font-black px-2 py-0.5 rounded-full tracking-widest mt-1"
                                                    style={{ background: t.color + "33", color: t.color, border: `1px solid ${t.color}66` }}>
                                                    YOU ARE HERE
                                                </span>
                                            )}
                                            {isNext && (
                                                <span className="text-[8px] font-black px-2 py-0.5 rounded-full tracking-widest mt-1"
                                                    style={{ background: "rgba(234,179,8,0.12)", color: "#facc15", border: "1px solid rgba(234,179,8,0.22)" }}>
                                                    CHASE THIS
                                                </span>
                                            )}
                                            {!isUnlocked && !isNext && (
                                                <span className="text-[8px] mt-1" style={{ color: "#3f3f46" }}>🔒 locked</span>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>

                {/* ── CATEGORY TABS ── */}
                <div className="premium-tabs flex gap-2 overflow-x-auto pb-2 mb-8 scrollbar-hide">
                    {CATEGORIES.map(cat => {
                        const counts = cat.key !== "all" ? categoryCounts(cat.key) : null;
                        const isActive = selectedCategory === cat.key;
                        return (
                            <button key={cat.key}
                                onClick={() => setSelectedCategory(cat.key)}
                                className="flex-shrink-0 flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-bold transition-all duration-200"
                                style={{
                                    background: isActive ? `${cat.tabBg}22` : "rgba(24,24,27,0.7)",
                                    borderColor: isActive ? `${cat.tabBg}55` : "rgba(63,63,70,1)",
                                    color: isActive ? "white" : "rgba(255,255,255,0.65)",
                                }}>
                                <span>{cat.icon}</span>
                                <span className="whitespace-nowrap">{cat.label}</span>
                                {counts && (
                                    <span className="rounded-full bg-black/30 px-1.5 py-0.5 text-[10px] font-black text-zinc-300">
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
                                <div key={cat.key} className="section-block">
                                    {/* Section header */}
                                    <div className="mb-4 flex items-center justify-between gap-3">
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className="flex h-8 w-8 items-center justify-center rounded-xl border text-lg"
                                                style={{ background: `${cat.tabBg}14`, borderColor: `${cat.tabBg}33` }}>
                                                {cat.icon}
                                            </div>
                                            <h2 className="truncate text-lg font-black tracking-tight text-white">{cat.label}</h2>
                                            <span className="rounded-full border px-2 py-0.5 text-xs font-bold"
                                                style={{ background: `${cat.tabBg}18`, color: cat.tabBg, borderColor: `${cat.tabBg}33` }}>
                                                {counts.done}/{counts.total}
                                            </span>
                                        </div>
                                        <button onClick={() => setSelectedCategory(cat.key)}
                                            className="text-xs font-bold text-zinc-500 transition-colors hover:text-white">
                                            See all →
                                        </button>
                                    </div>

                                    {/* Mobile: horizontal scroll */}
                                    <div className="md:hidden flex gap-4 overflow-x-auto pb-3 scrollbar-hide -mx-4 px-4">
                                        {challenges.map(ch => (
                                            <div key={ch.id} className="flex-shrink-0 w-[82vw] max-w-[320px]">
                                                <ChallengeCard challenge={ch} achievement={getAchievement(ch.id)} catConfig={cat} animated={animated} />
                                            </div>
                                        ))}
                                    </div>

                                    {/* Desktop: grid */}
                                    <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                        {challenges.map(ch => (
                                            <ChallengeCard key={ch.id} challenge={ch} achievement={getAchievement(ch.id)} catConfig={cat} animated={animated} />
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="section-block">
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
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
        <div className="flex items-center gap-2 rounded-full border border-zinc-800 bg-black/30 px-3 py-1.5 text-xs">
            <span>{icon}</span>
            <span className="font-black text-white">{value}</span>
            <span className="text-zinc-500">{label}</span>
        </div>
    );
}

function HeroStatCard({ icon, value, label, accent }: { icon: string; value: string; label: string; accent: string }) {
    return (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-3">
            <div className="flex items-center justify-between gap-3">
                <span className="text-sm">{icon}</span>
                <span className={`text-lg font-black ${accent}`}>{value}</span>
            </div>
            <div className="mt-1 text-[11px] font-semibold text-zinc-500">{label}</div>
        </div>
    );
}
