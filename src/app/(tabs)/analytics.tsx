import React, { useEffect } from 'react';
import { View, Text, ScrollView, Pressable, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import {
  TrendingUp,
  TrendingDown,
  Users,
  Eye,
  MousePointerClick,
  Heart,
  MessageCircle,
  Share2,
  ChevronRight,
  BarChart3,
  Activity,
  Lock,
} from 'lucide-react-native';
import Animated, {
  FadeInDown,
  FadeInRight,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withDelay,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import {
  useSocialAccountsStore,
  SocialPlatform,
  PlatformAnalytics,
} from '@/lib/state/social-accounts-store';
import { useSubscription } from '@/lib/subscriptionStore';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const PLATFORM_COLORS: Record<SocialPlatform, string> = {
  google: '#EA4335',
  facebook: '#1877F2',
  tiktok: '#000000',
  instagram: '#E4405F',
  threads: '#000000',
  pinterest: '#E60023',
  linkedin: '#0A66C2',
  youtube: '#FF0000',
  twitter: '#1DA1F2',
  snapchat: '#FFFC00',
  reddit: '#FF4500',
  twitch: '#9146FF',
  discord: '#5865F2',
  whatsapp: '#25D366',
  telegram: '#0088CC',
};

const PLATFORM_NAMES: Record<SocialPlatform, string> = {
  google: 'Google',
  facebook: 'Facebook',
  tiktok: 'TikTok',
  instagram: 'Instagram',
  threads: 'Threads',
  pinterest: 'Pinterest',
  linkedin: 'LinkedIn',
  youtube: 'YouTube',
  twitter: 'X (Twitter)',
  snapchat: 'Snapchat',
  reddit: 'Reddit',
  twitch: 'Twitch',
  discord: 'Discord',
  whatsapp: 'WhatsApp',
  telegram: 'Telegram',
};

function formatNumber(num: number): string {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toString();
}

function MiniChart({ data, color }: { data: number[]; color: string }) {
  const maxVal = Math.max(...data);
  const minVal = Math.min(...data);
  const range = maxVal - minVal || 1;

  return (
    <View className="flex-row items-end h-8 gap-1">
      {data.map((val, i) => {
        const height = ((val - minVal) / range) * 24 + 8;
        return (
          <View
            key={i}
            style={{
              width: 4,
              height,
              backgroundColor: color,
              borderRadius: 2,
              opacity: 0.4 + (i / data.length) * 0.6,
            }}
          />
        );
      })}
    </View>
  );
}

function StatCard({
  label,
  value,
  icon,
  trend,
  delay,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  trend?: number;
  delay: number;
}) {
  const scale = useSharedValue(0.8);
  const opacity = useSharedValue(0);

  useEffect(() => {
    scale.value = withDelay(delay, withSpring(1, { damping: 12 }));
    opacity.value = withDelay(delay, withTiming(1, { duration: 400 }));
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={animatedStyle} className="flex-1">
      <BlurView intensity={20} tint="dark" style={{ borderRadius: 20, overflow: 'hidden' }}>
        <View className="p-4 border border-white/10 rounded-[20px]">
          <View className="flex-row items-center justify-between mb-2">
            <View className="w-8 h-8 rounded-full bg-white/10 items-center justify-center">
              {icon}
            </View>
            {trend !== undefined && (
              <View
                className={`flex-row items-center px-2 py-1 rounded-full ${
                  trend >= 0 ? 'bg-emerald-500/20' : 'bg-red-500/20'
                }`}
              >
                {trend >= 0 ? (
                  <TrendingUp size={10} color="#10b981" />
                ) : (
                  <TrendingDown size={10} color="#ef4444" />
                )}
                <Text
                  className={`text-[10px] font-semibold ml-1 ${
                    trend >= 0 ? 'text-emerald-400' : 'text-red-400'
                  }`}
                >
                  {Math.abs(trend).toFixed(1)}%
                </Text>
              </View>
            )}
          </View>
          <Text className="text-white text-xl font-bold">{value}</Text>
          <Text className="text-white/50 text-xs mt-1">{label}</Text>
        </View>
      </BlurView>
    </Animated.View>
  );
}

function PlatformCard({
  analytics,
  delay,
}: {
  analytics: PlatformAnalytics;
  delay: number;
}) {
  const color = PLATFORM_COLORS[analytics.platform];
  const name = PLATFORM_NAMES[analytics.platform];

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  return (
    <Animated.View entering={FadeInRight.delay(delay).springify()}>
      <Pressable onPress={handlePress} className="active:scale-[0.98]">
        <BlurView intensity={15} tint="dark" style={{ borderRadius: 24, overflow: 'hidden' }}>
          <View className="p-5 border border-white/10 rounded-3xl">
            <View className="flex-row items-center justify-between mb-4">
              <View className="flex-row items-center">
                <View
                  style={{ backgroundColor: color }}
                  className="w-10 h-10 rounded-xl items-center justify-center"
                >
                  <BarChart3 size={20} color="#fff" />
                </View>
                <View className="ml-3">
                  <Text className="text-white font-semibold text-base">{name}</Text>
                  <View className="flex-row items-center mt-0.5">
                    {analytics.growth >= 0 ? (
                      <TrendingUp size={12} color="#10b981" />
                    ) : (
                      <TrendingDown size={12} color="#ef4444" />
                    )}
                    <Text
                      className={`text-xs ml-1 ${
                        analytics.growth >= 0 ? 'text-emerald-400' : 'text-red-400'
                      }`}
                    >
                      {analytics.growth >= 0 ? '+' : ''}
                      {analytics.growth.toFixed(1)}% this week
                    </Text>
                  </View>
                </View>
              </View>
              <MiniChart data={analytics.weeklyData} color={color} />
            </View>

            <View className="flex-row justify-between">
              <View className="items-center flex-1">
                <Text className="text-white/50 text-[10px] uppercase tracking-wider">Reach</Text>
                <Text className="text-white font-bold text-sm mt-1">
                  {formatNumber(analytics.totalReach)}
                </Text>
              </View>
              <View className="w-px bg-white/10" />
              <View className="items-center flex-1">
                <Text className="text-white/50 text-[10px] uppercase tracking-wider">Engage</Text>
                <Text className="text-white font-bold text-sm mt-1">
                  {analytics.engagement.toFixed(1)}%
                </Text>
              </View>
              <View className="w-px bg-white/10" />
              <View className="items-center flex-1">
                <Text className="text-white/50 text-[10px] uppercase tracking-wider">Clicks</Text>
                <Text className="text-white font-bold text-sm mt-1">
                  {formatNumber(analytics.clicks)}
                </Text>
              </View>
              <View className="w-px bg-white/10" />
              <View className="items-center flex-1">
                <Text className="text-white/50 text-[10px] uppercase tracking-wider">Likes</Text>
                <Text className="text-white font-bold text-sm mt-1">
                  {formatNumber(analytics.likes)}
                </Text>
              </View>
            </View>
          </View>
        </BlurView>
      </Pressable>
    </Animated.View>
  );
}

function EmptyState() {
  return (
    <Animated.View
      entering={FadeInDown.delay(200).springify()}
      className="flex-1 items-center justify-center px-8 py-16"
    >
      <View className="w-20 h-20 rounded-3xl bg-cyan-500/20 items-center justify-center mb-6">
        <Activity size={40} color="#06b6d4" />
      </View>
      <Text className="text-white text-xl font-bold text-center mb-2">
        No Accounts Connected
      </Text>
      <Text className="text-white/50 text-center mb-8">
        Connect your social media accounts to start tracking analytics across all platforms
      </Text>
      <Pressable
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          router.push('/(tabs)/connect');
        }}
        className="active:scale-[0.98]"
      >
        <LinearGradient
          colors={['#06b6d4', '#0891b2']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ borderRadius: 16, paddingHorizontal: 32, paddingVertical: 16 }}
        >
          <View className="flex-row items-center">
            <Text className="text-white font-semibold text-base">Connect Accounts</Text>
            <ChevronRight size={18} color="#fff" className="ml-2" />
          </View>
        </LinearGradient>
      </Pressable>
    </Animated.View>
  );
}

