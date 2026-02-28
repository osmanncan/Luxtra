import { useRouter } from 'expo-router';
import { ArrowLeft, Award, CheckCircle2, Lock, Sparkles, Trophy } from 'lucide-react-native';
import React from 'react';
import {
    Dimensions,
    Platform,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useThemeColors } from '../src/store/theme';
import { useStore } from '../src/store/useStore';

const { width } = Dimensions.get('window');
const COLUMN_WIDTH = (width - 52) / 2;

export const BADGES = [
    { id: 'first_sub', icon: '💳', title: { tr: 'İlk Adım', en: 'First Step' }, desc: { tr: 'İlk aboneliğini ekledin.', en: 'Added your first subscription.' } },
    { id: 'first_task', icon: '📌', title: { tr: 'Sorumluluk Sahibi', en: 'Responsible' }, desc: { tr: 'İlk sorumluluğunu ekledin.', en: 'Added your first task.' } },
    { id: 'streak_3', icon: '🔥', title: { tr: '3 Günlük Seri', en: '3-Day Streak' }, desc: { tr: 'Uygulamayı peş peşe 3 gün kullandın.', en: 'Used the app 3 days in a row.' } },
    { id: 'streak_7', icon: '⚡', title: { tr: 'Haftalık Seri', en: 'Weekly Streak' }, desc: { tr: 'Uygulamayı peş peşe 7 gün kullandın.', en: 'Used the app 7 days in a row.' } },
    { id: 'streak_30', icon: '🏔️', title: { tr: 'Aylık Seri', en: 'Monthly Streak' }, desc: { tr: '30 gün üst üste giriş yaptın!', en: '30 days in a row — incredible!' } },
    { id: 'streak_90', icon: '💎', title: { tr: 'Elmas Seri', en: 'Diamond Streak' }, desc: { tr: '90 gün üst üste — efsane!', en: '90 days straight — legendary!' } },
    { id: 'streak_365', icon: '🏆', title: { tr: 'Yıllık Şampiyon', en: 'Yearly Champion' }, desc: { tr: 'Tam 1 yıl boyunca her gün girdin!', en: 'Used the app every day for a full year!' } },
    { id: 'subs_5', icon: '📊', title: { tr: 'Analist', en: 'Analyst' }, desc: { tr: '5 abonelik takip ediyorsun.', en: 'Tracking 5 subscriptions.' } },
    { id: 'tasks_10', icon: '🎯', title: { tr: 'Düzenli', en: 'Organized' }, desc: { tr: '10 sorumluluğu zamanında tamamladın.', en: 'Completed 10 tasks on time.' } },
    { id: 'saver', icon: '💰', title: { tr: 'Tasarrufçu', en: 'Saver' }, desc: { tr: 'Bir aboneliği iptal/silerek tasarruf ettin.', en: 'Saved money by cancelling a subscription.' } },
    { id: 'ai_curious', icon: '🧠', title: { tr: 'AI Meraklısı', en: 'AI Explorer' }, desc: { tr: 'Yapay zekaya ilk sorunu sordun.', en: 'Asked your first AI question.' } },
    { id: 'biometric', icon: '🔒', title: { tr: 'Güvenlikçi', en: 'Security First' }, desc: { tr: 'Biyometrik kilidi aktifleştirdin.', en: 'Enabled biometric lock.' } },
    { id: 'globe', icon: '🌍', title: { tr: 'Gezgin', en: 'Globe Trotter' }, desc: { tr: 'Uygulama dilini değiştirdin.', en: 'Changed app language.' } },
    { id: 'budgeter', icon: '📈', title: { tr: 'Bütçeci', en: 'Budgeter' }, desc: { tr: 'Aylık bütçe hedefi belirledin.', en: 'Set a monthly budget goal.' } },
    { id: 'pro_user', icon: '👑', title: { tr: 'Hayatının Hakimi', en: 'Life Master' }, desc: { tr: 'Luxtra Pro abonesi oldun.', en: 'Became a Luxtra Pro member.' } },
];

