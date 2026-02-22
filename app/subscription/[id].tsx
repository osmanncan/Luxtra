import { useLocalSearchParams, useRouter } from 'expo-router';
import {
    ArrowLeft,
    Calendar,
    Check,
    DollarSign,
    Repeat,
    Save,
    Shield,
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
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
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

    // Form state
    const [name, setName] = useState(sub?.name || '');
    const [amount, setAmount] = useState(sub?.amount.toString() || '');
    const [desc, setDesc] = useState(sub?.description || '');
    const [category, setCategory] = useState(sub?.category || 'General');
    const [cycle, setCycle] = useState<'monthly' | 'yearly'>(sub?.billingCycle || 'monthly');
    const [day, setDay] = useState(sub ? new Date(sub.nextBillingDate).getDate().toString() : '');

    const allCategories = { ...SUB_CATEGORIES, ...customCategories };

    // Paid animation
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
                    onPress: () => {
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

        updateSubscription(sub.id, {
            name: name.trim(),
            amount: parseFloat(amount) || 0,
            description: desc,
            category,
            billingCycle: cycle,
            nextBillingDate: nextDate.toISOString(),
        });
        setIsEditing(false);
    };

    const handleMarkPaid = () => {
        markSubscriptionPaid(sub.id);
    };

    const nextDate = new Date(sub.nextBillingDate);
    const diffDays = Math.ceil((nextDate.getTime() - Date.now()) / 86400000);

    return (
        <View style={[s.container, { backgroundColor: c.base }]}>
            {/* Header */}
            <View style={s.header}>
                <TouchableOpacity onPress={() => router.back()} style={[s.backBtn, { backgroundColor: c.card, borderColor: c.cardBorder }]}>
                    <ArrowLeft size={22} color={c.offWhite} />
                </TouchableOpacity>
                <Text style={[s.headerTitle, { color: c.offWhite }]}>
                    {isEditing ? t.title : (isTR ? 'Detaylar' : 'Details')}
                </Text>
                <TouchableOpacity onPress={() => {
                    if (isEditing) {
                        // Reset state on cancel
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
                    {/* Hero - Only show in non-edit mode */}
                    {!isEditing && (
                        <View style={[s.heroCard, { backgroundColor: c.card, borderColor: sub.isPaid ? c.emerald + '40' : c.cardBorder }]}>
                            <View style={[s.iconCircle, { backgroundColor: cat.colors[0] + '20' }]}>
                                <Text style={s.emoji}>{cat.emoji}</Text>
                            </View>
                            <Text style={[s.heroName, { color: c.offWhite }]}>{sub.name}</Text>
                            <View style={s.heroAmountRow}>
                                <Text style={[s.heroAmount, { color: c.offWhite }]}>{curr.symbol}{sub.amount.toFixed(2)}</Text>
                                <Text style={[s.heroCycle, { color: c.subtle }]}>
                                    /{sub.billingCycle === 'monthly' ? (isTR ? 'ay' : 'mo') : (isTR ? 'yıl' : 'yr')}
                                </Text>
                            </View>

                            {/* Due pill */}
                            {diffDays >= 0 && (
                                <View style={[s.duePill, { backgroundColor: c.amber + '12', borderColor: c.amber + '25' }]}>
                                    <Text style={[s.dueText, { color: c.amber }]}>
                                        {diffDays === 0
                                            ? (isTR ? 'Bugün ödenmeli' : 'Due today')
                                            : diffDays === 1
                                                ? (isTR ? 'Yarın ödenmeli' : 'Due tomorrow')
                                                : (isTR ? `${diffDays} gün sonra` : `Due in ${diffDays} days`)}
                                    </Text>
                                </View>
                            )}

                            {/* Paid status badge */}
                            {sub.isPaid && (
                                <Animated.View style={[s.paidBadgeLarge, { transform: [{ scale: checkScaleAnim.interpolate({ inputRange: [0, 1], outputRange: [0.5, 1] }) }] }]}>
                                    <Check size={16} color={c.emerald} strokeWidth={3} />
                                    <Text style={[s.paidBadgeText, { color: c.emerald }]}>
                                        {isTR ? 'Ödendi' : 'Paid'}
                                    </Text>
                                </Animated.View>
                            )}
                        </View>
                    )}

                    {!isEditing && (
                        <TouchableOpacity
                            onPress={handleMarkPaid}
                            style={[
                                s.markPaidBtn,
                                {
                                    backgroundColor: sub.isPaid ? c.card : c.emerald + '12',
                                    borderColor: sub.isPaid ? c.cardBorder : c.emerald + '30',
                                },
                            ]}
                            activeOpacity={0.8}
                        >
                            <Check size={18} color={sub.isPaid ? c.muted : c.emerald} strokeWidth={2.5} />
                            <Text style={[s.markPaidText, { color: sub.isPaid ? c.muted : c.emerald }]}>
                                {sub.isPaid
                                    ? (isTR ? 'Ödenmedi Olarak İşaretle' : 'Mark as Unpaid')
                                    : (isTR ? 'Ödendi Olarak İşaretle' : 'Mark as Paid')}
                            </Text>
                        </TouchableOpacity>
                    )}

                    {!isEditing && (
                        <View style={[s.infoCard, { backgroundColor: c.emerald + '10', borderColor: c.emerald + '20' }]}>
                            <Shield size={16} color={c.emerald} />
                            <Text style={[s.infoText, { color: c.subtle }]}>
                                {isTR ? 'Bir sonraki ödeme öncesinde seni uyaracağız.' : "We'll remind you before the next charge."}
                            </Text>
                        </View>
                    )}

                    {/* Form Fields */}
                    <View style={s.form}>
                        {/* Name */}
                        <View style={s.field}>
                            <Text style={[s.label, { color: c.subtle }]}>{t.nameLabel}</Text>
                            {isEditing ? (
                                <View style={[s.inputWrap, { backgroundColor: c.card, borderColor: c.cardBorder }]}>
                                    <Tag size={16} color={c.dim} style={{ marginRight: 12 }} />
                                    <TextInput style={[s.input, { color: c.offWhite }]} value={name} onChangeText={setName} placeholderTextColor={c.dim} />
                                </View>
                            ) : (
                                <View style={[s.displayField, { backgroundColor: c.card, borderColor: c.cardBorder }]}>
                                    <Text style={[s.value, { color: c.offWhite }]}>{sub.name}</Text>
                                </View>
                            )}
                        </View>

                        {/* Amount */}
                        <View style={s.field}>
                            <Text style={[s.label, { color: c.subtle }]}>{t.amountLabel}</Text>
                            {isEditing ? (
                                <View style={[s.inputWrap, { backgroundColor: c.card, borderColor: c.cardBorder }]}>
                                    <DollarSign size={16} color={c.dim} style={{ marginRight: 12 }} />
                                    <TextInput style={[s.input, { color: c.offWhite }]} value={amount} onChangeText={setAmount} keyboardType="decimal-pad" placeholderTextColor={c.dim} />
                                </View>
                            ) : (
                                <View style={[s.displayField, { backgroundColor: c.card, borderColor: c.cardBorder }]}>
                                    <Text style={[s.value, { color: c.offWhite }]}>{curr.symbol}{sub.amount.toFixed(2)}</Text>
                                </View>
                            )}
                        </View>

                        {/* Billing Day & Cycle - Only in Edit Mode */}
                        {isEditing && (
                            <>
                                <View style={s.field}>
                                    <Text style={[s.label, { color: c.subtle }]}>{t.dayLabel}</Text>
                                    <View style={[s.inputWrap, { backgroundColor: c.card, borderColor: c.cardBorder }]}>
                                        <Calendar size={16} color={c.dim} style={{ marginRight: 12 }} />
                                        <TextInput
                                            style={[s.input, { color: c.offWhite }]}
                                            value={day}
                                            onChangeText={setDay}
                                            keyboardType="number-pad"
                                            maxLength={2}
                                            placeholder="15"
                                            placeholderTextColor={c.dim}
                                        />
                                    </View>
                                </View>

                                <View style={s.field}>
                                    <Text style={[s.label, { color: c.subtle }]}>{t.cycleLabel}</Text>
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
                                    <Text style={[s.label, { color: c.subtle }]}>{t.categoryLabel}</Text>
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
                            </>
                        )}

                        {!isEditing && (
                            <View style={s.field}>
                                <Text style={[s.label, { color: c.subtle }]}>{isTR ? 'SONRAKİ ÖDEME' : 'NEXT BILLING'}</Text>
                                <View style={[s.displayField, { backgroundColor: c.card, borderColor: c.cardBorder, flexDirection: 'row', alignItems: 'center', gap: 10 }]}>
                                    <Calendar size={16} color={c.dim} />
                                    <Text style={[s.value, { color: c.offWhite }]}>
                                        {nextDate.toLocaleDateString(isTR ? 'tr-TR' : 'en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                    </Text>
                                </View>
                            </View>
                        )}

                        {/* Description */}
                        <View style={s.field}>
                            <Text style={[s.label, { color: c.subtle }]}>{t.descriptionLabel}</Text>
                            {isEditing ? (
                                <View style={[s.inputWrap, { backgroundColor: c.card, borderColor: c.cardBorder }]}>
                                    <TextInput
                                        style={[s.input, { minHeight: 80, textAlignVertical: 'top', color: c.offWhite }]}
                                        value={desc}
                                        onChangeText={setDesc}
                                        multiline
                                        placeholder={isTR ? 'Not ekle...' : 'Add notes...'}
                                        placeholderTextColor={c.dim}
                                    />
                                </View>
                            ) : (
                                <View style={[s.displayField, { backgroundColor: c.card, borderColor: c.cardBorder }]}>
                                    <Text style={[s.value, { color: c.muted, fontSize: 14 }]}>
                                        {sub.description || (isTR ? 'Açıklama eklenmemiş.' : 'No description added.')}
                                    </Text>
                                </View>
                            )}
                        </View>
                    </View>

                    {/* Actions */}
                    {isEditing ? (
                        <TouchableOpacity onPress={handleSave} style={[s.saveBtn, { backgroundColor: c.emerald }]} activeOpacity={0.8}>
                            <Save size={18} color="#0F1419" />
                            <Text style={s.saveText}>{t.saveChanges}</Text>
                        </TouchableOpacity>
                    ) : (
                        <TouchableOpacity onPress={handleDelete} style={[s.deleteBtn, { backgroundColor: c.red + '10', borderColor: c.red + '25' }]} activeOpacity={0.8}>
                            <Trash2 size={18} color={c.red} />
                            <Text style={[s.deleteText, { color: c.red }]}>{t.deleteSubscription}</Text>
                        </TouchableOpacity>
                    )}
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
    editText: {
        fontSize: 15,
        fontWeight: '600',
    },

    /* Hero */
    heroCard: {
        alignItems: 'center',
        padding: 28,
        borderRadius: 20,
        marginBottom: 16,
        borderWidth: 1,
    },
    iconCircle: {
        width: 64,
        height: 64,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    emoji: {
        fontSize: 28,
    },
    heroName: {
        fontSize: 22,
        fontWeight: '700',
        marginBottom: 6,
        letterSpacing: -0.3,
    },
    heroAmountRow: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        marginBottom: 12,
    },
    heroAmount: {
        fontSize: 28,
        fontWeight: '700',
        letterSpacing: -0.5,
    },
    heroCycle: {
        fontSize: 14,
        fontWeight: '600',
        paddingBottom: 4,
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

    /* Mark Paid */
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

    /* Info */
    infoCard: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        gap: 10,
        marginBottom: 24,
        borderWidth: 1,
    },
    infoText: {
        fontSize: 13,
        fontWeight: '500',
        flex: 1,
    },

    /* Form */
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
    inputWrap: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
    },
    input: {
        flex: 1,
        fontSize: 16,
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

    /* Actions */
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
});
