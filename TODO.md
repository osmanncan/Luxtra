# LifeOS Proje Notları & Yapılacaklar Listesi

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

## 🚀 Önerilen Yeni Özellikler (v1.2) - "Şimdi Ne Eklenmeli?"
Bu özellikler uygulamayı bir üst seviyeye (Premium Life Assistant) taşır:

- [ ] **Widget Desteği (iOS/Android):**
  - Ana ekranda yaklaşan ödemeleri ve sorumlulukları görmek hayat kurtarır. Uygulamaya girmeden bilgi almak premium bir deneyimdir.

- [ ] **Biyometrik Güvenlik (FaceID / TouchID):**
  - Finansal veriler (abonelikler, harcamalar) özeldir. Uygulamayı açarken yüz tanıma sorması güven verir.

- [ ] **Veri Yedekleme (Backup & Restore):**
  - Telefon değişirse veriler gitmesin. iCloud veya basit bir JSON dışa/içe aktarma özelliği eklenebilir.

- [ ] **Kategori Özelleştirme:**
  - Kullanıcılar kendi ikonlarını ve renklerini seçmek isteyebilir. "Spor", "Eğitim" gibi standart kategoriler dışında kişisel kategoriler oluşturabilmeli.

- [ ] **Gelişmiş Bildirim Ayarları:**
  - Sadece "1 gün önce" değil; "3 gün önce", "Sabah 09:00'da hatırlat" gibi esnek seçenekler.

## 📝 Çıkartılabilecek / Sadeleştirilebilecekler
- **Spending Ekranındaki Grafikler:** Eğer uygulama boyutunu veya karmaşıklığını artırıyorsa, buradaki detaylı grafikler (bar chart) sadeleştirilebilir. Sadece toplam tutar ve kalan bütçe yeterli olabilir mi? (Bence kalmalı, ama bir seçenek).
- **Onboarding:** 3 sayfa yerine 2 sayfaya indirilebilir. Kullanıcıyı daha hızlı içeri almak için.

---
*Not: Bu liste proje ilerledikçe güncellenmektedir.*



Backend için ne yapmam gerekiyor?
