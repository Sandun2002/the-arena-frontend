export default function FullScreenSpinner() {
    return (
        <div className="fixed inset-0 bg-surface-base z-[100] animate-pulse overflow-hidden">
            {/* Nav bar skeleton */}
            <div className="h-16 border-b border-default/40 px-6 flex items-center justify-between">
                <div className="h-6 w-32 rounded-lg bg-surface-raised" />
                <div className="flex gap-3">
                    <div className="h-8 w-20 rounded-lg bg-surface-raised hidden md:block" />
                    <div className="h-8 w-8 rounded-full bg-surface-raised" />
                </div>
            </div>
            {/* Hero area */}
            <div className="flex flex-col items-center pt-16 px-4 gap-6">
                <div className="w-full max-w-[500px] h-[220px] rounded-2xl bg-surface-raised border border-default/30" />
                <div className="h-7 w-72 rounded-lg bg-surface-raised" />
                <div className="h-4 w-52 rounded-lg bg-surface-raised/60" />
                <div className="h-12 w-48 rounded-full bg-surface-raised" />
            </div>
        </div>
    );
}
