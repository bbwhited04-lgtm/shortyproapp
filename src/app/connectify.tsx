import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
  Modal,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, router } from 'expo-router';
import {
  Users,
  Search,
  Mail,
  Building2,
  MoreVertical,
  UserPlus,
  ChevronRight,
  X,
  BookUser,
  Facebook,
  Instagram,
  Linkedin,
  Twitter,
  Phone,
  Plus,
  Lock,
} from 'lucide-react-native';
import Animated, { FadeInDown, FadeIn, FadeOut } from 'react-native-reanimated';
import * as Contacts from 'expo-contacts';
import * as Haptics from 'expo-haptics';
import type { Contact } from '@/lib/api';
import { useSubscription } from '@/lib/subscriptionStore';

// Mock data
const mockContacts: Contact[] = [
  {
    id: '1',
    name: 'Sarah Johnson',
    email: 'sarah@company.com',
    phone: '+1 555-0123',
    company: 'Tech Solutions Inc',
    status: 'customer',
    lastContact: '2024-01-14',
    createdAt: '2023-11-20',
  },
  {
    id: '2',
    name: 'Michael Chen',
    email: 'mchen@startup.io',
    phone: '+1 555-0456',
    company: 'StartupIO',
    status: 'prospect',
    lastContact: '2024-01-12',
    createdAt: '2024-01-05',
  },
  {
    id: '3',
    name: 'Emily Davis',
    email: 'emily@creative.co',
    company: 'Creative Co',
    status: 'lead',
    createdAt: '2024-01-10',
  },
  {
    id: '4',
    name: 'James Wilson',
    email: 'jwilson@enterprise.com',
    phone: '+1 555-0789',
    company: 'Enterprise Corp',
    status: 'customer',
    lastContact: '2024-01-15',
    createdAt: '2023-09-15',
  },
  {
    id: '5',
    name: 'Lisa Anderson',
    email: 'lisa@retail.shop',
    status: 'churned',
    createdAt: '2023-06-20',
  },
];

