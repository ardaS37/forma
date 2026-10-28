# Açı

Forma’nın matematik yazımı, kalem ve sonsuz defter sistemi üzerine kurulu çevrimdışı Android uygulaması. Uygulama içindeki ad **Açı**, başlatıcıdaki ad **Açı - Trigonometri Soruları**. Açılışta tek **Trigonometri** düğmesi bulunur.

Varsayılan vurgu **Turuncu (#b65b32)**, logo **A.**. Harf çizimi Forma’nın F. simgesiyle aynı eğim, gövde kalınlığı, düz uç kesimleri ve nokta ölçülerini kullanır. Renk menüsünde **Hiçbiri** her zaman ilk sıradadır; renk adları Turkuaz ve Turuncu gibi basittir. Konular ve kalem düğmeleri diğer araçlarla aynı dairesel şablonu kullanır; geri ve ayarlar simgeleri hizalıdır. Simülasyonlar yüklenmez.

| Bölüm | Konu | Matematik ailesi | Soru şablonu | Formül |
| --- | ---: | ---: | ---: | ---: |
| Trigonometri | 31 | 234 | 702 | 138 |

Şablon sayıları yalnız sayı değiştirmeyi saymaz: temel çözüm, bağlantılı uygulama ve önerilen çözümü inceleme farklı görevlerdir; limitte iki farklı dış dönüşüm bulunur. Aynı aile birden çok görev biçimiyle kullanılır. Tohumlu seçim her uygun şablonu bir turda bir kez getirir; sonraki turlarda sayılar değişir. Her sorunun tüm konu bağımlılıkları filtrelenir. Seçili konulardan uygun şablon kalmazsa Uygula kapanır.

Temel ve ileri trigonometrik oranlar, birim çember, özel/yönlü açılar, indirgeme, toplam–fark, iki/yarım/üç kat açı, çarpım–toplam dönüşümleri, denklemler ve eşitsizlikler, grafik, periyot/genlik, üçgen teoremleri, ters trigonometrik bileşkeler, De Moivre, kutupsal koordinatlar ve dalga soruları bulunur. Hiperbolikler için sinh/cosh/tanh, sech/csch/coth, toplam–fark ve çok kat bağıntıları; ters hiperbolikler için asinh/acosh/atanh/acoth/asech/acsch, gerçek tanım kümeleri ve logaritmik açılımlar vardır. Maclaurin katsayısı soruları ile trigonometrik ve hiperbolik seri formülleri de eklenmiştir.

Çözümler **1. adım, 2. adım…** biçiminde, kuralları ve ara işlemleri ayırarak gösterilir. Defter yazımı açıkken sorular, çözümler ve formüllerde kesirler alt alta yazılır; kesin küçük rasyonel sayılar ondalığa çevrilmez. Seri katsayıları da kesin kesir biçiminde korunur. Gereksiz `(x)²` ve çift parantezler kaldırılır; gerekli gruplamalar kalır. Optimizasyonda kurulması istenen alan modeli ve grafik okumada cevabı veren analitik denklem soru içinde gösterilmez. Formüller bölümünde kullanılan bütün konu ailelerinin kuralları ve tanım koşulları yer alır.

Konular listesinde MEB 2018 genel lise kapsamı önce, başlıksız ince çizgiden sonra üniversite kapsamı gösterilir; [eşleme notu](docs/curriculum-2018.md). Açık/koyu/AMOLED, Türkçe/İngilizce arayüz, basınçlı kalemler, S Pen tuşuyla geçici silgi ve 250 ms bırakma koruması, cetvel, geri al/ileri al, otomatik kayıt, Defterim ve PNG dışa aktarma korunur. Yeni ayrıntılı çözüm metinleri Türkçedir.

Paket **com.sapsoft.aci**, sürüm **1.1.2**, minimum Android 8/API 26, compile/target API 36. Forma ve diğer uygulama ile yan yana kurulabilir. Java namespace ve FormaAndroid köprüsü kalem uyumluluğu için korunur. Hesap ve internet izni gerekmez.

Varsayılan açık/koyu tema **Sistem** seçeneğidir. Cihazın teması izlenir; kullanıcı ayrıca açık/koyu seçerse tercih saklanır. Grafik sorularında genlik/periyot/değer aralığı okuma ve sinüs/kosinüs/tanjant grafiklerini iki periyot boyunca deftere çizme görevleri bulunur. Tanjant asimptotları örnek çözümde gösterilir. Çizim çözümü açılmadan örnek grafik gösterilmez. Formüllerde boş parçalardan oluşan `undefined` ve türev işareti gösterim hataları giderilmiştir.

## Derleme ve doğrulama

JDK 17/21 ve Android SDK API 36 gerekir. Linux/macOS: `ANDROID_HOME=/path/to/sdk ./build-android.sh`. Windows: `powershell -ExecutionPolicy Bypass -File .\build-android.ps1`.

Çıktı: `build/aci-android-1.1.2-debug.apk`. Debug APK geliştirme anahtarıyla imzalanır; mağaza için [release rehberi](android/PLAY-STORE.md).

- `node android/verify-trigonometry.cjs`: 7.020 soru, 157.203 bağımsız kontrol; sayısal sonuçlar, kök ailelerinin tamlığı, eşitsizlik aralıkları, ispat özdeşlikleri ve konu filtreleri.
- `node android/verify-workbooks-ui.cjs`: menü, modlar, konu ayracı, seçili yeni ailelerin soru/çözüm matematik gösterimi, kesirler, tam formül çekmecesi, çizim/geri al/ileri al, renk sırası ve mobil koyu tema. Playwright/Chromium gerekir; görseller `build/workbook-ui/` altında oluşur.
- `node android/verify-stylus.cjs`: 56 kalem kontrolü. Saf Java testleri: 45 S Pen tuş dizisi ve başlatıcı renk paleti.
- `assembleDebug lintDebug`: 0 hata, devralınan 6 uyarı. Fiziksel tablet/S Pen testi yapılmadı. Forma’dan kalan eski ders testleri bu uygulamanın kabul testleri değildir.

Kaynaklar `android/app/src/main/assets/web/` altında; soru bankası, `question-expansion.js`, `math-display.js`, `solution-steps.js`, `reference-data.js` ve ortak `app.js` temel dosyalardır. `source-manifest.json` güncel dosya özetlerini tutar.