export default function AchievementsScreen() {
    const router = useRouter();
    const { achievements, language, user } = useStore();
    const c = useThemeColors();
    const isTR = language === 'tr';

    const unlockedCount = achievements.length;
    const progress = (unlockedCount / BADGES.length) * 100;

    return (
        <View style={[s.container, { backgroundColor: c.base }]}>
            <StatusBar barStyle="light-content" />

            {}
            <View style={s.header}>
                <TouchableOpacity
                    onPress={() => router.back()}
                    style={[s.backBtn, { backgroundColor: c.card, borderColor: c.cardBorder }]}
                >
                    <ArrowLeft size={22} color={c.offWhite} />
                </TouchableOpacity>
                <View style={s.headerTitleCenter}>
                    <Text style={[s.headerTitle, { color: c.offWhite }]}>
                        {isTR ? 'Başarımlar' : 'Achievements'}
                    </Text>
                    <View style={s.headerSubtitleRow}>
                        <Sparkles size={12} color={c.amber} />
                        <Text style={[s.headerSubtitle, { color: c.subtle }]}>
                            {isTR ? 'Rozet Koleksiyonu' : 'Badge Collection'}
                        </Text>
                    </View>
                </View>
                <View style={{ width: 44 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scrollContent}>
                {}
                <View style={[s.heroCard, { backgroundColor: c.card, borderColor: c.cardBorder }]}>
                    <View style={s.heroMain}>
                        <View style={[s.heroIconWrap, { backgroundColor: c.emerald + '15' }]}>
                            <Trophy size={40} color={c.emerald} />
                        </View>
                        <View style={s.heroText}>
                            <Text style={[s.heroTitle, { color: c.offWhite }]}>
                                {unlockedCount} / {BADGES.length}
                            </Text>
                            <Text style={[s.heroSub, { color: c.subtle }]}>
                                {isTR ? 'Rozet Açıldı' : 'Badges Unlocked'}
                            </Text>
                        </View>
                    </View>

                    {}
                    <View style={s.progressContainer}>
                        <View style={[s.progressBarBg, { backgroundColor: c.base }]}>
                            <View style={[s.progressBarFill, { width: `${progress}%`, backgroundColor: c.emerald }]} />
                        </View>
                        <Text style={[s.progressPct, { color: c.emerald }]}>%{Math.round(progress)}</Text>
                    </View>
                </View>

                {}
                <View style={s.gridHeader}>
                    <Text style={[s.sectionLabel, { color: c.subtle }]}>
                        {isTR ? 'TÜM BAŞARIMLAR' : 'ALL ACHIEVEMENTS'}
                    </Text>
                    <Award size={16} color={c.dim} />
                </View>

                {}
                <View style={s.badgesGrid}>
                    {BADGES.map((badge) => {
                        const isUnlocked = achievements.includes(badge.id) || (badge.id === 'pro_user' && user?.isPro);
                        return (
                            <View
                                key={badge.id}
                                style={[
                                    s.badgeCard,
                                    {
                                        backgroundColor: isUnlocked ? c.card : c.sectionBg,
                                        borderColor: isUnlocked ? c.emerald + '40' : c.cardBorder,
                                        opacity: isUnlocked ? 1 : 0.7
                                    }
                                ]}
                            >
                                <View style={[s.badgeIconContainer, { backgroundColor: isUnlocked ? c.emerald + '15' : c.cardBorder + '20' }]}>
                                    {isUnlocked ? (
                                        <Text style={s.badgeIconText}>{badge.icon}</Text>
                                    ) : (
                                        <Lock size={20} color={c.dim} />
                                    )}
                                </View>

                                {isUnlocked && (
                                    <View style={[s.miniCheck, { backgroundColor: c.emerald }]}>
                                        <CheckCircle2 size={10} color={c.base} />
                                    </View>
                                )}

                                <Text style={[s.badgeCardTitle, { color: isUnlocked ? c.offWhite : c.subtle }]} numberOfLines={1}>
                                    {isTR ? badge.title.tr : badge.title.en}
                                </Text>
                                <Text style={[s.badgeCardDesc, { color: c.dim }]} numberOfLines={2}>
                                    {isTR ? badge.desc.tr : badge.desc.en}
                                </Text>
                            </View>
                        );
                    })}
                </View>
            </ScrollView>
        </View>
    );
}

const s = StyleSheet.create({
    container: { flex: 1, paddingTop: Platform.OS === 'ios' ? 50 : 34 },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginBottom: 20,
        height: 60,
    },
    backBtn: {
        width: 44,
        height: 44,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1
    },
    headerTitleCenter: { flex: 1, alignItems: 'center' },
    headerTitle: { fontSize: 20, fontWeight: '800', letterSpacing: -0.5 },
    headerSubtitleRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
    headerSubtitle: { fontSize: 11, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },

    scrollContent: { paddingBottom: 100 },

    heroCard: {
        marginHorizontal: 20,
        padding: 24,
        borderRadius: 24,
        borderWidth: 1,
        marginBottom: 32,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.2,
        shadowRadius: 20,
        elevation: 10,
    },
    heroMain: { flexDirection: 'row', alignItems: 'center', gap: 16 },
    heroIconWrap: {
        width: 72,
        height: 72,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center'
    },
    heroText: { flex: 1 },
    heroTitle: { fontSize: 32, fontWeight: '900', letterSpacing: -1 },
    heroSub: { fontSize: 14, fontWeight: '600', marginTop: -2 },

    progressContainer: { marginTop: 20, flexDirection: 'row', alignItems: 'center', gap: 12 },
    progressBarBg: { flex: 1, height: 8, borderRadius: 4, overflow: 'hidden' },
    progressBarFill: { height: '100%', borderRadius: 4 },
    progressPct: { fontSize: 13, fontWeight: '800', width: 40 },

    gridHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 24,
        marginBottom: 16
    },
    sectionLabel: { fontSize: 13, fontWeight: '800', letterSpacing: 1 },

    badgesGrid: {
        paddingHorizontal: 20,
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: 12,
    },
    badgeCard: {
        width: COLUMN_WIDTH,
        padding: 16,
        borderRadius: 20,
        borderWidth: 1,
        alignItems: 'center',
        position: 'relative',
    },
    badgeIconContainer: {
        width: 56,
        height: 56,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    badgeIconText: { fontSize: 26 },
    miniCheck: {
        position: 'absolute',
        top: 12,
        right: 12,
        width: 18,
        height: 18,
        borderRadius: 9,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#121212'
    },
    badgeCardTitle: { fontSize: 14, fontWeight: '700', marginBottom: 4, textAlign: 'center' },
    badgeCardDesc: { fontSize: 11, fontWeight: '500', textAlign: 'center', lineHeight: 15, paddingHorizontal: 4 },
});
