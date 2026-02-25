import { Platform } from 'react-native';

let Purchases: any = null;
try {
    Purchases = require('react-native-purchases').default;
} catch (error) {
    console.log('RevenueCat native module not available');
}

// TODO: Buraya RevenueCat sitesinden aldığın Public Android API Key'i yapıştır.
const REVENUE_CAT_API_KEY = 'test_uBEjdRgTlDLZRdBVDUFJkXGZPXc';

export const PurchaseService = {
    initialize: async () => {
        try {
            if (Purchases && Platform.OS === 'android') {
                Purchases.configure({ apiKey: REVENUE_CAT_API_KEY });
                console.log('RevenueCat initialized for Android');
            }
        } catch (error) {
            console.error('RevenueCat initialization error:', error);
        }
    },

    getPackages: async (): Promise<any[]> => {
        try {
            if (!Purchases) return [];
            const offerings = await Purchases.getOfferings();
            if (offerings.current !== null && offerings.current.availablePackages.length !== 0) {
                return offerings.current.availablePackages;
            }
            return [];
        } catch (e) {
            console.error('Error getting packages:', e);
            return [];
        }
    },

    purchasePackage: async (pkg: any): Promise<boolean> => {
        try {
            if (!Purchases) return true; // mock mode
            const { customerInfo } = await Purchases.purchasePackage(pkg);
            return customerInfo.entitlements.active['pro'] !== undefined;
        } catch (e: any) {
            if (!e.userCancelled) {
                console.error('Purchase error:', e);
            }
            return false;
        }
    },

    checkProStatus: async (): Promise<boolean> => {
        try {
            if (!Purchases) return false;
            const customerInfo = await Purchases.getCustomerInfo();
            return customerInfo.entitlements.active['pro'] !== undefined;
        } catch (e) {
            console.error('Error checking pro status:', e);
            return false;
        }
    },

    restorePurchases: async (): Promise<boolean> => {
        try {
            if (!Purchases) return true; // mock mode
            const customerInfo = await Purchases.restorePurchases();
            return customerInfo.entitlements.active['pro'] !== undefined;
        } catch (e) {
            console.error('Error restoring purchases:', e);
            return false;
        }
    }
};
