import React from 'react';
import { View, Text, ScrollView, Pressable, Alert, Linking } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import {
  User,
  Mail,
  LogOut,
  ChevronRight,
  Bell,
  Shield,
  HelpCircle,
  ExternalLink,
  Zap,
  Crown,
  FileText,
  Scale,
  Palette,
  RotateCcw,
} from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useAuthStore } from '@/lib/state/auth-store';

function SettingsItem({
  icon,
  title,
  subtitle,
  onPress,
  danger,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  danger?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center py-4 px-4 active:bg-slate-800/30"
    >
      <View
        className={`w-10 h-10 rounded-xl items-center justify-center mr-4 ${
          danger ? 'bg-red-500/10' : 'bg-slate-800'
        }`}
      >
        {icon}
      </View>
      <View className="flex-1">
        <Text className={`font-medium ${danger ? 'text-red-400' : 'text-white'}`}>
          {title}
        </Text>
        {subtitle && <Text className="text-slate-500 text-sm">{subtitle}</Text>}
      </View>
      <ChevronRight size={18} color={danger ? '#f87171' : '#64748b'} />
    </Pressable>
  );
}

export default function ProfileScreen() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/login');
        },
      },
    ]);
  };

  const openLink = (url: string) => {
    Linking.openURL(url).catch((err) => {
      console.error('Failed to open URL:', err);
    });
  };

  return (
    <View className="flex-1 bg-slate-900">
      <LinearGradient colors={['#0f172a', '#1e293b']} style={{ flex: 1 }}>
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingBottom: 100 }}
        >
          {/* Profile Header */}
          <Animated.View
            entering={FadeInDown.delay(100).springify()}
            className="items-center pt-8 pb-6 px-6"
          >
            <View className="w-24 h-24 bg-cyan-500/20 rounded-full items-center justify-center mb-4 border-2 border-cyan-500/30">
              <User size={40} color="#06b6d4" />
            </View>
            <Text className="text-white text-2xl font-bold">
              {user?.name || 'User'}
            </Text>
            <Text className="text-slate-400 mt-1">
              {user?.email || 'user@shortypro.com'}
            </Text>

            {/* Plan Badge */}
            <Pressable
              onPress={() => router.push('/pricing')}
              className="flex-row items-center mt-4 bg-cyan-500/10 px-4 py-2 rounded-full border border-cyan-500/30 active:opacity-80"
            >
              <Zap size={16} color="#06b6d4" />
              <Text className="text-cyan-400 font-medium ml-2">Pro Plan</Text>
              <ChevronRight size={14} color="#06b6d4" className="ml-1" />
            </Pressable>
          </Animated.View>

          {/* Upgrade Banner */}
          <Animated.View
            entering={FadeInDown.delay(125).springify()}
            className="px-6 mb-4"
          >
            <Pressable
              onPress={() => router.push('/pricing')}
              className="active:scale-[0.98]"
            >
              <LinearGradient
                colors={['#8b5cf6', '#6366f1']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{ borderRadius: 16, padding: 16 }}
              >
                <View className="flex-row items-center">
                  <View className="w-10 h-10 bg-white/20 rounded-xl items-center justify-center mr-3">
                    <Crown size={20} color="#fff" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-white font-semibold">Upgrade Your Plan</Text>
                    <Text className="text-white/70 text-sm">
                      Unlock unlimited features
                    </Text>
                  </View>
                  <ChevronRight size={20} color="#fff" />
                </View>
              </LinearGradient>
            </Pressable>
          </Animated.View>

          {/* Quick Stats */}
          <Animated.View
            entering={FadeInDown.delay(150).springify()}
            className="flex-row gap-3 px-6 mb-6"
          >
            <View className="flex-1 bg-slate-800/50 rounded-2xl p-4 border border-slate-700/30">
              <Text className="text-slate-400 text-xs mb-1">Videos Created</Text>
              <Text className="text-white text-2xl font-bold">12</Text>
            </View>
            <View className="flex-1 bg-slate-800/50 rounded-2xl p-4 border border-slate-700/30">
              <Text className="text-slate-400 text-xs mb-1">Funnels</Text>
              <Text className="text-white text-2xl font-bold">5</Text>
            </View>
            <View className="flex-1 bg-slate-800/50 rounded-2xl p-4 border border-slate-700/30">
              <Text className="text-slate-400 text-xs mb-1">Contacts</Text>
              <Text className="text-white text-2xl font-bold">248</Text>
            </View>
          </Animated.View>

          {/* Settings Sections */}
          <Animated.View entering={FadeInDown.delay(200).springify()}>
            <View className="px-6 mb-2">
              <Text className="text-slate-500 text-xs uppercase tracking-wider">
                Account
              </Text>
            </View>
            <View className="bg-slate-800/30 mx-4 rounded-2xl overflow-hidden mb-6">
              <SettingsItem
                icon={<User size={20} color="#94a3b8" />}
                title="Edit Profile"
                subtitle="Update your information"
              />
              <SettingsItem
                icon={<Mail size={20} color="#94a3b8" />}
                title="Email Settings"
                subtitle="Manage email preferences"
              />
              <SettingsItem
                icon={<Bell size={20} color="#94a3b8" />}
                title="Notifications"
                subtitle="Push & email notifications"
              />
            </View>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(250).springify()}>
            <View className="px-6 mb-2">
              <Text className="text-slate-500 text-xs uppercase tracking-wider">
                Support
              </Text>
            </View>
            <View className="bg-slate-800/30 mx-4 rounded-2xl overflow-hidden mb-6">
              <SettingsItem
                icon={<HelpCircle size={20} color="#94a3b8" />}
                title="Help Center"
                subtitle="FAQs and guides"
                onPress={() => openLink('https://shortypro.com')}
              />
              <SettingsItem
                icon={<ExternalLink size={20} color="#94a3b8" />}
                title="Visit ShortyPro.com"
                subtitle="Open in browser"
                onPress={() => openLink('https://shortypro.com')}
              />
            </View>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(275).springify()}>
            <View className="px-6 mb-2">
              <Text className="text-slate-500 text-xs uppercase tracking-wider">
                Legal
              </Text>
            </View>
            <View className="bg-slate-800/30 mx-4 rounded-2xl overflow-hidden mb-6">
              <SettingsItem
                icon={<Shield size={20} color="#94a3b8" />}
                title="Privacy Policy"
                subtitle="How we protect your data"
                onPress={() => openLink('https://shortypro.com/privacy.html')}
              />
              <SettingsItem
                icon={<FileText size={20} color="#94a3b8" />}
                title="Terms of Service"
                subtitle="Terms and conditions"
                onPress={() => openLink('https://shortypro.com/terms.html')}
              />
              <SettingsItem
                icon={<Scale size={20} color="#94a3b8" />}
                title="Acceptable Use Policy"
                subtitle="Usage guidelines"
                onPress={() => openLink('https://shortypro.com/acceptable_use.html')}
              />
              <SettingsItem
                icon={<Palette size={20} color="#94a3b8" />}
                title="Branding Guidelines"
                subtitle="Brand assets and usage"
                onPress={() => openLink('https://shortypro.com/branding.html')}
              />
              <SettingsItem
                icon={<RotateCcw size={20} color="#94a3b8" />}
                title="Refund Policy"
                subtitle="Refund information"
                onPress={() => openLink('https://shortypro.com/refund.html')}
              />
            </View>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(300).springify()}>
            <View className="bg-slate-800/30 mx-4 rounded-2xl overflow-hidden">
              <SettingsItem
                icon={<LogOut size={20} color="#f87171" />}
                title="Sign Out"
                onPress={handleLogout}
                danger
              />
            </View>
          </Animated.View>

          {/* Version */}
          <Animated.View
            entering={FadeInDown.delay(350).springify()}
            className="items-center mt-8 mb-4"
          >
            <Text className="text-slate-600 text-sm">ShortyPro App v1.0.0</Text>
            <Text className="text-slate-700 text-xs mt-2">DEAD APP CORP</Text>
          </Animated.View>
        </ScrollView>
      </LinearGradient>
    </View>
  );
}
