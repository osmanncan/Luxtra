import { useRouter } from 'expo-router';
import { Crown, Lock } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useThemeColors } from '../store/theme';
import { useStore } from '../store/useStore';

interface ProGateProps {
    children: React.ReactNode;
    feature?: string; // label for what's locked
}

/**
 * Wraps content that requires Pro.
 * If user is not Pro, shows a lock overlay with upgrade prompt.
 * If user is Pro, renders children normally.
 */
export default function ProGate({ children, feature }: ProGateProps) {
    const isPro = useStore(s => s.user?.isPro ?? false);
    const language = useStore(s => s.language);
    const router = useRouter();
    const c = useThemeColors();
    const isTR = language === 'tr';

    if (isPro) {
        return <>{children}</>;
    }

    return (
        <View style={s.container}>
            {/* Blurred/dimmed content behind */}
            <View style={s.contentWrap} pointerEvents="none">
                <View style={{ opacity: 0.3 }}>
                    {children}
                </View>
            </View>

            {/* Lock overlay */}
            <View style={[s.overlay, { backgroundColor: c.base + 'E0' }]}>
                <View style={[s.lockCard, { backgroundColor: c.card, borderColor: c.cardBorder }]}>
                    <View style={[s.lockIcon, { backgroundColor: c.amber + '15' }]}>
                        <Lock size={24} color={c.amber} />
                    </View>
                    <Text style={[s.lockTitle, { color: c.offWhite }]}>
                        {isTR ? 'Pro Özelliği' : 'Pro Feature'}
                    </Text>
                    {feature && (
                        <Text style={[s.lockFeature, { color: c.subtle }]}>
                            {feature}
                        </Text>
                    )}
                    <Text style={[s.lockDesc, { color: c.muted }]}>
                        {isTR
                            ? 'Bu özelliği kullanmak için Pro\'ya yükselt.'
                            : 'Upgrade to Pro to unlock this feature.'}
                    </Text>
                    <TouchableOpacity
                        style={[s.upgradeBtn, { backgroundColor: c.emerald }]}
                        onPress={() => router.push('/modal')}
                        activeOpacity={0.85}
                    >
                        <Crown size={16} color="#0F1419" />
                        <Text style={s.upgradeBtnText}>
                            {isTR ? 'Pro\'ya Yükselt' : 'Upgrade to Pro'}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}

const s = StyleSheet.create({
    container: {
        position: 'relative',
    },
    contentWrap: {
        overflow: 'hidden',
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
        borderRadius: 16,
    },
    lockCard: {
        alignItems: 'center',
        padding: 28,
        borderRadius: 20,
        borderWidth: 1,
        width: '100%',
        maxWidth: 300,
    },
    lockIcon: {
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    lockTitle: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 4,
    },
    lockFeature: {
        fontSize: 13,
        fontWeight: '600',
        marginBottom: 8,
    },
    lockDesc: {
        fontSize: 13,
        fontWeight: '500',
        textAlign: 'center',
        marginBottom: 20,
        lineHeight: 20,
    },
    upgradeBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingHorizontal: 28,
        paddingVertical: 14,
        borderRadius: 14,
    },
    upgradeBtnText: {
        color: '#0F1419',
        fontSize: 15,
        fontWeight: '700',
    },
});