interface ImportOption {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

const IMPORT_OPTIONS: ImportOption[] = [
  {
    id: 'manual',
    name: 'Add Manually',
    description: 'Enter contact details by hand',
    icon: <UserPlus size={22} color="#10b981" />,
    color: '#10b981',
  },
  {
    id: 'phone',
    name: 'Phone Contacts',
    description: 'Import from your device contacts',
    icon: <BookUser size={22} color="#3b82f6" />,
    color: '#3b82f6',
  },
  {
    id: 'facebook',
    name: 'Facebook Friends',
    description: 'Import friends from Facebook',
    icon: <Facebook size={22} color="#1877F2" />,
    color: '#1877F2',
  },
  {
    id: 'instagram',
    name: 'Instagram Followers',
    description: 'Import from Instagram',
    icon: <Instagram size={22} color="#E4405F" />,
    color: '#E4405F',
  },
  {
    id: 'linkedin',
    name: 'LinkedIn Connections',
    description: 'Import from LinkedIn',
    icon: <Linkedin size={22} color="#0A66C2" />,
    color: '#0A66C2',
  },
  {
    id: 'twitter',
    name: 'X (Twitter) Followers',
    description: 'Import from X',
    icon: <Twitter size={22} color="#1DA1F2" />,
    color: '#1DA1F2',
  },
];

function ContactCard({ contact }: { contact: Contact }) {
  const statusConfig = {
    lead: { color: '#3b82f6', bg: 'bg-blue-500/10', label: 'Lead' },
    prospect: { color: '#f59e0b', bg: 'bg-amber-500/10', label: 'Prospect' },
    customer: { color: '#10b981', bg: 'bg-emerald-500/10', label: 'Customer' },
    churned: { color: '#64748b', bg: 'bg-slate-500/10', label: 'Churned' },
  };

  const status = statusConfig[contact.status];
  const initials = contact.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase();

  return (
    <Pressable className="mb-3 active:scale-[0.98]">
      <View className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700/30">
        <View className="flex-row items-center">
          {/* Avatar */}
          <View
            className="w-12 h-12 rounded-full items-center justify-center mr-4"
            style={{ backgroundColor: status.color + '20' }}
          >
            <Text style={{ color: status.color }} className="font-bold">
              {initials}
            </Text>
          </View>

          {/* Info */}
          <View className="flex-1">
            <View className="flex-row items-center mb-1">
              <Text className="text-white font-semibold text-base flex-1">
                {contact.name}
              </Text>
              <View
                className={`px-2 py-1 rounded-lg ${status.bg}`}
                style={{ borderWidth: 1, borderColor: status.color + '40' }}
              >
                <Text style={{ color: status.color }} className="text-xs">
                  {status.label}
                </Text>
              </View>
            </View>

            {contact.company && (
              <View className="flex-row items-center mb-1">
                <Building2 size={12} color="#64748b" />
                <Text className="text-slate-400 text-sm ml-1">
                  {contact.company}
                </Text>
              </View>
            )}

            <View className="flex-row items-center">
              <Mail size={12} color="#64748b" />
              <Text className="text-slate-500 text-xs ml-1">
                {contact.email}
              </Text>
            </View>
          </View>

          <Pressable className="p-2 ml-2">
            <MoreVertical size={18} color="#64748b" />
          </Pressable>
        </View>
      </View>
    </Pressable>
  );
}

function AddOptionsMenu({
  visible,
  onClose,
  onSelect,
}: {
  visible: boolean;
  onClose: () => void;
  onSelect: (optionId: string) => void;
}) {
  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onClose}
    >
      <Pressable
        className="flex-1 bg-black/60"
        onPress={onClose}
      >
        <View className="flex-1 justify-end">
          <Animated.View
            entering={FadeIn.duration(200)}
            exiting={FadeOut.duration(150)}
          >
            <Pressable onPress={(e) => e.stopPropagation()}>
              <View className="bg-slate-800 mx-4 mb-4 rounded-3xl overflow-hidden border border-slate-700/50">
                <View className="p-5 border-b border-slate-700/50">
                  <View className="flex-row items-center justify-between">
                    <Text className="text-white text-xl font-bold">Add Contacts</Text>
                    <Pressable
                      onPress={onClose}
                      className="w-8 h-8 bg-slate-700 rounded-full items-center justify-center"
                    >
                      <X size={16} color="#94a3b8" />
                    </Pressable>
                  </View>
                  <Text className="text-slate-400 text-sm mt-1">
                    Choose how to add new contacts
                  </Text>
                </View>

                <ScrollView style={{ maxHeight: 400 }}>
                  {IMPORT_OPTIONS.map((option, index) => (
                    <Pressable
                      key={option.id}
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        onSelect(option.id);
                      }}
                      className={`flex-row items-center px-5 py-4 active:bg-slate-700/50 ${
                        index < IMPORT_OPTIONS.length - 1
                          ? 'border-b border-slate-700/30'
                          : ''
                      }`}
                    >
                      <View
                        style={{ backgroundColor: `${option.color}20` }}
                        className="w-12 h-12 rounded-xl items-center justify-center mr-4"
                      >
                        {option.icon}
                      </View>
                      <View className="flex-1">
                        <Text className="text-white font-medium text-base">
                          {option.name}
                        </Text>
                        <Text className="text-slate-400 text-sm mt-0.5">
                          {option.description}
                        </Text>
                      </View>
                      <ChevronRight size={20} color="#64748b" />
                    </Pressable>
                  ))}
                </ScrollView>
              </View>
            </Pressable>
          </Animated.View>
        </View>
      </Pressable>
    </Modal>
  );
}

