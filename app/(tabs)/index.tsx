import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import * as StoreReview from 'expo-store-review';
import {
  ArrowRight,
  Brain,
  Crown,
  Shield,
} from 'lucide-react-native';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Platform,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SpendingCard } from '../../src/components/home/SpendingCard';
import { UpcomingItem } from '../../src/components/home/UpcomingItem';
import { FREE_LIMITS } from '../../src/store/proFeatures';
import { useThemeColors } from '../../src/store/theme';
import { translations } from '../../src/store/translations';
import { CURRENCIES, Subscription, Task, useStore } from '../../src/store/useStore';

export default function OverviewScreen() {
  const router = useRouter();
  const { subscriptions, tasks, user, language, currency, monthlyBudget, streakCount, recordLogin, unlockAchievement, achievements, syncData } = useStore();
  const isPro = user?.isPro ?? false;
  const c = useThemeColors();
  const t = (translations as any)[language];
  const isTR = language === 'tr';
  const curr = CURRENCIES[currency as keyof typeof CURRENCIES] || CURRENCIES.TRY;

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  // Staggered card entrance animations
  const card1Anim = useRef(new Animated.Value(0)).current;
  const card2Anim = useRef(new Animated.Value(0)).current;
  const card3Anim = useRef(new Animated.Value(0)).current;
  const card1Slide = useRef(new Animated.Value(30)).current;
  const card2Slide = useRef(new Animated.Value(30)).current;
  const card3Slide = useRef(new Animated.Value(30)).current;

  // Score count-up
  const [displayScore, setDisplayScore] = useState(0);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 50, friction: 10, useNativeDriver: true }),
    ]).start();

    // Staggered card entries
    Animated.stagger(120, [
      Animated.parallel([
        Animated.timing(card1Anim, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.spring(card1Slide, { toValue: 0, tension: 60, friction: 12, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(card2Anim, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.spring(card2Slide, { toValue: 0, tension: 60, friction: 12, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(card3Anim, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.spring(card3Slide, { toValue: 0, tension: 60, friction: 12, useNativeDriver: true }),
      ]),
    ]).start();

    recordLogin();
  }, []);

  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      await syncData();
    } catch (e) {
      console.log('Refresh error:', e);
    }
    setRefreshing(false);
  }, [syncData]);

  useEffect(() => {
    // Streak achievements
    if (streakCount >= 3 && !achievements.includes('streak_3')) unlockAchievement('streak_3');
    if (streakCount >= 7 && !achievements.includes('streak_7')) {
      unlockAchievement('streak_7');
      // Prompt for review on day 7 streak
      setTimeout(async () => {
        try {
          if (await StoreReview.hasAction()) {
            await StoreReview.requestReview();
          }
        } catch (e) { console.error(e); }
      }, 2000);
    }
    if (streakCount >= 30 && !achievements.includes('streak_30')) unlockAchievement('streak_30');
    if (streakCount >= 90 && !achievements.includes('streak_90')) unlockAchievement('streak_90');
    if (streakCount >= 365 && !achievements.includes('streak_365')) unlockAchievement('streak_365');

    // Pro & content-based achievements
    if (isPro && !achievements.includes('pro_user')) unlockAchievement('pro_user');
    if (subscriptions.length > 0 && !achievements.includes('first_sub')) unlockAchievement('first_sub');
    if (tasks.length > 0 && !achievements.includes('first_task')) unlockAchievement('first_task');
    if (subscriptions.length >= 5 && !achievements.includes('subs_5')) unlockAchievement('subs_5');

    // Task completion count
    const completedTasks = tasks.filter(t2 => t2.isCompleted).length;
    if (completedTasks >= 10 && !achievements.includes('tasks_10')) unlockAchievement('tasks_10');

    // Budget set achievement
    if (monthlyBudget > 0 && !achievements.includes('budgeter')) unlockAchievement('budgeter');
  }, [streakCount, isPro, subscriptions.length, tasks, achievements, monthlyBudget]);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? t.greeting.morning : hour < 18 ? t.greeting.afternoon : t.greeting.evening;

  const totalMonthly = subscriptions.reduce((sum: number, s: Subscription) => {
    return sum + (s.billingCycle === 'yearly' ? s.amount / 12 : s.amount);
  }, 0);

  const paidSubs = subscriptions.filter((s: Subscription) => s.isPaid).length;
  const paymentScore = subscriptions.length > 0 ? (paidSubs / subscriptions.length) * 40 : 0;
  const completedTasks = tasks.filter((t: Task) => t.isCompleted).length;
  const taskScore = tasks.length > 0 ? (completedTasks / tasks.length) * 40 : 0;
  const budgetScore = monthlyBudget > 0 ? (totalMonthly <= monthlyBudget ? 10 : Math.max(0, 10 - ((totalMonthly - monthlyBudget) / monthlyBudget) * 10)) : 0;
  const streakScore = Math.min(10, streakCount * 2);
  const lifeScore = Math.round(paymentScore + taskScore + budgetScore + streakScore);

  const getScoreColor = (score: number) => {
    if (score >= 90) return '#3b82f6'; // excellent
    if (score >= 70) return '#10B981'; // good
    if (score >= 40) return '#F59E0B'; // avg
    return '#EF4444'; // poor
  };
  const scoreColor = getScoreColor(lifeScore);

  // Score count-up animation
  useEffect(() => {
    let frame = 0;
    const totalFrames = 30;
    const step = lifeScore / totalFrames;
    const timer = setInterval(() => {
      frame++;
      if (frame >= totalFrames) {
        setDisplayScore(lifeScore);
        clearInterval(timer);
      } else {
        setDisplayScore(Math.round(step * frame));
      }
    }, 33);
    return () => clearInterval(timer);
  }, [lifeScore]);

  const totalItems = subscriptions.length + tasks.length;

  const now = new Date();
  const upcoming = [
    ...tasks.filter(t_ => !t_.isCompleted).map(t_ => ({
      id: t_.id, title: t_.title, date: t_.dueDate, kind: 'responsibility' as const,
      isRecurring: t_.isRecurring,
    })),
    ...subscriptions.map(s => ({
      id: s.id, title: s.name, date: s.nextBillingDate, kind: 'payment' as const, amount: s.amount,
    })),
  ]
    .filter(item => {
      const diff = Math.ceil((new Date(item.date).getTime() - now.getTime()) / 86400000);
      return diff >= -1 && diff <= 30;
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 5);

  const getDaysLabel = (date: string) => {
    const diff = Math.ceil((new Date(date).getTime() - now.getTime()) / 86400000);
    if (diff < 0) return t.home.overdue;
    if (diff === 0) return t.home.today;
    if (diff === 1) return t.home.tomorrow;
    return t.home.inDays.replace('{days}', diff.toString());
  };

  const topCategory = subscriptions.reduce<{ name: string; total: number } | null>((best, sub) => {
    const monthlyAmt = sub.billingCycle === 'yearly' ? sub.amount / 12 : sub.amount;
    if (!best || monthlyAmt > best.total) return { name: sub.name, total: monthlyAmt };
    return best;
  }, null);

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  return (
    <View style={[s.container, { backgroundColor: c.base }]}>
      <StatusBar barStyle={c.statusBarStyle} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 140 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={c.emerald}
            colors={[c.emerald]}
            progressBackgroundColor={c.card}
          />
        }
      >
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
          <View style={s.heroContainer}>
            <View style={{ flex: 1 }}>
              <Text style={[s.greeting, { color: c.subtle }]}>{greeting},</Text>
              <Text style={[s.userName, { color: c.offWhite }]} numberOfLines={1}>{user?.name || 'Luxtra'}</Text>
              <View style={s.streakRow}>
                <Text style={s.streakEmoji}>{streakCount >= 3 ? '🔥' : '🌱'}</Text>
                <Text style={[s.streakText, { color: c.muted }]}>
                  {streakCount} {isTR ? 'Günlük Seri' : 'Day Streak'}
                </Text>
              </View>
            </View>
            <View style={s.scoreContainer}>
              <View style={[s.scoreRing, { borderColor: scoreColor }]}>
                <Text style={[s.scoreValue, { color: scoreColor }]}>{displayScore}</Text>
              </View>
              <Text style={[s.scoreLabel, { color: c.subtle }]}>{isTR ? 'Luxtra Skoru' : 'Luxtra Score'}</Text>
            </View>
          </View>

          <View style={s.quickActions}>
            <TouchableOpacity style={[s.quickBtn, { backgroundColor: c.card, borderColor: c.cardBorder }]} onPress={() => { handlePress(); router.push('/add-subscription'); }}>
              <Text style={s.quickBtnIcon}>💳</Text>
              <Text style={[s.quickBtnLabel, { color: c.subtle }]}>{isTR ? 'Abonelik' : 'Sub'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[s.quickBtn, { backgroundColor: c.card, borderColor: c.cardBorder }]} onPress={() => { handlePress(); router.push('/add-responsibility' as any); }}>
              <Text style={s.quickBtnIcon}>📌</Text>
              <Text style={[s.quickBtnLabel, { color: c.subtle }]}>{isTR ? 'Görev' : 'Task'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[s.quickBtn, { backgroundColor: c.card, borderColor: c.cardBorder }]} onPress={() => { handlePress(); router.push('/ai-insights' as any); }}>
              <Brain size={22} color={c.emerald} />
              <Text style={[s.quickBtnLabel, { color: c.subtle }]}>AI</Text>
            </TouchableOpacity>
          </View>

          {/* Top category insight with staggered animation */}
          <Animated.View style={{ opacity: card1Anim, transform: [{ translateY: card1Slide }] }}>
            {topCategory ? (
              <View style={[s.trackCard, { backgroundColor: c.card, borderColor: c.cardBorder }]}>
                <View style={s.trackRow}>
                  <View style={[s.trackIcon, { backgroundColor: c.emerald + '15' }]}>
                    <Text style={{ fontSize: 22 }}>💡</Text>
                  </View>
                  <View style={{ flex: 1, marginRight: 8 }}>
                    <Text style={[s.trackTitle, { color: c.offWhite }]} numberOfLines={1}>
                      {isTR ? 'En Büyük Harcama' : 'Biggest Expense'}
                    </Text>
                    <Text style={[s.trackSub, { color: c.subtle }]} numberOfLines={1}>
                      {topCategory.name} ({curr.symbol}{topCategory.total.toFixed(2)}/{isTR ? 'ay' : 'mo'})
                    </Text>
                  </View>
                  <TouchableOpacity onPress={() => { handlePress(); router.push('/ai-insights' as any); }} style={[s.trackBadge, { backgroundColor: c.emerald + '18' }]}>
                    <Text style={[s.trackBadgeText, { color: c.emerald }]}>{isTR ? 'Analiz Et' : 'Analyze'}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <View style={[s.trackCard, { backgroundColor: c.card, borderColor: c.cardBorder }]}>
                <View style={s.trackRow}>
                  <View style={[s.trackIcon, { backgroundColor: c.emerald + '15' }]}>
                    <Shield size={20} color={c.emerald} />
                  </View>
                  <View style={{ flex: 1, marginRight: 8 }}>
                    <Text style={[s.trackTitle, { color: c.offWhite }]} numberOfLines={1}>
                      {t.home.trackingItems.replace('{count}', totalItems.toString())}
                    </Text>
                    <Text style={[s.trackSub, { color: c.subtle }]} numberOfLines={1}>
                      {subscriptions.length} {t.home.subscriptions.toLowerCase()} · {tasks.length} {t.home.responsibilities.toLowerCase()}
                    </Text>
                  </View>
                  <View style={[s.trackBadge, { backgroundColor: c.emerald + '18' }]}>
                    <Text style={[s.trackBadgeText, { color: c.emerald }]}>{t.home.onTrack}</Text>
                  </View>
                </View>
              </View>
            )}
          </Animated.View>

          <Animated.View style={{ opacity: card2Anim, transform: [{ translateY: card2Slide }] }}>
            <SpendingCard
              totalMonthly={totalMonthly}
              monthlyBudget={monthlyBudget}
              isPro={isPro}
              currencySymbol={curr.symbol}
              labels={{
                monthlySpending: t.home.monthlySpending,
                details: t.home.details,
                overBudget: t.home.overBudget,
                remaining: t.home.remaining,
                budget: t.home.budget,
              }}
              onPress={() => { handlePress(); router.push('/(tabs)/spending'); }}
              colors={c}
              subscriptions={subscriptions}
            />
          </Animated.View>

          <Animated.View style={{ opacity: card3Anim, transform: [{ translateY: card3Slide }] }}>
            <View style={s.sectionHeader}>
              <Text style={[s.sectionTitle, { color: c.offWhite }]}>{t.home.comingUp}</Text>
              <TouchableOpacity onPress={() => { handlePress(); router.push('/(tabs)/timeline'); }}>
                <Text style={[s.seeAll, { color: c.emerald }]}>{t.home.seeAll}</Text>
              </TouchableOpacity>
            </View>

            {upcoming.length > 0 ? (
              upcoming.map(item => {
                const d = new Date(item.date);
                const diff = Math.ceil((d.getTime() - now.getTime()) / 86400000);
                return (
                  <UpcomingItem
                    key={`${item.kind}-${item.id}`}
                    item={item}
                    daysLabel={getDaysLabel(item.date)}
                    isOverdue={diff < 0}
                    isToday={diff === 0}
                    currencySymbol={curr.symbol}
                    onPress={() => {
                      handlePress();
                      if (item.kind === 'payment') router.push(`/subscription/${item.id}`);
                    }}
                    colors={c}
                  />
                );
              })
            ) : (
              <View style={[s.emptyCard, { backgroundColor: c.card, borderColor: c.cardBorder }]}>
                <Text style={{ fontSize: 24 }}>🎯</Text>
                <Text style={[s.emptyTitle, { color: c.offWhite }]}>{t.home.allClear}</Text>
                <Text style={[s.emptySub, { color: c.subtle }]}>{t.home.nothingComing}</Text>
              </View>
            )}

            {/* Replaced with the Top Category banner above */}

            {!isPro && (
              <TouchableOpacity
                style={[s.upgradeCard, { backgroundColor: c.emerald + '10', borderColor: c.emerald + '25' }]}
                activeOpacity={0.8}
                onPress={() => { handlePress(); router.push('/modal'); }}
              >
                <View style={[s.upgradeIcon, { backgroundColor: c.emerald + '20' }]}>
                  <Crown size={22} color={c.emerald} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[s.upgradeTitle, { color: c.emerald }]}>
                    {isTR ? 'Pro\'ya Yükselt' : 'Upgrade to Pro'}
                  </Text>
                  <Text style={[s.upgradeSub, { color: c.subtle }]}>
                    {isTR
                      ? `${FREE_LIMITS.maxSubscriptions} abonelik · ${FREE_LIMITS.maxResponsibilities} sorumluluk limiti kaldır`
                      : `Remove ${FREE_LIMITS.maxSubscriptions} sub · ${FREE_LIMITS.maxResponsibilities} task limits`}
                  </Text>
                </View>
                <ArrowRight size={18} color={c.emerald} />
              </TouchableOpacity>
            )}
          </Animated.View>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === 'ios' ? 60 : 44,
    paddingHorizontal: 20,
  },
  heroContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  greeting: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  userName: {
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  streakRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
  },
  streakEmoji: {
    fontSize: 14,
  },
  streakText: {
    fontSize: 13,
    fontWeight: '600',
  },
  scoreContainer: {
    alignItems: 'center',
  },
  scoreRing: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 3,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  scoreValue: {
    fontSize: 18,
    fontWeight: '800',
  },
  scoreLabel: {
    fontSize: 10,
    fontWeight: '700',
  },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  quickBtn: {
    flex: 1,
    height: 66,
    borderRadius: 16,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
  },
  quickBtnIcon: {
    fontSize: 22,
  },
  quickBtnLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },

  /* Track Card */
  trackCard: {
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
  },
  trackRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  trackIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  trackTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  trackSub: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
  trackBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  trackBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },

  /* Spending Card */
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

  /* Budget */
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

  /* Section */
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  seeAll: {
    fontSize: 13,
    fontWeight: '600',
  },

  /* Upcoming */
  upcomingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: 14,
    marginBottom: 8,
    borderWidth: 1,
  },
  upcomingTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  upcomingDate: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  upcomingAmount: {
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

  /* Empty */
  emptyCard: {
    alignItems: 'flex-start',
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    gap: 4,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  emptySub: {
    fontSize: 13,
  },

  /* Insight */
  insightCard: {
    borderRadius: 16,
    padding: 18,
    marginBottom: 20,
    borderWidth: 1,
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  insightTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  insightBody: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
    marginBottom: 14,
  },
  insightBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
  },
  insightBtnText: {
    fontSize: 14,
    fontWeight: '700',
  },

  /* Upgrade banner */
  upgradeCard: { flexDirection: 'row', alignItems: 'center', borderRadius: 16, padding: 18, borderWidth: 1, gap: 14, marginBottom: 20, marginTop: 12 },
  upgradeIcon: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center' },
  upgradeTitle: { fontSize: 15, fontWeight: '700', marginBottom: 2 },
  upgradeSub: { fontSize: 12, fontWeight: '500' },
});