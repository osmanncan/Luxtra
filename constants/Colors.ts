export const TrustPalette = {
  
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
};

const tintColorLight = TrustPalette.emerald;
const tintColorDark = TrustPalette.offWhite;

export default {
  light: {
    text: '#111827',
    background: TrustPalette.offWhite,
    tint: tintColorLight,
    tabIconDefault: '#94a3b8',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: TrustPalette.offWhite,
    background: TrustPalette.base,
    tint: tintColorDark,
    tabIconDefault: '#475569',
    tabIconSelected: tintColorDark,
  },
};

