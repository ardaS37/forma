# Kavis — Android

Başlatıcı adı **Kavis - Limit Türev İntegral**, applicationId `com.sapsoft.tureval`, sürüm `1.4.0`, minimum API 26, compile/target API 36. Java namespace `com.sapsoft.forma` ve `FormaAndroid` köprüsü korunur. Varsayılan vurgu Turkuaz (#247c78); simge K. Açık/koyu tema varsayılanı Sistem’dir. Paket kimliği korunarak eski Türev Al üzerine güncellenir. Başlatıcı alias’ları yeni paketi hedefler ve diğer uygulamalardan bağımsızdır.

Açılış menüsü yalnız **Limit**, **Türev**, **İntegral** düğmelerinden oluşur. Çalışma başlıkları Limit Al., Türev Al., İntegral Al. şeklindedir. Soru, konu tercihi ve çizim akışı birlikte saklanır. Ayrıntılı soru kapsamı, şablon sayıları ve kabul testleri [ana README](../README.md) içinde açıklanır.

Kökten `./build-android.sh` veya Windows’ta `powershell -ExecutionPolicy Bypass -File .\build-android.ps1` çalıştırın. APK: `build/kavis-android-1.4.0-debug.apk`. JDK 17/21 ve SDK API 36 gerekir. Çizim ve oturum kayıt biçimi korunur. Varlıklar `app/src/main/assets/web/` içindedir; eski ders kaynakları ortak araç bağımlılıkları için tutulur, eski ders ve simülasyon menüleri yüklenmez.

Fiziksel tablet/S Pen testi yapılmadı.

1.4.0: limitte epsilon–delta, ispat/karşı örnek ve grafikli sıkıştırma seçenekleri. Yeni soru ve çözüm kaynağı `app/src/main/assets/web/limit-proofs.js`; kayıtlı konu seçimleri korunur.
