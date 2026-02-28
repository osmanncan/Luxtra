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
    Alert,
    Animated,
    KeyboardAvoidingView,
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
import { CURRENCIES, useStore } from '../src/store/useStore';

export default function AIInsightsScreen() {
    const router = useRouter();
    const { subscriptions, tasks, language, user, currency, freeAiQuestionsUsed, canAskAiFree, useAiQuestion, unlockAchievement, achievements } = useStore();
    const c = useThemeColors();
    const t = translations[language].ai;
    const isPro = user?.isPro ?? false;
    const isTR = language === 'tr';
    const freeRemaining = Math.max(0, 3 - freeAiQuestionsUsed);
    const canAsk = isPro || canAskAiFree();

    const [insight, setInsight] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [question, setQuestion] = useState('');

    const fadeAnim = useRef(new Animated.Value(0)).current;
    const pulseAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
        
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, { toValue: 1.1, duration: 1000, useNativeDriver: true }),
                Animated.timing(pulseAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
            ])
        ).start();
    }, []);
    useEffect(() => {
        if (isPro || canAskAiFree()) {
            fetchInsight(undefined, true); 
        }
    }, [isPro]);

    const fetchInsight = useCallback(async (customQ?: string, isAutoLoad?: boolean) => {
        
        if (!isPro && !isAutoLoad) {
            const allowed = useAiQuestion();
            if (!allowed) {
                Alert.alert(
                    isTR ? 'AI Hakkın Doldu' : 'AI Quota Reached',
                    isTR ? 'Bu ay 3 ücretsiz AI sorunu kullandın. Sınırsız erişim için Pro\'ya geç!' : 'You\'ve used your 3 free AI questions this month. Upgrade to Pro for unlimited access!',
                    [
                        { text: isTR ? 'Tamam' : 'OK', style: 'cancel' },
                        { text: isTR ? 'Pro\'ya Geç' : 'Go Pro', onPress: () => router.push('/modal') },
                    ]
                );
                return;
            }
        }
        setLoading(true);
        try {
            const result = await getAIInsight(
                { subscriptions, tasks, language },
                customQ
            );
            setInsight(result);
            
            if (!achievements.includes('ai_curious')) unlockAchievement('ai_curious');
        } catch {
            setInsight(t.error);
        }
        setLoading(false);
    }, [subscriptions, tasks, language, isPro]);

    const handleAsk = () => {
        if (question.trim() && canAsk) {
            fetchInsight(question.trim());
            setQuestion('');
        } else if (!canAsk) {
            router.push('/modal');
        }
    };
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
        <KeyboardAvoidingView
            style={[s.container, { backgroundColor: c.base }]}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <StatusBar barStyle={c.statusBarStyle} />

            <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
                {}
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
                    {}
                    <View style={[s.heroCard, { backgroundColor: c.emerald + '12', borderColor: c.emerald + '25' }]}>
                        <Animated.View style={[s.aiIconWrap, { transform: [{ scale: pulseAnim }] }]}>
                            <Sparkles size={28} color={c.emerald} />
                        </Animated.View>
                        <Text style={[s.heroTitle, { color: c.offWhite }]}>{t.title}</Text>
                    </View>

                    {}
                    <Text style={[s.sectionLabel, { color: c.subtle }]}>{t.suggestions}</Text>
                    <View style={s.statsRow}>
                        <View style={[s.statCard, { backgroundColor: c.card, borderColor: c.cardBorder }]}>
                            <TrendingUp size={16} color={c.emerald} />
                            <Text style={[s.statLabel, { color: c.subtle }]}>{t.topSpending}</Text>
                            <Text style={[s.statValue, { color: c.offWhite }]}>
                                {topSub ? `${topSub.name}` : '—'}
                            </Text>
                            <Text style={[s.statAmount, { color: c.emerald }]}>
                                {topSub ? `${CURRENCIES[currency]?.symbol || '$'}${topSub.amount.toFixed(2)}` : ''}
                            </Text>
                        </View>
                        <View style={[s.statCard, { backgroundColor: c.card, borderColor: c.cardBorder }]}>
                            <Zap size={16} color={c.amber} />
                            <Text style={[s.statLabel, { color: c.subtle }]}>{t.savingTip}</Text>
                            <Text style={[s.statValue, { color: c.offWhite }]}>
                                {sortedCats[0] ? sortedCats[0][0] : '—'}
                            </Text>
                            <Text style={[s.statAmount, { color: c.amber }]}>
                                {sortedCats[0] ? `${CURRENCIES[currency]?.symbol || '$'}${sortedCats[0][1].toFixed(0)}` : ''}
                            </Text>
                        </View>
                    </View>

                    {}
                    {!isPro && (
                        <View style={[s.quotaBanner, { backgroundColor: c.emerald + '10', borderColor: c.emerald + '25' }]}>
                            <Sparkles size={16} color={c.emerald} />
                            <Text style={[s.quotaText, { color: c.emerald }]}>
                                {isTR
                                    ? `Bu ay ${freeRemaining}/3 ücretsiz AI sorun kaldı`
                                    : `${freeRemaining}/3 free AI questions remaining`}
                            </Text>
                            <TouchableOpacity onPress={() => router.push('/modal')}>
                                <Text style={[s.quotaUpgrade, { color: c.amber }]}>
                                    {isTR ? 'Sınırsız →' : 'Unlimited →'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    {}
                    <Text style={[s.sectionLabel, { color: c.subtle }]}>{t.insight}</Text>
                    <View style={[s.insightCard, { backgroundColor: c.card, borderColor: c.cardBorder, overflow: 'hidden' }]}>
                        {!canAsk && !insight ? (
                            <View>
                                <Text style={[s.insightText, { color: c.offWhite, opacity: 0.15 }]} numberOfLines={5}>
                                    {isTR
                                        ? 'Burada harcamalarına göre oluşturulan özel yapay zeka analizlerin yer alır. Bütçeni daha iyi yönetmek için tavsiyeler, aylık abonelik optimizasyonları ve daha fazlasını görmek için Pro özelliklerini açabilirsin.'
                                        : 'This area contains personalized AI analysis based on your spending. Unlock Pro features for unlimited budget management recommendations and subscription optimizations.'}
                                </Text>
                                <View style={[StyleSheet.absoluteFill, { justifyContent: 'center', alignItems: 'center', backgroundColor: c.base + 'C0' }]}>
                                    <TouchableOpacity onPress={() => router.push('/modal')} style={{ alignItems: 'center' }}>
                                        <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: c.amber + '20', justifyContent: 'center', alignItems: 'center', marginBottom: 8 }}>
                                            <Crown size={20} color={c.amber} />
                                        </View>
                                        <Text style={{ color: c.offWhite, fontWeight: '700', fontSize: 15, marginBottom: 4 }}>
                                            {isTR ? 'Sınırsız AI Erişimi' : 'Unlimited AI Access'}
                                        </Text>
                                        <Text style={{ color: c.subtle, fontWeight: '500', fontSize: 13, textAlign: 'center', paddingHorizontal: 20 }}>
                                            {isTR ? 'Bu ayki ücretsiz hakların doldu. Pro ile sınırsız sor!' : 'Monthly free questions used up. Go Pro for unlimited!'}
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        ) : loading ? (
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
                                <Text style={[s.insightText, { color: c.offWhite }]}>{insight}</Text>
                                <TouchableOpacity
                                    style={[s.refreshBtn, { backgroundColor: c.emerald + '15' }]}
                                    onPress={() => fetchInsight()}
                                    activeOpacity={0.7}
                                >
                                    <RefreshCw size={14} color={c.emerald} />
                                    <Text style={[s.refreshText, { color: c.emerald }]}>
                                        {t.newInsight}
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

                    {}
                    {!isPro && (
                        <TouchableOpacity
                            style={[s.proCard, { backgroundColor: c.amber + '10', borderColor: c.amber + '25' }]}
                            onPress={() => router.push('/modal')}
                            activeOpacity={0.8}
                        >
                            <Crown size={20} color={c.amber} />
                            <View style={{ flex: 1 }}>
                                <Text style={[s.proTitle, { color: c.amber }]}>
                                    {isTR ? 'Pro ile Sınırsız AI' : 'Unlimited AI with Pro'}
                                </Text>
                                <Text style={[s.proSub, { color: c.subtle }]}>
                                    {isTR ? 'Kişisel finansal asistanınla her gün konuş' : 'Chat with your personal financial assistant daily'}
                                </Text>
                            </View>
                        </TouchableOpacity>
                    )}
                </ScrollView>

                {}
                <View style={[s.inputBar, { backgroundColor: c.card, borderColor: c.cardBorder }]}>
                    <TextInput
                        style={[s.textInput, { color: c.offWhite }]}
                        value={question}
                        onChangeText={setQuestion}
                        placeholder={canAsk
                            ? t.placeholder
                            : (isTR ? 'AI hakkın doldu — Pro ile devam et' : 'AI quota reached — upgrade to Pro')}
                        placeholderTextColor={c.dim}
                        onSubmitEditing={handleAsk}
                        returnKeyType="send"
                        editable={canAsk}
                    />
                    <TouchableOpacity
                        style={[s.sendBtn, { backgroundColor: question.trim() && canAsk ? c.emerald : c.dim }]}
                        onPress={handleAsk}
                        disabled={!question.trim()}
                    >
                        <Send size={16} color="#FFF" />
                    </TouchableOpacity>
                </View>
            </Animated.View>
        </KeyboardAvoidingView>
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
    inputBar: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        paddingBottom: Platform.OS === 'ios' ? 44 : 20,
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
    quotaBanner: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 20, padding: 12, borderRadius: 12, borderWidth: 1, gap: 10, marginBottom: 20 },
    quotaText: { fontSize: 13, fontWeight: '700', flex: 1 },
    quotaUpgrade: { fontSize: 13, fontWeight: '700' },
});
