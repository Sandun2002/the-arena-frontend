"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
    User, Trophy, CalendarBlank, MapPin, PencilSimple, Shield,
    Pulse, TrendUp, EnvelopeSimple, CaretRight, Star, Lock, SignOut,
    Clock, Plus, Lightning, SquaresFour
} from "@phosphor-icons/react";
import Button from "@/components/ui/Button";
import { useRequireAuth, AuthLoadingSpinner } from "@/components/auth/RequireAuth";
import { useAuth } from "@/services/authContext";
import { playerService } from "@/services/playerService";
import { fmtTime, fmtMonthAbbr, fmtDayNum, fmtMonthYear } from "@/lib/utils";
import { Booking, Challenge, UserAchievement } from "@/types";
import TierFrame from "@/components/ui/TierFrame";

export default function ProfilePage() {
    const { user, logout, isVenueOwner, isVenueManager, updateUser } = useAuth();
    const isAuthPending = useRequireAuth();
    const [stats, setStats] = useState<any>(null);
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [upcomingBookings, setUpcomingBookings] = useState<Booking[]>([]);
    const [gamification, setGamification] = useState<{ challenges: Challenge[], achievements: UserAchievement[] } | null>(null);

    useEffect(() => {
        if (user) {
            playerService.getStats().then(s => {
                setStats(s);
                if (s?.xp !== undefined) updateUser({ xp: s.xp, level: s.level });
            });
            playerService.getBookings().then(all => {
                // Sort newest first for recent activity
                const sorted = [...all].sort(
                    (a, b) => new Date(b.start_time).getTime() - new Date(a.start_time).getTime()
                );
                // Upcoming: confirmed bookings + payment_pending whose hold is still valid.
                // (Bookings whose hold timer has expired are stale and will be auto-cancelled by
                // the backend; don't surface them as "upcoming".)
                const now = new Date();
                const upcoming = all
                    .filter(b => {
                        if (new Date(b.start_time) <= now) return false;
                        if (b.status === "confirmed") return true;
                        if (b.status === "payment_pending") {
                            if (!b.hold_expires_at) return true;
                            return new Date(b.hold_expires_at) > now;
                        }
                        return false;
                    })
                    .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());

                setUpcomingBookings(upcoming.slice(0, 3));
                setBookings(sorted.slice(0, 3));
            });
            playerService.getChallenges().then(setGamification);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?.id]);

    if (isAuthPending || !user) return <AuthLoadingSpinner />;

    const completedChallengesCount = gamification?.achievements.filter(a => a.is_completed).length || 0;
    const totalChallengesCount = gamification?.challenges.length || 0;
    const level = stats?.level ?? (user.level ?? 1);
    const xp = stats?.xp ?? (user.xp ?? 0);
    const tier = stats?.tier ?? "Rookie";
    const nextTier = stats?.next_tier ?? null;
    const xpToNextTier = stats?.xp_to_next_tier ?? 0;
    const tierMinXp = stats?.tier_min_xp ?? 0;
    const nextTierMinXp = stats?.next_tier_min_xp ?? null;
    // Compute progress percent within current tier band
    const tierXpProgress = nextTierMinXp
        ? Math.min(100, Math.round(((xp - tierMinXp) / (nextTierMinXp - tierMinXp)) * 100))
        : 100;
    const TIER_COLORS: Record<string, { badge: string; bar: string; text: string }> = {
        Rookie:    { badge: "bg-zinc-500/10 border-zinc-500/20 text-secondary",   bar: "from-zinc-500 to-zinc-400",    text: "text-secondary" },
        Contender: { badge: "bg-blue-500/10 border-blue-500/20 text-blue-400",    bar: "from-blue-500 to-cyan-400",    text: "text-blue-400" },
        Athlete:   { badge: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400", bar: "from-emerald-500 to-cyan-400", text: "text-emerald-400" },
        Champion:  { badge: "bg-yellow-500/10 border-yellow-500/20 text-yellow-400", bar: "from-yellow-500 to-amber-400", text: "text-yellow-400" },
        Elite:     { badge: "bg-orange-500/10 border-orange-500/20 text-orange-400", bar: "from-orange-500 to-amber-400", text: "text-orange-400" },
        Legend:    { badge: "bg-red-500/10 border-red-500/20 text-red-400",       bar: "from-red-500 to-rose-400",    text: "text-red-400" },
        Icon:      { badge: "bg-purple-500/10 border-purple-500/20 text-purple-400", bar: "from-purple-500 to-violet-400", text: "text-purple-400" },
        Titan:     { badge: "bg-sky-400/10 border-sky-300/40 text-sky-200",           bar: "from-sky-400 via-sky-200 to-white",       text: "text-sky-200" },
    };
    const tierStyle = TIER_COLORS[tier] || TIER_COLORS.Rookie;

    return (
        <main className="min-h-screen bg-surface-base pt-24 pb-12 px-4 selection:bg-emerald-500/30">
            <div className="container mx-auto max-w-5xl">

                {/* Header / Cover */}
                <div className="relative h-48 md:h-64 rounded-3xl overflow-hidden mb-20 bg-gradient-to-r from-surface-raised to-surface-overlay border border-default group">
                    <div className="absolute inset-0 bg-[url('/profile-cover.jpg')] bg-cover bg-center opacity-30 group-hover:scale-105 transition-transform duration-700"></div>
                    <div className="absolute inset-0 bg-gradient-to-t from-surface-base via-surface-base/40 to-transparent"></div>
                </div>

                {/* Profile Header (Overlapping) */}
                <div className="relative -mt-32 px-4 md:px-8 mb-12">
                    <div className="flex flex-col md:flex-row items-end md:items-center gap-6">

                        {/* Avatar & Tier Frame */}
                        <div className="block md:hidden">
                            <TierFrame tier={tier} level={level} src={user.profile_image} size="lg" alt={user.full_name} />
                        </div>
                        <div className="hidden md:block">
                            <TierFrame tier={tier} level={level} src={user.profile_image} size="xl" alt={user.full_name} />
                        </div>

                        {/* Info */}
                        <div className="flex-1 pb-2 w-full text-center md:text-left">
                            <h1 className="text-3xl md:text-5xl font-bold text-primary mb-2 tracking-tight">{user.full_name}</h1>
                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 text-secondary text-sm mb-5">
                                <span className="flex items-center gap-1.5 bg-surface-raised/50 px-3 py-1 rounded-full border border-default">
                                    <EnvelopeSimple size={14} weight="bold" /> {user.email}
                                </span>
                                <span className="flex items-center gap-1.5 bg-surface-raised/50 px-3 py-1 rounded-full border border-default">
                                    <CalendarBlank size={14} weight="bold" /> Joined {fmtMonthYear(user.created_at)}
                                </span>
                                {/* Tier Badge */}
                                <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full border ${tierStyle.badge}`}>
                                    <Lightning size={14} weight="fill" /> {tier}
                                </span>
                            </div>

                            {/* XP → Next Tier Progress */}
                            <div className="max-w-md mx-auto md:mx-0">
                                <div className="flex justify-between text-xs font-bold uppercase text-muted mb-2 tracking-wider">
                                    <span>Level {level} · <span className={tierStyle.text}>{tier}</span></span>
                                    <span>{xp.toLocaleString()} XP</span>
                                </div>
                                <div className="h-3 bg-surface-overlay rounded-full overflow-hidden p-0.5 border border-subtle/50">
                                    <div
                                        className={`h-full bg-gradient-to-r ${tierStyle.bar} rounded-full transition-all duration-1000 ease-out`}
                                        style={{ width: `${tierXpProgress}%`, boxShadow: "0 0 10px rgba(80,200,120,0.25)" }}
                                    ></div>
                                </div>
                                <p className="text-xs text-muted mt-2 text-right">
                                    {nextTier
                                        ? <>{xpToNextTier} XP to reach <span className="text-secondary">{nextTier}</span></>
                                        : <span className="text-yellow-500">Max tier reached!</span>
                                    }
                                </p>
                            </div>
                        </div>

                        {/* Quick Edit (Desktop) */}
                        <div className="hidden md:block">
                            <Link href="/profile/settings">
                                <Button variant="outline" className="border-subtle hover:bg-surface-overlay">
                                    <PencilSimple size={16} weight="bold" className="mr-2" /> Edit Profile
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Left Column: Stats & Actions */}
                    <div className="space-y-6">
                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 gap-3">
                            <StatsCard
                                icon={<Trophy size={20} weight="fill" className="text-yellow-500" />}
                                label="Challenges"
                                value={`${completedChallengesCount}/${totalChallengesCount}`}
                                subtext="Completed"
                            />
                            <StatsCard
                                icon={<Pulse size={20} weight="bold" className="text-emerald-500" />}
                                label="Bookings"
                                value={stats?.total_bookings || 0}
                                subtext="Total games"
                            />
                            <StatsCard
                                icon={<TrendUp size={20} weight="bold" className="text-purple-500" />}
                                label="Play Time"
                                value={`${stats?.hours_played || 0}h`}
                                subtext="Hours on court"
                                fullWidth
                            />
                        </div>

                        {/* Menu */}
                        <div className="bg-surface-raised dark:bg-surface-raised/50 border border-default rounded-3xl p-2 backdrop-blur-sm">
                            {(isVenueOwner || isVenueManager) && (
                                <MenuLink href="/venue-dashboard" icon={<SquaresFour size={16} weight="bold" />} label="Manager Dashboard" />
                            )}
                            <MenuLink href="/profile/settings" icon={<PencilSimple size={16} weight="bold" />} label="Edit Profile" />
                            <MenuLink href="/settings/sessions" icon={<Shield size={16} weight="bold" />} label="Security & Sessions" />
                            <MenuLink href="/profile/password" icon={<Lock size={16} weight="bold" />} label="Change Password" />
                            <MenuLink href="/reviews" icon={<Star size={16} weight="bold" />} label="My Reviews" />
                            <button
                                onClick={logout}
                                className="w-full flex items-center justify-between p-4 rounded-2xl text-red-500 hover:bg-red-500/10 transition-colors"
                            >
                                <span className="flex items-center gap-3 font-medium">
                                    <SignOut size={16} weight="bold" /> Log Out
                                </span>
                            </button>
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* Upcoming Games — merged from /dashboard */}
                        <div className="bg-surface-raised dark:bg-surface-raised/50 border border-default rounded-3xl p-6 backdrop-blur-sm">
                            <div className="flex justify-between items-center mb-5">
                                <h3 className="text-lg font-bold text-primary flex items-center gap-2">
                                    <CalendarBlank size={20} weight="duotone" className="text-emerald-400" /> Upcoming Games
                                </h3>
                                <Link href="/venues">
                                    <Button size="sm" className="bg-emerald-500 hover:bg-emerald-400 text-black font-bold h-8 px-4 text-xs">
                                        <Plus size={14} weight="bold" className="mr-1" /> Book
                                    </Button>
                                </Link>
                            </div>

                            {upcomingBookings.length > 0 ? (
                                <div className="space-y-3">
                                    {upcomingBookings.map(booking => (
                                        <Link href={`/bookings/${booking.id}`} key={booking.id} className="block group">
                                            <div className="flex items-center gap-4 p-4 rounded-2xl bg-surface-base/80 dark:bg-surface-base/40 border border-default hover:border-emerald-500/30 hover:bg-surface-overlay dark:hover:bg-surface-overlay/50 transition-all">
                                                <div className="w-12 h-12 bg-surface-overlay rounded-xl flex flex-col items-center justify-center shrink-0 border border-subtle group-hover:border-emerald-500/30 transition-colors">
                                                    <span className="text-[9px] font-bold text-muted uppercase">{fmtMonthAbbr(booking.start_time)}</span>
                                                    <span className="text-lg font-black text-primary leading-none">{fmtDayNum(booking.start_time)}</span>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="text-primary font-bold text-sm truncate group-hover:text-emerald-400 transition-colors">
                                                        {booking.court?.sport_type?.name || booking.sport || "Sport"}
                                                    </h4>
                                                    <p className="text-xs text-muted flex items-center gap-1.5 truncate">
                                                        <MapPin size={12} weight="fill" className="flex-shrink-0 mr-1" />{booking.court?.venue_name}
                                                    </p>
                                                    <p className="text-xs text-secondary flex items-center gap-1.5 font-mono mt-0.5">
                                                        <Clock size={12} weight="bold" className="flex-shrink-0" />
                                                        {fmtTime(booking.start_time)}
                                                    </p>
                                                </div>
                                                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                                                    booking.status === "confirmed"
                                                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                                        : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                                                }`}>
                                                    {booking.status === "confirmed" ? "Confirmed" : "Pending"}
                                                </span>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-muted">
                                    <CalendarBlank size={40} weight="duotone" className="text-faint mx-auto mb-3" />
                                    <p className="text-sm text-secondary mb-4">No upcoming bookings.</p>
                                    <Link href="/venues">
                                        <Button variant="outline" size="sm">Find a Court</Button>
                                    </Link>
                                </div>
                            )}
                            {upcomingBookings.length > 0 && (
                                <Link href="/bookings" className="block mt-5 text-center text-sm font-bold text-muted hover:text-primary transition-colors">
                                    View All Bookings
                                </Link>
                            )}
                        </div>

                        {/* Gamification Teaser */}
                        <Link href="/challenges" className="block">
                            <div className="bg-gradient-to-br from-surface-raised to-surface-base border border-default rounded-3xl p-6 relative overflow-hidden group hover:border-emerald-500/50 transition-colors cursor-pointer">
                                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                                    <Trophy size={128} weight="duotone" className="text-emerald-500" />
                                </div>
                                <div className="relative z-10">
                                    <h3 className="text-xl font-bold text-primary mb-2 flex items-center gap-2">
                                        <Trophy size={20} weight="fill" className="text-emerald-500" />
                                        Achievements & Challenges
                                    </h3>
                                    <p className="text-secondary mb-4 max-w-md">
                                        Complete daily challenges to earn XP, unlock badges, and climb the tiers.
                                    </p>
                                    <div className="flex items-center gap-4 text-sm font-bold text-emerald-500 group-hover:translate-x-1 transition-transform">
                                        View All Challenges <CaretRight size={16} weight="bold" />
                                    </div>
                                </div>
                            </div>
                        </Link>

                        {/* Recent Activity */}
                        <div className="bg-surface-raised dark:bg-surface-raised/50 border border-default rounded-3xl p-6 backdrop-blur-sm">
                            <h3 className="text-lg font-bold text-primary mb-5 flex items-center gap-2">
                                <Pulse size={20} weight="bold" className="text-secondary" /> Recent Activity
                            </h3>

                            <div className="space-y-3">
                                {bookings.length > 0 ? (
                                    bookings.map((booking) => (
                                        <Link href={`/bookings/${booking.id}`} key={booking.id} className="block">
                                            <div className="flex items-center gap-4 p-4 rounded-2xl bg-surface-base/80 dark:bg-surface-base/40 border border-default hover:bg-surface-overlay dark:hover:bg-surface-overlay/50 transition-colors group">
                                                <div className="w-10 h-10 bg-surface-overlay rounded-xl flex items-center justify-center text-muted text-[10px] font-bold uppercase shrink-0 group-hover:bg-surface-overlay transition-colors">
                                                    {fmtMonthAbbr(booking.start_time)} {fmtDayNum(booking.start_time)}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="text-primary font-medium text-sm truncate group-hover:text-emerald-400 transition-colors">
                                                        {booking.court?.venue_name || "Venue"}
                                                    </h4>
                                                    <p className="text-xs text-muted truncate">
                                                        {booking.court?.name} · {booking.court?.sport_type?.name || booking.sport || "Sport"}
                                                    </p>
                                                </div>
                                                <div className="text-right shrink-0">
                                                    <p className="text-primary font-bold text-sm">LKR {booking.total_price.toLocaleString()}</p>
                                                </div>
                                            </div>
                                        </Link>
                                    ))
                                ) : (
                                    <div className="text-center py-8 text-muted">
                                        <p>No recent activity.</p>
                                    </div>
                                )}
                            </div>
                            {bookings.length > 0 && (
                                <Link href="/bookings" className="block mt-5 text-center text-sm font-bold text-secondary hover:text-primary transition-colors">
                                    View All Bookings
                                </Link>
                            )}
                        </div>

                        {/* Bio */}
                        {user.bio && (
                            <div className="bg-surface-raised/50 border border-default rounded-3xl p-6 backdrop-blur-sm">
                                <h3 className="text-lg font-bold text-primary mb-4">About Me</h3>
                                <p className="text-secondary leading-relaxed">{user.bio}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </main>
    );
}

function StatsCard({ icon, label, value, subtext, fullWidth }: any) {
    return (
        <div className={`bg-surface-raised/50 border border-default rounded-2xl p-5 hover:bg-surface-overlay/50 transition-colors ${fullWidth ? 'col-span-2' : ''}`}>
            <div className="flex items-start justify-between mb-3">
                <div className="p-2 bg-tint-hover rounded-lg">{icon}</div>
            </div>
            <p className="text-2xl font-bold text-primary mb-0.5">{value}</p>
            <p className="text-xs font-bold text-primary mb-0.5 opacity-80">{label}</p>
            <p className="text-xs text-muted uppercase tracking-wide">{subtext}</p>
        </div>
    )
}

function MenuLink({ href, icon, label }: any) {
    return (
        <Link href={href} className="flex items-center justify-between p-4 rounded-2xl hover:bg-tint-hover text-secondary hover:text-primary transition-colors group">
            <span className="flex items-center gap-3 font-medium">
                <span className="group-hover:text-emerald-500 transition-colors">{icon}</span>
                {label}
            </span>
            <CaretRight size={16} weight="bold" className="opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
        </Link>
    )
}
