import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
  Image,
  ActivityIndicator,
  Alert,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, router } from 'expo-router';
import {
  Video,
  ImageIcon,
  Plus,
  Sparkles,
  Play,
  Clock,
  CheckCircle,
  AlertCircle,
  ChevronDown,
  Check,
  Wand2,
  Film,
  Palette,
  Download,
  Share2,
  Trash2,
  X,
  Lock,
} from 'lucide-react-native';
import Animated, {
  FadeInDown,
  FadeInUp,
  FadeIn,
  FadeOut,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as MediaLibrary from 'expo-media-library';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSubscription, useSubscriptionStore } from '@/lib/subscriptionStore';
import { PaywallModal, PaywallBanner } from '@/components/Paywall';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface GeneratedMedia {
  id: string;
  type: 'image' | 'video';
  title: string;
  prompt: string;
  uri: string;
  provider: string;
  status: 'completed' | 'processing' | 'failed';
  createdAt: string;
  aspectRatio?: string;
}

interface GenerationProvider {
  id: string;
  name: string;
  shortName: string;
  type: 'image' | 'video';
  description: string;
  color: string;
  gradientColors: [string, string];
  icon: React.ReactNode;
  estimatedTime: string;
}

const GENERATION_PROVIDERS: GenerationProvider[] = [
  {
    id: 'nano-banana',
    name: 'Nano Banana',
    shortName: 'Gemini Image',
    type: 'image',
    description: 'Google\'s Gemini image generation',
    color: '#f59e0b',
    gradientColors: ['#f59e0b', '#d97706'],
    icon: <Palette size={18} color="#f59e0b" />,
    estimatedTime: '~30 seconds',
  },
  {
    id: 'gpt-image',
    name: 'GPT Image',
    shortName: 'DALL-E 1.5',
    type: 'image',
    description: 'OpenAI\'s image generation',
    color: '#10a37f',
    gradientColors: ['#10a37f', '#059669'],
    icon: <ImageIcon size={18} color="#10a37f" />,
    estimatedTime: '30-120 seconds',
  },
  {
    id: 'sora-2',
    name: 'Sora 2',
    shortName: 'Video Gen',
    type: 'video',
    description: 'OpenAI\'s video generation',
    color: '#8b5cf6',
    gradientColors: ['#8b5cf6', '#7c3aed'],
    icon: <Film size={18} color="#8b5cf6" />,
    estimatedTime: '2-5 minutes',
  },
  {
    id: 'sora-2-pro',
    name: 'Sora 2 Pro',
    shortName: 'Video Pro',
    type: 'video',
    description: 'Higher quality video generation',
    color: '#ec4899',
    gradientColors: ['#ec4899', '#db2777'],
    icon: <Video size={18} color="#ec4899" />,
    estimatedTime: '3-8 minutes',
  },
];

const ASPECT_RATIOS = [
  { id: '1:1', label: 'Square', size: '1024x1024' },
  { id: '16:9', label: 'Landscape', size: '1792x1024' },
  { id: '9:16', label: 'Portrait', size: '1024x1792' },
  { id: '4:3', label: 'Standard', size: '1536x1024' },
];

const VIDEO_DURATIONS = [
  { id: '4', label: '4 sec' },
  { id: '8', label: '8 sec' },
  { id: '12', label: '12 sec' },
];

const STORAGE_KEY = 'shorty_magic_media';

