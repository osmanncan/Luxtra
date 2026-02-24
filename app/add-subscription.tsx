import Constants from 'expo-constants';
import { useRouter } from 'expo-router';
import {
  ArrowLeft,
  Bell,
  CalendarDays,
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
  TouchableOpacity,
  View,
} from 'react-native';
import { CustomDatePickerModal } from '../src/components/shared/CustomDatePickerModal';
import { FormField } from '../src/components/shared/FormField';
import { HeroCard } from '../src/components/shared/HeroCard';
import { canAddSubscription, FREE_LIMITS } from '../src/store/proFeatures';
import { useThemeColors } from '../src/store/theme';
import { CURRENCIES, SUB_CATEGORIES, useStore } from '../src/store/useStore';

type NotificationsModule = typeof import('expo-notifications');

const isExpoGo = Constants.appOwnership === 'expo';
const Notifications: NotificationsModule | null = !isExpoGo
  ? (require('expo-notifications') as NotificationsModule)
  : null;

if (Notifications) {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

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

  const [reminderType, setReminderType] = useState<'days' | 'months' | 'custom'>('days');
  const [reminderDays, setReminderDays] = useState(1);
  const [reminderMonths, setReminderMonths] = useState(1);

  const [showCustomDate, setShowCustomDate] = useState(false);
  const [customDay, setCustomDay] = useState('');
  const [customMonth, setCustomMonth] = useState('');
  const [customYear, setCustomYear] = useState(new Date().getFullYear().toString());

  const getCustomReminderDate = (): Date | null => {
    const d = parseInt(customDay);
    const m = parseInt(customMonth) - 1;
    const y = parseInt(customYear);
    if (isNaN(d) || isNaN(m) || isNaN(y)) return null;
    const date = new Date(y, m, d);
    if (isNaN(date.getTime())) return null;
    return date;
  };

  const getReminderLabel = (): string => {
    if (reminderType === 'days') {
      return isTR ? `${reminderDays} gün önce` : `${reminderDays} day(s) before`;
    }
    if (reminderType === 'months') {
      return isTR ? `${reminderMonths} ay önce` : `${reminderMonths} month(s) before`;
    }
    const d = getCustomReminderDate();
    if (!d) return isTR ? 'Tarih seç' : 'Pick date';
    return d.toLocaleDateString(isTR ? 'tr-TR' : 'en-US', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const isValid = name.trim() && amount && day;

  const handleSave = async () => {
    if (!isValid) return;

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
      reminderDays: reminderType === 'days' ? reminderDays : reminderType === 'months' ? reminderMonths * 30 : 1,
    });

    let remindDate: Date | null = null;
    if (reminderType === 'days') {
      remindDate = new Date(nextDate);
      remindDate.setDate(remindDate.getDate() - reminderDays);
    } else if (reminderType === 'months') {
      remindDate = new Date(nextDate);
      remindDate.setMonth(remindDate.getMonth() - reminderMonths);
    } else if (reminderType === 'custom') {
      remindDate = getCustomReminderDate();
    }

    if (remindDate) {
      remindDate.setHours(9, 0, 0, 0);
    }

    if (Notifications && remindDate && remindDate > new Date()) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: isTR ? 'Ödeme Hatırlatması 💸' : 'Payment Reminder 💸',
          body: isTR
            ? `${name} (${curr.symbol}${amount}) yakında ödenecek!`
            : `${name} (${curr.symbol}${amount}) is due soon!`,
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
      <View style={st.header}>
        <TouchableOpacity onPress={() => router.back()} style={[st.backBtn, { backgroundColor: c.card, borderColor: c.cardBorder }]}>
          <ArrowLeft size={22} color={c.offWhite} strokeWidth={2.5} />
        </TouchableOpacity>
        <Text style={[st.headerTitle, { color: c.offWhite }]}>
          {isTR ? 'Yeni Abonelik' : 'New Subscription'}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>

          <HeroCard
            emoji="💳"
            title={isTR ? 'Düzenli ödemeyi takip et' : 'Track a recurring payment'}
            subtitle={isTR ? 'Ödemeler hesabına düşmeden önce seni uyaralım.' : 'Get reminded before charges hit your account.'}
            colors={c}
          />

          <FormField
            label={isTR ? 'Hizmet Adı' : 'Service Name'}
            placeholder={isTR ? 'Netflix, Spotify, Spor Salonu...' : 'Netflix, Spotify, Gym...'}
            value={name}
            onChangeText={setName}
            colors={c}
            autoFocus
            icon={<Tag size={16} color={c.dim} style={{ marginRight: 12 }} />}
          />

          <FormField
            label={isTR ? 'Tutar' : 'Amount'}
            placeholder="0.00"
            keyboardType="decimal-pad"
            value={amount}
            onChangeText={setAmount}
            colors={c}
            icon={<DollarSign size={16} color={c.dim} style={{ marginRight: 12 }} />}
          />

          <FormField
            label={isTR ? 'Ödeme Günü (1–31)' : 'Billing Day (1–31)'}
            placeholder={isTR ? 'örn. 15' : 'e.g. 15'}
            keyboardType="number-pad"
            value={day}
            onChangeText={setDay}
            colors={c}
            maxLength={2}
            icon={<CalendarIcon size={16} color={c.dim} style={{ marginRight: 12 }} />}
          />

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
                <Repeat size={14} color={cycle === opt ? c.emerald : c.dim} />
                <Text style={[st.cycleBtnText, { color: cycle === opt ? c.emerald : c.subtle }]}>
                  {opt === 'monthly' ? (isTR ? 'Aylık' : 'Monthly') : (isTR ? 'Yıllık' : 'Yearly')}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={[st.label, { color: c.subtle }]}>
            {isTR ? 'HATIRLATMA' : 'REMINDER'}
          </Text>

          <View style={[st.reminderTypeTabs, { backgroundColor: c.card, borderColor: c.cardBorder }]}>
            {(['days', 'months', 'custom'] as const).map(type => (
              <TouchableOpacity
                key={type}
                style={[st.reminderTypeTab, {
                  backgroundColor: reminderType === type ? c.emerald + '20' : 'transparent',
                  borderColor: reminderType === type ? c.emerald : 'transparent',
                }]}
                onPress={() => {
                  setReminderType(type);
                  if (type === 'custom') setShowCustomDate(true);
                }}
              >
                <Text style={[st.reminderTypeLabel, { color: reminderType === type ? c.emerald : c.subtle }]}>
                  {type === 'days' ? (isTR ? 'Gün' : 'Days') : type === 'months' ? (isTR ? 'Ay' : 'Months') : (isTR ? 'Özel' : 'Custom')}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {reminderType === 'days' && (
            <View style={st.cycleRow}>
              {[1, 2, 3, 5, 7].map((days) => (
                <TouchableOpacity
                  key={days}
                  onPress={() => setReminderDays(days)}
                  style={[st.cycleBtn, { backgroundColor: c.card, borderColor: reminderDays === days ? c.emerald + '30' : c.cardBorder, minWidth: 80 }]}
                >
                  <Bell size={14} color={reminderDays === days ? c.emerald : c.dim} />
                  <Text style={[st.cycleBtnText, { color: reminderDays === days ? c.emerald : c.subtle }]}>
                    {isTR ? (days === 7 ? '1 Hafta' : `${days} Gün`) : (days === 7 ? '1 Week' : `${days} Days`)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {reminderType === 'months' && (
            <View style={st.cycleRow}>
              {[1, 2, 3].map((m) => (
                <TouchableOpacity
                  key={m}
                  onPress={() => setReminderMonths(m)}
                  style={[st.cycleBtn, { backgroundColor: c.card, borderColor: reminderMonths === m ? c.emerald + '30' : c.cardBorder }]}
                >
                  <Bell size={14} color={reminderMonths === m ? c.emerald : c.dim} />
                  <Text style={[st.cycleBtnText, { color: reminderMonths === m ? c.emerald : c.subtle }]}>
                    {m} {isTR ? 'Ay' : 'Mo'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {reminderType === 'custom' && (
            <TouchableOpacity
              style={[st.customDateBtn, { backgroundColor: c.card, borderColor: c.emerald + '40' }]}
              onPress={() => setShowCustomDate(true)}
            >
              <CalendarDays size={18} color={c.emerald} />
              <Text style={[st.customDateLabel, { color: c.offWhite }]}>
                {getReminderLabel()}
              </Text>
              <Text style={{ fontSize: 12, color: c.emerald, fontWeight: '600' }}>
                {isTR ? 'Değiştir' : 'Change'}
              </Text>
            </TouchableOpacity>
          )}

          <Text style={[st.label, { color: c.subtle }]}>
            {isTR ? 'KATEGORİ' : 'CATEGORY'}
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 32 }}>
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

      <CustomDatePickerModal
        visible={showCustomDate}
        onClose={() => { setReminderType('days'); setShowCustomDate(false); }}
        onConfirm={() => setShowCustomDate(false)}
        isTR={isTR}
        colors={c}
        state={{ day: customDay, month: customMonth, year: customYear }}
        setState={{ setDay: setCustomDay, setMonth: setCustomMonth, setYear: setCustomYear }}
      />
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

  /* Reminder */
  reminderTypeTabs: {
    flexDirection: 'row',
    borderRadius: 14,
    borderWidth: 1,
    padding: 4,
    marginBottom: 14,
    gap: 4,
  },
  reminderTypeTab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
  },
  reminderTypeLabel: {
    fontSize: 13,
    fontWeight: '700',
  },
  customDateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingVertical: 14,
    marginBottom: 16,
  },
  customDateLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
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

  /* Custom date modal */
  modalOverlay: {
    flex: 1,
    backgroundColor: '#00000080',
    justifyContent: 'flex-end',
  },
  modalCard: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    padding: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  modalSub: {
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 24,
  },
  dateRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  dateLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 8,
  },
  dateInput: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  modalBtns: {
    flexDirection: 'row',
    gap: 12,
  },
  modalCancelBtn: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
  },
  modalConfirmBtn: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
  },
});
