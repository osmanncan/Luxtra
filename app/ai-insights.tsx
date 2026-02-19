import { useRouter } from 'expo-router';
import {
    ArrowLeft,
    Bot,
    Crown,
    Lightbulb,
    RefreshCw,
    Send,
    Sparkles,
    TrendingUp,
    Zap,
} from 'lucide-react-native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Animated,
    Platform,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { getAIInsight } from '../src/services/aiService';
import { useThemeColors } from '../src/store/theme';
import { translations } from '../src/store/translations';
import { useStore } from '../src/store/useStore';

export default function AIInsightsScreen() {
    const router = useRouter();
    const { subscriptions, tasks, language, user, currency } = useStore();
    const c = useThemeColors();
    const t = translations[language].ai;

    const [insight, setInsight] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [question, setQuestion] = useState('');

    const fadeAnim = useRef(new Animated.Value(0)).current;
    const pulseAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
        // Pulse animation for the AI icon
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, { toValue: 1.1, duration: 1000, useNativeDriver: true }),
                Animated.timing(pulseAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
            ])
        ).start();
    }, []);

    // Auto-load insight 
    useEffect(() => {
        fetchInsight();
    }, []);

    const fetchInsight = useCallback(async (customQ?: string) => {
        setLoading(true);
        try {
            const result = await getAIInsight(
                { subscriptions, tasks, language },
                customQ
            );
            setInsight(result);
        } catch {
            setInsight(t.error);
        }
        setLoading(false);
    }, [subscriptions, tasks, language]);

    const handleAsk = () => {
        if (question.trim()) {
            fetchInsight(question.trim());
            setQuestion('');
        }
    };

    // Quick stats
    const totalMonthly = subscriptions
        .filter(s => s.billingCycle === 'monthly')
        .reduce((a, c_) => a + c_.amount, 0);

    const sortedSubs = [...subscriptions].sort((a, b) => b.amount - a.amount);
    const topSub = sortedSubs[0];
    const topCategory = subscriptions.reduce<Record<string, number>>((acc, sub) => {
        acc[sub.category] = (acc[sub.category] || 0) + sub.amount;
        return acc;
    }, {});
    const sortedCats = Object.entries(topCategory).sort((a, b) => b[1] - a[1]);

    return (
        <View style={[s.container, { backgroundColor: c.base }]}>
            <StatusBar barStyle={c.statusBarStyle} />

            <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
                {/* Header */}
                <View style={s.header}>
                    <TouchableOpacity onPress={() => router.back()} style={[s.backBtn, { backgroundColor: c.card, borderColor: c.cardBorder }]}>
                        <ArrowLeft size={20} color={c.offWhite} />
                    </TouchableOpacity>
                    <View style={s.headerCenter}>
                        <Bot size={20} color={c.emerald} />
                        <Text style={[s.headerTitle, { color: c.offWhite }]}>{t.title}</Text>
                    </View>
                    <View style={{ width: 44 }} />
                </View>

                <ScrollView contentContainerStyle={{ paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
                    {/* AI Hero Card */}
                    <View style={[s.heroCard, { backgroundColor: c.emerald + '12', borderColor: c.emerald + '25' }]}>
                        <Animated.View style={[s.aiIconWrap, { transform: [{ scale: pulseAnim }] }]}>
                            <Sparkles size={28} color={c.emerald} />
                        </Animated.View>
                        <Text style={[s.heroTitle, { color: c.offWhite }]}>{t.title}</Text>
                        <Text style={[s.heroSub, { color: c.subtle }]}>{t.subtitle}</Text>
                    </View>

                    {/* Quick Stats */}
                    <Text style={[s.sectionLabel, { color: c.subtle }]}>{t.suggestions}</Text>
                    <View style={s.statsRow}>
                        <View style={[s.statCard, { backgroundColor: c.card, borderColor: c.cardBorder }]}>
                            <TrendingUp size={16} color={c.emerald} />
                            <Text style={[s.statLabel, { color: c.subtle }]}>{language === 'tr' ? 'En Yüksek' : 'Top Spending'}</Text>
                            <Text style={[s.statValue, { color: c.offWhite }]}>
                                {topSub ? `${topSub.name}` : '—'}
                            </Text>
                            <Text style={[s.statAmount, { color: c.emerald }]}>
                                {topSub ? `$${topSub.amount.toFixed(2)}/mo` : ''}
                            </Text>
                        </View>
                        <View style={[s.statCard, { backgroundColor: c.card, borderColor: c.cardBorder }]}>
                            <Zap size={16} color={c.amber} />
                            <Text style={[s.statLabel, { color: c.subtle }]}>{language === 'tr' ? 'Tasarruf İpucu' : 'Saving Tip'}</Text>
                            <Text style={[s.statValue, { color: c.offWhite }]}>
                                {sortedCats[0] ? sortedCats[0][0] : '—'}
                            </Text>
                            <Text style={[s.statAmount, { color: c.amber }]}>
                                {sortedCats[0] ? `$${sortedCats[0][1].toFixed(0)}/mo` : ''}
                            </Text>
                        </View>
                    </View>

                    {/* AI Insight Result */}
                    <Text style={[s.sectionLabel, { color: c.subtle }]}>{t.insight}</Text>
                    <View style={[s.insightCard, { backgroundColor: c.card, borderColor: c.cardBorder }]}>
                        {loading ? (
                            <View style={s.loadingWrap}>
                                <ActivityIndicator size="small" color={c.emerald} />
                                <Text style={[s.loadingText, { color: c.subtle }]}>{t.analyzing}</Text>
                            </View>
                        ) : insight ? (
                            <View>
                                <View style={s.insightHeaderRow}>
                                    <Lightbulb size={16} color={c.emerald} />
                                    <Text style={[s.insightTitle, { color: c.emerald }]}>{t.insight}</Text>
                                </View>
                                <Text style={[s.insightText, { color: c.muted }]}>{insight}</Text>
                                <TouchableOpacity
                                    style={[s.refreshBtn, { backgroundColor: c.emerald + '15' }]}
                                    onPress={() => fetchInsight()}
                                    activeOpacity={0.7}
                                >
                                    <RefreshCw size={14} color={c.emerald} />
                                    <Text style={[s.refreshText, { color: c.emerald }]}>
                                        {language === 'tr' ? 'Yeni Öneri' : 'New Insight'}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <TouchableOpacity onPress={() => fetchInsight()} style={s.getInsightBtn}>
                                <Sparkles size={16} color={c.emerald} />
                                <Text style={[s.getInsightText, { color: c.emerald }]}>{t.getInsight}</Text>
                            </TouchableOpacity>
                        )}
                    </View>

                    {/* Pro Badge if not pro */}
                    {!user?.isPro && (
                        <TouchableOpacity
                            style={[s.proCard, { backgroundColor: c.amber + '10', borderColor: c.amber + '25' }]}
                            onPress={() => router.push('/modal')}
                            activeOpacity={0.8}
                        >
                            <Crown size={20} color={c.amber} />
                            <View style={{ flex: 1 }}>
                                <Text style={[s.proTitle, { color: c.amber }]}>{t.proRequired}</Text>
                                <Text style={[s.proSub, { color: c.subtle }]}>{t.upgradeForAI}</Text>
                            </View>
                        </TouchableOpacity>
                    )}
                </ScrollView>

                {/* Ask AI Input */}
                <View style={[s.inputBar, { backgroundColor: c.card, borderColor: c.cardBorder }]}>
                    <TextInput
                        style={[s.textInput, { color: c.offWhite }]}
                        value={question}
                        onChangeText={setQuestion}
                        placeholder={t.placeholder}
                        placeholderTextColor={c.dim}
                        onSubmitEditing={handleAsk}
                        returnKeyType="send"
                    />
                    <TouchableOpacity
                        style={[s.sendBtn, { backgroundColor: question.trim() ? c.emerald : c.dim }]}
                        onPress={handleAsk}
                        disabled={!question.trim()}
                    >
                        <Send size={16} color="#FFF" />
                    </TouchableOpacity>
                </View>
            </Animated.View>
        </View>
    );
}

const s = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: Platform.OS === 'ios' ? 60 : 44,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        marginBottom: 20,
    },
    backBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
    },
    headerCenter: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        letterSpacing: -0.3,
    },

    /* Hero */
    heroCard: {
        marginHorizontal: 20,
        borderRadius: 20,
        padding: 28,
        borderWidth: 1,
        alignItems: 'center',
        marginBottom: 28,
    },
    aiIconWrap: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: '#10B98118',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    heroTitle: {
        fontSize: 22,
        fontWeight: '700',
        letterSpacing: -0.5,
        marginBottom: 6,
    },
    heroSub: {
        fontSize: 13,
        fontWeight: '500',
        textAlign: 'center',
    },

    /* Stats */
    sectionLabel: {
        fontSize: 11,
        fontWeight: '700',
        letterSpacing: 1.2,
        textTransform: 'uppercase',
        marginLeft: 24,
        marginBottom: 10,
    },
    statsRow: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        gap: 10,
        marginBottom: 24,
    },
    statCard: {
        flex: 1,
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        gap: 4,
    },
    statLabel: {
        fontSize: 11,
        fontWeight: '600',
        marginTop: 4,
    },
    statValue: {
        fontSize: 16,
        fontWeight: '700',
    },
    statAmount: {
        fontSize: 12,
        fontWeight: '700',
    },

    /* Insight */
    insightCard: {
        marginHorizontal: 20,
        borderRadius: 16,
        padding: 20,
        borderWidth: 1,
        marginBottom: 16,
        minHeight: 120,
        justifyContent: 'center',
    },
    loadingWrap: {
        alignItems: 'center',
        gap: 10,
        paddingVertical: 20,
    },
    loadingText: {
        fontSize: 13,
        fontWeight: '500',
    },
    insightHeaderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 10,
    },
    insightTitle: {
        fontSize: 12,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    insightText: {
        fontSize: 14,
        fontWeight: '400',
        lineHeight: 22,
        marginBottom: 14,
    },
    refreshBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        alignSelf: 'flex-start',
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 20,
    },
    refreshText: {
        fontSize: 12,
        fontWeight: '700',
    },
    getInsightBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 16,
    },
    getInsightText: {
        fontSize: 14,
        fontWeight: '700',
    },

    /* Pro Card */
    proCard: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 20,
        padding: 18,
        borderRadius: 16,
        borderWidth: 1,
        gap: 14,
        marginBottom: 20,
    },
    proTitle: {
        fontSize: 14,
        fontWeight: '700',
    },
    proSub: {
        fontSize: 12,
        fontWeight: '500',
        marginTop: 2,
    },

    /* Input Bar */
    inputBar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        paddingBottom: Platform.OS === 'ios' ? 32 : 16,
        borderTopWidth: 1,
        gap: 10,
    },
    textInput: {
        flex: 1,
        fontSize: 15,
        fontWeight: '500',
        paddingVertical: 10,
        paddingHorizontal: 14,
        borderRadius: 12,
    },
    sendBtn: {
        width: 42,
        height: 42,
        borderRadius: 21,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
