import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ThemeColors } from '../../store/theme';

interface UpcomingPaymentProps {
    emoji: string;
    name: string;
    daysLeft: string;
    amount: string;
    colors: ThemeColors;
}

export const UpcomingPayment = ({
    emoji,
    name,
    daysLeft,
    amount,
    colors,
}: UpcomingPaymentProps) => {
    return (
        <View style={[s.upcomingItem, { borderTopColor: colors.cardBorder + '30' }]}>
            <Text style={{ fontSize: 16 }}>{emoji}</Text>
            <View style={{ flex: 1 }}>
                <Text style={[s.upcomingName, { color: colors.offWhite }]}>{name}</Text>
                <Text style={[s.upcomingDate, { color: colors.amber }]}>{daysLeft}</Text>
            </View>
            <Text style={[s.upcomingAmount, { color: colors.offWhite }]}>{amount}</Text>
        </View>
    );
};

const s = StyleSheet.create({
    upcomingItem: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8, borderTopWidth: 1 },
    upcomingName: { fontSize: 14, fontWeight: '600' },
    upcomingDate: { fontSize: 11, fontWeight: '600', marginTop: 2 },
    upcomingAmount: { fontSize: 15, fontWeight: '700' },
});
