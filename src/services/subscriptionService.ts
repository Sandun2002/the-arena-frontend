import apiClient from "./apiClient";
import { SubscriptionPlan, VenueSubscription } from "@/types";

export interface SubscriptionCheckoutData {
  subscription: VenueSubscription;
  merchant_id: string;
  return_url: string;
  cancel_url: string;
  notify_url: string;
  order_id: string;
  items: string;
  currency: string;
  amount: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  hash: string;
  sandbox: string;
  checkout_url: string;
}

class SubscriptionService {
  async getPlans(): Promise<SubscriptionPlan[]> {
    const response = await apiClient.get<SubscriptionPlan[]>("/subscriptions/plans");
    return response.data;
  }

  async getCurrent(venueId?: string): Promise<VenueSubscription> {
    const response = await apiClient.get<VenueSubscription>("/center/subscriptions/current", {
      params: venueId ? { venue_id: venueId } : undefined,
    });
    return response.data;
  }

  async createCheckout(venueId?: string): Promise<SubscriptionCheckoutData> {
    const response = await apiClient.post<SubscriptionCheckoutData>("/center/subscriptions/checkout", null, {
      params: venueId ? { venue_id: venueId } : undefined,
    });
    return response.data;
  }

  async cancel(venueId?: string): Promise<VenueSubscription> {
    const response = await apiClient.post<VenueSubscription>("/center/subscriptions/cancel", null, {
      params: venueId ? { venue_id: venueId } : undefined,
    });
    return response.data;
  }

  async resume(venueId?: string): Promise<VenueSubscription> {
    const response = await apiClient.post<VenueSubscription>("/center/subscriptions/resume", null, {
      params: venueId ? { venue_id: venueId } : undefined,
    });
    return response.data;
  }
}

export const subscriptionService = new SubscriptionService();
