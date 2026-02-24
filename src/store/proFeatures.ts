export const FREE_LIMITS = {
    maxSubscriptions: 5,
    maxResponsibilities: 5,
};

export const PRO_FEATURES = {
    unlimitedTracking: 'unlimited_tracking',
    aiInsights: 'ai_insights',
    budgetTracking: 'budget_tracking',
    recurringTasks: 'recurring_tasks',
    customCategories: 'custom_categories',
    biometricLock: 'biometric_lock',
} as const;

export type ProFeature = typeof PRO_FEATURES[keyof typeof PRO_FEATURES];

export function isFeatureLocked(feature: ProFeature, isPro: boolean): boolean {
    if (isPro) return false;
    // Specific free features
    if (feature === 'biometric_lock') return false;
    return true;
}

export function canAddSubscription(currentCount: number, isPro: boolean): boolean {
    if (isPro) return true;
    return currentCount < FREE_LIMITS.maxSubscriptions;
}

export function canAddResponsibility(currentCount: number, isPro: boolean): boolean {
    if (isPro) return true;
    return currentCount < FREE_LIMITS.maxResponsibilities;
}

export function getRemainingSlots(type: 'subscription' | 'responsibility', currentCount: number, isPro: boolean) {
    if (isPro) return Infinity;
    const max = type === 'subscription' ? FREE_LIMITS.maxSubscriptions : FREE_LIMITS.maxResponsibilities;
    return Math.max(0, max - currentCount);
}

// Feature descriptions for paywall
export const FEATURE_COMPARISON = {
    en: {
        free: {
            title: 'Free',
            price: '$0',
            features: [
                { text: `Up to ${FREE_LIMITS.maxSubscriptions} subscriptions`, included: true },
                { text: `Up to ${FREE_LIMITS.maxResponsibilities} responsibilities`, included: true },
                { text: 'Basic reminders', included: true },
                { text: 'Dark/Light theme', included: true },
                { text: 'AI Insights & Analytics', included: false },
                { text: 'Custom Categories & Icons', included: false },
                { text: 'Advanced Budgeting', included: false },
                { text: 'Unlimited Everything', included: false },
            ],
        },
        pro: {
            title: 'Pro',
            monthlyPrice: '$4.99',
            yearlyPrice: '$39.99',
            features: [
                { text: 'Unlimited subscriptions', included: true },
                { text: 'Unlimited responsibilities', included: true },
                { text: 'Advanced Smart Reminders', included: true },
                { text: 'Custom Categories & Icons', included: true },
                { text: 'AI Financial Assistant', included: true },
                { text: 'Detailed Spend Reports', included: true },
                { text: 'Export Data (CSV/PDF)', included: true },
                { text: 'Priority Support', included: true },
            ],
        },
    },
    tr: {
        free: {
            title: 'Ücretsiz',
            price: '₺0',
            features: [
                { text: `${FREE_LIMITS.maxSubscriptions} aboneliğe kadar`, included: true },
                { text: `${FREE_LIMITS.maxResponsibilities} sorumluluğa kadar`, included: true },
                { text: 'Temel hatırlatıcılar', included: true },
                { text: 'Koyu/Açık tema', included: true },
                { text: 'AI Analiz ve Öneriler', included: false },
                { text: 'Özel Kategoriler & İkonlar', included: false },
                { text: 'Gelişmiş Bütçe Takibi', included: false },
                { text: 'Sınırsız Her Şey', included: false },
            ],
        },
        pro: {
            title: 'Pro',
            monthlyPrice: '₺99.99',
            yearlyPrice: '₺799.99',
            features: [
                { text: 'Sınırsız abonelik', included: true },
                { text: 'Sınırsız sorumluluk', included: true },
                { text: 'Gelişmiş Akıllı Hatırlatıcılar', included: true },
                { text: 'Özel Kategoriler & İkonlar', included: true },
                { text: 'AI Finansal Asistan', included: true },
                { text: 'Detaylı Harcama Raporları', included: true },
                { text: 'Veri Dışa Aktar (CSV/PDF)', included: true },
                { text: 'Öncelikli Destek', included: true },
            ],
        },
    },
};
