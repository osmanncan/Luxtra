import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
    }),
});

export const NotificationService = {
    requestPermissions: async () => {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;

        if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }

        if (finalStatus !== 'granted') {
            return false;
        }

        if (Platform.OS === 'android') {
            await Notifications.setNotificationChannelAsync('default', {
                name: 'default',
                importance: Notifications.AndroidImportance.MAX,
                vibrationPattern: [0, 250, 250, 250],
                lightColor: '#10B981',
            });
        }

        return true;
    },

    scheduleNotification: async (
        id: string,
        title: string,
        body: string,
        triggerDate: Date,
        data: any = {}
    ) => {
        await NotificationService.cancelNotification(id);

        if (triggerDate.getTime() <= Date.now()) return null;

        try {
            // Hata buradaydı: trigger tipini açıkça belirtiyoruz
            return await Notifications.scheduleNotificationAsync({
                content: {
                    title,
                    body,
                    data: { ...data, localId: id },
                    sound: true,
                },
                trigger: {
                    type: Notifications.SchedulableTriggerInputTypes.DATE, // Tip eklendi
                    date: triggerDate,
                } as any,
                identifier: id,
            });
        } catch (error) {
            console.error('Error scheduling notification:', error);
            return null;
        }
    },

    cancelNotification: async (identifier: string) => {
        try {
            await Notifications.cancelScheduledNotificationAsync(identifier);
        } catch (error) {
            // Bildirim bulunamadıysa görmezden gel
        }
    },

    cancelAll: async () => {
        await Notifications.cancelAllScheduledNotificationsAsync();
    }
};