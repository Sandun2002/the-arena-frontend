
"use client";

import { useEffect, useState, useRef } from "react";
import { Plus, Trash2, Calendar, AlertTriangle, CloudRain, Hammer, XCircle } from "lucide-react";
import gsap from "gsap";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import ClosureFormModal from "@/components/venue/ClosureFormModal";
import { useAuth } from "@/services/authContext";
import { centerService } from "@/services/centerService";
import { Court } from "@/types";
import { useToast } from "@/components/ui/Toast";
import { useVenue } from "@/components/venue/VenueContext";
import { format } from "date-fns";

type Closure = any;

export default function ClosuresPage() {
    const { user } = useAuth();
    const { currentVenue } = useVenue();
    const { addToast } = useToast();
    const containerRef = useRef<HTMLDivElement>(null);

    const [closures, setClosures] = useState<Closure[]>([]);
    const [courts, setCourts] = useState<Court[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        if (currentVenue) {
            loadData();
        }
    }, [currentVenue]);

    const loadData = async () => {
        if (!currentVenue) return;
        setIsLoading(true);
        try {
            const [closuresData, blockedData, courtsData] = await Promise.all([
                centerService.getClosures(currentVenue.id),
                centerService.getBlockedBookings(currentVenue.id),
                centerService.getCourts(currentVenue.id)
            ]);

            // Normalise venue closures
            const venueClosures = closuresData.map((c: any) => ({
                ...c,
                _type: "venue",
                displayDate: c.closure_date,
                displayTitle: c.reason || "Venue Closure",
            }));

            // Normalise blocked bookings (court closures)
            const courtBlocks = blockedData.map((b: any) => ({
                ...b,
                _type: "court",
                displayDate: b.start_time,
                displayTitle: b.reason || "Court Maintenance",
            }));

            setClosures([...venueClosures, ...courtBlocks]);
            setCourts(courtsData);
            animateCards();
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const animateCards = () => {
        const ctx = gsap.context(() => {
            gsap.fromTo(".closure-card",
                { x: -20, opacity: 0 },
                { x: 0, opacity: 1, duration: 0.6, stagger: 0.1, ease: "power2.out" }
            );
        }, containerRef);
    };

    const handleDelete = async (closure: any) => {
        if (!confirm("Remove this closure?")) return;
        try {
            if (closure._type === "court") {
                await centerService.cancelBlockedBooking(closure.id);
            } else {
                await centerService.deleteClosure(closure.id, currentVenue!.id);
            }
            addToast("Closure removed", "success");
            loadData();
        } catch (error) {
            addToast("Failed to remove closure", "error");
        }
    };

    const getIcon = (type: string) => {
        switch (type) {
            case "maintenance": return <Hammer className="h-5 w-5 text-orange-500" />;
            case "weather": return <CloudRain className="h-5 w-5 text-blue-500" />;
            case "holiday": return <Calendar className="h-5 w-5 text-purple-500" />;
            default: return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
        }
    }

    if (!user) return null;

    if (!currentVenue) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
                <XCircle className="w-12 h-12 text-zinc-600 mb-4" />
                <h2 className="text-xl font-bold text-white mb-2">No Venue Selected</h2>
                <p className="text-zinc-400">Please select a venue to manage closures.</p>
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-black pt-24 pb-20 relative overflow-hidden" ref={containerRef}>
            {/* Background Effects */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-orange-500/5 rounded-full blur-[150px]" />
            </div>

            <div className="container mx-auto px-4 max-w-5xl relative z-10">

                <div className="flex justify-between items-end mb-12">
                    <div>
                        <h1 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tight mb-2">
                            <span className="text-transparent bg-gradient-to-r from-orange-400 to-red-600 bg-clip-text">Closures</span>
                        </h1>
                        <p className="text-zinc-400">Schedule maintenance, holidays, or unexpected closures for {currentVenue.name}.</p>
                    </div>
                    <Button onClick={() => setIsModalOpen(true)} className="bg-red-600 text-white hover:bg-red-500 shadow-[0_0_20px_rgba(220,38,38,0.3)]">
                        <Plus className="mr-2 h-4 w-4" /> Add Closure
                    </Button>
                </div>

                <div className="space-y-4">
                    {isLoading ? (
                        [1, 2].map(i => <div key={i} className="h-32 bg-zinc-900/30 rounded-2xl animate-pulse" />)
                    ) : closures.length === 0 ? (
                        <div className="text-center py-12 bg-zinc-900/20 rounded-3xl border border-zinc-800 border-dashed">
                            <p className="text-zinc-500">No scheduled closures found.</p>
                        </div>
                    ) : (
                        closures.map(closure => (
                            <div key={closure.id} className="closure-card bg-zinc-900/40 border border-zinc-800 rounded-2xl p-6 backdrop-blur-sm flex flex-col md:flex-row items-center justify-between gap-6 group hover:border-orange-500/30 transition-all">
                                <div className="flex items-center gap-6 w-full md:w-auto">
                                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center shrink-0 bg-zinc-800/50`}>
                                        {getIcon(closure.type)}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-white text-lg mb-1">{closure.displayTitle}</h3>
                                        <div className="flex flex-wrap gap-4 text-sm text-zinc-400">
                                            <span className="flex items-center gap-2">
                                                <Calendar className="h-4 w-4 text-zinc-600" />
                                                {closure._type === "court"
                                                    ? `${format(new Date(closure.start_time), "MMM dd, yyyy h:mm a")} – ${format(new Date(closure.end_time), "h:mm a")}`
                                                    : (closure.closure_date ? format(new Date(closure.closure_date), "MMM dd, yyyy") : "Unknown Date")
                                                }
                                            </span>
                                            <span className="hidden md:inline text-zinc-700">|</span>
                                            <span>{closure.reason || "Scheduled Closure"}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end">
                                    <div className="text-right">
                                        <p className="text-xs font-bold text-zinc-500 uppercase mb-1">Affected Courts</p>
                                        <div className="flex flex-wrap justify-end gap-2">
                                            {closure._type === "court" ? (
                                                <span className="bg-orange-500/10 text-orange-400 text-xs px-2 py-1 rounded border border-orange-500/20">
                                                    {closure.court_name || "Court"}
                                                </span>
                                            ) : (
                                                <span className="bg-red-500/10 text-red-500 text-xs px-2 py-1 rounded border border-red-500/20">All Venue</span>
                                            )}
                                        </div>
                                    </div>
                                    <Button onClick={() => handleDelete(closure)} variant="outline" className="border-red-900/30 text-red-500 hover:bg-red-900/10 hover:border-red-900/50 px-4 py-2 h-auto rounded-xl flex items-center gap-2">
                                        <Trash2 className="h-4 w-4" />
                                        <span className="text-sm font-bold">Cancel Closure</span>
                                    </Button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div className="mt-8 p-6 rounded-2xl bg-zinc-900/20 border border-dashed border-zinc-800 text-center">
                    <p className="text-sm text-zinc-500">
                        Closures will automatically block the calendar preventing any new bookings. <br />
                        Existing bookings during this period will be flagged for cancellation/refund.
                    </p>
                </div>

            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Schedule Closure">
                <ClosureFormModal
                    venueId={currentVenue.id}
                    courts={courts}
                    onClose={() => setIsModalOpen(false)}
                    onSuccess={() => {
                        loadData();
                        setIsModalOpen(false);
                    }}
                />
            </Modal>
        </main>
    );
}
