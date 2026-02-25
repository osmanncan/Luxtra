import Constants from 'expo-constants';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { ArrowLeft, Calendar, CalendarDays, RefreshCw, Shield } from 'lucide-react-native';
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
import { canAddResponsibility, FREE_LIMITS } from '../src/store/proFeatures';
import { useThemeColors } from '../src/store/theme';
import { useStore } from '../src/store/useStore';

type NotificationsModule = typeof import('expo-notifications');

const isExpoGo = Constants.appOwnership === 'expo';
const Notifications: NotificationsModule | null = !isExpoGo
    ? (require('expo-notifications') as NotificationsModule)
    : null;

export default function AddResponsibility() {
    const router = useRouter();
    const addTask = useStore((s) => s.addTask);
    const tasks = useStore((s) => s.tasks);
    const isPro = useStore((s) => s.user?.isPro ?? false);
    const language = useStore((s) => s.language);
    const c = useThemeColors();
    const isTR = language === 'tr';

    const [title, setTitle] = useState('');
    const [daysDue, setDaysDue] = useState('');
    const [isRecurring, setIsRecurring] = useState(false);
    const [recurringMonths, setRecurringMonths] = useState('');

    // Reminder state
    const [reminderType, setReminderType] = useState<'days' | 'months' | 'custom'>('days');
    const [reminderDays, setReminderDays] = useState(1);
    const [reminderMonths, setReminderMonths] = useState(1);

    // Custom date picker state
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

    const handleSave = async () => {
        if (!canAddResponsibility(tasks.length, isPro)) {
            Alert.alert(
                isTR ? 'Limit Aşıldı' : 'Limit Reached',
                isTR
                    ? `Ücretsiz planda en fazla ${FREE_LIMITS.maxResponsibilities} sorumluluk ekleyebilirsin. Pro'ya geç!`
                    : `Free plan allows up to ${FREE_LIMITS.maxResponsibilities} responsibilities. Upgrade to Pro!`,
                [
                    { text: isTR ? 'İptal' : 'Cancel', style: 'cancel' },
                    { text: isTR ? 'Pro\'ya Geç' : 'Upgrade', onPress: () => router.push('/modal') },
                ]
            );
            return;
        }

        if (!title.trim()) {
            Alert.alert(isTR ? 'Hata' : 'Error', isTR ? 'Lütfen bir başlık girin' : 'Please enter a title');
            return;
        }

        const days = parseInt(daysDue);
        if (!daysDue || isNaN(days)) {
            Alert.alert(isTR ? 'Hata' : 'Error', isTR ? 'Lütfen kaç gün sonra olduğunu girin' : 'Please enter due days');
            return;
        }

        if (isRecurring && !isPro) {
            Alert.alert(
                isTR ? 'Pro Özelliği' : 'Pro Feature',
                isTR
                    ? 'Tekrarlayan görevler Pro özelliğidir. Yükseltmek ister misin?'
                    : 'Recurring tasks are a Pro feature. Would you like to upgrade?',
                [
                    { text: isTR ? 'İptal' : 'Cancel', style: 'cancel' },
                    { text: isTR ? 'Pro\'ya Geç' : 'Upgrade', onPress: () => router.push('/modal') },
                ]
            );
            return;
        }

        const due = new Date();
        due.setDate(due.getDate() + (parseInt(daysDue) || 0));

        const newId = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
        const reminderDateValue = reminderType === 'custom' ? getCustomReminderDate()?.toISOString() : undefined;

        await addTask({
            id: newId,
            title: title.trim(),
            dueDate: due.toISOString(),
            isCompleted: false,
            priority: 'medium',
            type: 'life',
            isRecurring,
            recurringMonths: isRecurring ? (parseInt(recurringMonths) || 6) : undefined,
            reminderDays: reminderType === 'days' ? reminderDays : reminderType === 'months' ? reminderMonths * 30 : 1,
            reminderDate: reminderDateValue,
        });

        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

        router.back();
    };

    const isValid = title.trim().length > 0;

    return (
        <View style={[s.container, { backgroundColor: c.base }]}>
            <View style={s.header}>
                <TouchableOpacity onPress={() => router.back()} style={[s.backBtn, { backgroundColor: c.card, borderColor: c.cardBorder }]}>
                    <ArrowLeft size={22} color={c.offWhite} strokeWidth={2.5} />
                </TouchableOpacity>
                <Text style={[s.headerTitle, { color: c.offWhite }]}>
                    {isTR ? 'Yeni Sorumluluk' : 'New Responsibility'}
                </Text>
                <View style={{ width: 40 }} />
            </View>

            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
                <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>

                    <HeroCard
                        emoji="📌"
                        title={isTR ? 'Ne halledilmeli?' : 'What needs handling?'}
                        subtitle={isTR ? 'Takip edip doğru zamanda seni hatırlatacağız.' : "We'll keep track and remind you at the right time."}
                        colors={c}
                    />

                    <FormField
                        label={isTR ? 'Başlık' : 'Title'}
                        placeholder={isTR ? 'örn. Araç Sigortası Yenile' : 'e.g. Renew Car Insurance'}
                        value={title}
                        onChangeText={setTitle}
                        colors={c}
                        autoFocus
                    />

                    <FormField
                        label={isTR ? 'Kaç Gün Sonra' : 'Due In (Days)'}
                        placeholder={isTR ? 'örn. 14' : 'e.g. 14'}
                        keyboardType="number-pad"
                        value={daysDue}
                        onChangeText={setDaysDue}
                        colors={c}
                        icon={<Calendar size={18} color={c.dim} style={{ marginRight: 12 }} />}
                        suffix={isTR ? 'gün sonra' : 'days from now'}
                    />

                    <Text style={[s.label, { color: c.subtle }]}>
                        {isTR ? 'TEKRARLAYAN MI?' : 'RECURRING?'}
                    </Text>
                    <TouchableOpacity
                        style={[s.recurToggle, { backgroundColor: c.card, borderColor: isRecurring ? c.blue : c.cardBorder }]}
                        onPress={() => { setIsRecurring(!isRecurring); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
                        activeOpacity={0.8}
                    >
                        <RefreshCw size={18} color={isRecurring ? c.blue : c.dim} />
                        <Text style={[s.recurLabel, { color: isRecurring ? c.blue : c.muted }]}>
                            {isRecurring ? (isTR ? 'Tekrarlayan görev' : 'Recurring task') : (isTR ? 'Tek seferlik görev' : 'One-time task')}
                        </Text>
                        <View style={[s.recurDot, { backgroundColor: isRecurring ? c.blue : c.dim }]} />
                    </TouchableOpacity>

                    {isRecurring && (
                        <View style={{ marginTop: 8 }}>
                            <Text style={[s.label, { color: c.subtle }]}>
                                {isTR ? 'KAÇ AYDA BİR' : 'REPEAT EVERY (MONTHS)'}
                            </Text>
                            <View style={s.recurOptions}>
                                {[3, 6, 12].map(m => (
                                    <TouchableOpacity
                                        key={m}
                                        style={[s.recurOption, {
                                            backgroundColor: (parseInt(recurringMonths) || 6) === m ? c.blue + '20' : c.card,
                                            borderColor: (parseInt(recurringMonths) || 6) === m ? c.blue : c.cardBorder,
                                        }]}
                                        onPress={() => setRecurringMonths(m.toString())}
                                    >
                                        <Text style={[s.recurOptionText, { color: (parseInt(recurringMonths) || 6) === m ? c.blue : c.muted }]}>
                                            {m} {isTR ? 'ay' : 'mo'}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    )}

                    <Text style={[s.label, { color: c.subtle, marginTop: 16 }]}>
                        {isTR ? 'HATIRLATMA' : 'REMINDER'}
                    </Text>

                    <View style={[s.reminderTypeTabs, { backgroundColor: c.card, borderColor: c.cardBorder }]}>
                        {(['days', 'months', 'custom'] as const).map(type => (
                            <TouchableOpacity
                                key={type}
                                style={[s.reminderTypeTab, {
                                    backgroundColor: reminderType === type ? c.emerald + '20' : 'transparent',
                                    borderColor: reminderType === type ? c.emerald : 'transparent',
                                }]}
                                onPress={() => {
                                    setReminderType(type);
                                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                    if (type === 'custom') setShowCustomDate(true);
                                }}
                            >
                                <Text style={[s.reminderTypeLabel, { color: reminderType === type ? c.emerald : c.subtle }]}>
                                    {type === 'days' ? (isTR ? 'Gün' : 'Days') : type === 'months' ? (isTR ? 'Ay' : 'Months') : (isTR ? 'Özel' : 'Custom')}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {reminderType === 'days' && (
                        <View style={s.recurOptions}>
                            {[1, 2, 3, 5, 7].map(d => (
                                <TouchableOpacity
                                    key={d}
                                    style={[s.recurOption, {
                                        backgroundColor: reminderDays === d ? c.emerald + '20' : c.card,
                                        borderColor: reminderDays === d ? c.emerald : c.cardBorder,
                                    }]}
                                    onPress={() => setReminderDays(d)}
                                >
                                    <Text style={[s.recurOptionText, { color: reminderDays === d ? c.emerald : c.muted }]}>
                                        {d} {isTR ? (d === 7 ? 'hf' : 'gün') : (d === 7 ? 'wk' : 'd')}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}

                    {reminderType === 'months' && (
                        <View style={s.recurOptions}>
                            {[1, 2, 3].map(m => (
                                <TouchableOpacity
                                    key={m}
                                    style={[s.recurOption, {
                                        backgroundColor: reminderMonths === m ? c.emerald + '20' : c.card,
                                        borderColor: reminderMonths === m ? c.emerald : c.cardBorder,
                                    }]}
                                    onPress={() => setReminderMonths(m)}
                                >
                                    <Text style={[s.recurOptionText, { color: reminderMonths === m ? c.emerald : c.muted }]}>
                                        {m} {isTR ? 'ay' : 'mo'}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}

                    {reminderType === 'custom' && (
                        <TouchableOpacity
                            style={[s.customDateBtn, { backgroundColor: c.card, borderColor: c.emerald + '40' }]}
                            onPress={() => setShowCustomDate(true)}
                        >
                            <CalendarDays size={18} color={c.emerald} />
                            <Text style={[s.customDateLabel, { color: c.offWhite }]}>
                                {getReminderLabel()}
                            </Text>
                            <Text style={[{ fontSize: 12, color: c.emerald, fontWeight: '600' }]}>
                                {isTR ? 'Değiştir' : 'Change'}
                            </Text>
                        </TouchableOpacity>
                    )}

                    <View style={[s.infoCard, { backgroundColor: c.emerald + '10', borderColor: c.emerald + '20' }]}>
                        <Shield size={16} color={c.emerald} />
                        <Text style={[s.infoText, { color: c.subtle }]}>
                            {isTR ? 'Seçtiğin tarihte akıllı bir hatırlatma göndereceğiz.' : "We'll send you a smart reminder on your chosen date."}
                        </Text>
                    </View>

                    <TouchableOpacity
                        style={[s.saveBtn, { backgroundColor: isValid ? c.emerald : c.card }, !isValid && { borderWidth: 1, borderColor: c.cardBorder }]}
                        onPress={handleSave}
                        disabled={!isValid}
                        activeOpacity={0.85}
                    >
                        <Text style={[s.saveText, { color: isValid ? '#0F1419' : c.dim }]}>
                            {isTR ? 'Bize bırak' : 'Hand it over'}
                        </Text>
                    </TouchableOpacity>
                </ScrollView>
            </KeyboardAvoidingView>

            <CustomDatePickerModal
                visible={showCustomDate}
                onClose={() => { setReminderType('days'); setShowCustomDate(false); }}
                onConfirm={() => { setShowCustomDate(false); Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); }}
                isTR={isTR}
                colors={c}
                state={{ day: customDay, month: customMonth, year: customYear }}
                setState={{ setDay: setCustomDay, setMonth: setCustomMonth, setYear: setCustomYear }}
            />
        </View>
    );
}

const s = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: Platform.OS === 'ios' ? 56 : 40,
        paddingHorizontal: 20,
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
        borderWidth: 1,
        borderRadius: 14,
        paddingHorizontal: 18,
        paddingVertical: 16,
        marginBottom: 20,
    },
    input: {
        fontSize: 16,
        fontWeight: '500',
        flex: 1,
    },
    daysSuffix: {
        fontSize: 13,
        fontWeight: '500',
    },

    /* Reminder */
    reminderTypeTabs: {
        flexDirection: 'row',
        borderRadius: 14,
        borderWidth: 1,
        padding: 4,
        marginBottom: 12,
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
        marginBottom: 8,
    },
    customDateLabel: {
        flex: 1,
        fontSize: 15,
        fontWeight: '600',
    },

    /* Info */
    infoCard: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        gap: 10,
        marginBottom: 28,
        marginTop: 8,
        borderWidth: 1,
    },
    infoText: {
        fontSize: 13,
        fontWeight: '500',
        flex: 1,
    },

    /* Save */
    saveBtn: {
        borderRadius: 14,
        paddingVertical: 18,
        alignItems: 'center',
    },
    saveText: {
        fontSize: 16,
        fontWeight: '700',
    },

    /* Recurring */
    recurToggle: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderRadius: 14,
        paddingHorizontal: 18,
        paddingVertical: 14,
        gap: 12,
        marginBottom: 16,
    },
    recurLabel: {
        flex: 1,
        fontSize: 15,
        fontWeight: '600',
    },
    recurDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
    },
    recurOptions: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 16,
    },
    recurOption: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 12,
        borderWidth: 1,
        alignItems: 'center',
    },
    recurOptionText: {
        fontSize: 14,
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
