import * as Notifications from 'expo-notifications';
import { useRouter } from 'expo-router';
import {
  ArrowLeft,
  Bell,
  Calendar as CalendarIcon,
  DollarSign,
  Repeat,
  Tag,
} from 'lucide-react-native';
import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { canAddSubscription, FREE_LIMITS } from '../src/store/proFeatures';
import { useThemeColors } from '../src/store/theme';
import { CURRENCIES, SUB_CATEGORIES, useStore } from '../src/store/useStore';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const CATEGORIES = Object.keys(SUB_CATEGORIES);

export default function AddSubscription() {
  const router = useRouter();
  const addSubscription = useStore((s) => s.addSubscription);
  const subscriptions = useStore((s) => s.subscriptions);
  const customCategories = useStore((s) => s.customCategories);
  const isPro = useStore((s) => s.user?.isPro ?? false);
  const language = useStore((s) => s.language);
  const userCurrency = useStore((s) => s.currency);
  const c = useThemeColors();
  const isTR = language === 'tr';
  const curr = CURRENCIES[userCurrency] || CURRENCIES.TRY;

  const allCategories = { ...SUB_CATEGORIES, ...customCategories };

  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [day, setDay] = useState('');
  const [cycle, setCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [category, setCategory] = useState('General');
  const [reminderDays, setReminderDays] = useState(1);

  const isValid = name.trim() && amount && day;

  const handleSave = async () => {
    if (!isValid) return;

    // Check free limit
    if (!canAddSubscription(subscriptions.length, isPro)) {
      Alert.alert(
        isTR ? 'Limit Aşıldı' : 'Limit Reached',
        isTR
          ? `Ücretsiz planda en fazla ${FREE_LIMITS.maxSubscriptions} abonelik ekleyebilirsin. Pro'ya geç!`
          : `Free plan allows up to ${FREE_LIMITS.maxSubscriptions} subscriptions. Upgrade to Pro!`,
        [
          { text: isTR ? 'İptal' : 'Cancel', style: 'cancel' },
          { text: isTR ? 'Pro\'ya Geç' : 'Upgrade', onPress: () => router.push('/modal') },
        ]
      );
      return;
    }

    const today = new Date();
    let nextDate = new Date(today.getFullYear(), today.getMonth(), +day);
    if (nextDate < today) nextDate.setMonth(nextDate.getMonth() + 1);



    addSubscription({
      id: Date.now().toString(),
      name: name.trim(),
      amount: parseFloat(amount),
      currency: userCurrency,
      billingCycle: cycle,
      nextBillingDate: nextDate.toISOString(),
      category,
      reminderDays,
    });

    const remindDate = new Date(nextDate);
    remindDate.setDate(remindDate.getDate() - reminderDays);

    if (remindDate > new Date()) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: isTR ? 'Ödeme Hatırlatması 💸' : 'Payment Reminder 💸',
          body: isTR
            ? `${name} ($${amount}) ${reminderDays} gün sonra ödenecek!`
            : `${name} ($${amount}) is due in ${reminderDays} days!`,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: remindDate,
        },
      });
    }

    router.back();
  };

  return (
    <View style={[st.container, { backgroundColor: c.base }]}>
      {/* Header */}
      <View style={st.header}>
        <TouchableOpacity onPress={() => router.back()} style={[st.backBtn, { backgroundColor: c.card, borderColor: c.cardBorder }]}>
          <ArrowLeft size={22} color={c.offWhite} />
        </TouchableOpacity>
        <Text style={[st.headerTitle, { color: c.offWhite }]}>
          {isTR ? 'Yeni Abonelik' : 'New Subscription'}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40 }}
        >
          {/* Hero */}
          <View style={[st.heroCard, { backgroundColor: c.card, borderColor: c.cardBorder }]}>
            <View style={[st.heroIcon, { backgroundColor: c.cardBorder }]}>
              <Text style={{ fontSize: 28 }}>💳</Text>
            </View>


            <Text style={[st.heroTitle, { color: c.offWhite }]}>
              {isTR ? 'Düzenli ödemeyi takip et' : 'Track a recurring payment'}
            </Text>
            <Text style={[st.heroSub, { color: c.subtle }]}>
              {isTR ? 'Ödemeler hesabına düşmeden önce seni uyaralım.' : 'Get reminded before charges hit your account.'}
            </Text>
          </View>

          {/* Name */}
          <Text style={[st.label, { color: c.subtle }]}>
            {isTR ? 'HİZMET ADI' : 'SERVICE NAME'}
          </Text>
          <View style={[st.inputWrap, { backgroundColor: c.card, borderColor: c.cardBorder }]}>
            <Tag size={16} color={c.dim} style={{ marginRight: 12 }} />
            <TextInput
              placeholder={isTR ? 'Netflix, Spotify, Spor Salonu...' : 'Netflix, Spotify, Gym...'}
              placeholderTextColor={c.dim}
              style={[st.input, { color: c.offWhite }]}
              value={name}
              onChangeText={setName}
              autoFocus
            />
          </View>

          {/* Amount */}
          <Text style={[st.label, { color: c.subtle }]}>
            {isTR ? 'TUTAR' : 'AMOUNT'}
          </Text>
          <View style={[st.inputWrap, { backgroundColor: c.card, borderColor: c.cardBorder }]}>
            <DollarSign size={16} color={c.dim} style={{ marginRight: 12 }} />
            <TextInput
              placeholder="0.00"
              placeholderTextColor={c.dim}
              style={[st.input, { color: c.offWhite }]}
              keyboardType="decimal-pad"
              value={amount}
              onChangeText={setAmount}
            />
          </View>

          {/* Billing Day */}
          <Text style={[st.label, { color: c.subtle }]}>
            {isTR ? 'ÖDEME GÜNÜ (1–31)' : 'BILLING DAY (1–31)'}
          </Text>
          <View style={[st.inputWrap, { backgroundColor: c.card, borderColor: c.cardBorder }]}>
            <CalendarIcon size={16} color={c.dim} style={{ marginRight: 12 }} />
            <TextInput
              placeholder={isTR ? 'örn. 15' : 'e.g. 15'}
              placeholderTextColor={c.dim}
              style={[st.input, { color: c.offWhite }]}
              keyboardType="number-pad"
              value={day}
              onChangeText={setDay}
              maxLength={2}
            />
          </View>

          {/* Cycle */}
          <Text style={[st.label, { color: c.subtle }]}>
            {isTR ? 'ÖDEME DÖNEMİ' : 'BILLING CYCLE'}
          </Text>
          <View style={st.cycleRow}>
            {(['monthly', 'yearly'] as const).map((opt) => (
              <TouchableOpacity
                key={opt}
                onPress={() => setCycle(opt)}
                style={[st.cycleBtn, { backgroundColor: c.card, borderColor: cycle === opt ? c.emerald + '30' : c.cardBorder }]}
              >
                <Repeat
                  size={14}
                  color={cycle === opt ? c.emerald : c.dim}
                />
                <Text
                  style={[
                    st.cycleBtnText,
                    { color: cycle === opt ? c.emerald : c.subtle },
                  ]}
                >
                  {opt === 'monthly' ? (isTR ? 'Aylık' : 'Monthly') : (isTR ? 'Yıllık' : 'Yearly')}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Reminder */}
          <Text style={[st.label, { color: c.subtle }]}>
            {isTR ? 'HATIRLATMA' : 'REMINDER'}
          </Text>
          <View style={st.cycleRow}>
            {[1, 3, 7].map((days) => (
              <TouchableOpacity
                key={days}
                onPress={() => setReminderDays(days)}
                style={[st.cycleBtn, { backgroundColor: c.card, borderColor: reminderDays === days ? c.emerald + '30' : c.cardBorder, minWidth: 80 }]}
              >
                <Bell
                  size={14}
                  color={reminderDays === days ? c.emerald : c.dim}
                />
                <Text
                  style={[
                    st.cycleBtnText,
                    { color: reminderDays === days ? c.emerald : c.subtle },
                  ]}
                >
                  {isTR
                    ? (days === 7 ? '1 Hafta' : `${days} Gün`)
                    : (days === 7 ? '1 Week' : `${days} Days`)
                  }
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Category */}
          <Text style={[st.label, { color: c.subtle }]}>
            {isTR ? 'KATEGORİ' : 'CATEGORY'}
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ marginBottom: 32 }}
          >
            {Object.keys(allCategories).map((cat_key) => {
              const catConfig = allCategories[cat_key];
              const active = category === cat_key;
              return (
                <TouchableOpacity
                  key={cat_key}
                  onPress={() => setCategory(cat_key)}
                  style={[st.catChip, { backgroundColor: c.card, borderColor: active ? c.emerald + '30' : c.cardBorder }]}
                >
                  <Text style={{ fontSize: 14 }}>{catConfig.emoji}</Text>
                  <Text style={[st.catChipText, { color: active ? c.emerald : c.subtle }]}>
                    {cat_key}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Save */}
          <TouchableOpacity
            onPress={handleSave}
            disabled={!isValid}
            activeOpacity={0.85}
            style={[st.saveBtn, { backgroundColor: isValid ? c.emerald : c.card }, !isValid && { borderWidth: 1, borderColor: c.cardBorder }]}
          >
            <Text style={[st.saveBtnText, { color: isValid ? '#0F1419' : c.dim }]}>
              {isTR ? 'Aboneliği Kaydet' : 'Save Subscription'}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const st = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 56 : 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    borderWidth: 1,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
  },

  /* Hero */
  heroCard: {
    alignItems: 'center',
    borderRadius: 20,
    padding: 28,
    borderWidth: 1,
    marginBottom: 28,
  },
  heroIcon: {
    width: 60,
    height: 60,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 6,
  },
  heroSub: {
    fontSize: 14,
    textAlign: 'center',
  },

  /* Form */
  label: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    marginBottom: 8,
    marginLeft: 4,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 20,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
  },
  cycleRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  cycleBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  cycleBtnText: {
    fontWeight: '700',
    fontSize: 14,
  },
  catChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    marginRight: 10,
    gap: 6,
  },
  catChipText: {
    fontSize: 13,
    fontWeight: '600',
  },
  saveBtn: {
    borderRadius: 14,
    paddingVertical: 18,
    alignItems: 'center',
  },
  saveBtnText: {
    fontSize: 17,
    fontWeight: '700',
  },
});
