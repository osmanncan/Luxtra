import { LucideIcon } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ThemeColors } from '../../store/theme';

interface SpendingInsightProps {
    icon: LucideIcon;
    iconColor: string;
    bgColor: string;
    value: string;
    description: string;
    colors: ThemeColors;
}

export const SpendingInsight = ({
    icon: Icon,
    iconColor,
    bgColor,
    value,
    description,
    colors,
}: SpendingInsightProps) => {
    return (
        <View style={[s.insightSmallCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <View style={[s.insightIconCircle, { backgroundColor: bgColor }]}>
                <Icon size={18} color={iconColor} />
            </View>
            <View style={{ flex: 1 }}>
                <Text style={[s.insightValue, { color: colors.offWhite }]}>{value}</Text>
                <Text style={[s.insightDesc, { color: colors.muted }]}>{description}</Text>
            </View>
        </View>
    );
};

const s = StyleSheet.create({
    insightSmallCard: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 16, borderWidth: 1, gap: 12 },
    insightIconCircle: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
    insightValue: { fontSize: 15, fontWeight: '700' },
    insightDesc: { fontSize: 12, fontWeight: '500', marginTop: 1 },
});
