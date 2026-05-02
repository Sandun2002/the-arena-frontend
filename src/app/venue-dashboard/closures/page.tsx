
"use client";

import { useEffect, useState, useRef } from "react";
import { Plus, Trash, Calendar, Warning, CloudRain, Hammer, XCircle } from "@phosphor-icons/react";
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
import { fmtTime, fmtDateShort } from "@/lib/utils";

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

    const getIcon = (closure: any) => {
        if (closure._type === "court") return <Hammer size={20} weight="fill" className="text-amber-500" />;
        const reason = (closure.reason || "").toLowerCase();
        if (reason.includes("holiday") || reason.includes("public")) return <Calendar size={20} weight="fill" className="text-purple-500" />;
        if (reason.includes("weather") || reason.includes("rain")) return <CloudRain size={20} weight="fill" className="text-blue-500" />;
        return <Warning size={20} weight="fill" className="text-red-500" />;
    }

    if (!user) return null;

    if (!currentVenue) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
                <XCircle size={48} weight="duotone" className="text-faint mb-4" />
                <h2 className="text-xl font-bold text-primary mb-2">No Venue Selected</h2>
                <p className="text-secondary">Please select a venue to manage closures.</p>
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-surface-base pt-24 pb-20 relative overflow-hidden" ref={containerRef}>
            {/* Background Effects */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-orange-500/5 rounded-full blur-[150px]" />
            </div>

            <div className="container mx-auto px-4 max-w-5xl relative z-10">

                <div className="flex justify-between items-end mb-12">
                    <div>
                        <h1 className="text-3xl md:text-5xl font-black text-primary uppercase tracking-tight mb-2">
                            <span className="text-transparent bg-gradient-to-r from-orange-400 to-red-600 bg-clip-text">Closures</span>
                        </h1>
                        <p className="text-secondary">Schedule maintenance, holidays, or unexpected closures for {currentVenue.name}.</p>
                    </div>
                    <Button onClick={() => setIsModalOpen(true)} className="bg-red-600 text-primary hover:bg-red-500 shadow-[0_0_20px_rgba(220,38,38,0.3)]">
                        <Plus size={16} weight="bold" className="mr-2" /> Add Closure
                    </Button>
                </div>

                <div className="space-y-4">
                    {isLoading ? (
                        [1, 2].map(i => <div key={i} className="h-32 bg-surface-raised/30 rounded-2xl animate-pulse" />)
                    ) : closures.length === 0 ? (
                        <div className="text-center py-12 bg-surface-raised/20 rounded-3xl border border-default border-dashed">
                            <p className="text-muted">No scheduled closures found.</p>
                        </div>
                    ) : (
                        closures.map(closure => (
                            <div key={closure.id} className="closure-card bg-surface-raised/40 border border-default rounded-2xl p-6 backdrop-blur-sm flex flex-col md:flex-row items-center justify-between gap-6 group hover:border-orange-500/30 transition-all">
                                <div className="flex items-center gap-6 w-full md:w-auto">
                                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center shrink-0 bg-surface-overlay/50`}>
                                        {getIcon(closure)}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-primary text-lg mb-1">{closure.displayTitle}</h3>
                                        <div className="flex flex-wrap gap-4 text-sm text-secondary">
                                            <span className="flex items-center gap-2">
                                                <Calendar size={16} weight="duotone" className="text-faint" />
                                                {closure._type === "court"
                                                    ? `${fmtDateShort(closure.start_time)} ${fmtTime(closure.start_time)} – ${fmtTime(closure.end_time)}`
                                                    : (closure.closure_date ? format(new Date(closure.closure_date), "MMM dd, yyyy") : "Unknown Date")
                                                }
                                            </span>
                                            <span className="hidden md:inline text-faint">|</span>
                                            <span>{closure.reason || "Scheduled Closure"}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end">
                                    <div className="text-right">
                                        <p className="text-xs font-bold text-muted uppercase mb-1">Affected Courts</p>
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
                                        <Trash size={16} weight="bold" />
                                        <span className="text-sm font-bold">Cancel Closure</span>
                                    </Button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div className="mt-8 p-6 rounded-2xl bg-surface-raised/20 border border-dashed border-default text-center">
                    <p className="text-sm text-muted">
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
