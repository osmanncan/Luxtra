import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions, Image, StyleSheet, Text, View } from 'react-native';
import { useStore } from '../store/useStore';

const { width } = Dimensions.get('window');

interface Props {
    onFinish: () => void;
}

export default function AnimatedSplashScreen({ onFinish }: Props) {
    const fadeAnim = useRef(new Animated.Value(1)).current;
    const pulseAnim = useRef(new Animated.Value(1)).current;
    const { language } = useStore();
    const isTR = language === 'tr';

    useEffect(() => {
        // Start glowing animation
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, { toValue: 1.15, duration: 800, useNativeDriver: true }),
                Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
            ])
        ).start();

        // After 2.5 seconds, fade entire screen out
        const timeout = setTimeout(() => {
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 500,
                useNativeDriver: true,
            }).start(() => {
                onFinish();
            });
        }, 2500);

        return () => clearTimeout(timeout);
    }, [fadeAnim, pulseAnim, onFinish]);

    return (
        <Animated.View style={[s.root, { opacity: fadeAnim }]}>
            <View style={StyleSheet.absoluteFill}>
                <View style={s.ambientLight} />
                <View style={s.ambientLight2} />
            </View>

            <View style={s.logoArea}>
                <View style={s.logoCircle}>
                    <Image
                        source={require('../../assets/images/icon.png')}
                        style={s.imageResized}
                    />
                    <Animated.View style={[s.logoGlow, { transform: [{ scale: pulseAnim }] }]} />
                </View>
                <Text style={s.brand}>Luxtra</Text>
                <Text style={s.brandSub}>
                    {isTR ? 'Sadece sana özel asistanın.' : 'Your private life assistant.'}
                </Text>
            </View>
        </Animated.View>
    );
}

const s = StyleSheet.create({
    root: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: '#030712',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 9999,
        elevation: 9999,
    },
    ambientLight: {
        position: 'absolute',
        top: '15%',
        left: -50,
        width: width * 0.8,
        height: width * 0.8,
        borderRadius: width * 0.4,
        backgroundColor: '#10B981',
        opacity: 0.1,
    },
    ambientLight2: {
        position: 'absolute',
        bottom: '15%',
        right: -100,
        width: width * 0.7,
        height: width * 0.7,
        borderRadius: width * 0.35,
        backgroundColor: '#3B82F6',
        opacity: 0.08,
    },
    logoArea: {
        alignItems: 'center',
    },
    logoCircle: {
        width: 90,
        height: 90,
        borderRadius: 36,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
        position: 'relative',
        shadowColor: '#10B981',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.8,
        shadowRadius: 20,
        elevation: 15,
    },
    imageResized: {
        width: '100%',
        height: '100%',
        borderRadius: 36,
        zIndex: 2,
    },
    logoGlow: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        borderRadius: 36,
        backgroundColor: '#10B981',
        opacity: 0.7,
        zIndex: 1,
    },
    brand: {
        fontSize: 42,
        fontWeight: '800',
        color: '#FFFFFF',
        letterSpacing: -1.2,
    },
    brandSub: {
        fontSize: 16,
        color: '#94A3B8',
        fontWeight: '500',
        marginTop: 8,
        letterSpacing: 0.3,
    },
});
