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
    base: '#F7F7F9',      // Apple-like light gray
    card: '#FFFFFF',      // Pure white
    cardBorder: '#E5E5EA', // Apple standard light border
    offWhite: '#1C1C1E',  // Very dark gray text
    pureWhite: '#FFFFFF',
    muted: '#8E8E93',     // Apple standard muted text
    subtle: '#AEAEB2',
    dim: '#C7C7CC',
    emerald: '#000000',   // Black for main accents in light mode (very premium/editorial)
    amber: '#FF9500',     
    red: '#FF3B30',       
    blue: '#007AFF',      
    purple: '#AF52DE',    
    deepSlate: '#F7F7F9',
    gunmetal: '#FFFFFF',
    burgundy: '#FF2D55',
    borderOnDark: '#E5E5EA',
    borderOnLight: '#E5E5EA',
    mutedTextOnDark: '#8E8E93',
    mutedTextOnLight: '#AEAEB2',
    statusBarStyle: 'dark-content',
    tabBarBg: '#FFFFFF',
    tabBarBorder: '#E5E5EA',
    inputBg: '#F2F2F7',
    sectionBg: '#F7F7F9',
};

// ==========================================
// 🚀 SUPREME TIER (Matte Dark Gray x Neon Chartreuse) - COMMENTED OUT
// ==========================================
/*
const darkColorsSupreme: ThemeColors = {
    base: '#111113',       
    card: '#1A1A1D',       
    cardBorder: 'rgba(255, 255, 255, 0.06)', 
    offWhite: '#EDEDED',   
    pureWhite: '#FFFFFF',
    muted: '#A0A0A5',
    subtle: '#707078',
    dim: '#3A3A40',
    emerald: '#D9F950',    
    amber: '#FF9F0A',      
    red: '#FF453A',        
    blue: '#409CFF',       
    purple: '#BF5AF2',     
    deepSlate: '#111113',
    gunmetal: '#1A1A1D',
    burgundy: '#FF375F',   
    borderOnDark: 'rgba(255, 255, 255, 0.06)',
    borderOnLight: '#E5E5EA',
    mutedTextOnDark: '#A0A0A5',
    mutedTextOnLight: '#707078',
    statusBarStyle: 'light-content',
    tabBarBg: '#111113',
    tabBarBorder: 'rgba(255, 255, 255, 0.04)',
    inputBg: '#212124',
    sectionBg: '#151518',
};
*/

// ==========================================
// 🎨 ELECTRIC NEON TIER (Active) 
// Deep OLED Black x Vibrant Neon Accents
// ==========================================
const darkColorsElectric: ThemeColors = {
    base: '#000000',       // True OLED Black
    card: '#161618',       // Sleek Dark Card
    cardBorder: '#27272A', // Precise, sharp lines
    offWhite: '#FFFFFF',   // Pure white text
    pureWhite: '#FFFFFF',
    muted: '#A1A1AA',
    subtle: '#71717A',
    dim: '#3F3F46',
    emerald: '#00FF87',    // Vibrant Electric Green (Striking)
    amber: '#FF9F0A',      // Glowing Amber
    red: '#FF453A',        // Intense Red
    blue: '#0A84FF',       // Luminous Blue
    purple: '#BF5AF2',     // Vivid Purple
    deepSlate: '#000000',
    gunmetal: '#161618',
    burgundy: '#FF375F',   // Pinkish Red
    borderOnDark: '#27272A',
    borderOnLight: '#E5E7EB',
    mutedTextOnDark: '#A1A1AA',
    mutedTextOnLight: '#71717A',
    statusBarStyle: 'light-content',
    tabBarBg: '#09090B',
    tabBarBorder: '#27272A',
    inputBg: '#1C1C1E',
    sectionBg: '#121214',
};

const darkColors: ThemeColors = darkColorsElectric;

export function useThemeColors(): ThemeColors {
    const theme = useStore((s) => s.theme);
    return theme === 'dark' ? darkColors : lightColors;
}

export { darkColors, lightColors };

