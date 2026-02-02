import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Zap, Mail, Lock, Eye, EyeOff } from 'lucide-react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useAuthStore } from '@/lib/state/auth-store';
import { login as apiLogin, oauthLogin } from '@/lib/api';
import * as WebBrowser from 'expo-web-browser';

// OAuth provider icons
function GoogleIcon() {
  return (
    <View className="w-6 h-6 items-center justify-center">
      <Text className="text-lg font-bold" style={{ color: '#4285F4' }}>G</Text>
    </View>
  );
}

function FacebookIcon() {
  return (
    <View className="w-6 h-6 items-center justify-center rounded" style={{ backgroundColor: '#1877F2' }}>
      <Text className="text-white font-bold text-sm">f</Text>
    </View>
  );
}

function AppleIcon() {
  return (
    <View className="w-6 h-6 items-center justify-center">
      <Text className="text-white text-lg"></Text>
    </View>
  );
}

function MicrosoftIcon() {
  return (
    <View className="w-6 h-6 flex-row flex-wrap">
      <View className="w-[11px] h-[11px] bg-[#F25022] mr-[2px] mb-[2px]" />
      <View className="w-[11px] h-[11px] bg-[#7FBA00] mb-[2px]" />
      <View className="w-[11px] h-[11px] bg-[#00A4EF] mr-[2px]" />
      <View className="w-[11px] h-[11px] bg-[#FFB900]" />
    </View>
  );
}

interface OAuthButtonProps {
  provider: 'google' | 'facebook' | 'apple' | 'microsoft';
  onPress: () => void;
  isLoading: boolean;
}

