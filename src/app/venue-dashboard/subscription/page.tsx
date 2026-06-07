"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Script from "next/script";
import {
  ArrowsClockwise,
  CalendarBlank,
  CheckCircle,
  CircleNotch,
  Lightning,
  Money,
  ShieldCheck,
  Star,
  Warning,
  XCircle,
} from "@phosphor-icons/react";
import Button from "@/components/ui/Button";
import { useAuth } from "@/services/authContext";
import { useToast } from "@/components/ui/Toast";
import { useVenue } from "@/components/venue/VenueContext";
import { subscriptionService } from "@/services/subscriptionService";
import { SubscriptionPlan, VenueSubscription } from "@/types";

declare global {
  interface Window {
    payhere: {
      startPayment: (payment: Record<string, string | boolean>) => void;
      onCompleted: (orderId: string) => void;
      onDismissed: () => void;
      onError: (error: string) => void;
    };
  }
}

const formatCurrency = (value: number) => `LKR ${value.toLocaleString()}`;

const formatDate = (value?: string | null) => {
  if (!value) return "Not set";
  return new Date(value).toLocaleDateString("en-LK", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const getErrorDetail = (error: unknown, fallback: string) => {
  if (typeof error === "object" && error !== null && "response" in error) {
    const response = (error as { response?: { data?: { detail?: unknown } } }).response;
    if (typeof response?.data?.detail === "string") {
      return response.data.detail;
    }
  }
  return fallback;
};

export default function VenueSubscriptionPage() {
  const { user, isVenueManager } = useAuth();
  const { currentVenue } = useVenue();
  const { addToast } = useToast();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [subscription, setSubscription] = useState<VenueSubscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [saving, setSaving] = useState(false);
  const [sdkReady, setSdkReady] = useState(false);

  const isOwner = !!user && !!currentVenue && currentVenue.owner_id === user.id && !isVenueManager;
  const premiumPlan = useMemo(() => plans.find((plan) => plan.code === "premium"), [plans]);
  const standardPlan = useMemo(() => plans.find((plan) => plan.code === "standard"), [plans]);

  const load = useCallback(async () => {
    if (!currentVenue?.id) return;
    setLoading(true);
    try {
      const [planData, current] = await Promise.all([
        subscriptionService.getPlans(),
        subscriptionService.getCurrent(currentVenue.id),
      ]);
      setPlans(planData);
      setSubscription(current);
    } catch {
      addToast("Failed to load subscription details", "error");
    } finally {
      setLoading(false);
    }
  }, [addToast, currentVenue?.id]);

  useEffect(() => {
    load();
  }, [load]);

  const attachPayHereHandlers = useCallback(() => {
    if (typeof window === "undefined" || !window.payhere) return;

    window.payhere.onCompleted = () => {
      setPaying(false);
      addToast("Payment received. Activating Premium shortly…", "success", 5000);
      setTimeout(() => load(), 2500);
    };

    window.payhere.onDismissed = () => {
      setPaying(false);
      addToast("Subscription payment was dismissed", "warning");
    };

    window.payhere.onError = (error) => {
      setPaying(false);
      addToast(`Payment error: ${error}`, "error");
    };
  }, [addToast, load]);

  const startPremiumCheckout = async () => {
    if (!currentVenue?.id || !sdkReady) return;
    setPaying(true);
    try {
      const data = await subscriptionService.createCheckout(currentVenue.id);
      attachPayHereHandlers();
      window.payhere.startPayment({
        sandbox: data.sandbox === "true",
        merchant_id: data.merchant_id,
        return_url: data.return_url,
        cancel_url: data.cancel_url,
        notify_url: data.notify_url,
        order_id: data.order_id,
        items: data.items,
        amount: data.amount,
        currency: data.currency,
        hash: data.hash,
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
        phone: data.phone,
        address: data.address,
        city: data.city,
        country: data.country,
      });
    } catch (error) {
      setPaying(false);
      addToast(getErrorDetail(error, "Failed to start Premium checkout"), "error");
    }
  };

  const cancelPremium = async () => {
    if (!currentVenue?.id) return;
    setSaving(true);
    try {
      const updated = await subscriptionService.cancel(currentVenue.id);
      setSubscription(updated);
      addToast("Premium will end at the current billing period", "success");
    } catch (error) {
      addToast(getErrorDetail(error, "Failed to cancel subscription"), "error");
    } finally {
      setSaving(false);
    }
  };

  const resumePremium = async () => {
    if (!currentVenue?.id) return;
    setSaving(true);
    try {
      const updated = await subscriptionService.resume(currentVenue.id);
      setSubscription(updated);
      addToast("Premium renewal resumed", "success");
    } catch (error) {
      addToast(getErrorDetail(error, "Failed to resume subscription"), "error");
    } finally {
      setSaving(false);
    }
  };

  if (!currentVenue) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center text-secondary">
        Select a venue to manage subscriptions.
      </div>
    );
  }

  if (!isOwner) {
    return (
      <div className="max-w-3xl mx-auto p-8 bg-surface-raised border border-subtle rounded-3xl">
        <Warning size={44} weight="fill" className="text-yellow-400 mb-4" />
        <h1 className="text-2xl font-bold text-primary mb-2">Owner access only</h1>
        <p className="text-secondary">Subscription billing can only be managed by the venue owner.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <CircleNotch size={36} className="animate-spin text-emerald-400" />
      </div>
    );
  }

  const isPremium = subscription?.is_premium;

  return (
    <>
      <Script src="https://www.payhere.lk/lib/payhere.js" strategy="afterInteractive" onLoad={() => setSdkReady(true)} />
      <div className="space-y-8">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
          <div>
            <p className="text-emerald-400 font-semibold uppercase tracking-[0.2em] text-xs mb-3">Venue billing</p>
            <h1 className="text-4xl font-black text-primary mb-3">Subscription Plan</h1>
            <p className="text-secondary max-w-2xl">Choose how {currentVenue.name} pays platform fees for booking revenue.</p>
          </div>
          <Button variant="outline" onClick={load} disabled={loading}>
            <ArrowsClockwise size={18} /> Refresh
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 bg-surface-raised border border-subtle rounded-3xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${isPremium ? "bg-emerald-500/15" : "bg-blue-500/15"}`}>
                {isPremium ? <Star size={24} weight="fill" className="text-emerald-400" /> : <Money size={24} weight="fill" className="text-blue-400" />}
              </div>
              <div>
                <p className="text-sm text-muted">Current plan</p>
                <h2 className="text-2xl font-black text-primary">{isPremium ? "Premium" : "Standard"}</h2>
              </div>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between border-b border-subtle pb-3">
                <span className="text-secondary">Commission</span>
                <span className="font-bold text-primary">{isPremium ? "0%" : "3%"}</span>
              </div>
              <div className="flex items-center justify-between border-b border-subtle pb-3">
                <span className="text-secondary">Monthly fee</span>
                <span className="font-bold text-primary">{isPremium ? "LKR 9,900" : "LKR 0"}</span>
              </div>
              <div className="flex items-center justify-between border-b border-subtle pb-3">
                <span className="text-secondary">Status</span>
                <span className={`font-bold ${isPremium ? "text-emerald-400" : "text-blue-400"}`}>{subscription?.status || "active"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-secondary">Period ends</span>
                <span className="font-bold text-primary">{formatDate(subscription?.current_period_end)}</span>
              </div>
            </div>
            {subscription?.cancel_at_period_end && (
              <div className="mt-5 p-4 rounded-2xl bg-yellow-500/10 border border-yellow-500/20 text-yellow-200 text-sm">
                Premium is scheduled to end at the current period end.
              </div>
            )}
          </div>

          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
            {standardPlan && (
              <div className="bg-surface-raised border border-subtle rounded-3xl p-6 flex flex-col">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-2xl font-black text-primary">{standardPlan.name}</h3>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-500/10 text-blue-300">Default</span>
                </div>
                <p className="text-4xl font-black text-primary mb-2">Free</p>
                <p className="text-secondary mb-6">Pay commission only when bookings come through Arena.</p>
                <div className="space-y-3 flex-1">
                  {standardPlan.features.map((feature) => (
                    <div key={feature} className="flex gap-3 text-sm text-secondary">
                      <CheckCircle size={18} weight="fill" className="text-blue-400 shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {premiumPlan && (
              <div className="bg-gradient-to-br from-emerald-500/10 via-surface-raised to-surface-raised border border-emerald-500/30 rounded-3xl p-6 flex flex-col relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl" />
                <div className="relative flex items-center justify-between mb-5">
                  <h3 className="text-2xl font-black text-primary">{premiumPlan.name}</h3>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-300">Best Value</span>
                </div>
                <p className="relative text-4xl font-black text-primary mb-2">{formatCurrency(premiumPlan.monthly_price_lkr)}</p>
                <p className="relative text-secondary mb-6">Per venue, per month. Zero platform commission.</p>
                <div className="relative space-y-3 flex-1 mb-6">
                  {premiumPlan.features.map((feature) => (
                    <div key={feature} className="flex gap-3 text-sm text-secondary">
                      <CheckCircle size={18} weight="fill" className="text-emerald-400 shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
                {isPremium ? (
                  subscription?.cancel_at_period_end ? (
                    <Button onClick={resumePremium} disabled={saving}>
                      {saving ? <CircleNotch size={18} className="animate-spin" /> : <CalendarBlank size={18} />} Resume Premium
                    </Button>
                  ) : (
                    <Button variant="outline" onClick={cancelPremium} disabled={saving}>
                      {saving ? <CircleNotch size={18} className="animate-spin" /> : <XCircle size={18} />} Cancel renewal
                    </Button>
                  )
                ) : (
                  <Button onClick={startPremiumCheckout} disabled={!sdkReady || paying}>
                    {paying ? <CircleNotch size={18} className="animate-spin" /> : <Lightning size={18} weight="fill" />} Upgrade to Premium
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-surface-raised border border-subtle rounded-2xl p-5">
            <ShieldCheck size={28} weight="fill" className="text-emerald-400 mb-3" />
            <h3 className="font-bold text-primary mb-1">Owner controlled</h3>
            <p className="text-sm text-secondary">Managers can view operations, but only owners manage billing.</p>
          </div>
          <div className="bg-surface-raised border border-subtle rounded-2xl p-5">
            <Star size={28} weight="fill" className="text-yellow-400 mb-3" />
            <h3 className="font-bold text-primary mb-1">Featured eligibility</h3>
            <p className="text-sm text-secondary">Premium venues become eligible for priority visibility.</p>
          </div>
          <div className="bg-surface-raised border border-subtle rounded-2xl p-5">
            <Money size={28} weight="fill" className="text-blue-400 mb-3" />
            <h3 className="font-bold text-primary mb-1">Snapshot pricing</h3>
            <p className="text-sm text-secondary">Each booking keeps the commission policy active when it was created.</p>
          </div>
        </div>
      </div>
    </>
  );
}
