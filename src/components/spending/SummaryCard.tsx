import { TrendingUp } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ThemeColors } from '../../store/theme';
import { SUB_CATEGORIES } from '../../store/useStore';

interface SummaryCardProps {
    totalAll: number;
    annualized: number;
    monthlyBudget: number;
    isPro: boolean;
    currencySymbol: string;
    labels: {
        monthlyTotal: string;
        perYear: string;
        budget: string;
    };
    colors: ThemeColors;
    subscriptions: any[];
    categories: [string, { total: number; count: number }][];
}

export const SummaryCard = ({
    totalAll,
    annualized,
    monthlyBudget,
    isPro,
    currencySymbol,
    labels,
    colors,
    subscriptions,
    categories,
}: SummaryCardProps) => {
    return (
        <View style={[s.spendCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <View style={s.spendAmountRow}>
                <View>
                    <Text style={[s.spendLabel, { color: colors.subtle }]}>{labels.monthlyTotal}</Text>
                    <Text style={[s.spendAmount, { color: colors.offWhite }]}>{currencySymbol}{totalAll.toFixed(2)}</Text>
                </View>
                <View style={s.spendRight}>
                    <Text style={[s.spendLabel, { color: colors.subtle }]}>{labels.perYear}</Text>
                    <Text style={[s.spendAnnual, { color: colors.muted }]}>{currencySymbol}{annualized.toFixed(0)}</Text>
                </View>
            </View>

            {monthlyBudget > 0 && (
                <View style={s.budgetRow}>
                    <View style={[s.budgetBar, { backgroundColor: colors.cardBorder }]}>
                        <View style={[s.budgetFill, {
                            width: `${Math.min((totalAll / monthlyBudget) * 100, 100)}%`,
                            backgroundColor: totalAll > monthlyBudget ? colors.red : colors.emerald,
                        }]} />
                    </View>
                    <Text style={[s.budgetLabel, { color: totalAll > monthlyBudget ? colors.red : colors.subtle }]}>
                        {currencySymbol}{totalAll.toFixed(0)} / {currencySymbol}{monthlyBudget.toFixed(0)}
                    </Text>
                </View>
            )}

            <View style={[s.barContainer, { backgroundColor: colors.cardBorder }]}>
                {subscriptions.map((sub, i) => {
                    const cat = SUB_CATEGORIES[sub.category] ?? SUB_CATEGORIES.General;
                    const monthlyAmt = sub.billingCycle === 'yearly' ? sub.amount / 12 : sub.amount;
                    const pct = totalAll > 0 ? (monthlyAmt / totalAll) * 100 : 0;
                    return (
                        <View key={sub.id} style={[s.barSegment, {
                            width: `${Math.max(pct, 2)}%`,
                            backgroundColor: cat.colors[0],
                            borderTopLeftRadius: i === 0 ? 6 : 0,
                            borderBottomLeftRadius: i === 0 ? 6 : 0,
                            borderTopRightRadius: i === subscriptions.length - 1 ? 6 : 0,
                            borderBottomRightRadius: i === subscriptions.length - 1 ? 6 : 0,
                        }]} />
                    );
                })}
            </View>

            <View style={s.catRow}>
                {categories.map(([cat, data]) => {
                    const catConfig = SUB_CATEGORIES[cat] ?? SUB_CATEGORIES.General;
                    return (
                        <View key={cat} style={[s.catPill, { backgroundColor: colors.cardBorder }]}>
                            <View style={[s.catDot, { backgroundColor: catConfig.colors[0] }]} />
                            <Text style={[s.catText, { color: colors.muted }]}>{catConfig.emoji} {cat}</Text>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                                <Text style={[s.catAmount, { color: colors.offWhite }]}>{currencySymbol}{data.total.toFixed(0)}</Text>
                                <TrendingUp size={10} color={data.total > 500 ? colors.red : colors.emerald} />
                            </View>
                        </View>
                    );
                })}
            </View>
        </View>
    );
};

const s = StyleSheet.create({
    spendCard: { borderRadius: 20, padding: 22, marginBottom: 20, borderWidth: 1 },
    spendAmountRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
    spendLabel: { fontSize: 12, fontWeight: '600', marginBottom: 4 },
    spendAmount: { fontSize: 32, fontWeight: '700', letterSpacing: -1 },
    spendRight: { alignItems: 'flex-end' },
    spendAnnual: { fontSize: 20, fontWeight: '700', letterSpacing: -0.5 },
    budgetRow: { marginBottom: 14 },
    budgetBar: { height: 6, borderRadius: 4, overflow: 'hidden', marginBottom: 4 },
    budgetFill: { height: '100%', borderRadius: 4 },
    budgetLabel: { fontSize: 11, fontWeight: '600' },
    barContainer: { height: 10, flexDirection: 'row', borderRadius: 6, overflow: 'hidden', marginBottom: 16 },
    barSegment: { height: '100%' },
    catRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    catPill: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20, gap: 6 },
    catDot: { width: 8, height: 8, borderRadius: 4 },
    catText: { fontSize: 11, fontWeight: '600' },
    catAmount: { fontSize: 11, fontWeight: '700' },
});
