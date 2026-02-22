// Free vs Pro feature definitions
export const FREE_LIMITS = {
    maxSubscriptions: 7,
    maxResponsibilities: 10,
};

export const PRO_FEATURES = {
    unlimitedTracking: 'unlimited_tracking',
    aiInsights: 'ai_insights',
    budgetTracking: 'budget_tracking',
    recurringTasks: 'recurring_tasks',
} as const;

export type ProFeature = typeof PRO_FEATURES[keyof typeof PRO_FEATURES];

export function isFeatureLocked(feature: ProFeature, isPro: boolean): boolean {
    if (isPro) return false;
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
                { text: 'Timeline view', included: true },
                { text: 'Search & filter', included: true },
                { text: 'Dark/Light theme', included: true },
                { text: 'TR/EN language', included: true },
                { text: 'AI insights', included: false },
                { text: 'Budget tracking', included: false },
                { text: 'Recurring tasks', included: false },
                { text: 'Unlimited tracking', included: false },
            ],
        },
        pro: {
            title: 'Pro',
            monthlyPrice: '$4.99',
            yearlyPrice: '$49.99',
            features: [
                { text: 'Unlimited subscriptions', included: true },
                { text: 'Unlimited responsibilities', included: true },
                { text: 'Timeline view', included: true },
                { text: 'Search & filter', included: true },
                { text: 'AI insights', included: true },
                { text: 'Budget tracking', included: true },
                { text: 'Recurring tasks', included: true },
                { text: 'Unlimited tracking', included: true },
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
                { text: 'Zaman çizelgesi', included: true },
                { text: 'Arama & filtreleme', included: true },
                { text: 'Koyu/Açık tema', included: true },
                { text: 'TR/EN dil desteği', included: true },
                { text: 'AI önerileri', included: false },
                { text: 'Bütçe takibi', included: false },
                { text: 'Tekrarlayan görevler', included: false },
                { text: 'Sınırsız takip', included: false },
            ],
        },
        pro: {
            title: 'Pro',
            monthlyPrice: '₺149.99',
            yearlyPrice: '₺1499.99',
            features: [
                { text: 'Sınırsız abonelik', included: true },
                { text: 'Sınırsız sorumluluk', included: true },
                { text: 'Zaman çizelgesi', included: true },
                { text: 'Arama & filtreleme', included: true },
                { text: 'AI önerileri', included: true },
                { text: 'Bütçe takibi', included: true },
                { text: 'Tekrarlayan görevler', included: true },
                { text: 'Sınırsız takip', included: true },
            ],
        },
    },
};