function OAuthButton({ provider, onPress, isLoading }: OAuthButtonProps) {
  const config = {
    google: { icon: <GoogleIcon />, label: 'Google', bg: 'bg-white' },
    facebook: { icon: <FacebookIcon />, label: 'Facebook', bg: 'bg-[#1877F2]' },
    apple: { icon: <AppleIcon />, label: 'iCloud', bg: 'bg-black' },
    microsoft: { icon: <MicrosoftIcon />, label: 'Microsoft', bg: 'bg-slate-800' },
  };

  const { icon, label, bg } = config[provider];
  const isLight = provider === 'google';

  return (
    <Pressable
      onPress={onPress}
      disabled={isLoading}
      className={`flex-1 flex-row items-center justify-center py-3 px-4 rounded-xl ${bg} active:opacity-80`}
    >
      {isLoading ? (
        <ActivityIndicator size="small" color={isLight ? '#000' : '#fff'} />
      ) : (
        <>
          {icon}
          <Text className={`ml-2 font-medium text-sm ${isLight ? 'text-gray-700' : 'text-white'}`}>
            {label}
          </Text>
        </>
      )}
    </Pressable>
  );
}

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProvider, setLoadingProvider] = useState<string | null>(null);
  const login = useAuthStore((s) => s.login);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter your email and password');
      return;
    }

    setIsLoading(true);
    try {
      const response = await apiLogin(email, password);
      if (response.success && response.user && response.token) {
        await login(response.user, response.token);
        router.replace('/(tabs)');
      } else {
        Alert.alert('Login Failed', response.error || 'Please check your credentials');
      }
    } catch {
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuthLogin = async (provider: 'google' | 'facebook' | 'apple' | 'microsoft') => {
    setLoadingProvider(provider);
    try {
      const response = await oauthLogin(provider);
      if (response.success && response.user && response.token) {
        await login(response.user, response.token);
        router.replace('/(tabs)');
      } else if (response.authUrl) {
        const result = await WebBrowser.openAuthSessionAsync(response.authUrl);
        if (result.type === 'success' && result.url) {
          const url = new URL(result.url);
          const token = url.searchParams.get('token');
          const userJson = url.searchParams.get('user');
          if (token && userJson) {
            const user = JSON.parse(decodeURIComponent(userJson));
            await login(user, token);
            router.replace('/(tabs)');
          }
        }
      } else {
        Alert.alert('Login Failed', response.error || 'OAuth login failed');
      }
    } catch {
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setLoadingProvider(null);
    }
  };

  return (
    <View className="flex-1">
      <LinearGradient
        colors={['#0f172a', '#1e293b', '#0f172a']}
        style={{ flex: 1 }}
      >
        <SafeAreaView className="flex-1">
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            className="flex-1"
          >
            <ScrollView
              className="flex-1 px-6"
              contentContainerStyle={{ paddingBottom: 40 }}
              showsVerticalScrollIndicator={false}
            >
              {/* Logo Section */}
              <Animated.View
                entering={FadeInUp.delay(100).springify()}
                className="items-center mt-12 mb-8"
              >
                <View className="w-20 h-20 bg-cyan-500 rounded-3xl items-center justify-center mb-4 shadow-lg">
                  <Zap size={40} color="#fff" strokeWidth={2.5} />
                </View>
                <Text className="text-4xl font-bold text-white tracking-tight">
                  ShortyPro
                </Text>
                <Text className="text-slate-400 mt-2 text-base">
                  Create. Connect. Convert.
                </Text>
              </Animated.View>

              {/* OAuth Buttons */}
              <Animated.View
                entering={FadeInDown.delay(150).springify()}
                className="mb-6"
              >
                <View className="flex-row gap-2 mb-3">
                  <OAuthButton
                    provider="google"
                    onPress={() => handleOAuthLogin('google')}
                    isLoading={loadingProvider === 'google'}
                  />
                  <OAuthButton
                    provider="facebook"
                    onPress={() => handleOAuthLogin('facebook')}
                    isLoading={loadingProvider === 'facebook'}
                  />
                </View>
                <View className="flex-row gap-2">
                  <OAuthButton
                    provider="apple"
                    onPress={() => handleOAuthLogin('apple')}
                    isLoading={loadingProvider === 'apple'}
                  />
                  <OAuthButton
                    provider="microsoft"
                    onPress={() => handleOAuthLogin('microsoft')}
                    isLoading={loadingProvider === 'microsoft'}
                  />
                </View>
              </Animated.View>

              {/* Divider */}
              <Animated.View
                entering={FadeInDown.delay(200).springify()}
                className="flex-row items-center mb-6"
              >
                <View className="flex-1 h-[1px] bg-slate-700" />
                <Text className="text-slate-500 mx-4 text-sm">or continue with email</Text>
                <View className="flex-1 h-[1px] bg-slate-700" />
              </Animated.View>

              {/* Login Form */}
              <Animated.View
                entering={FadeInDown.delay(250).springify()}
                className="bg-slate-800/50 rounded-3xl p-6 border border-slate-700/50"
              >
                {/* Email Input */}
                <View className="mb-4">
                  <Text className="text-slate-400 text-sm mb-2 ml-1">Email</Text>
                  <View className="flex-row items-center bg-slate-900/50 rounded-2xl px-4 border border-slate-700/50">
                    <Mail size={20} color="#94a3b8" />
                    <TextInput
                      className="flex-1 py-4 px-3 text-white text-base"
                      placeholder="Enter your email"
                      placeholderTextColor="#64748b"
                      value={email}
                      onChangeText={setEmail}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                  </View>
                </View>

                {/* Password Input */}
                <View className="mb-6">
                  <Text className="text-slate-400 text-sm mb-2 ml-1">Password</Text>
                  <View className="flex-row items-center bg-slate-900/50 rounded-2xl px-4 border border-slate-700/50">
                    <Lock size={20} color="#94a3b8" />
                    <TextInput
                      className="flex-1 py-4 px-3 text-white text-base"
                      placeholder="Enter your password"
                      placeholderTextColor="#64748b"
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry={!showPassword}
                      autoCapitalize="none"
                    />
                    <Pressable onPress={() => setShowPassword(!showPassword)}>
                      {showPassword ? (
                        <EyeOff size={20} color="#94a3b8" />
                      ) : (
                        <Eye size={20} color="#94a3b8" />
                      )}
                    </Pressable>
                  </View>
                </View>

                {/* Login Button */}
                <Pressable
                  onPress={handleLogin}
                  disabled={isLoading}
                  className="active:opacity-80"
                >
                  <LinearGradient
                    colors={['#06b6d4', '#0891b2']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={{
                      borderRadius: 16,
                      paddingVertical: 16,
                      alignItems: 'center',
                    }}
                  >
                    {isLoading ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <Text className="text-white font-semibold text-lg">
                        Sign In
                      </Text>
                    )}
                  </LinearGradient>
                </Pressable>

                {/* Forgot Password */}
                <Pressable className="mt-4 items-center">
                  <Text className="text-cyan-400 text-sm">
                    Forgot your password?
                  </Text>
                </Pressable>
              </Animated.View>

              {/* Sign Up Link */}
              <Animated.View
                entering={FadeInDown.delay(300).springify()}
                className="flex-row justify-center mt-6"
              >
                <Text className="text-slate-400">Don't have an account? </Text>
                <Pressable>
                  <Text className="text-cyan-400 font-semibold">
                    Visit ShortyPro.com
                  </Text>
                </Pressable>
              </Animated.View>
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </LinearGradient>
    </View>
  );
}
