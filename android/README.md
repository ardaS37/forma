# Türev Al — Android

Forma'nın WebView ve S Pen altyapısını kullanan ayrı uygulama. Uygulama içindeki adı Türev Al, başlatıcıda görünen adı Türev Al - Limit Türev İntegral; applicationId `com.sapsoft.tureval`, sürüm 1.1.0; minimum API 26, compile/target API 36. Java namespace `com.sapsoft.forma` ve `FormaAndroid` köprüsü korunur. Launcher alias adları yeni applicationId ile tam yazılmıştır; ikon renk geçişleri yeni paketi hedefler.

Varsayılan renk petrol turkuazı (#247c78); simge T. şeklindedir. Başlatıcıda varsayılan olarak yalnız LauncherTeal açıktır. Konular düğmesi diğer araçlarla aynı dairesel liste simgesidir. Çalışma başlıkları Limit Al./Türev Al./İntegral Al. olarak değişir. Açılışta Limit/Türev/İntegral olmak üzere üç düğme gösterilir. Bölümlerin soru, konu tercihi ve çizim akışları ayrı saklanır. Konular listesinde MEB 2018 genel lise kapsamı önce, başlıksız ince ayraçtan sonra kalan konular gösterilir. Karma başlıklar uygun yerde ayrılır; yalnız lise konuları seçildiğinde ileri yöntemler soru havuzuna girmez. Geri tuşu açık pencereleri kapatır, Defterim'den çalışmaya, çalışma ekranından menüye döner; menüde uygulamadan çıkar.

Proje kökünden `./build-android.sh` veya Windows'ta `powershell -ExecutionPolicy Bypass -File .\build-android.ps1` çalıştırılır. JDK 17/21 ve SDK API 36 gerekir. APK: `build/turev-al-android-1.1.0-debug.apk`.

Varlıklar `app/src/main/assets/web/` içinde. `derivative-bank.js`, `integral-bank.js` ve `limit-bank.js` soru kütüphanelerini; `practice-banks.js` ortak kaydı ve müfredat gruplarını; `turev-ui.js` üç düğmeli menü ve konu penceresini yönetir. Çizim ve oturum kayıt biçimi korunur. Eski ders kaynakları ortak araç bağımlılıklarıyla uyumluluk için tutulur; eski ders menüsü ve simülasyonlar yüklenmez.

Test komutları [ana README](../README.md) içinde; kapsam kaynağı [müfredat notunda](../docs/curriculum-2018.md). Fiziksel cihaz/S Pen testi yapılmamıştır.
