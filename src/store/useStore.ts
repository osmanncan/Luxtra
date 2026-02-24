import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

// ── Category config with emoji + gradient colors ──
export const SUB_CATEGORIES: Record<string, { emoji: string; colors: [string, string] }> = {
  Entertainment: { emoji: '🎬', colors: ['#7c3aed', '#a855f7'] },
  Music: { emoji: '🎵', colors: ['#ec4899', '#f472b6'] },
  Health: { emoji: '💪', colors: ['#10b981', '#34d399'] },
  Cloud: { emoji: '☁️', colors: ['#3b82f6', '#60a5fa'] },
  Food: { emoji: '🍔', colors: ['#f59e0b', '#fbbf24'] },
  Education: { emoji: '📚', colors: ['#06b6d4', '#22d3ee'] },
  Gaming: { emoji: '🎮', colors: ['#ef4444', '#f87171'] },
  Shopping: { emoji: '🛍️', colors: ['#f43f5e', '#fb7185'] },
  Travel: { emoji: '✈️', colors: ['#0ea5e9', '#38bdf8'] },
  Utilities: { emoji: '💡', colors: ['#eab308', '#facc15'] },
  Insurance: { emoji: '🛡️', colors: ['#64748b', '#94a3b8'] },
  General: { emoji: '💳', colors: ['#6366f1', '#818cf8'] },
};

export interface CategoryConfig {
  emoji: string;
  colors: [string, string];
}

export const CURRENCIES: Record<string, { symbol: string; code: string }> = {
  TRY: { symbol: '₺', code: 'TRY' },
  USD: { symbol: '$', code: 'USD' },
  EUR: { symbol: '€', code: 'EUR' },
  GBP: { symbol: '£', code: 'GBP' },
  JPY: { symbol: '¥', code: 'JPY' },
  CAD: { symbol: 'C$', code: 'CAD' },
  AUD: { symbol: 'A$', code: 'AUD' },
  CHF: { symbol: 'Fr', code: 'CHF' },
  BRL: { symbol: 'R$', code: 'BRL' },
  SAR: { symbol: '﷼', code: 'SAR' },
  AED: { symbol: 'د.إ', code: 'AED' },
  RUB: { symbol: '₽', code: 'RUB' },
  CNY: { symbol: '¥', code: 'CNY' },
};

export interface Subscription {
  id: string;
  name: string;
  amount: number;
  currency: string;
  billingCycle: 'monthly' | 'yearly';
  nextBillingDate: string;
  category: string;
  icon?: string;
  description?: string;
  isPaid?: boolean;
  paidDate?: string;
  reminderDays?: number; // default: 1
}

export interface User {
  name: string;
  email: string;
  avatar?: string;
  isPro: boolean;
}

export interface Task {
  id: string;
  title: string;
  dueDate: string;
  isCompleted: boolean;
  priority: 'high' | 'medium' | 'low';
  type: 'life';
  isRecurring?: boolean;
  recurringMonths?: number; // repeat every X months
  reminderDays?: number; // default: 1
}

export type ThemeMode = 'dark' | 'light';

interface AppState {
  subscriptions: Subscription[];
  tasks: Task[];

  // Auth
  user: User | null;
  login: (name: string, email: string) => void;
  register: (name: string, email: string) => void;
  logout: () => void;

  // Profile
  updateProfile: (updates: Partial<User>) => void;

  // Settings
  language: 'en' | 'tr' | 'es' | 'de' | 'fr' | 'it' | 'pt' | 'ar';
  setLanguage: (lang: 'en' | 'tr' | 'es' | 'de' | 'fr' | 'it' | 'pt' | 'ar') => void;
  currency: string;
  setCurrency: (currency: string) => void;

  // Theme
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;

  // Budget
  monthlyBudget: number;
  setMonthlyBudget: (amount: number) => void;

  // Security
  isBiometricEnabled: boolean;
  toggleBiometric: () => void;

  // Pro Membership
  upgradeToPro: () => void;
  cancelPro: () => void;

  // AI Insights
  aiInsight: string | null;
  aiLoading: boolean;
  setAiInsight: (insight: string | null) => void;
  setAiLoading: (loading: boolean) => void;

  addSubscription: (sub: Subscription) => void;
  removeSubscription: (id: string) => void;
  updateSubscription: (id: string, updates: Partial<Subscription>) => void;
  markSubscriptionPaid: (id: string) => void;

  addTask: (task: Task) => void;
  toggleTask: (id: string) => void;
  deleteTask: (id: string) => void;

  // Custom Categories
  customCategories: Record<string, CategoryConfig>;
  addCustomCategory: (name: string, config: CategoryConfig) => void;
  removeCustomCategory: (name: string) => void;
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      user: { name: 'Kullanıcı', email: '', isPro: false },
      language: 'tr',
      currency: 'TRY',
      theme: 'dark',
      monthlyBudget: 0,
      isBiometricEnabled: false,
      aiInsight: null,
      customCategories: {},
      aiLoading: false,

      login: (name, email) => set({
        user: { name, email, isPro: false }
      }),
      register: (name, email) => set({
        user: { name, email, isPro: false }
      }),
      logout: () => set({ user: { name: 'Kullanıcı', email: '', isPro: false } }),

      updateProfile: (updates) => set((state) => ({
        user: state.user ? { ...state.user, ...updates } : null,
      })),

