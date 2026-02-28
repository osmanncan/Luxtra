import React from 'react';
import { Alert, Modal, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

interface CustomDatePickerModalProps {
    visible: boolean;
    onClose: () => void;
    onConfirm: (date: Date) => void;
    isTR: boolean;
    colors: {
        card: string;
        cardBorder: string;
        base: string;
        offWhite: string;
        subtle: string;
        dim: string;
        emerald: string;
    };
    state: {
        day: string;
        month: string;
        year: string;
    };
    setState: {
        setDay: (v: string) => void;
        setMonth: (v: string) => void;
        setYear: (v: string) => void;
    };
}

export const CustomDatePickerModal = ({
    visible,
    onClose,
    onConfirm,
    isTR,
    colors,
    state,
    setState
}: CustomDatePickerModalProps) => {

    const handleConfirm = () => {
        const d = parseInt(state.day);
        const m = parseInt(state.month) - 1;
        const y = parseInt(state.year);
        if (isNaN(d) || isNaN(m) || isNaN(y)) {
            Alert.alert(isTR ? 'Geçersiz Tarih' : 'Invalid Date', isTR ? 'Lütfen tüm alanları doldur.' : 'Please fill all fields.');
            return;
        }
        const date = new Date(y, m, d);
        if (isNaN(date.getTime())) {
            Alert.alert(isTR ? 'Geçersiz Tarih' : 'Invalid Date', isTR ? 'Lütfen geçerli bir tarih gir.' : 'Please enter a valid date.');
            return;
        }
        onConfirm(date);
    };

    return (
        <Modal visible={visible} transparent animationType="slide">
            <View style={s.modalOverlay}>
                <View style={[s.modalCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
                    <Text style={[s.modalTitle, { color: colors.offWhite }]}>
                        {isTR ? 'Özel Hatırlatma Tarihi' : 'Custom Reminder Date'}
                    </Text>
                    <Text style={[s.modalSub, { color: colors.subtle }]}>
                        {isTR ? 'Hatırlatma için bir tarih seç' : 'Pick a date for the reminder'}
                    </Text>

                    <View style={s.dateRow}>
                        <View style={{ flex: 1 }}>
                            <Text style={[s.dateLabel, { color: colors.subtle }]}>{isTR ? 'GÜN' : 'DAY'}</Text>
                            <TextInput
                                style={[s.dateInput, { backgroundColor: colors.base, borderColor: colors.cardBorder, color: colors.offWhite }]}
                                placeholder="15"
                                placeholderTextColor={colors.dim}
                                keyboardType="number-pad"
                                maxLength={2}
                                value={state.day}
                                onChangeText={setState.setDay}
                            />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={[s.dateLabel, { color: colors.subtle }]}>{isTR ? 'AY' : 'MONTH'}</Text>
                            <TextInput
                                style={[s.dateInput, { backgroundColor: colors.base, borderColor: colors.cardBorder, color: colors.offWhite }]}
                                placeholder="06"
                                placeholderTextColor={colors.dim}
                                keyboardType="number-pad"
                                maxLength={2}
                                value={state.month}
                                onChangeText={setState.setMonth}
                            />
                        </View>
                        <View style={{ flex: 1.2 }}>
                            <Text style={[s.dateLabel, { color: colors.subtle }]}>{isTR ? 'YIL' : 'YEAR'}</Text>
                            <TextInput
                                style={[s.dateInput, { backgroundColor: colors.base, borderColor: colors.cardBorder, color: colors.offWhite }]}
                                placeholder="2026"
                                placeholderTextColor={colors.dim}
                                keyboardType="number-pad"
                                maxLength={4}
                                value={state.year}
                                onChangeText={setState.setYear}
                            />
                        </View>
                    </View>

                    <View style={s.modalBtns}>
                        <TouchableOpacity
                            style={[s.modalCancelBtn, { borderColor: colors.cardBorder }]}
                            onPress={onClose}
                        >
                            <Text style={[{ fontSize: 15, fontWeight: '600', color: colors.subtle }]}>
                                {isTR ? 'İptal' : 'Cancel'}
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[s.modalConfirmBtn, { backgroundColor: colors.emerald }]}
                            onPress={handleConfirm}
                        >
                            <Text style={[{ fontSize: 15, fontWeight: '700', color: '#0F1419' }]}>
                                {isTR ? 'Tamam' : 'Confirm'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const s = StyleSheet.create({
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

