import { ArrowRight, Brain } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ThemeColors } from '../../store/theme';

interface SmartInsightProps {
    title: string;
    body: string;
    buttonLabel: string;
    onPress: () => void;
    colors: ThemeColors;
}

export const SmartInsight = ({ title, body, buttonLabel, onPress, colors }: SmartInsightProps) => {
    return (
        <View style={[s.insightCard, { backgroundColor: colors.emerald + '08', borderColor: colors.emerald + '20' }]}>
            <View style={s.insightHeader}>
                <Brain size={16} color={colors.emerald} />
                <Text style={[s.insightTitle, { color: colors.emerald }]}>{title}</Text>
            </View>
            <Text style={[s.insightBody, { color: colors.muted }]}>
                {body}
            </Text>
            <TouchableOpacity
                style={s.insightBtn}
                activeOpacity={0.7}
                onPress={onPress}
            >
                <Text style={[s.insightBtnText, { color: colors.emerald }]}>
                    {buttonLabel}
                </Text>
                <ArrowRight size={14} color={colors.emerald} />
            </TouchableOpacity>
        </View>
    );
};

const s = StyleSheet.create({
    insightCard: {
        borderRadius: 16,
        padding: 18,
        marginTop: 16,
        borderWidth: 1,
    },
    insightHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 8,
    },
    insightTitle: {
        fontSize: 13,
        fontWeight: '700',
    },
    insightBody: {
        fontSize: 13,
        lineHeight: 20,
        fontWeight: '500',
        marginBottom: 12,
    },
    insightBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    insightBtnText: {
        fontSize: 13,
        fontWeight: '700',
    },
});
