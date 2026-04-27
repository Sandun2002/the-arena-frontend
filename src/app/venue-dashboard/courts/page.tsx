
"use client";

import { useEffect, useState } from "react";
import { Plus, Edit2, Trash2, MapPin, Building2, User, DollarSign, Layers } from "lucide-react";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import CourtFormModal from "@/components/venue/CourtFormModal";
import { useAuth } from "@/services/authContext";
import { centerService } from "@/services/centerService";
import { venueApiService } from "@/services/venueApiService";
import { Court } from "@/types";
import { useToast } from "@/components/ui/Toast";
import { useVenue } from "@/components/venue/VenueContext";

export default function CourtsPage() {
    const { user } = useAuth();
    const { currentVenue } = useVenue();
    const { addToast } = useToast();

    const [courts, setCourts] = useState<Court[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCourt, setEditingCourt] = useState<Court | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const loadCourts = async () => {
        if (!currentVenue) return;
        setIsLoading(true);
        try {
            const data = await centerService.getCourts(currentVenue.id);
            setCourts(data);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (currentVenue) {
            loadCourts();
        }
    }, [currentVenue]);

    const handleCreate = () => {
        setEditingCourt(null);
        setIsModalOpen(true);
    };

    const handleEdit = (court: Court) => {
        setEditingCourt(court);
        setIsModalOpen(true);
    };

    const handleDelete = async (courtId: string) => {
        if (!currentVenue) return;
        if (confirm("Are you sure you want to delete this court? This cannot be undone.")) {
            try {
                await venueApiService.deleteCourt(currentVenue.id, courtId);
                addToast("Court deleted successfully", "success");
                loadCourts();
            } catch (error) {
                console.error(error);
                addToast("Failed to delete court", "error");
            }
        }
    };

    const handleSuccess = () => {
        loadCourts();
        setIsModalOpen(false);
    };

    if (!user) return null;

    if (!currentVenue) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
                <Building2 className="w-12 h-12 text-faint mb-4" />
                <h2 className="text-xl font-bold text-primary mb-2">No Venue Selected</h2>
                <p className="text-secondary">Please select a venue to manage courts.</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-primary uppercase tracking-tight mb-2">Courts & Facilities</h1>
                    <p className="text-secondary">Manage pitch details, pricing, and availability for {currentVenue.name}.</p>
                </div>

                <Button onClick={handleCreate} className="bg-emerald-500 hover:bg-emerald-400 text-black font-bold h-12 px-6 rounded-xl shadow-lg shadow-emerald-500/20 active:scale-95 transition-all">
                    <Plus className="w-5 h-5 mr-2" /> Add New Court
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {isLoading ? (
                    [1, 2, 3].map(i => <div key={i} className="h-72 bg-surface-raised/30 rounded-3xl animate-pulse border border-default" />)
                ) : courts.length > 0 ? (
                    courts.map((court) => (
                        <div key={court.id} className="bg-surface-raised/50 border border-default rounded-3xl overflow-hidden group hover:border-subtle hover:shadow-2xl hover:shadow-[var(--shadow-elevation)] transition-all duration-300 backdrop-blur-sm flex flex-col">
                            {/* Image Placeholder */}
                            <div className="h-48 bg-surface-base/50 relative overflow-hidden">
                                {court.cover_image ? (
                                    <img src={court.cover_image} alt={court.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                ) : (
                                    <div className="w-full h-full flex flex-col items-center justify-center text-faint bg-surface-raised/50 pattern-grid-lg">
                                        <Layers className="w-12 h-12 mb-2 opacity-50" />
                                        <span className="text-xs font-bold uppercase tracking-widest opacity-50">No Image</span>
                                    </div>
                                )}

                                {/* Actions Overlay */}
                                <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-200 translate-y-[-10px] group-hover:translate-y-0">
                                    <button onClick={() => handleEdit(court)} className="bg-surface-base/80 hover:bg-primary hover:text-inverted text-primary p-2 rounded-xl backdrop-blur-md transition-all">
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button onClick={() => handleDelete(court.id)} className="bg-surface-base/80 hover:bg-red-500 text-primary p-2 rounded-xl backdrop-blur-md transition-all">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>

                                {/* Badges */}
                                <div className="absolute bottom-3 left-3 flex gap-2">
                                    <div className="bg-surface-base/80 backdrop-blur-md text-primary text-[10px] font-bold px-2.5 py-1 rounded-lg uppercase tracking-wider border border-glass-border">
                                        {court.sport_type?.name || 'Sport'}
                                    </div>
                                    {court.is_indoor && (
                                        <div className="bg-blue-500/90 backdrop-blur-md text-primary text-[10px] font-bold px-2.5 py-1 rounded-lg uppercase tracking-wider">
                                            Indoor
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="p-6 flex flex-col flex-1">
                                <div className="mb-4">
                                    <h3 className="text-xl font-bold text-primary mb-1">{court.name}</h3>
                                    <p className="text-muted text-sm line-clamp-2">{court.description || "No description provided."}</p>
                                </div>

                                <div className="mt-auto space-y-3 pt-4 border-t border-default/50">
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-muted font-medium flex items-center gap-2">
                                            <div className="p-1 bg-emerald-500/10 rounded"><DollarSign className="w-3 h-3 text-emerald-500" /></div>
                                            Hourly Rate
                                        </span>
                                        <span className="text-primary font-bold bg-surface-overlay/50 px-2 py-1 rounded-lg">LKR {court.hourly_rate.toLocaleString()}</span>
                                    </div>
                                    {court.peak_hourly_rate != null && (
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-muted font-medium flex items-center gap-2">
                                                <div className="p-1 bg-amber-500/10 rounded"><DollarSign className="w-3 h-3 text-amber-500" /></div>
                                                Peak Rate
                                            </span>
                                            <span className="text-amber-400 font-bold bg-surface-overlay/50 px-2 py-1 rounded-lg">LKR {court.peak_hourly_rate.toLocaleString()}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="col-span-full py-16 text-center bg-surface-raised/20 rounded-3xl border border-default border-dashed flex flex-col items-center justify-center">
                        <div className="w-16 h-16 bg-surface-overlay/50 rounded-full flex items-center justify-center mb-4">
                            <Layers className="w-8 h-8 text-faint" />
                        </div>
                        <h3 className="text-xl font-bold text-primary mb-2">No courts added yet</h3>
                        <p className="text-muted mb-6 max-w-sm mx-auto">Add your first court or facility to start accepting bookings and managing your schedule.</p>
                        <Button onClick={handleCreate} className="bg-emerald-500 text-black font-bold h-12 px-8 rounded-xl">
                            Add First Court
                        </Button>
                    </div>
                )}
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingCourt ? "Edit Court Details" : "Add New Court"}>
                <CourtFormModal
                    venueId={currentVenue.id}
                    existingCourt={editingCourt}
                    onClose={() => setIsModalOpen(false)}
                    onSuccess={handleSuccess}
                />
            </Modal>
        </div>
    );
}
