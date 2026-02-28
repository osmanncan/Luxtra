import { Check } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ThemeColors } from '../../store/theme';
import { SUB_CATEGORIES } from '../../store/useStore';

interface SubscriptionItemProps {
    item: any;
    isTR: boolean;
    currencySymbol: string;
    onPress: () => void;
    onMarkPaid: () => void;
    colors: ThemeColors;
}

export const SubscriptionItem = ({
    item,
    isTR,
    currencySymbol,
    onPress,
    onMarkPaid,
    colors,
}: SubscriptionItemProps) => {
    const cat = SUB_CATEGORIES[item.category] ?? SUB_CATEGORIES.General;
    const nextDate = new Date(item.nextBillingDate);
    const diffDays = Math.ceil((nextDate.getTime() - Date.now()) / 86400000);
    const isUpcoming = diffDays >= 0 && diffDays <= 3;

    return (
        <TouchableOpacity
            style={[s.subCard, {
                backgroundColor: colors.card,
                borderColor: item.isPaid ? colors.emerald + '40' : isUpcoming ? colors.amber + '40' : colors.cardBorder,
            }]}
            activeOpacity={0.7}
            onPress={onPress}
        >
            <View style={[s.subIcon, { backgroundColor: cat.colors[0] + '20' }]}>
                <Text style={{ fontSize: 20 }}>{cat.emoji}</Text>
            </View>
            <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Text style={[s.subName, { color: colors.offWhite }]}>{item.name}</Text>
                    {item.isPaid && (
                        <View style={[s.paidBadge, { backgroundColor: colors.emerald + '18' }]}>
                            <Check size={10} color={colors.emerald} strokeWidth={3} />
                            <Text style={[s.paidText, { color: colors.emerald }]}>{isTR ? 'Ödendi' : 'Paid'}</Text>
                        </View>
                    )}
                </View>
                <Text style={[s.subMeta, { color: colors.subtle }]}>
                    {item.billingCycle === 'monthly' ? (isTR ? 'Aylık' : 'Monthly') : (isTR ? 'Yıllık' : 'Yearly')} · {nextDate.toLocaleDateString(isTR ? 'tr-TR' : 'en-US', { month: 'short', day: 'numeric' })}
                </Text>
            </View>
            <View style={s.subRight}>
                <Text style={[s.subAmount, { color: colors.offWhite }]}>{currencySymbol}{item.amount.toFixed(2)}</Text>
                <Text style={[s.subCycle, { color: colors.subtle }]}>/{item.billingCycle === 'monthly' ? (isTR ? 'ay' : 'mo') : (isTR ? 'yıl' : 'yr')}</Text>
            </View>
            <TouchableOpacity
                style={[s.payBtn, { backgroundColor: item.isPaid ? colors.emerald : 'transparent', borderColor: item.isPaid ? colors.emerald : colors.cardBorder }]}
                onPress={onMarkPaid}
                activeOpacity={0.7}
            >
                <Check size={14} color={item.isPaid ? '#FFF' : colors.dim} strokeWidth={2.5} />
            </TouchableOpacity>
        </TouchableOpacity>
    );
};

const s = StyleSheet.create({
    subCard: { flexDirection: 'row', alignItems: 'center', borderRadius: 14, padding: 14, borderWidth: 1, gap: 12 },
    subIcon: { width: 46, height: 46, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
    subName: { fontSize: 15, fontWeight: '600' },
    subMeta: { fontSize: 12, fontWeight: '500', marginTop: 2 },
    subRight: { alignItems: 'flex-end' },
    subAmount: { fontSize: 16, fontWeight: '700' },
    subCycle: { fontSize: 10, fontWeight: '600' },
    paidBadge: { flexDirection: 'row', alignItems: 'center', gap: 3, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8 },
    paidText: { fontSize: 9, fontWeight: '800', letterSpacing: 0.3 },
    payBtn: { width: 32, height: 32, borderRadius: 8, justifyContent: 'center', alignItems: 'center', borderWidth: 1.5 },
});

