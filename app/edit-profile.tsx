import { useRouter } from 'expo-router';
import { ArrowLeft, Camera, Check, User } from 'lucide-react-native';
import React, { useState } from 'react';
import {
    Alert,
    Animated,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useThemeColors } from '../src/store/theme';
import { translations } from '../src/store/translations';
import { useStore } from '../src/store/useStore';

export default function EditProfileScreen() {
    const router = useRouter();
    const { user, updateProfile, language, theme } = useStore();
    const c = useThemeColors();
    const t = translations[language].profile;

    const [name, setName] = useState(user?.name || '');
    const [email, setEmail] = useState(user?.email || '');
    const [saved, setSaved] = useState(false);

    const fadeAnim = React.useRef(new Animated.Value(0)).current;
    React.useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
        }).start();
    }, []);

    const handleSave = () => {
        if (!name.trim()) {
            Alert.alert(translations[language].common.error, language === 'tr' ? 'İsim boş bırakılamaz' : 'Name cannot be empty');
            return;
        }
        updateProfile({ name: name.trim(), email: email.trim() });
        setSaved(true);
        setTimeout(() => {
            setSaved(false);
            router.back();
        }, 1200);
    };

    if (!user) return null;

    const hasChanges = name.trim() !== user.name || email.trim() !== user.email;

    return (
        <View style={[s.container, { backgroundColor: c.base }]}>
            <StatusBar barStyle={c.statusBarStyle} />

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={{ flex: 1 }}
            >
                <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
                    {/* Header */}
                    <View style={s.header}>
                        <TouchableOpacity onPress={() => router.back()} style={[s.backBtn, { backgroundColor: c.card, borderColor: c.cardBorder }]}>
                            <ArrowLeft size={20} color={c.offWhite} />
                        </TouchableOpacity>
                        <Text style={[s.headerTitle, { color: c.offWhite }]}>{t.editProfile}</Text>
                        <View style={{ width: 44 }} />
                    </View>

                    <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
                        {/* Avatar Section */}
                        <View style={s.avatarSection}>
                            <View style={[s.avatarLarge, { backgroundColor: c.emerald }]}>
                                <Text style={s.avatarLargeText}>{name[0]?.toUpperCase() || 'U'}</Text>
                            </View>
                            <TouchableOpacity style={[s.changePhotoBtn, { backgroundColor: c.card, borderColor: c.cardBorder }]}>
                                <Camera size={14} color={c.emerald} />
                                <Text style={[s.changePhotoText, { color: c.emerald }]}>{t.changePhoto}</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Form */}
                        <View style={s.form}>
                            {/* Name */}
                            <View style={s.fieldWrap}>
                                <Text style={[s.fieldLabel, { color: c.subtle }]}>{t.name}</Text>
                                <View style={[s.inputWrap, { backgroundColor: c.card, borderColor: c.cardBorder }]}>
                                    <User size={16} color={c.subtle} />
                                    <TextInput
                                        style={[s.input, { color: c.offWhite }]}
                                        value={name}
                                        onChangeText={setName}
                                        placeholder={t.namePlaceholder}
                                        placeholderTextColor={c.dim}
                                        autoCapitalize="words"
                                    />
                                </View>
                            </View>

                            {/* Email */}
                            <View style={s.fieldWrap}>
                                <Text style={[s.fieldLabel, { color: c.subtle }]}>{t.email}</Text>
                                <View style={[s.inputWrap, { backgroundColor: c.card, borderColor: c.cardBorder }]}>
                                    <Text style={{ fontSize: 14, color: c.subtle }}>@</Text>
                                    <TextInput
                                        style={[s.input, { color: c.offWhite }]}
                                        value={email}
                                        onChangeText={setEmail}
                                        placeholder={t.emailPlaceholder}
                                        placeholderTextColor={c.dim}
                                        keyboardType="email-address"
                                        autoCapitalize="none"
                                    />
                                </View>
                            </View>
                        </View>

                        {/* Save Button */}
                        <View style={s.saveSection}>
                            <TouchableOpacity
                                style={[
                                    s.saveBtn,
                                    { backgroundColor: saved ? '#10B981' : (hasChanges ? c.emerald : c.dim) },
                                ]}
                                onPress={handleSave}
                                disabled={!hasChanges || saved}
                                activeOpacity={0.8}
                            >
                                {saved ? (
                                    <View style={s.savedRow}>
                                        <Check size={18} color="#FFF" />
                                        <Text style={s.saveBtnText}>{t.profileUpdated}</Text>
                                    </View>
                                ) : (
                                    <Text style={s.saveBtnText}>{t.saveChanges}</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                </Animated.View>
            </KeyboardAvoidingView>
        </View>
    );
}

const s = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: Platform.OS === 'ios' ? 60 : 44,
        paddingHorizontal: 20,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 32,
    },
    backBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        letterSpacing: -0.3,
    },

    /* Avatar */
    avatarSection: {
        alignItems: 'center',
        marginBottom: 36,
    },
    avatarLarge: {
        width: 100,
        height: 100,
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    avatarLargeText: {
        fontSize: 40,
        fontWeight: '800',
        color: '#0F1419',
    },
    changePhotoBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
    },
    changePhotoText: {
        fontSize: 13,
        fontWeight: '600',
    },

    /* Form */
    form: {
        gap: 20,
        marginBottom: 32,
    },
    fieldWrap: {
        gap: 8,
    },
    fieldLabel: {
        fontSize: 12,
        fontWeight: '700',
        letterSpacing: 0.8,
        textTransform: 'uppercase',
        marginLeft: 4,
    },
    inputWrap: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 14,
        borderWidth: 1,
        paddingHorizontal: 16,
        gap: 10,
        height: 54,
    },
    input: {
        flex: 1,
        fontSize: 16,
        fontWeight: '500',
    },

    /* Save */
    saveSection: {
        paddingHorizontal: 0,
    },
    saveBtn: {
        borderRadius: 14,
        paddingVertical: 18,
        alignItems: 'center',
        justifyContent: 'center',
    },
    saveBtnText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
    },
    savedRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
});
