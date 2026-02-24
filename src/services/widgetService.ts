import { requestWidgetUpdate } from 'react-native-android-widget';
import { PaymentWidget } from '../../widgets/android/PaymentWidget';
import { CURRENCIES, Subscription } from '../store/useStore';

export async function updateAndroidWidget(subscriptions: Subscription[], currency: string) {
    try {
        const total = subscriptions.reduce((acc, sub) => acc + sub.amount, 0);
        const symbol = CURRENCIES[currency]?.symbol || '';

        // Calculate next upcoming payment
        const sortedSubs = [...subscriptions].sort((a, b) => {
            const dateA = new Date(a.nextBillingDate).getTime();
            const dateB = new Date(b.nextBillingDate).getTime();
            return dateA - dateB;
        });

        const nextSub = sortedSubs.find(s => !s.isPaid) || sortedSubs[0];
        let daysLeft = '';

        if (nextSub) {
            const today = new Date();
            const nextDate = new Date(nextSub.nextBillingDate);
            const diffTime = Math.abs(nextDate.getTime() - today.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            daysLeft = diffDays.toString();
        }

        await requestWidgetUpdate({
            widgetName: 'PaymentWidget',
            renderWidget: () => PaymentWidget({
                totalAmount: `${symbol}${total.toFixed(0)}`,
                nextPaymentName: nextSub ? nextSub.name : 'No Payments',
                nextPaymentDays: daysLeft
            }),

        });

    } catch (error) {
        // Widget update might fail if not installed or on iOS
        console.log('Widget update skipped', error);
    }
}
