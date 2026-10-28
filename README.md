# Türev Al

Forma 1.40'ın yazı, matematik gösterimi ve çizim sistemi üzerine kurulmuş, çevrimdışı Android türev uygulaması. Uygulama doğrudan soru ve sonsuz defter ekranında açılır. Ders/ana menü ve simülasyonlar kaldırılmıştır. Eski simülasyon düğmesinin yerindeki **Konular** düğmesi, “Hangi türev konularını biliyorum?” seçimini açar.

20 konu ve 88 parametreli soru şablonu: polinom/kuvvet, kök, negatif kuvvet, çarpım, bölüm, zincir, trigonometrik ve ters trigonometrik fonksiyonlar, üstel, logaritmik, logaritmik türev, yüksek türev, noktadaki türev, teğet/normal, tanımdan türev, kapalı ve parametrik türev, mutlak değer/türevlenebilirlik, artma/azalma/ekstremum, değişim hızı/optimizasyon.

Konu seçimi bütün karma sorulara uygulanır. Logaritmayı kapatmak, logaritma içeren zincir/çarpım/logaritmik türev sorularını da havuzdan çıkarır. Bazı uygulamalar ilgili temel fonksiyonun da seçilmesini gerektirir. Uygun şablon kalmazsa Uygula devre dışıdır. İptal mevcut soruyu ve çizimi korur. Seçimler kalıcıdır; kayıtlı oturumlar kendi konu seçimleriyle açılır. Her uygun şablon bir turda bir kez seçilir; sayılar sonraki turlarda değişir. Sayısal parametreler sonludur, dolayısıyla sınırsız benzersiz soru garantisi verilmez.

Açık uçlu sorular ve açılır çözümler, Türkçe/İngilizce, açık/koyu/AMOLED tema, basınçlı kalemler, S Pen tuşuyla geçici silgi ve 250 ms bırakma koruması, cetvel, geri al/ileri al, otomatik kayıt, Defterim ve PNG dışa aktarma korunur.

Android paket kimliği **com.sapsoft.tureval**, sürüm **1.0.0**, minimum Android 8 (API 26). Forma ile yan yana kurulabilir. Android'in Java namespace'i ve `FormaAndroid` köprü adı mevcut kalem altyapısıyla uyum için korunur. Hesap veya internet izni gerekmez.

## Derleme

JDK 17/21, Android SDK API 36 gerekir. Linux/macOS: `ANDROID_HOME=/path/to/sdk ./build-android.sh`. Windows: `powershell -ExecutionPolicy Bypass -File .\build-android.ps1`.

Çıktı: `build/turev-al-android-1.0.0-debug.apk`. Debug APK geliştirme anahtarıyla imzalanır. Play Store için kendi anahtarınızla imzalı release gerekir; mevcut [imzalama rehberi](android/PLAY-STORE.md) Forma'dan devralınan işlem adımlarını içerir.

## Doğrulama

- `node android/verify-derivatives.cjs`: 1.760 soru, 23.380 bağımsız kontrol; mathjs sembolik türevleri ve sonlu farklar, bütün 88 şablon, konu bağımlılıkları, kaydedilebilirlik ve tekrarlanabilirlik.
- `node android/verify-derivatives-ui.cjs`: tüm şablonların matematik gösterimi; konu seçimi/iptal/kayıt/geri yükleme, gerçek tuval çizimi ve geri al/ileri al; mobil/tablet, iki dil ve iki tema. Playwright ve Chromium gerekir.
- `node android/verify-stylus.cjs`: mevcut 56 tarayıcı ve yerel kalem örneği kontrolü.
- Android: `assembleDebug lintDebug` başarılı; lint 0 hata, devralınan 6 uyarı. Fiziksel Android tablet/S Pen testi yapılmadı.

Ekran görüntüleri test çalışınca `build/turev-ui/` klasörüne yazılır. `FORMA_PLAYWRIGHT` ile Playwright modül yolu; `FORMA_CHROME_CHANNEL` ile isteğe bağlı tarayıcı kanalı verilebilir. Forma'nın ders menüsü ve simülasyonlarını bekleyen eski genel arayüz testleri bu ayrı uygulamanın kabul testleri değildir.

Temel dosyalar: [soru kütüphanesi](android/app/src/main/assets/web/derivative-bank.js), [konu seçimi](android/app/src/main/assets/web/turev-ui.js), [ortak çizim sistemi](android/app/src/main/assets/web/app.js).
