import { useRouter } from 'expo-router';
import React from 'react';
import {
    Platform,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useStore } from '../src/store/useStore';

export default function OnboardingScreen() {
    const router = useRouter();
    const language = useStore(s => s.language);
    const isTR = language === 'tr';

    const handleStart = () => {
        router.replace('/login');
    };

    return (
        <View style={s.container}>
            <StatusBar barStyle="light-content" />

            <View style={s.content}>
                <View style={s.emojiWrap}>
                    <Text style={s.emoji}>🛡️</Text>
                </View>

                <Text style={s.title}>
                    {isTR ? 'Zihnini sadeleştir.' : 'Simplify your mind.'}
                </Text>

                <Text style={s.subtitle}>
                    {isTR
                        ? 'Aboneliklerin, faturaların ve hayat sorumlulukların artık tek bir güvenli yerde. Biz takip edelim, sen yaşamana bak.'
                        : 'Your subscriptions, bills, and life responsibilities in one secure place. We track them, you live your life.'}
                </Text>

                <TouchableOpacity style={s.btn} onPress={handleStart} activeOpacity={0.85}>
                    <Text style={s.btnText}>{isTR ? 'Hemen Başla' : 'Get Started'}</Text>
                </TouchableOpacity>
            </View>

            <View style={s.footer}>
                <Text style={s.footerText}>
                    {isTR ? 'Verilerin sadece bu cihazda saklanır.' : 'Your data stays only on this device.'}
                </Text>
            </View>
        </View>
    );
}

const s = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#050505', // Daha derin bir siyah
        paddingHorizontal: 32,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'flex-start',
    },
    emojiWrap: {
        width: 80,
        height: 80,
        borderRadius: 24,
        backgroundColor: '#111',
        borderWidth: 1,
        borderColor: '#222',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 40,
    },
    emoji: {
        fontSize: 36,
    },
    title: {
        color: '#FFF',
        fontSize: 40,
        fontWeight: '800',
        letterSpacing: -1,
        marginBottom: 16,
        lineHeight: 48,
    },
    subtitle: {
        color: '#888',
        fontSize: 18,
        fontWeight: '400',
        lineHeight: 28,
        marginBottom: 48,
    },
    btn: {
        width: '100%',
        height: 64,
        backgroundColor: '#10B981',
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#10B981',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 15,
        elevation: 5,
    },
    btnText: {
        color: '#000',
        fontSize: 18,
        fontWeight: '700',
    },
    footer: {
        paddingBottom: Platform.OS === 'ios' ? 40 : 20,
        alignItems: 'center',
    },
    footerText: {
        color: '#444',
        fontSize: 13,
        fontWeight: '500',
    },
});
