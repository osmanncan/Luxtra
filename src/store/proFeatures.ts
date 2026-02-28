export const FREE_LIMITS = {
    maxSubscriptions: 10,
    maxResponsibilities: 10,
};

export const PRO_FEATURES = {
    unlimitedTracking: 'unlimited_tracking',
    aiInsights: 'ai_insights',
    budgetTracking: 'budget_tracking',
    recurringTasks: 'recurring_tasks',
    customCategories: 'custom_categories',
    biometricLock: 'biometric_lock',
    advancedFiltering: 'advanced_filtering',
} as const;

export type ProFeature = typeof PRO_FEATURES[keyof typeof PRO_FEATURES];

export function isFeatureLocked(feature: ProFeature, isPro: boolean): boolean {
    if (isPro) return false;
    // Specific free features
    if (feature === 'biometric_lock' || feature === 'budget_tracking' || feature === 'custom_categories') return false;
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
                { text: 'AI Insights (3/month)', included: true },
                { text: 'Advanced Reports & Charts', included: false },
                { text: 'Export Data (CSV/PDF)', included: false },
                { text: 'Advanced Filtering', included: false },
                { text: 'Unlimited Everything', included: false },
            ],
        },
        pro: {
            title: 'Pro',
            monthlyPrice: '$2.99',
            yearlyPrice: '$19.99',
            features: [
                { text: 'Unlimited subscriptions', included: true },
                { text: 'Unlimited responsibilities', included: true },
                { text: 'Advanced Smart Reminders', included: true },
                { text: 'Unlimited AI Assistant', included: true },
                { text: 'Detailed Reports & Charts', included: true },
                { text: 'Export Data (CSV/PDF)', included: true },
                { text: 'Advanced Filter & Calendar', included: true },
                { text: 'Unlock Everything Forever', included: true },
            ],
        },
    },
    tr: {
        free: {
            title: 'Ücretsiz',
            price: '₺0',
            features: [
                { text: `${FREE_LIMITS.maxSubscriptions} abonelik limiti`, included: true },
                { text: `${FREE_LIMITS.maxResponsibilities} sorumluluk limiti`, included: true },
                { text: 'Temel hatırlatıcılar', included: true },
                { text: 'AI Analiz (Ayda 3 Soru)', included: true },
                { text: 'Detaylı Analiz & Grafikler', included: false },
                { text: 'Veri Dışa Aktarma (PDF)', included: false },
                { text: 'Gelişmiş Filtreleme', included: false },
                { text: 'Sınırsız Her Şey', included: false },
            ],
        },
        pro: {
            title: 'Pro',
            monthlyPrice: '₺49.99',
            yearlyPrice: '₺349.99',
            features: [
                { text: 'Sınırsız abonelik takibi', included: true },
                { text: 'Sınırsız sorumluluk takibi', included: true },
                { text: 'Akıllı Bildirimler', included: true },
                { text: 'Sınırsız AI Finans Asistanı', included: true },
                { text: 'Gelişmiş Analiz Paneli', included: true },
                { text: 'PDF Rapor Dışa Aktar', included: true },
                { text: 'Gelişmiş Filtre & Takvim', included: true },
                { text: 'Her Şeyi Sınırsız Kullan', included: true },
            ],
        },
    },
};

