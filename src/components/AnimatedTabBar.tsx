import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Calendar, CreditCard, LayoutDashboard, Settings } from 'lucide-react-native';
import React, { useEffect, useRef } from 'react';
import {
    Animated,
    Platform,
    StyleSheet,
    TouchableOpacity,
    View
} from 'react-native';
import { useThemeColors } from '../../src/store/theme';

const TAB_ICONS: Record<string, any> = {
    index: LayoutDashboard,
    timeline: Calendar,
    spending: CreditCard,
    settings: Settings,
};

function AnimatedTabItem({
    route,
    isFocused,
    label,
    onPress,
    onLongPress,
    colors,
}: {
    route: string;
    isFocused: boolean;
    label: string;
    onPress: () => void;
    onLongPress: () => void;
    colors: ReturnType<typeof useThemeColors>;
}) {
    const scaleAnim = useRef(new Animated.Value(isFocused ? 1 : 0)).current;
    const translateYAnim = useRef(new Animated.Value(isFocused ? -2 : 0)).current;
    const bgOpacity = useRef(new Animated.Value(isFocused ? 1 : 0)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.spring(scaleAnim, {
                toValue: isFocused ? 1 : 0,
                tension: 65,
                friction: 8,
                useNativeDriver: true,
            }),
            Animated.spring(translateYAnim, {
                toValue: isFocused ? -3 : 0,
                tension: 65,
                friction: 8,
                useNativeDriver: true,
            }),
            Animated.timing(bgOpacity, {
                toValue: isFocused ? 1 : 0,
                duration: 200,
                useNativeDriver: true,
            }),
        ]).start();
    }, [isFocused]);

    const Icon = TAB_ICONS[route];
    const iconColor = isFocused ? colors.emerald : colors.dim;

    const animatedScale = scaleAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [1, 1.15],
    });

    return (
        <TouchableOpacity
            onPress={onPress}
            onLongPress={onLongPress}
            style={s.tabItem}
            activeOpacity={0.7}
        >
            <Animated.View
                style={[
                    s.tabContent,
                    {
                        transform: [{ translateY: translateYAnim }, { scale: animatedScale }],
                    },
                ]}
            >
                {/* Background glow */}
                <Animated.View
                    style={[
                        s.tabBg,
                        {
                            backgroundColor: colors.emerald + '15',
                            opacity: bgOpacity,
                        },
                    ]}
                />

                {Icon && (
                    <Icon size={22} color={iconColor} strokeWidth={isFocused ? 2.5 : 1.8} />
                )}

                {/* Active indicator dot */}
                <Animated.View
                    style={[
                        s.activeDot,
                        {
                            backgroundColor: colors.emerald,
                            opacity: scaleAnim,
                            transform: [
                                {
                                    scale: scaleAnim.interpolate({
                                        inputRange: [0, 1],
                                        outputRange: [0, 1],
                                    }),
                                },
                            ],
                        },
                    ]}
                />

                <Animated.Text
                    style={[
                        s.tabLabel,
                        {
                            color: isFocused ? colors.emerald : colors.dim,
                            opacity: scaleAnim.interpolate({
                                inputRange: [0, 1],
                                outputRange: [0.7, 1],
                            }),
                        },
                    ]}
                    numberOfLines={1}
                >
                    {label}
                </Animated.Text>
            </Animated.View>
        </TouchableOpacity>
    );
}

export default function AnimatedTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
    const colors = useThemeColors();

    return (
        <View style={[s.container, { backgroundColor: colors.tabBarBg, borderTopColor: colors.tabBarBorder }]}>
            {state.routes.map((route, index) => {
                const { options } = descriptors[route.key];
                const label = (options.tabBarLabel !== undefined
                    ? options.tabBarLabel
                    : options.title !== undefined
                        ? options.title
                        : route.name) as string;

                const isFocused = state.index === index;

                const onPress = () => {
                    const event = navigation.emit({
                        type: 'tabPress',
                        target: route.key,
                        canPreventDefault: true,
                    });

                    if (!isFocused && !event.defaultPrevented) {
                        navigation.navigate(route.name, route.params);
                    }
                };

                const onLongPress = () => {
                    navigation.emit({
                        type: 'tabLongPress',
                        target: route.key,
                    });
                };

                return (
                    <AnimatedTabItem
                        key={route.key}
                        route={route.name}
                        isFocused={isFocused}
                        label={label}
                        onPress={onPress}
                        onLongPress={onLongPress}
                        colors={colors}
                    />
                );
            })}
        </View>
    );
}

const s = StyleSheet.create({
    container: {
        flexDirection: 'row',
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: Platform.OS === 'ios' ? 88 : 70,
        borderTopWidth: 1,
        paddingBottom: Platform.OS === 'ios' ? 24 : 8,
        paddingTop: 8,
    },
    tabItem: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    tabContent: {
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
    },
    tabBg: {
        position: 'absolute',
        width: 48,
        height: 48,
        borderRadius: 14,
        top: -13,
    },
    activeDot: {
        width: 4,
        height: 4,
        borderRadius: 2,
        marginTop: 3,
        marginBottom: 1,
    },
    tabLabel: {
        fontSize: 10,
        fontWeight: '600',
        letterSpacing: 0.3,
    },
});
