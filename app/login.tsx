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

    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(40)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
            Animated.spring(slideAnim, { toValue: 0, tension: 40, friction: 8, useNativeDriver: true }),
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

    const handleTestLogin = async () => {
        setLoading(true);
        const result = await login('osmancan@lifeos.app', '123456'); // Example test credentials
        setLoading(false);
        if (result.success) {
            router.replace('/(tabs)');
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
                        <View style={{ flex: 1 }} />
                        <TouchableOpacity onPress={toggleLang} style={s.langBtn}>
                            <Globe size={14} color="#94A3B8" />
                            <Text style={s.langText}>{language.toUpperCase()}</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Logo */}
                    <Animated.View style={[s.logoArea, { opacity: fadeAnim }]}>
                        <View style={s.logoCircle}>
                            <Shield size={32} color="#10B981" />
                        </View>
                        <Text style={s.brand}>LifeOS</Text>
                        <Text style={s.brandSub}>
                            {language === 'tr' ? 'Hayatın, organize.' : 'Your life, organized.'}
                        </Text>
                    </Animated.View>

                    {/* Card */}
                    <Animated.View
                        style={[s.card, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}
                    >
                        <Text style={s.cardTitle}>{t.loginTitle}</Text>
                        <Text style={s.cardSub}>{t.loginSub}</Text>

                        {/* Email */}
                        <View style={s.inputWrap}>
                            <Mail size={18} color="#475569" />
                            <TextInput
                                placeholder={t.emailPlaceholder}
                                placeholderTextColor="#475569"
                                style={s.input}
                                value={email}
                                onChangeText={setEmail}
                                autoCapitalize="none"
                                keyboardType="email-address"
                            />
                        </View>

                        {/* Password */}
                        <View style={s.inputWrap}>
                            <Lock size={18} color="#475569" />
                            <TextInput
                                placeholder={t.passwordPlaceholder}
                                placeholderTextColor="#475569"
                                style={s.input}
                                secureTextEntry
                                value={password}
                                onChangeText={setPassword}
                            />
                        </View>

                        {/* Sign In */}
                        <TouchableOpacity
                            onPress={handleLogin}
                            activeOpacity={0.85}
                            disabled={loading}
                        >
                            <View style={[s.signInBtn, loading && { opacity: 0.7 }]}>
                                {loading ? (
                                    <ActivityIndicator color="#0F1419" />
                                ) : (
                                    <>
                                        <Text style={s.signInText}>{t.loginBtn}</Text>
                                        <ArrowRight size={20} color="#0F1419" />
                                    </>
                                )}
                            </View>
                        </TouchableOpacity>

                    </Animated.View>

                    {/* Footer */}
                    <View style={s.footer}>
                        <Text style={s.footerText}>{t.noAccount} </Text>
                        <TouchableOpacity onPress={() => router.push('/register' as any)}>
                            <Text style={s.signUpLink}>{t.signUp}</Text>
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
        marginBottom: 24,
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
        marginBottom: 32,
    },
    logoCircle: {
        width: 72,
        height: 72,
        borderRadius: 36,
        backgroundColor: '#10B98115',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#10B98125',
    },
    brand: {
        fontSize: 32,
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
        padding: 28,
        borderWidth: 1,
        borderColor: '#334155',
        marginBottom: 24,
    },
    cardTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: '#F1F5F9',
        marginBottom: 4,
        letterSpacing: -0.4,
    },
    cardSub: {
        fontSize: 14,
        color: '#64748B',
        marginBottom: 24,
        fontWeight: '500',
    },
    inputWrap: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#0F1419',
        borderRadius: 12,
        paddingHorizontal: 16,
        height: 52,
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

    signInBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: 52,
        borderRadius: 12,
        gap: 10,
        marginTop: 4,
        backgroundColor: '#10B981',
    },
    signInText: {
        color: '#0F1419',
        fontSize: 16,
        fontWeight: '700',
    },

    divider: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 18,
    },
    divLine: {
        flex: 1,
        height: 1,
        backgroundColor: '#334155',
    },
    divText: {
        color: '#475569',
        fontSize: 11,
        fontWeight: '700',
        marginHorizontal: 16,
        letterSpacing: 1,
    },

    testBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: 52,
        borderRadius: 12,
        gap: 8,
        backgroundColor: '#0F1419',
        borderWidth: 1,
        borderColor: '#334155',
    },
    testText: {
        color: '#10B981',
        fontSize: 14,
        fontWeight: '700',
    },

    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
    },
    footerText: {
        color: '#64748B',
        fontSize: 14,
    },
    signUpLink: {
        color: '#F1F5F9',
        fontSize: 14,
        fontWeight: '800',
    },
});
