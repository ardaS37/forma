# Türev Al

Forma'nın matematik yazımı, kalem ve sonsuz defter sistemi üzerine kurulmuş çevrimdışı Android uygulaması. Açılış menüsünde yalnız **Limit**, **Türev**, **İntegral** düğmeleri bulunur. Uygulama içinde Türev Al adı korunur; telefonda görünen adı **Türev Al - Limit Türev İntegral** olur.

Varsayılan vurgu rengi **petrol turkuazı (#247c78)**; uygulama simgesi Forma’ya benzer bir **T.** monogramıdır. Kullanıcının kayıtlı renk seçimi korunur. Her bölüm aynı soru/çizim ekranını kullanır; başlıkları **Limit Al.**, **Türev Al.**, **İntegral Al.** şeklindedir. Simülasyon düğmesinin yerindeki diğer araçlarla aynı dairesel şablondaki liste simgesinden açılan **Konular** penceresi, o bölümde bilinen konuları seçtirir. Önce lise konuları, ardından **başlıksız ince bir çizgi** ve üniversite konuları gelir. Ayrım [MEB'in 2018 genel lise matematik programına](docs/curriculum-2018.md) göre yapılır.

| Bölüm | Konu | Parametreli şablon |
| --- | ---: | ---: |
| Limit | 20 | 69 |
| Türev | 21 | 91 |
| İntegral | 18 | 87 |
| Toplam | 59 | 247 |

Limit: yerine koyma, çarpanlara ayırma, eşlenik, sağ/sol limit, süreklilik, parçalı/mutlak değerli fonksiyonlar; ileri bölümde sonsuz, özel trigonometrik/üstel/logaritmik limitler, sıkıştırma ve L’Hôpital. Türev: temel kurallar, ikinci türev ve uygulamalar; ileri bölümde trigonometrik/ters trigonometrik, üstel/logaritmik, yüksek mertebe, kapalı ve parametrik türevler. İntegral: kuvvet/kök, değişken değiştirme, belirli integral, alan, temel teorem ve başlangıç koşulu; ileri bölümde diğer fonksiyon aileleri, kısmi integrasyon, basit kesirler, hacim, ortalama değer ve uygunsuz integral.

Konu seçimi karma soruların bütün bağımlılıklarına uygulanır. Örneğin logaritmayı kapatmak, logaritma kullanan karma soruları da çıkarır. Yalnız üst gruptaki konular seçilirse ileri beceri gerektiren şablon üretilmez. Uygun şablon kalmazsa Uygula kapalıdır. Her bölümün seçimleri, soruları ve çizimleri ayrı saklanır; bölümler arasında geçişte ve uygulama yeniden açıldığında korunur. Kayıtlı oturumlar kendi bölüm ve konu seçimleriyle açılır. Her uygun şablon bir turda bir kez seçilir, sayılar sonraki turlarda değişir.

Açık uçlu çözümler, Türkçe/İngilizce, açık/koyu/AMOLED, basınçlı kalemler, S Pen tuşuyla geçici silgi ve 250 ms bırakma koruması, cetvel, geri al/ileri al, otomatik kayıt, Defterim ve PNG dışa aktarma korunur. Simülasyonlar yüklenmez. Android geri tuşu çalışma ekranından üç düğmeli menüye, menüden uygulama dışına döner.

Android paket kimliği **com.sapsoft.tureval**, sürüm **1.1.0**, minimum Android 8 (API 26). Forma ile yan yana kurulabilir. Java namespace ve `FormaAndroid` köprüsü mevcut kalem sistemiyle uyum için korunur. Hesap veya internet izni gerekmez.

## Derleme

JDK 17/21, Android SDK API 36 gerekir. Linux/macOS: `ANDROID_HOME=/path/to/sdk ./build-android.sh`. Windows: `powershell -ExecutionPolicy Bypass -File .\build-android.ps1`.

Çıktı: `build/turev-al-android-1.1.0-debug.apk`. Debug APK geliştirme anahtarıyla imzalanır. Play Store için kendi anahtarınızla imzalı release gerekir; mevcut [imzalama rehberi](android/PLAY-STORE.md) Forma'dan devralınan işlem adımlarını içerir.

## Doğrulama

- `node android/verify-derivatives.cjs`: 1.820 soru, 23.960 bağımsız kontrol; mathjs sembolik türevleri ve sonlu farklarla tüm 91 şablon.
- `node android/verify-calculus.cjs`: 2.496 limit/integral sorusu, 22.904 bağımsız kontrol; türevle asal fonksiyon doğrulama, sayısal integrasyon, yaklaşım dizileri, yakınsak/ıraksak durumlar ve yalnız lise konularından üretim.
- `node android/verify-derivatives-ui.cjs` ve `node android/verify-calculus-ui.cjs`: tüm 247 şablonun matematik gösterimi; tam üç düğmeli menü; başlıksız ayraç ve konu sırası; bölüm bazlı filtreler, çizim, geri al/ileri al, kayıt/geri yükleme, bölümler arası kayıt açma, mobil/tablet, iki dil ve iki tema. Playwright ve Chromium gerekir.
- `node android/verify-icon-ui.cjs`: turkuaz varsayılan, yedi ikon rengi, özel renk ve kayıtlı tercihlerin korunması.
- `node android/verify-stylus.cjs`: 56 tarayıcı/yerel kalem örneği kontrolü. Saf Java testleri: 45 S Pen dizisi ve ikon paleti.
- Android: `assembleDebug lintDebug` başarılı; 0 lint hatası, devralınan 6 uyarı. Fiziksel Android tablet/S Pen testi yapılmadı.

Görseller `build/turev-ui/` altında oluşur. `FORMA_PLAYWRIGHT` ile Playwright modül yolu, `FORMA_CHROME_CHANNEL` ile isteğe bağlı tarayıcı kanalı verilebilir. Forma'nın eski ders/simülasyon testleri bu uygulamanın kabul testleri değildir.

Temel dosyalar: [türev](android/app/src/main/assets/web/derivative-bank.js), [integral](android/app/src/main/assets/web/integral-bank.js), [limit](android/app/src/main/assets/web/limit-bank.js), [müfredat eşlemesi](android/app/src/main/assets/web/practice-banks.js), [menü ve konu seçimi](android/app/src/main/assets/web/turev-ui.js), [ortak çizim sistemi](android/app/src/main/assets/web/app.js).
