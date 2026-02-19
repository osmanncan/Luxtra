import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import {
  AlertTriangle,
  ArrowRight,
  Brain,
  ChevronRight,
  Crown,
  Shield,
} from 'lucide-react-native';
import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { FREE_LIMITS } from '../../src/store/proFeatures';
import { useThemeColors } from '../../src/store/theme';
import { translations } from '../../src/store/translations';
import { CURRENCIES, SUB_CATEGORIES, useStore } from '../../src/store/useStore';

export default function OverviewScreen() {
  const router = useRouter();
  const { subscriptions, tasks, user, language, currency, monthlyBudget } = useStore();
  const isPro = user?.isPro ?? false;
  const c = useThemeColors();
  const t = translations[language];
  const isTR = language === 'tr';
  const curr = CURRENCIES[currency] || CURRENCIES.TRY;

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 50, friction: 10, useNativeDriver: true }),
    ]).start();
  }, []);

  // Greeting
  const hour = new Date().getHours();
  const greeting = hour < 12 ? t.greeting.morning : hour < 18 ? t.greeting.afternoon : t.greeting.evening;

  // Monthly spending
  const totalMonthly = subscriptions.reduce((sum, s) => {
    return sum + (s.billingCycle === 'yearly' ? s.amount / 12 : s.amount);
  }, 0);

  const totalItems = subscriptions.length + tasks.length;

  // Budget progress
  const budgetPct = monthlyBudget > 0 ? Math.min((totalMonthly / monthlyBudget) * 100, 100) : 0;
  const isOverBudget = monthlyBudget > 0 && totalMonthly > monthlyBudget;

  // Upcoming items (next 7 days)
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
      return diff >= -1 && diff <= 7;
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

  // Top spending category
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

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
          {/* Header */}
          <View style={s.header}>
            <View>
              <Text style={[s.greeting, { color: c.subtle }]}>{greeting}</Text>
              <Text style={[s.userName, { color: c.offWhite }]}>{user?.name || 'LifeOS'}</Text>
            </View>
            <TouchableOpacity
              style={[s.aiBtn, { backgroundColor: c.card, borderColor: c.cardBorder }]}
              onPress={() => { handlePress(); router.push('/ai-insights' as any); }}
              activeOpacity={0.7}
            >
              <Brain size={20} color={c.emerald} />
            </TouchableOpacity>
          </View>

          {/* Tracking Summary */}
          <View style={[s.trackCard, { backgroundColor: c.card, borderColor: c.cardBorder }]}>
            <View style={s.trackRow}>
              <View style={[s.trackIcon, { backgroundColor: c.emerald + '15' }]}>
                <Shield size={20} color={c.emerald} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[s.trackTitle, { color: c.offWhite }]}>
                  {t.home.trackingItems.replace('{count}', totalItems.toString())}
                </Text>
                <Text style={[s.trackSub, { color: c.subtle }]}>
                  {subscriptions.length} {t.home.subscriptions.toLowerCase()} · {tasks.length} {t.home.responsibilities.toLowerCase()}
                </Text>
              </View>
              <View style={[s.trackBadge, { backgroundColor: c.emerald + '18' }]}>
                <Text style={[s.trackBadgeText, { color: c.emerald }]}>{t.home.onTrack}</Text>
              </View>
            </View>
          </View>

          {/* ── SPENDING CARD ── */}
          <TouchableOpacity
            style={[s.spendCard, { backgroundColor: c.card, borderColor: c.cardBorder }]}
            activeOpacity={0.7}
            onPress={() => { handlePress(); router.push('/(tabs)/spending'); }}
          >
            <Text style={[s.spendLabel, { color: c.subtle }]}>{t.home.monthlySpending}</Text>
            <View style={s.spendRow}>
              <Text style={[s.spendAmount, { color: c.offWhite }]}>
                {curr.symbol}{totalMonthly.toFixed(2)}
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Text style={[s.spendDetails, { color: c.emerald }]}>{t.home.details}</Text>
                <ChevronRight size={14} color={c.emerald} />
              </View>
            </View>

            {/* Budget Progress — Pro only */}
            {monthlyBudget > 0 && isPro && (
              <View style={s.budgetSection}>
                <View style={[s.budgetBar, { backgroundColor: c.cardBorder }]}>
                  <View
                    style={[
                      s.budgetFill,
                      {
                        width: `${budgetPct}%`,
                        backgroundColor: isOverBudget ? c.red : c.emerald,
                      },
                    ]}
                  />
                </View>
                <View style={s.budgetMeta}>
                  <Text style={[s.budgetText, { color: isOverBudget ? c.red : c.subtle }]}>
                    {isOverBudget ? t.home.overBudget : `${curr.symbol}${(monthlyBudget - totalMonthly).toFixed(0)} ${t.home.remaining}`}
                  </Text>
                  <Text style={[s.budgetTarget, { color: c.dim }]}>
                    {t.home.budget}: {curr.symbol}{monthlyBudget.toFixed(0)}
                  </Text>
                </View>
              </View>
            )}

            {/* Category breakdown mini */}
            <View style={s.catRow}>
              {subscriptions.slice(0, 4).map(sub => {
                const cat = SUB_CATEGORIES[sub.category] ?? SUB_CATEGORIES.General;
                const pct = totalMonthly > 0 ? ((sub.billingCycle === 'yearly' ? sub.amount / 12 : sub.amount) / totalMonthly * 100) : 0;
                return (
                  <View key={sub.id} style={[s.catPill, { backgroundColor: c.cardBorder }]}>
                    <Text style={{ fontSize: 12 }}>{cat.emoji}</Text>
                    <Text style={[s.catPct, { color: c.muted }]}>{pct.toFixed(0)}%</Text>
                  </View>
                );
              })}
            </View>
          </TouchableOpacity>

          {/* ── UPCOMING ── */}
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
              const isOverdue = diff < 0;
              const isToday = diff === 0;

              return (
                <TouchableOpacity
                  key={`${item.kind}-${item.id}`}
                  style={[s.upcomingCard, { backgroundColor: c.card, borderColor: isOverdue ? c.red + '40' : isToday ? c.amber + '40' : c.cardBorder }]}
                  activeOpacity={0.7}
                  onPress={() => {
                    handlePress();
                    if (item.kind === 'payment') router.push(`/subscription/${item.id}`);
                  }}
                >
                  <Text style={{ fontSize: 16 }}>
                    {item.kind === 'payment' ? '💳' : '📌'}
                  </Text>
                  <View style={{ flex: 1 }}>
                    <Text style={[s.upcomingTitle, { color: c.offWhite }]}>{item.title}</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Text style={[s.upcomingDate, { color: isOverdue ? c.red : isToday ? c.amber : c.subtle }]}>
                        {getDaysLabel(item.date)}
                      </Text>
                      {'isRecurring' in item && item.isRecurring && (
                        <View style={[s.recurBadge, { backgroundColor: c.blue + '15' }]}>
                          <Text style={[s.recurText, { color: c.blue }]}>↻</Text>
                        </View>
                      )}
                    </View>
                  </View>
                  {'amount' in item && (
                    <Text style={[s.upcomingAmount, { color: c.offWhite }]}>
                      {curr.symbol}{(item as any).amount.toFixed(2)}
                    </Text>
                  )}
                  {isOverdue && <AlertTriangle size={16} color={c.red} />}
                </TouchableOpacity>
              );
            })
          ) : (
            <View style={[s.emptyCard, { backgroundColor: c.card, borderColor: c.cardBorder }]}>
              <Text style={{ fontSize: 24 }}>🎯</Text>
              <Text style={[s.emptyTitle, { color: c.offWhite }]}>{t.home.allClear}</Text>
              <Text style={[s.emptySub, { color: c.subtle }]}>{t.home.nothingComing}</Text>
            </View>
          )}

          {/* ── SMART INSIGHT ── */}
          {topCategory && (
            <View style={[s.insightCard, { backgroundColor: c.emerald + '08', borderColor: c.emerald + '20' }]}>
              <View style={s.insightHeader}>
                <Brain size={16} color={c.emerald} />
                <Text style={[s.insightTitle, { color: c.emerald }]}>{t.home.smartInsight}</Text>
              </View>
              <Text style={[s.insightBody, { color: c.muted }]}>
                {t.home.biggestSpend} <Text style={{ fontWeight: '700', color: c.offWhite }}>{topCategory.name}</Text> ({curr.symbol}{topCategory.total.toFixed(2)}/{isTR ? 'ay' : 'mo'}). {t.home.willNotify}
              </Text>
              <TouchableOpacity
                style={s.insightBtn}
                activeOpacity={0.7}
                onPress={() => { handlePress(); router.push('/ai-insights' as any); }}
              >
                <Text style={[s.insightBtnText, { color: c.emerald }]}>
                  {isTR ? 'Daha fazla öneri al' : 'Get more insights'}
                </Text>
                <ArrowRight size={14} color={c.emerald} />
              </TouchableOpacity>
            </View>
          )}

          {/* ── UPGRADE BANNER (Free users only) ── */}
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
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === 'ios' ? 64 : 48,
    paddingHorizontal: 20,
  },
  header: {
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
  aiBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
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
    alignItems: 'center',
    padding: 32,
    borderRadius: 16,
    borderWidth: 1,
    gap: 6,
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
    marginTop: 16,
    borderWidth: 1,
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  insightTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  insightBody: {
    fontSize: 13,
    lineHeight: 20,
    fontWeight: '500',
    marginBottom: 12,
  },
  insightBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  insightBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },

  /* Upgrade banner */
  upgradeCard: { flexDirection: 'row', alignItems: 'center', borderRadius: 16, padding: 18, borderWidth: 1, gap: 14, marginBottom: 20 },
  upgradeIcon: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center' },
  upgradeTitle: { fontSize: 15, fontWeight: '700', marginBottom: 2 },
  upgradeSub: { fontSize: 12, fontWeight: '500' },
});