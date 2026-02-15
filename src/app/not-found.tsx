
import Link from "next/link";
import { AlertCircle } from "lucide-react";
import Button from "@/components/ui/Button";

export default function NotFound() {
    return (
        <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4 text-center">
            <div className="bg-zinc-900/50 p-6 rounded-full border border-zinc-800 mb-6">
                <AlertCircle className="w-12 h-12 text-zinc-500" />
            </div>
            <h1 className="text-4xl font-bold text-white mb-2">Page Not Found</h1>
            The page you are looking for doesn&apos;t exist or has been moved.
            <Link href="/">
                <Button className="bg-emerald-500 text-black font-bold h-12 px-8">Return Home</Button>
            </Link>
        </div>
    );
}
