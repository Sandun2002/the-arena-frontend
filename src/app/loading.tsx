export default function Loading() {
    return (
        <div className="min-h-screen bg-surface-base animate-pulse">
            {/* Hero skeleton */}
            <div className="w-full pt-24 pb-10 px-4 flex flex-col items-center gap-6">
                {/* Carousel card skeletons */}
                <div className="relative w-full max-w-[1100px] h-[240px] md:h-[340px] flex items-center justify-center gap-4 overflow-hidden">
                    <div className="absolute left-1/2 -translate-x-1/2 w-[min(400px,82vw)] h-full rounded-2xl bg-surface-raised border border-default/40" />
                    <div className="absolute left-1/2 -translate-x-[calc(50%+210px)] w-[min(400px,82vw)] h-full rounded-2xl bg-surface-raised/50 border border-default/20 scale-90 opacity-50 hidden md:block" />
                    <div className="absolute left-1/2 translate-x-[calc(-50%+210px)] w-[min(400px,82vw)] h-full rounded-2xl bg-surface-raised/50 border border-default/20 scale-90 opacity-50 hidden md:block" />
                </div>

                {/* Dot indicators */}
                <div className="flex gap-1.5">
                    <span className="w-5 h-[3px] rounded-full bg-surface-raised" />
                    <span className="w-[3px] h-[3px] rounded-full bg-surface-raised" />
                    <span className="w-[3px] h-[3px] rounded-full bg-surface-raised" />
                </div>

                {/* Heading skeleton */}
                <div className="flex flex-col items-center gap-3 mt-2">
                    <div className="h-8 w-64 md:w-96 rounded-lg bg-surface-raised" />
                    <div className="h-4 w-48 md:w-72 rounded-lg bg-surface-raised/60" />
                </div>

                {/* CTA button skeleton */}
                <div className="h-14 w-56 rounded-full bg-surface-raised mt-4" />
            </div>

            {/* Section block skeletons */}
            <div className="max-w-6xl mx-auto px-4 pb-16 space-y-10">
                <div className="h-5 w-40 rounded-lg bg-surface-raised" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-64 rounded-3xl bg-surface-raised border border-default/30" />
                    ))}
                </div>
            </div>
        </div>
    );
}