// API Functions
async function generateWithNanoBanana(
  prompt: string,
  aspectRatio: string
): Promise<string> {
  const response = await fetch(
    'https://generativelanguage.googleapis.com/v1beta/models/gemini-3-pro-image-preview:generateContent',
    {
      method: 'POST',
      headers: {
        'x-goog-api-key': process.env.EXPO_PUBLIC_VIBECODE_GOOGLE_API_KEY ?? '',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          responseModalities: ['Image'],
          imageConfig: { aspectRatio },
        },
      }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Nano Banana failed: ${errorText}`);
  }

  const data = await response.json();
  const imagePart = data.candidates?.[0]?.content?.parts?.find(
    (p: { inlineData?: { data: string } }) => p.inlineData
  );
  if (!imagePart) throw new Error('No image generated');

  const base64Image = imagePart.inlineData.data;
  const fileUri = FileSystem.documentDirectory + `nano-banana-${Date.now()}.png`;
  await FileSystem.writeAsStringAsync(fileUri, base64Image, {
    encoding: FileSystem.EncodingType.Base64,
  });

  return fileUri;
}

async function generateWithGPTImage(
  prompt: string,
  size: string
): Promise<string> {
  const response = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: {
      Authorization:
        'Bearer ' + process.env.EXPO_PUBLIC_VIBECODE_OPENAI_API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-image-1.5',
      prompt,
      size,
      quality: 'high',
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`GPT Image failed: ${errorText}`);
  }

  const result = await response.json();
  const base64Image = result.data[0].b64_json;

  const fileUri = FileSystem.documentDirectory + `gpt-image-${Date.now()}.png`;
  await FileSystem.writeAsStringAsync(fileUri, base64Image, {
    encoding: FileSystem.EncodingType.Base64,
  });

  return fileUri;
}

async function generateWithSora(
  prompt: string,
  model: string,
  size: string,
  seconds: number
): Promise<string> {
  // Create job
  const form = new FormData();
  form.append('model', model);
  form.append('prompt', prompt);
  form.append('size', size);
  form.append('seconds', String(seconds));

  const createRes = await fetch('https://api.openai.com/v1/videos', {
    method: 'POST',
    headers: {
      Authorization:
        'Bearer ' + process.env.EXPO_PUBLIC_VIBECODE_OPENAI_API_KEY,
    },
    body: form,
  });

  if (!createRes.ok) {
    const errorText = await createRes.text();
    throw new Error(`Sora create failed: ${errorText}`);
  }

  let job = await createRes.json();

  // Poll status
  while (job.status === 'queued' || job.status === 'in_progress') {
    await new Promise((r) => setTimeout(r, 3000));
    const statusRes = await fetch(
      `https://api.openai.com/v1/videos/${job.id}`,
      {
        headers: {
          Authorization:
            'Bearer ' + process.env.EXPO_PUBLIC_VIBECODE_OPENAI_API_KEY,
        },
      }
    );
    if (!statusRes.ok) throw new Error('Sora status check failed');
    job = await statusRes.json();
  }

  if (job.status !== 'completed') throw new Error('Sora job failed');

  // Download video
  const contentRes = await fetch(
    `https://api.openai.com/v1/videos/${job.id}/content`,
    {
      headers: {
        Authorization:
          'Bearer ' + process.env.EXPO_PUBLIC_VIBECODE_OPENAI_API_KEY,
      },
    }
  );

  if (!contentRes.ok) throw new Error('Sora download failed');
  const blob = await contentRes.blob();

  const toBase64 = (b: Blob): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(String(reader.result).split(',')[1]);
      reader.onerror = reject;
      reader.readAsDataURL(b);
    });

  const base64 = await toBase64(blob);
  const fileUri = FileSystem.documentDirectory + `sora-${Date.now()}.mp4`;
  await FileSystem.writeAsStringAsync(fileUri, base64, {
    encoding: FileSystem.EncodingType.Base64,
  });

  return fileUri;
}

