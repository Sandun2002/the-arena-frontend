
import apiClient from "./apiClient";
import { Venue, Court, VenueManager, ManagerInvitation } from "@/types";

export const venueApiService = {
    // === Venue CRUD ===
    createVenue: async (data: Partial<Venue>) => {
        const response = await apiClient.post<Venue>('/venues', data);
        return response.data;
    },

    updateVenue: async (id: string, data: Partial<Venue>) => {
        const response = await apiClient.put<Venue>(`/venues/${id}`, data);
        return response.data;
    },

    deleteVenue: async (id: string) => {
        await apiClient.delete(`/venues/${id}`);
    },

    getVenue: async (id: string) => {
        const response = await apiClient.get<Venue>(`/venues/${id}`);
        return response.data;
    },

    // === Registration Documents ===
    uploadBRDocument: async (file: File) => {
        const formData = new FormData();
        formData.append('file', file);
        const response = await apiClient.post(`/venues/upload-br-document`, formData);
        return response.data;
    },

    // === Court Management ===
    addCourt: async (venueId: string, data: Partial<Court>) => {
        const response = await apiClient.post<Court>(`/venues/${venueId}/courts`, data);
        return response.data;
    },

    updateCourt: async (venueId: string, courtId: string, data: Partial<Court>) => {
        const response = await apiClient.put<Court>(`/venues/${venueId}/courts/${courtId}`, data);
        return response.data;
    },

    deleteCourt: async (venueId: string, courtId: string) => {
        await apiClient.delete(`/venues/${venueId}/courts/${courtId}`);
    },

    // === Manager Management ===
    addManager: async (venueId: string, email: string) => {
        await apiClient.post(`/venues/${venueId}/managers`, {}, { params: { email } });
    },

    removeManager: async (venueId: string, userId: string) => {
        await apiClient.delete(`/venues/${venueId}/managers/${userId}`);
    },

    getManagers: async (venueId: string) => {
        const response = await apiClient.get<VenueManager[]>(`/venues/${venueId}/managers`);
        return response.data;
    },

    // === Invitations ===
    getInvitations: async (venueId: string) => {
        const response = await apiClient.get<ManagerInvitation[]>(`/venues/${venueId}/invitations`);
        return response.data;
    },

    revokeInvitation: async (venueId: string, invitationId: string) => {
        await apiClient.delete(`/venues/${venueId}/invitations/${invitationId}`);
    }
};
