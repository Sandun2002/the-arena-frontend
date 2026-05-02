"use client";

import { useEffect, useState } from "react";
import { Users, UserPlus, Trash, Shield, CircleNotch } from "@phosphor-icons/react";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import { useAuth } from "@/services/authContext";
import { venueApiService } from "@/services/venueApiService";
import { VenueManager } from "@/types";
import { useToast } from "@/components/ui/Toast";
import { useVenue } from "@/components/venue/VenueContext";

function InviteManagerForm({ venueId, onClose, onSuccess }: { venueId: string, onClose: () => void, onSuccess: () => void }) {
    const { addToast } = useToast();
    const [email, setEmail] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await venueApiService.addManager(venueId, email);
            addToast("Manager added successfully", "success");
            onSuccess();
        } catch (error: any) {
            console.error(error);
            const detail = error?.response?.data?.detail || "Failed to add manager";
            addToast(detail, "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
                <label className="text-xs font-bold text-muted uppercase">Email Address</label>
                <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-surface-base/50 border border-subtle rounded-xl px-4 py-3 text-primary focus:border-emerald-500 focus:outline-none transition-colors"
                    placeholder="manager@example.com"
                />
                <p className="text-xs text-muted">
                    The user must already have an Arena account before they can be added.
                </p>
            </div>

            <div className="flex gap-3 pt-4 border-t border-default">
                <Button type="button" variant="ghost" onClick={onClose} className="flex-1">Cancel</Button>
                <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-black font-bold"
                >
                    {isSubmitting ? <CircleNotch size={16} weight="bold" className="animate-spin mx-auto" /> : "Add Manager"}
                </Button>
            </div>
        </form>
    );
}

export default function ManagersPage() {
    const { user, isVenueOwner } = useAuth();
    const { currentVenue } = useVenue();
    const { addToast } = useToast();

    const [managers, setManagers] = useState<VenueManager[]>([]);
    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (currentVenue) {
            loadData();
        }
    }, [currentVenue]);

    const loadData = async () => {
        if (!currentVenue) return;
        setIsLoading(true);
        try {
            const managersData = await venueApiService.getManagers(currentVenue.id);
            setManagers(managersData);
        } catch (error) {
            console.error(error);
            setManagers([]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleRemoveManager = async (userId: string) => {
        if (!currentVenue) return;
        if (confirm("Remove this manager from the venue?")) {
            try {
                await venueApiService.removeManager(currentVenue.id, userId);
                addToast("Manager removed", "success");
                loadData();
            } catch (error) {
                addToast("Failed to remove manager", "error");
            }
        }
    };

    // Only owners can access this page — hide it entirely for managers
    if (!user || !isVenueOwner) return null;


    if (!currentVenue) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] text-center pt-24">
                <Users size={48} weight="duotone" className="text-faint mb-4" />
                <h2 className="text-xl font-bold text-primary mb-2">No Venue Selected</h2>
                <p className="text-secondary">Please select a venue to manage staff.</p>
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-surface-base pt-24 pb-12 px-4">
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-20 left-1/4 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[150px]" />
            </div>

            <div className="container mx-auto max-w-4xl relative z-10">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-primary mb-2">Venue Staff</h1>
                        <p className="text-secondary">Manage access to <span className="text-emerald-500">{currentVenue.name}</span> dashboard.</p>
                    </div>

                    <div className="flex items-center gap-4">
                        <Button onClick={() => setIsInviteModalOpen(true)} className="bg-emerald-500 hover:bg-emerald-400 text-black font-bold h-10 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                            <UserPlus size={16} weight="bold" className="mr-2" /> Add Manager
                        </Button>
                    </div>
                </div>

                <div>
                    <h2 className="text-lg font-bold text-primary mb-4 flex items-center gap-2">
                        <Shield size={20} weight="fill" className="text-emerald-500" /> Active Managers
                    </h2>
                    <div className="space-y-3">
                        {isLoading ? (
                            <div className="h-20 bg-surface-raised/30 rounded-xl animate-pulse" />
                        ) : managers.length > 0 ? (
                            managers.map((manager) => (
                                <div key={manager.id} className="bg-surface-raised/40 border border-default rounded-xl p-4 flex justify-between items-center backdrop-blur-sm">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-surface-overlay flex items-center justify-center text-primary font-bold border border-subtle">
                                            {manager.avatar ? (
                                                <img src={manager.avatar} alt={manager.name} className="w-full h-full object-cover rounded-full" />
                                            ) : (
                                                manager.name?.charAt(0) || "M"
                                            )}
                                        </div>
                                        <div>
                                            <p className="text-primary font-medium">{manager.name}</p>
                                            <p className="text-xs text-muted">{manager.email}</p>
                                            <span className="inline-block mt-1 text-[10px] uppercase font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                                                {manager.role}
                                            </span>
                                        </div>
                                    </div>
                                    {manager.user_id !== user.id && (
                                        <Button size="sm" variant="ghost" onClick={() => handleRemoveManager(manager.user_id)} className="text-secondary hover:text-red-400 hover:bg-red-500/10">
                                            <Trash size={16} weight="bold" className="mr-2" /> Remove
                                        </Button>
                                    )}
                                </div>
                            ))
                        ) : (
                            <div className="bg-surface-raised/20 border border-default border-dashed rounded-xl p-6 text-center text-muted">
                                <p className="text-sm">No active managers found. Add someone to help manage this venue.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <Modal isOpen={isInviteModalOpen} onClose={() => setIsInviteModalOpen(false)} title="Add Manager">
                <InviteManagerForm
                    venueId={currentVenue.id}
                    onClose={() => setIsInviteModalOpen(false)}
                    onSuccess={() => {
                        loadData();
                        setIsInviteModalOpen(false);
                    }}
                />
            </Modal>
        </main>
    );
}
