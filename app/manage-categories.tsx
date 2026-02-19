import { useRouter } from 'expo-router';
import { ArrowLeft, Plus, X } from 'lucide-react-native';
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
import SwipeableRow from '../src/components/SwipeableRow';
import { useThemeColors } from '../src/store/theme';
import { SUB_CATEGORIES, useStore } from '../src/store/useStore';

const PRESET_COLORS = [
    ['#ef4444', '#f87171'], // Red
    ['#f97316', '#fb923c'], // Orange
    ['#f59e0b', '#fbbf24'], // Amber
    ['#10b981', '#34d399'], // Emerald
    ['#06b6d4', '#22d3ee'], // Cyan
    ['#3b82f6', '#60a5fa'], // Blue
    ['#6366f1', '#818cf8'], // Indigo
    ['#8b5cf6', '#a78bfa'], // Violet
    ['#ec4899', '#f472b6'], // Pink
    ['#64748b', '#94a3b8'], // Slate
];

export default function ManageCategoriesScreen() {
    const router = useRouter();
    const { customCategories, addCustomCategory, removeCustomCategory, language } = useStore();
    const c = useThemeColors();
    const isTR = language === 'tr';

    const [isAdding, setIsAdding] = useState(false);
    const [newEmoji, setNewEmoji] = useState('');
    const [newName, setNewName] = useState('');
    const [selectedColors, setSelectedColors] = useState<[string, string]>(PRESET_COLORS[0] as [string, string]);

    const handleAdd = () => {
        if (!newName.trim() || !newEmoji.trim()) {
            Alert.alert(isTR ? 'Eksik Bilgi' : 'Missing Info', isTR ? 'Lütfen bir isim ve emoji girin.' : 'Please enter a name and emoji.');
            return;
        }
        if (Object.keys(customCategories).includes(newName.trim()) || Object.keys(SUB_CATEGORIES).includes(newName.trim())) {
            Alert.alert(isTR ? 'Hata' : 'Error', isTR ? 'Bu isimde bir kategori zaten var.' : 'Category already exists.');
            return;
        }

        addCustomCategory(newName.trim(), { emoji: newEmoji.trim(), colors: selectedColors });
        setNewName('');
        setNewEmoji('');
        setIsAdding(false);
    };

    const handleDelete = (name: string) => {
        Alert.alert(
            isTR ? 'Kategoriyi Sil' : 'Delete Category',
            isTR ? `"${name}" kategorisini silmek istediğine emin misin?` : `Are you sure you want to delete "${name}"?`,
            [
                { text: isTR ? 'İptal' : 'Cancel', style: 'cancel' },
                { text: isTR ? 'Sil' : 'Delete', style: 'destructive', onPress: () => removeCustomCategory(name) },
            ]
        );
    };

    return (
        <View style={[s.container, { backgroundColor: c.base }]}>
            {/* Header */}
            <View style={s.header}>
                <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
                    <ArrowLeft size={24} color={c.offWhite} />
                </TouchableOpacity>
                <Text style={[s.headerTitle, { color: c.offWhite }]}>
                    {isTR ? 'Kategoriler' : 'Categories'}
                </Text>
                <TouchableOpacity onPress={() => setIsAdding(true)} style={s.addBtn}>
                    <Plus size={24} color={c.emerald} />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={s.content}>
                {/* Default Categories */}
                <Text style={[s.sectionTitle, { color: c.subtle }]}>
                    {isTR ? 'Varsayılan' : 'Default'}
                </Text>
                <View style={[s.card, { backgroundColor: c.card, borderColor: c.cardBorder }]}>
                    {Object.entries(SUB_CATEGORIES).map(([key, cat]) => (
                        <View key={key} style={[s.row, { borderBottomColor: c.cardBorder }]}>
                            <View style={[s.iconBox, { backgroundColor: cat.colors[0] + '20' }]}>
                                <Text style={{ fontSize: 18 }}>{cat.emoji}</Text>
                            </View>
                            <Text style={[s.catName, { color: c.offWhite }]}>{key}</Text>
                            <View style={[s.badge, { backgroundColor: c.cardBorder }]}>
                                <Text style={[s.badgeText, { color: c.subtle }]}>Default</Text>
                            </View>
                        </View>
                    ))}
                </View>

                {/* Custom Categories */}
                <Text style={[s.sectionTitle, { color: c.subtle, marginTop: 24 }]}>
                    {isTR ? 'Özel' : 'Custom'}
                </Text>
                {Object.keys(customCategories).length === 0 ? (
                    <View style={[s.emptyBox, { borderColor: c.cardBorder }]}>
                        <Text style={[s.emptyText, { color: c.dim }]}>
                            {isTR ? 'Henüz özel kategori yok.' : 'No custom categories yet.'}
                        </Text>
                    </View>
                ) : (
                    <View style={[s.card, { backgroundColor: c.card, borderColor: c.cardBorder }]}>
                        {Object.entries(customCategories).map(([key, cat]) => (
                            <SwipeableRow key={key} onDelete={() => handleDelete(key)}>
                                <View style={[s.row, { borderBottomColor: c.cardBorder }]}>
                                    <View style={[s.iconBox, { backgroundColor: cat.colors[0] + '20' }]}>
                                        <Text style={{ fontSize: 18 }}>{cat.emoji}</Text>
                                    </View>
                                    <Text style={[s.catName, { color: c.offWhite }]}>{key}</Text>
                                </View>
                            </SwipeableRow>
                        ))}
                    </View>
                )}
            </ScrollView>

            {/* Add Modal Overlay */}
            {isAdding && (
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={[s.modalOverlay, { backgroundColor: 'rgba(0,0,0,0.8)' }]}
                >
                    <View style={[s.modalCard, { backgroundColor: c.card, borderColor: c.cardBorder }]}>
                        <View style={s.modalHeader}>
                            <Text style={[s.modalTitle, { color: c.offWhite }]}>
                                {isTR ? 'Yeni Kategori' : 'New Category'}
                            </Text>
                            <TouchableOpacity onPress={() => setIsAdding(false)}>
                                <X size={24} color={c.subtle} />
                            </TouchableOpacity>
                        </View>

                        <View style={s.inputRow}>
                            <View style={[s.emojiInputWrap, { borderColor: c.cardBorder, backgroundColor: c.sectionBg }]}>
                                <TextInput
                                    style={[s.emojiInput, { color: c.offWhite }]}
                                    placeholder="😃"
                                    placeholderTextColor={c.dim}
                                    value={newEmoji}
                                    onChangeText={t => setNewEmoji(t.slice(-1))} // Only 1 char
                                    maxLength={2}
                                />
                            </View>
                            <TextInput
                                style={[s.nameInput, { color: c.offWhite, borderColor: c.cardBorder, backgroundColor: c.sectionBg }]}
                                placeholder={isTR ? 'Kategori Adı' : 'Category Name'}
                                placeholderTextColor={c.dim}
                                value={newName}
                                onChangeText={setNewName}
                                autoFocus
                            />
                        </View>

                        <Text style={[s.colorLabel, { color: c.subtle }]}>
                            {isTR ? 'Renk Seç' : 'Pick Color'}
                        </Text>
                        <View style={s.colorGrid}>
                            {PRESET_COLORS.map((colors, i) => (
                                <TouchableOpacity
                                    key={i}
                                    style={[
                                        s.colorBtn,
                                        { backgroundColor: colors[0] },
                                        selectedColors[0] === colors[0] && { borderWidth: 2, borderColor: c.offWhite }
                                    ]}
                                    onPress={() => setSelectedColors(colors as [string, string])}
                                />
                            ))}
                        </View>

                        <TouchableOpacity
                            style={[s.saveBtn, { backgroundColor: c.emerald }]}
                            onPress={handleAdd}
                        >
                            <Text style={s.saveBtnText}>{isTR ? 'Ekle' : 'Add'}</Text>
                        </TouchableOpacity>
                    </View>
                </KeyboardAvoidingView>
            )}
        </View>
    );
}