function MediaCard({
  media,
  onDelete,
  canDownload,
  canShare,
  onPaywallTrigger,
}: {
  media: GeneratedMedia;
  onDelete: (id: string) => void;
  canDownload: boolean;
  canShare: boolean;
  onPaywallTrigger: (feature: string) => void;
}) {
  const statusConfig = {
    completed: { icon: CheckCircle, color: '#10b981', label: 'Ready' },
    processing: { icon: Clock, color: '#f59e0b', label: 'Processing' },
    failed: { icon: AlertCircle, color: '#ef4444', label: 'Failed' },
  };

  const status = statusConfig[media.status];
  const StatusIcon = status.icon;

  const handleDownload = async () => {
    if (!canDownload) {
      onPaywallTrigger('Downloads');
      return;
    }

    if (media.status !== 'completed' || !media.uri) {
      Alert.alert('Error', 'Media is not ready for download');
      return;
    }

    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please grant media library access to download');
        return;
      }
      await MediaLibrary.saveToLibraryAsync(media.uri);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Downloaded!', 'Saved to your photo library');
    } catch (error) {
      Alert.alert('Error', 'Failed to download media');
    }
  };

  const handleShare = async () => {
    if (!canShare) {
      onPaywallTrigger('Social Sharing');
      return;
    }

    if (media.status !== 'completed' || !media.uri) {
      Alert.alert('Error', 'Media is not ready for sharing');
      return;
    }

    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(media.uri);
      } else {
        Alert.alert('Error', 'Sharing is not available on this device');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to share media');
    }
  };

  return (
    <Pressable className="mb-4 active:scale-[0.98]">
      <View className="bg-slate-800/50 rounded-2xl overflow-hidden border border-slate-700/30">
        <View className="h-44 bg-slate-700 relative">
          {media.status === 'completed' && media.uri && (
            <Image
              source={{ uri: media.uri }}
              style={{ width: '100%', height: '100%' }}
              resizeMode="cover"
            />
          )}
          {media.status === 'processing' && (
            <View className="flex-1 items-center justify-center">
              <ActivityIndicator size="large" color="#8b5cf6" />
              <Text className="text-slate-400 text-sm mt-2">Generating...</Text>
            </View>
          )}
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.8)']}
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: 80,
            }}
          />
          <View className="absolute bottom-3 left-3 right-3 flex-row items-center justify-between">
            <View className="flex-row items-center">
              <StatusIcon size={14} color={status.color} />
              <Text style={{ color: status.color }} className="text-xs ml-1">
                {status.label}
              </Text>
            </View>
            <View className="bg-black/50 px-2 py-1 rounded-lg flex-row items-center">
              {media.type === 'video' ? (
                <Play size={10} color="#fff" fill="#fff" />
              ) : (
                <ImageIcon size={10} color="#fff" />
              )}
              <Text className="text-white text-xs ml-1 capitalize">
                {media.type}
              </Text>
            </View>
          </View>
          {/* Delete button */}
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              onDelete(media.id);
            }}
            className="absolute top-2 right-2 w-8 h-8 bg-black/50 rounded-full items-center justify-center"
          >
            <Trash2 size={14} color="#ef4444" />
          </Pressable>
        </View>
        <View className="p-4">
          <Text className="text-white font-semibold text-base" numberOfLines={1}>
            {media.title}
          </Text>
          <Text className="text-slate-500 text-xs mt-1" numberOfLines={1}>
            {media.prompt}
          </Text>
          <View className="flex-row items-center justify-between mt-3">
            <View className="flex-row items-center">
              <Text className="text-slate-400 text-xs">{media.provider}</Text>
              <Text className="text-slate-600 mx-2">•</Text>
              <Text className="text-slate-400 text-xs">{media.createdAt}</Text>
            </View>
            {media.status === 'completed' && (
              <View className="flex-row gap-2">
                <Pressable
                  onPress={handleDownload}
                  className="w-8 h-8 bg-slate-700 rounded-full items-center justify-center active:bg-slate-600"
                >
                  {canDownload ? (
                    <Download size={14} color="#06b6d4" />
                  ) : (
                    <Lock size={14} color="#64748b" />
                  )}
                </Pressable>
                <Pressable
                  onPress={handleShare}
                  className="w-8 h-8 bg-slate-700 rounded-full items-center justify-center active:bg-slate-600"
                >
                  {canShare ? (
                    <Share2 size={14} color="#06b6d4" />
                  ) : (
                    <Lock size={14} color="#64748b" />
                  )}
                </Pressable>
              </View>
            )}
          </View>
        </View>
      </View>
    </Pressable>
  );
}

