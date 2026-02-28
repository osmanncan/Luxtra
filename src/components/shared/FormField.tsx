import React from 'react';
import { StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';

interface FormFieldProps extends TextInputProps {
    label: string;
    icon?: React.ReactNode;
    suffix?: string;
    colors: {
        subtle: string;
        card: string;
        cardBorder: string;
        offWhite: string;
        dim: string;
    };
}

export const FormField = ({ label, icon, suffix, colors, style, ...props }: FormFieldProps) => {
    return (
        <View style={s.container}>
            <Text style={[s.label, { color: colors.subtle }]}>{label.toUpperCase()}</Text>
            <View style={[s.inputWrap, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
                {icon}
                <TextInput
                    style={[s.input, { color: colors.offWhite }, style]}
                    placeholderTextColor={colors.dim}
                    {...props}
                />
                {suffix && <Text style={[s.suffix, { color: colors.dim }]}>{suffix}</Text>}
            </View>
        </View>
    );
};

const s = StyleSheet.create({
    container: {
        marginBottom: 20,
    },
    label: {
        fontSize: 11,
        fontWeight: '700',
        letterSpacing: 1.2,
        marginBottom: 8,
        marginLeft: 4,
    },
    inputWrap: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderRadius: 14,
        paddingHorizontal: 18,
        paddingVertical: 16,
    },
    input: {
        fontSize: 16,
        fontWeight: '500',
        flex: 1,
    },
    suffix: {
        fontSize: 13,
        fontWeight: '500',
        marginLeft: 8,
    },
});

