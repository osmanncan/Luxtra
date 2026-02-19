import { useRouter } from 'expo-router';
import { ArrowRight } from 'lucide-react-native';
import React, { useRef, useState } from 'react';
import {
    Animated,
    Dimensions,
    FlatList,
    Platform,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useStore } from '../src/store/useStore';

const { width } = Dimensions.get('window');

const SLIDES_EN = [
    {
        id: '1',
        emoji: '📋',
        title: 'Life gets busy.',
        subtitle: 'Bills, renewals, responsibilities — important things slip through the cracks.',
    },
    {
        id: '2',
        emoji: '🔔',
        title: 'We track what matters.',
        subtitle: 'Smart reminders for subscriptions, deadlines, and recurring payments.',
    },
    {
        id: '3',
        emoji: '🛡️',
        title: 'So nothing gets forgotten.',
        subtitle: 'You focus on living. We handle the admin.',
        cta: 'Get Started',
    },
];

const SLIDES_TR = [
    {
        id: '1',
        emoji: '📋',
        title: 'Hayat yoğun.',
        subtitle: 'Faturalar, yenilemeler, sorumluluklar — önemli şeyler gözden kaçıyor.',
    },
    {
        id: '2',
        emoji: '🔔',
        title: 'Önemli olanı takip ediyoruz.',
        subtitle: 'Abonelikler, son tarihler ve düzenli ödemeler için akıllı hatırlatmalar.',
    },
    {
        id: '3',
        emoji: '🛡️',
        title: 'Hiçbir şey unutulmasın.',
        subtitle: 'Sen yaşamana odaklan. Bürokratik işleri biz halledelim.',
        cta: 'Başlayalım',
    },
];

export default function OnboardingScreen() {
    const router = useRouter();
    const language = useStore(s => s.language);
    const SLIDES = language === 'tr' ? SLIDES_TR : SLIDES_EN;
    const scrollX = useRef(new Animated.Value(0)).current;
    const flatListRef = useRef<FlatList>(null);
    const [currentIndex, setCurrentIndex] = useState(0);

    const handleNext = () => {
        if (currentIndex < SLIDES.length - 1) {
            flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
        } else {
            router.replace('/login');
        }
    };

    const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
        if (viewableItems.length > 0) {
            setCurrentIndex(viewableItems[0].index || 0);
        }
    }).current;

    return (
        <View style={s.container}>
            <StatusBar barStyle="light-content" />

            {/* Skip */}
            {currentIndex < SLIDES.length - 1 && (
                <TouchableOpacity
                    style={s.skipBtn}
                    onPress={() => router.replace('/login')}
                    activeOpacity={0.7}
                >
                    <Text style={s.skipText}>{language === 'tr' ? 'Atla' : 'Skip'}</Text>
                </TouchableOpacity>
            )}

            <Animated.FlatList
                ref={flatListRef}
                data={SLIDES}
                keyExtractor={(item) => item.id}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onScroll={Animated.event(
                    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
                    { useNativeDriver: false }
                )}
                onViewableItemsChanged={onViewableItemsChanged}
                scrollEventThrottle={32}
                renderItem={({ item }) => (
                    <View style={s.slide}>
                        <View style={s.emojiWrap}>
                            <Text style={s.emoji}>{item.emoji}</Text>
                        </View>
                        <Text style={s.title}>{item.title}</Text>
                        <Text style={s.subtitle}>{item.subtitle}</Text>
                    </View>
                )}
            />

            {/* Bottom */}
            <View style={s.bottom}>
                {/* Dots */}
                <View style={s.dotsContainer}>
                    {SLIDES.map((_, i) => {
                        const inputRange = [(i - 1) * width, i * width, (i + 1) * width];
                        const dotWidth = scrollX.interpolate({
                            inputRange,
                            outputRange: [8, 28, 8],
                            extrapolate: 'clamp',
                        });
                        const opacity = scrollX.interpolate({
                            inputRange,
                            outputRange: [0.3, 1, 0.3],
                            extrapolate: 'clamp',
                        });

                        return (
                            <Animated.View
                                key={i}
                                style={[
                                    s.dot,
                                    {
                                        width: dotWidth,
                                        opacity,
                                        backgroundColor: i === currentIndex ? '#10B981' : '#334155',
                                    },
                                ]}
                            />
                        );
                    })}
                </View>

                {/* Button */}
                <TouchableOpacity style={s.btn} onPress={handleNext} activeOpacity={0.85}>
                    <Text style={s.btnText}>
                        {currentIndex === SLIDES.length - 1
                            ? (language === 'tr' ? 'Başlayalım' : 'Get Started')
                            : (language === 'tr' ? 'Devam Et' : 'Continue')
                        }
                    </Text>
                    <ArrowRight size={20} color="#0F1419" />
                </TouchableOpacity>
            </View>
        </View>
    );
}

const s = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0F1419',
    },
    skipBtn: {
        position: 'absolute',
        top: Platform.OS === 'ios' ? 56 : 40,
        right: 24,
        zIndex: 10,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#1E293B',
        borderWidth: 1,
        borderColor: '#334155',
    },
    skipText: {
        color: '#94A3B8',
        fontSize: 14,
        fontWeight: '600',
    },
    slide: {
        width,
        flex: 1,
        paddingHorizontal: 32,
        justifyContent: 'center',
        alignItems: 'flex-start',
    },
    emojiWrap: {
        width: 72,
        height: 72,
        borderRadius: 20,
        backgroundColor: '#1E293B',
        borderWidth: 1,
        borderColor: '#334155',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 32,
    },
    emoji: {
        fontSize: 32,
    },
    title: {
        color: '#F1F5F9',
        fontSize: 36,
        fontWeight: '700',
        letterSpacing: -0.8,
        marginBottom: 14,
        lineHeight: 44,
    },
    subtitle: {
        color: '#64748B',
        fontSize: 17,
        fontWeight: '400',
        lineHeight: 26,
        maxWidth: '90%',
    },
    bottom: {
        position: 'absolute',
        bottom: 50,
        left: 32,
        right: 32,
    },
    dotsContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 24,
        gap: 8,
    },
    dot: {
        height: 8,
        borderRadius: 4,
    },
    btn: {
        flexDirection: 'row',
        height: 58,
        backgroundColor: '#10B981',
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 10,
    },
    btnText: {
        color: '#0F1419',
        fontSize: 17,
        fontWeight: '700',
    },
});
