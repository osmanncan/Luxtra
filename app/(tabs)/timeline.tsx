import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { Plus, Search } from 'lucide-react-native';
import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Platform,
  SectionList,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import SwipeableRow from '../../src/components/SwipeableRow';
import { TimelineItem } from '../../src/components/timeline/TimelineItem';
import { FREE_LIMITS } from '../../src/store/proFeatures';
import { useThemeColors } from '../../src/store/theme';
import { translations } from '../../src/store/translations';
import { CURRENCIES, useStore } from '../../src/store/useStore';

export default function TimelineScreen() {
  const router = useRouter();
  const { tasks, subscriptions, language, currency, deleteTask, removeSubscription, user } = useStore();
  const isPro = user?.isPro ?? false;
  const c = useThemeColors();
  const t = translations[language].timeline;
  const isTR = language === 'tr';
  const curr = CURRENCIES[currency] || CURRENCIES.TRY;

  const [searchQuery, setSearchQuery] = useState('');

  const fadeAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
  }, []);

  let allItems = [
    ...tasks.filter(t_ => !t_.isCompleted).map(t_ => ({
      id: t_.id, title: t_.title, date: t_.dueDate, kind: 'responsibility' as const,
      priority: t_.priority, isRecurring: t_.isRecurring, recurringMonths: t_.recurringMonths,
    })),
    ...subscriptions.map(s => ({
      id: s.id, title: s.name, date: s.nextBillingDate, kind: 'payment' as const,
      priority: 'medium' as const, amount: s.amount,
    })),
  ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    allItems = allItems.filter(item => item.title.toLowerCase().includes(q));
  }

  const now = new Date();
  const todayStr = now.toDateString();
  const tomorrowDate = new Date(now);
  tomorrowDate.setDate(tomorrowDate.getDate() + 1);
  const tomorrowStr = tomorrowDate.toDateString();

  const weekEnd = new Date(now);
  weekEnd.setDate(weekEnd.getDate() + 7);
  const monthEnd = new Date(now);
  monthEnd.setMonth(monthEnd.getMonth() + 1);

  const overdue: typeof allItems = [];
  const today: typeof allItems = [];
  const tomorrow: typeof allItems = [];
  const thisWeek: typeof allItems = [];
  const thisMonth: typeof allItems = [];
  const later: typeof allItems = [];

  allItems.forEach(item => {
    const d = new Date(item.date);
    const dStr = d.toDateString();
    if (d < now && dStr !== todayStr) overdue.push(item);
    else if (dStr === todayStr) today.push(item);
    else if (dStr === tomorrowStr) tomorrow.push(item);
    else if (d <= weekEnd) thisWeek.push(item);
    else if (d <= monthEnd) thisMonth.push(item);
    else later.push(item);
  });

  const sections = [
    { title: t.overdue, data: overdue, color: c.red },
    { title: t.today, data: today, color: c.amber },
    { title: t.tomorrow, data: tomorrow, color: c.emerald },
    { title: t.thisWeek, data: thisWeek, color: c.blue },
    { title: t.thisMonth, data: thisMonth, color: c.purple },
    { title: t.later, data: later, color: c.subtle },
  ].filter(s => s.data.length > 0);

  const handleDelete = (item: any) => {
    Alert.alert(
      isTR ? 'Sil' : 'Delete',
      isTR ? `"${item.title}" silinsin mi?` : `Delete "${item.title}"?`,
      [
        { text: isTR ? 'İptal' : 'Cancel', style: 'cancel' },
        {
          text: isTR ? 'Sil' : 'Delete',
          style: 'destructive',
          onPress: () => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            if (item.kind === 'payment') removeSubscription(item.id);
            else deleteTask(item.id);
          },
        },
      ]
    );
  };

  const renderItem = ({ item }: { item: any }) => (
    <SwipeableRow onDelete={() => handleDelete(item)} deleteColor={c.red}>
      <TimelineItem
        item={item}
        isTR={isTR}
        currencySymbol={curr.symbol}
        labels={{
          payment: t.payment,
          responsibility: t.responsibility,
          repeatsEvery: t.repeatsEvery,
        }}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          if (item.kind === 'payment') router.push(`/subscription/${item.id}`);
        }}
        colors={c}
      />
    </SwipeableRow>
  );

  const renderSectionHeader = ({ section: { title, color, data } }: any) => (
    <View style={s.sectionHead}>
      <View style={[s.sectionDot, { backgroundColor: color }]} />
      <Text style={[s.sectionTitle, { color }]}>{title}</Text>
      <View style={[s.sectionCount, { backgroundColor: c.cardBorder }]}>
        <Text style={[s.sectionCountText, { color: c.muted }]}>{data.length}</Text>
      </View>
    </View>
  );

  return (
    <View style={[s.container, { backgroundColor: c.base }]}>
      <StatusBar barStyle={c.statusBarStyle} />

      <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
        <View style={s.header}>
          <View>
            <Text style={[s.headerLabel, { color: c.subtle }]}>{t.yourTimeline}</Text>
            <Text style={[s.headerTitle, { color: c.offWhite }]}>
              {allItems.length} {allItems.length === 1 ? t.upcomingItem : t.upcomingItems}
            </Text>
          </View>
          <TouchableOpacity
            style={[s.addBtn, { backgroundColor: c.emerald }]}
            activeOpacity={0.8}
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.push('/add-responsibility' as any); }}
          >
            <Plus size={22} color="#F1F5F9" strokeWidth={3} />
          </TouchableOpacity>
        </View>

        <View style={[s.searchWrap, { backgroundColor: c.card, borderColor: c.cardBorder }]}>
          <Search size={18} color={c.dim} />
          <TextInput
            style={[s.searchInput, { color: c.offWhite }]}
            placeholder={t.searchPlaceholder}
            placeholderTextColor={c.muted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {!isPro && (
          <View style={[s.slotBanner, { backgroundColor: c.amber + '10', borderColor: c.amber + '25' }]}>
            <Text style={[s.slotText, { color: c.amber }]}>
              {isTR
                ? `${tasks.length}/${FREE_LIMITS.maxResponsibilities} sorumluluk kullanıldı`
                : `${tasks.length}/${FREE_LIMITS.maxResponsibilities} responsibilities used`}
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

        <SectionList
          sections={sections}
          keyExtractor={(item) => `${item.kind}-${item.id}`}
          renderItem={renderItem}
          renderSectionHeader={renderSectionHeader}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 140 }}
          stickySectionHeadersEnabled={false}
          ListEmptyComponent={
            <View style={[s.empty, { backgroundColor: c.card, borderColor: c.cardBorder }]}>
              <Text style={s.emptyEmoji}>🎯</Text>
              <Text style={[s.emptyTitle, { color: c.offWhite }]}>{t.allClear}</Text>
              <Text style={[s.emptyHint, { color: c.subtle }]}>{t.nothingOnSchedule}</Text>
              <TouchableOpacity style={s.emptyBtn} onPress={() => router.push('/add-responsibility' as any)}>
                <Plus size={16} color="#0F1419" />
                <Text style={s.emptyBtnText}>{t.addResponsibility}</Text>
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
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 12, marginTop: 4 },
  headerLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 1.2, marginBottom: 4 },
  headerTitle: { fontSize: 22, fontWeight: '700', letterSpacing: -0.3 },
  addBtn: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },

  searchWrap: { flexDirection: 'row', alignItems: 'center', borderRadius: 14, paddingHorizontal: 16, height: 50, gap: 10, borderWidth: 1.5, marginHorizontal: 20, marginBottom: 10 },
  searchInput: { flex: 1, fontSize: 15, fontWeight: '600' },
  swipeHint: { fontSize: 11, fontWeight: '500', textAlign: 'right', paddingHorizontal: 20, marginBottom: 10, opacity: 0.6 },

  sectionHead: { flexDirection: 'row', alignItems: 'center', marginTop: 20, marginBottom: 10, gap: 8 },
  sectionDot: { width: 9, height: 9, borderRadius: 5 },
  sectionTitle: { fontSize: 15, fontWeight: '800', flex: 1, letterSpacing: 0.2 },
  sectionCount: { width: 26, height: 26, borderRadius: 13, justifyContent: 'center', alignItems: 'center' },
  sectionCountText: { fontSize: 12, fontWeight: '800' },

  itemCard: { flexDirection: 'row', alignItems: 'center', borderRadius: 14, padding: 16, borderWidth: 1, gap: 12 },
  itemIconWrap: { width: 42, height: 42, borderRadius: 10, justifyContent: 'center', alignItems: 'center', borderWidth: 1 },
  itemTitle: { fontSize: 16, fontWeight: '700' },
  itemMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 3 },
  itemMeta: { fontSize: 13, fontWeight: '600' },
  recurBadge: { width: 18, height: 18, borderRadius: 9, justifyContent: 'center', alignItems: 'center' },
  recurText: { fontSize: 10, fontWeight: '500', marginTop: 2 },
  kindPill: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  kindPillText: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },

  empty: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60, borderRadius: 20, borderWidth: 1, marginTop: 20 },
  emptyEmoji: { fontSize: 36, marginBottom: 12 },
  emptyTitle: { fontSize: 18, fontWeight: '700', marginBottom: 6 },
  emptyHint: { fontSize: 14, marginBottom: 20 },
  emptyBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#F1F5F9', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12 },
  emptyBtnText: { color: '#0F1419', fontSize: 14, fontWeight: '700' },

  /* Slot counter */
  slotBanner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderRadius: 12, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 10, marginHorizontal: 20, marginBottom: 8 },
  slotText: { fontSize: 12, fontWeight: '700' },
  slotUpgrade: { fontSize: 12, fontWeight: '700' },
});
