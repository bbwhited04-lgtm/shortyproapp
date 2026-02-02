// Stripe Billing Client (App-to-Web Checkout)
// This app uses Stripe Checkout in the browser and verifies access via the ShortyPro backend.
//
// IMPORTANT:
// - Your backend must create Stripe Checkout Sessions and return the session URL.
// - Your backend must confirm the session and persist the user's tier (via Stripe webhooks).
//
// Env vars (Expo):
// - EXPO_PUBLIC_SHORTYPRO_API_BASE_URL (default: https://shortypro.com)

import * as WebBrowser from "expo-web-browser";
import * as Linking from "expo-linking";
import { apiRequest, getAuthToken } from "./api";

const BASE_URL =
  process.env.EXPO_PUBLIC_SHORTYPRO_API_BASE_URL?.replace(/\/$/, "") ||
  "https://shortypro.com";

export type StripePlan = "starter" | "pro" | "lifetime";

export interface CreateCheckoutSessionResponse {
  url: string; // Stripe Checkout URL
}

export interface SubscriptionStatusResponse {
  tier: "free" | "starter" | "pro" | "lifetime";
  active: boolean;
  renewsAt?: string | null;
}

// Create a Checkout session on your backend and open it in the browser.
// The backend should embed the authenticated user as the Stripe customer.
export async function startCheckout(plan: StripePlan): Promise<void> {
  const token = getAuthToken();
  if (!token) throw new Error("Not signed in");

  const res = await apiRequest<CreateCheckoutSessionResponse>(
    `${BASE_URL}/api/mobile/billing/checkout`,
    {
      method: "POST",
      body: JSON.stringify({ plan }),
      headers: { Authorization: `Bearer ${token}` },
    },
  );

  if (!res.success || !res.data?.url) {
    throw new Error(res.error || "Failed to create checkout session");
  }

  // Prefer an auth session so we can return back into the app via deep link.
  const returnUrl = Linking.createURL("billing-return");
  await WebBrowser.openAuthSessionAsync(res.data.url, returnUrl);
}

// Get the user's current tier from your backend.
export async function fetchSubscriptionStatus(): Promise<SubscriptionStatusResponse> {
  const token = getAuthToken();
  if (!token) return { tier: "free", active: false };

  const res = await apiRequest<SubscriptionStatusResponse>(
    `${BASE_URL}/api/mobile/billing/status`,
    {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    },
  );

  if (!res.success || !res.data) {
    return { tier: "free", active: false };
  }

  return res.data;
}

// Open the Stripe customer portal (optional).
export async function openCustomerPortal(): Promise<void> {
  const token = getAuthToken();
  if (!token) throw new Error("Not signed in");

  const res = await apiRequest<{ url: string }>(
    `${BASE_URL}/api/mobile/billing/portal`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    },
  );

  if (!res.success || !res.data?.url) {
    throw new Error(res.error || "Failed to create portal session");
  }

  await WebBrowser.openBrowserAsync(res.data.url);
}
