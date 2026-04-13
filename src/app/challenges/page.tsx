"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { ArrowLeft, Trophy, Zap, CheckCircle, Clock, Infinity as InfinityIcon } from "lucide-react";
import { useAuth } from "@/services/authContext";
import { playerService } from "@/services/playerService";
import { Challenge, UserAchievement } from "@/types";
import { gsap } from "gsap";
import { useRequireAuth, AuthLoadingSpinner } from "@/components/auth/RequireAuth";
import HScrollArea from "@/components/ui/HScrollArea";

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

    return (
        <div
            className="challenge-card group relative flex flex-col overflow-hidden rounded-2xl border cursor-default select-none transition-all duration-300 hover:-translate-y-0.5"
            style={{
                background: "rgba(12,12,14,0.97)",
                borderColor: completed ? rarity.border : `${catConfig.tabBg}50`,
                boxShadow: completed
                    ? `0 8px 28px rgba(0,0,0,0.45), 0 0 0 1px ${rarity.border}`
                    : `0 6px 20px rgba(0,0,0,0.35)`,
            }}
        >
            {/* Top accent strip — rarity color when done, category color otherwise */}
            <div className="h-[3px] w-full shrink-0"
                style={{
                    background: completed
                        ? `linear-gradient(90deg, ${rarity.bar[0]}, ${rarity.bar[1]})`
                        : `linear-gradient(90deg, ${catConfig.tabBg}cc, ${catConfig.tabBg}44)`,
                    boxShadow: completed ? `0 0 10px ${rarity.glow}` : `0 0 8px ${catConfig.tabBg}44`,
                }} />

            {/* Subtle glow behind icon area */}
            <div className="pointer-events-none absolute left-0 top-0 h-24 w-24 rounded-full blur-2xl opacity-30"
                style={{ background: completed ? rarity.glow : `${catConfig.tabBg}` }} />

            <div className="relative flex flex-col gap-3 p-4">
                {/* Row 1: icon left | XP + rarity right */}
                <div className="flex items-start justify-between gap-3">
                    <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border text-xl"
                        style={{
                            background: `${completed ? rarity.text : catConfig.tabBg}18`,
                            borderColor: completed ? rarity.border : `${catConfig.tabBg}55`,
                        }}>
                        {challenge.icon}
                        {completed && (
                            <div className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full border border-[rgba(12,12,14,1)]"
                                style={{ background: rarity.glow, borderColor: rarity.border }}>
                                <CheckCircle className="h-2.5 w-2.5" style={{ color: rarity.text }} />
                            </div>
                        )}
                    </div>

                    <div className="flex flex-col items-end gap-1">
                        <span
                            className="rounded-full px-2.5 py-0.5 text-[12px] font-black"
                            style={{
                                color: rarity.text,
                                background: `${rarity.glow}`,
                                border: `1px solid ${rarity.text}44`,
                                boxShadow: `0 0 14px ${rarity.glow}`,
                            }}>
                            +{challenge.xp_reward} XP
                        </span>
                        <span
                            className="rounded-full px-2 py-0.5 text-[9px] font-black tracking-[0.2em] uppercase"
                            style={{
                                color: rarity.text,
                                background: `${rarity.glow}`,
                                border: `1px solid ${rarity.text}33`,
                            }}>
                            {rarity.label}
                        </span>
                    </div>
                </div>

                {/* Row 2: category + permanent badges */}
                <div className="flex flex-wrap items-center gap-1.5">
                    <span className="rounded-full border px-2 py-0.5 text-[10px] font-black tracking-widest uppercase"
                        style={{ background: `${catConfig.tabBg}18`, color: catConfig.tabBg, borderColor: `${catConfig.tabBg}44` }}>
                        {catConfig.icon} {catConfig.label}
                    </span>
                    {isPermanent && (
                        <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/20 bg-amber-500/10 px-2 py-0.5 text-[10px] font-black tracking-widest text-amber-300 uppercase">
                            <InfinityIcon className="h-2.5 w-2.5" /> Permanent
                        </span>
                    )}
                </div>

                {/* Row 3: title + description */}
                <div>
                    <h3 className="text-sm font-black leading-snug text-white">{challenge.title}</h3>
                    <p className="mt-1 text-xs leading-relaxed text-zinc-500">{challenge.description}</p>
                </div>

                {/* Row 4: progress */}
                <div className="pt-1">
                    <div className="mb-1.5 flex items-center justify-between text-[11px] font-semibold">
                        <span className="text-zinc-600">{completed ? "Completed" : "Progress"}</span>
                        <span className="text-zinc-400">{current} / {challenge.target_count}</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full border border-white/5 bg-black/50">
                        <div
                            className="h-full rounded-full transition-all duration-[1200ms] ease-out"
                            style={{
                                width: animated ? `${progress}%` : "0%",
                                background: completed
                                    ? `linear-gradient(90deg, ${rarity.bar[0]}, ${rarity.bar[1]})`
                                    : `linear-gradient(90deg, ${catConfig.tabBg}, ${catConfig.tabBg}88)`,
                                boxShadow: progress > 0 ? `0 0 8px ${completed ? rarity.glow : `${catConfig.tabBg}66`}` : "none",
                            }}
                        />
                    </div>
                    <div className="mt-2 flex items-center justify-between text-[11px] font-semibold">
                        <div>
                            {completed && (
                                <span className="inline-flex items-center gap-1 text-emerald-400">
                                    <CheckCircle className="h-3 w-3" /> Obtained
                                </span>
                            )}
                            {!completed && nudge && (
                                <span style={{ color: catConfig.tabBg }}>{nudge}</span>
                            )}
                            {!completed && !nudge && isWeekly && !isPermanent && (
                                <span className="inline-flex items-center gap-1"
                                    style={{ color: daysLeft <= 2 ? "#ef4444" : daysLeft <= 4 ? "#f59e0b" : "#52525b" }}>
                                    <Clock className="h-3 w-3" /> {daysLeft}d left
                                </span>
                            )}
                        </div>
                        <span className="font-bold" style={{ color: completed ? rarity.text : "#3f3f46" }}>
                            {completed ? `+${challenge.xp_reward} XP` : `${progress}%`}
                        </span>
                    </div>
                </div>
            </div>
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
        if (gamification && stats && containerRef.current) {
            const t = setTimeout(() => setAnimated(true), 120);
            const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
            tl.fromTo(".premium-hero", { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 0.55 })
                .fromTo(".premium-ladder", { y: 18, opacity: 0 }, { y: 0, opacity: 1, duration: 0.45 }, "-=0.22")
                .fromTo(".tier-card", { y: 14, opacity: 0, scale: 0.96 }, { y: 0, opacity: 1, scale: 1, stagger: 0.04, duration: 0.38 }, "-=0.2")
                .fromTo(".premium-tabs", { y: 14, opacity: 0 }, { y: 0, opacity: 1, duration: 0.35 }, "-=0.1")
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
        <main className="min-h-screen bg-black pb-16 pt-20 selection:bg-emerald-500/20 relative">

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

                {/* ── COMPACT HERO ── */}
                <div className="premium-hero relative mb-6 overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/60 backdrop-blur-sm">
                    <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-zinc-700 to-transparent" />
                    <div className="pointer-events-none absolute -left-6 top-0 h-28 w-28 rounded-full blur-3xl opacity-50"
                        style={{ background: tierStyle.glow }} />

                    <div className="relative z-10 flex flex-wrap items-center gap-4 px-5 py-4">

                        {/* Tier identity */}
                        <div className="flex shrink-0 items-center gap-3">
                            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-zinc-800 text-2xl shadow-lg"
                                style={{ background: tierStyle.gradient, boxShadow: `0 4px 18px ${tierStyle.glow}` }}>
                                {tierStyle.icon}
                            </div>
                            <div>
                                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Tier</div>
                                <div className="flex items-center gap-2">
                                    <span className="text-base font-black text-white">{tier}</span>
                                    <span className="rounded-full border px-2 py-0.5 text-[11px] font-black text-white"
                                        style={{ background: tierStyle.glow, borderColor: `${tierStyle.glow}` }}>
                                        Lv {level}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="hidden h-8 w-px shrink-0 bg-zinc-800 sm:block" />

                        {/* XP bar */}
                        <div className="min-w-[160px] flex-1">
                            <div className="mb-1.5 flex justify-between text-[10px] font-bold text-zinc-600">
                                <span>{tierMinXp.toLocaleString()} XP</span>
                                <span>{nextTierMinXp ? nextTierMinXp.toLocaleString() : "MAX"} XP</span>
                            </div>
                            <div className="h-2 overflow-hidden rounded-full border border-zinc-800 bg-black/50">
                                <div className="h-full rounded-full transition-all duration-[1400ms] ease-out"
                                    style={{ width: animated ? `${tierProgress}%` : "0%", background: tierStyle.gradient, boxShadow: `0 0 8px ${tierStyle.glow}` }} />
                            </div>
                            <div className="mt-1.5 text-[11px] text-zinc-500">
                                {nextTier
                                    ? <>{xpToNextTier} XP to <span className="font-bold text-zinc-300">{nextTier}</span></>
                                    : <span className="font-bold text-amber-400">Max tier reached</span>}
                            </div>
                        </div>

                        <div className="hidden h-8 w-px shrink-0 bg-zinc-800 md:block" />

                        {/* Stats pills */}
                        <div className="hidden shrink-0 items-center gap-2 md:flex">
                            <StatPill icon="✅" value={`${completedCount}/${totalCount}`} label="done" />
                            <StatPill icon="⚡" value={xp.toLocaleString()} label="XP" />
                            <StatPill icon="↩" value={`${weeklyResetDays}d`} label="reset Mon" />
                        </div>

                        {/* Mobile stats row */}
                        <div className="flex w-full items-center gap-2 md:hidden">
                            <StatPill icon="✅" value={`${completedCount}/${totalCount}`} label="done" />
                            <StatPill icon="⚡" value={xp.toLocaleString()} label="XP" />
                        </div>
                    </div>
                </div>

                {/* ── TIER ROADMAP ── always visible */}
                <div className="premium-ladder mb-8">
                    <div className="mb-4 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-amber-500/20 bg-amber-500/10 text-sm">⚔️</div>
                            <div>
                                <h2 className="text-sm font-black text-white">Tier Roadmap</h2>
                                <p className="text-[11px] text-zinc-500">Every tier unlocked is permanent. Keep climbing.</p>
                            </div>
                        </div>
                        {nextTier && (
                            <div className="hidden shrink-0 items-center gap-1.5 rounded-full border border-amber-500/25 bg-amber-500/10 px-3 py-1.5 sm:flex">
                                <Zap className="h-3 w-3 text-amber-400" />
                                <span className="text-[11px] font-black text-amber-300">{xpToNextTier} XP to {nextTier}</span>
                            </div>
                        )}
                    </div>

                    <HScrollArea className="overflow-x-auto scrollbar-hide -mx-4 px-4">
                        <div className="relative flex gap-3 pb-4 pt-5" style={{ width: "max-content" }}>
                            {/* Connecting path line */}
                            <div className="absolute left-[84px] right-[84px] top-[4.6rem] h-0.5"
                                style={{ background: "linear-gradient(90deg, rgba(63,63,70,0.4), rgba(63,63,70,0.8) 50%, rgba(63,63,70,0.4))" }} />

                            {TIER_LADDER.map((t, i) => {
                                const isCurrent = t.name === tier;
                                const isUnlocked = xp >= t.minXp;
                                const isNext = !isUnlocked && (i === 0 || xp >= TIER_LADDER[i - 1].minXp);
                                const tierBarWidth = isCurrent ? `${tierProgress}%` : isUnlocked ? "100%" : "0%";
                                const xpNeeded = t.minXp - xp;
                                return (
                                    <div key={t.name}
                                        className="tier-card relative flex w-[152px] shrink-0 flex-col items-center gap-2.5 rounded-2xl border p-4 pb-4 transition-all duration-300"
                                        style={{
                                            background: isCurrent
                                                ? `linear-gradient(160deg, rgba(15,15,18,0.99) 0%, ${t.color}20 100%)`
                                                : isNext
                                                    ? `linear-gradient(160deg, rgba(15,15,18,0.97) 0%, ${t.color}12 100%)`
                                                    : isUnlocked
                                                        ? "rgba(15,15,18,0.92)"
                                                        : "rgba(10,10,12,0.88)",
                                            borderColor: isCurrent
                                                ? `${t.color}aa`
                                                : isNext
                                                    ? `${t.color}55`
                                                    : isUnlocked
                                                        ? "rgba(63,63,70,0.7)"
                                                        : "rgba(39,39,42,0.5)",
                                            boxShadow: isCurrent
                                                ? `0 0 36px ${t.color}30, 0 0 0 1px ${t.color}44, inset 0 1px 0 ${t.color}22`
                                                : isNext
                                                    ? `0 0 20px ${t.color}16`
                                                    : "none",
                                            transform: isCurrent ? "translateY(-4px) scale(1.04)" : "none",
                                            opacity: isUnlocked || isCurrent || isNext ? 1 : 0.45,
                                        }}>

                                        {/* Floating status chip above card */}
                                        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                                            {isCurrent && (
                                                <span className="whitespace-nowrap rounded-full border px-2.5 py-0.5 text-[8px] font-black tracking-widest uppercase shadow-lg"
                                                    style={{ background: `${t.color}25`, color: t.color, borderColor: `${t.color}77`, boxShadow: `0 0 12px ${t.color}33` }}>
                                                    ▶ YOU
                                                </span>
                                            )}
                                            {isNext && (
                                                <span className="whitespace-nowrap rounded-full border border-amber-400/40 bg-amber-400/15 px-2.5 py-0.5 text-[8px] font-black tracking-widest uppercase text-amber-300 shadow-lg">
                                                    ⚡ NEXT
                                                </span>
                                            )}
                                        </div>

                                        {/* Icon */}
                                        <div className="mt-1 flex h-14 w-14 items-center justify-center rounded-2xl border text-3xl"
                                            style={{
                                                background: `${t.color}${isCurrent ? "22" : isUnlocked ? "14" : isNext ? "10" : "06"}`,
                                                borderColor: `${t.color}${isCurrent ? "66" : isNext ? "33" : isUnlocked ? "22" : "10"}`,
                                                boxShadow: isCurrent
                                                    ? `0 0 28px ${t.color}44, inset 0 0 16px ${t.color}18`
                                                    : isNext
                                                        ? `0 0 16px ${t.color}22`
                                                        : "none",
                                                filter: !isUnlocked && !isNext ? "grayscale(1) brightness(0.45)" : "none",
                                            }}>
                                            {t.icon}
                                        </div>

                                        {/* Name */}
                                        <span className="text-sm font-black"
                                            style={{ color: isCurrent ? t.color : isNext ? "#a1a1aa" : isUnlocked ? "#d4d4d8" : "#3f3f46" }}>
                                            {t.name}
                                        </span>

                                        {/* XP */}
                                        <span className="text-[11px] font-black"
                                            style={{ color: isCurrent || isNext ? t.color : isUnlocked ? "#52525b" : "#27272a" }}>
                                            {t.minXp.toLocaleString()} XP
                                        </span>

                                        {/* Progress bar */}
                                        {(isCurrent || isUnlocked) && (
                                            <div className="h-1 w-full overflow-hidden rounded-full border border-white/5 bg-black/50">
                                                <div className="h-full rounded-full transition-all duration-700"
                                                    style={{
                                                        width: tierBarWidth,
                                                        background: `linear-gradient(90deg, ${t.color}, ${t.color}88)`,
                                                        boxShadow: isCurrent ? `0 0 6px ${t.color}` : "none",
                                                    }} />
                                            </div>
                                        )}

                                        {/* XP needed for next */}
                                        {isNext && (
                                            <span className="text-[9px] font-bold text-amber-400/60">
                                                {xpNeeded.toLocaleString()} XP away
                                            </span>
                                        )}

                                        {/* Unlocked check */}
                                        {isUnlocked && !isCurrent && (
                                            <span className="text-[9px] font-bold text-emerald-600">✓ unlocked</span>
                                        )}

                                        {/* Locked */}
                                        {!isUnlocked && !isNext && (
                                            <span className="text-[10px] text-zinc-800">🔒</span>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </HScrollArea>
                </div>

                {/* ── CATEGORY TABS ── */}
                <HScrollArea className="premium-tabs flex gap-2 overflow-x-auto pb-2 mb-8 scrollbar-hide">
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
                </HScrollArea>

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
                                        <span className="text-xs font-bold text-zinc-600">scroll →</span>
                                    </div>

                                    {/* Horizontal scroll — same layout on mobile and desktop */}
                                    <HScrollArea className="flex gap-3 overflow-x-auto pb-3 scrollbar-hide -mx-4 px-4">
                                        {challenges.map(ch => (
                                            <div key={ch.id} className="flex-shrink-0 w-[76vw] max-w-[268px] sm:w-[44vw] md:w-[280px]">
                                                <ChallengeCard challenge={ch} achievement={getAchievement(ch.id)} catConfig={cat} animated={animated} />
                                            </div>
                                        ))}
                                    </HScrollArea>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="section-block">
                        <HScrollArea className="flex gap-3 overflow-x-auto pb-3 scrollbar-hide -mx-4 px-4">
                            {orderedChallenges.map(ch => (
                                <div key={ch.id} className="flex-shrink-0 w-[76vw] max-w-[268px] sm:w-[44vw] md:w-[280px]">
                                    <ChallengeCard challenge={ch} achievement={getAchievement(ch.id)}
                                        catConfig={getCatConfig(ch.category)} animated={animated} />
                                </div>
                            ))}
                        </HScrollArea>
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

