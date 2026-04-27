
import { Loader2 } from "lucide-react";

export default function Loading() {
    return (
        <div className="min-h-screen bg-surface-base flex flex-col items-center justify-center p-4">
            <div className="w-16 h-16 bg-surface-raised rounded-2xl flex items-center justify-center mb-4 animate-pulse border border-default">
                <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
            </div>
            <p className="text-muted text-sm font-medium animate-pulse">Loading Arena...</p>
        </div>
    );
}
