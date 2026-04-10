"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { ArrowLeft, Trophy, Star, Target, Users, MapPin, CheckCircle, Lock } from "lucide-react";
import { useAuth } from "@/services/authContext";
import { playerService } from "@/services/playerService";
import { Challenge, UserAchievement } from "@/types";
import { gsap } from "gsap";
import { useRequireAuth, AuthLoadingSpinner } from "@/components/auth/RequireAuth";

export default function ChallengesPage() {
    const { user } = useAuth();
    const isAuthPending = useRequireAuth();
    const [gamification, setGamification] = useState<{ challenges: Challenge[], achievements: UserAchievement[] } | null>(null);
    const [freshXp, setFreshXp] = useState<number | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (user) {
            playerService.getChallenges().then(data => {
                setGamification(data);
            });
            playerService.getStats().then(stats => {
                setFreshXp(stats?.xp ?? null);
            });
        }
    }, [user]);

    useEffect(() => {
        if (gamification && containerRef.current) {
            gsap.fromTo(
                ".challenge-card",
                { y: 30, opacity: 0 },
                { y: 0, opacity: 1, stagger: 0.1, duration: 0.6, ease: "power2.out" }
            );
        }
    }, [gamification]);

    if (isAuthPending || !user) return <AuthLoadingSpinner />;

    const getIcon = (type: string) => {
        switch (type) {
            case "booking": return <Target className="w-5 h-5 text-blue-500" />;
            case "review": return <Star className="w-5 h-5 text-yellow-500" />;
            case "scout": return <MapPin className="w-5 h-5 text-red-500" />;
            case "social": return <Users className="w-5 h-5 text-purple-500" />;
            default: return <Trophy className="w-5 h-5 text-emerald-500" />;
        }
    };

    const getProgress = (challengeId: string | number) => {
        const achievement = gamification?.achievements.find(a => a.challenge_id === challengeId);
        if (!achievement) return 0;
        const challenge = gamification?.challenges.find(c => c.id === challengeId);
        if (!challenge) return 0;
        return Math.min(100, Math.round((achievement.progress / challenge.target_count) * 100));
    };

    const isCompleted = (challengeId: string | number) => {
        return gamification?.achievements.some(a => a.challenge_id === challengeId && a.is_completed);
    };

    return (
        <main className="min-h-screen bg-black pt-24 pb-12 px-4 selection:bg-emerald-500/30">
            <div className="container mx-auto max-w-4xl" ref={containerRef}>

                <div className="flex items-center justify-between mb-8">
                    <Link href="/profile" className="inline-flex items-center text-sm font-medium text-zinc-500 hover:text-white transition-colors group">
                        <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" /> Back to Profile
                    </Link>
                    <div className="bg-zinc-900 border border-zinc-800 px-4 py-1.5 rounded-full flex items-center gap-2">
                        <span className="text-zinc-400 text-xs font-bold uppercase tracking-wider">Total XP</span>
                        <span className="text-emerald-500 font-bold">{freshXp ?? user.xp ?? 0}</span>
                    </div>
                </div>

                <div className="mb-12 text-center">
                    <div className="inline-flex items-center justify-center p-4 bg-emerald-500/10 rounded-3xl mb-4 border border-emerald-500/20 shadow-[0_0_30px_rgba(16,185,129,0.1)]">
                        <Trophy className="w-12 h-12 text-emerald-500" />
                    </div>
                    <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">Challenges & Rewards</h1>
                    <p className="text-zinc-400 max-w-lg mx-auto">
                        Complete challenges to level up, earn badges, and unlock exclusive perks at your favorite venues.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    {gamification?.challenges.map((challenge) => {
                        const progress = getProgress(challenge.id);
                        const completed = isCompleted(challenge.id);
                        const achievement = gamification.achievements.find(a => a.challenge_id === challenge.id);
                        const currentCount = achievement?.progress || 0;

                        return (
                            <div
                                key={challenge.id}
                                className={`challenge-card relative overflow-hidden rounded-3xl border ${completed ? 'border-emerald-500/30 bg-emerald-900/10' : 'border-zinc-800 bg-zinc-900/50'} p-6 backdrop-blur-sm hover:bg-zinc-800/50 transition-colors group`}
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className={`p-3 rounded-2xl ${completed ? 'bg-emerald-500 text-black' : 'bg-zinc-800 text-zinc-400'}`}>
                                        {completed ? <CheckCircle className="w-6 h-6" /> : getIcon(challenge.type)}
                                    </div>
                                    <div className="text-right">
                                        <span className={`text-sm font-bold ${completed ? 'text-emerald-400' : 'text-emerald-500'}`}>
                                            +{challenge.xp_reward} XP
                                        </span>
                                    </div>
                                </div>

                                <h3 className="text-xl font-bold text-white mb-2">{challenge.title}</h3>
                                <p className="text-zinc-400 text-sm mb-6 h-10">{challenge.description}</p>

                                <div className="space-y-2">
                                    <div className="flex justify-between text-xs font-bold uppercase text-zinc-500">
                                        <span>Progress</span>
                                        <span>{currentCount} / {challenge.target_count}</span>
                                    </div>
                                    <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full transition-all duration-1000 ease-out ${completed ? 'bg-emerald-500' : 'bg-gradient-to-r from-emerald-600 to-emerald-400'}`}
                                            style={{ width: `${progress}%` }}
                                        ></div>
                                    </div>
                                </div>

                                {completed && (
                                    <div className="absolute inset-0 bg-gradient-to-t from-emerald-500/10 to-transparent pointer-events-none"></div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </main>
    );
}
