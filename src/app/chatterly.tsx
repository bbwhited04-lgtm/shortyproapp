import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, router } from 'expo-router';
import {
  MessageCircle,
  Send,
  Bot,
  User,
  Sparkles,
  Plus,
  ChevronDown,
  Check,
  Zap,
  Brain,
  Search,
  Cpu,
  Star,
  Flame,
  Lock,
} from 'lucide-react-native';
import Animated, { FadeInDown, FadeIn, FadeOut } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useSubscription, useSubscriptionStore } from '@/lib/subscriptionStore';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  provider?: string;
}

interface AIProvider {
  id: string;
  name: string;
  shortName: string;
  description: string;
  color: string;
  gradientColors: [string, string];
  icon: React.ReactNode;
}

const AI_PROVIDERS: AIProvider[] = [
  {
    id: 'gpt-5.2',
    name: 'ChatGPT',
    shortName: 'GPT-5.2',
    description: 'OpenAI\'s most capable model',
    color: '#10a37f',
    gradientColors: ['#10a37f', '#1a7f5a'],
    icon: <Sparkles size={18} color="#10a37f" />,
  },
  {
    id: 'gpt-5.1',
    name: 'ChatGPT',
    shortName: 'GPT-5.1',
    description: 'OpenAI\'s powerful reasoning model',
    color: '#10a37f',
    gradientColors: ['#10a37f', '#0d8a6a'],
    icon: <Sparkles size={18} color="#10a37f" />,
  },
  {
    id: 'gpt-5',
    name: 'ChatGPT',
    shortName: 'GPT-5',
    description: 'OpenAI\'s flagship model',
    color: '#10a37f',
    gradientColors: ['#10a37f', '#0a7556'],
    icon: <Sparkles size={18} color="#10a37f" />,
  },
  {
    id: 'gpt-5-mini',
    name: 'ChatGPT Mini',
    shortName: 'GPT-5 Mini',
    description: 'Fast and efficient OpenAI model',
    color: '#10a37f',
    gradientColors: ['#10a37f', '#15946c'],
    icon: <Sparkles size={18} color="#10a37f" />,
  },
  {
    id: 'gpt-4o',
    name: 'ChatGPT',
    shortName: 'GPT-4o',
    description: 'OpenAI multimodal model',
    color: '#10a37f',
    gradientColors: ['#10a37f', '#0e8762'],
    icon: <Sparkles size={18} color="#10a37f" />,
  },
  {
    id: 'gemini',
    name: 'Gemini',
    shortName: 'Gemini 3 Pro',
    description: 'Google\'s multimodal AI',
    color: '#4285f4',
    gradientColors: ['#4285f4', '#1a73e8'],
    icon: <Brain size={18} color="#4285f4" />,
  },
  {
    id: 'grok-fast',
    name: 'Grok',
    shortName: 'Grok 4 Fast',
    description: 'xAI\'s witty assistant',
    color: '#f43f5e',
    gradientColors: ['#f43f5e', '#e11d48'],
    icon: <Zap size={18} color="#f43f5e" />,
  },
  {
    id: 'grok-reasoning',
    name: 'Grok Reasoning',
    shortName: 'Grok 4 Reasoning',
    description: 'xAI with deep reasoning',
    color: '#f43f5e',
    gradientColors: ['#f43f5e', '#be123c'],
    icon: <Flame size={18} color="#f43f5e" />,
  },
  {
    id: 'deepseek',
    name: 'DeepSeek',
    shortName: 'DeepSeek V3',
    description: 'Advanced reasoning model',
    color: '#6366f1',
    gradientColors: ['#6366f1', '#4f46e5'],
    icon: <Cpu size={18} color="#6366f1" />,
  },
  {
    id: 'perplexity',
    name: 'Perplexity',
    shortName: 'Sonar',
    description: 'AI with real-time search',
    color: '#20b2aa',
    gradientColors: ['#20b2aa', '#008b8b'],
    icon: <Search size={18} color="#20b2aa" />,
  },
  {
    id: 'claude',
    name: 'Claude',
    shortName: 'Claude 3.5',
    description: 'Anthropic\'s helpful assistant',
    color: '#d97706',
    gradientColors: ['#d97706', '#b45309'],
    icon: <Star size={18} color="#d97706" />,
  },
];

type ChatMessage = { role: 'system' | 'user' | 'assistant'; content: string };

