import { Platform } from 'react-native';

let Purchases: any = null;
let isNativeAvailable = false;

try {
    const NativeModules = require('react-native').NativeModules;
    if (NativeModules.RNPurchases) {
        Purchases = require('react-native-purchases').default;
        isNativeAvailable = true;
    } else {
        console.log('[Luxtra] RevenueCat native module not detected — Play Store billing requires a real device build.');
    }
} catch (error) {
    console.log('[Luxtra] RevenueCat loading error:', error);
}

// !! IMPORTANT: Replace this with your REAL RevenueCat API key from https://app.revenuecat.com
// For Google Play: Use the "Google Play" platform API key
const REVENUE_CAT_API_KEY = Platform.select({
    android: 'test_vLWaXCIZEPMvlHPQzLyORISxUiK',
    ios: 'test_vLWaXCIZEPMvlHPQzLyORISxUiK',
    default: 'test_vLWaXCIZEPMvlHPQzLyORISxUiK',
});

export const PurchaseService = {
    /**
     * Initialize RevenueCat SDK.
     * Must be called once at app startup.
     */
    initialize: async () => {
        try {
            if (isNativeAvailable && Purchases) {
                Purchases.configure({ apiKey: REVENUE_CAT_API_KEY });
                console.log('[Luxtra] RevenueCat initialized successfully');
            } else {
                console.warn('[Luxtra] RevenueCat not available — running in Expo Go or web. In-app purchases require a production build.');
            }
        } catch (error) {
            console.warn('[Luxtra] RevenueCat Init Error:', error);
        }
    },

    /**
     * Identify the user in RevenueCat (links purchases to user account).
     * Call this after login.
     */
    identifyUser: async (userId: string) => {
        try {
            if (isNativeAvailable && Purchases) {
                await Purchases.logIn(userId);
                console.log('[Luxtra] RevenueCat user identified:', userId);
            }
        } catch (error) {
            console.warn('[Luxtra] RevenueCat identify error:', error);
        }
    },

    /**
     * Fetch available subscription packages from RevenueCat.
     * Returns an empty array if RevenueCat is not available (e.g., Expo Go).
     */
    getPackages: async (): Promise<any[]> => {
        try {
            if (!isNativeAvailable || !Purchases) {
                console.warn('[Luxtra] Cannot fetch packages — RevenueCat native module not available.');
                return [];
            }

            const offerings = await Purchases.getOfferings();
            if (offerings.current?.availablePackages?.length > 0) {
                return offerings.current.availablePackages;
            }

            console.warn('[Luxtra] No offerings configured in RevenueCat dashboard.');
            return [];
        } catch (e) {
            console.error('[Luxtra] Error fetching packages:', e);
            return [];
        }
    },

    /**
     * Purchase a subscription package through Google Play / App Store.
     * Returns true only if the purchase is verified by RevenueCat.
     * NO mock/fallback — real payment required.
     */
    purchasePackage: async (pkg: any): Promise<{ success: boolean; error?: string }> => {
        if (!isNativeAvailable || !Purchases) {
            return {
                success: false,
                error: 'IN_APP_PURCHASES_NOT_AVAILABLE',
            };
        }

        if (!pkg) {
            return {
                success: false,
                error: 'NO_PACKAGE_SELECTED',
            };
        }

        try {
            const { customerInfo } = await Purchases.purchasePackage(pkg);
            const hasPro = customerInfo.entitlements.active['Luxtra Pro'] !== undefined;

            if (hasPro) {
                console.log('[Luxtra] ✅ Purchase successful! Pro entitlement active.');
                return { success: true };
            } else {
                console.warn('[Luxtra] Purchase went through but pro entitlement not found.');
                return {
                    success: false,
                    error: 'ENTITLEMENT_NOT_FOUND',
                };
            }
        } catch (e: any) {
            if (e.userCancelled) {
                console.log('[Luxtra] User cancelled the purchase.');
                return {
                    success: false,
                    error: 'USER_CANCELLED',
                };
            }

            console.error('[Luxtra] Purchase error:', e);
            return {
                success: false,
                error: e.message || 'PURCHASE_ERROR',
            };
        }
    },

    /**
     * Check if the current user has an active Pro subscription.
     * Queries RevenueCat's servers for the latest status.
     */
    checkProStatus: async (): Promise<boolean> => {
        try {
            if (!isNativeAvailable || !Purchases) {
                return false;
            }

            const customerInfo = await Purchases.getCustomerInfo();
            return customerInfo.entitlements.active['Luxtra Pro'] !== undefined;
        } catch (e) {
            console.error('[Luxtra] Error checking pro status:', e);
            return false;
        }
    },

    /**
     * Restore previous purchases (e.g., after reinstall or new device).
     * Returns true if a Pro entitlement is found after restoration.
     */
    restorePurchases: async (): Promise<boolean> => {
        if (!isNativeAvailable || !Purchases) {
            return false;
        }

        try {
            const customerInfo = await Purchases.restorePurchases();
            return customerInfo.entitlements.active['Luxtra Pro'] !== undefined;
        } catch (e) {
            console.error('[Luxtra] Error restoring purchases:', e);
            return false;
        }
    },

    /**
     * Check if RevenueCat native module is available.
     * Returns false in Expo Go or web environments.
     */
    isAvailable: (): boolean => {
        return isNativeAvailable && Purchases !== null;
    },
};
