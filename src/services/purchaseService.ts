import { Platform } from 'react-native';
import Purchases, { PurchasesPackage } from 'react-native-purchases';

// TODO: Buraya RevenueCat sitesinden aldığın Public Android API Key'i yapıştır.
const REVENUE_CAT_API_KEY = 'test_uBEjdRgTlDLZRdBVDUFJkXGZPXc';

export const PurchaseService = {
    /**
     * RevenueCat SDK'sını başlatır.
     */
    initialize: async () => {
        try {
            if (Platform.OS === 'android') {
                Purchases.configure({ apiKey: REVENUE_CAT_API_KEY });
                console.log('RevenueCat initialized for Android');
            }
        } catch (error) {
            console.error('RevenueCat initialization error:', error);
        }
    },

    /**
     * Mevcut teklifleri (Offerings) getirir.
     */
    getPackages: async (): Promise<PurchasesPackage[]> => {
        try {
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

    /**
     * Belirli bir paketi satın alır.
     */
    purchasePackage: async (pkg: PurchasesPackage): Promise<boolean> => {
        try {
            const { customerInfo } = await Purchases.purchasePackage(pkg);
            // 'pro' ismini RevenueCat panelindeki 'Entitlement' kısmıyla aynı yapmalısın.
            return customerInfo.entitlements.active['pro'] !== undefined;
        } catch (e: any) {
            if (!e.userCancelled) {
                console.error('Purchase error:', e);
            }
            return false;
        }
    },

    /**
     * Mevcut kullanıcının Pro durumunu kontrol eder.
     */
    checkProStatus: async (): Promise<boolean> => {
        try {
            const customerInfo = await Purchases.getCustomerInfo();
            return customerInfo.entitlements.active['pro'] !== undefined;
        } catch (e) {
            console.error('Error checking pro status:', e);
            return false;
        }
    },

    /**
     * Satın almaları geri yükler (Restore Purchases).
     */
    restorePurchases: async (): Promise<boolean> => {
        try {
            const customerInfo = await Purchases.restorePurchases();
            return customerInfo.entitlements.active['pro'] !== undefined;
        } catch (e) {
            console.error('Error restoring purchases:', e);
            return false;
        }
    }
};
