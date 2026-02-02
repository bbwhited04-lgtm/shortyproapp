import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchSubscriptionStatus } from './stripeClient';

export type SubscriptionTier = 'free' | 'starter' | 'pro' | 'lifetime';

interface SubscriptionState {
  // Current subscription tier
  tier: SubscriptionTier;
  isLoading: boolean;
  lastChecked: number | null;

  // Usage tracking for free tier
  freeUsage: {
    videosGenerated: number;
    messagesThisDay: number;
    lastMessageDate: string | null;
  };

  // Actions
  checkSubscription: () => Promise<void>;
  setTier: (tier: SubscriptionTier) => void;
  incrementVideoUsage: () => void;
  incrementMessageUsage: () => void;
  resetDailyMessages: () => void;

  // Permission checks
  canDownload: () => boolean;
  canShare: () => boolean;
  canAccessMagnaHive: () => boolean;
  canAccessConnectify: () => boolean;
  canGenerateVideo: () => boolean;
  canSendMessage: () => boolean;
  getVideoLimit: () => number;
  getMessageLimit: () => number;
  getRemainingVideos: () => number;
  getRemainingMessages: () => number;
}

const STORAGE_KEY = '@subscription_state';

// Tier hierarchy for comparison
const TIER_LEVELS: Record<SubscriptionTier, number> = {
  free: 0,
  starter: 1,
  pro: 2,
  lifetime: 3,
};

// Video limits per tier
const VIDEO_LIMITS: Record<SubscriptionTier, number> = {
  free: 1,
  starter: 10,
  pro: 50,
  lifetime: Infinity,
};

// Daily message limits per tier (for Chatterly)
const MESSAGE_LIMITS: Record<SubscriptionTier, number> = {
  free: 5,
  starter: 100,
  pro: 500,
  lifetime: Infinity,
};

export const useSubscriptionStore = create<SubscriptionState>((set, get) => ({
  tier: 'free',
  isLoading: true,
  lastChecked: null,
  freeUsage: {
    videosGenerated: 0,
    messagesThisDay: 0,
    lastMessageDate: null,
  },

  checkSubscription: async () => {
    set({ isLoading: true });

    // Load persisted state first
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        set({
          freeUsage: parsed.freeUsage || get().freeUsage,
        });
      }
    } catch {
      // Ignore load errors
    }

    // Check subscription status via ShortyPro backend (Stripe-backed)
    try {
      const status = await fetchSubscriptionStatus();
      set({ tier: status.tier, isLoading: false, lastChecked: Date.now() });
      return;
    } catch (e) {
      set({ tier: 'free', isLoading: false, lastChecked: Date.now() });
      return;
    },

  setTier: (tier) => {
    set({ tier });
  },

  incrementVideoUsage: () => {
    const state = get();
    const newUsage = {
      ...state.freeUsage,
      videosGenerated: state.freeUsage.videosGenerated + 1,
    };
    set({ freeUsage: newUsage });

    // Persist
    AsyncStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ freeUsage: newUsage })
    ).catch(() => {});
  },

  incrementMessageUsage: () => {
    const state = get();
    const today = new Date().toDateString();

    // Reset if new day
    const messagesThisDay =
      state.freeUsage.lastMessageDate === today
        ? state.freeUsage.messagesThisDay + 1
        : 1;

    const newUsage = {
      ...state.freeUsage,
      messagesThisDay,
      lastMessageDate: today,
    };
    set({ freeUsage: newUsage });

    // Persist
    AsyncStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ freeUsage: newUsage })
    ).catch(() => {});
  },

  resetDailyMessages: () => {
    const state = get();
    const newUsage = {
      ...state.freeUsage,
      messagesThisDay: 0,
      lastMessageDate: new Date().toDateString(),
    };
    set({ freeUsage: newUsage });
  },

  // Permission checks
  canDownload: () => {
    const { tier } = get();
    return TIER_LEVELS[tier] >= TIER_LEVELS.starter;
  },

  canShare: () => {
    const { tier } = get();
    return TIER_LEVELS[tier] >= TIER_LEVELS.starter;
  },

  canAccessMagnaHive: () => {
    const { tier } = get();
    return TIER_LEVELS[tier] >= TIER_LEVELS.starter;
  },

  canAccessConnectify: () => {
    const { tier } = get();
    return TIER_LEVELS[tier] >= TIER_LEVELS.starter;
  },

  canGenerateVideo: () => {
    const { tier, freeUsage } = get();
    if (tier === 'lifetime') return true;
    if (tier === 'free') {
      return freeUsage.videosGenerated < VIDEO_LIMITS.free;
    }
    // For paid tiers, we'd track monthly usage differently
    // For now, allow generation (real implementation would check monthly reset)
    return true;
  },

  canSendMessage: () => {
    const { tier, freeUsage } = get();
    if (tier === 'lifetime' || tier === 'pro') return true;

    const today = new Date().toDateString();
    const messagesUsed =
      freeUsage.lastMessageDate === today ? freeUsage.messagesThisDay : 0;

    return messagesUsed < MESSAGE_LIMITS[tier];
  },

  getVideoLimit: () => {
    const { tier } = get();
    return VIDEO_LIMITS[tier];
  },

  getMessageLimit: () => {
    const { tier } = get();
    return MESSAGE_LIMITS[tier];
  },

  getRemainingVideos: () => {
    const { tier, freeUsage } = get();
    if (tier === 'lifetime') return Infinity;
    const limit = VIDEO_LIMITS[tier];
    if (tier === 'free') {
      return Math.max(0, limit - freeUsage.videosGenerated);
    }
    // For paid tiers, would need monthly tracking
    return limit;
  },

  getRemainingMessages: () => {
    const { tier, freeUsage } = get();
    if (tier === 'lifetime' || tier === 'pro') return Infinity;

    const limit = MESSAGE_LIMITS[tier];
    const today = new Date().toDateString();
    const messagesUsed =
      freeUsage.lastMessageDate === today ? freeUsage.messagesThisDay : 0;

    return Math.max(0, limit - messagesUsed);
  },
}));

// Helper hook for common subscription checks
export function useSubscription() {
  const tier = useSubscriptionStore((s) => s.tier);
  const isLoading = useSubscriptionStore((s) => s.isLoading);
  const checkSubscription = useSubscriptionStore((s) => s.checkSubscription);
  const canDownload = useSubscriptionStore((s) => s.canDownload);
  const canShare = useSubscriptionStore((s) => s.canShare);
  const canAccessMagnaHive = useSubscriptionStore((s) => s.canAccessMagnaHive);
  const canAccessConnectify = useSubscriptionStore((s) => s.canAccessConnectify);
  const canGenerateVideo = useSubscriptionStore((s) => s.canGenerateVideo);
  const canSendMessage = useSubscriptionStore((s) => s.canSendMessage);
  const getRemainingVideos = useSubscriptionStore((s) => s.getRemainingVideos);
  const getRemainingMessages = useSubscriptionStore((s) => s.getRemainingMessages);

  const isPaid = tier !== 'free';
  const isPro = tier === 'pro' || tier === 'lifetime';
  const isLifetime = tier === 'lifetime';

  return {
    tier,
    isLoading,
    isPaid,
    isPro,
    isLifetime,
    checkSubscription,
    canDownload: canDownload(),
    canShare: canShare(),
    canAccessMagnaHive: canAccessMagnaHive(),
    canAccessConnectify: canAccessConnectify(),
    canGenerateVideo: canGenerateVideo(),
    canSendMessage: canSendMessage(),
    remainingVideos: getRemainingVideos(),
    remainingMessages: getRemainingMessages(),
  };
}
