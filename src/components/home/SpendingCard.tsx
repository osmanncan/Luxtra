import { ChevronRight } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ThemeColors } from '../../store/theme';
import { SUB_CATEGORIES } from '../../store/useStore';

interface SpendingCardProps {
    totalMonthly: number;
    monthlyBudget: number;
    isPro: boolean;
    currencySymbol: string;
    labels: {
        monthlySpending: string;
        details: string;
        overBudget: string;
        remaining: string;
        budget: string;
    };
    onPress: () => void;
    colors: ThemeColors;
    subscriptions: any[];
}

export const SpendingCard = ({
    totalMonthly,
    monthlyBudget,
    isPro,
    currencySymbol,
    labels,
    onPress,
    colors,
    subscriptions,
}: SpendingCardProps) => {
    const budgetPct = monthlyBudget > 0 ? Math.min((totalMonthly / monthlyBudget) * 100, 100) : 0;
    const isOverBudget = monthlyBudget > 0 && totalMonthly > monthlyBudget;

    return (
        <TouchableOpacity
            style={[s.spendCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
            activeOpacity={0.7}
            onPress={onPress}
        >
            <Text style={[s.spendLabel, { color: colors.subtle }]}>{labels.monthlySpending}</Text>
            <View style={s.spendRow}>
                <Text style={[s.spendAmount, { color: colors.offWhite }]}>
                    {currencySymbol}{totalMonthly.toFixed(2)}
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <Text style={[s.spendDetails, { color: colors.emerald }]}>{labels.details}</Text>
                    <ChevronRight size={14} color={colors.emerald} />
                </View>
            </View>

            {monthlyBudget > 0 && isPro && (
                <View style={s.budgetSection}>
                    <View style={[s.budgetBar, { backgroundColor: colors.cardBorder }]}>
                        <View
                            style={[
                                s.budgetFill,
                                {
                                    width: `${budgetPct}%`,
                                    backgroundColor: isOverBudget ? colors.red : colors.emerald,
                                },
                            ]}
                        />
                    </View>
                    <View style={s.budgetMeta}>
                        <Text style={[s.budgetText, { color: isOverBudget ? colors.red : colors.subtle }]}>
                            {isOverBudget ? labels.overBudget : `${currencySymbol}${(monthlyBudget - totalMonthly).toFixed(0)} ${labels.remaining}`}
                        </Text>
                        <Text style={[s.budgetTarget, { color: colors.dim }]}>
                            {labels.budget}: {currencySymbol}{monthlyBudget.toFixed(0)}
                        </Text>
                    </View>
                </View>
            )}

            <View style={s.catRow}>
                {subscriptions.slice(0, 4).map(sub => {
                    const cat = SUB_CATEGORIES[sub.category] ?? SUB_CATEGORIES.General;
                    const pct = totalMonthly > 0 ? ((sub.billingCycle === 'yearly' ? sub.amount / 12 : sub.amount) / totalMonthly * 100) : 0;
                    return (
                        <View key={sub.id} style={[s.catPill, { backgroundColor: colors.cardBorder }]}>
                            <Text style={{ fontSize: 12 }}>{cat.emoji}</Text>
                            <Text style={[s.catPct, { color: colors.muted }]}>{pct.toFixed(0)}%</Text>
                        </View>
                    );
                })}
            </View>
        </TouchableOpacity>
    );
};

const s = StyleSheet.create({
    spendCard: {
        borderRadius: 20,
        padding: 22,
        marginBottom: 24,
        borderWidth: 1,
    },
    spendLabel: {
        fontSize: 11,
        fontWeight: '700',
        letterSpacing: 1.2,
        marginBottom: 8,
    },
    spendRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 14,
    },
    spendAmount: {
        fontSize: 32,
        fontWeight: '700',
        letterSpacing: -1,
    },
    spendDetails: {
        fontSize: 13,
        fontWeight: '600',
    },
    budgetSection: {
        marginBottom: 14,
    },
    budgetBar: {
        height: 6,
        borderRadius: 4,
        overflow: 'hidden',
        marginBottom: 6,
    },
    budgetFill: {
        height: '100%',
        borderRadius: 4,
    },
    budgetMeta: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    budgetText: {
        fontSize: 11,
        fontWeight: '600',
    },
    budgetTarget: {
        fontSize: 11,
        fontWeight: '500',
    },
    catRow: {
        flexDirection: 'row',
        gap: 8,
    },
    catPill: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 20,
    },
    catPct: {
        fontSize: 11,
        fontWeight: '700',
    },
});
