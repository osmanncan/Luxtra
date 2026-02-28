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
                <Text style={{ fontSize: 24 }}>{emoji}</Text>
            </View>
            <View style={{ flex: 1 }}>
                <Text style={[s.heroTitle, { color: colors.offWhite }]}>{title}</Text>
                <Text style={[s.heroSub, { color: colors.subtle }]}>{subtitle}</Text>
            </View>
        </View>
    );
};

const s = StyleSheet.create({
    heroCard: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 20,
        padding: 24,
        borderWidth: 1,
        marginBottom: 28,
        gap: 16,
    },
    heroIcon: {
        width: 52,
        height: 52,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
    },
    heroTitle: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 2,
    },
    heroSub: {
        fontSize: 13,
    },
});

