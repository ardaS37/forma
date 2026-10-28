# Açı — Android

Başlatıcı adı **Açı - Trigonometri Soruları**, applicationId `com.sapsoft.aci`, sürüm `1.1.2`, minimum API 26, compile/target API 36. Java namespace `com.sapsoft.forma` ve `FormaAndroid` köprüsü korunur. Varsayılan vurgu Turuncu (#b65b32); simge A.. Başlatıcı alias’ları yeni paketi hedefler ve diğer uygulamalardan bağımsızdır.

Açılışta tek **Trigonometri** düğmesi bulunur. Soru, konu tercihi ve çizim akışı birlikte saklanır. Ayrıntılı soru kapsamı, şablon sayıları ve kabul testleri [ana README](../README.md) içinde açıklanır.

Kökten `./build-android.sh` veya Windows’ta `powershell -ExecutionPolicy Bypass -File .\build-android.ps1` çalıştırın. APK: `build/aci-android-1.1.2-debug.apk`. JDK 17/21 ve SDK API 36 gerekir. Çizim ve oturum kayıt biçimi korunur. Varlıklar `app/src/main/assets/web/` içindedir; eski ders kaynakları ortak araç bağımlılıkları için tutulur, eski ders ve simülasyon menüleri yüklenmez.

Fiziksel tablet/S Pen testi yapılmadı.

Açık/koyu tema varsayılanı Sistem’dir; ayrıca seçilen tema saklanır. 1.1.2 sürümü grafik okuma/çizme soruları ile ortak matematik gösterimi düzeltmelerini içerir.
