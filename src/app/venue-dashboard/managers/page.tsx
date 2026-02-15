
"use client";

import { useEffect, useState } from "react";
import { Users, UserPlus, Mail, Clock, CheckCircle, XCircle, Trash2, Shield, Loader2 } from "lucide-react";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import { useAuth } from "@/services/authContext";
import { venueService } from "@/services/venueService";
import { Venue, ManagerInvitation } from "@/types";
import { useToast } from "@/components/ui/Toast";
import { format } from "date-fns";

export default function ManagersPage() {
    const { user, isVenueOwner } = useAuth();
    const { addToast } = useToast();
    const [venues, setVenues] = useState<Venue[]>([]);
    const [selectedVenueId, setSelectedVenueId] = useState<string>("");
    const [managers, setManagers] = useState<any[]>([]); // Using any for mock user objects with roles
    const [invitations, setInvitations] = useState<ManagerInvitation[]>([]);
    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (user && isVenueOwner) {
            venueService.getMyVenues(user.id).then((data) => {
                setVenues(data);
                if (data.length > 0) setSelectedVenueId(data[0].id);
            });
        }
    }, [user, isVenueOwner]);

    const loadData = async () => {
        setIsLoading(true);
        // In a real app, these would be separate endpoints
        // For now, we'll just simulate fetching managers for the venue
        // And get invitations
        const invites = await venueService.getVenueInvitations(selectedVenueId);
        setInvitations(invites);
        setIsLoading(false);
    };

    useEffect(() => {
        if (selectedVenueId) {
            loadData();
        }
    }, [selectedVenueId]);

    const handleRevoke = async (inviteId: string) => {
        if (confirm("Revoke this invitation?")) {
            await venueService.respondToInvitation(inviteId, "declined"); // Re-using respond logic for revoke in mock
            addToast("Invitation revoked", "success");
            loadData();
        }
    };

    if (!user || !isVenueOwner) return <div className="p-8 text-center text-zinc-500">Access Denied</div>;

    return (
        <main className="min-h-screen bg-black pt-24 pb-12 px-4">
            <div className="container mx-auto max-w-4xl">

                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2">Venue Staff</h1>
                        <p className="text-zinc-400">Manage access to your venue dashboard.</p>
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
                        <Button onClick={() => setIsInviteModalOpen(true)} className="bg-emerald-500 hover:bg-emerald-400 text-black font-bold h-10">
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
                        {invitations.filter(i => i.status === "pending").length > 0 ? (
                            invitations.filter(i => i.status === "pending").map((invite) => (
                                <div key={invite.id} className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 flex justify-between items-center">
                                    <div>
                                        <p className="text-white font-medium">{invite.email}</p>
                                        <p className="text-xs text-zinc-500">Invited on {format(new Date(invite.created_at), "MMM dd, yyyy")}</p>
                                    </div>
                                    <Button size="sm" variant="ghost" onClick={() => handleRevoke(invite.id)} className="text-zinc-400 hover:text-red-400">
                                        <Trash2 className="w-4 h-4 mr-2" /> Revoke
                                    </Button>
                                </div>
                            ))
                        ) : (
                            <p className="text-zinc-500 text-sm italic">No pending invitations.</p>
                        )}
                    </div>
                </div>

                {/* Active Managers (Mocked List for now as we don't have a backend returning linked users yet) */}
                <div>
                    <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <Shield className="w-5 h-5 text-emerald-500" /> Active Managers
                    </h2>
                    <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 text-center text-zinc-500">
                        <p className="text-sm">
                            Active managers will appear here once they accept your invitation.
                        </p>
                    </div>
                </div>

            </div>

            <Modal isOpen={isInviteModalOpen} onClose={() => setIsInviteModalOpen(false)} title="Invite Manager">
                <InviteManagerForm
                    venueId={selectedVenueId}
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

function InviteManagerForm({ venueId, onClose, onSuccess }: any) {
    const { addToast } = useToast();
    const [email, setEmail] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await venueService.inviteManager(venueId, email);
            addToast("Invitation sent successfully", "success");
            onSuccess();
        } catch (error) {
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
