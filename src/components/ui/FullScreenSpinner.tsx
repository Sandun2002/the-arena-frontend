export default function FullScreenSpinner() {
    return (
        <div className="fixed inset-0 bg-black flex items-center justify-center z-[100]">
            <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        </div>
    );
}
