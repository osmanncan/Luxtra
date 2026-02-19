import { useStore } from './useStore';

export interface ThemeColors {
    base: string;
    card: string;
    cardBorder: string;
    offWhite: string;
    pureWhite: string;
    muted: string;
    subtle: string;
    dim: string;
    emerald: string;
    amber: string;
    red: string;
    blue: string;
    purple: string;
    deepSlate: string;
    gunmetal: string;
    burgundy: string;
    borderOnDark: string;
    borderOnLight: string;
    mutedTextOnDark: string;
    mutedTextOnLight: string;
    statusBarStyle: 'dark-content' | 'light-content';
    tabBarBg: string;
    tabBarBorder: string;
    inputBg: string;
    sectionBg: string;
}

// Light Theme Colors
const lightColors: ThemeColors = {
    base: '#F8FAFC',
    card: '#FFFFFF',
    cardBorder: '#E2E8F0',
    offWhite: '#1E293B',
    pureWhite: '#0F172A',
    muted: '#64748B',
    subtle: '#94A3B8',
    dim: '#CBD5E1',
    emerald: '#10B981',
    amber: '#F59E0B',
    red: '#EF4444',
    blue: '#3B82F6',
    purple: '#8B5CF6',
    deepSlate: '#F8FAFC',
    gunmetal: '#FFFFFF',
    burgundy: '#EF4444',
    borderOnDark: '#E2E8F0',
    borderOnLight: '#E2E8F0',
    mutedTextOnDark: '#64748B',
    mutedTextOnLight: '#64748B',
    // Extra light-mode specific
    statusBarStyle: 'dark-content',
    tabBarBg: '#FFFFFF',
    tabBarBorder: '#E2E8F0',
    inputBg: '#F1F5F9',
    sectionBg: '#F1F5F9',
};

// Dark Theme Colors
const darkColors: ThemeColors = {
    base: '#0F1419',
    card: '#1E293B',
    cardBorder: '#334155',
    offWhite: '#F1F5F9',
    pureWhite: '#FFFFFF',
    muted: '#94A3B8',
    subtle: '#64748B',
    dim: '#475569',
    emerald: '#10B981',
    amber: '#F59E0B',
    red: '#EF4444',
    blue: '#3B82F6',
    purple: '#8B5CF6',
    deepSlate: '#0F1419',
    gunmetal: '#1E293B',
    burgundy: '#EF4444',
    borderOnDark: '#334155',
    borderOnLight: '#E2E8F0',
    mutedTextOnDark: '#94A3B8',
    mutedTextOnLight: '#64748B',
    // Extra dark-mode specific
    statusBarStyle: 'light-content',
    tabBarBg: '#0F1419',
    tabBarBorder: '#1E293B',
    inputBg: '#334155',
    sectionBg: '#1E293B',
};

export function useThemeColors(): ThemeColors {
    const theme = useStore((s) => s.theme);
    return theme === 'dark' ? darkColors : lightColors;
}

export { darkColors, lightColors };

