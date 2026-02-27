import { useRouter } from 'expo-router';
import { ArrowRight, Calendar, Globe, Sparkles, Wallet } from 'lucide-react-native';
import React, { useRef, useState } from 'react';
import {
    Dimensions,
    Platform,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useStore } from '../src/store/useStore';

const { width } = Dimensions.get('window');

export default function OnboardingScreen() {
    const router = useRouter();
    const { language, setLanguage } = useStore();
    const [currentIndex, setCurrentIndex] = useState(0);
    const scrollRef = useRef<ScrollView>(null);

    const handleStart = () => {
        router.replace('/login');
    };

    const nextSlide = () => {
        if (currentIndex < 2) {
            scrollRef.current?.scrollTo({ x: (currentIndex + 1) * width, animated: true });
        } else {
            handleStart();
        }
    };

    const skipOnboarding = () => {
        handleStart();
    };

    const languages = ['en', 'tr', 'es', 'de', 'fr', 'it', 'pt', 'ar'] as const;

    const toggleLang = () => {
        const currIdx = languages.indexOf(language as any);
        const nextLang = languages[(currIdx + 1) % languages.length];
        setLanguage(nextLang);
    };

    const translationsMap = {
        en: {
            skip: 'Skip',
            next: 'Next',
            start: 'Get Started for Free',
            slides: [
                { id: 1, title: 'Track Everything', sub: 'Netflix, Spotify, Insurance... all your subscriptions in one place.', icon: 'wallet' },
                { id: 2, title: 'Never Miss a Task', sub: 'Visual timelines and smart reminders for your responsibilities.', icon: 'calendar' },
                { id: 3, title: 'AI Assistant', sub: 'Your personal AI analyzes your spending and helps you save money.', icon: 'sparkles' }
            ],
            footer: 'Your data stays secure.'
        },
        tr: {
            skip: 'Atla',
            next: 'İleri',
            start: 'Ücretsiz Başla',
            slides: [
                { id: 1, title: 'Her Şeyi Tek Yerden Takip Et', sub: 'Netflix, Spotify, Sigorta... tüm aboneliklerin kontrol altında.', icon: 'wallet' },
                { id: 2, title: 'Sorumlulukların Asla Kaçmasın', sub: 'Görevleriniz için görsel zaman çizelgesi ve akıllı hatırlatıcılar.', icon: 'calendar' },
                { id: 3, title: 'Yapay Zeka Asistanın', sub: 'Kişisel AI asistanın harcamalarını analiz eder ve tasarruf etmeni sağlar.', icon: 'sparkles' }
            ],
            footer: 'Verilerin güvende kalır.'
        },
        es: {
            skip: 'Omitir',
            next: 'Siguiente',
            start: 'Empezar gratis',
            slides: [
                { id: 1, title: 'Rastrea Todo', sub: 'Netflix, Spotify, Seguros... todas tus suscripciones en un solo lugar.', icon: 'wallet' },
                { id: 2, title: 'Nunca Olvides Tareas', sub: 'Líneas de tiempo y recordatorios inteligentes para ti.', icon: 'calendar' },
                { id: 3, title: 'Asistente de IA', sub: 'Tu IA personal analiza tus gastos y te ayuda a ahorrar.', icon: 'sparkles' }
            ],
            footer: 'Tus datos se mantienen seguros.'
        },
        de: {
            skip: 'Überspringen',
            next: 'Weiter',
            start: 'Kostenlos starten',
            slides: [
                { id: 1, title: 'Alles Verfolgen', sub: 'Netflix, Spotify, Versicherungen... alle Ihre Abonnements an einem Ort.', icon: 'wallet' },
                { id: 2, title: 'Nie Wieder Aufgaben Verpassen', sub: 'Visuelle Zeitleisten und intelligente Erinnerungen für Sie.', icon: 'calendar' },
                { id: 3, title: 'KI-Assistent', sub: 'Ihre persönliche KI analysiert Ihre Ausgaben und hilft Ihnen beim Sparen.', icon: 'sparkles' }
            ],
            footer: 'Ihre Daten bleiben sicher.'
        },
        fr: {
            skip: 'Passer',
            next: 'Suivant',
            start: 'Commencer gratuitement',
            slides: [
                { id: 1, title: 'Tout Suivre', sub: 'Netflix, Spotify, Assurances... tous vos abonnements au même endroit.', icon: 'wallet' },
                { id: 2, title: 'Ne Manquez Jamais Rien', sub: 'Chronologies visuelles et rappels intelligents pour vos tâches.', icon: 'calendar' },
                { id: 3, title: 'Assistant IA', sub: 'Votre IA personnelle analyse vos dépenses et aide à économiser.', icon: 'sparkles' }
            ],
            footer: 'Vos données restent sécurisées.'
        },
        it: {
            skip: 'Salta',
            next: 'Avanti',
            start: 'Inizia gratuitamente',
            slides: [
                { id: 1, title: 'Monitora Tutto', sub: 'Netflix, Spotify, Assicurazioni... tutti i tuoi abbonamenti in un solo posto.', icon: 'wallet' },
                { id: 2, title: 'Non Dimenticare Mai Nulla', sub: 'Scadenziari visivi e promemoria intelligenti per te.', icon: 'calendar' },
                { id: 3, title: 'Assistente IA', sub: 'La tua IA personale analizza le tue spese e ti aiuta a risparmiare.', icon: 'sparkles' }
            ],
            footer: 'I tuoi dati restano al sicuro.'
        },
        pt: {
            skip: 'Pular',
            next: 'Próximo',
            start: 'Começar grátis',
            slides: [
                { id: 1, title: 'Acompanhe Tudo', sub: 'Netflix, Spotify, Seguros... todas as suas assinaturas em um só lugar.', icon: 'wallet' },
                { id: 2, title: 'Nunca Perca Tarefas', sub: 'Cronogramas visuais e lembretes inteligentes para suas responsabilidades.', icon: 'calendar' },
                { id: 3, title: 'Assistente de IA', sub: 'Sua IA pessoal analisa seus gastos e ajuda você a economizar.', icon: 'sparkles' }
            ],
            footer: 'Seus dados permanecem seguros.'
        },
        ar: {
            skip: 'تخطى',
            next: 'التالي',
            start: 'ابدأ مجاناً',
            slides: [
                { id: 1, title: 'تتبع كل شيء', sub: 'نتفليكس، سبوتيفاي، التأمين... جميع اشتراكاتك في مكان واحد.', icon: 'wallet' },
                { id: 2, title: 'لا تفوت المهام', sub: 'جداول زمنية مرئية وتذكيرات ذكية لمسؤولياتك.', icon: 'calendar' },
                { id: 3, title: 'مساعد الذكاء الاصطناعي', sub: 'الذكاء الاصطناعي الشخصي يحلل نفقاتك ويساعدك على التوفير.', icon: 'sparkles' }
            ],
            footer: 'بياناتك تبقى آمنة.'
        }
    } as const;

    const t = (translationsMap as any)[language] || translationsMap.en;

    const renderIcon = (iconStr: string) => {
        switch (iconStr) {
            case 'wallet': return <Wallet size={40} color="#10B981" />;
            case 'calendar': return <Calendar size={40} color="#10B981" />;
            case 'sparkles': return <Sparkles size={40} color="#10B981" />;
            default: return <Globe size={40} color="#10B981" />;
        }
    };

    return (
        <View style={s.container}>
            <StatusBar barStyle="light-content" />

            {/* Header */}
            <View style={s.topRow}>
                <TouchableOpacity onPress={toggleLang} style={s.langBtn}>
                    <Globe size={14} color="#94A3B8" />
                    <Text style={s.langText}>{language.toUpperCase()}</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={skipOnboarding}>
                    <Text style={s.skipText}>{t.skip}</Text>
                </TouchableOpacity>
            </View>

            {/* Slider */}
            <ScrollView
                ref={scrollRef}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onMomentumScrollEnd={(e) => {
                    const idx = Math.round(e.nativeEvent.contentOffset.x / width);
                    setCurrentIndex(idx);
                }}
            >
                {t.slides.map((slide: any, i: number) => (
                    <View key={slide.id} style={s.slide}>
                        <View style={s.emojiWrap}>
                            {renderIcon(slide.icon)}
                        </View>
                        <Text style={s.title}>{slide.title}</Text>
                        <Text style={s.subtitle}>{slide.sub}</Text>
                    </View>
                ))}
            </ScrollView>

            {/* Footer Navigation */}
            <View style={s.footerContainer}>
                {/* Pagination Dots */}
                <View style={s.dots}>
                    {t.slides.map((_: any, i: number) => (
                        <View key={i} style={[s.dot, i === currentIndex && s.activeDot]} />
                    ))}
                </View>

                {/* Main Action Button */}
                {currentIndex === 2 ? (
                    <TouchableOpacity style={[s.btn, s.btnPrimary]} onPress={handleStart} activeOpacity={0.85}>
                        <Text style={s.btnTextPrimary}>{t.start}</Text>
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity style={s.btnNext} onPress={nextSlide} activeOpacity={0.85}>
                        <Text style={s.btnTextNext}>{t.next}</Text>
                        <ArrowRight size={20} color="#FFF" />
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
}

const s = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#050505',
        paddingTop: Platform.OS === 'ios' ? 56 : 40,
    },
    topRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 24,
        marginBottom: 20,
    },
    langBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#111',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        gap: 6,
        borderWidth: 1,
        borderColor: '#222',
    },
    langText: {
        color: '#94A3B8',
        fontSize: 12,
        fontWeight: '700',
        letterSpacing: 0.8,
    },
    skipText: {
        color: '#64748B',
        fontSize: 14,
        fontWeight: '600',
    },
    slide: {
        width,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 32,
    },
    emojiWrap: {
        width: 96,
        height: 96,
        borderRadius: 32,
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        borderWidth: 1,
        borderColor: 'rgba(16, 185, 129, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 40,
    },
    title: {
        color: '#FFF',
        fontSize: 32,
        fontWeight: '800',
        letterSpacing: -1,
        marginBottom: 16,
        lineHeight: 40,
        textAlign: 'center',
    },
    subtitle: {
        color: '#94A3B8',
        fontSize: 16,
        fontWeight: '400',
        lineHeight: 26,
        textAlign: 'center',
    },
    footerContainer: {
        paddingHorizontal: 32,
        paddingBottom: Platform.OS === 'ios' ? 50 : 30,
        alignItems: 'center',
        gap: 24,
    },
    dots: {
        flexDirection: 'row',
        gap: 8,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#333',
    },
    activeDot: {
        width: 24,
        backgroundColor: '#10B981',
    },
    btnNext: {
        width: '100%',
        height: 56,
        backgroundColor: '#1A1A1A',
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#333',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
    },
    btnTextNext: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '600',
    },
    btnPrimary: {
        width: '100%',
        height: 60,
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
    btnTextPrimary: {
        color: '#000',
        fontSize: 18,
        fontWeight: '700',
    },
    btn: {
        // base styling
    },
});
