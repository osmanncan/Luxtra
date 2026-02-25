import { LinearGradient } from 'expo-linear-gradient';
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
    const [focusedInput, setFocusedInput] = useState<'name' | 'email' | 'password' | 'confirm' | null>(null);

    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(40)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
            Animated.spring(slideAnim, { toValue: 0, tension: 35, friction: 9, useNativeDriver: true }),
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

    const languages = ['en', 'tr', 'es', 'de', 'fr', 'it', 'pt', 'ar'] as const;

    const toggleLang = () => {
        const currIdx = languages.indexOf(language as any);
        const nextLang = languages[(currIdx + 1) % languages.length];
        setLanguage(nextLang);
    };

    return (
        <View style={s.root}>
            <StatusBar barStyle="light-content" />

            <View style={StyleSheet.absoluteFill}>
                <View style={s.ambientLight} />
                <View style={s.ambientLight2} />
                <View style={s.noiseOverlay} />
            </View>

            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
                <ScrollView contentContainerStyle={s.scrollContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

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

                    <Animated.View style={[s.logoArea, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
                        <View style={s.logoCircle}>
                            <LinearGradient colors={['#10B981', '#059669']} style={s.logoGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                                <Shield size={28} color="#FFFFFF" strokeWidth={2.5} />
                            </LinearGradient>
                            <View style={s.logoGlow} />
                        </View>
                        <Text style={s.brand}>
                            {isTR ? 'Hesap Oluştur' : 'Create Account'}
                        </Text>
                        <Text style={s.brandSub}>
                            {isTR ? 'Hayatını güvenle organize et.' : 'Organize your life securely.'}
                        </Text>
                    </Animated.View>

                    <Animated.View style={[s.card, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>

                        <Text style={s.label}>{isTR ? 'AD SOYAD' : 'FULL NAME'}</Text>
                        <View style={[s.inputWrap, focusedInput === 'name' && s.inputWrapFocused]}>
                            <User size={18} color={focusedInput === 'name' ? '#10B981' : '#64748B'} />
                            <TextInput
                                placeholder={isTR ? 'Adınız ve soyadınız' : 'Your full name'}
                                placeholderTextColor="#64748B"
                                style={s.input}
                                value={name}
                                onChangeText={setName}
                                autoCapitalize="words"
                                onFocus={() => setFocusedInput('name')}
                                onBlur={() => setFocusedInput(null)}
                            />
                        </View>

                        <Text style={s.label}>{isTR ? 'E-POSTA' : 'EMAIL'}</Text>
                        <View style={[s.inputWrap, focusedInput === 'email' && s.inputWrapFocused]}>
                            <Mail size={18} color={focusedInput === 'email' ? '#10B981' : '#64748B'} />
                            <TextInput
                                placeholder={isTR ? 'E-posta adresiniz' : 'Email address'}
                                placeholderTextColor="#64748B"
                                style={s.input}
                                value={email}
                                onChangeText={setEmail}
                                autoCapitalize="none"
                                keyboardType="email-address"
                                onFocus={() => setFocusedInput('email')}
                                onBlur={() => setFocusedInput(null)}
                            />
                        </View>

                        <Text style={s.label}>{isTR ? 'ŞİFRE' : 'PASSWORD'}</Text>
                        <View style={[s.inputWrap, focusedInput === 'password' && s.inputWrapFocused]}>
                            <Lock size={18} color={focusedInput === 'password' ? '#10B981' : '#64748B'} />
                            <TextInput
                                placeholder={isTR ? 'En az 6 karakter' : 'At least 6 characters'}
                                placeholderTextColor="#64748B"
                                style={s.input}
                                secureTextEntry
                                value={password}
                                onChangeText={setPassword}
                                onFocus={() => setFocusedInput('password')}
                                onBlur={() => setFocusedInput(null)}
                            />
                        </View>

                        <Text style={s.label}>{isTR ? 'ŞİFRE TEKRAR' : 'CONFIRM PASSWORD'}</Text>
                        <View style={[s.inputWrap, focusedInput === 'confirm' && s.inputWrapFocused]}>
                            <Lock size={18} color={focusedInput === 'confirm' ? '#10B981' : '#64748B'} />
                            <TextInput
                                placeholder={isTR ? 'Şifrenizi tekrar girin' : 'Re-enter password'}
                                placeholderTextColor="#64748B"
                                style={s.input}
                                secureTextEntry
                                value={confirmPassword}
                                onChangeText={setConfirmPassword}
                                onFocus={() => setFocusedInput('confirm')}
                                onBlur={() => setFocusedInput(null)}
                            />
                        </View>

                        <TouchableOpacity onPress={handleRegister} activeOpacity={0.8} disabled={loading} style={{ marginTop: 8 }}>
                            <LinearGradient colors={['#10B981', '#059669']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={[s.signUpBtn, loading && { opacity: 0.7 }]}>
                                {loading ? (
                                    <ActivityIndicator color="#FFFFFF" />
                                ) : (
                                    <>
                                        <Text style={s.signUpText}>
                                            {isTR ? 'Kayıt Ol' : 'Sign Up'}
                                        </Text>
                                        <ArrowRight size={20} color="#FFFFFF" />
                                    </>
                                )}
                            </LinearGradient>
                        </TouchableOpacity>



                        <Text style={s.terms}>
                            {isTR
                                ? 'Kayıt olarak Kullanım Şartlarını ve Gizlilik Politikasını kabul etmiş olursun.'
                                : 'By signing up, you agree to our Terms of Service and Privacy Policy.'}
                        </Text>
                    </Animated.View>

                    <Animated.View style={[s.footer, { opacity: fadeAnim }]}>
                        <Text style={s.footerText}>
                            {isTR ? 'Zaten hesabın var mı? ' : 'Already have an account? '}
                        </Text>
                        <TouchableOpacity onPress={() => router.back()}>
                            <Text style={s.signInLink}>
                                {isTR ? 'Giriş Yap' : 'Sign In'}
                            </Text>
                        </TouchableOpacity>
                    </Animated.View>

                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}

const s = StyleSheet.create({
    root: { flex: 1, backgroundColor: '#030712' },
    ambientLight: {
        position: 'absolute',
        top: -100,
        left: -50,
        width: 300,
        height: 300,
        borderRadius: 150,
        backgroundColor: '#10B981',
        opacity: 0.08,
    },
    ambientLight2: {
        position: 'absolute',
        bottom: 100,
        right: -100,
        width: 250,
        height: 250,
        borderRadius: 125,
        backgroundColor: '#3B82F6',
        opacity: 0.06,
    },
    noiseOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'transparent',
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: 24,
        paddingTop: Platform.OS === 'ios' ? 56 : 40,
        paddingBottom: 40,
        justifyContent: 'center',
    },
    topRow: {
        flexDirection: 'row',
        position: 'absolute',
        top: Platform.OS === 'ios' ? 60 : 40,
        left: 24,
        right: 24,
        zIndex: 10,
        alignItems: 'center',
    },
    backBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
    },
    backText: {
        color: '#F8FAFC',
        fontSize: 20,
    },
    langBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        gap: 6,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
    },
    langText: {
        color: '#94A3B8',
        fontSize: 12,
        fontWeight: '700',
        letterSpacing: 1,
    },

    logoArea: {
        alignItems: 'center',
        marginBottom: 32,
        marginTop: 60,
    },
    logoCircle: {
        width: 64,
        height: 64,
        borderRadius: 32,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
        position: 'relative',
    },
    logoGradient: {
        width: '100%',
        height: '100%',
        borderRadius: 32,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 2,
    },
    logoGlow: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        borderRadius: 32,
        backgroundColor: '#10B981',
        opacity: 0.6,
        transform: [{ scale: 1.2 }],
        zIndex: 1,
    },
    brand: {
        fontSize: 30,
        fontWeight: '800',
        color: '#FFFFFF',
        letterSpacing: -0.8,
    },
    brandSub: {
        fontSize: 15,
        color: '#94A3B8',
        fontWeight: '500',
        marginTop: 6,
    },

    card: {
        backgroundColor: 'rgba(30, 41, 59, 0.4)',
        borderRadius: 28,
        padding: 28,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.05)',
        marginBottom: 24,
    },
    label: {
        color: '#94A3B8',
        fontSize: 11,
        fontWeight: '700',
        letterSpacing: 1,
        marginBottom: 8,
        marginLeft: 4,
    },
    inputWrap: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(15, 23, 42, 0.6)',
        borderRadius: 16,
        paddingHorizontal: 20,
        height: 54,
        marginBottom: 20,
        gap: 14,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    inputWrapFocused: {
        borderColor: 'rgba(16, 185, 129, 0.4)',
        backgroundColor: 'rgba(15, 23, 42, 0.8)',
    },
    input: {
        flex: 1,
        color: '#F8FAFC',
        fontSize: 16,
        fontWeight: '500',
    },

    signUpBtn: {
        height: 56,
        borderRadius: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    signUpText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
        letterSpacing: 0.5,
    },

    terms: {
        color: '#64748B',
        fontSize: 12,
        textAlign: 'center',
        marginTop: 20,
        lineHeight: 18,
    },

    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 16,
    },
    footerText: {
        color: '#94A3B8',
        fontSize: 14,
    },
    signInLink: {
        color: '#10B981',
        fontSize: 14,
        fontWeight: '700',
    },
});
