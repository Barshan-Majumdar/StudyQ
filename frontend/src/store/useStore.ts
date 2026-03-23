import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'teacher' | 'admin';
}

interface AppState {
  // Auth — accessToken is memory-only (NOT persisted)
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  authLoading: boolean;

  // Theme
  theme: 'light' | 'dark';

  // Sidebar
  sidebarCollapsed: boolean;

  // Actions
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  setAuth: (user: User, accessToken: string) => void;
  initAuth: () => Promise<void>;
  toggleTheme: () => void;
  toggleSidebar: () => void;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      authLoading: true,
      theme: 'light',
      sidebarCollapsed: false,

      login: async (email, password) => {
        try {
          // Dynamic import to avoid circular dependency
          const { default: api } = await import('../lib/api');
          const res = await api.post('/auth/login', { email, password });
          const { user, accessToken } = res.data.data;
          set({ user, accessToken, isAuthenticated: true });
          return { success: true };
        } catch (error: any) {
          const msg = error.response?.data?.message || 'Login failed';
          return { success: false, message: msg };
        }
      },

      register: async (name, email, password) => {
        try {
          const { default: api } = await import('../lib/api');
          const res = await api.post('/auth/register', { name, email, password });
          const { user, accessToken } = res.data.data;
          set({ user, accessToken, isAuthenticated: true });
          return { success: true };
        } catch (error: any) {
          const msg = error.response?.data?.message || 'Registration failed';
          return { success: false, message: msg };
        }
      },

      logout: async () => {
        try {
          const { default: api } = await import('../lib/api');
          await api.post('/auth/logout');
        } catch {
          // Ignore — clear local state regardless
        }
        set({ user: null, accessToken: null, isAuthenticated: false });
      },

      setAuth: (user, accessToken) => {
        set({ user, accessToken, isAuthenticated: true, authLoading: false });
      },

      // Called on app mount — tries to refresh using HTTP-only cookie
      initAuth: async () => {
        try {
          const { default: api } = await import('../lib/api');
          const res = await api.post('/auth/refresh');
          const { user, accessToken } = res.data.data;
          set({ user, accessToken, isAuthenticated: true, authLoading: false });
        } catch {
          set({ user: null, accessToken: null, isAuthenticated: false, authLoading: false });
        }
      },

      toggleTheme: () => {
        const newTheme = get().theme === 'light' ? 'dark' : 'light';
        set({ theme: newTheme });
        document.documentElement.classList.toggle('dark', newTheme === 'dark');
      },

      toggleSidebar: () => {
        set({ sidebarCollapsed: !get().sidebarCollapsed });
      },
    }),
    {
      name: 'studyq-store',
      // Only persist non-sensitive UI preferences — NOT tokens
      partialize: (state) => ({
        theme: state.theme,
        sidebarCollapsed: state.sidebarCollapsed,
      }),
    }
  )
);
