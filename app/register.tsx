import { useRouter } from 'expo-router';
import { ArrowRight, Globe, Lock, Mail, Shield, User } from 'lucide-react-native';
import React, { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
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
import { useStore } from '../src/store/useStore';

export default function RegisterScreen() {
    const register = useStore((s) => s.register);
    const router = useRouter();
    const { language, setLanguage } = useStore();
    const isTR = language === 'tr';

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(40)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
            Animated.spring(slideAnim, { toValue: 0, tension: 40, friction: 8, useNativeDriver: true }),
        ]).start();
    }, []);

    const handleRegister = async () => {
        if (!name || !email || !password) {
            Alert.alert(
                isTR ? 'Hata' : 'Error',
                isTR ? 'Lütfen tüm alanları doldurun' : 'Please fill in all fields'
            );
            return;
        }
        if (password !== confirmPassword) {
            Alert.alert(
                isTR ? 'Hata' : 'Error',
                isTR ? 'Şifreler eşleşmiyor' : 'Passwords do not match'
            );
            return;
        }
        if (password.length < 6) {
            Alert.alert(
                isTR ? 'Hata' : 'Error',
                isTR ? 'Şifre en az 6 karakter olmalı' : 'Password must be at least 6 characters'
            );
            return;
        }

        setLoading(true);
        const result = await register(name.trim(), email.trim(), password);
        setLoading(false);

        if (result.success) {
            Alert.alert(
                isTR ? 'Başarılı' : 'Success',
                isTR ? 'Kaydınız oluşturuldu. Lütfen e-postanızı kontrol edin.' : 'Account created. Please check your email.',
                [{ text: 'OK', onPress: () => router.replace('/(tabs)') }]
            );
        } else {
            Alert.alert(
                isTR ? 'Kayıt Hatası' : 'Registration Error',
                result.error
            );
        }
    };

    const toggleLang = () => {
        setLanguage(language === 'en' ? 'tr' : 'en');
    };

    return (
        <View style={s.root}>
            <StatusBar barStyle="light-content" />

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView
                    contentContainerStyle={s.scrollContent}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    {/* Language */}
                    <View style={s.topRow}>
                        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
                            <Text style={s.backText}>←</Text>
                        </TouchableOpacity>
                        <View style={{ flex: 1 }} />
                        <TouchableOpacity onPress={toggleLang} style={s.langBtn}>
                            <Globe size={14} color="#94A3B8" />
                            <Text style={s.langText}>{language.toUpperCase()}</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Logo */}
                    <Animated.View style={[s.logoArea, { opacity: fadeAnim }]}>
                        <View style={s.logoCircle}>
                            <Shield size={28} color="#10B981" />
                        </View>
                        <Text style={s.brand}>
                            {isTR ? 'Hesap Oluştur' : 'Create Account'}
                        </Text>
                        <Text style={s.brandSub}>
                            {isTR ? 'Hayatını organize etmeye başla.' : 'Start organizing your life.'}
                        </Text>
                    </Animated.View>

                    {/* Card */}
                    <Animated.View
                        style={[s.card, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}
                    >
                        {/* Name */}
                        <Text style={s.label}>{isTR ? 'AD SOYAD' : 'FULL NAME'}</Text>
                        <View style={s.inputWrap}>
                            <User size={18} color="#475569" />
                            <TextInput
                                placeholder={isTR ? 'Adınız ve soyadınız' : 'Your full name'}
                                placeholderTextColor="#475569"
                                style={s.input}
                                value={name}
                                onChangeText={setName}
                                autoCapitalize="words"
                            />
                        </View>

                        {/* Email */}
                        <Text style={s.label}>{isTR ? 'E-POSTA' : 'EMAIL'}</Text>
                        <View style={s.inputWrap}>
                            <Mail size={18} color="#475569" />
                            <TextInput
                                placeholder={isTR ? 'E-posta adresiniz' : 'Email address'}
                                placeholderTextColor="#475569"
                                style={s.input}
                                value={email}
                                onChangeText={setEmail}
                                autoCapitalize="none"
                                keyboardType="email-address"
                            />
                        </View>

                        {/* Password */}
                        <Text style={s.label}>{isTR ? 'ŞİFRE' : 'PASSWORD'}</Text>
                        <View style={s.inputWrap}>
                            <Lock size={18} color="#475569" />
                            <TextInput
                                placeholder={isTR ? 'En az 6 karakter' : 'At least 6 characters'}
                                placeholderTextColor="#475569"
                                style={s.input}
                                secureTextEntry
                                value={password}
                                onChangeText={setPassword}
                            />
                        </View>

                        {/* Confirm Password */}
                        <Text style={s.label}>{isTR ? 'ŞİFRE TEKRAR' : 'CONFIRM PASSWORD'}</Text>
                        <View style={s.inputWrap}>
                            <Lock size={18} color="#475569" />
                            <TextInput
                                placeholder={isTR ? 'Şifrenizi tekrar girin' : 'Re-enter password'}
                                placeholderTextColor="#475569"
                                style={s.input}
                                secureTextEntry
                                value={confirmPassword}
                                onChangeText={setConfirmPassword}
                            />
                        </View>

                        {/* Register Button */}
                        <TouchableOpacity
                            onPress={handleRegister}
                            activeOpacity={0.85}
                            disabled={loading}
                        >
                            <View style={[s.signUpBtn, loading && { opacity: 0.7 }]}>
                                {loading ? (
                                    <ActivityIndicator color="#0F1419" />
                                ) : (
                                    <>
                                        <Text style={s.signUpText}>
                                            {isTR ? 'Kayıt Ol' : 'Sign Up'}
                                        </Text>
                                        <ArrowRight size={20} color="#0F1419" />
                                    </>
                                )}
                            </View>
                        </TouchableOpacity>

                        {/* Terms */}
                        <Text style={s.terms}>
                            {isTR
                                ? 'Kayıt olarak Kullanım Şartlarını ve Gizlilik Politikasını kabul etmiş olursun.'
                                : 'By signing up, you agree to our Terms of Service and Privacy Policy.'}
                        </Text>
                    </Animated.View>

                    {/* Footer */}
                    <View style={s.footer}>
                        <Text style={s.footerText}>
                            {isTR ? 'Zaten hesabın var mı? ' : 'Already have an account? '}
                        </Text>
                        <TouchableOpacity onPress={() => router.back()}>
                            <Text style={s.signInLink}>
                                {isTR ? 'Giriş Yap' : 'Sign In'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}

const s = StyleSheet.create({
    root: { flex: 1, backgroundColor: '#0F1419' },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: 24,
        paddingTop: Platform.OS === 'ios' ? 56 : 40,
        paddingBottom: 40,
    },
    topRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 24,
    },
    backBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#1E293B',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#334155',
    },
    backText: {
        color: '#F1F5F9',
        fontSize: 20,
    },
    langBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1E293B',
        paddingHorizontal: 14,
        paddingVertical: 7,
        borderRadius: 20,
        gap: 6,
        borderWidth: 1,
        borderColor: '#334155',
    },
    langText: {
        color: '#94A3B8',
        fontSize: 12,
        fontWeight: '700',
        letterSpacing: 0.8,
    },

    logoArea: {
        alignItems: 'center',
        marginBottom: 28,
    },
    logoCircle: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: '#10B98115',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 14,
        borderWidth: 1,
        borderColor: '#10B98125',
    },
    brand: {
        fontSize: 28,
        fontWeight: '800',
        color: '#F1F5F9',
        letterSpacing: -0.8,
    },
    brandSub: {
        fontSize: 14,
        color: '#64748B',
        fontWeight: '500',
        marginTop: 4,
    },

    card: {
        backgroundColor: '#1E293B',
        borderRadius: 20,
        padding: 24,
        borderWidth: 1,
        borderColor: '#334155',
        marginBottom: 24,
    },
    label: {
        color: '#64748B',
        fontSize: 10,
        fontWeight: '700',
        letterSpacing: 1.2,
        marginBottom: 6,
        marginLeft: 2,
    },
    inputWrap: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#0F1419',
        borderRadius: 12,
        paddingHorizontal: 16,
        height: 50,
        marginBottom: 14,
        gap: 12,
        borderWidth: 1,
        borderColor: '#334155',
    },
    input: {
        flex: 1,
        color: '#F1F5F9',
        fontSize: 15,
        fontWeight: '500',
    },

    signUpBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: 52,
        borderRadius: 12,
        gap: 10,
        marginTop: 4,
        backgroundColor: '#10B981',
    },
    signUpText: {
        color: '#0F1419',
        fontSize: 16,
        fontWeight: '700',
    },

    terms: {
        color: '#475569',
        fontSize: 11,
        textAlign: 'center',
        marginTop: 16,
        lineHeight: 16,
    },

    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
    },
    footerText: {
        color: '#64748B',
        fontSize: 14,
    },
    signInLink: {
        color: '#F1F5F9',
        fontSize: 14,
        fontWeight: '800',
    },
});
