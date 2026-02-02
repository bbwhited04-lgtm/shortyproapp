import React from 'react';
import { View, Text, ScrollView, Pressable, RefreshControl } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import {
  Video,
  MessageCircle,
  Target,
  Users,
  ChevronRight,
  TrendingUp,
  Zap,
} from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useAuthStore } from '@/lib/state/auth-store';

interface FeatureCardProps {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  gradient: string[];
  route: string;
  delay: number;
}

function FeatureCard({ title, subtitle, icon, gradient, route, delay }: FeatureCardProps) {
  return (
    <Animated.View entering={FadeInDown.delay(delay).springify()}>
      <Pressable
        onPress={() => router.push(route as any)}
        className="mb-4 active:scale-[0.98]"
      >
        <LinearGradient
          colors={gradient as [string, string]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            borderRadius: 24,
            padding: 20,
          }}
        >
          <View className="flex-row items-center justify-between">
            <View className="flex-1">
              <View className="w-12 h-12 bg-white/20 rounded-2xl items-center justify-center mb-3">
                {icon}
              </View>
              <Text className="text-white text-xl font-bold mb-1">{title}</Text>
              <Text className="text-white/70 text-sm">{subtitle}</Text>
            </View>
            <View className="w-10 h-10 bg-white/20 rounded-full items-center justify-center">
              <ChevronRight size={20} color="#fff" />
            </View>
          </View>
        </LinearGradient>
      </Pressable>
    </Animated.View>
  );
}

function StatCard({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <View className="flex-1 bg-slate-800/50 rounded-2xl p-4 border border-slate-700/30">
      <View className="flex-row items-center mb-2">
        {icon}
        <Text className="text-slate-400 text-xs ml-2">{label}</Text>
      </View>
      <Text className="text-white text-2xl font-bold">{value}</Text>
    </View>
  );
}

export default function DashboardScreen() {
  const user = useAuthStore((s) => s.user);
  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const features = [
    {
      title: 'Shorty Magic',
      subtitle: 'Create stunning short videos with AI',
      icon: <Video size={24} color="#fff" />,
      gradient: ['#8b5cf6', '#6366f1'],
      route: '/shorty-magic',
    },
    {
      title: 'Chatterly',
      subtitle: 'AI-powered conversations',
      icon: <MessageCircle size={24} color="#fff" />,
      gradient: ['#06b6d4', '#0ea5e9'],
      route: '/chatterly',
    },
    {
      title: 'Magna Hive',
      subtitle: 'Build high-converting funnels',
      icon: <Target size={24} color="#fff" />,
      gradient: ['#f97316', '#ef4444'],
      route: '/magna-hive',
    },
    {
      title: 'Connectify',
      subtitle: 'Manage your customer relationships',
      icon: <Users size={24} color="#fff" />,
      gradient: ['#10b981', '#14b8a6'],
      route: '/connectify',
    },
  ];

  return (
    <View className="flex-1 bg-slate-900">
      <LinearGradient
        colors={['#0f172a', '#1e293b']}
        style={{ flex: 1 }}
      >
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingBottom: 100 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#06b6d4"
            />
          }
        >
          {/* Header */}
          <View className="px-6 pt-4 pb-6">
            <Animated.View entering={FadeInDown.delay(100).springify()}>
              <Text className="text-slate-400 text-base">Welcome back,</Text>
              <Text className="text-white text-2xl font-bold mt-1">
                {user?.name || 'Creator'}
              </Text>
            </Animated.View>

            {/* Quick Stats */}
            <Animated.View
              entering={FadeInDown.delay(150).springify()}
              className="flex-row gap-3 mt-6"
            >
              <StatCard
                label="Videos"
                value="12"
                icon={<Video size={14} color="#8b5cf6" />}
              />
              <StatCard
                label="Contacts"
                value="248"
                icon={<Users size={14} color="#10b981" />}
              />
              <StatCard
                label="Funnels"
                value="5"
                icon={<TrendingUp size={14} color="#f97316" />}
              />
            </Animated.View>
          </View>

          {/* Feature Cards */}
          <View className="px-6">
            <Animated.View
              entering={FadeInDown.delay(200).springify()}
              className="flex-row items-center mb-4"
            >
              <Zap size={18} color="#06b6d4" />
              <Text className="text-white text-lg font-semibold ml-2">
                Your Tools
              </Text>
            </Animated.View>

            {features.map((feature, index) => (
              <FeatureCard
                key={feature.title}
                {...feature}
                delay={250 + index * 50}
              />
            ))}
          </View>
        </ScrollView>
      </LinearGradient>
    </View>
  );
}
