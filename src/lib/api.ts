// ShortyPro API Service
// Connects to ShortyPro.com backend

const BASE_URL = 'https://shortypro.com';

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
}

export interface AuthResponse {
  success: boolean;
  user?: User;
  token?: string;
  error?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Store auth token
let authToken: string | null = null;

export const setAuthToken = (token: string | null) => {
  authToken = token;
};

export const getAuthToken = () => authToken;

// API helper function
export const apiRequest = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> => {
  try {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(authToken && { Authorization: `Bearer ${authToken}` }),
      ...options.headers,
    };

    const response = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json();
    return { success: response.ok, data };
  } catch (error) {
    return { success: false, error: 'Network error. Please try again.' };
  }
};

// Auth endpoints
export const login = async (email: string, password: string): Promise<AuthResponse> => {
  const response = await apiRequest<{ user: User; token: string }>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });

  if (response.success && response.data) {
    setAuthToken(response.data.token);
    return { success: true, user: response.data.user, token: response.data.token };
  }

  return { success: false, error: response.error || 'Login failed' };
};

export const logout = async () => {
  setAuthToken(null);
  return { success: true };
};

// OAuth login
export interface OAuthResponse {
  success: boolean;
  user?: User;
  token?: string;
  authUrl?: string;
  error?: string;
}

export const oauthLogin = async (
  provider: 'google' | 'facebook' | 'apple' | 'microsoft'
): Promise<OAuthResponse> => {
  const response = await apiRequest<{ user?: User; token?: string; authUrl?: string }>(
    `/api/auth/oauth/${provider}`,
    { method: 'POST' }
  );

  if (response.success && response.data) {
    if (response.data.token && response.data.user) {
      setAuthToken(response.data.token);
      return { success: true, user: response.data.user, token: response.data.token };
    }
    if (response.data.authUrl) {
      return { success: false, authUrl: response.data.authUrl };
    }
  }

  return { success: false, error: response.error || 'OAuth login failed' };
};

// Shorty Magic (Video) endpoints
export interface Video {
  id: string;
  title: string;
  thumbnail: string;
  duration: string;
  status: 'processing' | 'completed' | 'failed';
  createdAt: string;
}

export const getVideos = async (): Promise<ApiResponse<Video[]>> => {
  return apiRequest<Video[]>('/api/videos');
};

export const createVideo = async (params: {
  title: string;
  script?: string;
  style?: string;
}): Promise<ApiResponse<Video>> => {
  return apiRequest<Video>('/api/videos', {
    method: 'POST',
    body: JSON.stringify(params),
  });
};

// Chatterly (AI Chat) endpoints
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface ChatConversation {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: string;
}

export const getConversations = async (): Promise<ApiResponse<ChatConversation[]>> => {
  return apiRequest<ChatConversation[]>('/api/chat/conversations');
};

export const sendMessage = async (
  conversationId: string,
  message: string
): Promise<ApiResponse<ChatMessage>> => {
  return apiRequest<ChatMessage>(`/api/chat/conversations/${conversationId}/messages`, {
    method: 'POST',
    body: JSON.stringify({ message }),
  });
};

// Magna Hive (Funnel Builder) endpoints
export interface Funnel {
  id: string;
  name: string;
  status: 'draft' | 'published' | 'archived';
  steps: number;
  visits: number;
  conversions: number;
  createdAt: string;
}

export const getFunnels = async (): Promise<ApiResponse<Funnel[]>> => {
  return apiRequest<Funnel[]>('/api/funnels');
};

export const createFunnel = async (name: string): Promise<ApiResponse<Funnel>> => {
  return apiRequest<Funnel>('/api/funnels', {
    method: 'POST',
    body: JSON.stringify({ name }),
  });
};

// Connectify (CRM) endpoints
export interface Contact {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  status: 'lead' | 'prospect' | 'customer' | 'churned';
  lastContact?: string;
  createdAt: string;
}

export interface Deal {
  id: string;
  title: string;
  value: number;
  stage: 'lead' | 'qualified' | 'proposal' | 'negotiation' | 'closed';
  contactId: string;
  createdAt: string;
}

export const getContacts = async (): Promise<ApiResponse<Contact[]>> => {
  return apiRequest<Contact[]>('/api/crm/contacts');
};

export const createContact = async (contact: Omit<Contact, 'id' | 'createdAt'>): Promise<ApiResponse<Contact>> => {
  return apiRequest<Contact>('/api/crm/contacts', {
    method: 'POST',
    body: JSON.stringify(contact),
  });
};

export const getDeals = async (): Promise<ApiResponse<Deal[]>> => {
  return apiRequest<Deal[]>('/api/crm/deals');
};

// Dashboard stats
export interface DashboardStats {
  totalVideos: number;
  totalConversations: number;
  totalFunnels: number;
  totalContacts: number;
  recentActivity: {
    type: 'video' | 'chat' | 'funnel' | 'contact';
    title: string;
    timestamp: string;
  }[];
}

export const getDashboardStats = async (): Promise<ApiResponse<DashboardStats>> => {
  return apiRequest<DashboardStats>('/api/dashboard/stats');
};
