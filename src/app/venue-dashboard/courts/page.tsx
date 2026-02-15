
"use client";

import { useEffect, useState } from "react";
import { Plus, Edit2, Trash2, MapPin, Building2, User, DollarSign } from "lucide-react";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import CourtFormModal from "@/components/venue/CourtFormModal";
import { useAuth } from "@/services/authContext";
import { venueService } from "@/services/venueService";
import { Court, Venue } from "@/types";
import { useToast } from "@/components/ui/Toast";

export default function CourtsPage() {
    const { user } = useAuth();
    const { addToast } = useToast();
    const [venues, setVenues] = useState<Venue[]>([]);
    const [selectedVenueId, setSelectedVenueId] = useState<string>("");
    const [courts, setCourts] = useState<Court[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCourt, setEditingCourt] = useState<Court | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (user) {
            venueService.getMyVenues(user.id).then((data) => {
                setVenues(data);
                if (data.length > 0) {
                    setSelectedVenueId(data[0].id);
                }
            });
        }
    }, [user]);

    const loadCourts = async () => {
        setIsLoading(true);
        const data = await venueService.getCourts(selectedVenueId);
        setCourts(data);
        setIsLoading(false);
    };

    useEffect(() => {
        if (selectedVenueId) {
            loadCourts();
        }
    }, [selectedVenueId]);

    const handleCreate = () => {
        setEditingCourt(null);
        setIsModalOpen(true);
    };

    const handleEdit = (court: Court) => {
        setEditingCourt(court);
        setIsModalOpen(true);
    };

    const handleDelete = async (courtId: string) => {
        if (confirm("Are you sure you want to delete this court?")) {
            await venueService.deleteCourt(courtId);
            addToast("Court deleted", "success");
            loadCourts();
        }
    };

    const handleSuccess = () => {
        loadCourts();
        setIsModalOpen(false);
    };

    if (!user) return null;

    return (
        <main className="min-h-screen bg-black pt-24 pb-12 px-4">
            <div className="container mx-auto max-w-5xl">

                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2">Manage Courts</h1>
                        <p className="text-zinc-400">Add or edit courts, pitches, and facilities.</p>
                    </div>

                    <div className="flex items-center gap-4">
                        {venues.length > 1 && (
                            <select
                                value={selectedVenueId}
                                onChange={(e) => setSelectedVenueId(e.target.value)}
                                className="bg-zinc-900 border border-zinc-800 text-white rounded-lg px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
                            >
                                {venues.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                            </select>
                        )}
                        <Button onClick={handleCreate} className="bg-emerald-500 hover:bg-emerald-400 text-black font-bold h-10">
                            <Plus className="w-4 h-4 mr-2" /> Add Court
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {isLoading ? (
                        [1, 2, 3].map(i => <div key={i} className="h-64 bg-zinc-900/50 rounded-2xl animate-pulse" />)
                    ) : courts.length > 0 ? (
                        courts.map((court) => (
                            <div key={court.id} className="bg-zinc-900/50 border border-zinc-800 rounded-2xl overflow-hidden group hover:border-zinc-700 transition-colors">
                                {/* Image Placeholder */}
                                <div className="h-40 bg-zinc-800 relative">
                                    {court.images && court.images.length > 0 ? (
                                        <img src={court.images[0]} alt={court.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-zinc-600 bg-zinc-800">
                                            <Building2 className="w-12 h-12" />
                                        </div>
                                    )}
                                    <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Button size="sm" variant="ghost" className="bg-black/50 hover:bg-black/80 text-white h-8 w-8 p-0 border border-zinc-700" onClick={() => handleEdit(court)}>
                                            <Edit2 className="w-4 h-4" />
                                        </Button>
                                        <Button size="sm" variant="ghost" className="bg-black/50 hover:bg-red-500 text-white h-8 w-8 p-0 border border-zinc-700" onClick={() => handleDelete(court.id)}>
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                    <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs font-bold px-2 py-1 rounded">
                                        {court.sport_type}
                                    </div>
                                </div>

                                <div className="p-4">
                                    <h3 className="text-lg font-bold text-white mb-1">{court.name}</h3>
                                    <p className="text-zinc-500 text-sm mb-4 line-clamp-2">{court.description || "No description provided."}</p>

                                    <div className="flex flex-col gap-2 border-t border-zinc-800 pt-3">
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-zinc-500 flex items-center gap-2"><DollarSign className="w-4 h-4" /> Hourly Rate</span>
                                            <span className="text-white font-bold">LKR {court.hourly_rate.toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-zinc-500 flex items-center gap-2"><User className="w-4 h-4" /> Capacity</span>
                                            <span className="text-white font-bold">{court.capacity || "N/A"} players</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-full py-12 text-center bg-zinc-900/30 rounded-3xl border border-zinc-800">
                            <Building2 className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-white mb-2">No courts yet</h3>
                            <p className="text-zinc-500 mb-6">Add your first court to start accepting bookings.</p>
                            <Button onClick={handleCreate} className="bg-emerald-500 text-black font-bold">Add Court</Button>
                        </div>
                    )}
                </div>

            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingCourt ? "Edit Court" : "Add New Court"}>
                <CourtFormModal
                    venueId={selectedVenueId}
                    existingCourt={editingCourt}
                    onClose={() => setIsModalOpen(false)}
                    onSuccess={handleSuccess}
                />
            </Modal>
        </main>
    );
}
