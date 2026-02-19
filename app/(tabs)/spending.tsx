import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import {
  AlertTriangle,
  Check,
  CreditCard,
  Plus,
  Search,
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
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 120 }}
          ListHeaderComponent={
            <View>
              {/* Spending Card */}
              <View style={[s.spendCard, { backgroundColor: c.card, borderColor: c.cardBorder }]}>
                <View style={s.spendAmountRow}>
                  <View>
                    <Text style={[s.spendLabel, { color: c.subtle }]}>{t.monthlyTotal}</Text>
                    <Text style={[s.spendAmount, { color: c.offWhite }]}>{curr.symbol}{totalAll.toFixed(2)}</Text>
                  </View>
                  <View style={s.spendRight}>
                    <Text style={[s.spendLabel, { color: c.subtle }]}>{t.perYear}</Text>
                    <Text style={[s.spendAnnual, { color: c.muted }]}>{curr.symbol}{annualized.toFixed(0)}</Text>
                  </View>
                </View>

                {/* Budget Progress — Pro only */}
                {monthlyBudget > 0 && isPro && (
                  <View style={s.budgetRow}>
                    <View style={[s.budgetBar, { backgroundColor: c.cardBorder }]}>
                      <View style={[s.budgetFill, {
                        width: `${Math.min((totalAll / monthlyBudget) * 100, 100)}%`,
                        backgroundColor: totalAll > monthlyBudget ? c.red : c.emerald,
                      }]} />
                    </View>
                    <Text style={[s.budgetLabel, { color: totalAll > monthlyBudget ? c.red : c.subtle }]}>
                      {curr.symbol}{totalAll.toFixed(0)} / {curr.symbol}{monthlyBudget.toFixed(0)}
                    </Text>
                  </View>
                )}

                {/* Bar Chart */}
                <View style={[s.barContainer, { backgroundColor: c.cardBorder }]}>
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
                      <View key={cat} style={[s.catPill, { backgroundColor: c.cardBorder }]}>
                        <View style={[s.catDot, { backgroundColor: catConfig.colors[0] }]} />
                        <Text style={[s.catText, { color: c.muted }]}>{catConfig.emoji} {cat}</Text>
                        <Text style={[s.catAmount, { color: c.offWhite }]}>{curr.symbol}{data.total.toFixed(0)}</Text>
                      </View>
                    );
                  })}
                </View>
              </View>

              {/* Upcoming */}
              {upcomingPayments.length > 0 && (
                <View style={[s.upcomingSection, { backgroundColor: c.card, borderColor: c.amber + '25' }]}>
                  <View style={s.upcomingHeader}>
                    <AlertTriangle size={14} color={c.amber} />
                    <Text style={[s.upcomingTitle, { color: c.amber }]}>{t.upcomingPayments}</Text>
                  </View>
                  {upcomingPayments.map(sub => {
                    const cat = SUB_CATEGORIES[sub.category] ?? SUB_CATEGORIES.General;
                    return (
                      <View key={sub.id} style={[s.upcomingItem, { borderTopColor: c.cardBorder + '30' }]}>
                        <Text style={{ fontSize: 16 }}>{cat.emoji}</Text>
                        <View style={{ flex: 1 }}>
                          <Text style={[s.upcomingName, { color: c.offWhite }]}>{sub.name}</Text>
                          <Text style={[s.upcomingDate, { color: c.amber }]}>{getDaysLeft(sub.nextBillingDate)}</Text>
                        </View>
                        <Text style={[s.upcomingAmount, { color: c.offWhite }]}>{curr.symbol}{sub.amount.toFixed(2)}</Text>
                      </View>
                    );
                  })}
                </View>
              )}

              {/* Search — Pro only */}
              {isPro ? (
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
              ) : (
                <TouchableOpacity
                  style={[s.searchWrap, { backgroundColor: c.card, borderColor: c.cardBorder, opacity: 0.5 }]}
                  onPress={() => router.push('/modal')}
                  activeOpacity={0.7}
                >
                  <Search size={16} color={c.dim} />
                  <Text style={[s.searchInput, { color: c.dim }]}>🔒 {isTR ? 'Pro ile ara' : 'Search with Pro'}</Text>
                </TouchableOpacity>
              )}

              {/* Free tier slot counter */}
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

              {/* Swipe hint */}
              <Text style={[s.swipeHint, { color: c.dim }]}>
                ← {isTR ? 'Silmek için sola kaydır' : 'Swipe left to delete'}
              </Text>

              <Text style={[s.listHeader, { color: c.offWhite }]}>{t.allSubscriptions}</Text>
            </View>
          }
          renderItem={({ item }) => {
            const cat = SUB_CATEGORIES[item.category] ?? SUB_CATEGORIES.General;
            const nextDate = new Date(item.nextBillingDate);
            const diffDays = Math.ceil((nextDate.getTime() - Date.now()) / 86400000);
            const isUpcoming = diffDays >= 0 && diffDays <= 3;

            return (
              <SwipeableRow onDelete={() => handleDelete(item.id, item.name)} deleteColor={c.red}>
                <TouchableOpacity
                  style={[s.subCard, {
                    backgroundColor: c.card,
                    borderColor: item.isPaid ? c.emerald + '40' : isUpcoming ? c.amber + '40' : c.cardBorder,
                  }]}
                  activeOpacity={0.7}
                  onPress={() => router.push(`/subscription/${item.id}`)}
                >
                  <View style={[s.subIcon, { backgroundColor: cat.colors[0] + '20' }]}>
                    <Text style={{ fontSize: 20 }}>{cat.emoji}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Text style={[s.subName, { color: c.offWhite }]}>{item.name}</Text>
                      {item.isPaid && (
                        <View style={[s.paidBadge, { backgroundColor: c.emerald + '18' }]}>
                          <Check size={10} color={c.emerald} strokeWidth={3} />
                          <Text style={[s.paidText, { color: c.emerald }]}>{isTR ? 'Ödendi' : 'Paid'}</Text>
                        </View>
                      )}
                    </View>
                    <Text style={[s.subMeta, { color: c.subtle }]}>
                      {item.billingCycle === 'monthly' ? (isTR ? 'Aylık' : 'Monthly') : (isTR ? 'Yıllık' : 'Yearly')} · {nextDate.toLocaleDateString(isTR ? 'tr-TR' : 'en-US', { month: 'short', day: 'numeric' })}
                    </Text>
                  </View>
                  <View style={s.subRight}>
                    <Text style={[s.subAmount, { color: c.offWhite }]}>{curr.symbol}{item.amount.toFixed(2)}</Text>
                    <Text style={[s.subCycle, { color: c.subtle }]}>/{item.billingCycle === 'monthly' ? (isTR ? 'ay' : 'mo') : (isTR ? 'yıl' : 'yr')}</Text>
                  </View>
                  <TouchableOpacity
                    style={[s.payBtn, { backgroundColor: item.isPaid ? c.emerald : 'transparent', borderColor: item.isPaid ? c.emerald : c.cardBorder }]}
                    onPress={() => handleMarkPaid(item.id)}
                    activeOpacity={0.7}
                  >
                    <Check size={14} color={item.isPaid ? '#FFF' : c.dim} strokeWidth={2.5} />
                  </TouchableOpacity>
                </TouchableOpacity>
              </SwipeableRow>
            );
          }}
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
  container: { flex: 1, paddingTop: Platform.OS === 'ios' ? 64 : 48 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 20 },
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
