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
const lightColors: ThemeColors = {
    base: '#F7F7F9',      
    card: '#FFFFFF',      
    cardBorder: '#E5E5EA', 
    offWhite: '#1C1C1E',  
    pureWhite: '#FFFFFF',
    muted: '#8E8E93',     
    subtle: '#AEAEB2',
    dim: '#C7C7CC',
    emerald: '#059669',   
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
const darkColorsElectric: ThemeColors = {
    base: '#000000',       
    card: '#161618',       
    cardBorder: '#27272A', 
    offWhite: '#FFFFFF',   
    pureWhite: '#FFFFFF',
    muted: '#A1A1AA',
    subtle: '#71717A',
    dim: '#3F3F46',
    emerald: '#00FF87',    
    amber: '#FF9F0A',      
    red: '#FF453A',        
    blue: '#0A84FF',       
    purple: '#BF5AF2',     
    deepSlate: '#000000',
    gunmetal: '#161618',
    burgundy: '#FF375F',   
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

const darkColorsOcean: ThemeColors = {
    ...darkColorsElectric,
    base: '#0A192F',
    card: '#112240',
    cardBorder: '#233554',
    emerald: '#64FFDA',
    sectionBg: '#0A192F',
    tabBarBg: '#0A192F',
};

const darkColorsBurgundy: ThemeColors = {
    ...darkColorsElectric,
    base: '#2C0B1B', 
    card: '#3D0E25',
    cardBorder: '#5E1B3A',
    emerald: '#E8B4CA', 
    sectionBg: '#2C0B1B',
    tabBarBg: '#2C0B1B',
};

const darkColorsForest: ThemeColors = {
    ...darkColorsElectric,
    base: '#0B2015',
    card: '#123020',
    cardBorder: '#1A422D',
    emerald: '#A8FF50', 
    sectionBg: '#0B2015',
    tabBarBg: '#0B2015',
};

const lightColorsSunrise: ThemeColors = {
    ...lightColors,
    base: '#FFF3E0', 
    card: '#FFFFFF',
    cardBorder: '#FFE0B2',
    emerald: '#D84315', 
    sectionBg: '#FFF3E0',
    tabBarBg: '#FFF3E0',
};

const darkColorsCosmos: ThemeColors = {
    ...darkColorsElectric,
    base: '#0F041A', 
    card: '#1B0830',
    cardBorder: '#2E1054',
    emerald: '#E0B0FF', 
    sectionBg: '#0F041A',
    tabBarBg: '#0F041A',
};

const darkColors: ThemeColors = darkColorsElectric;

export function useThemeColors(): ThemeColors {
    const theme = useStore((s) => s.theme);
    switch (theme) {
        case 'ocean': return darkColorsOcean;
        case 'burgundy': return darkColorsBurgundy;
        case 'forest': return darkColorsForest;
        case 'sunrise': return lightColorsSunrise;
        case 'cosmos': return darkColorsCosmos;
        case 'dark': return darkColors;
        default: return lightColors;
    }
}

export { darkColors, lightColors };
