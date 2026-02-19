import * as Haptics from 'expo-haptics';
import * as Notifications from 'expo-notifications';
import { useRouter } from 'expo-router';
import { ArrowLeft, Calendar, RefreshCw, Shield } from 'lucide-react-native';
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
import { canAddResponsibility, FREE_LIMITS } from '../src/store/proFeatures';
import { useThemeColors } from '../src/store/theme';
import { useStore } from '../src/store/useStore';

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
    const [reminderDays, setReminderDays] = useState(1);

    const handleSave = async () => {
        if (!title.trim()) return;

        // Check free limit
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

        // Recurring is Pro-only
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

        addTask({
            id: Date.now().toString(),
            title: title.trim(),
            dueDate: due.toISOString(),
            isCompleted: false,
            priority: 'medium',
            type: 'life',
            isRecurring,
            recurringMonths: isRecurring ? (parseInt(recurringMonths) || 6) : undefined,
        });

        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

        // Schedule notification
        const remindDate = new Date(due);
        remindDate.setDate(remindDate.getDate() - reminderDays);

        if (remindDate > new Date()) {
            try {
                await Notifications.scheduleNotificationAsync({
                    content: {
                        title: isTR ? 'Sorumluluk Hatırlatması 📌' : 'Responsibility Reminder 📌',
                        body: isTR ? `"${title.trim()}" yarın son gün!` : `"${title.trim()}" is due tomorrow!`,
                    },
                    trigger: {
                        type: Notifications.SchedulableTriggerInputTypes.DATE,
                        date: remindDate,
                    },
                });
            } catch (e) {
                // Notification may fail in Expo Go, that's ok
            }
        }

        router.back();
    };

    const isValid = title.trim().length > 0;

    return (
        <View style={[s.container, { backgroundColor: c.base }]}>
            {/* Header */}
            <View style={s.header}>
                <TouchableOpacity onPress={() => router.back()} style={[s.backBtn, { backgroundColor: c.card, borderColor: c.cardBorder }]}>
                    <ArrowLeft size={22} color={c.offWhite} />
                </TouchableOpacity>
                <Text style={[s.headerTitle, { color: c.offWhite }]}>
                    {isTR ? 'Yeni Sorumluluk' : 'New Responsibility'}
                </Text>
                <View style={{ width: 40 }} />
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={{ flex: 1 }}
            >
                <ScrollView
                    contentContainerStyle={{ paddingBottom: 40 }}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Hero */}
                    <View style={[s.heroCard, { backgroundColor: c.card, borderColor: c.cardBorder }]}>
                        <View style={[s.heroIcon, { backgroundColor: c.cardBorder }]}>
                            <Text style={{ fontSize: 28 }}>📌</Text>
                        </View>
                        <Text style={[s.heroTitle, { color: c.offWhite }]}>
                            {isTR ? 'Ne halledilmeli?' : 'What needs handling?'}
                        </Text>
                        <Text style={[s.heroSub, { color: c.subtle }]}>
                            {isTR ? 'Takip edip doğru zamanda seni hatırlatacağız.' : "We'll keep track and remind you at the right time."}
                        </Text>
                    </View>

                    {/* Form */}
                    <Text style={[s.label, { color: c.subtle }]}>
                        {isTR ? 'BAŞLIK' : 'TITLE'}
                    </Text>
                    <View style={[s.inputWrap, { backgroundColor: c.card, borderColor: c.cardBorder }]}>
                        <TextInput
                            style={[s.input, { color: c.offWhite }]}
                            placeholder={isTR ? 'örn. Araç Sigortası Yenile' : 'e.g. Renew Car Insurance'}
                            placeholderTextColor={c.dim}
                            value={title}
                            onChangeText={setTitle}
                            autoFocus
                        />
                    </View>

                    <Text style={[s.label, { color: c.subtle }]}>
                        {isTR ? 'KAÇ GÜN SONRA' : 'DUE IN (DAYS)'}
                    </Text>
                    <View style={[s.inputWrap, { backgroundColor: c.card, borderColor: c.cardBorder }]}>
                        <Calendar size={18} color={c.dim} style={{ marginRight: 12 }} />
                        <TextInput
                            style={[s.input, { flex: 1, color: c.offWhite }]}
                            placeholder={isTR ? 'örn. 14' : 'e.g. 14'}
                            placeholderTextColor={c.dim}
                            keyboardType="number-pad"
                            value={daysDue}
                            onChangeText={setDaysDue}
                        />
                        <Text style={[s.daysSuffix, { color: c.dim }]}>
                            {isTR ? 'gün sonra' : 'days from now'}
                        </Text>
                    </View>

                    {/* Recurring */}
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
                            {isRecurring
                                ? (isTR ? 'Tekrarlayan görev' : 'Recurring task')
                                : (isTR ? 'Tek seferlik görev' : 'One-time task')}
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
                                        <Text style={[s.recurOptionText, {
                                            color: (parseInt(recurringMonths) || 6) === m ? c.blue : c.muted
                                        }]}>
                                            {m} {isTR ? 'ay' : 'mo'}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    )}

                    {/* Reminder */}
                    <Text style={[s.label, { color: c.subtle, marginTop: 16 }]}>
                        {isTR ? 'HATIRLATMA' : 'REMINDER'}
                    </Text>
                    <View style={s.recurOptions}>
                        {[1, 3, 7].map(d => (
                            <TouchableOpacity
                                key={d}
                                style={[s.recurOption, {
                                    backgroundColor: reminderDays === d ? c.emerald + '20' : c.card,
                                    borderColor: reminderDays === d ? c.emerald : c.cardBorder,
                                }]}
                                onPress={() => setReminderDays(d)}
                            >
                                <Text style={[s.recurOptionText, {
                                    color: reminderDays === d ? c.emerald : c.muted
                                }]}>
                                    {d} {isTR ? (d === 7 ? 'hf' : 'gün') : (d === 7 ? 'wk' : 'd')}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Info */}
                    <View style={[s.infoCard, { backgroundColor: c.emerald + '10', borderColor: c.emerald + '20' }]}>
                        <Shield size={16} color={c.emerald} />
                        <Text style={[s.infoText, { color: c.subtle }]}>
                            {isTR ? 'Son tarihten önce sana akıllı bir hatırlatma göndereceğiz.' : "We'll send you a smart reminder before the due date."}
                        </Text>
                    </View>

                    {/* Save */}
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

    /* Info */
    infoCard: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        gap: 10,
        marginBottom: 28,
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
});
