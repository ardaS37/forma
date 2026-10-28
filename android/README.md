# Türev Al — Android

Forma'nın yerel WebView ve S Pen altyapısını kullanan ayrı uygulama. Uygulama adı Türev Al; applicationId `com.sapsoft.tureval`, sürüm 1.0.0, minimum API 26, compile/target API 36. Java namespace `com.sapsoft.forma` ve `FormaAndroid` köprüsü korunur. Launcher alias adları yeni applicationId ile tam yazılmıştır; ikon renk geçişleri yeni paketi hedefler. Geri tuşu açık pencereyi kapatır, Defterim'den çalışmaya döner; çalışma ekranında kayıt yapıp uygulamadan çıkar.

Proje kökünden `./build-android.sh` veya Windows'ta `powershell -ExecutionPolicy Bypass -File .\build-android.ps1` çalıştırılır. JDK 17/21 ve SDK API 36 gerekir. APK: `build/turev-al-android-1.0.0-debug.apk`.

Web varlıkları `app/src/main/assets/web/` içindedir. `derivative-bank.js` soru şablonlarını, sembolik türev ağacını ve konu bağımlılıklarını; `turev-ui.js` konu seçim penceresini ve doğrudan çalışma ekranında açılışı yönetir. Defterin çizim ve kayıt biçimi aynıdır. Simülasyon betiği ve ilk kullanım ders menüsü yüklenmez. Eski ders kaynakları ortak araç bağımlılıklarıyla uyumluluk için kaynakta tutulur.

Kabul testleri ve sayısal sonuçlar [ana README](../README.md) içinde. S Pen doğrulaması tarayıcıda yerel olay örnekleriyle yapılmıştır; fiziksel cihaz testi yapılmamıştır. `verify-ui.cjs` ve diğer eski ders/simülasyon arayüz testleri Forma'nın tarihsel kapsamına aittir.
