import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { Check, Crown, Shield, Sparkles, X, Zap } from 'lucide-react-native';
import React, { useEffect, useRef, useState } from 'react';
import { Alert, Animated, Platform, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { FEATURE_COMPARISON, FREE_LIMITS } from '../src/store/proFeatures';
import { useThemeColors } from '../src/store/theme';
import { translations } from '../src/store/translations';
import { useStore } from '../src/store/useStore';

export default function PaywallScreen() {
  const router = useRouter();
  const { user, upgradeToPro, cancelPro, language } = useStore();
  const c = useThemeColors();
  const t = translations[language].pro;
  const isTR = language === 'tr';
  const isPro = user?.isPro;

  const [plan, setPlan] = useState<'monthly' | 'yearly'>('monthly');
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  const comparison = FEATURE_COMPARISON[language];

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 50, friction: 10, useNativeDriver: true }),
    ]).start();
  }, []);

  const handlePurchase = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    upgradeToPro();
    Alert.alert(
      '🎉',
      isTR ? 'Pro üyeliğiniz aktif edildi!' : 'Pro membership activated!',
      [{ text: 'OK', onPress: () => router.back() }]
    );
  };

  const handleCancel = () => {
    Alert.alert(t.cancelSubscription, t.cancelDesc, [
      { text: isTR ? 'İptal' : 'Cancel', style: 'cancel' },
      {
        text: isTR ? 'Aboneliği İptal Et' : 'Cancel Subscription',
        style: 'destructive',
        onPress: () => {
          cancelPro();
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          router.back();
        },
      },
    ]);
  };

  const monthlyPrice = isTR ? '₺149.99' : '$4.99';
  const yearlyPrice = isTR ? '₺1,499.99' : '$49.99';
  const yearlySaving = isTR ? '%16 tasarruf' : 'Save 16%';

  if (isPro) {
    return (
      <View style={[s.container, { backgroundColor: c.base }]}>
        <StatusBar barStyle={c.statusBarStyle} />
        <View style={s.headerRow}>
          <TouchableOpacity onPress={() => router.back()} style={[s.closeBtn, { backgroundColor: c.card, borderColor: c.cardBorder }]}>
            <X size={20} color={c.offWhite} />
          </TouchableOpacity>
        </View>
        <ScrollView contentContainerStyle={s.proActiveContent} showsVerticalScrollIndicator={false}>
          <View style={[s.proActiveCard, { backgroundColor: c.emerald + '10', borderColor: c.emerald + '25' }]}>
            <View style={[s.proBadgeL, { backgroundColor: c.emerald + '20' }]}>
              <Crown size={32} color={c.emerald} />
            </View>
            <Text style={[s.proActiveTitle, { color: c.emerald }]}>
              {isTR ? 'Pro Üye' : 'Pro Member'}
            </Text>
            <Text style={[s.proActiveSub, { color: c.subtle }]}>
              {isTR ? 'Tüm özellikler aktif. Sınırsız erişiminin tadını çıkar!' : 'All features unlocked. Enjoy unlimited access!'}
            </Text>
          </View>

          <View style={[s.featureListCard, { backgroundColor: c.card, borderColor: c.cardBorder }]}>
            <Text style={[s.featureListTitle, { color: c.offWhite }]}>
              {isTR ? 'Aktif Özellikler' : 'Active Features'}
            </Text>
            {comparison.pro.features.map((f, i) => (
              <View key={i} style={[s.featureRow, i > 0 && { borderTopWidth: 1, borderTopColor: c.cardBorder + '50' }]}>
                <View style={[s.featureCheck, { backgroundColor: c.emerald + '15' }]}>
                  <Check size={12} color={c.emerald} strokeWidth={3} />
                </View>
                <Text style={[s.featureText, { color: c.offWhite }]}>{f.text}</Text>
              </View>
            ))}
          </View>

          <TouchableOpacity
            style={[s.cancelBtn, { backgroundColor: c.red + '10', borderColor: c.red + '20' }]}
            onPress={handleCancel}
            activeOpacity={0.8}
          >
            <Text style={[s.cancelBtnText, { color: c.red }]}>
              {t.cancelSubscription}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={[s.container, { backgroundColor: c.base }]}>
      <StatusBar barStyle={c.statusBarStyle} />

      <Animated.View style={{ flex: 1, opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
        {/* Header */}
        <View style={s.headerRow}>
          <TouchableOpacity onPress={() => router.back()} style={[s.closeBtn, { backgroundColor: c.card, borderColor: c.cardBorder }]}>
            <X size={20} color={c.offWhite} />
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
          {/* Hero */}
          <View style={s.hero}>
            <View style={[s.heroIcon, { backgroundColor: c.emerald + '15' }]}>
              <Sparkles size={32} color={c.emerald} />
            </View>
            <Text style={[s.heroTitle, { color: c.offWhite }]}>
              {isTR ? 'LifeOS Pro' : 'LifeOS Pro'}
            </Text>
            <Text style={[s.heroSub, { color: c.subtle }]}>
              {isTR ? 'Hayatının kontrolünü tamamen ele al' : 'Take full control of your life'}
            </Text>
          </View>

          {/* ── COMPARISON TABLE ── */}
          <View style={s.compSection}>
            <View style={s.compHeader}>
              <View style={{ flex: 1 }} />
              <View style={s.compColHeader}>
                <Text style={[s.compColTitle, { color: c.subtle }]}>{comparison.free.title}</Text>
              </View>
              <View style={[s.compColHeader, s.compColPro, { backgroundColor: c.emerald + '10', borderColor: c.emerald + '30' }]}>
                <Crown size={12} color={c.emerald} />
                <Text style={[s.compColTitle, { color: c.emerald }]}>{comparison.pro.title}</Text>
              </View>
            </View>

            {comparison.free.features.map((freeFeature, i) => {
              const proFeature = comparison.pro.features[i];
              return (
                <View key={i} style={[s.compRow, { backgroundColor: i % 2 === 0 ? c.card : c.sectionBg, borderColor: c.cardBorder }]}>
                  <Text style={[s.compFeatureText, { color: c.offWhite }]} numberOfLines={1}>{freeFeature.text}</Text>
                  <View style={s.compCheck}>
                    {freeFeature.included ? (
                      <View style={[s.checkCircle, { backgroundColor: c.emerald + '20' }]}>
                        <Check size={10} color={c.emerald} strokeWidth={3} />
                      </View>
                    ) : (
                      <View style={[s.xCircle, { backgroundColor: c.red + '15' }]}>
                        <X size={10} color={c.red} strokeWidth={3} />
                      </View>
                    )}
                  </View>
                  <View style={[s.compCheck, { backgroundColor: c.emerald + '05' }]}>
                    {proFeature.included ? (
                      <View style={[s.checkCircle, { backgroundColor: c.emerald + '20' }]}>
                        <Check size={10} color={c.emerald} strokeWidth={3} />
                      </View>
                    ) : (
                      <View style={[s.xCircle, { backgroundColor: c.red + '15' }]}>
                        <X size={10} color={c.red} strokeWidth={3} />
                      </View>
                    )}
                  </View>
                </View>
              );
            })}
          </View>

          {/* ── KEY BENEFITS ── */}
          <View style={s.benefitsSection}>
            <Text style={[s.sectionLabel, { color: c.subtle }]}>
              {isTR ? 'PRO AVANTAJLARI' : 'PRO BENEFITS'}
            </Text>
            <View style={s.benefitsGrid}>
              {[
                { icon: <Zap size={20} color={c.emerald} />, title: isTR ? 'Sınırsız Takip' : 'Unlimited Tracking', sub: isTR ? 'Abonelik ve sorumluluk limiti yok' : 'No subscription or task limits' },
                { icon: <Sparkles size={20} color={c.blue} />, title: isTR ? 'AI Önerileri' : 'AI Insights', sub: isTR ? 'Kişisel finansal asistan' : 'Personal financial assistant' },
                { icon: <Shield size={20} color={c.purple} />, title: isTR ? 'Bütçe Takibi' : 'Budget Tracking', sub: isTR ? 'Harcamalarını kontrol et' : 'Monitor your spending' },
              ].map((b, i) => (
                <View key={i} style={[s.benefitCard, { backgroundColor: c.card, borderColor: c.cardBorder }]}>
                  <View style={[s.benefitIcon, { backgroundColor: c.sectionBg }]}>
                    {b.icon}
                  </View>
                  <Text style={[s.benefitTitle, { color: c.offWhite }]}>{b.title}</Text>
                  <Text style={[s.benefitSub, { color: c.subtle }]}>{b.sub}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* ── PRICING ── */}
          <View style={s.pricingSection}>
            <Text style={[s.sectionLabel, { color: c.subtle }]}>
              {isTR ? 'PLAN SEÇ' : 'CHOOSE YOUR PLAN'}
            </Text>

            {/* Monthly */}
            <TouchableOpacity
              style={[s.planCard, {
                backgroundColor: c.card,
                borderColor: plan === 'monthly' ? c.emerald : c.cardBorder,
                borderWidth: plan === 'monthly' ? 2 : 1,
              }]}
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setPlan('monthly'); }}
              activeOpacity={0.8}
            >
              <View style={[s.planRadio, { borderColor: plan === 'monthly' ? c.emerald : c.cardBorder }]}>
                {plan === 'monthly' && <View style={[s.planRadioInner, { backgroundColor: c.emerald }]} />}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[s.planTitle, { color: c.offWhite }]}>
                  {isTR ? 'Aylık' : 'Monthly'}
                </Text>
                <Text style={[s.planDesc, { color: c.subtle }]}>
                  {isTR ? 'Her ay yenilenir' : 'Renews every month'}
                </Text>
              </View>
              <Text style={[s.planPrice, { color: c.offWhite }]}>{monthlyPrice}</Text>
              <Text style={[s.planPeriod, { color: c.subtle }]}>/{isTR ? 'ay' : 'mo'}</Text>
            </TouchableOpacity>

            {/* Yearly */}
            <TouchableOpacity
              style={[s.planCard, {
                backgroundColor: c.card,
                borderColor: plan === 'yearly' ? c.emerald : c.cardBorder,
                borderWidth: plan === 'yearly' ? 2 : 1,
              }]}
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setPlan('yearly'); }}
              activeOpacity={0.8}
            >
              <View style={[s.planRadio, { borderColor: plan === 'yearly' ? c.emerald : c.cardBorder }]}>
                {plan === 'yearly' && <View style={[s.planRadioInner, { backgroundColor: c.emerald }]} />}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[s.planTitle, { color: c.offWhite }]}>
                  {isTR ? 'Yıllık' : 'Yearly'}
                </Text>
                <Text style={[s.planDesc, { color: c.subtle }]}>
                  {isTR ? 'Her yıl yenilenir' : 'Renews every year'}
                </Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={[s.planPrice, { color: c.offWhite }]}>{yearlyPrice}</Text>
                <View style={[s.saveBadge, { backgroundColor: c.emerald + '18' }]}>
                  <Text style={[s.saveText, { color: c.emerald }]}>{yearlySaving}</Text>
                </View>
              </View>
            </TouchableOpacity>
          </View>

          {/* ── CTA ── */}
          <View style={s.ctaSection}>
            <TouchableOpacity
              style={[s.ctaBtn, { backgroundColor: c.emerald }]}
              onPress={handlePurchase}
              activeOpacity={0.85}
            >
              <Crown size={18} color="#0F1419" />
              <Text style={s.ctaBtnText}>
                {isTR ? 'Pro\'ya Geç' : 'Upgrade to Pro'}
              </Text>
            </TouchableOpacity>
            <Text style={[s.ctaNote, { color: c.dim }]}>
              {isTR
                ? 'İstediğin zaman iptal edebilirsin. Gizli ücret yok.'
                : 'Cancel anytime. No hidden fees.'}
            </Text>
          </View>

          {/* Free plan note */}
          <View style={[s.freeNote, { backgroundColor: c.card, borderColor: c.cardBorder }]}>
            <Text style={[s.freeNoteTitle, { color: c.offWhite }]}>
              {isTR ? '🆓 Ücretsiz olarak devam et' : '🆓 Continue for free'}
            </Text>
            <Text style={[s.freeNoteDesc, { color: c.subtle }]}>
              {isTR
                ? `${FREE_LIMITS.maxSubscriptions} abonelik ve ${FREE_LIMITS.maxResponsibilities} sorumluluk takip edebilirsin.`
                : `Track up to ${FREE_LIMITS.maxSubscriptions} subscriptions and ${FREE_LIMITS.maxResponsibilities} responsibilities.`}
            </Text>
          </View>
        </ScrollView>
      </Animated.View>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, paddingTop: Platform.OS === 'ios' ? 60 : 44 },
  headerRow: { flexDirection: 'row', justifyContent: 'flex-end', paddingHorizontal: 20, marginBottom: 8 },
  closeBtn: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', borderWidth: 1 },

  /* Hero */
  hero: { alignItems: 'center', paddingHorizontal: 20, marginBottom: 28 },
  heroIcon: { width: 72, height: 72, borderRadius: 36, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  heroTitle: { fontSize: 28, fontWeight: '800', letterSpacing: -0.5, marginBottom: 6 },
  heroSub: { fontSize: 15, fontWeight: '500', textAlign: 'center' },

  /* Comparison */
  compSection: { marginHorizontal: 20, marginBottom: 28, borderRadius: 16, overflow: 'hidden' },
  compHeader: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 12 },
  compColHeader: { width: 60, alignItems: 'center', paddingVertical: 6, borderRadius: 8 },
  compColPro: { borderWidth: 1, flexDirection: 'row', gap: 4, width: 74, justifyContent: 'center' },
  compColTitle: { fontSize: 11, fontWeight: '700' },
  compRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 12, borderBottomWidth: 0.5 },
  compFeatureText: { flex: 1, fontSize: 12, fontWeight: '500' },
  compCheck: { width: 60, alignItems: 'center' },
  checkCircle: { width: 22, height: 22, borderRadius: 11, justifyContent: 'center', alignItems: 'center' },
  xCircle: { width: 22, height: 22, borderRadius: 11, justifyContent: 'center', alignItems: 'center' },

  /* Benefits */
  benefitsSection: { paddingHorizontal: 20, marginBottom: 28 },
  sectionLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 1.2, marginBottom: 12, marginLeft: 4 },
  benefitsGrid: { gap: 10 },
  benefitCard: { flexDirection: 'row', alignItems: 'center', borderRadius: 14, padding: 16, borderWidth: 1, gap: 14 },
  benefitIcon: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  benefitTitle: { fontSize: 14, fontWeight: '700', flex: 1 },
  benefitSub: { fontSize: 11, fontWeight: '500', width: 120, textAlign: 'right' },

  /* Pricing */
  pricingSection: { paddingHorizontal: 20, marginBottom: 28 },
  planCard: { flexDirection: 'row', alignItems: 'center', borderRadius: 16, padding: 18, gap: 14, marginBottom: 10 },
  planRadio: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, justifyContent: 'center', alignItems: 'center' },
  planRadioInner: { width: 12, height: 12, borderRadius: 6 },
  planTitle: { fontSize: 16, fontWeight: '700' },
  planDesc: { fontSize: 12, fontWeight: '500', marginTop: 2 },
  planPrice: { fontSize: 20, fontWeight: '700', letterSpacing: -0.5 },
  planPeriod: { fontSize: 13, fontWeight: '600', marginLeft: 2 },
  saveBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10, marginTop: 4 },
  saveText: { fontSize: 10, fontWeight: '700' },

  /* CTA */
  ctaSection: { paddingHorizontal: 20, marginBottom: 20, alignItems: 'center' },
  ctaBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, width: '100%', paddingVertical: 18, borderRadius: 16 },
  ctaBtnText: { color: '#0F1419', fontSize: 17, fontWeight: '800' },
  ctaNote: { fontSize: 12, fontWeight: '500', marginTop: 10 },

  /* Free Note */
  freeNote: { marginHorizontal: 20, borderRadius: 14, padding: 18, borderWidth: 1, alignItems: 'center', marginBottom: 40 },
  freeNoteTitle: { fontSize: 14, fontWeight: '700', marginBottom: 4 },
  freeNoteDesc: { fontSize: 12, fontWeight: '500', textAlign: 'center' },

  /* Pro Active */
  proActiveContent: { paddingHorizontal: 20, paddingBottom: 60 },
  proActiveCard: { alignItems: 'center', borderRadius: 20, padding: 32, borderWidth: 1, marginBottom: 24 },
  proBadgeL: { width: 72, height: 72, borderRadius: 36, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  proActiveTitle: { fontSize: 24, fontWeight: '800', marginBottom: 8 },
  proActiveSub: { fontSize: 14, fontWeight: '500', textAlign: 'center' },
  featureListCard: { borderRadius: 16, borderWidth: 1, overflow: 'hidden', marginBottom: 24 },
  featureListTitle: { fontSize: 15, fontWeight: '700', padding: 16, paddingBottom: 0, marginBottom: 8 },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 12 },
  featureCheck: { width: 22, height: 22, borderRadius: 11, justifyContent: 'center', alignItems: 'center' },
  featureText: { fontSize: 14, fontWeight: '500' },
  cancelBtn: { borderRadius: 14, padding: 16, borderWidth: 1, alignItems: 'center' },
  cancelBtnText: { fontSize: 15, fontWeight: '700' },
});
