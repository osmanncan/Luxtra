import { useLocalSearchParams, useRouter } from 'expo-router';
import {
    ArrowLeft,
    Bell,
    Calendar,
    CalendarDays,
    Check,
    DollarSign,
    Repeat,
    Save,
    Tag,
    Trash2
} from 'lucide-react-native';
import React, { useEffect, useRef, useState } from 'react';
import {
    Alert,
    Animated,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { CustomDatePickerModal } from '../../src/components/shared/CustomDatePickerModal';
import { FormField } from '../../src/components/shared/FormField';
import { HeroCard } from '../../src/components/shared/HeroCard';
import { useThemeColors } from '../../src/store/theme';
import { translations } from '../../src/store/translations';
import { CURRENCIES, SUB_CATEGORIES, useStore } from '../../src/store/useStore';

export default function SubscriptionDetails() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const { subscriptions, removeSubscription, updateSubscription, markSubscriptionPaid, language, currency, customCategories } = useStore();
    const c = useThemeColors();
    const isTR = language === 'tr';
    const t = translations[language].editSubscription;
    const curr = CURRENCIES[currency] || CURRENCIES.TRY;

    const subId = Array.isArray(id) ? id[0] : id;
    const sub = subscriptions.find((s) => s.id === subId);
    const [isEditing, setIsEditing] = useState(false);
    const [name, setName] = useState(sub?.name || '');
    const [amount, setAmount] = useState(sub?.amount.toString() || '');
    const [desc, setDesc] = useState(sub?.description || '');
    const [category, setCategory] = useState(sub?.category || 'General');
    const [cycle, setCycle] = useState<'monthly' | 'yearly'>(sub?.billingCycle || 'monthly');
    const [day, setDay] = useState(sub ? new Date(sub.nextBillingDate).getDate().toString() : '');
    const [reminderType, setReminderType] = useState<'days' | 'months' | 'custom'>(
        sub?.reminderDate ? 'custom' : (sub?.reminderDays && sub.reminderDays >= 30 ? 'months' : 'days')
    );
    const [reminderDays, setReminderDays] = useState(sub?.reminderDays && sub.reminderDays < 30 ? sub.reminderDays : 1);
    const [reminderMonths, setReminderMonths] = useState(sub?.reminderDays && sub.reminderDays >= 30 ? Math.floor(sub.reminderDays / 30) : 1);

    const [showCustomDate, setShowCustomDate] = useState(false);
    const [customDay, setCustomDay] = useState(sub?.reminderDate ? new Date(sub.reminderDate).getDate().toString() : '');
    const [customMonth, setCustomMonth] = useState(sub?.reminderDate ? (new Date(sub.reminderDate).getMonth() + 1).toString() : '');
    const [customYear, setCustomYear] = useState(sub?.reminderDate ? new Date(sub.reminderDate).getFullYear().toString() : new Date().getFullYear().toString());

    const getCustomReminderDate = (): Date | null => {
        const d_ = parseInt(customDay);
        const m_ = parseInt(customMonth) - 1;
        const y_ = parseInt(customYear);
        if (isNaN(d_) || isNaN(m_) || isNaN(y_)) return null;
        const date = new Date(y_, m_, d_);
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
        const d_ = getCustomReminderDate();
        if (!d_) return isTR ? 'Tarih seç' : 'Pick date';
        return d_.toLocaleDateString(isTR ? 'tr-TR' : 'en-US', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    const allCategories = { ...SUB_CATEGORIES, ...customCategories };
    const checkScaleAnim = useRef(new Animated.Value(sub?.isPaid ? 1 : 0)).current;

    useEffect(() => {
        Animated.spring(checkScaleAnim, {
            toValue: sub?.isPaid ? 1 : 0,
            tension: 80,
            friction: 6,
            useNativeDriver: true,
        }).start();
    }, [sub?.isPaid]);

    if (!sub) {
        return (
            <View style={[s.container, { backgroundColor: c.base }]}>
                <Text style={{ color: c.offWhite, textAlign: 'center', marginTop: 100 }}>
                    {isTR ? 'Abonelik bulunamadı' : 'Subscription not found'}
                </Text>
            </View>
        );
    }

    const cat = allCategories[sub.category] ?? SUB_CATEGORIES.General;

    const handleDelete = () => {
        Alert.alert(
            t.deleteSubscription + '?',
            t.deleteConfirm,
            [
                { text: isTR ? 'İptal' : 'Cancel', style: 'cancel' },
                {
                    text: isTR ? 'Sil' : 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        const { NotificationService } = require('../../src/services/notificationService');
                        await NotificationService.cancelNotification(sub.id);
                        removeSubscription(sub.id);
                        router.back();
                    }
                }
            ]
        );
    };

    const handleSave = () => {
        if (!name.trim() || !amount || !day) {
            Alert.alert(isTR ? 'Hata' : 'Error', isTR ? 'Lütfen tüm alanları doldurun.' : 'Please fill all fields.');
            return;
        }

        const today = new Date();
        let nextDate = new Date(today.getFullYear(), today.getMonth(), parseInt(day));
        if (nextDate < today) nextDate.setMonth(nextDate.getMonth() + 1);

        const reminderDateValue = reminderType === 'custom' ? getCustomReminderDate()?.toISOString() : undefined;
        const calculatedReminderDays = reminderType === 'days' ? reminderDays : reminderType === 'months' ? reminderMonths * 30 : 1;

        updateSubscription(sub.id, {
            name: name.trim(),
            amount: parseFloat(amount) || 0,
            description: desc,
            category,
            billingCycle: cycle,
            nextBillingDate: nextDate.toISOString(),
            reminderDate: reminderDateValue,
            reminderDays: calculatedReminderDays,
        });
        if (!sub.isPaid) {
            const { NotificationService } = require('../../src/services/notificationService');
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

            if (remindDate && remindDate > new Date()) {
                NotificationService.scheduleNotification(
                    sub.id,
                    isTR ? 'Ödeme Hatırlatması 💸' : 'Payment Reminder 💸',
                    isTR
                        ? `${name.trim()} (${curr.symbol}${amount}) yakında ödenecek!`
                        : `${name.trim()} (${curr.symbol}${amount}) is due soon!`,
                    remindDate,
                    { id: sub.id, type: 'subscription' }
                );
            } else {
                NotificationService.cancelNotification(sub.id);
            }
        }

        setIsEditing(false);
    };

    const handleMarkPaid = () => {
        markSubscriptionPaid(sub.id);
    };

    const nextDate = new Date(sub.nextBillingDate);
    const diffDays = Math.ceil((nextDate.getTime() - Date.now()) / 86400000);

    return (
        <View style={[s.container, { backgroundColor: c.base }]}>
            <View style={s.header}>
                <TouchableOpacity onPress={() => router.back()} style={[s.backBtn, { backgroundColor: c.card, borderColor: c.cardBorder }]}>
                    <ArrowLeft size={22} color={c.offWhite} />
                </TouchableOpacity>
                <Text style={[s.headerTitle, { color: c.offWhite }]}>
                    {isEditing ? t.title : (isTR ? 'Detaylar' : 'Details')}
                </Text>
                <TouchableOpacity onPress={() => {
                    if (isEditing) {
                        setName(sub.name);
                        setAmount(sub.amount.toString());
                        setDesc(sub.description || '');
                        setCategory(sub.category);
                        setCycle(sub.billingCycle);
                        setDay(new Date(sub.nextBillingDate).getDate().toString());
                    }
                    setIsEditing(!isEditing);
                }}>
                    <Text style={[s.editText, { color: isEditing ? c.red : c.emerald }]}>
                        {isEditing ? (isTR ? 'İptal' : 'Cancel') : (isTR ? 'Düzenle' : 'Edit')}
                    </Text>
                </TouchableOpacity>
            </View>

            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
                <ScrollView contentContainerStyle={{ paddingBottom: 60 }} showsVerticalScrollIndicator={false}>
                    {!isEditing ? (
                        <>
                            <HeroCard
                                emoji={cat.emoji}
                                title={sub.name}
                                subtitle={`${curr.symbol}${sub.amount.toFixed(2)} / ${sub.billingCycle === 'monthly' ? (isTR ? 'ay' : 'mo') : (isTR ? 'yıl' : 'yr')}`}
                                colors={c}
                            />

                            <View style={{ alignItems: 'center', marginTop: -10, marginBottom: 20 }}>
                                {diffDays >= 0 && (
                                    <View style={[s.duePill, { backgroundColor: c.amber + '12', borderColor: c.amber + '25' }]}>
                                        <Text style={[s.dueText, { color: c.amber }]}>
                                            {diffDays === 0 ? (isTR ? 'Bugün ödenmeli' : 'Due today') :
                                                diffDays === 1 ? (isTR ? 'Yarın ödenmeli' : 'Due tomorrow') :
                                                    (isTR ? `${diffDays} gün sonra` : `Due in ${diffDays} days`)}
                                        </Text>
                                    </View>
                                )}
                                {sub.isPaid && (
                                    <Animated.View style={[s.paidBadgeLarge, { transform: [{ scale: checkScaleAnim }] }]}>
                                        <Check size={16} color={c.emerald} strokeWidth={3} />
                                        <Text style={[s.paidBadgeText, { color: c.emerald }]}>{isTR ? 'Ödendi' : 'Paid'}</Text>
                                    </Animated.View>
                                )}
                            </View>

                            <TouchableOpacity
                                onPress={handleMarkPaid}
                                style={[s.markPaidBtn, { backgroundColor: sub.isPaid ? c.card : c.emerald + '12', borderColor: sub.isPaid ? c.cardBorder : c.emerald + '30' }]}
                            >
                                <Check size={18} color={sub.isPaid ? c.muted : c.emerald} strokeWidth={2.5} />
                                <Text style={[s.markPaidText, { color: sub.isPaid ? c.muted : c.emerald }]}>
                                    {sub.isPaid ? (isTR ? 'Ödenmedi Olarak İşaretle' : 'Mark as Unpaid') : (isTR ? 'Ödendi Olarak İşaretle' : 'Mark as Paid')}
                                </Text>
                            </TouchableOpacity>
                        </>
                    ) : (
                        <View style={s.form}>
                            <FormField
                                label={t.nameLabel}
                                icon={<Tag size={16} color={c.dim} />}
                                value={name}
                                onChangeText={setName}
                                colors={c}
                            />

                            <FormField
                                label={t.amountLabel}
                                icon={<DollarSign size={16} color={c.dim} />}
                                value={amount}
                                onChangeText={setAmount}
                                keyboardType="decimal-pad"
                                suffix={curr.code}
                                colors={c}
                            />

                            <FormField
                                label={t.dayLabel}
                                icon={<Calendar size={16} color={c.dim} />}
                                value={day}
                                onChangeText={setDay}
                                keyboardType="number-pad"
                                maxLength={2}
                                colors={c}
                            />

                            <View style={s.field}>
                                <Text style={[s.label, { color: c.subtle }]}>{t.cycleLabel.toUpperCase()}</Text>
                                <View style={s.cycleRow}>
                                    {(['monthly', 'yearly'] as const).map((opt) => (
                                        <TouchableOpacity
                                            key={opt}
                                            onPress={() => setCycle(opt)}
                                            style={[s.cycleBtn, { backgroundColor: c.card, borderColor: cycle === opt ? c.emerald + '30' : c.cardBorder }]}
                                        >
                                            <Repeat size={14} color={cycle === opt ? c.emerald : c.dim} />
                                            <Text style={[s.cycleBtnText, { color: cycle === opt ? c.emerald : c.subtle }]}>
                                                {opt === 'monthly' ? (isTR ? 'Aylık' : 'Monthly') : (isTR ? 'Yıllık' : 'Yearly')}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>

                            <View style={s.field}>
                                <Text style={[s.label, { color: c.subtle }]}>{isTR ? 'HATIRLATMA' : 'REMINDER'}</Text>
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
                                    <View style={s.cycleRow}>
                                        {[1, 2, 3, 5, 7].map((days) => (
                                            <TouchableOpacity
                                                key={days}
                                                onPress={() => setReminderDays(days)}
                                                style={[s.cycleBtn, { backgroundColor: c.card, borderColor: reminderDays === days ? c.emerald + '30' : c.cardBorder, minWidth: 60 }]}
                                            >
                                                <Bell size={12} color={reminderDays === days ? c.emerald : c.dim} />
                                                <Text style={[s.cycleBtnText, { color: reminderDays === days ? c.emerald : c.subtle, fontSize: 11 }]}>
                                                    {isTR ? (days === 7 ? '1 Hf' : `${days} G`) : (days === 7 ? '1 W' : `${days} D`)}
                                                </Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                )}

                                {reminderType === 'months' && (
                                    <View style={s.cycleRow}>
                                        {[1, 2, 3].map((m) => (
                                            <TouchableOpacity
                                                key={m}
                                                onPress={() => setReminderMonths(m)}
                                                style={[s.cycleBtn, { backgroundColor: c.card, borderColor: reminderMonths === m ? c.emerald + '30' : c.cardBorder }]}
                                            >
                                                <Bell size={12} color={reminderMonths === m ? c.emerald : c.dim} />
                                                <Text style={[s.cycleBtnText, { color: reminderMonths === m ? c.emerald : c.subtle }]}>
                                                    {m} {isTR ? 'Ay' : 'Mo'}
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
                                        <Text style={{ fontSize: 12, color: c.emerald, fontWeight: '600' }}>
                                            {isTR ? 'Değiştir' : 'Change'}
                                        </Text>
                                    </TouchableOpacity>
                                )}
                            </View>

                            <View style={s.field}>
                                <Text style={[s.label, { color: c.subtle }]}>{t.categoryLabel.toUpperCase()}</Text>
                                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 4 }}>
                                    {Object.keys(allCategories).map((cat_key) => {
                                        const catConfig = allCategories[cat_key];
                                        const active = category === cat_key;
                                        return (
                                            <TouchableOpacity
                                                key={cat_key}
                                                onPress={() => setCategory(cat_key)}
                                                style={[s.catChip, { backgroundColor: c.card, borderColor: active ? c.emerald + '30' : c.cardBorder }]}
                                            >
                                                <Text style={{ fontSize: 14 }}>{catConfig.emoji}</Text>
                                                <Text style={[s.catChipText, { color: active ? c.emerald : c.subtle }]}>
                                                    {cat_key}
                                                </Text>
                                            </TouchableOpacity>
                                        );
                                    })}
                                </ScrollView>
                            </View>
                        </View>
                    )}

                    {!isEditing && (
                        <View style={s.form}>
                            <View style={s.field}>
                                <Text style={[s.label, { color: c.subtle }]}>{isTR ? 'SONRAKİ ÖDEME' : 'NEXT BILLING'}</Text>
                                <View style={[s.displayField, { backgroundColor: c.card, borderColor: c.cardBorder, flexDirection: 'row', alignItems: 'center', gap: 10 }]}>
                                    <Calendar size={16} color={c.dim} />
                                    <Text style={[s.value, { color: c.offWhite }]}>
                                        {nextDate.toLocaleDateString(isTR ? 'tr-TR' : 'en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                    </Text>
                                </View>
                            </View>

                            <View style={s.field}>
                                <Text style={[s.label, { color: c.subtle }]}>{isTR ? 'HATIRLATMA' : 'REMINDER'}</Text>
                                <View style={[s.displayField, { backgroundColor: c.card, borderColor: c.cardBorder, flexDirection: 'row', alignItems: 'center', gap: 10 }]}>
                                    <Bell size={16} color={c.dim} />
                                    <Text style={[s.value, { color: c.offWhite }]}>
                                        {sub.reminderDate
                                            ? new Date(sub.reminderDate).toLocaleDateString(isTR ? 'tr-TR' : 'en-US', { day: 'numeric', month: 'long', year: 'numeric' })
                                            : isTR ? `${sub.reminderDays || 1} gün önce` : `${sub.reminderDays || 1} day(s) before`
                                        }
                                    </Text>
                                </View>
                            </View>

                            <View style={s.field}>
                                <Text style={[s.label, { color: c.subtle }]}>{t.descriptionLabel.toUpperCase()}</Text>
                                <View style={[s.displayField, { backgroundColor: c.card, borderColor: c.cardBorder }]}>
                                    <Text style={[s.value, { color: c.muted, fontSize: 14 }]}>
                                        {sub.description || (isTR ? 'Açıklama eklenmemiş.' : 'No description added.')}
                                    </Text>
                                </View>
                            </View>
                        </View>
                    )}

                    {isEditing ? (
                        <View style={{ gap: 12, marginTop: 12 }}>
                            <TouchableOpacity onPress={handleSave} style={[s.saveBtn, { backgroundColor: c.emerald }]} activeOpacity={0.8}>
                                <Save size={18} color="#0F1419" />
                                <Text style={s.saveText}>{t.saveChanges}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={handleDelete} style={[s.deleteBtn, { backgroundColor: c.red + '10', borderColor: c.red + '25' }]} activeOpacity={0.8}>
                                <Trash2 size={18} color={c.red} />
                                <Text style={[s.deleteText, { color: c.red }]}>{t.deleteSubscription}</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <TouchableOpacity onPress={handleDelete} style={[s.deleteBtn, { backgroundColor: c.red + '10', borderColor: c.red + '25', marginTop: 12 }]} activeOpacity={0.8}>
                            <Trash2 size={18} color={c.red} />
                            <Text style={[s.deleteText, { color: c.red }]}>{t.deleteSubscription}</Text>
                        </TouchableOpacity>
                    )}
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
    editText: {
        fontSize: 15,
        fontWeight: '600',
    },
    duePill: {
        paddingHorizontal: 14,
        paddingVertical: 6,
        borderRadius: 20,
        borderWidth: 1,
    },
    dueText: {
        fontSize: 12,
        fontWeight: '700',
    },
    paidBadgeLarge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginTop: 12,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
    },
    paidBadgeText: {
        fontSize: 14,
        fontWeight: '800',
    },
    markPaidBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        borderRadius: 14,
        borderWidth: 1,
        gap: 10,
        marginBottom: 16,
    },
    markPaidText: {
        fontSize: 15,
        fontWeight: '700',
    },
    form: {
        gap: 20,
        marginBottom: 24,
    },
    field: {
        gap: 8,
    },
    label: {
        fontSize: 11,
        fontWeight: '700',
        letterSpacing: 1.2,
        marginLeft: 2,
    },
    value: {
        fontSize: 16,
        fontWeight: '500',
    },
    displayField: {
        borderRadius: 12,
        borderWidth: 1,
        padding: 16,
    },
    cycleRow: {
        flexDirection: 'row',
        gap: 12,
    },
    cycleBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        borderRadius: 12,
        borderWidth: 1,
        gap: 8,
    },
    cycleBtnText: {
        fontWeight: '700',
        fontSize: 13,
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
    deleteBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        borderRadius: 14,
        borderWidth: 1,
        gap: 8,
    },
    deleteText: {
        fontSize: 15,
        fontWeight: '700',
    },
    saveBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        borderRadius: 14,
        gap: 8,
    },
    saveText: {
        color: '#0F1419',
        fontSize: 15,
        fontWeight: '700',
    },
    
    reminderTypeTabs: {
        flexDirection: 'row',
        borderRadius: 14,
        borderWidth: 1,
        padding: 4,
        marginBottom: 10,
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
        fontSize: 11,
        fontWeight: '700',
    },
    customDateBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        borderWidth: 1,
        borderRadius: 14,
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    customDateLabel: {
        flex: 1,
        fontSize: 15,
        fontWeight: '600',
    },
});
