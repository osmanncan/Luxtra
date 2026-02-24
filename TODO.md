# LifeOS Proje Notları & Yapılacaklar Listesi

## 📅 Planlanan Özellikler (v1.2 & v2.0) - Öncelikli

### Yeni Özellikler
- [x] **Widget Desteği (Android):**
  - Ana ekranda yaklaşan ödemeleri ve sorumlulukları görmek için minimalist Android widget'ı hazır. (iOS desteği v2.0'a ertelendi).

- [x] **Biyometrik Güvenlik (FaceID / TouchID):**
  - Finansal veriler (abonelikler, harcamalar) özeldir. Uygulamayı açarken yüz tanıma sorması güven verir.
- [x] **Kategori Özelleştirme:**
  - Kullanıcılar kendi ikonlarını ve renklerini seçmek isteyebilir. "Spor", "Eğitim" gibi standart kategoriler dışında kişisel kategoriler oluşturabilmeli.
- [x] **Gelişmiş Bildirim Ayarları:**
  - Sadece "1 gün önce" değil; "3 gün önce", "Sabah 09:00'da hatırlat" gibi esnek seçenekler.
- [ ] **Veri Yedekleme (Backup & Restore):**
  - Telefon değişirse veriler gitmesin. iCloud veya basit bir JSON dışa/içe aktarma özelliği eklenebilir.
### UI/UX İyileştirmeleri
- [ ] Ai önerilerini çeşitlendir (her seferinde aynı şeyleri söylemesin)
- [ ] Zaman çizelgesindeki arama kutusunu daha belirgin yap
- [ ] Ok tuşlarını daha büyük ve belirgin yap (çok ince kalmışlar)
- [ ] Zaman çizelgesindeki ödeme öğesine tıklayınca arkadaki "sil" yazısının görünmesini engelle
- [ ] Özellik eklemede hatırlatma için "gün/ay" seçeneklerine ek olarak "özel tarih" seçeneği ekle
- [ ] Zaman çizelgesi sayfasındaki metinleri daha belirgin/okunabilir yap
- [ ] Ayarlar sayfasına "Güvenlik ve Uyarı" bölümü ekle

## ✅ Tamamlanan Özellikler (v1.0 & v1.1)

### Temel Özellikler
- [x] Abonelik Takibi (Ekleme/Silme/Düzenleme)
- [x] Sorumluluk Takibi (Hayat görevleri)
- [x] Zaman Çizelgesi (Timeline)
- [x] Hatırlatma Bildirimleri (1 gün önce)

### Premium & Monetization
- [x] Pro Üyelik Sistemi (Aylık/Yıllık)
- [x] Paywall ekranı (3 özellik, sadeleştirilmiş)
- [x] Yapay Zeka Önerileri (Gemini AI + Lokal fallback)
- [x] Limit Kontrolleri (Free: 3 abonelik / 5 sorumluluk)

### UX & Tasarım
- [x] Tema Dark/Light
- [x] TR/İngilizce Çeviri (Tüm ekranlar + Onboarding)
- [x] Profil Düzenleme
- [x] Kayıt Ekranı
- [x] Animasyonlu Tab Bar (Spring animasyonlar)
- [x] Sola Kaydırarak Silme (SwipeableRow)
- [x] Ödendi İşareti (Abonelik tik toggle)
- [x] Haptic Feedback (Dokunma titreşimi)

