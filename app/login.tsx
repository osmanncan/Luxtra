import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { ArrowRight, Globe, Lock, Mail, Shield } from 'lucide-react-native';
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
import { translations } from '../src/store/translations';
import { useStore } from '../src/store/useStore';

export default function LoginScreen() {
    const login = useStore((s) => s.login);
    const router = useRouter();
    const { language, setLanguage } = useStore();
    const t = translations[language].auth;

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [focusedInput, setFocusedInput] = useState<'email' | 'password' | null>(null);

    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(60)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
            Animated.spring(slideAnim, { toValue: 0, tension: 35, friction: 9, useNativeDriver: true }),
        ]).start();
    }, []);

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert(
                language === 'tr' ? 'Hata' : 'Error',
                language === 'tr' ? 'Lütfen tüm alanları doldurun' : 'Please fill in all fields'
            );
            return;
        }

        setLoading(true);
        const result = await login(email, password);
        setLoading(false);

        if (result.success) {
            router.replace('/(tabs)');
        } else {
            Alert.alert(
                language === 'tr' ? 'Giriş Başarısız' : 'Login Failed',
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
                        <View style={{ flex: 1 }} />
                        <TouchableOpacity onPress={toggleLang} style={s.langBtn}>
                            <Globe size={14} color="#94A3B8" />
                            <Text style={s.langText}>{language.toUpperCase()}</Text>
                        </TouchableOpacity>
                    </View>

                    <Animated.View style={[s.logoArea, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
                        <View style={s.logoCircle}>
                            <LinearGradient colors={['#10B981', '#059669']} style={s.logoGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                                <Shield size={36} color="#FFFFFF" strokeWidth={2.5} />
                            </LinearGradient>
                            <View style={s.logoGlow} />
                        </View>
                        <Text style={s.brand}>LifeOS</Text>
                        <Text style={s.brandSub}>
                            {language === 'tr' ? 'Sadece sana özel asistanın.' : 'Your private life assistant.'}
                        </Text>
                    </Animated.View>

                    <Animated.View style={[s.card, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
                        <View style={s.cardHeader}>
                            <Text style={s.cardTitle}>{t.loginTitle}</Text>
                            <Text style={s.cardSub}>{t.loginSub}</Text>
                        </View>

                        <View style={[s.inputWrap, focusedInput === 'email' && s.inputWrapFocused]}>
                            <Mail size={18} color={focusedInput === 'email' ? '#10B981' : '#64748B'} />
                            <TextInput
                                placeholder={t.emailPlaceholder}
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

                        <View style={[s.inputWrap, focusedInput === 'password' && s.inputWrapFocused]}>
                            <Lock size={18} color={focusedInput === 'password' ? '#10B981' : '#64748B'} />
                            <TextInput
                                placeholder={t.passwordPlaceholder}
                                placeholderTextColor="#64748B"
                                style={s.input}
                                secureTextEntry
                                value={password}
                                onChangeText={setPassword}
                                onFocus={() => setFocusedInput('password')}
                                onBlur={() => setFocusedInput(null)}
                            />
                        </View>

                        <TouchableOpacity onPress={handleLogin} activeOpacity={0.8} disabled={loading} style={{ marginTop: 8 }}>
                            <LinearGradient colors={['#10B981', '#059669']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={[s.signInBtn, loading && { opacity: 0.7 }]}>
                                {loading ? (
                                    <ActivityIndicator color="#FFFFFF" />
                                ) : (
                                    <>
                                        <Text style={s.signInText}>{t.loginBtn}</Text>
                                        <ArrowRight size={20} color="#FFFFFF" />
                                    </>
                                )}
                            </LinearGradient>
                        </TouchableOpacity>



                    </Animated.View>

                    <Animated.View style={[s.footer, { opacity: fadeAnim }]}>
                        <Text style={s.footerText}>{t.noAccount} </Text>
                        <TouchableOpacity onPress={() => router.push('/register' as any)}>
                            <Text style={s.signUpLink}>{t.signUp}</Text>
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
        right: 24,
        zIndex: 10,
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
        marginBottom: 48,
        marginTop: 60,
    },
    logoCircle: {
        width: 80,
        height: 80,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
        position: 'relative',
    },
    logoGradient: {
        width: '100%',
        height: '100%',
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 2,
    },
    logoGlow: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        borderRadius: 24,
        backgroundColor: '#10B981',
        opacity: 0.6,
        transform: [{ scale: 1.2 }],
        zIndex: 1,
    },
    brand: {
        fontSize: 36,
        fontWeight: '800',
        color: '#FFFFFF',
        letterSpacing: -1.2,
    },
    brandSub: {
        fontSize: 15,
        color: '#94A3B8',
        fontWeight: '500',
        marginTop: 6,
        letterSpacing: 0.2,
    },

    card: {
        backgroundColor: 'rgba(30, 41, 59, 0.4)',
        borderRadius: 28,
        padding: 32,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.05)',
        marginBottom: 32,
    },
    cardHeader: {
        marginBottom: 28,
    },
    cardTitle: {
        fontSize: 26,
        fontWeight: '700',
        color: '#F8FAFC',
        marginBottom: 6,
        letterSpacing: -0.5,
    },
    cardSub: {
        fontSize: 15,
        color: '#94A3B8',
        fontWeight: '500',
        lineHeight: 22,
    },
    inputWrap: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(15, 23, 42, 0.6)',
        borderRadius: 16,
        paddingHorizontal: 20,
        height: 58,
        marginBottom: 16,
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

    signInBtn: {
        height: 56,
        borderRadius: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    signInText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
        letterSpacing: 0.5,
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
    signUpLink: {
        color: '#10B981',
        fontSize: 14,
        fontWeight: '700',
    },
});
