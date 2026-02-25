import { useRouter } from 'expo-router';
import { Globe } from 'lucide-react-native';
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
    const { language, setLanguage } = useStore();
    const isTR = language === 'tr';

    const handleStart = () => {
        router.replace('/login');
    };

    const languages = ['en', 'tr', 'es', 'de', 'fr', 'it', 'pt', 'ar'] as const;

    const toggleLang = () => {
        const currIdx = languages.indexOf(language as any);
        const nextLang = languages[(currIdx + 1) % languages.length];
        setLanguage(nextLang);
    };

    const translationsMap = {
        en: { title: 'Simplify your mind.', sub: 'Your subscriptions, bills, and life responsibilities in one secure place. We track them, you live your life.', btn: 'Get Started', footer: 'Your data stays only on this device.' },
        tr: { title: 'Zihnini sadeleştir.', sub: 'Aboneliklerin, faturaların ve hayat sorumlulukların artık tek bir güvenli yerde. Biz takip edelim, sen yaşamana bak.', btn: 'Hemen Başla', footer: 'Verilerin sadece bu cihazda saklanır.' },
        es: { title: 'Simplifica tu mente.', sub: 'Tus suscripciones, facturas y responsabilidades en un solo lugar seguro. Nosotros las seguimos, tú disfrutas tu vida.', btn: 'Empezar', footer: 'Tus datos se guardan solo en este dispositivo.' },
        de: { title: 'Vereinfache deinen Geist.', sub: 'Deine Abonnements, Rechnungen und Aufgaben an einem sicheren Ort. Wir verfolgen sie, du lebst dein Leben.', btn: 'Loslegen', footer: 'Deine Daten bleiben nur auf diesem Gerät.' },
        fr: { title: 'Simplifiez votre esprit.', sub: 'Vos abonnements, factures et responsabilités dans un seul endroit sécurisé. Nous les suivons, vous profitez de votre vie.', btn: 'Commencer', footer: 'Vos données restent uniquement sur cet appareil.' },
        it: { title: 'Semplifica la tua mente.', sub: 'Abbonamenti, bollette e responsabilità in un unico posto sicuro. Noi li monitoriamo, tu vivi la tua vita.', btn: 'Inizia', footer: 'I tuoi dati rimangono solo su questo dispositivo.' },
        pt: { title: 'Simplifique sua mente.', sub: 'Suas assinaturas, contas e responsabilidades em um lugar seguro. Nós acompanhamos, você vive sua vida.', btn: 'Começar', footer: 'Seus dados ficam apenas neste dispositivo.' },
        ar: { title: 'بسّط تفكيرك.', sub: 'اشتراكاتك وفواتيرك ومسؤوليات حياتك في مكان واحد آمن. نحن نتتبعها، وأنت تعيش حياتك.', btn: 'ابدأ الآن', footer: 'تبقى بياناتك على هذا الجهاز فقط.' }
    } as const;

    const t = (translationsMap as any)[language] || translationsMap.en;

    return (
        <View style={s.container}>
            <StatusBar barStyle="light-content" />

            {/* Language Toggle */}
            <View style={s.topRow}>
                <View style={{ flex: 1 }} />
                <TouchableOpacity onPress={toggleLang} style={s.langBtn}>
                    <Globe size={14} color="#94A3B8" />
                    <Text style={s.langText}>{language.toUpperCase()}</Text>
                </TouchableOpacity>
            </View>

            <View style={s.content}>
                <View style={s.emojiWrap}>
                    <Text style={s.emoji}>🛡️</Text>
                </View>

                <Text style={s.title}>{t.title}</Text>

                <Text style={s.subtitle}>{t.sub}</Text>

                <TouchableOpacity style={s.btn} onPress={handleStart} activeOpacity={0.85}>
                    <Text style={s.btnText}>{t.btn}</Text>
                </TouchableOpacity>
            </View>

            <View style={s.footer}>
                <Text style={s.footerText}>{t.footer}</Text>
            </View>
        </View>
    );
}

const s = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#050505',
        paddingHorizontal: 32,
        paddingTop: Platform.OS === 'ios' ? 56 : 40,
    },
    topRow: {
        flexDirection: 'row',
        marginBottom: 24,
    },
    langBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#111',
        paddingHorizontal: 14,
        paddingVertical: 7,
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
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
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
        textAlign: 'center',
    },
    subtitle: {
        color: '#888',
        fontSize: 18,
        fontWeight: '400',
        lineHeight: 28,
        marginBottom: 48,
        textAlign: 'center',
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