### Yeni Eklenen Özellikler (v1.1)
- [x] AsyncStorage ile veri kalıcılığı (Uygulama kapansa da veriler kaybolmaz)
- [x] Para birimi seçimi (₺/$/€/£)
- [x] Arama/Filtreleme (Spending & Timeline ekranlarında)
- [x] Bütçe limiti belirleme (Settings'den ayarla, progress bar ile takip)
- [x] Kategori Özelleştirme (Emoji ve renk seçimi ile yeni kategoriler ekleme)
- [x] Tekrarlayan sorumluluklar (3/6/12 ay tekrar seçeneği)
- [x] Onboarding çevirisi (TR/EN)

### Kaldırılan / Sadeleştirilen Özellikler
- [x] Google ile Giriş butonu kaldırıldı (çalışmıyordu)
- [x] Life Score kaldırıldı (sakin uygulama felsefesiyle uyuşmuyordu)
- [x] Daily Focus kaldırıldı (to-do list değil, hayat yönetim asistanı)
- [x] Paywall sadeleştirildi (5 → 3 özellik)
- [x] AI insights sadeleştirildi (dailyFocus referansları kaldırıldı)

## 🛠️ Teknik Borçlar & Fixler
- [ ] Gemini API key'ini gerçek key ile değiştir
- [ ] RevenueCat entegrasyonu (gerçek ödeme altyapısı)
- [ ] Genel hata düzeltmeleri ve optimizasyon

## ☁️ Backend & Bulut Entegrasyonu
- [ ] **Kimlik Doğrulama (Auth):** Kullanıcıların verilerine her cihazdan erişebilmesi için Google, Apple veya E-posta ile giriş sistemi.
- [ ] **Bulut Veritabanı:** Verilerin telefon yerine güvenli bir veritabanında (Supabase veya Firebase Firestore) saklanması.
- [ ] **Veri Senkronizasyonu:** Uygulama açıldığında yerel veriler ile bulut verilerinin çakışmadan eşitlenmesi (Sync logic).
- [ ] **Sunucu Taraflı Bildirimler:** Bildirimlerin cihaz yerine sunucu (FCM) üzerinden gönderilmesi (Cihaz kapalı olsa bile daha güvenilir çalışır).
- [ ] **Premium Doğrulama:** RevenueCat webhook'ları ile kullanıcı abonelik durumunun sunucu tarafında kontrol edilmesi.
- [ ] **API Katmanı:** AI sorguları ve hassas işlemler için güvenli bir API (Node.js veya Edge Functions) kullanımı.

##  Çıkartılabilecek / Sadeleştirilebilecekler
- **Spending Ekranındaki Grafikler:** Eğer uygulama boyutunu veya karmaşıklığını artırıyorsa, buradaki detaylı grafikler (bar chart) sadeleştirilebilir. Sadece toplam tutar ve kalan bütçe yeterli olabilir mi? (Bence kalmalı, ama bir seçenek).
- **Onboarding:** 3 sayfa yerine 2 sayfaya indirilebilir. Kullanıcıyı daha hızlı içeri almak için.

---
*Not: Bu liste proje ilerledikçe güncellenmektedir.*



Fikir
Neler Eksik Olabilir? (Potansiyel Fırsatlar)
Veri Kalıcılığı ve Senkronizasyon:

Uygulama (sorumluluklar, abonelikler, harcamalar) çok fazla veri üretecek gibi duruyor. Bu veriler şu an sadece cihazda mı tutuluyor? Eğer öyleyse, kullanıcı telefonunu değiştirdiğinde veya sildiğinde tüm verilerini kaybeder.
Fikir: Cihaz üzerinde daha güçlü bir veritabanı için WatermelonDB veya Expo SQLite entegrasyonu düşünülebilir. Verileri bulutta senkronize etmek ve çoklu cihaz desteği sunmak için Firebase (Firestore) veya Supabase gibi bir backend-as-a-service (BaaS) entegrasyonu projenin değerini katlayacaktır.
Bildirimler (Notifications):

add-responsibility ve add-subscription gibi özellikler var. Aboneliklerin son ödeme tarihi veya sorumlulukların bitiş tarihi için yerel bildirimler (local notifications) göndermek, kullanıcı etkileşimi ve sadakati için kritik öneme sahip.
Fikir: expo-notifications kütüphanesini kullanarak "Abonelik ödemen yarın" veya "Bu görevi tamamlama zamanı" gibi hatırlatıcılar kurabilirsiniz.
Kapsamlı Test Yapısı:

Sadece bir tane test dosyası (StyledText-test.js) görüyorum. Proje büyüdükçe ve aiService gibi karmaşık mantıklar eklendikçe, hataları ayıklamak zorlaşacaktır.
Fikir: Jest ve React Native Testing Library kullanarak component'larınız için birim (unit) ve entegrasyon testleri yazmaya başlayabilirsiniz. Özellikle store içindeki state mantıkları ve services içindeki fonksiyonlar test yazmak için ideal adaylar.
Uluslararasılaştırma (i18n):

src/store/translations.ts dosyasını gördüm, bu harika bir başlangıç! Bu yapının uygulamanın tamamına yayıldığından emin olmak, ileride farklı dillere destek vermeyi çok kolaylaştırır. Belki de bu zaten planlarınız arasındadır.
Neler Gereksiz veya Geliştirilebilir? (Yapısal Öneriler)
Dosya ve Klasör Yapısındaki Tutarsızlıklar:

Kök dizinde bir biometrics.ts dosyası varken, src/utils/biometrics.ts adında bir dosya daha var gibi görünüyor (veya biri diğerinin kopyası olabilir). Bu tür tekrarlar kafa karıştırıcı olabilir.
Fikir: Tüm yardımcı (utility) fonksiyonları src/utils altında toplayarak kodu merkezileştirebilirsiniz. biometrics.ts dosyasını src/utils/ altına taşımak daha düzenli bir yapı sağlar.
Kök dizinde bir components klasörü varken, src/components klasörü de var. Genellikle tüm uygulama kaynak kodu (src içinde) tek bir yerde toplanır.
Fikir: Kök dizindeki components klasöründeki bileşenleri (muhtemelen Expo'nun varsayılan bileşenleri) src/components/core veya src/components/ui gibi bir alt klasöre taşıyarak tüm bileşenleri src altında birleştirebilirsiniz.
State Management (Durum Yönetimi):

src/store/useStore.ts dosyası, muhtemelen Zustand kullandığınıza işaret ediyor. Bu, modern ve harika bir seçim. Ancak theme.ts, proFeatures.ts gibi ayrı state dosyaları var.
Fikir: Tüm state'leri tek bir büyük "store" içinde birleştirmek yerine, özellik bazlı ayrı "slice"lar (dilimler) oluşturmak (Zustand ile bu çok kolay) yönetimi kolaylaştırabilir. Örneğin, createAuthSlice, createSubscriptionSlice gibi. Bu zaten yaptığınız bir şey olabilir, sadece bir düşünce.
Web Desteği Karmaşıklığı:

useColorScheme.web.ts ve useClientOnlyValue.web.ts gibi dosyalar, web platformu için özel mantıklar yazdığınızı gösteriyor.
Değerlendirme: Eğer web desteği projenin ana hedeflerinden biri değilse, bu dosyalar şimdilik gereksiz bir karmaşıklık katıyor olabilir. Eğer web desteği önemliyse, bu yapı doğrudur ancak her özellik eklediğinizde hem mobil hem web uyumluluğunu düşünmeniz gerektiğini unutmamanız gerekir.
Özetle
Güçlü Yönleriniz:

Modern Teknoloji: TypeScript, NativeWind, Expo Router kullanımı harika.
İlgi Çekici Özellikler: ai-insights, BiometricAuth gibi özellikler uygulamayı rakiplerinden ayırabilir.
İyi Yapılandırılmış Rota: app/(tabs) yapısı, Expo Router'ı etkin kullandığınızı gösteriyor.
--------

Eksik / Geliştirilebilir Şeyler
1. Login/Register sahte (en kritik sorun)
Login ekranın var ama gerçek bir authentication yok. login('Osmancan', email) diye hardcoded isim yazıyorsun. Şifre bile kontrol edilmiyor — sadece boş mu diye bakılıyor. Bu ekranlar ya kaldırılmalı ya da gerçek bir auth (Firebase Auth, Supabase Auth) entegre edilmeli. Şu haliyle kullanıcıyı yanıltıyor.

2. Veri sadece cihazda (AsyncStorage)
Telefon değişince, uygulama silinince herşey gider. "LifeOS" gibi iddialı bir isim için bu büyük bir eksik. En azından JSON export/import özelliği olmalı.

3. Pro üyelik gerçek değil
upgradeToPro() sadece isPro: true yapıyor. RevenueCat veya benzeri bir ödeme altyapısı yok. Kullanıcı gerçekten ödeme yapamıyor. Bu haliyle Pro gate'ler sadece kısıtlama gibi hissettiriyor, değer katmıyor.

4. Gemini API key dummy
AIzaSyDummyKeyReplace — AI insights özelliği çalışmıyor. Lokal fallback var ama bu durumda "AI" demek biraz abartı.

/ 5. Analitik / İstatistik eksik
"Geçen aya göre %X daha fazla harcadın" veya "Son 3 ayda şu kategoride artış var" gibi trend analizi yok. Spending ekranı sadece anlık durumu gösteriyor.

/ 6. Abonelik düzenleme (edit) ekranı yok
updateSubscription fonksiyonu store'da var ama bunu kullanan bir edit ekranı göremiyorum (subscription/[id].tsx detay sayfası olabilir ama tam bir edit flow eksik gibi).

Gereksiz / Sadeleştirilebilir Şeyler
/ 1. Login + Register ekranları (şu an için)
Gerçek auth olmadan bu iki ekran gereksiz karmaşıklık. Uygulama direkt ana ekrandan başlayabilir, kullanıcı ayarlardan ismini girebilir. Auth ekle dediğinde zaten yeniden yazılacak.

/ 2. Onboarding biraz fazla
Kullanıcıyı hızlı içeri almak daha iyi. 3 sayfa yerine 1-2 sayfa veya ilk kullanımda inline tooltip'ler daha modern olur.

/ 3. Free limitleri çok agresif
3 abonelik + 5 sorumluluk çok az. Kullanıcı uygulamanın değerini anlamadan duvara çarpıyor. 5-7 abonelik + 10 sorumluluk daha makul olur. Kullanıcı bağlandıktan sonra Pro'ya geçer.

/ 4. Arama/Filtreleme'nin Pro'da olması
Arama gibi temel bir UX özelliğini Pro'nun arkasına koymak kullanıcıyı sinirlendirir, motive etmez. Bunu free yapıp AI insights ve unlimited tracking'i Pro olarak bırakabilirsin.

/ 5. components ve components ayrımı
İki ayrı components klasörün var. Birisi eski scaffold'dan kalma (EditScreenInfo, ExternalLink, Themed vs.). Bunlar kullanılmıyor gibi. Temizlenmeli.

 / 6. Widget desteği yarım
Sadece Android için bir PaymentWidget.tsx var. iOS yok. Ya her iki platform için tamamla ya da v1'den çıkar.


Kur çevirici canlı
Belki reklam/abonelik modelleri için bir hazırlık veya ana ekrandaki grafiklerin geliştirilmesi?
Yapay zeka için detay çalış[Grok apı var unutma]




Backend için ne yapmam gerekiyor?