function AddContactModal({
  visible,
  onClose,
  onSave,
}: {
  visible: boolean;
  onClose: () => void;
  onSave: (contact: Partial<Contact>) => void;
}) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [company, setCompany] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<'lead' | 'prospect' | 'customer'>('lead');

  const handleSave = () => {
    if (!name.trim() || !email.trim()) {
      Alert.alert('Error', 'Name and email are required');
      return;
    }

    onSave({
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim() || undefined,
      company: company.trim() || undefined,
      status: selectedStatus,
    });

    // Reset form
    setName('');
    setEmail('');
    setPhone('');
    setCompany('');
    setSelectedStatus('lead');
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View className="flex-1 bg-slate-900">
        <View className="px-6 pt-6 pb-4 border-b border-slate-800">
          <View className="flex-row items-center justify-between">
            <Text className="text-white text-xl font-bold">Add Contact</Text>
            <Pressable onPress={onClose}>
              <Text className="text-emerald-400">Cancel</Text>
            </Pressable>
          </View>
        </View>

        <ScrollView className="flex-1 px-6 pt-6">
          <View className="mb-4">
            <Text className="text-slate-400 text-sm mb-2">Full Name *</Text>
            <TextInput
              className="bg-slate-800 rounded-xl px-4 py-4 text-white"
              placeholder="Enter full name..."
              placeholderTextColor="#64748b"
              value={name}
              onChangeText={setName}
            />
          </View>

          <View className="mb-4">
            <Text className="text-slate-400 text-sm mb-2">Email *</Text>
            <TextInput
              className="bg-slate-800 rounded-xl px-4 py-4 text-white"
              placeholder="Enter email..."
              placeholderTextColor="#64748b"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View className="mb-4">
            <Text className="text-slate-400 text-sm mb-2">Phone</Text>
            <TextInput
              className="bg-slate-800 rounded-xl px-4 py-4 text-white"
              placeholder="Enter phone number..."
              placeholderTextColor="#64748b"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />
          </View>

          <View className="mb-6">
            <Text className="text-slate-400 text-sm mb-2">Company</Text>
            <TextInput
              className="bg-slate-800 rounded-xl px-4 py-4 text-white"
              placeholder="Enter company name..."
              placeholderTextColor="#64748b"
              value={company}
              onChangeText={setCompany}
            />
          </View>

          <Text className="text-slate-400 text-sm mb-3">Status</Text>
          <View className="flex-row gap-2 mb-6">
            {(['lead', 'prospect', 'customer'] as const).map((s) => (
              <Pressable
                key={s}
                onPress={() => setSelectedStatus(s)}
                className={`flex-1 rounded-xl px-4 py-3 items-center border ${
                  selectedStatus === s
                    ? 'bg-emerald-500/20 border-emerald-500'
                    : 'bg-slate-800 border-slate-700/50'
                }`}
              >
                <Text
                  className={`capitalize ${
                    selectedStatus === s ? 'text-emerald-400' : 'text-slate-300'
                  }`}
                >
                  {s}
                </Text>
              </Pressable>
            ))}
          </View>
        </ScrollView>

        <View className="px-6 pb-10 pt-4">
          <Pressable onPress={handleSave}>
            <LinearGradient
              colors={['#10b981', '#14b8a6']}
              style={{
                borderRadius: 16,
                paddingVertical: 16,
                alignItems: 'center',
              }}
            >
              <Text className="text-white font-semibold text-lg">
                Save Contact
              </Text>
            </LinearGradient>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

function ImportProgressModal({
  visible,
  source,
  onClose,
}: {
  visible: boolean;
  source: string;
  onClose: () => void;
}) {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [count, setCount] = useState(0);

  React.useEffect(() => {
    if (visible) {
      setStatus('loading');
      // Simulate import
      const timer = setTimeout(() => {
        const importCount = Math.floor(Math.random() * 50) + 10;
        setCount(importCount);
        setStatus('success');
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [visible]);

  const sourceNames: Record<string, string> = {
    phone: 'Phone Contacts',
    facebook: 'Facebook',
    instagram: 'Instagram',
    linkedin: 'LinkedIn',
    twitter: 'X (Twitter)',
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View className="flex-1 bg-black/60 items-center justify-center px-6">
        <View className="bg-slate-800 rounded-3xl p-6 w-full max-w-sm border border-slate-700/50">
          {status === 'loading' && (
            <>
              <ActivityIndicator size="large" color="#10b981" />
              <Text className="text-white text-lg font-semibold text-center mt-4">
                Importing from {sourceNames[source]}...
              </Text>
              <Text className="text-slate-400 text-center mt-2">
                This may take a moment
              </Text>
            </>
          )}

          {status === 'success' && (
            <>
              <View className="w-16 h-16 bg-emerald-500/20 rounded-full items-center justify-center self-center">
                <Users size={32} color="#10b981" />
              </View>
              <Text className="text-white text-lg font-semibold text-center mt-4">
                Import Complete!
              </Text>
              <Text className="text-slate-400 text-center mt-2">
                Successfully imported {count} contacts from {sourceNames[source]}
              </Text>
              <Pressable
                onPress={onClose}
                className="mt-6"
              >
                <LinearGradient
                  colors={['#10b981', '#14b8a6']}
                  style={{
                    borderRadius: 12,
                    paddingVertical: 14,
                    alignItems: 'center',
                  }}
                >
                  <Text className="text-white font-semibold">Done</Text>
                </LinearGradient>
              </Pressable>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}

export default function ConnectifyScreen() {
  const [showAddOptions, setShowAddOptions] = useState(false);
  const [showAddManual, setShowAddManual] = useState(false);
  const [showImportProgress, setShowImportProgress] = useState(false);
  const [importSource, setImportSource] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [contacts, setContacts] = useState<Contact[]>(mockContacts);
  const { canAccessConnectify } = useSubscription();

  // Show locked state for free users
  if (!canAccessConnectify) {
    return (
      <View className="flex-1 bg-slate-900">
        <Stack.Screen
          options={{
            title: 'Connectify',
            headerStyle: { backgroundColor: '#0f172a' },
            headerTintColor: '#fff',
            headerTitleStyle: { fontWeight: '600' },
          }}
        />
        <LinearGradient colors={['#0f172a', '#1e293b']} style={{ flex: 1 }}>
          <View className="flex-1 justify-center items-center px-6">
            <View className="w-24 h-24 rounded-full bg-emerald-500/10 items-center justify-center mb-6">
              <Lock size={48} color="#10b981" />
            </View>
            <Text className="text-white text-2xl font-bold text-center mb-3">
              Connectify is Premium
            </Text>
            <Text className="text-slate-400 text-center mb-8 px-4">
              Upgrade to Starter or higher to manage your contacts and import from phone, social media, and more.
            </Text>
            <Pressable
              onPress={() => router.push('/pricing')}
              className="active:opacity-80"
            >
              <LinearGradient
                colors={['#10b981', '#059669']}
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

  const filteredContacts = contacts.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.company?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = {
    total: contacts.length,
    customers: contacts.filter((c) => c.status === 'customer').length,
    prospects: contacts.filter((c) => c.status === 'prospect').length,
    leads: contacts.filter((c) => c.status === 'lead').length,
  };

  const handleAddOption = async (optionId: string) => {
    setShowAddOptions(false);

    if (optionId === 'manual') {
      setShowAddManual(true);
      return;
    }

    if (optionId === 'phone') {
      // Request contacts permission
      const { status } = await Contacts.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Please grant contacts permission to import from your device.'
        );
        return;
      }
    }

    // For social imports, we'd normally do OAuth here
    // For now, show the import progress
    setImportSource(optionId);
    setShowImportProgress(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const handleSaveContact = (contactData: Partial<Contact>) => {
    const newContact: Contact = {
      id: Date.now().toString(),
      name: contactData.name ?? '',
      email: contactData.email ?? '',
      phone: contactData.phone,
      company: contactData.company,
      status: contactData.status ?? 'lead',
      createdAt: new Date().toISOString().split('T')[0],
    };

    setContacts((prev) => [newContact, ...prev]);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  return (
    <View className="flex-1 bg-slate-900">
      <Stack.Screen
        options={{
          title: 'Connectify',
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
              colors={['#10b981', '#14b8a6']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ borderRadius: 24, padding: 24, marginBottom: 20 }}
            >
              <View className="flex-row items-center mb-3">
                <Users size={24} color="#fff" />
                <Text className="text-white/80 text-sm ml-2">CRM</Text>
              </View>
              <Text className="text-white text-2xl font-bold mb-2">
                Manage Your Relationships
              </Text>
              <Text className="text-white/70 mb-4">
                Keep track of leads, prospects, and customers all in one place
              </Text>

              {/* Quick Stats */}
              <View className="flex-row gap-2">
                <View className="flex-1 bg-white/10 rounded-xl p-3">
                  <Text className="text-white/60 text-xs">Customers</Text>
                  <Text className="text-white font-bold text-xl">
                    {stats.customers}
                  </Text>
                </View>
                <View className="flex-1 bg-white/10 rounded-xl p-3">
                  <Text className="text-white/60 text-xs">Prospects</Text>
                  <Text className="text-white font-bold text-xl">
                    {stats.prospects}
                  </Text>
                </View>
                <View className="flex-1 bg-white/10 rounded-xl p-3">
                  <Text className="text-white/60 text-xs">Leads</Text>
                  <Text className="text-white font-bold text-xl">
                    {stats.leads}
                  </Text>
                </View>
              </View>
            </LinearGradient>
          </Animated.View>

          {/* Search & Add */}
          <Animated.View
            entering={FadeInDown.delay(150).springify()}
            className="flex-row gap-3 mb-4"
          >
            <View className="flex-1 flex-row items-center bg-slate-800/50 rounded-xl px-4 border border-slate-700/50">
              <Search size={18} color="#64748b" />
              <TextInput
                className="flex-1 py-3 px-3 text-white"
                placeholder="Search contacts..."
                placeholderTextColor="#64748b"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setShowAddOptions(true);
              }}
              className="bg-emerald-500 rounded-xl w-12 items-center justify-center active:bg-emerald-600"
            >
              <Plus size={24} color="#fff" />
            </Pressable>
          </Animated.View>

          {/* Quick Import Buttons */}
          <Animated.View entering={FadeInDown.delay(175).springify()}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="mb-4"
              style={{ flexGrow: 0 }}
            >
              <Pressable
                onPress={() => handleAddOption('phone')}
                className="flex-row items-center bg-slate-800/50 border border-slate-700/50 rounded-xl px-4 py-2.5 mr-2 active:bg-slate-700/50"
              >
                <BookUser size={16} color="#3b82f6" />
                <Text className="text-slate-300 text-sm ml-2">Phone Contacts</Text>
              </Pressable>
              <Pressable
                onPress={() => handleAddOption('facebook')}
                className="flex-row items-center bg-slate-800/50 border border-slate-700/50 rounded-xl px-4 py-2.5 mr-2 active:bg-slate-700/50"
              >
                <Facebook size={16} color="#1877F2" />
                <Text className="text-slate-300 text-sm ml-2">Facebook</Text>
              </Pressable>
              <Pressable
                onPress={() => handleAddOption('instagram')}
                className="flex-row items-center bg-slate-800/50 border border-slate-700/50 rounded-xl px-4 py-2.5 mr-2 active:bg-slate-700/50"
              >
                <Instagram size={16} color="#E4405F" />
                <Text className="text-slate-300 text-sm ml-2">Instagram</Text>
              </Pressable>
              <Pressable
                onPress={() => handleAddOption('linkedin')}
                className="flex-row items-center bg-slate-800/50 border border-slate-700/50 rounded-xl px-4 py-2.5 mr-2 active:bg-slate-700/50"
              >
                <Linkedin size={16} color="#0A66C2" />
                <Text className="text-slate-300 text-sm ml-2">LinkedIn</Text>
              </Pressable>
            </ScrollView>
          </Animated.View>

          {/* Contacts List */}
          <Animated.View entering={FadeInDown.delay(200).springify()}>
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-white text-lg font-semibold">
                Contacts ({filteredContacts.length})
              </Text>
              <Pressable className="flex-row items-center">
                <Text className="text-emerald-400 text-sm">Filter</Text>
                <ChevronRight size={16} color="#10b981" />
              </Pressable>
            </View>

            {filteredContacts.map((contact, index) => (
              <Animated.View
                key={contact.id}
                entering={FadeInDown.delay(250 + index * 30).springify()}
              >
                <ContactCard contact={contact} />
              </Animated.View>
            ))}

            {filteredContacts.length === 0 && (
              <View className="items-center py-12">
                <Users size={48} color="#475569" />
                <Text className="text-slate-400 mt-4">No contacts found</Text>
              </View>
            )}
          </Animated.View>
        </ScrollView>
      </LinearGradient>

      {/* Modals */}
      <AddOptionsMenu
        visible={showAddOptions}
        onClose={() => setShowAddOptions(false)}
        onSelect={handleAddOption}
      />

      <AddContactModal
        visible={showAddManual}
        onClose={() => setShowAddManual(false)}
        onSave={handleSaveContact}
      />

      <ImportProgressModal
        visible={showImportProgress}
        source={importSource}
        onClose={() => setShowImportProgress(false)}
      />
    </View>
  );
}
