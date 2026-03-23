import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface UiStore {
  // User session — set by auth hooks
  user: User | null;
  setUser: (user: User) => void;
  clearUser: () => void;

  // UI preferences
  theme: 'light' | 'dark';
  sidebarOpen: boolean;
  toggleTheme: () => void;
  toggleSidebar: () => void;
}

export const useUiStore = create<UiStore>()(
  persist(
    (set, get) => ({
      user: null,
      theme: 'light',
      sidebarOpen: true,

      setUser: (user) => set({ user }),
      clearUser: () => set({ user: null }),

      toggleTheme: () => {
        const newTheme = get().theme === 'light' ? 'dark' : 'light';
        set({ theme: newTheme });
        document.documentElement.classList.toggle('dark', newTheme === 'dark');
      },

      toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
    }),
    {
      name: 'studyq-ui',
      partialize: (s) => ({ user: s.user, theme: s.theme }),
    }
  )
);