      setLanguage: (language) => set({ language }),
      setCurrency: (currency) => set((state) => {
        if (Platform.OS === 'android') {
          import('../services/widgetService').then(mod => {
            mod.updateAndroidWidget(state.subscriptions, currency);
          });
        }
        return { currency };
      }),

      // Theme
      setTheme: (theme) => set({ theme }),
      toggleTheme: () => set((state) => ({ theme: state.theme === 'dark' ? 'light' : 'dark' })),

      // Budget
      setMonthlyBudget: (amount) => set({ monthlyBudget: amount }),

      // Security
      toggleBiometric: () => set((state) => ({ isBiometricEnabled: !state.isBiometricEnabled })),

      // Pro Membership
      upgradeToPro: () => set((state) => ({
        user: state.user ? { ...state.user, isPro: true } : null,
      })),
      cancelPro: () => set((state) => ({
        user: state.user ? { ...state.user, isPro: false } : null,
      })),

      // AI Insights
      setAiInsight: (insight) => set({ aiInsight: insight }),
      setAiLoading: (loading) => set({ aiLoading: loading }),

      subscriptions: [
        {
          id: '1',
          name: 'Spotify',
          amount: 59.99,
          currency: 'TRY',
          billingCycle: 'monthly',
          nextBillingDate: new Date(new Date().getFullYear(), new Date().getMonth(), 9).toISOString(),
          category: 'Music',
        },
        {
          id: '2',
          name: 'Netflix',
          amount: 149.99,
          currency: 'TRY',
          billingCycle: 'monthly',
          nextBillingDate: new Date(new Date().getFullYear(), new Date().getMonth(), 15).toISOString(),
          category: 'Entertainment',
        },
        {
          id: '3',
          name: 'iCloud+',
          amount: 12.99,
          currency: 'TRY',
          billingCycle: 'monthly',
          nextBillingDate: new Date(new Date().getFullYear(), new Date().getMonth(), 20).toISOString(),
          category: 'Cloud',
        },
        {
          id: '4',
          name: 'Spor Salonu',
          amount: 1200,
          currency: 'TRY',
          billingCycle: 'monthly',
          nextBillingDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1).toISOString(),
          category: 'Health',
        },
      ],
      tasks: [
        {
          id: '1',
          title: 'Pasaport Yenileme',
          dueDate: new Date(new Date().getFullYear(), new Date().getMonth() + 2, 10).toISOString(),
          isCompleted: false,
          priority: 'high',
          type: 'life',
        },
        {
          id: '2',
          title: 'Araç Sigortası Yenileme',
          dueDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 15).toISOString(),
          isCompleted: false,
          priority: 'medium',
          type: 'life',
          isRecurring: true,
          recurringMonths: 12,
        },
        {
          id: '3',
          title: 'Sağlık Kontrolü',
          dueDate: new Date(new Date().getFullYear(), new Date().getMonth(), 28).toISOString(),
          isCompleted: false,
          priority: 'high',
          type: 'life',
          isRecurring: true,
          recurringMonths: 6,
        },
      ],

      addSubscription: (sub) =>
        set((state) => {
          const newSubs = [...state.subscriptions, sub];
          if (Platform.OS === 'android') {
            import('../services/widgetService').then(mod => {
              mod.updateAndroidWidget(newSubs, state.currency);
            });
          }
          return { subscriptions: newSubs };
        }),
      removeSubscription: (id) =>
        set((state) => {
          const newSubs = state.subscriptions.filter((s) => s.id !== id);
          if (Platform.OS === 'android') {
            import('../services/widgetService').then(mod => {
              mod.updateAndroidWidget(newSubs, state.currency);
            });
          }
          return { subscriptions: newSubs };
        }),
      updateSubscription: (id, updates) =>
        set((state) => {
          const newSubs = state.subscriptions.map((s) => s.id === id ? { ...s, ...updates } : s);
          if (Platform.OS === 'android') {
            import('../services/widgetService').then(mod => {
              mod.updateAndroidWidget(newSubs, state.currency);
            });
          }
          return { subscriptions: newSubs };
        }),
      markSubscriptionPaid: (id) =>
        set((state) => ({
          subscriptions: state.subscriptions.map((s) =>
            s.id === id ? { ...s, isPaid: !s.isPaid, paidDate: !s.isPaid ? new Date().toISOString() : undefined } : s
          ),
        })),

      addTask: (task) =>
        set((state) => ({ tasks: [...state.tasks, task] })),

      toggleTask: (id) =>
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === id ? { ...t, isCompleted: !t.isCompleted } : t,
          ),
        })),

      deleteTask: (id) =>
        set((state) => ({
          tasks: state.tasks.filter((t) => t.id !== id),
        })),

      // Custom Categories
      addCustomCategory: (name, config) => set((state) => ({
        customCategories: { ...state.customCategories, [name]: config }
      })),
      removeCustomCategory: (name) => set((state) => {
        const newCats = { ...state.customCategories };
        delete newCats[name];
        return { customCategories: newCats };
      }),
    }),
    {
      name: 'lifeos-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        user: state.user,
        subscriptions: state.subscriptions,
        tasks: state.tasks,
        language: state.language,
        currency: state.currency,
        theme: state.theme,
        monthlyBudget: state.monthlyBudget,
      }),
    }
  )
);
