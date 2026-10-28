# Türev Al

Forma’nın matematik yazımı, kalem ve sonsuz defter sistemi üzerine kurulu çevrimdışı Android uygulaması. Uygulama içindeki ad **Türev Al**, başlatıcıdaki ad **Türev Al - Limit Türev İntegral**. Açılış menüsü yalnız **Limit**, **Türev**, **İntegral** düğmelerinden oluşur. Çalışma başlıkları Limit Al., Türev Al., İntegral Al. şeklindedir.

Varsayılan tema **Turkuaz (#247c78)**, logo **T.**. Renk menüsünde **Hiçbiri** her zaman ilk sıradadır; renk adları Turkuaz ve Turuncu gibi basittir. Konular ve kalem düğmeleri diğer araçlarla aynı dairesel şablonu kullanır; geri ve ayarlar simgeleri hizalıdır. Simülasyonlar yüklenmez.

| Bölüm | Konu | Matematik ailesi | Soru şablonu | Formül |
| --- | ---: | ---: | ---: | ---: |
| Limit | 21 | 75 | 300 | 32 |
| Türev | 25 | 168 | 504 | 58 |
| İntegral | 25 | 155 | 465 | 75 |

Şablon sayıları yalnız sayı değiştirmeyi saymaz: temel çözüm, bağlantılı uygulama ve önerilen çözümü inceleme farklı görevlerdir; limitte iki farklı dış dönüşüm bulunur. Aynı aile birden çok görev biçimiyle kullanılır. Tohumlu seçim her uygun şablonu bir turda bir kez getirir; sonraki turlarda sayılar değişir. Her sorunun tüm konu bağımlılıkları filtrelenir. Seçili konulardan uygun şablon kalmazsa Uygula kapanır.

Limit: temel ve özel limitler, süreklilik, tek taraflı/parçalı/mutlak değerli fonksiyonlar, sonsuzlar, sıkıştırma, L’Hôpital ve ters trigonometrik limitler.

Türev: temel kurallar ve uygulamalar; sayısal tabanlı a^x ve log_a(x), bileşke sin(x²+1), değişken taban/üs, karışık çarpım/bölüm, dy/dx, dx/dy, diferansiyel, kapalı/parametrik türev. Kısmi türevlerde x/y, xx/xy/yy, trigonometrik, logaritmik, üstel, köklü, rasyonel ve değişken üslü iki değişkenli fonksiyonlar; toplam diferansiyel ve doğrusal yaklaşım bulunur.

İntegral: temel ve bileşke fonksiyonlar, diferansiyelle integral, değişken değiştirme, kısmi integrasyon (tablolu tekrarlı ve döngülü örnekler dahil), basit kesirler, belirli integral, alan/hacim, uygunsuz integral, temel teorem. Math2 seçeneklerinde dikdörtgen/değişken bölgede çift katlı integral, sıra değiştirme, kutupsal dönüşüm/Jacobian ve üç katlı integral vardır. Leibniz ve İleri Leibniz ayrı seçeneklerdir: hareketli sınırlar, integrand parametresi, ikinci parametre türevi ve sonsuz aralıkta üstel momentler. Türev çalışanın limit; integral çalışanın limit ve türev bildiği kabul edilir, başka bölümün filtreleriyle engellenmez.

Çözümler **1. adım, 2. adım…** biçiminde, kuralları ve ara işlemleri ayırarak gösterilir. Defter yazımı açıkken sorular, çözümler ve formüllerde kesirler alt alta yazılır; kesin küçük rasyonel sayılar ondalığa çevrilmez. Seri katsayıları da kesin kesir biçiminde korunur. Gereksiz `(x)²` ve çift parantezler kaldırılır; gerekli gruplamalar kalır. Optimizasyonda kurulması istenen alan modeli ve grafik okumada cevabı veren analitik denklem soru içinde gösterilmez. Formüller bölümünde kullanılan bütün konu ailelerinin kuralları ve tanım koşulları yer alır.

Konular listesinde MEB 2018 genel lise kapsamı önce, başlıksız ince çizgiden sonra üniversite kapsamı gösterilir; [eşleme notu](docs/curriculum-2018.md). Açık/koyu/AMOLED, Türkçe/İngilizce arayüz, basınçlı kalemler, S Pen tuşuyla geçici silgi ve 250 ms bırakma koruması, cetvel, geri al/ileri al, otomatik kayıt, Defterim ve PNG dışa aktarma korunur. Yeni ayrıntılı çözüm metinleri Türkçedir.

Paket **com.sapsoft.tureval**, sürüm **1.2.0**, minimum Android 8/API 26, compile/target API 36. Forma ve diğer uygulama ile yan yana kurulabilir. Java namespace ve FormaAndroid köprüsü kalem uyumluluğu için korunur. Hesap ve internet izni gerekmez.

## Derleme ve doğrulama

JDK 17/21 ve Android SDK API 36 gerekir. Linux/macOS: `ANDROID_HOME=/path/to/sdk ./build-android.sh`. Windows: `powershell -ExecutionPolicy Bypass -File .\build-android.ps1`.

Çıktı: `build/turev-al-android-1.2.0-debug.apk`. Debug APK geliştirme anahtarıyla imzalanır; mağaza için [release rehberi](android/PLAY-STORE.md).

- `node android/verify-expanded-math.cjs`: 5.076 soru, 24.755 bağımsız kontrol; sembolik türev, asal fonksiyon, sayısal integral, limit yaklaşımı, kısmi/karışık türev ve Leibniz sınır/parametre katkıları.
- `node android/verify-workbooks-ui.cjs`: menü, modlar, konu ayracı, seçili yeni ailelerin soru/çözüm matematik gösterimi, kesirler, tam formül çekmecesi, çizim/geri al/ileri al, renk sırası ve mobil koyu tema. Playwright/Chromium gerekir; görseller `build/workbook-ui/` altında oluşur.
- `node android/verify-stylus.cjs`: 56 kalem kontrolü. Saf Java testleri: 45 S Pen tuş dizisi ve başlatıcı renk paleti.
- `assembleDebug lintDebug`: 0 hata, devralınan 6 uyarı. Fiziksel tablet/S Pen testi yapılmadı. Forma’dan kalan eski ders testleri bu uygulamanın kabul testleri değildir.

Kaynaklar `android/app/src/main/assets/web/` altında; soru bankası, `question-expansion.js`, `math-display.js`, `solution-steps.js`, `reference-data.js` ve ortak `app.js` temel dosyalardır. `source-manifest.json` güncel dosya özetlerini tutar.
