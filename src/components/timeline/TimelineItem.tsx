import { Clock, RefreshCw } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ThemeColors } from '../../store/theme';

interface TimelineItemProps {
    item: any;
    isTR: boolean;
    currencySymbol: string;
    labels: {
        payment: string;
        responsibility: string;
        repeatsEvery: string;
    };
    onPress: () => void;
    onComplete?: () => void;
    colors: ThemeColors;
}

export const TimelineItem = ({
    item,
    isTR,
    currencySymbol,
    labels,
    onPress,
    onComplete,
    colors,
}: TimelineItemProps) => {
    const d = new Date(item.date);
    const isPayment = item.kind === 'payment';
    const icon = isPayment ? '💳' : '📌';
    const label = isPayment ? labels.payment : labels.responsibility;

    return (
        <TouchableOpacity
            style={[s.itemCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
            activeOpacity={0.7}
            onPress={onPress}
        >
            <View style={[s.itemIconWrap, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
                <Text style={{ fontSize: 16 }}>{icon}</Text>
            </View>
            <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Text style={[s.itemTitle, { color: colors.offWhite }]}>{item.title}</Text>
                    {item.isRecurring && (
                        <View style={[s.recurBadge, { backgroundColor: colors.blue + '15' }]}>
                            <RefreshCw size={9} color={colors.blue} />
                        </View>
                    )}
                </View>
                <View style={s.itemMetaRow}>
                    <Clock size={11} color={colors.subtle} />
                    <Text style={[s.itemMeta, { color: colors.subtle }]}>
                        {d.toLocaleDateString(isTR ? 'tr-TR' : 'en-US', { month: 'short', day: 'numeric' })}
                        {item.amount ? ` · ${currencySymbol}${item.amount.toFixed(2)}` : ''}
                    </Text>
                </View>
                {item.isRecurring && item.recurringMonths && (
                    <Text style={[s.recurText, { color: colors.dim }]}>
                        {labels.repeatsEvery.replace('{months}', item.recurringMonths.toString())}
                    </Text>
                )}
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                {!isPayment && onComplete && (
                    <TouchableOpacity
                        style={[s.payBtn, { borderColor: colors.emerald }]}
                        onPress={(e) => {
                            e.stopPropagation();
                            onComplete();
                        }}
                    >
                        <Text style={{ fontSize: 14 }}>✓</Text>
                    </TouchableOpacity>
                )}
                <View style={[s.kindPill, { backgroundColor: colors.sectionBg }]}>
                    <Text style={[s.kindPillText, { color: colors.muted }]}>{label}</Text>
                </View>
            </View>
        </TouchableOpacity>
    );
};

const s = StyleSheet.create({
    itemCard: { flexDirection: 'row', alignItems: 'center', borderRadius: 14, padding: 16, borderWidth: 1, gap: 12 },
    itemIconWrap: { width: 42, height: 42, borderRadius: 10, justifyContent: 'center', alignItems: 'center', borderWidth: 1 },
    itemTitle: { fontSize: 16, fontWeight: '700' },
    itemMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 3 },
    itemMeta: { fontSize: 13, fontWeight: '600' },
    recurBadge: { width: 18, height: 18, borderRadius: 9, justifyContent: 'center', alignItems: 'center' },
    recurText: { fontSize: 10, fontWeight: '500', marginTop: 2 },
    kindPill: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
    kindPillText: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
    payBtn: { width: 32, height: 32, borderRadius: 8, justifyContent: 'center', alignItems: 'center', borderWidth: 1.5 },
});
