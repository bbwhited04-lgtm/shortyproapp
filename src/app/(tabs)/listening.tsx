import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Ear,
  Search,
  Bell,
  MessageCircle,
  Heart,
  AtSign,
  Hash,
  TrendingUp,
  Filter,
  Plus,
  X,
  ExternalLink,
  Clock,
  User,
  Lock,
} from 'lucide-react-native';
import Animated, { FadeInDown, FadeIn, FadeOut } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { useSubscription } from '@/lib/subscriptionStore';

type MentionType = 'mention' | 'comment' | 'tag' | 'keyword' | 'hashtag';
type SentimentType = 'positive' | 'neutral' | 'negative';

interface SocialMention {
  id: string;
  type: MentionType;
  platform: 'instagram' | 'twitter' | 'facebook' | 'tiktok' | 'linkedin' | 'youtube';
  author: {
    name: string;
    handle: string;
    avatar?: string;
  };
  content: string;
  sentiment: SentimentType;
  engagement: {
    likes: number;
    comments: number;
    shares: number;
  };
  timestamp: Date;
  url?: string;
  keyword?: string;
}

interface TrackedKeyword {
  id: string;
  keyword: string;
  type: 'brand' | 'competitor' | 'industry' | 'hashtag';
  mentionCount: number;
  sentiment: number; // -1 to 1
}

// Mock data for social mentions
const mockMentions: SocialMention[] = [
  {
    id: '1',
    type: 'mention',
    platform: 'twitter',
    author: { name: 'Sarah Tech', handle: '@sarahtech' },
    content: 'Just tried @ShortyPro and wow! The AI video generation is incredible. Made my first promo video in minutes!',
    sentiment: 'positive',
    engagement: { likes: 45, comments: 12, shares: 8 },
    timestamp: new Date(Date.now() - 1000 * 60 * 30),
  },
  {
    id: '2',
    type: 'comment',
    platform: 'instagram',
    author: { name: 'Marketing Mike', handle: '@marketingmike' },
    content: 'This is exactly what I needed for my business. The chatterly feature saves me hours every week!',
    sentiment: 'positive',
    engagement: { likes: 89, comments: 5, shares: 0 },
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
  },
  {
    id: '3',
    type: 'hashtag',
    platform: 'tiktok',
    author: { name: 'Content Creator', handle: '@contentcreator' },
    content: 'Testing out different AI tools for content creation #AItools #ContentCreation #ShortyPro',
    sentiment: 'neutral',
    engagement: { likes: 234, comments: 18, shares: 45 },
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5),
    keyword: '#AItools',
  },
  {
    id: '4',
    type: 'keyword',
    platform: 'linkedin',
    author: { name: 'Business Owner', handle: 'businessowner' },
    content: 'Looking for recommendations on social media management tools. Has anyone tried the newer AI-powered platforms?',
    sentiment: 'neutral',
    engagement: { likes: 12, comments: 28, shares: 2 },
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8),
    keyword: 'social media management',
  },
  {
    id: '5',
    type: 'mention',
    platform: 'facebook',
    author: { name: 'Small Biz Sue', handle: 'smallbizsue' },
    content: 'Had some issues with the export feature on ShortyPro. Anyone else experiencing this? Support was helpful though.',
    sentiment: 'negative',
    engagement: { likes: 3, comments: 7, shares: 0 },
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 12),
  },
];

const mockKeywords: TrackedKeyword[] = [
  { id: '1', keyword: 'ShortyPro', type: 'brand', mentionCount: 156, sentiment: 0.78 },
  { id: '2', keyword: '#AItools', type: 'hashtag', mentionCount: 2340, sentiment: 0.45 },
  { id: '3', keyword: 'social media automation', type: 'industry', mentionCount: 890, sentiment: 0.32 },
  { id: '4', keyword: 'competitor brand', type: 'competitor', mentionCount: 432, sentiment: 0.21 },
];

const PLATFORM_COLORS: Record<string, string> = {
  instagram: '#E4405F',
  twitter: '#1DA1F2',
  facebook: '#1877F2',
  tiktok: '#000000',
  linkedin: '#0A66C2',
  youtube: '#FF0000',
};

