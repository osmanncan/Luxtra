import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Calendar, Check, Save, Shield, Trash2 } from 'lucide-react-native';
import React, { useEffect, useRef, useState } from 'react';
import { Alert, Animated, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useThemeColors } from '../../src/store/theme';
import { SUB_CATEGORIES, useStore } from '../../src/store/useStore';

export default function SubscriptionDetails() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const { subscriptions, removeSubscription, updateSubscription, markSubscriptionPaid, language } = useStore();
    const c = useThemeColors();
    const isTR = language === 'tr';

    const subId = Array.isArray(id) ? id[0] : id;
    const sub = subscriptions.find((s) => s.id === subId);
    const [isEditing, setIsEditing] = useState(false);

    const [name, setName] = useState(sub?.name || '');
    const [amount, setAmount] = useState(sub?.amount.toString() || '');
    const [desc, setDesc] = useState(sub?.description || '');

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

    const cat = SUB_CATEGORIES[sub.category] ?? SUB_CATEGORIES.General;

    const handleDelete = () => {
        Alert.alert(
            isTR ? 'Aboneliği Sil?' : 'Delete Subscription?',
            isTR ? 'Bu aboneliği takip etmeyi bırakmak istediğinden emin misin?' : 'Are you sure you want to stop tracking this subscription?',
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
        updateSubscription(sub.id, {
            name,
            amount: parseFloat(amount) || 0,
            description: desc
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
                    {isEditing ? (isTR ? 'Düzenle' : 'Edit') : (isTR ? 'Detaylar' : 'Details')}
                </Text>
                <TouchableOpacity onPress={() => setIsEditing(!isEditing)}>
                    <Text style={[s.editText, { color: c.emerald }]}>
                        {isEditing ? (isTR ? 'İptal' : 'Cancel') : (isTR ? 'Düzenle' : 'Edit')}
                    </Text>
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
                {/* Hero */}
                <View style={[s.heroCard, { backgroundColor: c.card, borderColor: sub.isPaid ? c.emerald + '40' : c.cardBorder }]}>
                    <View style={[s.iconCircle, { backgroundColor: cat.colors[0] + '20' }]}>
                        <Text style={s.emoji}>{cat.emoji}</Text>
                    </View>
                    <Text style={[s.heroName, { color: c.offWhite }]}>{sub.name}</Text>
                    <View style={s.heroAmountRow}>
                        <Text style={[s.heroAmount, { color: c.offWhite }]}>${sub.amount.toFixed(2)}</Text>
                        <Text style={[s.heroCycle, { color: c.subtle }]}>
                            /{sub.billingCycle === 'monthly' ? (isTR ? 'ay' : 'mo') : (isTR ? 'yıl' : 'yr')}
                        </Text>
                    </View>

                    {/* Due pill */}
                    {diffDays >= 0 && (
                        <View style={s.duePill}>
                            <Text style={s.dueText}>
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

                {/* Mark as Paid / Unpaid Button */}
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

                {/* Info card */}
                <View style={[s.infoCard, { backgroundColor: c.emerald + '10', borderColor: c.emerald + '20' }]}>
                    <Shield size={16} color={c.emerald} />
                    <Text style={[s.infoText, { color: c.subtle }]}>
                        {isTR ? 'Bir sonraki ödeme öncesinde seni uyaracağız.' : "We'll remind you 1 day before the next charge."}
                    </Text>
                </View>

                {/* Form */}
                <View style={s.form}>
                    <View style={s.field}>
                        <Text style={[s.label, { color: c.subtle }]}>{isTR ? 'AD' : 'NAME'}</Text>
                        {isEditing ? (
                            <View style={[s.inputWrap, { backgroundColor: c.card, borderColor: c.cardBorder }]}>
                                <TextInput style={[s.input, { color: c.offWhite }]} value={name} onChangeText={setName} placeholderTextColor={c.dim} />
                            </View>
                        ) : (
                            <Text style={[s.value, { color: c.muted }]}>{sub.name}</Text>
                        )}
                    </View>

                    <View style={s.field}>
                        <Text style={[s.label, { color: c.subtle }]}>{isTR ? 'TUTAR' : 'AMOUNT'}</Text>
                        {isEditing ? (
                            <View style={[s.inputWrap, { backgroundColor: c.card, borderColor: c.cardBorder }]}>
                                <TextInput style={[s.input, { color: c.offWhite }]} value={amount} onChangeText={setAmount} keyboardType="decimal-pad" placeholderTextColor={c.dim} />
                            </View>
                        ) : (
                            <Text style={[s.value, { color: c.muted }]}>${sub.amount.toFixed(2)}</Text>
                        )}
                    </View>

                    <View style={s.field}>
                        <Text style={[s.label, { color: c.subtle }]}>{isTR ? 'AÇIKLAMA' : 'DESCRIPTION'}</Text>
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
                            <Text style={[s.value, { color: c.muted }]}>{sub.description || (isTR ? 'Açıklama eklenmemiş.' : 'No description added.')}</Text>
                        )}
                    </View>

                    <View style={s.field}>
                        <Text style={[s.label, { color: c.subtle }]}>{isTR ? 'SONRAKİ ÖDEME' : 'NEXT BILLING'}</Text>
                        <View style={s.row}>
                            <Calendar size={16} color={c.subtle} style={{ marginRight: 8 }} />
                            <Text style={[s.value, { color: c.muted }]}>
                                {nextDate.toLocaleDateString(isTR ? 'tr-TR' : 'en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Actions */}
                {isEditing ? (
                    <TouchableOpacity onPress={handleSave} style={[s.saveBtn, { backgroundColor: c.emerald }]}>
                        <Save size={18} color="#0F1419" />
                        <Text style={s.saveText}>{isTR ? 'Değişiklikleri Kaydet' : 'Save Changes'}</Text>
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity onPress={handleDelete} style={[s.deleteBtn, { backgroundColor: c.red + '10', borderColor: c.red + '25' }]}>
                        <Trash2 size={18} color={c.red} />
                        <Text style={[s.deleteText, { color: c.red }]}>{isTR ? 'Aboneliği Sil' : 'Delete Subscription'}</Text>
                    </TouchableOpacity>
                )}
            </ScrollView>
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
        backgroundColor: '#F59E0B18',
        paddingHorizontal: 14,
        paddingVertical: 6,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#F59E0B30',
    },
    dueText: {
        color: '#F59E0B',
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
        backgroundColor: '#10B98118',
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
        borderWidth: 1,
        borderRadius: 12,
        padding: 14,
    },
    input: {
        fontSize: 16,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
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
