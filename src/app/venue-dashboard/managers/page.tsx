
"use client";

import { useEffect, useState } from "react";
import { Users, UserPlus, Mail, Trash2, Shield, Loader2, XCircle } from "lucide-react";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import { useAuth } from "@/services/authContext";
import { venueApiService } from "@/services/venueApiService";
import { VenueManager, ManagerInvitation } from "@/types";
import { useToast } from "@/components/ui/Toast";
import { useVenue } from "@/components/venue/VenueContext";
import { format } from "date-fns";

// Internal Component for the Invite Form
function InviteManagerForm({ venueId, onClose, onSuccess }: { venueId: string, onClose: () => void, onSuccess: () => void }) {
    const { addToast } = useToast();
    const [email, setEmail] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await venueApiService.addManager(venueId, email); // Using addManager which triggers invite
            addToast("Invitation sent successfully", "success");
            onSuccess();
        } catch (error) {
            console.error(error);
            addToast("Failed to send invitation", "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-500 uppercase">Email Address</label>
                <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-black/50 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:border-emerald-500 focus:outline-none transition-colors"
                    placeholder="manager@example.com"
                />
                <p className="text-xs text-zinc-500">
                    They will receive an email with instructions to join your venue.
                </p>
            </div>

            <div className="flex gap-3 pt-4 border-t border-zinc-800">
                <Button type="button" variant="ghost" onClick={onClose} className="flex-1">Cancel</Button>
                <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-black font-bold"
                >
                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "Send Invitation"}
                </Button>
            </div>
        </form>
    );
}

export default function ManagersPage() {
    const { user } = useAuth();
    const { currentVenue } = useVenue();
    const { addToast } = useToast();

    const [managers, setManagers] = useState<VenueManager[]>([]);
    const [invitations, setInvitations] = useState<ManagerInvitation[]>([]);
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
            const [managersData, invitationsData] = await Promise.all([
                venueApiService.getManagers(currentVenue.id),
                venueApiService.getInvitations(currentVenue.id)
            ]);
            setManagers(managersData);
            setInvitations(invitationsData);
        } catch (error) {
            console.error(error);
            // Fallback for mock/empty state if API fails
            setManagers([]);
            setInvitations([]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleRevoke = async (inviteId: string) => {
        if (!currentVenue) return;
        if (confirm("Revoke this invitation?")) {
            try {
                await venueApiService.revokeInvitation(currentVenue.id, inviteId);
                addToast("Invitation revoked", "success");
                loadData();
            } catch (error) {
                addToast("Failed to revoke invitation", "error");
            }
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
    }

    if (!user) return null;

    if (!currentVenue) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] text-center pt-24">
                <Users className="w-12 h-12 text-zinc-600 mb-4" />
                <h2 className="text-xl font-bold text-white mb-2">No Venue Selected</h2>
                <p className="text-zinc-400">Please select a venue to manage staff.</p>
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-black pt-24 pb-12 px-4">
            {/* Background Effects */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-20 left-1/4 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[150px]" />
            </div>

            <div className="container mx-auto max-w-4xl relative z-10">

                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2">Venue Staff</h1>
                        <p className="text-zinc-400">Manage access to <span className="text-emerald-500">{currentVenue.name}</span> dashboard.</p>
                    </div>

                    <div className="flex items-center gap-4">
                        <Button onClick={() => setIsInviteModalOpen(true)} className="bg-emerald-500 hover:bg-emerald-400 text-black font-bold h-10 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                            <UserPlus className="w-4 h-4 mr-2" /> Invite Manager
                        </Button>
                    </div>
                </div>

                {/* Pending Invitations */}
                <div className="mb-8">
                    <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <Mail className="w-5 h-5 text-blue-500" /> Pending Invitations
                    </h2>
                    <div className="space-y-3">
                        {isLoading ? (
                            <div className="h-20 bg-zinc-900/30 rounded-xl animate-pulse" />
                        ) : invitations.length > 0 ? (
                            invitations.map((invite) => (
                                <div key={invite.id} className="bg-zinc-900/40 border border-zinc-800 rounded-xl p-4 flex justify-between items-center backdrop-blur-sm">
                                    <div>
                                        <p className="text-white font-medium">{invite.email}</p>
                                        <p className="text-xs text-zinc-500">Invited on {format(new Date(invite.created_at), "MMM dd, yyyy")}</p>
                                        <span className="inline-block mt-1 text-[10px] uppercase font-bold text-blue-500 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                                            {invite.status}
                                        </span>
                                    </div>
                                    <Button size="sm" variant="ghost" onClick={() => handleRevoke(invite.id)} className="text-zinc-400 hover:text-red-400 hover:bg-red-500/10">
                                        <Trash2 className="w-4 h-4 mr-2" /> Revoke
                                    </Button>
                                </div>
                            ))
                        ) : (
                            <div className="text-zinc-500 text-sm italic bg-zinc-900/20 p-4 rounded-xl border border-zinc-800 border-dashed">
                                No pending invitations.
                            </div>
                        )}
                    </div>
                </div>

                {/* Active Managers */}
                <div>
                    <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <Shield className="w-5 h-5 text-emerald-500" /> Active Managers
                    </h2>
                    <div className="space-y-3">
                        {isLoading ? (
                            <div className="h-20 bg-zinc-900/30 rounded-xl animate-pulse" />
                        ) : managers.length > 0 ? (
                            managers.map((manager) => (
                                <div key={manager.id} className="bg-zinc-900/40 border border-zinc-800 rounded-xl p-4 flex justify-between items-center backdrop-blur-sm">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-white font-bold border border-zinc-700">
                                            {manager.avatar ? (
                                                <img src={manager.avatar} alt={manager.name} className="w-full h-full object-cover rounded-full" />
                                            ) : (
                                                manager.name?.charAt(0) || "M"
                                            )}
                                        </div>
                                        <div>
                                            <p className="text-white font-medium">{manager.name}</p>
                                            <p className="text-xs text-zinc-500">{manager.email}</p>
                                            <span className="inline-block mt-1 text-[10px] uppercase font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                                                {manager.role}
                                            </span>
                                        </div>
                                    </div>
                                    {manager.user_id !== user.id && ( // Don't let owner remove themselves here (though backend handles that)
                                        <Button size="sm" variant="ghost" onClick={() => handleRemoveManager(manager.user_id)} className="text-zinc-400 hover:text-red-400 hover:bg-red-500/10">
                                            <Trash2 className="w-4 h-4 mr-2" /> Remove
                                        </Button>
                                    )}
                                </div>
                            ))
                        ) : (
                            <div className="bg-zinc-900/20 border border-zinc-800 border-dashed rounded-xl p-6 text-center text-zinc-500">
                                <p className="text-sm">
                                    No active managers found. Invite someone to help manage this venue.
                                </p>
                            </div>
                        )}
                    </div>
                </div>

            </div>

            <Modal isOpen={isInviteModalOpen} onClose={() => setIsInviteModalOpen(false)} title="Invite Manager">
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
