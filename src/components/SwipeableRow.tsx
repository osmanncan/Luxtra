import { Trash2 } from 'lucide-react-native';
import React, { useRef } from 'react';
import {
    Animated,
    PanResponder,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';

interface SwipeableRowProps {
    children: React.ReactNode;
    onDelete: () => void;
    deleteColor?: string;
}

export default function SwipeableRow({ children, onDelete, deleteColor = '#EF4444' }: SwipeableRowProps) {
    const translateX = useRef(new Animated.Value(0)).current;
    const isSwipedOpen = useRef(false);

    const panResponder = useRef(
        PanResponder.create({
            onMoveShouldSetPanResponder: (_, gesture) => {
                return Math.abs(gesture.dx) > 10 && Math.abs(gesture.dy) < 10;
            },
            onPanResponderMove: (_, gesture) => {
                if (gesture.dx < 0) {
                    // Only allow swiping left
                    translateX.setValue(Math.max(gesture.dx, -90));
                } else if (isSwipedOpen.current) {
                    translateX.setValue(Math.min(-90 + gesture.dx, 0));
                }
            },
            onPanResponderRelease: (_, gesture) => {
                if (gesture.dx < -40) {
                    // Open delete action
                    Animated.spring(translateX, {
                        toValue: -80,
                        tension: 60,
                        friction: 10,
                        useNativeDriver: true,
                    }).start();
                    isSwipedOpen.current = true;
                } else {
                    // Snap back
                    Animated.spring(translateX, {
                        toValue: 0,
                        tension: 60,
                        friction: 10,
                        useNativeDriver: true,
                    }).start();
                    isSwipedOpen.current = false;
                }
            },
        })
    ).current;

    const handleDelete = () => {
        Animated.timing(translateX, {
            toValue: -500,
            duration: 300,
            useNativeDriver: true,
        }).start(() => {
            onDelete();
        });
    };

    return (
        <View style={s.container}>
            {/* Delete button behind the row */}
            <View style={[s.deleteAction, { backgroundColor: deleteColor + '15' }]}>
                <TouchableOpacity
                    style={[s.deleteBtn, { backgroundColor: deleteColor }]}
                    onPress={handleDelete}
                    activeOpacity={0.8}
                >
                    <Trash2 size={18} color="#FFF" />
                </TouchableOpacity>
            </View>

            {/* Foreground row */}
            <Animated.View
                style={[s.foreground, { transform: [{ translateX }] }]}
                {...panResponder.panHandlers}
            >
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
        width: 80,
        justifyContent: 'center',
        alignItems: 'center',
        borderTopRightRadius: 14,
        borderBottomRightRadius: 14,
    },
    deleteBtn: {
        width: 46,
        height: 46,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    foreground: {
        backgroundColor: 'transparent',
    },
});
