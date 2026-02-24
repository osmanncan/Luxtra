import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface HeroCardProps {
    emoji: string;
    title: string;
    subtitle: string;
    colors: {
        card: string;
        cardBorder: string;
        offWhite: string;
        subtle: string;
    };
}

export const HeroCard = ({ emoji, title, subtitle, colors }: HeroCardProps) => {
    return (
        <View style={[s.heroCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <View style={[s.heroIcon, { backgroundColor: colors.cardBorder }]}>
                <Text style={{ fontSize: 28 }}>{emoji}</Text>
            </View>
            <Text style={[s.heroTitle, { color: colors.offWhite }]}>{title}</Text>
            <Text style={[s.heroSub, { color: colors.subtle }]}>{subtitle}</Text>
        </View>
    );
};

const s = StyleSheet.create({
    heroCard: {
        alignItems: 'center',
        borderRadius: 20,
        padding: 28,
        borderWidth: 1,
        marginBottom: 28,
    },
    heroIcon: {
        width: 60,
        height: 60,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    heroTitle: {
        fontSize: 20,
        fontWeight: '700',
        marginBottom: 6,
    },
    heroSub: {
        fontSize: 14,
        textAlign: 'center',
    },
});