function ProviderSelector({
  selectedProvider,
  onSelect,
  isOpen,
  onToggle,
}: {
  selectedProvider: GenerationProvider;
  onSelect: (provider: GenerationProvider) => void;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <View className="relative z-50 mb-4">
      <Text className="text-slate-400 text-sm mb-2">AI Model</Text>
      <Pressable
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          onToggle();
        }}
        className="flex-row items-center bg-slate-800 border border-slate-700/50 rounded-xl px-4 py-3 active:bg-slate-700/80"
      >
        <View
          style={{ backgroundColor: `${selectedProvider.color}20` }}
          className="w-9 h-9 rounded-lg items-center justify-center mr-3"
        >
          {selectedProvider.icon}
        </View>
        <View className="flex-1">
          <Text className="text-white font-medium">
            {selectedProvider.name}
          </Text>
          <Text className="text-slate-400 text-xs">
            {selectedProvider.description}
          </Text>
        </View>
        <ChevronDown
          size={18}
          color="#64748b"
          style={{ transform: [{ rotate: isOpen ? '180deg' : '0deg' }] }}
        />
      </Pressable>

      {isOpen && (
        <Animated.View
          entering={FadeIn.duration(200)}
          exiting={FadeOut.duration(150)}
          className="absolute top-20 left-0 right-0 bg-slate-800 border border-slate-700/50 rounded-2xl overflow-hidden shadow-xl"
          style={{ elevation: 10, zIndex: 100 }}
        >
          <ScrollView style={{ maxHeight: 280 }}>
            {GENERATION_PROVIDERS.map((provider) => (
              <Pressable
                key={provider.id}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  onSelect(provider);
                }}
                className={`flex-row items-center px-4 py-3 border-b border-slate-700/30 active:bg-slate-700/50 ${
                  provider.id === selectedProvider.id ? 'bg-slate-700/30' : ''
                }`}
              >
                <View
                  style={{ backgroundColor: `${provider.color}20` }}
                  className="w-10 h-10 rounded-xl items-center justify-center mr-3"
                >
                  {provider.icon}
                </View>
                <View className="flex-1">
                  <View className="flex-row items-center">
                    <Text className="text-white font-medium">
                      {provider.name}
                    </Text>
                    <View
                      className={`ml-2 px-2 py-0.5 rounded-full ${
                        provider.type === 'image'
                          ? 'bg-amber-500/20'
                          : 'bg-purple-500/20'
                      }`}
                    >
                      <Text
                        className={`text-[10px] font-medium ${
                          provider.type === 'image'
                            ? 'text-amber-400'
                            : 'text-purple-400'
                        }`}
                      >
                        {provider.type.toUpperCase()}
                      </Text>
                    </View>
                  </View>
                  <Text className="text-slate-400 text-xs mt-0.5">
                    {provider.estimatedTime}
                  </Text>
                </View>
                {provider.id === selectedProvider.id && (
                  <View
                    style={{ backgroundColor: provider.color }}
                    className="w-6 h-6 rounded-full items-center justify-center"
                  >
                    <Check size={14} color="#fff" />
                  </View>
                )}
              </Pressable>
            ))}
          </ScrollView>
        </Animated.View>
      )}
    </View>
  );
}

function CreateMediaModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: (media: GeneratedMedia) => void;
}) {
  const [prompt, setPrompt] = useState('');
  const [selectedProvider, setSelectedProvider] = useState(
    GENERATION_PROVIDERS[0]
  );
  const [isProviderOpen, setIsProviderOpen] = useState(false);
  const [selectedAspectRatio, setSelectedAspectRatio] = useState(
    ASPECT_RATIOS[0]
  );
  const [selectedDuration, setSelectedDuration] = useState(VIDEO_DURATIONS[1]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState('');

  const isVideo = selectedProvider.type === 'video';

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      Alert.alert('Error', 'Please enter a prompt');
      return;
    }

    setIsGenerating(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    const mediaId = Date.now().toString();
    const newMedia: GeneratedMedia = {
      id: mediaId,
      type: selectedProvider.type,
      title: prompt.slice(0, 30) + (prompt.length > 30 ? '...' : ''),
      prompt,
      uri: '',
      provider: selectedProvider.name,
      status: 'processing',
      createdAt: new Date().toLocaleDateString(),
      aspectRatio: selectedAspectRatio.id,
    };

    onCreated(newMedia);

    try {
      let uri = '';

      if (selectedProvider.id === 'nano-banana') {
        setProgress('Generating image with Nano Banana...');
        uri = await generateWithNanoBanana(prompt, selectedAspectRatio.id);
      } else if (selectedProvider.id === 'gpt-image') {
        setProgress('Generating image with GPT Image...');
        uri = await generateWithGPTImage(prompt, selectedAspectRatio.size);
      } else if (
        selectedProvider.id === 'sora-2' ||
        selectedProvider.id === 'sora-2-pro'
      ) {
        setProgress('Creating video job...');
        const videoSize =
          selectedAspectRatio.id === '16:9'
            ? '1280x720'
            : selectedAspectRatio.id === '9:16'
              ? '720x1280'
              : '1280x720';
        uri = await generateWithSora(
          prompt,
          selectedProvider.id,
          videoSize,
          parseInt(selectedDuration.id, 10)
        );
      }

      // Update with completed status
      onCreated({
        ...newMedia,
        uri,
        status: 'completed',
      });

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      onClose();
    } catch (error) {
      console.error('Generation error:', error);
      onCreated({
        ...newMedia,
        status: 'failed',
      });
      Alert.alert(
        'Generation Failed',
        error instanceof Error ? error.message : 'Please try again'
      );
    } finally {
      setIsGenerating(false);
      setProgress('');
    }
  };

  return (
    <View className="flex-1 bg-slate-900 px-6 pt-6">
      <Animated.View entering={FadeInUp.springify()} className="flex-1">
        <View className="flex-row items-center justify-between mb-6">
          <Text className="text-white text-2xl font-bold">Create Media</Text>
          <Pressable onPress={onClose} disabled={isGenerating}>
            <X size={24} color={isGenerating ? '#475569' : '#06b6d4'} />
          </Pressable>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
          {/* Provider Selector */}
          <ProviderSelector
            selectedProvider={selectedProvider}
            onSelect={(p) => {
              setSelectedProvider(p);
              setIsProviderOpen(false);
            }}
            isOpen={isProviderOpen}
            onToggle={() => setIsProviderOpen(!isProviderOpen)}
          />

          {/* Prompt Input */}
          <View className="mb-4">
            <Text className="text-slate-400 text-sm mb-2">
              Describe what you want to create
            </Text>
            <TextInput
              className="bg-slate-800 rounded-xl px-4 py-4 text-white min-h-[100px]"
              placeholder={
                isVideo
                  ? 'A cinematic shot of a golden retriever running through a meadow at sunset...'
                  : 'A photorealistic sunset over mountains with vibrant orange and purple colors...'
              }
              placeholderTextColor="#64748b"
              value={prompt}
              onChangeText={setPrompt}
              multiline
              textAlignVertical="top"
              editable={!isGenerating}
            />
          </View>

          {/* Aspect Ratio Selection */}
          <View className="mb-4">
            <Text className="text-slate-400 text-sm mb-2">Aspect Ratio</Text>
            <View className="flex-row flex-wrap gap-2">
              {ASPECT_RATIOS.map((ratio) => (
                <Pressable
                  key={ratio.id}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setSelectedAspectRatio(ratio);
                  }}
                  disabled={isGenerating}
                  className={`px-4 py-2 rounded-xl border ${
                    selectedAspectRatio.id === ratio.id
                      ? 'bg-cyan-500/20 border-cyan-500'
                      : 'bg-slate-800 border-slate-700'
                  }`}
                >
                  <Text
                    className={`text-sm font-medium ${
                      selectedAspectRatio.id === ratio.id
                        ? 'text-cyan-400'
                        : 'text-slate-300'
                    }`}
                  >
                    {ratio.label}
                  </Text>
                  <Text className="text-slate-500 text-xs">{ratio.id}</Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Video Duration (only for video) */}
          {isVideo && (
            <View className="mb-6">
              <Text className="text-slate-400 text-sm mb-2">Duration</Text>
              <View className="flex-row gap-2">
                {VIDEO_DURATIONS.map((duration) => (
                  <Pressable
                    key={duration.id}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setSelectedDuration(duration);
                    }}
                    disabled={isGenerating}
                    className={`flex-1 py-3 rounded-xl border items-center ${
                      selectedDuration.id === duration.id
                        ? 'bg-purple-500/20 border-purple-500'
                        : 'bg-slate-800 border-slate-700'
                    }`}
                  >
                    <Text
                      className={`text-sm font-medium ${
                        selectedDuration.id === duration.id
                          ? 'text-purple-400'
                          : 'text-slate-300'
                      }`}
                    >
                      {duration.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          )}

          {/* Estimated Time */}
          <View className="bg-slate-800/50 rounded-xl p-4 mb-6 flex-row items-center">
            <Clock size={18} color="#64748b" />
            <Text className="text-slate-400 text-sm ml-2">
              Estimated time: {selectedProvider.estimatedTime}
            </Text>
          </View>

          {/* Generate Button */}
          <Pressable onPress={handleGenerate} disabled={isGenerating}>
            <LinearGradient
              colors={selectedProvider.gradientColors}
              style={{
                borderRadius: 16,
                paddingVertical: 16,
                alignItems: 'center',
                flexDirection: 'row',
                justifyContent: 'center',
                opacity: isGenerating ? 0.7 : 1,
              }}
            >
              {isGenerating ? (
                <View className="flex-row items-center">
                  <ActivityIndicator color="#fff" />
                  <Text className="text-white font-semibold text-base ml-2">
                    {progress || 'Generating...'}
                  </Text>
                </View>
              ) : (
                <>
                  <Wand2 size={20} color="#fff" />
                  <Text className="text-white font-semibold text-lg ml-2">
                    Generate {isVideo ? 'Video' : 'Image'}
                  </Text>
                </>
              )}
            </LinearGradient>
          </Pressable>

          <View className="h-20" />
        </ScrollView>
      </Animated.View>
    </View>
  );
}

export default function ShortyMagicScreen() {
  const [showCreate, setShowCreate] = useState(false);
  const [media, setMedia] = useState<GeneratedMedia[]>([]);
  const [paywallVisible, setPaywallVisible] = useState(false);
  const [paywallFeature, setPaywallFeature] = useState('');

  const { canDownload, canShare, canGenerateVideo, remainingVideos, tier } = useSubscription();
  const incrementVideoUsage = useSubscriptionStore((s) => s.incrementVideoUsage);

  const handlePaywallTrigger = (feature: string) => {
    setPaywallFeature(feature);
    setPaywallVisible(true);
  };

  // Load saved media on mount
  useEffect(() => {
    loadMedia();
  }, []);

  const loadMedia = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        setMedia(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Failed to load media:', error);
    }
  };

  const saveMedia = async (updatedMedia: GeneratedMedia[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedMedia));
    } catch (error) {
      console.error('Failed to save media:', error);
    }
  };

  const handleMediaCreated = (newMedia: GeneratedMedia) => {
    setMedia((prev) => {
      const existing = prev.findIndex((m) => m.id === newMedia.id);
      let updated: GeneratedMedia[];
      if (existing >= 0) {
        updated = [...prev];
        updated[existing] = newMedia;
      } else {
        updated = [newMedia, ...prev];
      }
      saveMedia(updated);
      return updated;
    });
  };

  const handleDelete = (id: string) => {
    Alert.alert('Delete Media', 'Are you sure you want to delete this?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          setMedia((prev) => {
            const updated = prev.filter((m) => m.id !== id);
            saveMedia(updated);
            return updated;
          });
        },
      },
    ]);
  };

  if (showCreate) {
    // Check if free user has exceeded limit
    if (tier === 'free' && !canGenerateVideo) {
      return (
        <View className="flex-1 bg-slate-900 px-6 pt-6">
          <View className="flex-row items-center justify-between mb-6">
            <Text className="text-white text-2xl font-bold">Create Media</Text>
            <Pressable onPress={() => setShowCreate(false)}>
              <X size={24} color="#06b6d4" />
            </Pressable>
          </View>
          <View className="flex-1 justify-center items-center px-4">
            <View className="w-20 h-20 rounded-full bg-slate-800 items-center justify-center mb-4">
              <Lock size={40} color="#64748b" />
            </View>
            <Text className="text-white text-xl font-bold text-center mb-2">
              Free Trial Limit Reached
            </Text>
            <Text className="text-slate-400 text-center mb-6">
              You've used your 1 free video preview. Upgrade to create unlimited content!
            </Text>
            <PaywallBanner feature="unlimited video creation" />
          </View>
        </View>
      );
    }

    return (
      <CreateMediaModal
        onClose={() => setShowCreate(false)}
        onCreated={(newMedia) => {
          handleMediaCreated(newMedia);
          // Increment usage for free tier when video is created
          if (tier === 'free' && newMedia.status === 'completed') {
            incrementVideoUsage();
          }
        }}
      />
    );
  }

  return (
    <View className="flex-1 bg-slate-900">
      <Stack.Screen
        options={{
          title: 'Shorty Magic',
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
          {/* Free Tier Usage Banner */}
          {tier === 'free' && (
            <Animated.View entering={FadeInDown.delay(80).springify()} className="mb-4">
              <View className="bg-amber-500/10 border border-amber-500/30 rounded-xl px-4 py-3 flex-row items-center">
                <Sparkles size={18} color="#f59e0b" />
                <Text className="text-amber-400 text-sm ml-2 flex-1">
                  Free trial: {remainingVideos} video{remainingVideos !== 1 ? 's' : ''} remaining
                </Text>
                <Pressable onPress={() => router.push('/pricing')}>
                  <Text className="text-amber-400 font-semibold text-sm">Upgrade</Text>
                </Pressable>
              </View>
            </Animated.View>
          )}

          {/* Hero Section */}
          <Animated.View entering={FadeInDown.delay(100).springify()}>
            <LinearGradient
              colors={['#8b5cf6', '#6366f1']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ borderRadius: 24, padding: 24, marginBottom: 24 }}
            >
              <View className="flex-row items-center mb-3">
                <Sparkles size={24} color="#fff" />
                <Text className="text-white/80 text-sm ml-2">
                  AI Media Generator
                </Text>
              </View>
              <Text className="text-white text-2xl font-bold mb-2">
                Create Stunning Images & Videos
              </Text>
              <Text className="text-white/70 mb-4">
                Use Nano Banana, GPT Image, or Sora to generate amazing content
              </Text>
              <Pressable
                onPress={() => setShowCreate(true)}
                className="bg-white/20 rounded-xl py-3 flex-row items-center justify-center active:bg-white/30"
              >
                <Plus size={20} color="#fff" />
                <Text className="text-white font-semibold ml-2">
                  Create New Media
                </Text>
              </Pressable>
            </LinearGradient>
          </Animated.View>

          {/* Provider Quick Access */}
          <Animated.View entering={FadeInDown.delay(150).springify()}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="mb-6"
              style={{ flexGrow: 0 }}
            >
              {GENERATION_PROVIDERS.map((provider) => (
                <Pressable
                  key={provider.id}
                  onPress={() => setShowCreate(true)}
                  className="mr-3 active:scale-95"
                >
                  <LinearGradient
                    colors={provider.gradientColors}
                    style={{
                      borderRadius: 16,
                      padding: 16,
                      width: 140,
                    }}
                  >
                    {provider.icon}
                    <Text className="text-white font-semibold mt-2">
                      {provider.shortName}
                    </Text>
                    <Text className="text-white/60 text-xs mt-1">
                      {provider.type === 'image' ? 'Image' : 'Video'}
                    </Text>
                  </LinearGradient>
                </Pressable>
              ))}
            </ScrollView>
          </Animated.View>

          {/* Media List */}
          <Animated.View entering={FadeInDown.delay(200).springify()}>
            <Text className="text-white text-lg font-semibold mb-4">
              Your Creations ({media.length})
            </Text>
            {media.length === 0 ? (
              <View className="bg-slate-800/30 rounded-2xl p-8 items-center">
                <ImageIcon size={48} color="#475569" />
                <Text className="text-slate-400 text-center mt-4">
                  No media yet. Create your first image or video!
                </Text>
              </View>
            ) : (
              media.map((item, index) => (
                <Animated.View
                  key={item.id}
                  entering={FadeInDown.delay(250 + index * 50).springify()}
                >
                  <MediaCard
                    media={item}
                    onDelete={handleDelete}
                    canDownload={canDownload}
                    canShare={canShare}
                    onPaywallTrigger={handlePaywallTrigger}
                  />
                </Animated.View>
              ))
            )}
          </Animated.View>
        </ScrollView>
      </LinearGradient>

      {/* Paywall Modal */}
      <PaywallModal
        visible={paywallVisible}
        onClose={() => setPaywallVisible(false)}
        feature={paywallFeature}
        description={`Upgrade to a paid plan to unlock ${paywallFeature.toLowerCase()} and more premium features.`}
      />
    </View>
  );
}