async function callOpenAI(
  model: string,
  messages: ChatMessage[]
): Promise<string> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: 'Bearer ' + process.env.EXPO_PUBLIC_VIBECODE_OPENAI_API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages,
      max_completion_tokens: 1000,
      temperature: 1,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenAI API failed: ${errorText}`);
  }
  const data = await response.json();
  return data.choices[0].message.content;
}

async function callGemini(messages: ChatMessage[]): Promise<string> {
  const contents = messages
    .filter((m) => m.role !== 'system')
    .map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

  const systemMsg = messages.find((m) => m.role === 'system');

  const response = await fetch(
    'https://generativelanguage.googleapis.com/v1beta/models/gemini-3-pro-preview:generateContent',
    {
      method: 'POST',
      headers: {
        'x-goog-api-key': process.env.EXPO_PUBLIC_VIBECODE_GOOGLE_API_KEY ?? '',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents,
        ...(systemMsg && {
          system_instruction: { parts: [{ text: systemMsg.content }] },
        }),
        generationConfig: { temperature: 1.0 },
      }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini API failed: ${errorText}`);
  }
  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
}

async function callGrok(
  model: string,
  messages: ChatMessage[]
): Promise<string> {
  const response = await fetch('https://api.x.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: 'Bearer ' + process.env.EXPO_PUBLIC_VIBECODE_GROK_API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages,
      max_tokens: 1000,
      temperature: 1,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Grok API failed: ${errorText}`);
  }
  const data = await response.json();
  return data.choices[0].message.content;
}

async function callAI(
  providerId: string,
  messages: ChatMessage[]
): Promise<string> {
  switch (providerId) {
    case 'gpt-5.2':
      return callOpenAI('gpt-5.2', messages);
    case 'gpt-5.1':
      return callOpenAI('gpt-5.1', messages);
    case 'gpt-5':
      return callOpenAI('gpt-5', messages);
    case 'gpt-5-mini':
      return callOpenAI('gpt-5-mini', messages);
    case 'gpt-4o':
      return callOpenAI('gpt-4o', messages);
    case 'gemini':
      return callGemini(messages);
    case 'grok-fast':
      return callGrok('grok-4-fast-non-reasoning', messages);
    case 'grok-reasoning':
      return callGrok('grok-4-fast-reasoning', messages);
    // For providers without API keys configured, return a placeholder
    case 'deepseek':
    case 'perplexity':
    case 'claude':
      return `I'm ${AI_PROVIDERS.find((p) => p.id === providerId)?.name ?? 'an AI'}. This provider isn't connected yet. Please use one of the connected providers like ChatGPT, Gemini, or Grok.`;
    default:
      return callOpenAI('gpt-5.2', messages);
  }
}

function ChatBubble({
  message,
  provider,
}: {
  message: Message;
  provider: AIProvider;
}) {
  const isUser = message.role === 'user';

  return (
    <Animated.View
      entering={FadeIn.duration(300)}
      className={`flex-row mb-4 ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      {!isUser && (
        <View
          style={{ backgroundColor: `${provider.color}20` }}
          className="w-8 h-8 rounded-full items-center justify-center mr-2"
        >
          <Bot size={16} color={provider.color} />
        </View>
      )}
      <View
        className={`max-w-[80%] rounded-2xl px-4 py-3 ${
          isUser
            ? 'bg-cyan-500 rounded-tr-sm'
            : 'bg-slate-800 border border-slate-700/50 rounded-tl-sm'
        }`}
      >
        {!isUser && (
          <Text
            style={{ color: provider.color }}
            className="text-xs font-medium mb-1"
          >
            {provider.name}
          </Text>
        )}
        <Text className={isUser ? 'text-white' : 'text-slate-200'}>
          {message.content}
        </Text>
      </View>
      {isUser && (
        <View className="w-8 h-8 bg-slate-700 rounded-full items-center justify-center ml-2">
          <User size={16} color="#94a3b8" />
        </View>
      )}
    </Animated.View>
  );
}

function SuggestedPrompt({
  text,
  onPress,
}: {
  text: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className="bg-slate-800/50 border border-slate-700/50 rounded-xl px-4 py-3 mr-3 active:bg-slate-700/50"
    >
      <Text className="text-slate-300 text-sm">{text}</Text>
    </Pressable>
  );
}

