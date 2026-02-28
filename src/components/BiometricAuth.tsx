import * as LocalAuthentication from 'expo-local-authentication';
import { Lock, ScanFace } from 'lucide-react-native';
import React, { useEffect, useRef, useState } from 'react';
import {
    AppState,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { useThemeColors } from '../store/theme';
import { useStore } from '../store/useStore';

interface BiometricAuthProps {
    children: React.ReactNode;
}

export default function BiometricAuth({ children }: BiometricAuthProps) {
    const { isBiometricEnabled, language } = useStore();
    const c = useThemeColors();
    const appState = useRef(AppState.currentState);
    const [isLocked, setIsLocked] = useState(false);
    const [hasHardware, setHasHardware] = useState(false);

    // Only check lock on initial mount if enabled
    useEffect(() => {
        checkHardware();
        if (isBiometricEnabled) {
            setIsLocked(true);
            authenticate();
        }
    }, []);

    // Monitor app state changes (background -> active)
    useEffect(() => {
        const subscription = AppState.addEventListener('change', nextAppState => {
            if (
                appState.current.match(/inactive|background/) &&
                nextAppState === 'active' &&
                isBiometricEnabled
            ) {
                setIsLocked(true);
                authenticate();
            }
            appState.current = nextAppState;
        });

        return () => {
            subscription.remove();
        };
    }, [isBiometricEnabled]);

    const checkHardware = async () => {
        const compatible = await LocalAuthentication.hasHardwareAsync();
        setHasHardware(compatible);
    };

    const authenticate = async () => {
        try {
            const result = await LocalAuthentication.authenticateAsync({
                promptMessage: language === 'tr' ? 'Luxtra Kilidini Aç' : 'Unlock Luxtra',
                fallbackLabel: language === 'tr' ? 'Şifre Gir' : 'Enter Passcode',
                disableDeviceFallback: false,
                cancelLabel: language === 'tr' ? 'İptal' : 'Cancel',
            });

            if (result.success) {
                setIsLocked(false);
            }
        } catch (error) {
            console.log('Auth error', error);
        }
    };

    if (!isLocked) {
        return <>{children}</>;
    }

    // Locked Screen UI
    return (
        <View style={[s.container, { backgroundColor: c.base }]}>
            <View style={s.iconContainer}>
                <View style={[s.iconCircle, { backgroundColor: c.emerald + '20' }]}>
                    <Lock size={48} color={c.emerald} />
                </View>
            </View>

            <Text style={[s.title, { color: c.offWhite }]}>
                {language === 'tr' ? 'Luxtra Kilitli' : 'Luxtra Locked'}
            </Text>

            <Text style={[s.subtitle, { color: c.subtle }]}>
                {language === 'tr'
                    ? 'Devam etmek için kimliğini doğrula.'
                    : 'Authenticate to continue.'}
            </Text>

            <TouchableOpacity
                style={[s.authBtn, { backgroundColor: c.emerald }]}
                onPress={authenticate}
                activeOpacity={0.8}
            >
                <ScanFace size={24} color="#0F1419" />
                <Text style={s.authBtnText}>
                    {language === 'tr' ? 'Kilidi Aç' : 'Unlock'}
                </Text>
            </TouchableOpacity>
        </View>
    );
}

const s = StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 9999,
    },
    iconContainer: {
        marginBottom: 24,
    },
    iconCircle: {
        width: 96,
        height: 96,
        borderRadius: 48,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: '800',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        fontWeight: '500',
        marginBottom: 40,
        textAlign: 'center',
    },
    authBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingHorizontal: 32,
        paddingVertical: 16,
        borderRadius: 16,
    },
    authBtnText: {
        fontSize: 18,
        fontWeight: '700',
        color: '#0F1419',
    },
});

