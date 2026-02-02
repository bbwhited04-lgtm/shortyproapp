import React from 'react';
import { View, Text, Pressable, Modal } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Lock, Sparkles, X } from 'lucide-react-native';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import Animated, { FadeIn, SlideInUp } from 'react-native-reanimated';

interface PaywallModalProps {
  visible: boolean;
  onClose: () => void;
  feature: string;
  description?: string;
  requiredTier?: 'starter' | 'pro' | 'lifetime';
}

export function PaywallModal({
  visible,
  onClose,
  feature,
  description,
  requiredTier = 'starter',
}: PaywallModalProps) {
  const handleUpgrade = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onClose();
    router.push('/pricing');
  };

  const tierNames = {
    starter: 'Starter',
    pro: 'Pro',
    lifetime: 'Own the Stack',
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable
        className="flex-1 bg-black/70 justify-center items-center px-6"
        onPress={onClose}
      >
        <Animated.View
          entering={SlideInUp.springify()}
          className="w-full max-w-sm"
        >
          <Pressable onPress={(e) => e.stopPropagation()}>
            <LinearGradient
              colors={['#1e293b', '#0f172a']}
              style={{
                borderRadius: 24,
                padding: 24,
                borderWidth: 1,
                borderColor: '#334155',
              }}
            >
              {/* Close button */}
              <Pressable
                onPress={onClose}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-700 items-center justify-center"
              >
                <X size={16} color="#94a3b8" />
              </Pressable>

              {/* Icon */}
              <View className="items-center mb-4">
                <View className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 items-center justify-center">
                  <Lock size={32} color="#fff" />
                </View>
              </View>

              {/* Title */}
              <Text className="text-white text-xl font-bold text-center mb-2">
                Unlock {feature}
              </Text>

              {/* Description */}
              <Text className="text-slate-400 text-center mb-6">
                {description ||
                  `Upgrade to ${tierNames[requiredTier]} or higher to access this feature.`}
              </Text>

              {/* Features preview */}
              <View className="bg-slate-800/50 rounded-2xl p-4 mb-6">
                <View className="flex-row items-center mb-2">
                  <Sparkles size={16} color="#06b6d4" />
                  <Text className="text-white ml-2 text-sm">
                    Full access to all tools
                  </Text>
                </View>
                <View className="flex-row items-center mb-2">
                  <Sparkles size={16} color="#06b6d4" />
                  <Text className="text-white ml-2 text-sm">
                    Download & share to social
                  </Text>
                </View>
                <View className="flex-row items-center">
                  <Sparkles size={16} color="#06b6d4" />
                  <Text className="text-white ml-2 text-sm">
                    Priority support
                  </Text>
                </View>
              </View>

              {/* CTA Button */}
              <Pressable onPress={handleUpgrade} className="active:opacity-80">
                <LinearGradient
                  colors={['#06b6d4', '#0891b2']}
                  style={{
                    borderRadius: 16,
                    paddingVertical: 16,
                    alignItems: 'center',
                  }}
                >
                  <Text className="text-white font-bold text-lg">
                    View Plans
                  </Text>
                </LinearGradient>
              </Pressable>

              {/* Secondary action */}
              <Pressable onPress={onClose} className="mt-4">
                <Text className="text-slate-500 text-center text-sm">
                  Maybe later
                </Text>
              </Pressable>
            </LinearGradient>
          </Pressable>
        </Animated.View>
      </Pressable>
    </Modal>
  );
}

interface PaywallBannerProps {
  feature: string;
  compact?: boolean;
}

export function PaywallBanner({ feature, compact = false }: PaywallBannerProps) {
  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/pricing');
  };

  if (compact) {
    return (
      <Pressable
        onPress={handlePress}
        className="flex-row items-center bg-slate-800/80 rounded-xl px-4 py-3 active:opacity-80"
      >
        <Lock size={16} color="#06b6d4" />
        <Text className="text-slate-300 text-sm ml-2 flex-1">
          Upgrade to unlock {feature}
        </Text>
        <Text className="text-cyan-400 text-sm font-semibold">Upgrade</Text>
      </Pressable>
    );
  }

  return (
    <LinearGradient
      colors={['#1e293b', '#0f172a']}
      style={{
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: '#334155',
      }}
    >
      <View className="flex-row items-center mb-3">
        <View className="w-10 h-10 rounded-full bg-cyan-500/20 items-center justify-center">
          <Lock size={20} color="#06b6d4" />
        </View>
        <View className="flex-1 ml-3">
          <Text className="text-white font-semibold">Premium Feature</Text>
          <Text className="text-slate-400 text-sm">Upgrade to access {feature}</Text>
        </View>
      </View>
      <Pressable onPress={handlePress} className="active:opacity-80">
        <LinearGradient
          colors={['#06b6d4', '#0891b2']}
          style={{
            borderRadius: 12,
            paddingVertical: 12,
            alignItems: 'center',
          }}
        >
          <Text className="text-white font-semibold">View Plans</Text>
        </LinearGradient>
      </Pressable>
    </LinearGradient>
  );
}

interface LockedOverlayProps {
  feature: string;
  children: React.ReactNode;
}

export function LockedOverlay({ feature, children }: LockedOverlayProps) {
  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/pricing');
  };

  return (
    <View className="relative">
      {/* Blurred content */}
      <View style={{ opacity: 0.3 }} pointerEvents="none">
        {children}
      </View>

      {/* Overlay */}
      <Pressable
        onPress={handlePress}
        className="absolute inset-0 bg-slate-900/60 items-center justify-center rounded-2xl active:bg-slate-900/70"
      >
        <View className="items-center px-6">
          <View className="w-14 h-14 rounded-full bg-slate-800 items-center justify-center mb-3">
            <Lock size={24} color="#06b6d4" />
          </View>
          <Text className="text-white font-semibold text-center mb-1">
            {feature}
          </Text>
          <Text className="text-slate-400 text-sm text-center mb-4">
            Upgrade to unlock
          </Text>
          <View className="bg-cyan-500 rounded-full px-5 py-2">
            <Text className="text-white font-semibold text-sm">View Plans</Text>
          </View>
        </View>
      </Pressable>
    </View>
  );
}
