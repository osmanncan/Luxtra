import { Trash2 } from 'lucide-react-native';
import React, { useRef } from 'react';
import {
    Animated,
    PanResponder,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

interface SwipeableRowProps {
    children: React.ReactNode;
    onDelete: () => void;
    deleteColor?: string;
    backgroundColor?: string;
}

export default function SwipeableRow({
    children,
    onDelete,
    deleteColor = '#EF4444',
    backgroundColor = 'transparent'
}: SwipeableRowProps) {
    const translateX = useRef(new Animated.Value(0)).current;
    const isSwipedOpen = useRef(false);

    const closeRow = () => {
        Animated.spring(translateX, {
            toValue: 0,
            tension: 60,
            friction: 10,
            useNativeDriver: true,
        }).start();
        isSwipedOpen.current = false;
    };

    const panResponder = useRef(
        PanResponder.create({
            onMoveShouldSetPanResponder: (_, gesture) => {
                return Math.abs(gesture.dx) > 8 && Math.abs(gesture.dy) < 15;
            },
            onPanResponderGrant: () => {
                // If open and user starts swiping, capture the gesture
            },
            onPanResponderMove: (_, gesture) => {
                if (gesture.dx < 0) {
                    translateX.setValue(Math.max(gesture.dx, -90));
                } else if (isSwipedOpen.current) {
                    translateX.setValue(Math.min(-90 + gesture.dx, 0));
                }
            },
            onPanResponderRelease: (_, gesture) => {
                if (gesture.dx < -40) {
                    Animated.spring(translateX, {
                        toValue: -80,
                        tension: 60,
                        friction: 10,
                        useNativeDriver: true,
                    }).start();
                    isSwipedOpen.current = true;
                } else {
                    closeRow();
                }
            },
        })
    ).current;

    const handleDelete = () => {
        Animated.timing(translateX, {
            toValue: -500,
            duration: 280,
            useNativeDriver: true,
        }).start(() => {
            onDelete();
        });
    };

    return (
        <View style={s.container}>
            {/* Delete button behind the row */}
            <View style={[s.deleteAction, { backgroundColor: deleteColor + '18' }]}>
                <TouchableOpacity
                    style={[s.deleteBtn, { backgroundColor: deleteColor }]}
                    onPress={handleDelete}
                    activeOpacity={0.8}
                >
                    <Trash2 size={18} color="#FFF" />
                    <Text style={s.deleteLabel}>Sil</Text>
                </TouchableOpacity>
            </View>

            {/* Foreground row — sits on top with higher zIndex */}
            <Animated.View
                style={[s.foreground, { transform: [{ translateX }], backgroundColor }]}
                {...panResponder.panHandlers}
            >
                {/* Invisible tap catcher to close swipe when tapping open row */}
                {children}
            </Animated.View>
        </View>
    );
}

const s = StyleSheet.create({
    container: {
        position: 'relative',
        overflow: 'hidden',
        marginBottom: 8,
        borderRadius: 14,
    },
    deleteAction: {
        position: 'absolute',
        right: 0,
        top: 0,
        bottom: 0,
        width: 84,
        justifyContent: 'center',
        alignItems: 'center',
        borderTopRightRadius: 14,
        borderBottomRightRadius: 14,
    },
    deleteBtn: {
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 4,
    },
    deleteLabel: {
        color: '#FFF',
        fontSize: 11,
        fontWeight: '700',
    },
    foreground: {
        backgroundColor: 'transparent',
        zIndex: 1,
    },
});

