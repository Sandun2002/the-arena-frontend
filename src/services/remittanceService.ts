import apiClient from "./apiClient";

export type RemittanceStatus = "open" | "submitted" | "confirmed" | "rejected" | "settled_via_card";

export interface CashRemittance {
  id: string;
  remittance_reference: string;
  venue_id: string;
  venue_name: string | null;
  period_start: string;
  period_end: string;
  total_amount: number;
  total_bookings: number;
  status: RemittanceStatus;
  slip_url: string | null;
  bank_reference: string | null;
  transfer_date: string | null;
  submitted_at: string | null;
  submitted_by_id: string | null;
  confirmed_at: string | null;
  confirmed_by_admin_id: string | null;
  rejected_at: string | null;
  rejected_by_admin_id: string | null;
  rejection_reason: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface CashRemittanceListResponse {
  items: CashRemittance[];
  total: number;
  page: number;
  per_page: number;
}

export interface VenueRemittanceSummary {
  cash_commission_balance: number;
  open_count: number;
  open_total: number;
  submitted_count: number;
  submitted_total: number;
  confirmed_count: number;
  confirmed_total: number;
  rejected_count: number;
  rejected_total: number;
}

export const remittanceService = {
  getSummary: async (venueId: string): Promise<VenueRemittanceSummary> => {
    const res = await apiClient.get<VenueRemittanceSummary>(
      `/venues/${venueId}/cash-remittances/summary`
    );
    return res.data;
  },

  list: async (
    venueId: string,
    params?: { status?: string; page?: number; per_page?: number }
  ): Promise<CashRemittanceListResponse> => {
    const res = await apiClient.get<CashRemittanceListResponse>(
      `/venues/${venueId}/cash-remittances`,
      { params }
    );
    return res.data;
  },

  submit: async (
    remittanceId: string,
    data: { bank_reference: string; transfer_date: string; slip: File }
  ): Promise<CashRemittance> => {
    const form = new FormData();
    form.append("bank_reference", data.bank_reference);
    form.append("transfer_date", data.transfer_date);
    form.append("slip", data.slip);
    const res = await apiClient.post<CashRemittance>(
      `/cash-remittances/${remittanceId}/submit`,
      form
    );
    return res.data;
  },
};
