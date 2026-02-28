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
  const [packages, setPackages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  const comparison = FEATURE_COMPARISON[language as keyof typeof FEATURE_COMPARISON] || FEATURE_COMPARISON.en;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 50, friction: 10, useNativeDriver: true }),
    ]).start();
    const loadOfferings = async () => {
      try {
        const { PurchaseService } = await import('../src/services/purchaseService');
        const pkgs = await PurchaseService.getPackages();
        setPackages(pkgs);
      } catch (e) {
        console.log('RevenueCat not available, using mock mode');
      } finally {
        setLoading(false);
      }
    };
    loadOfferings();
  }, []);

  const handlePurchase = async () => {
    
    if (!packages || packages.length === 0) {
      Alert.alert(
        isTR ? 'Bilgi' : 'Info',
        isTR
          ? 'Uygulama içi satın alma sadece Google Play Store üzerinden yüklenmiş uygulamada çalışır. Lütfen uygulamayı Play Store\'dan indirin.'
          : 'In-app purchases only work in the app installed from Google Play Store. Please download the app from Play Store.',
      );
      return;
    }

    const selectedPkg = packages.find(p =>
      plan === 'monthly' ? p.packageType === 'MONTHLY' : p.packageType === 'ANNUAL'
    );

    if (!selectedPkg) {
      Alert.alert(
        isTR ? 'Hata' : 'Error',
        isTR ? 'Seçilen plan bulunamadı. Lütfen tekrar deneyin.' : 'Selected plan not found. Please try again.',
      );
      return;
    }

    try {
      setLoading(true);

      const success = await upgradeToPro(selectedPkg);

      if (success) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Alert.alert(
          '🎉',
          isTR ? 'Pro üyeliğiniz aktif edildi!' : 'Pro membership activated!',
          [{ text: 'OK', onPress: () => router.back() }]
        );
      }
      
    } catch (e) {
      console.error('[Luxtra] Purchase error in paywall:', e);
      Alert.alert(
        isTR ? 'Hata' : 'Error',
        isTR ? 'Satın alma işlemi sırasında bir hata oluştu. Lütfen tekrar deneyin.' : 'An error occurred during purchase. Please try again.',
      );
    } finally {
      setLoading(false);
    }
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

  const handleRestore = async () => {
    try {
      setLoading(true);
      const { restorePurchases: storeRestore } = useStore.getState();
      const success = await storeRestore();
      if (success) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Alert.alert(isTR ? 'Başarılı' : 'Success', isTR ? 'Satın alımlar geri yüklendi! Pro aktif.' : 'Purchases restored! Pro activated.');
        router.back();
      } else {
        Alert.alert(isTR ? 'Bilgi' : 'Info', isTR ? 'Aktif bir abonelik bulunamadı.' : 'No active subscription found.');
      }
    } catch (e) {
      console.error('[Luxtra] Restore error:', e);
      Alert.alert(isTR ? 'Hata' : 'Error', isTR ? 'Geri yükleme başarısız oldu.' : 'Restore failed.');
    } finally {
      setLoading(false);
    }
  };

  const monthlyPkg = (packages || []).find(p => p.packageType === 'MONTHLY');
  const yearlyPkg = (packages || []).find(p => p.packageType === 'ANNUAL');

  const monthlyPrice = monthlyPkg?.product.priceString || (isTR ? '₺49.99' : '$4.99');
  const yearlyPrice = yearlyPkg?.product.priceString || (isTR ? '₺349.99' : '$39.99');
  const yearlySaving = isTR ? '%42 tasarruf' : 'Save 42%';

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
        {}
        <View style={s.headerRow}>
          <TouchableOpacity onPress={() => router.back()} style={[s.closeBtn, { backgroundColor: c.card, borderColor: c.cardBorder }]}>
            <X size={20} color={c.offWhite} />
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
          {}
          <View style={s.hero}>
            <View style={[s.heroIcon, { backgroundColor: c.emerald + '15' }]}>
              <Sparkles size={32} color={c.emerald} />
            </View>
            <Text style={[s.heroTitle, { color: c.offWhite }]}>
              {isTR ? 'Luxtra Pro' : 'Luxtra Pro'}
            </Text>
            <Text style={[s.heroSub, { color: c.subtle }]}>
              {isTR ? 'Hayatının kontrolünü tamamen ele al' : 'Take full control of your life'}
            </Text>
          </View>

          {}
          <View style={[s.fomoBanner, { backgroundColor: c.amber + '15', borderColor: c.amber + '30' }]}>
            <Text style={[s.fomoText, { color: c.amber }]}>
              {[
                isTR ? '\ud83d\udd25 S\u0131n\u0131rl\u0131 S\u00fcre: \u0130lk 1000 kullan\u0131c\u0131ya \u00f6zel indirim!' : '\ud83d\udd25 Limited Time: Special discount for the first 1000 users!',
                isTR ? '\u26a1 Bug\u00fcn abone olan 47 ki\u015fi tasarruf etmeye ba\u015flad\u0131!' : '\u26a1 47 people started saving today!',
                isTR ? '\ud83d\udcb0 Pro kullan\u0131c\u0131lar ortalama ayda \u20ba650 tasarruf ediyor' : '\ud83d\udcb0 Pro users save an average of $45/month',
                isTR ? '\ud83c\udf1f 7 g\u00fcn \u00fccretsiz dene, risk yok!' : '\ud83c\udf1f 7 days free trial, no risk!',
              ][Math.floor(Date.now() / 60000) % 4]}
            </Text>
          </View>

          {}
          <View style={[s.testimonialCard, { backgroundColor: c.card, borderColor: c.cardBorder }]}>
            {(() => {
              const testimonials = isTR ? [
                { text: '"Pro\'ya ge\u00e7tikten sonra gereksiz abonelikleri iptal ederek ayda \u20ba800 tasarruf ettim. Kesinlikle harika!"', author: '\u2014 Ahmet Y., \u0130stanbul' },
                { text: '"T\u00fcm aboneliklerimi tek yerden takip ediyorum. Art\u0131k hi\u00e7bir \u00f6demeyi ka\u00e7\u0131rm\u0131yorum!"', author: '\u2014 Elif K., Ankara' },
                { text: '"AI analizleri sayesinde hangi aboneliklerimin gereksiz oldu\u011funu g\u00f6rd\u00fcm."', author: '\u2014 Mert S., \u0130zmir' },
              ] : [
                { text: '"I saved $50/mo by tracking my unused subs. Totally worth it!"', author: '\u2014 Sarah J., NY' },
                { text: '"The AI insights helped me cut 3 subscriptions I forgot about!"', author: '\u2014 Mike R., LA' },
                { text: '"Best finance app I\'ve used. Clean, simple, powerful."', author: '\u2014 Emily T., London' },
              ];
              const t_ = testimonials[Math.floor(Date.now() / 120000) % testimonials.length];
              return (
                <>
                  <Text style={[s.testimonialText, { color: c.offWhite }]}>{t_.text}</Text>
                  <Text style={[s.testimonialAuthor, { color: c.subtle }]}>{t_.author}</Text>
                </>
              );
            })()}
          </View>

          {}
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
                    {proFeature && proFeature.included ? (
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

          {}
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

          {}
          <View style={s.pricingSection}>
            <Text style={[s.sectionLabel, { color: c.subtle }]}>
              {isTR ? 'PLAN SEÇ' : 'CHOOSE YOUR PLAN'}
            </Text>

            {}
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

            {}
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

          {}
          <View style={s.ctaSection}>
            <TouchableOpacity
              style={[s.ctaBtn, { backgroundColor: c.emerald, opacity: loading ? 0.7 : 1 }]}
              onPress={handlePurchase}
              activeOpacity={0.85}
              disabled={loading}
            >
              {loading ? (
                <Text style={s.ctaBtnText}>...</Text>
              ) : (
                <>
                  <Crown size={18} color="#0F1419" />
                  <Text style={s.ctaBtnText}>
                    {isTR ? '7 Gün Ücretsiz Dene' : 'Start 7-Day Free Trial'}
                  </Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={{ marginTop: 16 }}
              onPress={handleRestore}
              disabled={loading}
            >
              <Text style={{ color: c.subtle, fontSize: 13, fontWeight: '600', textDecorationLine: 'underline' }}>
                {isTR ? 'Satın Alımları Geri Yükle' : 'Restore Purchases'}
              </Text>
            </TouchableOpacity>

            <Text style={[s.ctaNote, { color: c.dim }]}>
              {isTR
                ? 'İstediğin zaman iptal edebilirsin. Gizli ücret yok.'
                : 'Cancel anytime. No hidden fees.'}
            </Text>
          </View>

          {}
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
  hero: { alignItems: 'center', paddingHorizontal: 20, marginBottom: 20 },
  heroIcon: { width: 72, height: 72, borderRadius: 36, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  heroTitle: { fontSize: 28, fontWeight: '800', letterSpacing: -0.5, marginBottom: 6 },
  heroSub: { fontSize: 15, fontWeight: '500', textAlign: 'center' },
  fomoBanner: { marginHorizontal: 20, padding: 12, borderRadius: 12, borderWidth: 1, alignItems: 'center', marginBottom: 16 },
  fomoText: { fontSize: 13, fontWeight: '700' },
  testimonialCard: { marginHorizontal: 20, padding: 16, borderRadius: 14, borderWidth: 1, marginBottom: 28 },
  testimonialText: { fontSize: 14, fontStyle: 'italic', fontWeight: '500', marginBottom: 8, lineHeight: 20 },
  testimonialAuthor: { fontSize: 12, fontWeight: '600', textAlign: 'right' },
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
  benefitsSection: { paddingHorizontal: 20, marginBottom: 28 },
  sectionLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 1.2, marginBottom: 12, marginLeft: 4 },
  benefitsGrid: { gap: 10 },
  benefitCard: { flexDirection: 'row', alignItems: 'center', borderRadius: 14, padding: 16, borderWidth: 1, gap: 14 },
  benefitIcon: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  benefitTitle: { fontSize: 14, fontWeight: '700', flex: 1 },
  benefitSub: { fontSize: 11, fontWeight: '500', width: 120, textAlign: 'right' },
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
  ctaSection: { paddingHorizontal: 20, marginBottom: 20, alignItems: 'center' },
  ctaBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, width: '100%', paddingVertical: 18, borderRadius: 16 },
  ctaBtnText: { color: '#0F1419', fontSize: 17, fontWeight: '800' },
  ctaNote: { fontSize: 12, fontWeight: '500', marginTop: 10 },
  freeNote: { marginHorizontal: 20, borderRadius: 14, padding: 18, borderWidth: 1, alignItems: 'center', marginBottom: 40 },
  freeNoteTitle: { fontSize: 14, fontWeight: '700', marginBottom: 4 },
  freeNoteDesc: { fontSize: 12, fontWeight: '500', textAlign: 'center' },
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
