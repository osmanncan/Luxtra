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
  reminderDate?: string; // custom notification date
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
  reminderDate?: string; // custom notification date
}

export type ThemeMode = 'dark' | 'light';

interface AppState {
  subscriptions: Subscription[];
  tasks: Task[];

  // Auth
  user: User | null;
  setUser: (user: User | null) => void;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;

  // Profile
  updateProfile: (updates: Partial<User>) => Promise<void>;

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
  upgradeToPro: (pkg?: any) => Promise<boolean>;
  cancelPro: () => void;
  refreshProStatus: () => Promise<void>;
  restorePurchases: () => Promise<boolean>;

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

  // Notification Settings
  notificationsEnabled: boolean;
  setNotificationsEnabled: (enabled: boolean) => void;
  notificationTime: string; // HH:mm format
  setNotificationTime: (time: string) => void;
  syncData: () => Promise<void>;
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      language: 'tr',
      currency: 'TRY',
      theme: 'dark',
      monthlyBudget: 0,
      isBiometricEnabled: false,
      aiInsight: null,
      customCategories: {},
      aiLoading: false,
      notificationsEnabled: true,
      notificationTime: '09:00',

      user: null, // Start with null
      setUser: (user) => set({ user }),

      login: async (email, password) => {
        const { supabase } = await import('../services/supabase');
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) return { success: false, error: error.message };

        // Fetch profile or metadata if needed
        const userObj: User = {
          name: data.user.user_metadata.full_name || 'Kullanıcı',
          email: data.user.email!,
          isPro: false // This will be checked by RevenueCat separately
        };
        set({ user: userObj });

        // Use getState to call syncData after login
        await useStore.getState().syncData();