const s = StyleSheet.create({
    container: { flex: 1, paddingTop: 60 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 20 },
    headerTitle: { fontSize: 20, fontWeight: '700' },
    backBtn: { padding: 8 },
    addBtn: { padding: 8 },
    content: { paddingHorizontal: 20, paddingBottom: 40 },
    sectionTitle: { fontSize: 13, fontWeight: '700', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
    card: { borderRadius: 16, borderWidth: 1, overflow: 'hidden' },
    row: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, gap: 12 },
    iconBox: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
    catName: { fontSize: 16, fontWeight: '600', flex: 1 },
    badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
    badgeText: { fontSize: 10, fontWeight: '700' },

    emptyBox: { padding: 30, alignItems: 'center', borderWidth: 1, borderStyle: 'dashed', borderRadius: 16 },
    emptyText: { fontSize: 14 },

    /* Modal */
    modalOverlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', padding: 20, zIndex: 100 },
    modalCard: { borderRadius: 20, padding: 24, borderWidth: 1 },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    modalTitle: { fontSize: 18, fontWeight: '700' },
    inputRow: { flexDirection: 'row', gap: 12, marginBottom: 20 },
    emojiInputWrap: { width: 50, height: 50, borderRadius: 12, borderWidth: 1, justifyContent: 'center', alignItems: 'center' },
    emojiInput: { fontSize: 24, textAlign: 'center' },
    nameInput: { flex: 1, height: 50, borderRadius: 12, borderWidth: 1, paddingHorizontal: 16, fontSize: 16 },
    colorLabel: { fontSize: 13, fontWeight: '600', marginBottom: 12 },
    colorGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 24 },
    colorBtn: { width: 32, height: 32, borderRadius: 16 },
    saveBtn: { paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
    saveBtnText: { color: '#0F1419', fontWeight: '700', fontSize: 16 },
});
