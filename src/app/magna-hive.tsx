import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, router } from 'expo-router';
import {
  Target,
  Plus,
  MoreVertical,
  Eye,
  TrendingUp,
  Globe,
  FileEdit,
  Archive,
  ChevronRight,
  Lock,
} from 'lucide-react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import type { Funnel } from '@/lib/api';
import { useSubscription } from '@/lib/subscriptionStore';
import { LockedOverlay } from '@/components/Paywall';

// Mock data
const mockFunnels: Funnel[] = [
  {
    id: '1',
    name: 'Product Launch Funnel',
    status: 'published',
    steps: 5,
    visits: 1240,
    conversions: 86,
    createdAt: '2024-01-10',
  },
  {
    id: '2',
    name: 'Lead Magnet Funnel',
    status: 'published',
    steps: 3,
    visits: 890,
    conversions: 124,
    createdAt: '2024-01-08',
  },
  {
    id: '3',
    name: 'Webinar Registration',
    status: 'draft',
    steps: 4,
    visits: 0,
    conversions: 0,
    createdAt: '2024-01-12',
  },
];

function FunnelCard({ funnel }: { funnel: Funnel }) {
  const statusConfig = {
    published: { color: '#10b981', bg: 'bg-emerald-500/10', label: 'Live' },
    draft: { color: '#f59e0b', bg: 'bg-amber-500/10', label: 'Draft' },
    archived: { color: '#64748b', bg: 'bg-slate-500/10', label: 'Archived' },
  };

  const status = statusConfig[funnel.status];
  const conversionRate =
    funnel.visits > 0
      ? ((funnel.conversions / funnel.visits) * 100).toFixed(1)
      : '0';

  return (
    <Pressable className="mb-4 active:scale-[0.98]">
      <View className="bg-slate-800/50 rounded-2xl p-5 border border-slate-700/30">
        <View className="flex-row items-start justify-between mb-4">
          <View className="flex-1">
            <View className="flex-row items-center mb-2">
              <View
                className={`px-2 py-1 rounded-lg ${status.bg}`}
                style={{ borderWidth: 1, borderColor: status.color + '40' }}
              >
                <Text style={{ color: status.color }} className="text-xs font-medium">
                  {status.label}
                </Text>
              </View>
              <Text className="text-slate-500 text-xs ml-2">
                {funnel.steps} steps
              </Text>
            </View>
            <Text className="text-white font-semibold text-lg">
              {funnel.name}
            </Text>
          </View>
          <Pressable className="p-2">
            <MoreVertical size={18} color="#64748b" />
          </Pressable>
        </View>

        {/* Stats */}
        <View className="flex-row gap-4">
          <View className="flex-1 bg-slate-900/50 rounded-xl p-3">
            <View className="flex-row items-center mb-1">
              <Eye size={12} color="#64748b" />
              <Text className="text-slate-500 text-xs ml-1">Visits</Text>
            </View>
            <Text className="text-white font-bold text-lg">
              {funnel.visits.toLocaleString()}
            </Text>
          </View>
          <View className="flex-1 bg-slate-900/50 rounded-xl p-3">
            <View className="flex-row items-center mb-1">
              <TrendingUp size={12} color="#64748b" />
              <Text className="text-slate-500 text-xs ml-1">Conversions</Text>
            </View>
            <Text className="text-white font-bold text-lg">
              {funnel.conversions}
            </Text>
          </View>
          <View className="flex-1 bg-slate-900/50 rounded-xl p-3">
            <View className="flex-row items-center mb-1">
              <Target size={12} color="#64748b" />
              <Text className="text-slate-500 text-xs ml-1">Rate</Text>
            </View>
            <Text className="text-emerald-400 font-bold text-lg">
              {conversionRate}%
            </Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

function CreateFunnelModal({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  const [name, setName] = useState('');

  const templates = [
    { id: 'lead', name: 'Lead Capture', icon: Target },
    { id: 'sales', name: 'Sales Page', icon: TrendingUp },
    { id: 'webinar', name: 'Webinar', icon: Globe },
    { id: 'blank', name: 'Start Blank', icon: FileEdit },
  ];

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View className="flex-1 bg-slate-900">
        <View className="px-6 pt-6 pb-4 border-b border-slate-800">
          <View className="flex-row items-center justify-between">
            <Text className="text-white text-xl font-bold">New Funnel</Text>
            <Pressable onPress={onClose}>
              <Text className="text-orange-400">Cancel</Text>
            </Pressable>
          </View>
        </View>

        <ScrollView className="flex-1 px-6 pt-6">
          <Text className="text-slate-400 text-sm mb-2">Funnel Name</Text>
          <TextInput
            className="bg-slate-800 rounded-xl px-4 py-4 text-white mb-6"
            placeholder="Enter funnel name..."
            placeholderTextColor="#64748b"
            value={name}
            onChangeText={setName}
          />

          <Text className="text-slate-400 text-sm mb-4">Choose a Template</Text>
          <View className="flex-row flex-wrap gap-3">
            {templates.map((template) => {
              const Icon = template.icon;
              return (
                <Pressable
                  key={template.id}
                  className="bg-slate-800 border border-slate-700/50 rounded-xl p-4 w-[48%] active:border-orange-500"
                >
                  <View className="w-10 h-10 bg-orange-500/10 rounded-xl items-center justify-center mb-3">
                    <Icon size={20} color="#f97316" />
                  </View>
                  <Text className="text-white font-medium">{template.name}</Text>
                </Pressable>
              );
            })}
          </View>
        </ScrollView>

        <View className="px-6 pb-10 pt-4">
          <Pressable onPress={onClose}>
            <LinearGradient
              colors={['#f97316', '#ef4444']}
              style={{
                borderRadius: 16,
                paddingVertical: 16,
                alignItems: 'center',
              }}
            >
              <Text className="text-white font-semibold text-lg">
                Create Funnel
              </Text>
            </LinearGradient>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

export default function MagnaHiveScreen() {
  const [showCreate, setShowCreate] = useState(false);
  const [funnels] = useState<Funnel[]>(mockFunnels);
  const { canAccessMagnaHive } = useSubscription();

  const totalVisits = funnels.reduce((sum, f) => sum + f.visits, 0);
  const totalConversions = funnels.reduce((sum, f) => sum + f.conversions, 0);

  // Show locked state for free users
  if (!canAccessMagnaHive) {
    return (
      <View className="flex-1 bg-slate-900">
        <Stack.Screen
          options={{
            title: 'Magna Hive',
            headerStyle: { backgroundColor: '#0f172a' },
            headerTintColor: '#fff',
            headerTitleStyle: { fontWeight: '600' },
          }}
        />
        <LinearGradient colors={['#0f172a', '#1e293b']} style={{ flex: 1 }}>
          <View className="flex-1 justify-center items-center px-6">
            <View className="w-24 h-24 rounded-full bg-orange-500/10 items-center justify-center mb-6">
              <Lock size={48} color="#f97316" />
            </View>
            <Text className="text-white text-2xl font-bold text-center mb-3">
              Magna Hive is Premium
            </Text>
            <Text className="text-slate-400 text-center mb-8 px-4">
              Upgrade to Starter or higher to build high-converting funnels and landing pages.
            </Text>
            <Pressable
              onPress={() => router.push('/pricing')}
              className="active:opacity-80"
            >
              <LinearGradient
                colors={['#f97316', '#ef4444']}
                style={{
                  borderRadius: 16,
                  paddingVertical: 16,
                  paddingHorizontal: 32,
                  alignItems: 'center',
                }}
              >
                <Text className="text-white font-bold text-lg">
                  View Plans
                </Text>
              </LinearGradient>
            </Pressable>
          </View>
        </LinearGradient>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-slate-900">
      <Stack.Screen
        options={{
          title: 'Magna Hive',
          headerStyle: { backgroundColor: '#0f172a' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: '600' },
        }}
      />
      <LinearGradient colors={['#0f172a', '#1e293b']} style={{ flex: 1 }}>
        <ScrollView
          className="flex-1 px-6 pt-4"
          contentContainerStyle={{ paddingBottom: 100 }}
        >
          {/* Hero */}
          <Animated.View entering={FadeInDown.delay(100).springify()}>
            <LinearGradient
              colors={['#f97316', '#ef4444']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ borderRadius: 24, padding: 24, marginBottom: 24 }}
            >
              <View className="flex-row items-center mb-3">
                <Target size={24} color="#fff" />
                <Text className="text-white/80 text-sm ml-2">
                  Funnel Builder
                </Text>
              </View>
              <Text className="text-white text-2xl font-bold mb-2">
                Build High-Converting Funnels
              </Text>
              <Text className="text-white/70 mb-4">
                Create landing pages and sales funnels that convert visitors into customers
              </Text>

              {/* Quick Stats */}
              <View className="flex-row gap-3 mb-4">
                <View className="flex-1 bg-white/10 rounded-xl p-3">
                  <Text className="text-white/60 text-xs">Total Visits</Text>
                  <Text className="text-white font-bold text-xl">
                    {totalVisits.toLocaleString()}
                  </Text>
                </View>
                <View className="flex-1 bg-white/10 rounded-xl p-3">
                  <Text className="text-white/60 text-xs">Conversions</Text>
                  <Text className="text-white font-bold text-xl">
                    {totalConversions}
                  </Text>
                </View>
              </View>

              <Pressable
                onPress={() => setShowCreate(true)}
                className="bg-white/20 rounded-xl py-3 flex-row items-center justify-center"
              >
                <Plus size={20} color="#fff" />
                <Text className="text-white font-semibold ml-2">
                  Create New Funnel
                </Text>
              </Pressable>
            </LinearGradient>
          </Animated.View>

          {/* Funnels List */}
          <Animated.View entering={FadeInDown.delay(200).springify()}>
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-white text-lg font-semibold">
                Your Funnels ({funnels.length})
              </Text>
              <Pressable className="flex-row items-center">
                <Text className="text-orange-400 text-sm">View All</Text>
                <ChevronRight size={16} color="#f97316" />
              </Pressable>
            </View>

            {funnels.map((funnel, index) => (
              <Animated.View
                key={funnel.id}
                entering={FadeInDown.delay(250 + index * 50).springify()}
              >
                <FunnelCard funnel={funnel} />
              </Animated.View>
            ))}
          </Animated.View>
        </ScrollView>
      </LinearGradient>

      <CreateFunnelModal
        visible={showCreate}
        onClose={() => setShowCreate(false)}
      />
    </View>
  );
}