const SENTIMENT_CONFIG: Record<SentimentType, { color: string; bg: string; label: string }> = {
  positive: { color: '#10b981', bg: 'bg-emerald-500/10', label: 'Positive' },
  neutral: { color: '#64748b', bg: 'bg-slate-500/10', label: 'Neutral' },
  negative: { color: '#ef4444', bg: 'bg-red-500/10', label: 'Negative' },
};

const TYPE_ICONS: Record<MentionType, React.ReactNode> = {
  mention: <AtSign size={14} color="#06b6d4" />,
  comment: <MessageCircle size={14} color="#8b5cf6" />,
  tag: <User size={14} color="#f59e0b" />,
  keyword: <Search size={14} color="#10b981" />,
  hashtag: <Hash size={14} color="#ec4899" />,
};

function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays}d ago`;
}

function MentionCard({ mention }: { mention: SocialMention }) {
  const sentiment = SENTIMENT_CONFIG[mention.sentiment];
  const platformColor = PLATFORM_COLORS[mention.platform];

  return (
    <Pressable className="mb-3 active:scale-[0.98]">
      <View className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700/30">
        {/* Header */}
        <View className="flex-row items-center justify-between mb-3">
          <View className="flex-row items-center flex-1">
            <View
              className="w-10 h-10 rounded-full items-center justify-center mr-3"
              style={{ backgroundColor: `${platformColor}20` }}
            >
              <Text style={{ color: platformColor }} className="font-bold text-xs">
                {mention.platform.slice(0, 2).toUpperCase()}
              </Text>
            </View>
            <View className="flex-1">
              <Text className="text-white font-semibold" numberOfLines={1}>
                {mention.author.name}
              </Text>
              <Text className="text-slate-400 text-xs">@{mention.author.handle}</Text>
            </View>
          </View>
          <View className="flex-row items-center">
            {TYPE_ICONS[mention.type]}
            <View className={`ml-2 px-2 py-1 rounded-full ${sentiment.bg}`}>
              <Text style={{ color: sentiment.color }} className="text-xs font-medium">
                {sentiment.label}
              </Text>
            </View>
          </View>
        </View>

        {/* Content */}
        <Text className="text-slate-300 text-sm mb-3" numberOfLines={3}>
          {mention.content}
        </Text>

        {/* Footer */}
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-4">
            <View className="flex-row items-center">
              <Heart size={12} color="#64748b" />
              <Text className="text-slate-500 text-xs ml-1">{mention.engagement.likes}</Text>
            </View>
            <View className="flex-row items-center">
              <MessageCircle size={12} color="#64748b" />
              <Text className="text-slate-500 text-xs ml-1">{mention.engagement.comments}</Text>
            </View>
          </View>
          <View className="flex-row items-center">
            <Clock size={12} color="#64748b" />
            <Text className="text-slate-500 text-xs ml-1">{formatTimeAgo(mention.timestamp)}</Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

function KeywordCard({ keyword }: { keyword: TrackedKeyword }) {
  const sentimentPercent = Math.round((keyword.sentiment + 1) * 50);
  const sentimentColor =
    keyword.sentiment > 0.3 ? '#10b981' : keyword.sentiment < -0.3 ? '#ef4444' : '#64748b';

  return (
    <Pressable className="mr-3 active:scale-95">
      <View className="bg-slate-800/80 rounded-xl p-4 w-40 border border-slate-700/30">
        <View className="flex-row items-center mb-2">
          {keyword.type === 'hashtag' ? (
            <Hash size={14} color="#ec4899" />
          ) : keyword.type === 'brand' ? (
            <AtSign size={14} color="#06b6d4" />
          ) : (
            <Search size={14} color="#64748b" />
          )}
          <Text className="text-slate-400 text-xs ml-1 capitalize">{keyword.type}</Text>
        </View>
        <Text className="text-white font-semibold mb-1" numberOfLines={1}>
          {keyword.keyword}
        </Text>
        <Text className="text-slate-400 text-xs mb-2">
          {keyword.mentionCount.toLocaleString()} mentions
        </Text>
        <View className="flex-row items-center">
          <View className="flex-1 h-1.5 bg-slate-700 rounded-full overflow-hidden">
            <View
              className="h-full rounded-full"
              style={{ width: `${sentimentPercent}%`, backgroundColor: sentimentColor }}
            />
          </View>
          <Text style={{ color: sentimentColor }} className="text-xs ml-2 font-medium">
            {sentimentPercent}%
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

function AddKeywordModal({
  visible,
  onClose,
  onAdd,
}: {
  visible: boolean;
  onClose: () => void;
  onAdd: (keyword: string, type: TrackedKeyword['type']) => void;
}) {
  const [keyword, setKeyword] = useState('');
  const [selectedType, setSelectedType] = useState<TrackedKeyword['type']>('brand');

  const types: { id: TrackedKeyword['type']; label: string }[] = [
    { id: 'brand', label: 'Brand' },
    { id: 'competitor', label: 'Competitor' },
    { id: 'industry', label: 'Industry' },
    { id: 'hashtag', label: 'Hashtag' },
  ];

  if (!visible) return null;

  return (
    <Animated.View
      entering={FadeIn}
      exiting={FadeOut}
      className="absolute inset-0 bg-black/70 justify-center items-center px-6 z-50"
    >
      <View className="w-full bg-slate-800 rounded-2xl p-6 border border-slate-700">
        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-white text-xl font-bold">Track Keyword</Text>
          <Pressable onPress={onClose}>
            <X size={24} color="#64748b" />
          </Pressable>
        </View>

        <Text className="text-slate-400 text-sm mb-2">Keyword or Hashtag</Text>
        <TextInput
          className="bg-slate-700 rounded-xl px-4 py-3 text-white mb-4"
          placeholder="Enter keyword..."
          placeholderTextColor="#64748b"
          value={keyword}
          onChangeText={setKeyword}
        />

        <Text className="text-slate-400 text-sm mb-2">Type</Text>
        <View className="flex-row flex-wrap gap-2 mb-6">
          {types.map((type) => (
            <Pressable
              key={type.id}
              onPress={() => setSelectedType(type.id)}
              className={`px-4 py-2 rounded-xl ${
                selectedType === type.id
                  ? 'bg-cyan-500/20 border border-cyan-500'
                  : 'bg-slate-700 border border-slate-600'
              }`}
            >
              <Text
                className={`text-sm ${
                  selectedType === type.id ? 'text-cyan-400' : 'text-slate-300'
                }`}
              >
                {type.label}
              </Text>
            </Pressable>
          ))}
        </View>

        <Pressable
          onPress={() => {
            if (keyword.trim()) {
              onAdd(keyword.trim(), selectedType);
              setKeyword('');
              onClose();
            }
          }}
        >
          <LinearGradient
            colors={['#06b6d4', '#0891b2']}
            style={{ borderRadius: 12, paddingVertical: 14, alignItems: 'center' }}
          >
            <Text className="text-white font-semibold">Start Tracking</Text>
          </LinearGradient>
        </Pressable>
      </View>
    </Animated.View>
  );
}

export default function ListeningScreen() {
  const [mentions, setMentions] = useState<SocialMention[]>(mockMentions);
  const [keywords, setKeywords] = useState<TrackedKeyword[]>(mockKeywords);
  const [selectedFilter, setSelectedFilter] = useState<MentionType | 'all'>('all');
  const [showAddKeyword, setShowAddKeyword] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { isPro } = useSubscription();

  const filteredMentions =
    selectedFilter === 'all'
      ? mentions
      : mentions.filter((m) => m.type === selectedFilter);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // Simulate API refresh
    await new Promise((r) => setTimeout(r, 1500));
    setIsRefreshing(false);
  };

  const handleAddKeyword = (keyword: string, type: TrackedKeyword['type']) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const newKeyword: TrackedKeyword = {
      id: Date.now().toString(),
      keyword,
      type,
      mentionCount: 0,
      sentiment: 0,
    };
    setKeywords((prev) => [newKeyword, ...prev]);
  };

  // Lock for non-pro users
  if (!isPro) {
    return (
      <View className="flex-1 bg-slate-900">
        <LinearGradient colors={['#0f172a', '#0c1222', '#0f172a']} style={{ flex: 1 }}>
          <View className="flex-1 justify-center items-center px-6">
            <View className="w-24 h-24 rounded-full bg-purple-500/10 items-center justify-center mb-6">
              <Lock size={48} color="#a855f7" />
            </View>
            <Text className="text-white text-2xl font-bold text-center mb-3">
              Social Listening
            </Text>
            <Text className="text-slate-400 text-center mb-8 px-4">
              Upgrade to Pro to monitor brand mentions, track keywords, and analyze sentiment across all social platforms in real-time.
            </Text>
            <Pressable
              onPress={() => router.push('/pricing')}
              className="active:opacity-80"
            >
              <LinearGradient
                colors={['#a855f7', '#7c3aed']}
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

  return (
    <View className="flex-1 bg-slate-900">
      <LinearGradient colors={['#0f172a', '#0c1222', '#0f172a']} style={{ flex: 1 }}>
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingBottom: 120 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor="#06b6d4"
            />
          }
        >
          {/* Header */}
          <Animated.View
            entering={FadeInDown.delay(100).springify()}
            className="px-6 pt-4 pb-2"
          >
            <Text className="text-white/50 text-sm">Monitor</Text>
            <Text className="text-white text-2xl font-bold mt-1">Social Listening</Text>
          </Animated.View>

          {/* Hero Card */}
          <Animated.View
            entering={FadeInDown.delay(150).springify()}
            className="px-6 mt-4"
          >
            <LinearGradient
              colors={['#a855f7', '#7c3aed']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ borderRadius: 20, padding: 20, marginBottom: 16 }}
            >
              <View className="flex-row items-center mb-2">
                <Ear size={20} color="#fff" />
                <Text className="text-white font-semibold ml-2">Real-time Monitoring</Text>
              </View>
              <Text className="text-white/80 text-sm mb-4">
                Track mentions, hashtags, and keywords across all your connected social platforms.
              </Text>
              <View className="flex-row gap-3">
                <View className="flex-1 bg-white/10 rounded-xl p-3">
                  <Text className="text-white/60 text-xs">Today's Mentions</Text>
                  <Text className="text-white font-bold text-xl">
                    {mentions.length}
                  </Text>
                </View>
                <View className="flex-1 bg-white/10 rounded-xl p-3">
                  <Text className="text-white/60 text-xs">Tracked Keywords</Text>
                  <Text className="text-white font-bold text-xl">
                    {keywords.length}
                  </Text>
                </View>
              </View>
            </LinearGradient>
          </Animated.View>

          {/* Tracked Keywords */}
          <Animated.View entering={FadeInDown.delay(200).springify()}>
            <View className="flex-row items-center justify-between px-6 mb-3">
              <Text className="text-white text-lg font-semibold">Tracked Keywords</Text>
              <Pressable
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setShowAddKeyword(true);
                }}
                className="flex-row items-center"
              >
                <Plus size={16} color="#06b6d4" />
                <Text className="text-cyan-400 text-sm ml-1">Add</Text>
              </Pressable>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingLeft: 24, paddingRight: 12 }}
              style={{ flexGrow: 0 }}
            >
              {keywords.map((kw) => (
                <KeywordCard key={kw.id} keyword={kw} />
              ))}
            </ScrollView>
          </Animated.View>

          {/* Filter Tabs */}
          <Animated.View
            entering={FadeInDown.delay(250).springify()}
            className="px-6 mt-6 mb-4"
          >
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={{ flexGrow: 0 }}
            >
              {(['all', 'mention', 'comment', 'hashtag', 'keyword'] as const).map((filter) => (
                <Pressable
                  key={filter}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setSelectedFilter(filter);
                  }}
                  className={`mr-2 px-4 py-2 rounded-full ${
                    selectedFilter === filter
                      ? 'bg-cyan-500/20 border border-cyan-500'
                      : 'bg-slate-800 border border-slate-700'
                  }`}
                >
                  <Text
                    className={`text-sm capitalize ${
                      selectedFilter === filter ? 'text-cyan-400' : 'text-slate-400'
                    }`}
                  >
                    {filter === 'all' ? 'All' : filter + 's'}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </Animated.View>

          {/* Mentions List */}
          <Animated.View
            entering={FadeInDown.delay(300).springify()}
            className="px-6"
          >
            <Text className="text-white text-lg font-semibold mb-3">
              Recent Activity ({filteredMentions.length})
            </Text>
            {filteredMentions.map((mention, index) => (
              <Animated.View
                key={mention.id}
                entering={FadeInDown.delay(350 + index * 50).springify()}
              >
                <MentionCard mention={mention} />
              </Animated.View>
            ))}
          </Animated.View>
        </ScrollView>
      </LinearGradient>

      {/* Add Keyword Modal */}
      <AddKeywordModal
        visible={showAddKeyword}
        onClose={() => setShowAddKeyword(false)}
        onAdd={handleAddKeyword}
      />
    </View>
  );
}
