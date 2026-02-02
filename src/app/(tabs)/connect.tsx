import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Pressable, Alert, Modal } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import {
  Link2,
  CheckCircle2,
  ChevronRight,
  X,
  AlertCircle,
  Unlink,
  Search,
  Contact,
  Users,
  Import,
  Smartphone,
  Building2,
  HardDrive,
  Cloud,
  Headphones,
  FileSpreadsheet,
  Mail,
  Briefcase,
  Package,
  FolderOpen,
  Plus,
  ChevronDown,
  Shield,
} from 'lucide-react-native';
import Animated, {
  FadeInDown,
  FadeInUp,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import * as Contacts from 'expo-contacts';
import {
  useSocialAccountsStore,
  SocialPlatform,
  SocialAccount,
} from '@/lib/state/social-accounts-store';

interface PlatformInfo {
  id: SocialPlatform;
  name: string;
  color: string;
  gradient: [string, string];
  icon: string;
  description: string;
}

const PLATFORMS: PlatformInfo[] = [
  {
    id: 'google',
    name: 'Google',
    color: '#EA4335',
    gradient: ['#EA4335', '#FBBC05'],
    icon: 'G',
    description: 'Google Business & YouTube Studio',
  },
  {
    id: 'facebook',
    name: 'Facebook',
    color: '#1877F2',
    gradient: ['#1877F2', '#42A5F5'],
    icon: 'f',
    description: 'Pages, Groups & Messenger',
  },
  {
    id: 'instagram',
    name: 'Instagram',
    color: '#E4405F',
    gradient: ['#833AB4', '#E4405F'],
    icon: 'IG',
    description: 'Posts, Stories & Reels',
  },
  {
    id: 'tiktok',
    name: 'TikTok',
    color: '#000000',
    gradient: ['#00F2EA', '#FF0050'],
    icon: 'TT',
    description: 'Videos & Creator tools',
  },
  {
    id: 'youtube',
    name: 'YouTube',
    color: '#FF0000',
    gradient: ['#FF0000', '#CC0000'],
    icon: 'YT',
    description: 'Channel & Studio analytics',
  },
  {
    id: 'twitter',
    name: 'X (Twitter)',
    color: '#000000',
    gradient: ['#14171A', '#657786'],
    icon: 'X',
    description: 'Tweets, Spaces & Analytics',
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    color: '#0A66C2',
    gradient: ['#0A66C2', '#0077B5'],
    icon: 'in',
    description: 'Company pages & Posts',
  },
  {
    id: 'threads',
    name: 'Threads',
    color: '#000000',
    gradient: ['#000000', '#333333'],
    icon: '@',
    description: 'Text posts & Conversations',
  },
  {
    id: 'pinterest',
    name: 'Pinterest',
    color: '#E60023',
    gradient: ['#E60023', '#BD081C'],
    icon: 'P',
    description: 'Pins, Boards & Ideas',
  },
  {
    id: 'snapchat',
    name: 'Snapchat',
    color: '#FFFC00',
    gradient: ['#FFFC00', '#FFE600'],
    icon: 'S',
    description: 'Snaps & Spotlight',
  },
  {
    id: 'reddit',
    name: 'Reddit',
    color: '#FF4500',
    gradient: ['#FF4500', '#FF5700'],
    icon: 'R',
    description: 'Communities & Posts',
  },
  {
    id: 'twitch',
    name: 'Twitch',
    color: '#9146FF',
    gradient: ['#9146FF', '#6441A5'],
    icon: 'TV',
    description: 'Streams & Clips',
  },
  {
    id: 'discord',
    name: 'Discord',
    color: '#5865F2',
    gradient: ['#5865F2', '#7289DA'],
    icon: 'D',
    description: 'Servers & Communities',
  },
  {
    id: 'whatsapp',
    name: 'WhatsApp',
    color: '#25D366',
    gradient: ['#25D366', '#128C7E'],
    icon: 'W',
    description: 'Business & Channels',
  },
  {
    id: 'telegram',
    name: 'Telegram',
    color: '#0088CC',
    gradient: ['#0088CC', '#229ED9'],
    icon: 'T',
    description: 'Channels & Groups',
  },
];

function generateMockAccount(platform: SocialPlatform, accountType: 'personal' | 'business' | 'page' | 'creator' = 'personal', accountNumber?: number): SocialAccount {
  const platformInfo = PLATFORMS.find((p) => p.id === platform)!;
  const suffix = accountNumber ? ` ${accountNumber}` : '';
  const typeLabel = accountType === 'page' ? 'Page' : accountType === 'business' ? 'Business' : accountType === 'creator' ? 'Creator' : '';
  return {
    id: `${platform}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    platform,
    username: `@user_${platform}${accountNumber || ''}`,
    displayName: `${typeLabel ? typeLabel + ' - ' : ''}My ${platformInfo.name}${suffix}`,
    accountType,
    followers: Math.floor(Math.random() * 10000) + 100,
    following: Math.floor(Math.random() * 500) + 50,
    posts: Math.floor(Math.random() * 200) + 10,
    engagement: Math.random() * 10 + 2,
    connectedAt: new Date().toISOString(),
    isActive: true,
  };
}

function PlatformCard({
  platform,
  accountCount,
  accounts,
  onConnect,
  onManage,
  delay,
}: {
  platform: PlatformInfo;
  accountCount: number;
  accounts: SocialAccount[];
  onConnect: () => void;
  onManage: () => void;
  delay: number;
}) {
  const scale = useSharedValue(1);
  const isConnected = accountCount > 0;

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    scale.value = withSequence(withSpring(0.95), withSpring(1));

    if (isConnected) {
      onManage();
    } else {
      onConnect();
    }
  };

  return (
    <Animated.View
      entering={FadeInDown.delay(delay).springify()}
      style={animatedStyle}
    >
      <Pressable onPress={handlePress} className="mb-3">
        <BlurView intensity={15} tint="dark" style={{ borderRadius: 20, overflow: 'hidden' }}>
          <View
            className={`p-4 border rounded-[20px] ${
              isConnected ? 'border-emerald-500/30' : 'border-white/10'
            }`}
          >
            <View className="flex-row items-center">
              {/* Platform Icon */}
              <LinearGradient
                colors={platform.gradient as [string, string]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 14,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text className="text-white font-bold text-lg">{platform.icon}</Text>
              </LinearGradient>

              {/* Platform Info */}
              <View className="flex-1 ml-4">
                <View className="flex-row items-center">
                  <Text className="text-white font-semibold text-base">{platform.name}</Text>
                  {isConnected && (
                    <View className="ml-2 flex-row items-center bg-emerald-500/20 px-2 py-0.5 rounded-full">
                      <Text className="text-emerald-400 text-[10px] font-medium">{accountCount} account{accountCount > 1 ? 's' : ''}</Text>
                    </View>
                  )}
                </View>
                <Text className="text-white/50 text-xs mt-1">{platform.description}</Text>
              </View>

              {/* Action Button */}
              <Pressable
                onPress={(e) => {
                  e.stopPropagation();
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  onConnect();
                }}
                className="w-10 h-10 rounded-full items-center justify-center bg-white/10"
              >
                <Plus size={18} color="#fff" />
              </Pressable>
            </View>

            {/* Connected Accounts List */}
            {isConnected && accounts.length > 0 && (
              <View className="mt-3 pt-3 border-t border-white/10">
                {accounts.slice(0, 3).map((account, index) => (
                  <View key={account.id} className={`flex-row items-center justify-between ${index > 0 ? 'mt-2' : ''}`}>
                    <View className="flex-row items-center flex-1">
                      <View className="w-8 h-8 rounded-full bg-white/10 items-center justify-center">
                        <Text className="text-white text-xs font-medium">
                          {account.displayName.charAt(0).toUpperCase()}
                        </Text>
                      </View>
                      <View className="ml-2 flex-1">
                        <Text className="text-white text-sm" numberOfLines={1}>{account.displayName}</Text>
                        <Text className="text-white/40 text-[10px]">{account.username}</Text>
                      </View>
                    </View>
                    <View className="flex-row items-center">
                      <Text className="text-white/50 text-[10px] mr-2">{(account.followers / 1000).toFixed(1)}K</Text>
                      <View className={`w-2 h-2 rounded-full ${account.isActive ? 'bg-emerald-500' : 'bg-gray-500'}`} />
                    </View>
                  </View>
                ))}
                {accounts.length > 3 && (
                  <Text className="text-white/40 text-xs mt-2 text-center">+{accounts.length - 3} more accounts</Text>
                )}
              </View>
            )}
          </View>
        </BlurView>
      </Pressable>
    </Animated.View>
  );
}

// Mock available accounts for selection (simulates what would come from OAuth)
const MOCK_AVAILABLE_ACCOUNTS: Record<string, Array<{ id: string; name: string; type: 'personal' | 'business' | 'page' | 'creator'; username: string; followers: number }>> = {
  facebook: [
    { id: 'fb_personal_1', name: 'John Doe', type: 'personal', username: '@johndoe', followers: 523 },
    { id: 'fb_page_1', name: 'My Business Page', type: 'page', username: '@mybusiness', followers: 12500 },
    { id: 'fb_page_2', name: 'Product Launch Page', type: 'page', username: '@productlaunch', followers: 8200 },
    { id: 'fb_page_3', name: 'Brand Official', type: 'page', username: '@brandofficial', followers: 45000 },
    { id: 'fb_page_4', name: 'Community Group', type: 'page', username: '@community', followers: 3200 },
  ],
  instagram: [
    { id: 'ig_personal_1', name: 'Personal Account', type: 'personal', username: '@john_personal', followers: 1250 },
    { id: 'ig_business_1', name: 'Business Profile', type: 'business', username: '@mybiz', followers: 25000 },
    { id: 'ig_creator_1', name: 'Creator Account', type: 'creator', username: '@johncreates', followers: 15000 },
    { id: 'ig_business_2', name: 'Brand Account', type: 'business', username: '@brandaccount', followers: 52000 },
    { id: 'ig_creator_2', name: 'Influencer Profile', type: 'creator', username: '@influencer', followers: 120000 },
  ],
  twitter: [
    { id: 'tw_personal_1', name: 'John Doe', type: 'personal', username: '@johndoe', followers: 2500 },
    { id: 'tw_business_1', name: 'Company Official', type: 'business', username: '@companyofficial', followers: 18000 },
    { id: 'tw_business_2', name: 'Product Updates', type: 'business', username: '@productupdates', followers: 8500 },
    { id: 'tw_creator_1', name: 'Tech Thoughts', type: 'creator', username: '@techthoughts', followers: 35000 },
  ],
  youtube: [
    { id: 'yt_channel_1', name: 'Main Channel', type: 'creator', username: '@mainchannel', followers: 50000 },
    { id: 'yt_channel_2', name: 'Vlog Channel', type: 'creator', username: '@vlogchannel', followers: 12000 },
    { id: 'yt_business_1', name: 'Business Channel', type: 'business', username: '@businesschannel', followers: 8000 },
  ],
  tiktok: [
    { id: 'tt_personal_1', name: 'Personal TikTok', type: 'personal', username: '@johnontiktok', followers: 15000 },
    { id: 'tt_creator_1', name: 'Creator Account', type: 'creator', username: '@johncreator', followers: 250000 },
    { id: 'tt_business_1', name: 'Brand TikTok', type: 'business', username: '@brandtiktok', followers: 85000 },
  ],
  linkedin: [
    { id: 'li_personal_1', name: 'John Doe', type: 'personal', username: '@johndoe', followers: 5000 },
    { id: 'li_company_1', name: 'Company Page', type: 'business', username: '@companypage', followers: 25000 },
    { id: 'li_company_2', name: 'Startup Page', type: 'business', username: '@startuppage', followers: 3500 },
  ],
};

function AccountSelectionModal({
  visible,
  platform,
  onSelect,
  onClose,
}: {
  visible: boolean;
  platform: PlatformInfo | null;
  onSelect: (account: { id: string; name: string; type: 'personal' | 'business' | 'page' | 'creator'; username: string; followers: number }) => void;
  onClose: () => void;
}) {
  const [selectedAccount, setSelectedAccount] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationStep, setVerificationStep] = useState<'select' | 'verify' | 'success'>('select');

  useEffect(() => {
    if (visible) {
      setSelectedAccount(null);
      setIsVerifying(false);
      setVerificationStep('select');
    }
  }, [visible]);

  if (!platform) return null;

  const availableAccounts = MOCK_AVAILABLE_ACCOUNTS[platform.id] || [
    { id: `${platform.id}_default`, name: `My ${platform.name}`, type: 'personal' as const, username: `@user_${platform.id}`, followers: 1000 },
  ];

  const handleSelectAccount = (account: typeof availableAccounts[0]) => {
    setSelectedAccount(account.id);
  };

  const handleVerify = () => {
    if (!selectedAccount) return;

    setIsVerifying(true);
    setVerificationStep('verify');

    // Simulate verification process
    setTimeout(() => {
      setVerificationStep('success');
      setTimeout(() => {
        const account = availableAccounts.find(a => a.id === selectedAccount);
        if (account) {
          onSelect(account);
        }
        setIsVerifying(false);
      }, 1000);
    }, 2000);
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'page': return 'Page';
      case 'business': return 'Business';
      case 'creator': return 'Creator';
      default: return 'Personal';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'page': return 'bg-blue-500/20 text-blue-400';
      case 'business': return 'bg-purple-500/20 text-purple-400';
      case 'creator': return 'bg-orange-500/20 text-orange-400';
      default: return 'bg-slate-500/20 text-slate-400';
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <BlurView intensity={40} tint="dark" style={{ flex: 1 }}>
        <View className="flex-1 justify-end">
          <Animated.View
            entering={FadeInUp.springify()}
            className="bg-slate-900 rounded-t-3xl max-h-[85%]"
          >
            {/* Header */}
            <View className="flex-row items-center justify-between p-6 border-b border-white/10">
              <View className="flex-row items-center">
                <LinearGradient
                  colors={platform.gradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 12,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Text className="text-white font-bold">{platform.icon}</Text>
                </LinearGradient>
                <View className="ml-3">
                  <Text className="text-white font-semibold text-lg">
                    {verificationStep === 'select' ? 'Select Account' :
                     verificationStep === 'verify' ? 'Verifying...' : 'Connected!'}
                  </Text>
                  <Text className="text-white/50 text-sm">{platform.name}</Text>
                </View>
              </View>
              <Pressable
                onPress={onClose}
                className="w-8 h-8 rounded-full bg-white/10 items-center justify-center"
              >
                <X size={18} color="#fff" />
              </Pressable>
            </View>

            {verificationStep === 'select' && (
              <>
                {/* Account List */}
                <ScrollView className="px-6 py-4" style={{ maxHeight: 400 }}>
                  <Text className="text-white/50 text-xs uppercase tracking-wider mb-3">
                    Available Accounts ({availableAccounts.length})
                  </Text>
                  {availableAccounts.map((account) => (
                    <Pressable
                      key={account.id}
                      onPress={() => handleSelectAccount(account)}
                      className={`mb-3 rounded-2xl border ${
                        selectedAccount === account.id
                          ? 'border-cyan-500 bg-cyan-500/10'
                          : 'border-white/10 bg-white/5'
                      }`}
                    >
                      <View className="p-4">
                        <View className="flex-row items-center justify-between">
                          <View className="flex-row items-center flex-1">
                            <View className="w-12 h-12 rounded-full bg-white/10 items-center justify-center">
                              <Text className="text-white font-semibold text-lg">
                                {account.name.charAt(0).toUpperCase()}
                              </Text>
                            </View>
                            <View className="ml-3 flex-1">
                              <Text className="text-white font-medium" numberOfLines={1}>
                                {account.name}
                              </Text>
                              <Text className="text-white/40 text-sm">{account.username}</Text>
                            </View>
                          </View>
                          <View className={`w-6 h-6 rounded-full border-2 items-center justify-center ${
                            selectedAccount === account.id
                              ? 'border-cyan-500 bg-cyan-500'
                              : 'border-white/30'
                          }`}>
                            {selectedAccount === account.id && (
                              <CheckCircle2 size={14} color="#fff" />
                            )}
                          </View>
                        </View>
                        <View className="flex-row items-center mt-3 gap-2">
                          <View className={`px-2 py-1 rounded-full ${getTypeColor(account.type)}`}>
                            <Text className="text-[10px] font-medium">{getTypeLabel(account.type)}</Text>
                          </View>
                          <Text className="text-white/40 text-xs">
                            {account.followers >= 1000
                              ? `${(account.followers / 1000).toFixed(1)}K followers`
                              : `${account.followers} followers`}
                          </Text>
                        </View>
                      </View>
                    </Pressable>
                  ))}
                </ScrollView>

                {/* Connect Button */}
                <View className="p-6 border-t border-white/10">
                  <Pressable
                    onPress={handleVerify}
                    disabled={!selectedAccount}
                    className={`rounded-2xl overflow-hidden ${!selectedAccount ? 'opacity-50' : ''}`}
                  >
                    <LinearGradient
                      colors={selectedAccount ? ['#06b6d4', '#0891b2'] : ['#475569', '#334155']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={{ paddingVertical: 16, alignItems: 'center' }}
                    >
                      <Text className="text-white font-semibold text-base">
                        Verify & Connect Account
                      </Text>
                    </LinearGradient>
                  </Pressable>
                  <Text className="text-white/40 text-xs text-center mt-3">
                    You'll be asked to confirm ownership of this account
                  </Text>
                </View>
              </>
            )}

            {verificationStep === 'verify' && (
              <View className="p-8 items-center">
                <View className="w-20 h-20 rounded-full bg-cyan-500/20 items-center justify-center mb-6">
                  <Shield size={40} color="#06b6d4" />
                </View>
                <Text className="text-white text-xl font-bold mb-2">Verifying Ownership</Text>
                <Text className="text-white/50 text-center mb-6">
                  Please confirm in the {platform.name} app or complete the login to verify you own this account.
                </Text>
                <View className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                  <Animated.View
                    entering={FadeInDown}
                    className="h-full bg-cyan-500 rounded-full"
                    style={{ width: '60%' }}
                  />
                </View>
                <Text className="text-white/40 text-xs mt-4">
                  This may take a few moments...
                </Text>
              </View>
            )}

            {verificationStep === 'success' && (
              <View className="p-8 items-center">
                <View className="w-20 h-20 rounded-full bg-emerald-500/20 items-center justify-center mb-6">
                  <CheckCircle2 size={40} color="#10b981" />
                </View>
                <Text className="text-white text-xl font-bold mb-2">Account Verified!</Text>
                <Text className="text-white/50 text-center">
                  Your {platform.name} account has been successfully connected.
                </Text>
              </View>
            )}
          </Animated.View>
        </View>
      </BlurView>
    </Modal>
  );
}

export default function ConnectScreen() {
  const accounts = useSocialAccountsStore((s) => s.accounts);
  const addAccount = useSocialAccountsStore((s) => s.addAccount);
  const removeAccount = useSocialAccountsStore((s) => s.removeAccount);
  const loadStoredAccounts = useSocialAccountsStore((s) => s.loadStoredAccounts);
  const getConnectedPlatforms = useSocialAccountsStore((s) => s.getConnectedPlatforms);

  const [connectingPlatform, setConnectingPlatform] = useState<PlatformInfo | null>(null);
  const [showAccountSelection, setShowAccountSelection] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadStoredAccounts();
  }, []);

  const connectedPlatforms = getConnectedPlatforms();

  const filteredPlatforms = PLATFORMS.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleConnect = (platform: PlatformInfo) => {
    setConnectingPlatform(platform);
    setShowAccountSelection(true);
  };

  const handleAccountSelected = async (selectedAccount: { id: string; name: string; type: 'personal' | 'business' | 'page' | 'creator'; username: string; followers: number }) => {
    if (connectingPlatform) {
      const newAccount: SocialAccount = {
        id: `${connectingPlatform.id}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        platform: connectingPlatform.id,
        username: selectedAccount.username,
        displayName: selectedAccount.name,
        accountType: selectedAccount.type,
        followers: selectedAccount.followers,
        following: Math.floor(Math.random() * 500) + 50,
        posts: Math.floor(Math.random() * 200) + 10,
        engagement: Math.random() * 10 + 2,
        connectedAt: new Date().toISOString(),
        isActive: true,
      };
      await addAccount(newAccount);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    setShowAccountSelection(false);
    setConnectingPlatform(null);
  };

  const handleDisconnect = (platform: PlatformInfo) => {
    const account = accounts.find((a) => a.platform === platform.id);
    if (account) {
      Alert.alert(
        `Disconnect ${platform.name}?`,
        'You can reconnect anytime. Your data will be preserved.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Disconnect',
            style: 'destructive',
            onPress: async () => {
              await removeAccount(account.id);
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            },
          },
        ]
      );
    }
  };

  const handleManageAccounts = (platform: PlatformInfo) => {
    const platformAccounts = accounts.filter((a) => a.platform === platform.id);
    const accountNames = platformAccounts.map((a) => a.displayName).join('\n');

    Alert.alert(
      `${platform.name} Accounts (${platformAccounts.length})`,
      accountNames || 'No accounts connected',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Add Another',
          onPress: () => handleConnect(platform),
        },
        {
          text: 'Remove All',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Remove All Accounts?',
              `This will disconnect all ${platformAccounts.length} ${platform.name} accounts.`,
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Remove All',
                  style: 'destructive',
                  onPress: async () => {
                    for (const acc of platformAccounts) {
                      await removeAccount(acc.id);
                    }
                    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
                  },
                },
              ]
            );
          },
        },
      ]
    );
  };

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
            <Text className="text-white/50 text-sm">Integrations</Text>
            <Text className="text-white text-2xl font-bold mt-1">Connect Accounts</Text>
          </Animated.View>

          {/* Summary Card */}
          <Animated.View
            entering={FadeInDown.delay(150).springify()}
            className="px-6 mt-4"
          >
            <BlurView intensity={20} tint="dark" style={{ borderRadius: 24, overflow: 'hidden' }}>
              <LinearGradient
                colors={['rgba(6,182,212,0.15)', 'rgba(14,165,233,0.1)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{ borderRadius: 24 }}
              >
                <View className="p-5 border border-cyan-500/20 rounded-3xl">
                  <View className="flex-row items-center">
                    <View className="w-12 h-12 rounded-2xl bg-cyan-500/20 items-center justify-center">
                      <Link2 size={24} color="#06b6d4" />
                    </View>
                    <View className="ml-4 flex-1">
                      <Text className="text-white font-semibold text-lg">
                        {connectedPlatforms.length} of {PLATFORMS.length}
                      </Text>
                      <Text className="text-white/50 text-sm">platforms connected</Text>
                    </View>
                  </View>

                  {connectedPlatforms.length > 0 && (
                    <View className="flex-row flex-wrap gap-2 mt-4">
                      {connectedPlatforms.slice(0, 6).map((platformId) => {
                        const platform = PLATFORMS.find((p) => p.id === platformId);
                        if (!platform) return null;
                        return (
                          <View
                            key={platformId}
                            className="px-3 py-1.5 rounded-full bg-white/10"
                          >
                            <Text className="text-white text-xs">{platform.name}</Text>
                          </View>
                        );
                      })}
                      {connectedPlatforms.length > 6 && (
                        <View className="px-3 py-1.5 rounded-full bg-white/10">
                          <Text className="text-white/50 text-xs">
                            +{connectedPlatforms.length - 6} more
                          </Text>
                        </View>
                      )}
                    </View>
                  )}
                </View>
              </LinearGradient>
            </BlurView>
          </Animated.View>

          {/* Info Banner */}
          <Animated.View
            entering={FadeInDown.delay(200).springify()}
            className="px-6 mt-4"
          >
            <View className="flex-row items-start p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl">
              <AlertCircle size={18} color="#f59e0b" className="mt-0.5" />
              <Text className="text-amber-200/80 text-xs ml-3 flex-1">
                Connect your social accounts to track analytics, schedule posts, and manage all your
                platforms from one place.
              </Text>
            </View>
          </Animated.View>

          {/* Import Contacts Section */}
          <View className="px-6 mt-6">
            <Animated.View
              entering={FadeInDown.delay(220).springify()}
              className="flex-row items-center justify-between mb-4"
            >
              <Text className="text-white font-semibold text-base">Import Contacts</Text>
            </Animated.View>

            {/* Phone Contacts */}
            <Animated.View entering={FadeInDown.delay(240).springify()}>
              <Pressable
                onPress={async () => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  const { status } = await Contacts.requestPermissionsAsync();
                  if (status === 'granted') {
                    const { data } = await Contacts.getContactsAsync({
                      fields: [Contacts.Fields.Name, Contacts.Fields.PhoneNumbers, Contacts.Fields.Emails],
                    });
                    if (data.length > 0) {
                      Alert.alert(
                        'Contacts Found',
                        `Found ${data.length} contacts on your device. Would you like to import them?`,
                        [
                          { text: 'Cancel', style: 'cancel' },
                          {
                            text: 'Import',
                            onPress: () => {
                              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                              Alert.alert('Success', `${data.length} contacts imported successfully!`);
                            },
                          },
                        ]
                      );
                    } else {
                      Alert.alert('No Contacts', 'No contacts found on your device.');
                    }
                  } else {
                    Alert.alert(
                      'Permission Required',
                      'Please allow access to your contacts in Settings to import them.'
                    );
                  }
                }}
                className="mb-3"
              >
                <BlurView intensity={15} tint="dark" style={{ borderRadius: 20, overflow: 'hidden' }}>
                  <View className="flex-row items-center p-4 border border-white/10 rounded-[20px]">
                    <LinearGradient
                      colors={['#10b981', '#059669']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: 14,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Smartphone size={24} color="#fff" />
                    </LinearGradient>
                    <View className="flex-1 ml-4">
                      <Text className="text-white font-semibold text-base">Phone Contacts</Text>
                      <Text className="text-white/50 text-xs mt-1">Import contacts from your device</Text>
                    </View>
                    <View className="w-10 h-10 rounded-full items-center justify-center bg-white/10">
                      <Import size={18} color="#fff" />
                    </View>
                  </View>
                </BlurView>
              </Pressable>
            </Animated.View>

            {/* Facebook Friends */}
            <Animated.View entering={FadeInDown.delay(260).springify()}>
              <Pressable
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  const isFacebookConnected = connectedPlatforms.includes('facebook');
                  if (isFacebookConnected) {
                    Alert.alert(
                      'Import Facebook Friends',
                      'Would you like to import your Facebook friends list?',
                      [
                        { text: 'Cancel', style: 'cancel' },
                        {
                          text: 'Import',
                          onPress: () => {
                            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                            Alert.alert('Success', '127 Facebook friends imported successfully!');
                          },
                        },
                      ]
                    );
                  } else {
                    Alert.alert(
                      'Connect Facebook First',
                      'Please connect your Facebook account below to import your friends list.',
                      [{ text: 'OK' }]
                    );
                  }
                }}
                className="mb-3"
              >
                <BlurView intensity={15} tint="dark" style={{ borderRadius: 20, overflow: 'hidden' }}>
                  <View className="flex-row items-center p-4 border border-white/10 rounded-[20px]">
                    <LinearGradient
                      colors={['#1877F2', '#42A5F5']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: 14,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Users size={24} color="#fff" />
                    </LinearGradient>
                    <View className="flex-1 ml-4">
                      <Text className="text-white font-semibold text-base">Facebook Friends</Text>
                      <Text className="text-white/50 text-xs mt-1">
                        {connectedPlatforms.includes('facebook')
                          ? 'Import friends from Facebook'
                          : 'Connect Facebook first'}
                      </Text>
                    </View>
                    <View className="w-10 h-10 rounded-full items-center justify-center bg-white/10">
                      <Import size={18} color="#fff" />
                    </View>
                  </View>
                </BlurView>
              </Pressable>
            </Animated.View>

            {/* Import Email Accounts */}
            <Animated.View entering={FadeInDown.delay(280).springify()}>
              <Pressable
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  Alert.alert(
                    'Import Email Accounts',
                    'Connect your email accounts to import contacts and sync communications.',
                    [
                      { text: 'Cancel', style: 'cancel' },
                      {
                        text: 'Gmail',
                        onPress: () => {
                          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                          Alert.alert('Success', 'Gmail account connected successfully!');
                        },
                      },
                      {
                        text: 'Outlook',
                        onPress: () => {
                          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                          Alert.alert('Success', 'Outlook account connected successfully!');
                        },
                      },
                    ]
                  );
                }}
                className="mb-3"
              >
                <BlurView intensity={15} tint="dark" style={{ borderRadius: 20, overflow: 'hidden' }}>
                  <View className="flex-row items-center p-4 border border-white/10 rounded-[20px]">
                    <LinearGradient
                      colors={['#EA4335', '#FBBC05']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: 14,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Mail size={24} color="#fff" />
                    </LinearGradient>
                    <View className="flex-1 ml-4">
                      <Text className="text-white font-semibold text-base">Email Accounts</Text>
                      <Text className="text-white/50 text-xs mt-1">Gmail, Outlook, Yahoo & more</Text>
                    </View>
                    <View className="w-10 h-10 rounded-full items-center justify-center bg-white/10">
                      <Import size={18} color="#fff" />
                    </View>
                  </View>
                </BlurView>
              </Pressable>
            </Animated.View>
          </View>

          {/* Business Integrations Section */}
          <View className="px-6 mt-6">
            <Animated.View
              entering={FadeInDown.delay(300).springify()}
              className="flex-row items-center justify-between mb-4"
            >
              <Text className="text-white font-semibold text-base">Business Integrations</Text>
            </Animated.View>

            {/* Facebook Pages / Business */}
            <Animated.View entering={FadeInDown.delay(320).springify()}>
              <Pressable
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  Alert.alert(
                    'Connect Facebook Business',
                    'Connect your Facebook Pages and Business accounts to manage your business presence.',
                    [
                      { text: 'Cancel', style: 'cancel' },
                      {
                        text: 'Connect',
                        onPress: () => {
                          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                          Alert.alert('Success', 'Facebook Business connected! 3 Pages found.');
                        },
                      },
                    ]
                  );
                }}
                className="mb-3"
              >
                <BlurView intensity={15} tint="dark" style={{ borderRadius: 20, overflow: 'hidden' }}>
                  <View className="flex-row items-center p-4 border border-white/10 rounded-[20px]">
                    <LinearGradient
                      colors={['#1877F2', '#0866FF']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: 14,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Building2 size={24} color="#fff" />
                    </LinearGradient>
                    <View className="flex-1 ml-4">
                      <Text className="text-white font-semibold text-base">Facebook Pages</Text>
                      <Text className="text-white/50 text-xs mt-1">Business Suite & Pages Manager</Text>
                    </View>
                    <View className="w-10 h-10 rounded-full items-center justify-center bg-white/10">
                      <ChevronRight size={18} color="#fff" />
                    </View>
                  </View>
                </BlurView>
              </Pressable>
            </Animated.View>

            {/* Zendesk */}
            <Animated.View entering={FadeInDown.delay(340).springify()}>
              <Pressable
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  Alert.alert(
                    'Connect Zendesk',
                    'Link your Zendesk account to manage customer support tickets and communications.',
                    [
                      { text: 'Cancel', style: 'cancel' },
                      {
                        text: 'Connect',
                        onPress: () => {
                          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                          Alert.alert('Success', 'Zendesk account connected successfully!');
                        },
                      },
                    ]
                  );
                }}
                className="mb-3"
              >
                <BlurView intensity={15} tint="dark" style={{ borderRadius: 20, overflow: 'hidden' }}>
                  <View className="flex-row items-center p-4 border border-white/10 rounded-[20px]">
                    <LinearGradient
                      colors={['#03363D', '#17494D']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: 14,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Headphones size={24} color="#fff" />
                    </LinearGradient>
                    <View className="flex-1 ml-4">
                      <Text className="text-white font-semibold text-base">Zendesk</Text>
                      <Text className="text-white/50 text-xs mt-1">Customer support & ticketing</Text>
                    </View>
                    <View className="w-10 h-10 rounded-full items-center justify-center bg-white/10">
                      <ChevronRight size={18} color="#fff" />
                    </View>
                  </View>
                </BlurView>
              </Pressable>
            </Animated.View>

            {/* Microsoft Office 365 */}
            <Animated.View entering={FadeInDown.delay(360).springify()}>
              <Pressable
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  Alert.alert(
                    'Connect Microsoft 365',
                    'Link your Microsoft account to access Office apps, OneDrive, and Outlook.',
                    [
                      { text: 'Cancel', style: 'cancel' },
                      {
                        text: 'Connect',
                        onPress: () => {
                          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                          Alert.alert('Success', 'Microsoft 365 connected successfully!');
                        },
                      },
                    ]
                  );
                }}
                className="mb-3"
              >
                <BlurView intensity={15} tint="dark" style={{ borderRadius: 20, overflow: 'hidden' }}>
                  <View className="flex-row items-center p-4 border border-white/10 rounded-[20px]">
                    <LinearGradient
                      colors={['#D83B01', '#FFB900']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: 14,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <FileSpreadsheet size={24} color="#fff" />
                    </LinearGradient>
                    <View className="flex-1 ml-4">
                      <Text className="text-white font-semibold text-base">Microsoft 365</Text>
                      <Text className="text-white/50 text-xs mt-1">Office, OneDrive & Outlook</Text>
                    </View>
                    <View className="w-10 h-10 rounded-full items-center justify-center bg-white/10">
                      <ChevronRight size={18} color="#fff" />
                    </View>
                  </View>
                </BlurView>
              </Pressable>
            </Animated.View>
          </View>

          {/* Cloud Storage Section */}
          <View className="px-6 mt-6">
            <Animated.View
              entering={FadeInDown.delay(380).springify()}
              className="flex-row items-center justify-between mb-4"
            >
              <Text className="text-white font-semibold text-base">Cloud Storage</Text>
            </Animated.View>

            {/* Google Drive */}
            <Animated.View entering={FadeInDown.delay(400).springify()}>
              <Pressable
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  Alert.alert(
                    'Connect Google Drive',
                    'Link your Google Drive to access and manage your files.',
                    [
                      { text: 'Cancel', style: 'cancel' },
                      {
                        text: 'Connect',
                        onPress: () => {
                          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                          Alert.alert('Success', 'Google Drive connected! 15GB available.');
                        },
                      },
                    ]
                  );
                }}
                className="mb-3"
              >
                <BlurView intensity={15} tint="dark" style={{ borderRadius: 20, overflow: 'hidden' }}>
                  <View className="flex-row items-center p-4 border border-white/10 rounded-[20px]">
                    <LinearGradient
                      colors={['#4285F4', '#34A853']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: 14,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <HardDrive size={24} color="#fff" />
                    </LinearGradient>
                    <View className="flex-1 ml-4">
                      <Text className="text-white font-semibold text-base">Google Drive</Text>
                      <Text className="text-white/50 text-xs mt-1">Cloud storage & file sync</Text>
                    </View>
                    <View className="w-10 h-10 rounded-full items-center justify-center bg-white/10">
                      <ChevronRight size={18} color="#fff" />
                    </View>
                  </View>
                </BlurView>
              </Pressable>
            </Animated.View>

            {/* iCloud Drive */}
            <Animated.View entering={FadeInDown.delay(420).springify()}>
              <Pressable
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  Alert.alert(
                    'Connect iCloud Drive',
                    'Link your iCloud account to access your Apple cloud storage.',
                    [
                      { text: 'Cancel', style: 'cancel' },
                      {
                        text: 'Connect',
                        onPress: () => {
                          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                          Alert.alert('Success', 'iCloud Drive connected! 5GB available.');
                        },
                      },
                    ]
                  );
                }}
                className="mb-3"
              >
                <BlurView intensity={15} tint="dark" style={{ borderRadius: 20, overflow: 'hidden' }}>
                  <View className="flex-row items-center p-4 border border-white/10 rounded-[20px]">
                    <LinearGradient
                      colors={['#007AFF', '#5AC8FA']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: 14,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Cloud size={24} color="#fff" />
                    </LinearGradient>
                    <View className="flex-1 ml-4">
                      <Text className="text-white font-semibold text-base">iCloud Drive</Text>
                      <Text className="text-white/50 text-xs mt-1">Apple cloud storage</Text>
                    </View>
                    <View className="w-10 h-10 rounded-full items-center justify-center bg-white/10">
                      <ChevronRight size={18} color="#fff" />
                    </View>
                  </View>
                </BlurView>
              </Pressable>
            </Animated.View>
          </View>

          {/* Asset Groups Section */}
          <View className="px-6 mt-6">
            <Animated.View
              entering={FadeInDown.delay(440).springify()}
              className="flex-row items-center justify-between mb-4"
            >
              <Text className="text-white font-semibold text-base">Asset Groups</Text>
              <Pressable
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  Alert.alert(
                    'Create New Group',
                    'What type of group would you like to create?',
                    [
                      { text: 'Cancel', style: 'cancel' },
                      {
                        text: 'Company',
                        onPress: () => {
                          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                          Alert.alert('Success', 'New company group created!');
                        },
                      },
                      {
                        text: 'Product',
                        onPress: () => {
                          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                          Alert.alert('Success', 'New product group created!');
                        },
                      },
                    ]
                  );
                }}
              >
                <View className="flex-row items-center bg-cyan-500/20 px-3 py-1.5 rounded-full">
                  <Plus size={14} color="#06b6d4" />
                  <Text className="text-cyan-400 text-xs font-medium ml-1">Add Group</Text>
                </View>
              </Pressable>
            </Animated.View>

            {/* Company A */}
            <Animated.View entering={FadeInDown.delay(460).springify()}>
              <Pressable
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  Alert.alert(
                    'Company A',
                    'Manage assets for Company A',
                    [
                      { text: 'Cancel', style: 'cancel' },
                      { text: 'View Assets', onPress: () => {} },
                      { text: 'Add Asset', onPress: () => {
                        Alert.alert('Add Asset', 'Select asset type to add to Company A');
                      }},
                    ]
                  );
                }}
                className="mb-3"
              >
                <BlurView intensity={15} tint="dark" style={{ borderRadius: 20, overflow: 'hidden' }}>
                  <View className="flex-row items-center p-4 border border-white/10 rounded-[20px]">
                    <LinearGradient
                      colors={['#8b5cf6', '#7c3aed']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: 14,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Briefcase size={24} color="#fff" />
                    </LinearGradient>
                    <View className="flex-1 ml-4">
                      <Text className="text-white font-semibold text-base">Company A</Text>
                      <Text className="text-white/50 text-xs mt-1">3 social accounts, 2 ad accounts</Text>
                    </View>
                    <View className="w-10 h-10 rounded-full items-center justify-center bg-white/10">
                      <ChevronDown size={18} color="#fff" />
                    </View>
                  </View>
                </BlurView>
              </Pressable>
            </Animated.View>

            {/* Company B */}
            <Animated.View entering={FadeInDown.delay(480).springify()}>
              <Pressable
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  Alert.alert(
                    'Company B',
                    'Manage assets for Company B',
                    [
                      { text: 'Cancel', style: 'cancel' },
                      { text: 'View Assets', onPress: () => {} },
                      { text: 'Add Asset', onPress: () => {
                        Alert.alert('Add Asset', 'Select asset type to add to Company B');
                      }},
                    ]
                  );
                }}
                className="mb-3"
              >
                <BlurView intensity={15} tint="dark" style={{ borderRadius: 20, overflow: 'hidden' }}>
                  <View className="flex-row items-center p-4 border border-white/10 rounded-[20px]">
                    <LinearGradient
                      colors={['#ec4899', '#db2777']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: 14,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Briefcase size={24} color="#fff" />
                    </LinearGradient>
                    <View className="flex-1 ml-4">
                      <Text className="text-white font-semibold text-base">Company B</Text>
                      <Text className="text-white/50 text-xs mt-1">5 social accounts, 1 ad account</Text>
                    </View>
                    <View className="w-10 h-10 rounded-full items-center justify-center bg-white/10">
                      <ChevronDown size={18} color="#fff" />
                    </View>
                  </View>
                </BlurView>
              </Pressable>
            </Animated.View>

            {/* Product A */}
            <Animated.View entering={FadeInDown.delay(500).springify()}>
              <Pressable
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  Alert.alert(
                    'Product A',
                    'Manage assets for Product A',
                    [
                      { text: 'Cancel', style: 'cancel' },
                      { text: 'View Assets', onPress: () => {} },
                      { text: 'Add Asset', onPress: () => {
                        Alert.alert('Add Asset', 'Select asset type to add to Product A');
                      }},
                    ]
                  );
                }}
                className="mb-3"
              >
                <BlurView intensity={15} tint="dark" style={{ borderRadius: 20, overflow: 'hidden' }}>
                  <View className="flex-row items-center p-4 border border-white/10 rounded-[20px]">
                    <LinearGradient
                      colors={['#f97316', '#ea580c']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: 14,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Package size={24} color="#fff" />
                    </LinearGradient>
                    <View className="flex-1 ml-4">
                      <Text className="text-white font-semibold text-base">Product A</Text>
                      <Text className="text-white/50 text-xs mt-1">2 campaigns, 4 creatives</Text>
                    </View>
                    <View className="w-10 h-10 rounded-full items-center justify-center bg-white/10">
                      <ChevronDown size={18} color="#fff" />
                    </View>
                  </View>
                </BlurView>
              </Pressable>
            </Animated.View>

            {/* Product B */}
            <Animated.View entering={FadeInDown.delay(520).springify()}>
              <Pressable
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  Alert.alert(
                    'Product B',
                    'Manage assets for Product B',
                    [
                      { text: 'Cancel', style: 'cancel' },
                      { text: 'View Assets', onPress: () => {} },
                      { text: 'Add Asset', onPress: () => {
                        Alert.alert('Add Asset', 'Select asset type to add to Product B');
                      }},
                    ]
                  );
                }}
                className="mb-3"
              >
                <BlurView intensity={15} tint="dark" style={{ borderRadius: 20, overflow: 'hidden' }}>
                  <View className="flex-row items-center p-4 border border-white/10 rounded-[20px]">
                    <LinearGradient
                      colors={['#14b8a6', '#0d9488']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: 14,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Package size={24} color="#fff" />
                    </LinearGradient>
                    <View className="flex-1 ml-4">
                      <Text className="text-white font-semibold text-base">Product B</Text>
                      <Text className="text-white/50 text-xs mt-1">1 campaign, 6 creatives</Text>
                    </View>
                    <View className="w-10 h-10 rounded-full items-center justify-center bg-white/10">
                      <ChevronDown size={18} color="#fff" />
                    </View>
                  </View>
                </BlurView>
              </Pressable>
            </Animated.View>
          </View>

          {/* Platform List */}
          <View className="px-6 mt-6">
            <Animated.View
              entering={FadeInDown.delay(250).springify()}
              className="flex-row items-center justify-between mb-4"
            >
              <Text className="text-white font-semibold text-base">All Platforms</Text>
              <Text className="text-white/40 text-sm">{PLATFORMS.length} available</Text>
            </Animated.View>

            {filteredPlatforms.map((platform, index) => {
              const platformAccounts = accounts.filter((a) => a.platform === platform.id);
              return (
                <PlatformCard
                  key={platform.id}
                  platform={platform}
                  accountCount={platformAccounts.length}
                  accounts={platformAccounts}
                  onConnect={() => handleConnect(platform)}
                  onManage={() => handleManageAccounts(platform)}
                  delay={300 + index * 30}
                />
              );
            })}
          </View>
        </ScrollView>
      </LinearGradient>

      <AccountSelectionModal
        visible={showAccountSelection}
        platform={connectingPlatform}
        onSelect={handleAccountSelected}
        onClose={() => {
          setShowAccountSelection(false);
          setConnectingPlatform(null);
        }}
      />
    </View>
  );
}
