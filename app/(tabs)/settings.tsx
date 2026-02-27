import * as FileSystem from 'expo-file-system';
import * as Haptics from 'expo-haptics';
import * as LocalAuthentication from 'expo-local-authentication';
import { useRouter } from 'expo-router';
import { isAvailableAsync, shareAsync } from 'expo-sharing';
import {
  AlertTriangle,
  Bell,
  BellOff,
  Brain,
  ChevronRight,
  Clock,
  CreditCard,
  Globe,
  HelpCircle,
  Layers,
  Lock,
  LogOut,
  Moon,
  Palette,
  Radio,
  Shield,
  Sun,
  Unlock,
  User,
  Wallet
} from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Platform,
  ScrollView,
  Share,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useThemeColors } from '../../src/store/theme';
import { translations } from '../../src/store/translations';
import { CURRENCIES, useStore } from '../../src/store/useStore';

export default function SettingsScreen() {
  const router = useRouter();
  const {
    user, language, setLanguage, theme, toggleTheme,
    subscriptions, tasks, logout, currency, setCurrency,
    monthlyBudget, setMonthlyBudget,
    isBiometricEnabled, toggleBiometric,
    notificationsEnabled, setNotificationsEnabled,
    notificationTime, setNotificationTime,
    unlockAchievement, achievements,
  } = useStore();
  const c = useThemeColors();
  const t = (translations as any)[language].settings;
  const isTR = language === 'tr';
  const isPro = user?.isPro ?? false;
  const curr = CURRENCIES[currency as keyof typeof CURRENCIES] || CURRENCIES.TRY;

  const [budgetInput, setBudgetInput] = useState(monthlyBudget > 0 ? monthlyBudget.toString() : '');
  const [showBudgetInput, setShowBudgetInput] = useState(false);
  const [hasBiometrics, setHasBiometrics] = useState(false);

  useEffect(() => {
    (async () => {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      setHasBiometrics(compatible && enrolled);
    })();
  }, []);

  const handleSignOut = () => {
    Alert.alert(t.signOut, t.signOutConfirm, [
      { text: isTR ? 'İptal' : 'Cancel', style: 'cancel' },
      { text: t.signOut, style: 'destructive', onPress: () => { logout(); } },
    ]);
  };

  const handleBudgetSave = () => {
    const amount = parseFloat(budgetInput);
    if (!isNaN(amount) && amount >= 0) {
      setMonthlyBudget(amount);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setShowBudgetInput(false);
    }
  };

  const currencyOptions = Object.keys(CURRENCIES);

  const cycleCurrency = () => {
    const idx = currencyOptions.indexOf(currency);
    const next = currencyOptions[(idx + 1) % currencyOptions.length];
    setCurrency(next);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleExportData = async () => {
    try {
      tap();
      const csvContent = "Type,Name,Amount,Category,Date\n" +
        subscriptions.map(s => `Subscription,${s.name},${s.amount},${s.category},${s.nextBillingDate}`).join('\n') + "\n" +
        tasks.map(t => `Task,${t.title},,${t.type},${t.dueDate}`).join('\n');

      const fileUri = (FileSystem as any).documentDirectory ? (FileSystem as any).documentDirectory + 'Luxtra_Data.csv' : '';
      if (!fileUri) return;
      await FileSystem.writeAsStringAsync(fileUri, csvContent, { encoding: (FileSystem as any).EncodingType?.UTF8 || 'utf8' });

      if (await isAvailableAsync()) {
        await shareAsync(fileUri);
      } else {
        Alert.alert("Error", "Sharing is not available on this device");
      }
    } catch (e) {
      console.error(e);
      Alert.alert("Error", "Failed to export data");
    }
  };

  const handleReferral = async () => {
    try {
      tap();
      const message = isTR
        ? "Hayatını düzenlemek için Luxtra'yı denemelisin! Bu kodla kaydol: LUXTRA2026"
        : "You should try Luxtra to organize your life! Use my code: LUXTRA2026";
      await Share.share({ message });
    } catch (e) {
      console.error(e);
    }
  };

  const tap = () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

  return (
    <View style={[s.container, { backgroundColor: c.base }]}>
      <StatusBar barStyle={c.statusBarStyle} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 140 }}>
        {/* Header */}
        <Text style={[s.title, { color: c.offWhite }]}>{t.settingsTitle}</Text>

        {/* Account Card */}
        <View style={[s.card, { backgroundColor: c.card, borderColor: c.cardBorder }]}>
          <TouchableOpacity
            style={s.accountRow}
            activeOpacity={0.7}
            onPress={() => { tap(); router.push('/edit-profile' as any); }}
          >
            <View style={[s.avatar, { backgroundColor: c.emerald + '20' }]}>
              <Text style={{ fontSize: 22 }}>
                {user?.name?.charAt(0)?.toUpperCase() || '?'}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[s.name, { color: c.offWhite }]}>{user?.name || 'User'}</Text>
              <Text style={[s.email, { color: c.subtle }]}>{user?.email || ''}</Text>
            </View>
            {isPro && (
              <View style={[s.proBadge, { backgroundColor: c.emerald + '18' }]}>
                <Text style={[s.proText, { color: c.emerald }]}>PRO</Text>
              </View>
            )}
            <ChevronRight size={18} color={c.dim} />
          </TouchableOpacity>

          {/* Stats */}
          <View style={[s.statsRow, { borderTopColor: c.cardBorder }]}>
            <View style={s.stat}>
              <Text style={[s.statNum, { color: c.offWhite }]}>{subscriptions.length}</Text>
              <Text style={[s.statLabel, { color: c.subtle }]}>{t.subscriptionCount}</Text>
            </View>
            <View style={[s.statDivider, { backgroundColor: c.cardBorder }]} />
            <View style={s.stat}>
              <Text style={[s.statNum, { color: c.offWhite }]}>{tasks.length}</Text>
              <Text style={[s.statLabel, { color: c.subtle }]}>{t.responsibilityCount}</Text>
            </View>
          </View>
        </View>

        {/* Pro Upgrade */}
        {!isPro && (
          <TouchableOpacity
            style={[s.proCard, { backgroundColor: c.emerald + '10', borderColor: c.emerald + '25' }]}
            activeOpacity={0.8}
            onPress={() => { tap(); router.push('/modal'); }}
          >
            <Shield size={20} color={c.emerald} />
            <View style={{ flex: 1 }}>
              <Text style={[s.proTitle, { color: c.emerald }]}>{t.upgradePro}</Text>
              <Text style={[s.proSub, { color: c.subtle }]}>{t.upgradeSubtitle}</Text>
            </View>
            <ChevronRight size={18} color={c.emerald} />
          </TouchableOpacity>
        )}

        {/* App Settings */}
        <Text style={[s.sectionLabel, { color: c.subtle }]}>{t.appSettings}</Text>
        <View style={[s.card, { backgroundColor: c.card, borderColor: c.cardBorder }]}>
          {/* Language */}
          <TouchableOpacity style={s.settingRow} onPress={() => {
            tap();
            const langs: Array<'en' | 'tr' | 'es' | 'de' | 'fr' | 'it' | 'pt' | 'ar'> = ['en', 'tr', 'es', 'de', 'fr', 'it', 'pt', 'ar'];
            const labels: Record<string, string> = {
              en: 'English', tr: 'Türkçe', es: 'Español', de: 'Deutsch',
              fr: 'Français', it: 'Italiano', pt: 'Português', ar: 'العربية'
            };

            Alert.alert(
              isTR ? 'Dil Seçin' : 'Select Language',
              '',
              [
                ...langs.map(l => ({
                  text: labels[l],
                  onPress: () => { setLanguage(l); tap(); if (!achievements.includes('globe')) unlockAchievement('globe'); }
                })),
                { text: isTR ? 'İptal' : 'Cancel', style: 'cancel' }
              ]
            );
          }}>
            <View style={[s.settingIcon, { backgroundColor: c.blue + '15' }]}>
              <Globe size={18} color={c.blue} />
            </View>
            <Text style={[s.settingText, { color: c.offWhite }]}>{t.language}</Text>
            <Text style={[s.settingValue, { color: c.muted }]}>
              {language === 'tr' ? 'Türkçe' :
                language === 'en' ? 'English' :
                  language === 'es' ? 'Español' :
                    language === 'de' ? 'Deutsch' :
                      language === 'fr' ? 'Français' :
                        language === 'it' ? 'Italiano' :
                          language === 'pt' ? 'Português' :
                            language === 'ar' ? 'العربية' : language}
            </Text>
            <ChevronRight size={16} color={c.dim} />
          </TouchableOpacity>

          {/* Currency */}
          <TouchableOpacity
            style={[s.settingRow, { borderTopWidth: 1, borderTopColor: c.cardBorder + '50' }]}
            onPress={() => {
              tap();
              const options = Object.keys(CURRENCIES);
              Alert.alert(
                isTR ? 'Para Birimi Seçin' : 'Select Currency',
                '',
                [
                  ...options.slice(0, 8).map(currKey => ({
                    text: `${CURRENCIES[currKey].symbol} ${currKey}`,
                    onPress: () => { setCurrency(currKey); tap(); }
                  })),
                  { text: isTR ? 'Vazgeç' : 'Cancel', style: 'cancel' }
                ]
              );
            }}
          >
            <View style={[s.settingIcon, { backgroundColor: c.amber + '15' }]}>
              <Wallet size={18} color={c.amber} />
            </View>
            <Text style={[s.settingText, { color: c.offWhite }]}>{t.currency}</Text>
            <Text style={[s.settingValue, { color: c.muted }]}>{curr.symbol} {currency}</Text>
            <ChevronRight size={16} color={c.dim} />
          </TouchableOpacity>

          {/* Theme */}
          <TouchableOpacity
            style={[s.settingRow, { borderTopWidth: 1, borderTopColor: c.cardBorder + '50' }]}
            onPress={() => {
              tap();
              const themes: Array<{ id: string, name: string, isPro: boolean }> = [
                { id: 'light', name: isTR ? 'Aydınlık' : 'Light', isPro: false },
                { id: 'dark', name: isTR ? 'Karanlık' : 'Dark', isPro: false },
                { id: 'ocean', name: 'Ocean Blue', isPro: true },
                { id: 'burgundy', name: 'Burgundy Elite', isPro: true },
                { id: 'forest', name: 'Forest', isPro: true },
                { id: 'sunrise', name: 'Sunrise', isPro: true },
                { id: 'cosmos', name: 'Cosmos', isPro: true },
              ];

              Alert.alert(
                isTR ? 'Tema Seçin' : 'Select Theme',
                '',
                [
                  ...themes.map(th => ({
                    text: `${th.name} ${th.isPro && !isPro ? '(Pro 🔒)' : ''}`,
                    onPress: () => {
                      if (th.isPro && !isPro) {
                        router.push('/modal');
                      } else {
                        useStore.getState().setTheme(th.id as any);
                      }
                      tap();
                    }
                  })),
                  { text: isTR ? 'İptal' : 'Cancel', style: 'cancel' }
                ]
              );
            }}>
            <View style={[s.settingIcon, { backgroundColor: c.purple + '15' }]}>
              {theme === 'dark' || theme === 'ocean' || theme === 'burgundy' || theme === 'forest' || theme === 'cosmos' ? <Moon size={18} color={c.purple} /> : <Sun size={18} color={c.purple} />}
            </View>
            <Text style={[s.settingText, { color: c.offWhite }]}>{t.theme}</Text>
            <Text style={[s.settingValue, { color: c.muted, textTransform: 'capitalize' }]}>
              {theme === 'dark' ? t.darkMode : theme === 'light' ? t.lightMode : theme}
            </Text>
            <ChevronRight size={16} color={c.dim} />
          </TouchableOpacity>

          {/* Budget — Now FREE for all users */}
          <TouchableOpacity
            style={[s.settingRow, { borderTopWidth: 1, borderTopColor: c.cardBorder + '50' }]}
            onPress={() => {
              tap();
              setShowBudgetInput(!showBudgetInput);
            }}
          >
            <View style={[s.settingIcon, { backgroundColor: c.emerald + '15' }]}>
              <CreditCard size={18} color={c.emerald} />
            </View>
            <Text style={[s.settingText, { color: c.offWhite }]}>{t.budget}</Text>
            {!isPro ? (
              <Text style={[s.settingValue, { color: c.amber }]}>🔒 Pro</Text>
            ) : (
              <Text style={[s.settingValue, { color: c.muted }]}>
                {monthlyBudget > 0 ? `${curr.symbol}${monthlyBudget.toFixed(0)}` : (isTR ? 'Belirle' : 'Set')}
              </Text>
            )}
            <ChevronRight size={16} color={c.dim} />
          </TouchableOpacity>

          {showBudgetInput && (
            <View style={[s.budgetInputRow, { borderTopWidth: 1, borderTopColor: c.cardBorder + '50' }]}>
              <TextInput
                style={[s.budgetInput, { backgroundColor: c.sectionBg, color: c.offWhite, borderColor: c.cardBorder }]}
                placeholder={t.budgetPlaceholder}
                placeholderTextColor={c.dim}
                keyboardType="numeric"
                value={budgetInput}
                onChangeText={setBudgetInput}
              />
              <TouchableOpacity
                style={[s.budgetSaveBtn, { backgroundColor: c.emerald }]}
                onPress={handleBudgetSave}
              >
                <Text style={s.budgetSaveTxt}>{t.setBudget}</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Quick Actions */}
        <Text style={[s.sectionLabel, { color: c.subtle }]}>
          {isTR ? 'HIZLI ERİŞİM' : 'QUICK ACCESS'}
        </Text>
        <View style={[s.card, { backgroundColor: c.card, borderColor: c.cardBorder }]}>
          {/* AI Insights — Pro only */}
          <TouchableOpacity
            style={s.settingRow}
            onPress={() => {
              tap();
              if (!isPro) { router.push('/modal'); return; }
              router.push('/ai-insights' as any);
            }}
          >
            <View style={[s.settingIcon, { backgroundColor: c.emerald + '15' }]}>
              <Brain size={18} color={c.emerald} />
            </View>
            <Text style={[s.settingText, { color: c.offWhite }]}>
              {isTR ? 'AI Önerileri' : 'AI Insights'}
            </Text>
            {!isPro && <Text style={[s.settingValue, { color: c.amber }]}>🔒 Pro</Text>}
            <ChevronRight size={16} color={c.dim} />
          </TouchableOpacity>

          <TouchableOpacity
            style={s.settingRow}
            onPress={() => { tap(); router.push('/manage-categories' as any); }}
          >
            <View style={[s.settingIcon, { backgroundColor: c.purple + '15' }]}>
              <Layers size={18} color={c.purple} />
            </View>
            <Text style={[s.settingText, { color: c.offWhite }]}>
              {isTR ? 'Kategorileri Yönet' : 'Manage Categories'}
            </Text>
            <ChevronRight size={16} color={c.dim} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[s.settingRow, { borderTopWidth: 1, borderTopColor: c.cardBorder + '50' }]}
            onPress={() => { tap(); router.push('/achievements' as any); }}
          >
            <View style={[s.settingIcon, { backgroundColor: c.amber + '15' }]}>
              <Text style={{ fontSize: 16 }}>🏆</Text>
            </View>
            <Text style={[s.settingText, { color: c.offWhite }]}>
              {isTR ? 'Başarımlar' : 'Achievements'}
            </Text>
            <ChevronRight size={16} color={c.dim} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[s.settingRow, { borderTopWidth: 1, borderTopColor: c.cardBorder + '50' }]}
            onPress={() => { tap(); router.push('/edit-profile' as any); }}
          >
            <View style={[s.settingIcon, { backgroundColor: c.blue + '15' }]}>
              <User size={18} color={c.blue} />
            </View>
            <Text style={[s.settingText, { color: c.offWhite }]}>{t.editProfile}</Text>
            <ChevronRight size={16} color={c.dim} />
          </TouchableOpacity>

          {isPro && (
            <TouchableOpacity
              style={[s.settingRow, { borderTopWidth: 1, borderTopColor: c.cardBorder + '50' }]}
              onPress={() => { tap(); router.push('/modal'); }}
            >
              <View style={[s.settingIcon, { backgroundColor: c.purple + '15' }]}>
                <Palette size={18} color={c.purple} />
              </View>
              <Text style={[s.settingText, { color: c.offWhite }]}>
                {isTR ? 'Pro Yönetimi' : 'Manage Pro'}
              </Text>
              <ChevronRight size={16} color={c.dim} />
            </TouchableOpacity>
          )}
          {!isPro && (
            <TouchableOpacity
              style={s.settingRow}
              onPress={() => { tap(); router.push('/modal'); }}
            >
              <View style={[s.settingIcon, { backgroundColor: c.amber + '15' }]}>
                <Shield size={18} color={c.amber} />
              </View>
              <Text style={[s.settingText, { color: c.offWhite }]}>
                {isTR ? 'Premium Plana Geç' : 'Upgrade Plan'}
              </Text>
              <ChevronRight size={16} color={c.dim} />
            </TouchableOpacity>
          )}


          {/* About */}
          <TouchableOpacity
            style={s.settingRow}
            onPress={() => {
              tap();
              Alert.alert(
                isTR ? "Hakkında" : "About",
                "Luxtra v1.0.0\nPersonal Life Manager\n\n© 2026 Luxtra",
                [{ text: "Tamam", style: "default" }]
              );
            }}
          >
            <View style={[s.settingIcon, { backgroundColor: c.dim + '15' }]}>
              <HelpCircle size={18} color={c.dim} />
            </View>
            <Text style={[s.settingText, { color: c.offWhite }]}>
              {isTR ? 'Uygulama Hakkında' : 'About App'}
            </Text>
            <ChevronRight size={16} color={c.dim} />
          </TouchableOpacity>
        </View>

        {/* Security & Alerts */}
        <Text style={[s.sectionLabel, { color: c.subtle }]}>
          {t.securityAlerts}
        </Text>
        <View style={[s.card, { backgroundColor: c.card, borderColor: c.cardBorder }]}>

          {/* Biometric Lock */}
          {hasBiometrics && (
            <TouchableOpacity
              style={s.settingRow}
              onPress={async () => {
                tap();
                if (!isBiometricEnabled) {
                  const result = await LocalAuthentication.authenticateAsync({
                    promptMessage: t.appLock,
                  });
                  if (result.success) {
                    toggleBiometric();
                    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                    if (!achievements.includes('biometric')) unlockAchievement('biometric');
                  }
                } else {
                  toggleBiometric();
                  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                }
              }}
            >
              <View style={[s.settingIcon, { backgroundColor: isBiometricEnabled ? c.emerald + '20' : c.red + '15' }]}>
                {isBiometricEnabled ? (
                  <Lock size={18} color={c.emerald} />
                ) : (
                  <Unlock size={18} color={c.red} />
                )}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[s.settingText, { color: c.offWhite }]}>
                  {t.appLock}
                </Text>
                <Text style={[{ fontSize: 11, fontWeight: '500', marginTop: 1 }, { color: c.subtle }]}>
                  {t.appLockDesc}
                </Text>
              </View>
              <View style={[
                s.toggle,
                {
                  backgroundColor: isBiometricEnabled ? c.emerald : c.cardBorder,
                  alignItems: isBiometricEnabled ? 'flex-end' : 'flex-start',
                }
              ]}>
                <View style={[s.toggleKnob, { backgroundColor: '#fff' }]} />
              </View>
            </TouchableOpacity>
          )}

          {/* Global Notifications Toggle */}
          <TouchableOpacity
            style={[s.settingRow, { borderTopWidth: 1, borderTopColor: c.cardBorder + '50' }]}
            onPress={() => {
              tap();
              setNotificationsEnabled(!notificationsEnabled);
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            }}
          >
            <View style={[s.settingIcon, { backgroundColor: notificationsEnabled ? c.blue + '15' : c.dim + '15' }]}>
              {notificationsEnabled ? <Bell size={18} color={c.blue} /> : <BellOff size={18} color={c.dim} />}
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[s.settingText, { color: c.offWhite }]}>
                {t.notificationsEnabled}
              </Text>
              <Text style={[{ fontSize: 11, fontWeight: '500', marginTop: 1 }, { color: c.subtle }]}>
                {t.notificationsEnabledDesc}
              </Text>
            </View>
            <View style={[
              s.toggle,
              {
                backgroundColor: notificationsEnabled ? c.blue : c.cardBorder,
                alignItems: notificationsEnabled ? 'flex-end' : 'flex-start',
              }
            ]}>
              <View style={[s.toggleKnob, { backgroundColor: '#fff' }]} />
            </View>
          </TouchableOpacity>

          {/* Notification Time */}
          {notificationsEnabled && (
            <TouchableOpacity
              style={[s.settingRow, { borderTopWidth: 1, borderTopColor: c.cardBorder + '50' }]}
              onPress={() => {
                tap();
                // Simple cycle for now: 08:00 -> 09:00 -> 10:00
                const times = ['08:00', '09:00', '10:00', '18:00', '20:00'];
                const idx = times.indexOf(notificationTime);
                setNotificationTime(times[(idx + 1) % times.length]);
              }}
            >
              <View style={[s.settingIcon, { backgroundColor: c.amber + '15' }]}>
                <Clock size={18} color={c.amber} />
              </View>
              <Text style={[s.settingText, { color: c.offWhite }]}>{t.reminderTime}</Text>
              <Text style={[s.settingValue, { color: c.muted }]}>{notificationTime}</Text>
              <ChevronRight size={16} color={c.dim} />
            </TouchableOpacity>
          )}

          {/* Test Notification */}
          <TouchableOpacity
            style={[s.settingRow, { borderTopWidth: 1, borderTopColor: c.cardBorder + '50' }]}
            onPress={async () => {
              tap();
              const { NotificationService } = require('../../src/services/notificationService');
              await NotificationService.scheduleNotification(
                'test-notif',
                'Luxtra ⚡',
                isTR ? 'Bu bir test bildirimidir!' : 'This is a test notification!',
                new Date(Date.now() + 2000), // 2 seconds later
                { type: 'test' }
              );
              Alert.alert(isTR ? 'Başarılı' : 'Success', t.testNotifySuccess);
            }}
          >
            <View style={[s.settingIcon, { backgroundColor: c.emerald + '15' }]}>
              <Radio size={18} color={c.emerald} />
            </View>
            <Text style={[s.settingText, { color: c.offWhite }]}>{t.testNotification}</Text>
            <ChevronRight size={16} color={c.dim} />
          </TouchableOpacity>

          {/* Privacy & Data */}
          <TouchableOpacity
            style={[s.settingRow, { borderTopWidth: 1, borderTopColor: c.cardBorder + '50' }]}
            onPress={() => {
              tap();
              Alert.alert(
                t.privacyData,
                isTR
                  ? 'Tüm verileriniz yalnızca bu cihazda saklanır. Sunucuya hiçbir kişisel bilgi gönderilmez. Verileriniz şifreli ve güvende.'
                  : 'All your data is stored only on this device. No personal information is sent to any server. Your data is encrypted and safe.',
                [{ text: isTR ? 'Tamam' : 'OK' }]
              );
            }}
          >
            <View style={[s.settingIcon, { backgroundColor: c.blue + '15' }]}>
              <Shield size={18} color={c.blue} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[s.settingText, { color: c.offWhite }]}>{t.privacyData}</Text>
              <Text style={[{ fontSize: 11, fontWeight: '500', marginTop: 1 }, { color: c.subtle }]}>
                {t.privacyDataDesc}
              </Text>
            </View>
            <ChevronRight size={16} color={c.dim} />
          </TouchableOpacity>

          {/* Reset Warning */}
          <TouchableOpacity
            style={[s.settingRow, { borderTopWidth: 1, borderTopColor: c.cardBorder + '50' }]}
            onPress={() => {
              tap();
              Alert.alert(
                isTR ? '⚠️ ' + t.resetData : '⚠️ ' + t.resetData,
                t.resetDataConfirm,
                [
                  { text: isTR ? 'İptal' : 'Cancel', style: 'cancel' },
                  {
                    text: isTR ? 'Sil' : 'Delete',
                    style: 'destructive',
                    onPress: () => { tap(); handleSignOut(); }
                  },
                ]
              );
            }}
          >
            <View style={[s.settingIcon, { backgroundColor: c.red + '15' }]}>
              <AlertTriangle size={18} color={c.red} />
            </View>
            <Text style={[s.settingText, { color: c.red }]}>
              {t.resetData}
            </Text>
            <ChevronRight size={16} color={c.red + '80'} />
          </TouchableOpacity>

        </View>

        {/* Sign Out */}
        <TouchableOpacity
          style={[s.signOutBtn, { backgroundColor: c.red + '10', borderColor: c.red + '20' }]}
          onPress={() => { tap(); handleSignOut(); }}
          activeOpacity={0.8}
        >
          <LogOut size={18} color={c.red} />
          <Text style={[s.signOutText, { color: c.red }]}>{t.signOut}</Text>
        </TouchableOpacity>

        <Text style={[s.version, { color: c.dim }]}>{t.version}</Text>
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
  title: {
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.5,
    marginBottom: 24,
  },

  /* Card */
  card: {
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
    overflow: 'hidden',
  },

  /* Account */
  accountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    gap: 14,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  name: {
    fontSize: 17,
    fontWeight: '700',
  },
  email: {
    fontSize: 13,
    fontWeight: '500',
    marginTop: 2,
  },
  proBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  proText: {
    fontSize: 11,
    fontWeight: '800',
  },
  versionText: {
    fontSize: 13,
    fontWeight: '600',
  },
  toggle: {
    width: 44,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    padding: 2,
  },
  toggleKnob: {
    width: 20,
    height: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
    elevation: 2,
  },

  /* Stats */
  statsRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 14,
  },
  statNum: {
    fontSize: 20,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
  },

  /* Pro Card */
  proCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    borderRadius: 16,
    borderWidth: 1,
    gap: 14,
    marginBottom: 24,
  },
  proTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  proSub: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },

  /* Section */
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    marginBottom: 8,
    marginLeft: 4,
  },

  /* Setting Rows */
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 14,
  },
  settingIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
  },
  settingValue: {
    fontSize: 13,
    fontWeight: '600',
  },

  /* Budget Input */
  budgetInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 10,
  },
  budgetInput: {
    flex: 1,
    height: 44,
    borderRadius: 10,
    paddingHorizontal: 14,
    fontSize: 16,
    fontWeight: '600',
    borderWidth: 1,
  },
  budgetSaveBtn: {
    height: 44,
    paddingHorizontal: 18,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  budgetSaveTxt: {
    color: '#0F1419',
    fontSize: 13,
    fontWeight: '700',
  },

  /* Sign Out */
  signOutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    gap: 10,
    marginTop: 8,
  },
  signOutText: {
    fontSize: 15,
    fontWeight: '700',
  },
  version: {
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '500',
    marginTop: 16,
    marginBottom: 8,
  },
});