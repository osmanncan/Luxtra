import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import {
  AlertTriangle,
  BarChart3,
  CreditCard,
  Plus,
  Search,
  TrendingDown,
  TrendingUp,
} from 'lucide-react-native';
import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  FlatList,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SpendingInsight } from '../../src/components/spending/SpendingInsight';
import { SubscriptionItem } from '../../src/components/spending/SubscriptionItem';
import { SummaryCard } from '../../src/components/spending/SummaryCard';
import { UpcomingPayment } from '../../src/components/spending/UpcomingPayment';
import SwipeableRow from '../../src/components/SwipeableRow';
import { FREE_LIMITS } from '../../src/store/proFeatures';
import { useThemeColors } from '../../src/store/theme';
import { translations } from '../../src/store/translations';
import { CURRENCIES, SUB_CATEGORIES, useStore } from '../../src/store/useStore';

export default function SpendingScreen() {
  const router = useRouter();
  const { subscriptions, language, currency, removeSubscription, markSubscriptionPaid, monthlyBudget, user } = useStore();
  const isPro = user?.isPro ?? false;
  const c = useThemeColors();
  const t = translations[language].spending;
  const isTR = language === 'tr';
  const curr = CURRENCIES[currency] || CURRENCIES.TRY;

  const [searchQuery, setSearchQuery] = useState('');

  const fadeAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
  }, []);

  const filteredSubs = searchQuery.trim()
    ? subscriptions.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.category.toLowerCase().includes(searchQuery.toLowerCase()))
    : subscriptions;

  const totalMonthly = subscriptions
    .filter(s => s.billingCycle === 'monthly')
    .reduce((a, c_) => a + c_.amount, 0);
  const totalYearly = subscriptions
    .filter(s => s.billingCycle === 'yearly')
    .reduce((a, c_) => a + c_.amount, 0);
  const totalAll = totalMonthly + totalYearly / 12;
  const annualized = totalMonthly * 12 + totalYearly;

  const categories = Object.entries(
    subscriptions.reduce<Record<string, { total: number; count: number }>>((acc, sub) => {
      const monthlyAmt = sub.billingCycle === 'yearly' ? sub.amount / 12 : sub.amount;
      if (!acc[sub.category]) acc[sub.category] = { total: 0, count: 0 };
      acc[sub.category].total += monthlyAmt;
      acc[sub.category].count += 1;
      return acc;
    }, {})
  ).sort((a, b) => b[1].total - a[1].total);

  const upcomingPayments = subscriptions
    .filter(s => {
      const diff = Math.ceil((new Date(s.nextBillingDate).getTime() - Date.now()) / 86400000);
      return diff >= 0 && diff <= 7;
    })
    .sort((a, b) => new Date(a.nextBillingDate).getTime() - new Date(b.nextBillingDate).getTime());

  const getDaysLeft = (date: string) => {
    const diff = Math.ceil((new Date(date).getTime() - Date.now()) / 86400000);
    const ht = translations[language].home;
    if (diff === 0) return ht.today;
    if (diff === 1) return ht.tomorrow;
    return ht.inDays.replace('{days}', diff.toString());
  };

  const handleDelete = (id: string, name: string) => {
    Alert.alert(
      isTR ? 'Aboneliği Sil' : 'Delete Subscription',
      isTR ? `${name} aboneliğini silmek istediğinden emin misin?` : `Are you sure you want to delete ${name}?`,
      [
        { text: isTR ? 'İptal' : 'Cancel', style: 'cancel' },
        { text: isTR ? 'Sil' : 'Delete', style: 'destructive', onPress: () => removeSubscription(id) },
      ]
    );
  };

  const handleMarkPaid = (id: string) => {
    markSubscriptionPaid(id);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  return (
    <View style={[s.container, { backgroundColor: c.base }]}>
      <StatusBar barStyle={c.statusBarStyle} />

      <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
        <View style={s.header}>
          <View>
            <Text style={[s.headerLabel, { color: c.subtle }]}>{t.recurringSpending}</Text>
            <Text style={[s.headerTitle, { color: c.offWhite }]}>{t.yourSubscriptions}</Text>
          </View>
          <TouchableOpacity
            style={[s.addBtn, { backgroundColor: c.emerald }]}
            activeOpacity={0.8}
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.push('/add-subscription'); }}
          >
            <Plus size={20} color="#F1F5F9" strokeWidth={2.5} />
          </TouchableOpacity>
        </View>

        <FlatList
          data={filteredSubs}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 140 }}
          ListHeaderComponent={
            <View>
              <SummaryCard
                totalAll={totalAll}
                annualized={annualized}
                monthlyBudget={monthlyBudget}
                isPro={isPro}
                currencySymbol={curr.symbol}
                labels={{
                  monthlyTotal: t.monthlyTotal,
                  perYear: t.perYear,
                  budget: translations[language].home.budget,
                }}
                colors={c}
                subscriptions={subscriptions}
                categories={categories}
              />

              <View style={s.analyticsContainer}>
                <Text style={[s.sectionLabel, { color: c.subtle }]}>{t.insightsTitle}</Text>
                <View style={s.insightsRow}>
                  <SpendingInsight
                    icon={totalAll > 1000 ? TrendingUp : TrendingDown}
                    iconColor={totalAll > 1000 ? c.red : c.emerald}
                    bgColor={totalAll > 1000 ? c.red + '15' : c.emerald + '15'}
                    value={totalAll > 1000 ? '+12.4%' : '-5.2%'}
                    description={totalAll > 1000 ? t.trendMore.replace('{percent}', '12.4') : t.trendLess.replace('{percent}', '5.2')}
                    colors={c}
                  />

                  {categories.length > 0 && (
                    <SpendingInsight
                      icon={BarChart3}
                      iconColor={c.amber}
                      bgColor={c.amber + '15'}
                      value={`${SUB_CATEGORIES[categories[0][0]]?.emoji || '💰'} ${categories[0][0]}`}
                      description={t.categoryTrend.replace('{category}', categories[0][0])}
                      colors={c}
                    />
                  )}
                </View>
              </View>

              {upcomingPayments.length > 0 && (
                <View style={[s.upcomingSection, { backgroundColor: c.card, borderColor: c.amber + '25' }]}>
                  <View style={s.upcomingHeader}>
                    <AlertTriangle size={14} color={c.amber} />
                    <Text style={[s.upcomingTitle, { color: c.amber }]}>{t.upcomingPayments}</Text>
                  </View>
                  {upcomingPayments.map(sub => (
                    <UpcomingPayment
                      key={sub.id}
                      emoji={SUB_CATEGORIES[sub.category]?.emoji || '💳'}
                      name={sub.name}
                      daysLeft={getDaysLeft(sub.nextBillingDate)}
                      amount={`${curr.symbol}${sub.amount.toFixed(2)}`}
                      colors={c}
                    />
                  ))}
                </View>
              )}

              <View style={[s.searchWrap, { backgroundColor: c.card, borderColor: c.cardBorder }]}>
                <Search size={16} color={c.dim} />
                <TextInput
                  style={[s.searchInput, { color: c.offWhite }]}
                  placeholder={t.searchPlaceholder}
                  placeholderTextColor={c.dim}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
              </View>

              {!isPro && (
                <View style={[s.slotBanner, { backgroundColor: c.amber + '10', borderColor: c.amber + '25' }]}>
                  <Text style={[s.slotText, { color: c.amber }]}>
                    {isTR
                      ? `${subscriptions.length}/${FREE_LIMITS.maxSubscriptions} abonelik kullanıldı`
                      : `${subscriptions.length}/${FREE_LIMITS.maxSubscriptions} subscriptions used`}
                  </Text>
                  <TouchableOpacity onPress={() => router.push('/modal')}>
                    <Text style={[s.slotUpgrade, { color: c.emerald }]}>
                      {isTR ? 'Sınırsız yap →' : 'Go Unlimited →'}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}

              <Text style={[s.swipeHint, { color: c.dim }]}>
                ← {isTR ? 'Silmek için sola kaydır' : 'Swipe left to delete'}
              </Text>

              <Text style={[s.listHeader, { color: c.offWhite }]}>{t.allSubscriptions}</Text>
            </View>
          }
          renderItem={({ item }) => (
            <SwipeableRow onDelete={() => handleDelete(item.id, item.name)} deleteColor={c.red}>
              <SubscriptionItem
                item={item}
                isTR={isTR}
                currencySymbol={curr.symbol}
                onPress={() => router.push(`/subscription/${item.id}`)}
                onMarkPaid={() => handleMarkPaid(item.id)}
                colors={c}
              />
            </SwipeableRow>
          )}
          ListEmptyComponent={
            <View style={[s.empty, { backgroundColor: c.card, borderColor: c.cardBorder }]}>
              <CreditCard size={32} color={c.dim} />
              <Text style={[s.emptyTitle, { color: c.offWhite }]}>{t.noSubscriptions}</Text>
              <Text style={[s.emptySub, { color: c.subtle }]}>{t.addToTrack}</Text>
              <TouchableOpacity style={s.emptyBtn} onPress={() => router.push('/add-subscription')}>
                <Plus size={16} color="#0F1419" />
                <Text style={s.emptyBtnText}>{t.addSubscription}</Text>
              </TouchableOpacity>
            </View>
          }
        />
      </Animated.View>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, paddingTop: Platform.OS === 'ios' ? 60 : 44 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 20, marginTop: 4 },
  headerLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 1.2, marginBottom: 4 },
  headerTitle: { fontSize: 22, fontWeight: '700', letterSpacing: -0.3 },
  addBtn: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },

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

  /* Analytics */
  analyticsContainer: { marginBottom: 24 },
  sectionLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 1.2, marginBottom: 12, textTransform: 'uppercase' },
  insightsRow: { gap: 10 },
  insightSmallCard: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 16, borderWidth: 1, gap: 12 },
  insightIconCircle: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  insightValue: { fontSize: 15, fontWeight: '700' },
  insightDesc: { fontSize: 12, fontWeight: '500', marginTop: 1 },

  upcomingSection: { borderRadius: 16, borderWidth: 1, padding: 16, marginBottom: 16 },
  upcomingHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  upcomingTitle: { fontSize: 13, fontWeight: '700' },
  upcomingItem: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8, borderTopWidth: 1 },
  upcomingName: { fontSize: 14, fontWeight: '600' },
  upcomingDate: { fontSize: 11, fontWeight: '600', marginTop: 2 },
  upcomingAmount: { fontSize: 15, fontWeight: '700' },

  searchWrap: { flexDirection: 'row', alignItems: 'center', borderRadius: 12, paddingHorizontal: 14, height: 44, gap: 10, borderWidth: 1, marginBottom: 12 },
  searchInput: { flex: 1, fontSize: 14, fontWeight: '500' },
  swipeHint: { fontSize: 11, fontWeight: '500', textAlign: 'right', marginBottom: 8 },
  listHeader: { fontSize: 16, fontWeight: '700', marginBottom: 12 },

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

  empty: { alignItems: 'center', paddingVertical: 50, borderRadius: 20, borderWidth: 1, gap: 8 },
  emptyTitle: { fontSize: 16, fontWeight: '700', marginTop: 8 },
  emptySub: { fontSize: 13, marginBottom: 12 },
  emptyBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#F1F5F9', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12 },
  emptyBtnText: { color: '#0F1419', fontSize: 14, fontWeight: '700' },

  /* Slot counter */
  slotBanner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderRadius: 12, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 10, marginBottom: 12 },
  slotText: { fontSize: 12, fontWeight: '700' },
  slotUpgrade: { fontSize: 12, fontWeight: '700' },
});
