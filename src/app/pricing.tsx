import React, { useMemo, useState } from "react";
import { View, Text, ScrollView, Pressable, ActivityIndicator, Alert } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Stack, router } from "expo-router";
import Animated, { FadeInDown } from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { Check, Crown, Rocket, Gift, ChevronLeft } from "lucide-react-native";
import { startCheckout, openCustomerPortal, type StripePlan } from "@/lib/stripeClient";
import { useSubscriptionStore } from "@/lib/subscriptionStore";

type Plan = {
  id: StripePlan;
  name: string;
  price: string;
  subtitle: string;
  badge?: string;
  features: string[];
  gradient: [string, string];
};

export default function PricingScreen() {
  const tier = useSubscriptionStore((s) => s.tier);
  const checkSubscription = useSubscriptionStore((s) => s.checkSubscription);

  const [loadingPlan, setLoadingPlan] = useState<StripePlan | null>(null);
  const [loadingPortal, setLoadingPortal] = useState(false);

  const plans: Plan[] = useMemo(
    () => [
      {
        id: "starter",
        name: "Starter",
        price: "$19/mo",
        subtitle: "Get started with posting + funnels",
        features: [
          "Magna Hive access",
          "Chatterly daily limits lifted",
          "Download & share enabled",
          "More video generations",
        ],
        gradient: ["#6D28D9", "#4F46E5"],
      },
      {
        id: "pro",
        name: "Pro",
        price: "$49/mo",
        subtitle: "For creators shipping every day",
        badge: "Most popular",
        features: [
          "Everything in Starter",
          "Higher monthly limits",
          "Priority processing",
          "Advanced analytics",
        ],
        gradient: ["#0EA5E9", "#22C55E"],
      },
      {
        id: "lifetime",
        name: "Lifetime",
        price: "$249 one‑time",
        subtitle: "Own the stack — forever access",
        badge: "Best value",
        features: [
          "Everything in Pro",
          "No monthly subscription",
          "Lifetime access",
          "Future upgrades included",
        ],
        gradient: ["#F97316", "#EF4444"],
      },
    ],
    [],
  );

  const handleCheckout = async (plan: StripePlan) => {
    try {
      await Haptics.selectionAsync();
      setLoadingPlan(plan);
      await startCheckout(plan);
      // After returning from the browser, refresh tier from backend
      await checkSubscription();
      Alert.alert("Done", "If your purchase completed, your plan should now be active.");
    } catch (e: any) {
      Alert.alert("Checkout error", e?.message || "Could not start checkout.");
    } finally {
      setLoadingPlan(null);
    }
  };

  const handlePortal = async () => {
    try {
      setLoadingPortal(true);
      await openCustomerPortal();
    } catch (e: any) {
      Alert.alert("Portal error", e?.message || "Could not open billing portal.");
    } finally {
      setLoadingPortal(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#0B1220" }}>
      <Stack.Screen
        options={{
          title: "Pricing",
          headerStyle: { backgroundColor: "#0B1220" },
          headerTintColor: "#fff",
          headerBackTitleVisible: false,
          headerLeft: () => (
            <Pressable onPress={() => router.back()}>
              <ChevronLeft color="#fff" size={22} />
            </Pressable>
          ),
        }}
      />

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        <Animated.View entering={FadeInDown.duration(350)}>
          <Text style={{ color: "#fff", fontSize: 28, fontWeight: "800" }}>Upgrade</Text>
          <Text style={{ color: "rgba(255,255,255,0.7)", marginTop: 6, lineHeight: 20 }}>
            Unlock more video creation, funnels, and connected workflows.
          </Text>

          <View style={{ marginTop: 14, flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Text style={{ color: "rgba(255,255,255,0.75)" }}>Current plan:</Text>
            <Text style={{ color: "#fff", fontWeight: "700" }}>{tier.toUpperCase()}</Text>
          </View>

          <Pressable
            onPress={handlePortal}
            disabled={loadingPortal}
            style={{
              marginTop: 12,
              paddingVertical: 12,
              paddingHorizontal: 14,
              borderRadius: 14,
              borderWidth: 1,
              borderColor: "rgba(255,255,255,0.12)",
              backgroundColor: "rgba(255,255,255,0.05)",
              alignSelf: "flex-start",
            }}
          >
            {loadingPortal ? (
              <ActivityIndicator />
            ) : (
              <Text style={{ color: "#fff", fontWeight: "700" }}>Manage billing</Text>
            )}
          </Pressable>
        </Animated.View>

        <View style={{ height: 18 }} />

        {plans.map((p, idx) => (
          <Animated.View key={p.id} entering={FadeInDown.delay(80 * idx).duration(350)} style={{ marginBottom: 14 }}>
            <LinearGradient
              colors={p.gradient as any}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ borderRadius: 22, padding: 16 }}
            >
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                  {p.id === "starter" ? <Gift color="#fff" size={20} /> : p.id === "pro" ? <Rocket color="#fff" size={20} /> : <Crown color="#fff" size={20} />}
                  <Text style={{ color: "#fff", fontSize: 20, fontWeight: "800" }}>{p.name}</Text>
                </View>
                {p.badge ? (
                  <View style={{ paddingVertical: 6, paddingHorizontal: 10, borderRadius: 999, backgroundColor: "rgba(0,0,0,0.22)" }}>
                    <Text style={{ color: "#fff", fontSize: 12, fontWeight: "800" }}>{p.badge}</Text>
                  </View>
                ) : null}
              </View>

              <Text style={{ color: "rgba(255,255,255,0.95)", fontSize: 26, fontWeight: "900", marginTop: 10 }}>
                {p.price}
              </Text>
              <Text style={{ color: "rgba(255,255,255,0.85)", marginTop: 4 }}>{p.subtitle}</Text>

              <View style={{ marginTop: 12, gap: 8 }}>
                {p.features.map((f) => (
                  <View key={f} style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                    <Check color="#fff" size={18} />
                    <Text style={{ color: "rgba(255,255,255,0.92)" }}>{f}</Text>
                  </View>
                ))}
              </View>

              <Pressable
                onPress={() => handleCheckout(p.id)}
                disabled={!!loadingPlan}
                style={{
                  marginTop: 14,
                  paddingVertical: 12,
                  borderRadius: 16,
                  backgroundColor: "rgba(0,0,0,0.25)",
                  alignItems: "center",
                }}
              >
                {loadingPlan === p.id ? (
                  <ActivityIndicator />
                ) : (
                  <Text style={{ color: "#fff", fontWeight: "900" }}>Choose {p.name}</Text>
                )}
              </Pressable>
            </LinearGradient>
          </Animated.View>
        ))}

        <Text style={{ color: "rgba(255,255,255,0.55)", fontSize: 12, marginTop: 10, lineHeight: 18 }}>
          Note: Purchases are completed in a secure browser checkout and then synced back into the app after you return.
        </Text>
      </ScrollView>
    </View>
  );
}
