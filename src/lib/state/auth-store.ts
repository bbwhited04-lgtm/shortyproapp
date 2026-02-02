import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, setAuthToken } from '../api';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  login: (user: User, token: string) => Promise<void>;
  logout: () => Promise<void>;
  loadStoredAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,

  setUser: (user) => set({ user, isAuthenticated: !!user }),

  setToken: (token) => {
    setAuthToken(token);
    set({ token });
  },

  login: async (user, token) => {
    await AsyncStorage.setItem('auth_user', JSON.stringify(user));
    await AsyncStorage.setItem('auth_token', token);
    setAuthToken(token);
    set({ user, token, isAuthenticated: true });
  },

  logout: async () => {
    await AsyncStorage.removeItem('auth_user');
    await AsyncStorage.removeItem('auth_token');
    setAuthToken(null);
    set({ user: null, token: null, isAuthenticated: false });
  },

  loadStoredAuth: async () => {
    try {
      const storedUser = await AsyncStorage.getItem('auth_user');
      const storedToken = await AsyncStorage.getItem('auth_token');

      if (storedUser && storedToken) {
        const user = JSON.parse(storedUser);
        setAuthToken(storedToken);
        set({ user, token: storedToken, isAuthenticated: true, isLoading: false });
      } else {
        set({ isLoading: false });
      }
    } catch {
      set({ isLoading: false });
    }
  },
}));