function ProviderSelector({
  selectedProvider,
  onSelect,
  isOpen,
  onToggle,
}: {
  selectedProvider: AIProvider;
  onSelect: (provider: AIProvider) => void;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <View className="relative z-50">
      <Pressable
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          onToggle();
        }}
        className="flex-row items-center bg-slate-800/80 border border-slate-700/50 rounded-xl px-3 py-2 active:bg-slate-700/80"
      >
        <View
          style={{ backgroundColor: `${selectedProvider.color}20` }}
          className="w-7 h-7 rounded-lg items-center justify-center mr-2"
        >
          {selectedProvider.icon}
        </View>
        <View className="flex-1 mr-2">
          <Text className="text-white font-medium text-sm">
            {selectedProvider.name}
          </Text>
          <Text className="text-slate-400 text-xs">
            {selectedProvider.shortName}
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
          className="absolute top-14 left-0 right-0 bg-slate-800 border border-slate-700/50 rounded-2xl overflow-hidden shadow-xl"
          style={{ elevation: 10 }}
        >
          <ScrollView style={{ maxHeight: 400 }}>
            {AI_PROVIDERS.map((provider) => (
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
                  <Text className="text-white font-medium">{provider.name}</Text>
                  <Text className="text-slate-400 text-xs mt-0.5">
                    {provider.description}
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

export default function ChatterlyScreen() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<AIProvider>(
    AI_PROVIDERS[0]
  );
  const [isProviderSelectorOpen, setIsProviderSelectorOpen] = useState(false);
  const [conversationHistory, setConversationHistory] = useState<ChatMessage[]>(
    []
  );
  const scrollRef = useRef<ScrollView>(null);

  const { tier, canSendMessage, remainingMessages } = useSubscription();
  const incrementMessageUsage = useSubscriptionStore((s) => s.incrementMessageUsage);

  // Set initial message when provider changes
  useEffect(() => {
    const initialMessage: Message = {
      id: '1',
      role: 'assistant',
      content: `Hello! I'm powered by ${selectedProvider.name} (${selectedProvider.shortName}). How can I help you today? I can help with content ideas, marketing strategies, customer responses, and more!`,
      timestamp: new Date(),
      provider: selectedProvider.id,
    };
    setMessages([initialMessage]);
    setConversationHistory([
      {
        role: 'system',
        content:
          'You are Chatterly, a helpful AI assistant for business owners. Help with content ideas, marketing strategies, customer responses, and business advice. Be concise but helpful.',
      },
    ]);
  }, [selectedProvider.id]);

  const suggestedPrompts = [
    'Write a product description',
    'Create social media post',
    'Customer response template',
    'Marketing email ideas',
  ];

  const sendMessage = async (text: string) => {
    if (!text.trim() || isTyping) return;

    // Check message limit for free/starter users
    if (!canSendMessage) {
      Alert.alert(
        'Message Limit Reached',
        tier === 'free'
          ? 'You\'ve used your 5 free messages today. Upgrade to send unlimited messages!'
          : 'You\'ve reached your daily message limit. Upgrade to Pro for unlimited messages!',
        [
          { text: 'Maybe Later', style: 'cancel' },
          { text: 'View Plans', onPress: () => router.push('/pricing') },
        ]
      );
      return;
    }

    setIsProviderSelectorOpen(false);

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    // Increment message usage for tracking
    incrementMessageUsage();

    const updatedHistory: ChatMessage[] = [
      ...conversationHistory,
      { role: 'user', content: text.trim() },
    ];

    try {
      const response = await callAI(selectedProvider.id, updatedHistory);

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date(),
        provider: selectedProvider.id,
      };

      setMessages((prev) => [...prev, aiMessage]);
      setConversationHistory([
        ...updatedHistory,
        { role: 'assistant', content: response },
      ]);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content:
          'Sorry, I encountered an error. Please try again or switch to a different AI provider.',
        timestamp: new Date(),
        provider: selectedProvider.id,
      };
      setMessages((prev) => [...prev, errorMessage]);
      console.error('AI API error:', error);
    }

    setIsTyping(false);
  };

  const startNewChat = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const initialMessage: Message = {
      id: Date.now().toString(),
      role: 'assistant',
      content: `Hello! I'm powered by ${selectedProvider.name} (${selectedProvider.shortName}). How can I help you today? I can help with content ideas, marketing strategies, customer responses, and more!`,
      timestamp: new Date(),
      provider: selectedProvider.id,
    };
    setMessages([initialMessage]);
    setConversationHistory([
      {
        role: 'system',
        content:
          'You are Chatterly, a helpful AI assistant for business owners. Help with content ideas, marketing strategies, customer responses, and business advice. Be concise but helpful.',
      },
    ]);
  };

  useEffect(() => {
    scrollRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  return (
    <View className="flex-1 bg-slate-900">
      <Stack.Screen
        options={{
          title: 'Chatterly',
          headerStyle: { backgroundColor: '#0f172a' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: '600' },
          headerRight: () => (
            <Pressable onPress={startNewChat} className="mr-4 active:opacity-70">
              <Plus size={24} color="#06b6d4" />
            </Pressable>
          ),
        }}
      />
      <LinearGradient colors={['#0f172a', '#1e293b']} style={{ flex: 1 }}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="flex-1"
          keyboardVerticalOffset={100}
        >
          {/* Provider Selector */}
          <View className="px-4 pt-3 pb-2 z-50">
            <ProviderSelector
              selectedProvider={selectedProvider}
              onSelect={(provider) => {
                setSelectedProvider(provider);
                setIsProviderSelectorOpen(false);
              }}
              isOpen={isProviderSelectorOpen}
              onToggle={() => setIsProviderSelectorOpen(!isProviderSelectorOpen)}
            />
          </View>

          {/* Free Tier Usage Banner */}
          {tier === 'free' && (
            <View className="px-4 pb-2">
              <View className="bg-amber-500/10 border border-amber-500/30 rounded-xl px-4 py-2.5 flex-row items-center">
                <MessageCircle size={16} color="#f59e0b" />
                <Text className="text-amber-400 text-sm ml-2 flex-1">
                  {remainingMessages} message{remainingMessages !== 1 ? 's' : ''} left today
                </Text>
                <Pressable onPress={() => router.push('/pricing')}>
                  <Text className="text-amber-400 font-semibold text-sm">Upgrade</Text>
                </Pressable>
              </View>
            </View>
          )}

          {/* Chat Messages */}
          <ScrollView
            ref={scrollRef}
            className="flex-1 px-4 pt-2"
            contentContainerStyle={{ paddingBottom: 20 }}
            onTouchStart={() => setIsProviderSelectorOpen(false)}
          >
            {/* Hero Card */}
            <Animated.View entering={FadeInDown.delay(100).springify()}>
              <LinearGradient
                colors={selectedProvider.gradientColors}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{ borderRadius: 20, padding: 20, marginBottom: 20 }}
              >
                <View className="flex-row items-center mb-2">
                  {selectedProvider.icon}
                  <Text className="text-white font-semibold ml-2">
                    Powered by {selectedProvider.name}
                  </Text>
                </View>
                <Text className="text-white/90 text-sm">
                  Ask me anything about your business, marketing, content
                  creation, or customer engagement!
                </Text>
              </LinearGradient>
            </Animated.View>

            {/* Messages */}
            {messages.map((message) => (
              <ChatBubble
                key={message.id}
                message={message}
                provider={selectedProvider}
              />
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <Animated.View
                entering={FadeIn}
                className="flex-row items-center mb-4"
              >
                <View
                  style={{ backgroundColor: `${selectedProvider.color}20` }}
                  className="w-8 h-8 rounded-full items-center justify-center mr-2"
                >
                  <Bot size={16} color={selectedProvider.color} />
                </View>
                <View className="bg-slate-800 rounded-2xl px-4 py-3 flex-row items-center">
                  <ActivityIndicator size="small" color={selectedProvider.color} />
                  <Text className="text-slate-400 ml-2">Thinking...</Text>
                </View>
              </Animated.View>
            )}

            {/* Suggested Prompts */}
            {messages.length <= 1 && (
              <Animated.View entering={FadeInDown.delay(200).springify()}>
                <Text className="text-slate-400 text-sm mb-3">Try asking:</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={{ flexGrow: 0 }}
                >
                  {suggestedPrompts.map((prompt) => (
                    <SuggestedPrompt
                      key={prompt}
                      text={prompt}
                      onPress={() => sendMessage(prompt)}
                    />
                  ))}
                </ScrollView>
              </Animated.View>
            )}
          </ScrollView>

          {/* Input Area */}
          <View className="px-4 pb-8 pt-2 border-t border-slate-800">
            <View className="flex-row items-center bg-slate-800/50 rounded-2xl px-4 border border-slate-700/50">
              <MessageCircle size={20} color="#64748b" />
              <TextInput
                className="flex-1 py-4 px-3 text-white"
                placeholder={`Ask ${selectedProvider.name}...`}
                placeholderTextColor="#64748b"
                value={input}
                onChangeText={setInput}
                onFocus={() => setIsProviderSelectorOpen(false)}
                multiline
                maxLength={1000}
              />
              <Pressable
                onPress={() => sendMessage(input)}
                disabled={!input.trim() || isTyping}
                style={{
                  backgroundColor:
                    input.trim() && !isTyping
                      ? selectedProvider.color
                      : '#334155',
                }}
                className="w-10 h-10 rounded-xl items-center justify-center"
              >
                <Send
                  size={18}
                  color={input.trim() && !isTyping ? '#fff' : '#64748b'}
                />
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </LinearGradient>
    </View>
  );
}
