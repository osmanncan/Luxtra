import { AlertTriangle } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ThemeColors } from '../../store/theme';

interface UpcomingItemProps {
    item: {
        id: string;
        title: string;
        date: string;
        kind: 'payment' | 'responsibility';
        isRecurring?: boolean;
        amount?: number;
    };
    daysLabel: string;
    isOverdue: boolean;
    isToday: boolean;
    currencySymbol: string;
    onPress: () => void;
    colors: ThemeColors;
}

export const UpcomingItem = ({
    item,
    daysLabel,
    isOverdue,
    isToday,
    currencySymbol,
    onPress,
    colors,
}: UpcomingItemProps) => {
    return (
        <TouchableOpacity
            style={[
                s.container,
                {
                    backgroundColor: colors.card,
                    borderColor: isOverdue ? colors.red + '40' : isToday ? colors.amber + '40' : colors.cardBorder,
                },
            ]}
            activeOpacity={0.7}
            onPress={onPress}
        >
            <Text style={{ fontSize: 16 }}>
                {item.kind === 'payment' ? '💳' : '📌'}
            </Text>
            <View style={{ flex: 1, marginRight: 8 }}>
                <Text style={[s.title, { color: colors.offWhite }]} numberOfLines={1}>{item.title}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Text style={[s.date, { color: isOverdue ? colors.red : isToday ? colors.amber : colors.subtle }]}>
                        {daysLabel}
                    </Text>
                    {item.isRecurring && (
                        <View style={[s.recurBadge, { backgroundColor: colors.blue + '15' }]}>
                            <Text style={[s.recurText, { color: colors.blue }]}>↻</Text>
                        </View>
                    )}
                </View>
            </View>
            {item.amount !== undefined && (
                <Text style={[s.amount, { color: colors.offWhite }]}>
                    {currencySymbol}{item.amount.toFixed(2)}
                </Text>
            )}
            {isOverdue && <AlertTriangle size={16} color={colors.red} />}
        </TouchableOpacity>
    );
};

const s = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        padding: 16,
        borderRadius: 14,
        marginBottom: 8,
        borderWidth: 1,
    },
    title: {
        fontSize: 14,
        fontWeight: '600',
    },
    date: {
        fontSize: 12,
        fontWeight: '600',
        marginTop: 2,
    },
    amount: {
        fontSize: 15,
        fontWeight: '700',
    },
    recurBadge: {
        width: 18,
        height: 18,
        borderRadius: 9,
        justifyContent: 'center',
        alignItems: 'center',
    },
    recurText: {
        fontSize: 10,
        fontWeight: '800',
    },
});