        return { success: true };
      },

      syncData: async () => {
        const { supabase } = await import('../services/supabase');
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        try {
          const [subsRes, tasksRes] = await Promise.all([
            supabase.from('subscriptions').select('*').eq('user_id', session.user.id),
            supabase.from('tasks').select('*').eq('user_id', session.user.id)
          ]);

          if (subsRes.data) {
            set({
              subscriptions: subsRes.data.map(s => ({
                id: s.id,
                name: s.name,
                amount: s.amount,
                currency: s.currency,
                billingCycle: s.billing_cycle,
                nextBillingDate: s.next_billing_date,
                category: s.category,
                icon: s.icon,
                isPaid: s.is_paid,
                paidDate: s.paid_date,
                reminderDays: s.reminder_days,
                reminderDate: s.reminder_date
              }))
            });
          }

          if (tasksRes.data) {
            set({
              tasks: tasksRes.data.map(t => ({
                id: t.id,
                title: t.title,
                dueDate: t.due_date,
                isCompleted: t.is_completed,
                priority: t.priority,
                type: 'life',
                isRecurring: t.is_recurring,
                recurringMonths: t.recurring_months,
                reminderDays: t.reminder_days,
                reminderDate: t.reminder_date
              }))
            });
          }
        } catch (error) {
          console.error('Error syncing data:', error);
        }
      },

      register: async (name, email, password) => {
        const { supabase } = await import('../services/supabase');
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: name },
          },
        });
        if (error) return { success: false, error: error.message };

        const userObj: User = {
          name,
          email,
          isPro: false
        };
        set({ user: userObj });
        return { success: true };
      },

      logout: async () => {
        const { supabase } = await import('../services/supabase');
        await supabase.auth.signOut();
        set({ user: null });
      },

      updateProfile: async (updates) => {
        const { supabase } = await import('../services/supabase');
        const { error } = await supabase.auth.updateUser({
          data: { full_name: updates.name },
        });
        if (!error) {
          set((state) => ({
            user: state.user ? { ...state.user, ...updates } : null,
          }));
        }
      },

      setLanguage: (lang) => {
        const currencyMap: Record<string, string> = {
          en: 'USD',
          tr: 'TRY',
          es: 'EUR',
          de: 'EUR',
          fr: 'EUR',
          it: 'EUR',
          pt: 'EUR',
          ar: 'AED',
        };
        const newCurrency = currencyMap[lang] || 'USD';
        set({ language: lang, currency: newCurrency });

        if (Platform.OS === 'android') {
          import('../services/widgetService').then(mod => {
            mod.updateAndroidWidget(useStore.getState().subscriptions, newCurrency);
          });
        }
      },
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
      upgradeToPro: async (pkg) => {
        const { PurchaseService } = await import('../services/purchaseService');
        if (pkg) {
          const success = await PurchaseService.purchasePackage(pkg);
          if (success) {
            set((state) => ({ user: state.user ? { ...state.user, isPro: true } : null }));
          }
          return success;
        }
        // Fallback or Test
        set((state) => ({ user: state.user ? { ...state.user, isPro: true } : null }));
        return true;
      },
      cancelPro: () => set((state) => ({
        user: state.user ? { ...state.user, isPro: false } : null,
      })),
      refreshProStatus: async () => {
        const { PurchaseService } = await import('../services/purchaseService');
        const isPro = await PurchaseService.checkProStatus();
        set((state) => ({ user: state.user ? { ...state.user, isPro } : null }));
      },
      restorePurchases: async () => {
        const { PurchaseService } = await import('../services/purchaseService');
        const isPro = await PurchaseService.restorePurchases();
        set((state) => ({ user: state.user ? { ...state.user, isPro } : null }));
        return isPro;
      },

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

      addSubscription: async (sub) => {
        // First update local state for better UX
        set((state) => {
          const newSubs = [...state.subscriptions, sub];
          if (Platform.OS === 'android') {
            import('../services/widgetService').then(mod => {
              mod.updateAndroidWidget(newSubs, state.currency);
            });
          }
          return { subscriptions: newSubs };
        });

        const { supabase } = await import('../services/supabase');
        const { data: { session } } = await supabase.auth.getSession();

        if (session) {
          const { error } = await supabase.from('subscriptions').insert({
            id: sub.id,
            user_id: session.user.id,
            name: sub.name,
            amount: sub.amount,
            currency: sub.currency,
            billing_cycle: sub.billingCycle,
            next_billing_date: sub.nextBillingDate,
            category: sub.category,
            icon: sub.icon,
            is_paid: sub.isPaid,
            reminder_days: sub.reminderDays,
            reminder_date: sub.reminderDate
          });

          if (error) {
            console.error('Supabase Subscription Insert Error:', error);
            // Optionally: handle rollback if insert fails
          }
        }
      },
      removeSubscription: async (id) => {
        const { supabase } = await import('../services/supabase');
        const { data: { session } } = await supabase.auth.getSession();

        if (session) {
          await supabase.from('subscriptions').delete().eq('id', id);
        }

        set((state) => {
          const newSubs = state.subscriptions.filter((s) => s.id !== id);
          if (Platform.OS === 'android') {
            import('../services/widgetService').then(mod => {
              mod.updateAndroidWidget(newSubs, state.currency);
            });
          }
          return { subscriptions: newSubs };
        });
      },
      updateSubscription: async (id, updates) => {
        const { supabase } = await import('../services/supabase');
        const { data: { session } } = await supabase.auth.getSession();

        if (session) {
          const dbUpdates: any = {};
          if (updates.name !== undefined) dbUpdates.name = updates.name;
          if (updates.amount !== undefined) dbUpdates.amount = updates.amount;
          if (updates.currency !== undefined) dbUpdates.currency = updates.currency;
          if (updates.billingCycle !== undefined) dbUpdates.billing_cycle = updates.billingCycle;
          if (updates.nextBillingDate !== undefined) dbUpdates.next_billing_date = updates.nextBillingDate;
          if (updates.category !== undefined) dbUpdates.category = updates.category;
          if (updates.icon !== undefined) dbUpdates.icon = updates.icon;
          if (updates.isPaid !== undefined) dbUpdates.is_paid = updates.isPaid;

          await supabase.from('subscriptions').update(dbUpdates).eq('id', id);
        }

        set((state) => {
          const newSubs = state.subscriptions.map((s) => s.id === id ? { ...s, ...updates } : s);
          if (Platform.OS === 'android') {
            import('../services/widgetService').then(mod => {
              mod.updateAndroidWidget(newSubs, state.currency);
            });
          }
          return { subscriptions: newSubs };
        });
      },
      markSubscriptionPaid: async (id) => {
        const sub = useStore.getState().subscriptions.find(s => s.id === id);
        if (!sub) return;

        const { supabase } = await import('../services/supabase');
        const { data: { session } } = await supabase.auth.getSession();

        const newState = !sub.isPaid;
        if (session) {
          await supabase.from('subscriptions').update({ is_paid: newState }).eq('id', id);
        }

        set((state) => ({
          subscriptions: state.subscriptions.map((s) =>
            s.id === id ? { ...s, isPaid: newState, paidDate: newState ? new Date().toISOString() : undefined } : s
          ),
        }));
      },

      addTask: async (task) => {
        // First update local state
        set((state) => ({ tasks: [...state.tasks, task] }));

        const { supabase } = await import('../services/supabase');
        const { data: { session } } = await supabase.auth.getSession();

        if (session) {
          const { error } = await supabase.from('tasks').insert({
            id: task.id,
            user_id: session.user.id,
            title: task.title,
            due_date: task.dueDate,
            is_completed: task.isCompleted,
            priority: task.priority,
            is_recurring: task.isRecurring,
            recurring_months: task.recurringMonths,
            reminder_days: task.reminderDays,
            reminder_date: task.reminderDate
          });

          if (error) {
            console.error('Supabase Task Insert Error:', error);
          }
        }
      },

      toggleTask: async (id) => {
        const task = useStore.getState().tasks.find(t => t.id === id);
        if (!task) return;

        const { supabase } = await import('../services/supabase');
        const { data: { session } } = await supabase.auth.getSession();

        const newState = !task.isCompleted;
        if (session) {
          await supabase.from('tasks').update({ is_completed: newState }).eq('id', id);
        }

        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === id ? { ...t, isCompleted: newState } : t,
          ),
        }));
      },

      deleteTask: async (id) => {
        const { supabase } = await import('../services/supabase');
        const { data: { session } } = await supabase.auth.getSession();

        if (session) {
          await supabase.from('tasks').delete().eq('id', id);
        }

        set((state) => ({
          tasks: state.tasks.filter((t) => t.id !== id),
        }));
      },

      // Custom Categories
      addCustomCategory: (name, config) => set((state) => ({
        customCategories: { ...state.customCategories, [name]: config }
      })),
      removeCustomCategory: (name) => set((state) => {
        const newCats = { ...state.customCategories };
        delete newCats[name];
        return { customCategories: newCats };
      }),

      setNotificationsEnabled: (notificationsEnabled) => set({ notificationsEnabled }),
      setNotificationTime: (notificationTime) => set({ notificationTime }),
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
        notificationsEnabled: state.notificationsEnabled,
        notificationTime: state.notificationTime,
      }),
    }
  )
);
