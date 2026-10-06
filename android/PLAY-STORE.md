# Forma — Play Store release hazırlığı

Paket: `com.sapsoft.forma` · sürüm: `1.36.5` · versionCode: `43` · minimum API: `26` · hedef API: `36`.
Sürümün tek kaynağı `app/build.gradle`; derleme betiği dosya adlarını buradan okur. Her yeni Play yüklemesinde versionCode artırılır. `source-manifest.json` güncel kaynakların özetidir; eski APK raporları tarihsel kayıttır.

## 1. Upload anahtarını gir

Anahtarını veya parolalarını sohbete gönderme. Android Studio'da **android/** klasörünü aç; **Build → Generate Signed Bundle / APK → Android App Bundle** yolundan kendi keystore, alias ve parolalarını gir. `release` seç. Bu akışın imza bilgileri Gradle tarafından desteklenir.

Komut satırını tercih edersen `android/keystore.properties.example` dosyasını `android/keystore.properties` olarak kopyala ve dört alanı yerel olarak doldur. Windows yolunda `/` kullan. Gerçek dosya ve keystore Git dışında tutulur; keystore'u ayrıca güvenli bir yerde yedekle. Release debug anahtarını kullanmaz.

Alternatif ortam değişkenleri: `FORMA_STORE_FILE`, `FORMA_STORE_PASSWORD`, `FORMA_KEY_ALIAS`, `FORMA_KEY_PASSWORD`. Anahtar yoksa normal release komutu hata verir. `ReleaseUnsigned` yalnız doğrulama içindir.

## 2. AAB üret

Proje kökünden:

```powershell
powershell -ExecutionPolicy Bypass -File .\build-android.ps1 -Mode Release
```

Komut `bundleRelease` ve `lintRelease` çalıştırır, imza kaydını kontrol eder ve `build/forma-android-1.36.5-release.aab` oluşturur. Android Studio çıktısı `android/app/build/outputs/bundle/release/app-release.aab` konumundadır.

İmza kontrolü için JDK'nın `jarsigner` aracını kullanabilirsin:

```powershell
jarsigner -verify -verbose -certs .\build\forma-android-1.36.5-release.aab
```

Upload sertifikası kendinden imzalı olduğundan sertifika zinciri uyarısı çıkabilir; dosyanın imzası doğrulanmalı ve kullanılan sertifika senin upload anahtarınla eşleşmeli.

Yerel kontroller:

```powershell
powershell -ExecutionPolicy Bypass -File .\build-android.ps1 -Mode ReleaseUnsigned
node android/verify-math1.cjs
node android/verify-ui.cjs
```

Arayüz testi Playwright ve Chrome gerektirir; gerekirse `FORMA_PLAYWRIGHT` ile modül yolu verilir. SDK Manager'da Android 16 / API 36 kurulu olmalı; Gradle JDK 17 veya 21 ile çalışır.

## 3. Play Console akışı

1. Forma uygulamasını oluştur, varsayılan dili ve ücretsiz/ücretli seçimini belirle. İlk AAB paket kimliğini sabitler: `com.sapsoft.forma`.
2. Play App Signing'i etkinleştir. AAB senin upload anahtarınla imzalanır; kullanıcılara dağıtılan paketleri Google uygulama imzalama anahtarıyla imzalar.
3. Önce dahili test kanalına imzalı AAB yükle. Gerçek telefonda/tablette açılış, geri tuşu, çizim/S Pen, PNG kaydetme, oturum geri yükleme, büyük ekran ve çevrimdışı kullanımı kontrol et. Pre-launch report sonuçlarını incele.
4. Mağaza açıklaması, uygulama simgesi, ekran görüntüleri, tanıtım görseli ve destek e-postasını tamamla.
5. Uygulama içeriğinde veri güvenliği, reklamlar, hedef kitle, içerik derecelendirmesi ve uygulama erişimi formlarını doldur. Mevcut kaynaklarda hesap girişi, reklam/analitik SDK'sı veya ağ izni yok; notlar cihazda tutulur. Form yanıtları son yayımlanacak uygulamayı yansıtmalı.
6. Gizlilik politikasını kamuya açık bir web adresinde yayımla ve Play Console'a ekle. Uygulamada da politika metni veya bağlantısı bulunmalı. Bu hazırlık gizlilik politikasını yayımlamaz veya uygulama içine eklemez; bu adım mağaza yayını öncesinde tamamlanmalı. Metinde Forma, yayıncı, destek iletişimi, cihazdaki kayıtlar, silme ve kullanıcının seçtiği PNG dışa aktarımı açıklanmalı.
7. 13 Kasım 2023 sonrasında açılmış kişisel hesaplarda, üretim erişimi için en az 12 test kullanıcısının 14 gün kesintisiz katıldığı kapalı test gerekir. Hesabın için Console'da gösterilen adımları tamamla ve ardından üretim incelemesine gönder.

Paket kimliği değiştiği için eski `app.forma.study` kurulumu güncellenmez; yeni uygulama ayrı kurulur ve eski yerel defter kayıtlarını otomatik almaz. Üretim yayını ve cihaz testleri bu kaynak hazırlığıyla yapılmış sayılmaz.

## Resmi kaynaklar

- [Hedef API şartı](https://support.google.com/googleplay/android-developer/answer/11926878?hl=en-EN)
- [Uygulama imzalama ve Play App Signing](https://developer.android.com/studio/publish/app-signing)
- [Veri güvenliği formu](https://support.google.com/googleplay/android-developer/answer/10787469?hl=en)
- [Gizlilik politikası](https://support.google.com/googleplay/android-developer/answer/10144311?hl=en)
- [Yeni kişisel hesaplarda test şartı](https://support.google.com/googleplay/android-developer/answer/14151465?hl=en)