export default function AnalyticsScreen() {
  const accounts = useSocialAccountsStore((s) => s.accounts);
  const analytics = useSocialAccountsStore((s) => s.analytics);
  const isLoading = useSocialAccountsStore((s) => s.isLoading);
  const loadStoredAccounts = useSocialAccountsStore((s) => s.loadStoredAccounts);
  const getTotalFollowers = useSocialAccountsStore((s) => s.getTotalFollowers);
  const getTotalEngagement = useSocialAccountsStore((s) => s.getTotalEngagement);
  const { isPro } = useSubscription();

  useEffect(() => {
    loadStoredAccounts();
  }, []);

  const totalFollowers = getTotalFollowers();
  const avgEngagement = getTotalEngagement();
  const totalImpressions = analytics.reduce((sum, a) => sum + a.impressions, 0);
  const totalClicks = analytics.reduce((sum, a) => sum + a.clicks, 0);

  // Lock analytics for non-pro users
  if (!isPro) {
    return (
      <View className="flex-1 bg-slate-900">
        <LinearGradient colors={['#0f172a', '#0c1222', '#0f172a']} style={{ flex: 1 }}>
          <View className="flex-1 justify-center items-center px-6">
            <View className="w-24 h-24 rounded-full bg-cyan-500/10 items-center justify-center mb-6">
              <Lock size={48} color="#06b6d4" />
            </View>
            <Text className="text-white text-2xl font-bold text-center mb-3">
              Advanced Analytics
            </Text>
            <Text className="text-slate-400 text-center mb-8 px-4">
              Upgrade to Pro to unlock detailed analytics, engagement tracking, and performance insights across all your social accounts.
            </Text>
            <Pressable
              onPress={() => router.push('/pricing')}
              className="active:opacity-80"
            >
              <LinearGradient
                colors={['#06b6d4', '#0891b2']}
                style={{
                  borderRadius: 16,
                  paddingVertical: 16,
                  paddingHorizontal: 32,
                  alignItems: 'center',
                }}
              >
                <Text className="text-white font-bold text-lg">
                  Upgrade to Pro
                </Text>
              </LinearGradient>
            </Pressable>
          </View>
        </LinearGradient>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View className="flex-1 bg-slate-900 items-center justify-center">
        <Activity size={32} color="#06b6d4" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-slate-900">
      <LinearGradient colors={['#0f172a', '#0c1222', '#0f172a']} style={{ flex: 1 }}>
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingBottom: 120 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <Animated.View
            entering={FadeInDown.delay(100).springify()}
            className="px-6 pt-4 pb-2"
          >
            <Text className="text-white/50 text-sm">Overview</Text>
            <Text className="text-white text-2xl font-bold mt-1">Analytics</Text>
          </Animated.View>

          {accounts.length === 0 ? (
            <EmptyState />
          ) : (
            <>
              {/* Summary Stats */}
              <View className="px-6 mt-4">
                <View className="flex-row gap-3 mb-3">
                  <StatCard
                    label="Total Followers"
                    value={formatNumber(totalFollowers)}
                    icon={<Users size={16} color="#06b6d4" />}
                    trend={12.5}
                    delay={150}
                  />
                  <StatCard
                    label="Avg. Engagement"
                    value={`${avgEngagement.toFixed(1)}%`}
                    icon={<Heart size={16} color="#f472b6" />}
                    trend={avgEngagement > 5 ? 8.2 : -2.1}
                    delay={200}
                  />
                </View>
                <View className="flex-row gap-3">
                  <StatCard
                    label="Impressions"
                    value={formatNumber(totalImpressions)}
                    icon={<Eye size={16} color="#a78bfa" />}
                    trend={15.8}
                    delay={250}
                  />
                  <StatCard
                    label="Total Clicks"
                    value={formatNumber(totalClicks)}
                    icon={<MousePointerClick size={16} color="#34d399" />}
                    trend={7.3}
                    delay={300}
                  />
                </View>
              </View>

              {/* Engagement Breakdown */}
              <Animated.View
                entering={FadeInDown.delay(350).springify()}
                className="px-6 mt-6"
              >
                <BlurView intensity={15} tint="dark" style={{ borderRadius: 24, overflow: 'hidden' }}>
                  <View className="p-5 border border-white/10 rounded-3xl">
                    <Text className="text-white font-semibold text-base mb-4">
                      Engagement Breakdown
                    </Text>
                    <View className="flex-row justify-around">
                      <View className="items-center">
                        <View className="w-12 h-12 rounded-2xl bg-rose-500/20 items-center justify-center mb-2">
                          <Heart size={22} color="#f43f5e" />
                        </View>
                        <Text className="text-white font-bold">
                          {formatNumber(analytics.reduce((s, a) => s + a.likes, 0))}
                        </Text>
                        <Text className="text-white/40 text-xs">Likes</Text>
                      </View>
                      <View className="items-center">
                        <View className="w-12 h-12 rounded-2xl bg-blue-500/20 items-center justify-center mb-2">
                          <MessageCircle size={22} color="#3b82f6" />
                        </View>
                        <Text className="text-white font-bold">
                          {formatNumber(analytics.reduce((s, a) => s + a.comments, 0))}
                        </Text>
                        <Text className="text-white/40 text-xs">Comments</Text>
                      </View>
                      <View className="items-center">
                        <View className="w-12 h-12 rounded-2xl bg-emerald-500/20 items-center justify-center mb-2">
                          <Share2 size={22} color="#10b981" />
                        </View>
                        <Text className="text-white font-bold">
                          {formatNumber(analytics.reduce((s, a) => s + a.shares, 0))}
                        </Text>
                        <Text className="text-white/40 text-xs">Shares</Text>
                      </View>
                    </View>
                  </View>
                </BlurView>
              </Animated.View>

              {/* Platform Analytics */}
              <View className="px-6 mt-6">
                <Animated.View
                  entering={FadeInDown.delay(400).springify()}
                  className="flex-row items-center justify-between mb-4"
                >
                  <Text className="text-white font-semibold text-base">By Platform</Text>
                  <Text className="text-cyan-400 text-sm">{accounts.length} connected</Text>
                </Animated.View>

                <View className="gap-3">
                  {analytics.map((analytic, index) => (
                    <PlatformCard
                      key={analytic.accountId}
                      analytics={analytic}
                      delay={450 + index * 50}
                    />
                  ))}
                </View>
              </View>
            </>
          )}
        </ScrollView>
      </LinearGradient>
    </View>
  );
}
