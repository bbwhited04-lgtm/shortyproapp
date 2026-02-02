import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type SocialPlatform =
  | 'google'
  | 'facebook'
  | 'tiktok'
  | 'instagram'
  | 'threads'
  | 'pinterest'
  | 'linkedin'
  | 'youtube'
  | 'twitter'
  | 'snapchat'
  | 'reddit'
  | 'twitch'
  | 'discord'
  | 'whatsapp'
  | 'telegram';

export type AccountType = 'personal' | 'business' | 'page' | 'creator';

export interface SocialAccount {
  id: string;
  platform: SocialPlatform;
  username: string;
  displayName: string;
  accountType: AccountType;
  avatarUrl?: string;
  followers: number;
  following: number;
  posts: number;
  engagement: number;
  connectedAt: string;
  isActive: boolean;
}

export interface PlatformAnalytics {
  platform: SocialPlatform;
  accountId: string;
  totalReach: number;
  impressions: number;
  engagement: number;
  clicks: number;
  shares: number;
  comments: number;
  likes: number;
  growth: number; // percentage
  weeklyData: number[];
}

interface SocialAccountsState {
  accounts: SocialAccount[];
  analytics: PlatformAnalytics[];
  isLoading: boolean;
  addAccount: (account: SocialAccount) => Promise<void>;
  removeAccount: (id: string) => Promise<void>;
  toggleAccountActive: (id: string) => Promise<void>;
  loadStoredAccounts: () => Promise<void>;
  getConnectedPlatforms: () => SocialPlatform[];
  getAccountsByPlatform: (platform: SocialPlatform) => SocialAccount[];
  getAccountCountByPlatform: (platform: SocialPlatform) => number;
  getTotalFollowers: () => number;
  getTotalEngagement: () => number;
}

const STORAGE_KEY = 'social_accounts';

// Mock analytics data generator
const generateAnalytics = (platform: SocialPlatform, accountId: string): PlatformAnalytics => ({
  platform,
  accountId,
  totalReach: Math.floor(Math.random() * 50000) + 5000,
  impressions: Math.floor(Math.random() * 100000) + 10000,
  engagement: Math.random() * 8 + 2,
  clicks: Math.floor(Math.random() * 5000) + 500,
  shares: Math.floor(Math.random() * 1000) + 100,
  comments: Math.floor(Math.random() * 2000) + 200,
  likes: Math.floor(Math.random() * 10000) + 1000,
  growth: Math.random() * 20 - 5,
  weeklyData: Array.from({ length: 7 }, () => Math.floor(Math.random() * 1000) + 100),
});

export const useSocialAccountsStore = create<SocialAccountsState>((set, get) => ({
  accounts: [],
  analytics: [],
  isLoading: true,

  addAccount: async (account) => {
    const accounts = [...get().accounts, account];
    const analytics = [...get().analytics, generateAnalytics(account.platform, account.id)];
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(accounts));
    set({ accounts, analytics });
  },

  removeAccount: async (id) => {
    const accounts = get().accounts.filter((a) => a.id !== id);
    const analytics = get().analytics.filter((a) => a.accountId !== id);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(accounts));
    set({ accounts, analytics });
  },

  toggleAccountActive: async (id) => {
    const accounts = get().accounts.map((a) =>
      a.id === id ? { ...a, isActive: !a.isActive } : a
    );
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(accounts));
    set({ accounts });
  },

  loadStoredAccounts: async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const accounts: SocialAccount[] = JSON.parse(stored);
        const analytics = accounts.map((a) => generateAnalytics(a.platform, a.id));
        set({ accounts, analytics, isLoading: false });
      } else {
        set({ isLoading: false });
      }
    } catch {
      set({ isLoading: false });
    }
  },

  getConnectedPlatforms: () => {
    const platforms = get().accounts.map((a) => a.platform);
    return [...new Set(platforms)]; // Return unique platforms
  },

  getAccountsByPlatform: (platform) => {
    return get().accounts.filter((a) => a.platform === platform);
  },

  getAccountCountByPlatform: (platform) => {
    return get().accounts.filter((a) => a.platform === platform).length;
  },

  getTotalFollowers: () => {
    return get().accounts.reduce((sum, a) => sum + a.followers, 0);
  },

  getTotalEngagement: () => {
    const analytics = get().analytics;
    if (analytics.length === 0) return 0;
    return analytics.reduce((sum, a) => sum + a.engagement, 0) / analytics.length;
  },
}));
