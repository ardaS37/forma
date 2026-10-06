# Forma — Android

## 1.36.5 — AMOLED sayfa rengi ve varsayılanı

AMOLED yeni ayarlarda varsayılan açık; kaydedilmiş kapatma tercihi korunur. Koyu sayfa rengi de AMOLED açıkken gerçek siyah, kapalıyken önceki koyu renktir; renk seçeneğinin önizlemesi aynı şekilde değişir. Tema testi varsayılanı, tercih kaydını ve sayfa rengini doğrular. APK: build/forma-android-1.36.5-debug.apk.

## 1.36.4 — AMOLED koyu tema

Ayarlara kalıcı AMOLED anahtarı eklendi. Koyu temada ana arka plan, otomatik defter rengi ve Android sistem çubukları gerçek siyah olur; açık tema ve özel sayfa rengi korunur. Tema testi kayıt, sistem geçişleri ve kapatma davranışını doğrular. APK: build/forma-android-1.36.4-debug.apk.

## 1.36.3 — Koyu mod ikon daireleri

Koyu modda ikonların beyaz daireleri kalem gibi şeffaf, ince çerçeveli hale getirildi. Arka plan ve çerçeve eşitliği tema testinde doğrulandı. APK: build/forma-android-1.36.3-debug.apk.

## 1.36.2 — Koyu mod ikonları

Araç, menü ve ayar ikonları koyu modda kalemle aynı vurgu rengini kullanır. Tema ve ikon rengi kontrolleri geçti. APK: `build/forma-android-1.36.2-debug.apk`.

## 1.36.1 — Simülasyon erişimi

Ana sayfadaki simülasyon kutusu ve modül gezginindeki simülasyon girişi kaldırıldı. Simülasyonlar araç satırındaki ikon üzerinden bağımsız pencerelerde açılır. Mobil pencere ve dokuz fizik simülasyonu arayüz testleri geçti. APK: `build/forma-android-1.36.1-debug.apk`.

## 1.36.0 — Simülasyon pencereleri

Simülasyonlar hesap makinesiyle aynı pencere sistemi içinde açılır: bağımsız örnekler, başlıktan taşıma, küçültme, kapatma ve Escape/Android geri tuşu. Bağlantı portu yoktur. Araç satırında ayrı simülasyon ikonu, yan menüde Simülasyonlar girişi ve ana sayfa kutusu bulunur. Çalışma alanında parametreler, zaman, konum ve küçültme durumu oturumla kaydedilir; geri yüklenince animasyon duraklatılmış olur. Kapanan/küçülen pencerelerin animasyonu durur. Ana sayfada soru oturumu açmadan da kullanılabilir.

Testler: `android/verify-simulation-windows.cjs`, fizik modelleri ve mevcut arayüz testleri. APK: `build/forma-android-1.36.0-debug.apk`.

## 1.35.0 — Tema rengine bağlı telefon simgesi

Telefonun uygulama simgesi vurgu rengiyle eşleşir: mor, yeşil, mavi, kahverengi, pembe veya gri. Android `activity-alias` ile aynı uygulamanın hazır adaptif ikonları arasında geçiş yapılır. Özel renk en yakın hazır RGB tonuna eşlenir. Değişiklik uygulamadan çıkıldığında uygulanır; Android 13+ bileşenleri atomik değiştirir, önceki sürümlerde yeni giriş önce açılır. Asıl Activity hiçbir zaman kapatılmaz. Başlatıcı önbelleği nedeniyle görüntünün yenilenmesi gecikebilir; sistemin temalı ikon özelliği açıkken renk duvar kâğıdına göre belirlenebilir.

Test: `android/verify-icon-ui.cjs` (renk köprüsü/kayıt), `android/LauncherIconPaletteTest.java` (özel renk eşlemesi). APK: `build/forma-android-1.35.0-debug.apk`; derleme komutu `powershell -ExecutionPolicy Bypass -File .\build-android.ps1`.

## 1.34.1 — Android sistem teması

Sistem modu Android'in `uiMode` bilgisini doğrudan okur; WebView'in açık temalı Activity nedeniyle yanlış bildirebildiği `prefers-color-scheme` sonucu yerine bu değeri kullanır. Telefonun tema değişikliği, uygulamaya dönüş ve sayfa yükleme sonrası görünüm güncellenir. Açık/koyu manuel tercihler korunur. `android/verify-theme.cjs` ayar tıklamalarını, tarayıcı/Android tema geçişlerini ve yeniden yüklemede kalıcılığı doğrular.

APK: `build/forma-android-1.34.1-debug.apk`; tek komut: `powershell -ExecutionPolicy Bypass -File .\build-android.ps1`.

## 1.34.0 — Fizik 1, vektör çizici ve simülasyonlar

- Fizik 1: dokuz konu, 32 alt konu, 64 parametreli soru varyantı; hesaplama, grafik/kuvvet diyagramı ve yorum isteyen açık uçlu sorular. Çözümler, formüller ve zorluk barı dahil. Fizik 2/3 ile kimya dersleri taslak olarak kalır.
- Uçları sürüklenebilen 2B vektör çizici; bileşke, büyüklük, skaler/vektörel çarpım ve açı. Bağlı vektör modülüyle veri alışverişi; matrise sütun vektörü gönderme ve bağlı 2×2 sonuç matrisiyle dönüşüm. Vektörler ve bağlantılar çalışma oturumuyla saklanır.
- Modül gezgini Matematik/Fizik/Kimya başlıklarına ayrılır; bütün modüller bütün derslerde erişilebilirdir. Oran aracı Kimya başlığı altındadır.
- Ayrı Simülasyonlar kutusu ve çalışma alanından erişim. Matematik/Fizik/Kimya sekmeleri; Fizik 1'in her ana konusu için toplam dokuz etkileşimli model. Diğer iki dersin simülasyonları henüz eklenmedi.
- Parametreler, zaman, başlat/duraklat ve sıfırlama; varsayımlar, fiziksel birimler ve sonuçlar ekranda belirtilir. Yörünge animasyonunun zaman ölçeği açıkça gösterilir; modeller idealizasyon içerir.
- Ayarlar simgesi beyaz kabarcık; Çalışma alanı/Defterim gezinme düğmeleri çerçevesiz. Ana menü özeti ders seçim kutularının üst kenarına hizalanır.

Doğrulama: `node android/verify-physics.cjs`, `node android/verify-math1.cjs`, Chrome/Playwright ile `android/verify-ui.cjs` ve `android/verify-physics-ui.cjs`. Debug APK: `powershell -ExecutionPolicy Bypass -File .\build-android.ps1` → `build/forma-android-1.34.0-debug.apk`.

## 1.33.0 — Play Store release hazırlığı

- Paket kimliği ve Java namespace: `com.sapsoft.forma`.
- `versionName 1.33.0`, `versionCode 34`; minimum API 26, compile/target API 36.
- İmzalı AAB: `powershell -ExecutionPolicy Bypass -File .\build-android.ps1 -Mode Release` → `build/forma-android-1.33.0-release.aab`.
- İmza bilgilerini Android Studio'dan veya yerel `android/keystore.properties` dosyasından gir. Şablon: `android/keystore.properties.example`.
- İmzasız doğrulama: `-Mode ReleaseUnsigned`; debug APK: `-Mode Debug`.
- [İmzalama ve Play Console rehberi](android/PLAY-STORE.md). Yeni paket eski uygulamadan ayrı kurulur; yerel kayıtlar otomatik taşınmaz.
- Sürümün kaynağı `android/app/build.gradle`; kaynak manifesti `update-source-manifest.ps1` ile yenilenir. Aşağıdaki eski sürüm notları ve raporlar tarihsel kayıtlardır.

## 1.32 değişiklikleri

- Genel Matematik 1: 11 ana konu, 95 alt konu; mevcut kaynak sorularına ek olarak 95 yeni parametreli açık uçlu soru şablonu. Yeni tipler mevcut alt konu akışlarına da dönüşümlü dağıtılır; genel karma tüm ana konuları kapsar.
- Denklem ve Eşitsizlikler ayrı ana konu: birinci derece, ikinci derece/diskriminant/Vieta, parabol/tepe/grafik, üçüncü derece/Cardano, dördüncü derece, Horner, çok bilinmeyenli doğrusal sistemler, işaret tabloları ve eşitsizlik sistemleri.
- Bütün Matematik 1 konularında ifade, gerekçelendirme, ispat ve grafik alıştırmaları. Yeni açık uçlu sorularda şık veya otomatik cevap kontrolü yoktur. Çözümler, istenirse örnek grafik ve işaret tablosuyla açılır.
- Formüllere Cardano'nun gerçek kök ve üç reel kök durumları, Horner, kübik/dördüncü derece Vieta, Gauss eliminasyonu, L’Hôpital, Newton ve integrasyon kuralları eklendi; gerekli tanım koşulları notlarda belirtilir.
- Sorunun üzerinde 1–5 zorluk barı: soru türü, çözüm adımları ve üretilen sayıların büyüklüğü/kesirli olması üzerinden tahmin. Öğrenci performansına göre kalibre edilmiş bir ölçüm değildir. Metadata yeni soruyla kaydedilir; eski kayıtlarda mevcut sorudan tahmin edilir.
- Yeni katalog `math1-expanded.js`, zorluk göstergesi `question-difficulty.js` içinde. Kaynak slayt soru bankası korunur.

`node android/verify-math1.cjs` parametre taraması ve bağımsız matematiksel kontrolleri çalıştırır. Arayüz testi `android/verify-ui.cjs` ile grafik, işaret tablosu, zorluk barı, açık uçlu davranış ve oturum geri yükleme kontrollerini içerir. Çıktı APK: `build/forma-android-1.32.apk`.

## 1.31 değişiklikleri

Üniversite modunda Fizik 1 (mekanik ve termodinamiğe giriş), Fizik 2 (elektrik ve manyetizma), Fizik 3 (dalgalar, optik ve modern fizik) başlıkları ve alt konuları eklendi.

Kimya için Genel Kimya 1, Genel Kimya 2, Organik Kimya, Analitik Kimya, Fizikokimya ve Anorganik Kimya başlıkları ve alt konuları eklendi. Bu katalog başlangıç taslağıdır; belirli bir üniversitenin müfredatına bağlı değildir.

Başlıklar gezilebilir yer tutuculardır. Çalışmaya başla düğmesi kapalıdır; soru, çözüm veya boş çalışma oturumu üretilmez. Fizik ve kimya seçimleri ayrı saklanır. Matematik dersleri ve mevcut kayıtları aynı yapıda kalır.

Derleme komutu aynı: `powershell -ExecutionPolicy Bypass -File .\build-android.ps1`. Script sürüm numarasını Gradle yapılandırmasından okuyarak `build/forma-android-1.31.apk` oluşturur.

## 1.30 değişiklikleri

- Kalem satırı ve menü simgelerinde beyaz yuvarlak arka planlar.
- Kalem paletindeki sonradan eklenen renklerde × ile silme; mevcut çizimlerin rengi korunur.
- WebView uzun basma ve titreşim geri bildirimi kapalı; arayüzde bağlam menüsü engellenir.
- Cetvel panelinde normal, kesikli, tek ok ve çift ok çizgileri. Seçim cihazda, çizgi biçimi oturumla birlikte saklanır. Serbest çizime dönüş panelden yapılır.
- Ana sayfada hizalı ders, konu ve alt konu düğmeleri.
- Defterim'de sabit klasör alanı. Kaydın Taşı simgesini tutarak klasöre veya Klasörsüz'e sürükle. Parmak, kalem ve fare desteklenir; klasör seçicisi de kullanılabilir. Sürüklemeyi klasör dışına bırakırsan kayıt yerinde kalır.
- Proje kökünde PowerShell'den `powershell -ExecutionPolicy Bypass -File .\build-android.ps1` ile derle. APK `build/forma-android-1.30.apk` içine kopyalanır. Script yerel SDK yolunu otomatik bulur; Gradle ilk çalıştırmada eksik bağımlılıkları indirir.

Arayüz testleri: `FORMA_PLAYWRIGHT` ortam değişkeni Playwright modülüne ayarlanarak `node android/verify-ui.cjs` çalıştırılabilir. Testler izole Chrome profili kullanır; ekran görüntüleri `build/ui-checks/` içinde oluşur. Fiziksel cihazdaki titreşim/S Pen davranışı ayrıca doğrulanmalıdır.

Telefon ve tablet için çevrimdışı çalışma uygulaması. Android 8.0 (API 26) ve üzeri; güncel Android System WebView kullanır. Paket, mevcut Forma arayüzünü yerel Android WebView içinde çalıştırır. İnternet bağlantısı ve hesap girişi gerekmez.

## APK kurulumu

1. `forma-android-1.33.0-debug.apk` dosyasını Android cihazına indir.
2. Dosyayı aç. Android istediğinde dosyayı açtığın uygulama için “Bu kaynaktan izin ver” seçeneğini etkinleştir.
3. Forma'yı aç; dersini ve konunu seç.

APK geliştirme anahtarıyla imzalanmış bir deneme sürümüdür. Play Store'a yayımlanmış değildir.

## Kullanım

- Sayfa rengi: kâğıt ayarlarından temaya göre, beyaz, krem, buz mavisi, pudra, koyu veya özel renk seçilir. Seçim cihazda saklanır ve PNG dışa aktarımında da kullanılır. Kâğıt ayarı sağ altta yalnız simgeyle gösterilir.
- S Pen: çizim doğrudan WebView Pointer Events ile çalışır. Android yalnız tuş değişimlerini iletir; kalem örnekleri başına JavaScript köprü çağrısı yoktur. STYLUS_PRIMARY, STYLUS_SECONDARY ve SECONDARY tuş kodları desteklenir. Fiziksel cihaz doğrulaması henüz yapılmadı.
- Soru ekranında Forma başlığı ve ders/konu satırı gizlidir; ana sayfa ve Defterim sayfasında görünür. Geri dönüş ve Defterim araç çubuğundan, ayarlar defterin sağ alt simgesinden açılır.
- Performans: kayıtlı çizimler tuval önbelleğinden gösterilir, kalem güncellemeleri ekran karelerine göre birleştirilir; geri alma geçmişi bitmiş çizimleri yeniden kopyalamaz. 72.000 eski nokta ve 600 yeni örnekte çizim sırasında eski çizimler yeniden boyanmadan doğrulandı.
- Kalemler: tükenmez, dolma, kurşun, fosforlu ve keçeli. Kalem simgesinden türünü seç; kalınlık ve renk tercihleri ayrı ayrı hatırlanır. Fosforlu kalem yarı saydamdır; dolma kalem basınç ve çizgi yönüne göre değişir.
- Renk paleti: hazır renkler ve renk seçiciden eklenen özel renkler cihazda saklanır.
- Cetvel simgesi açıkken düz çizgi çizilir. Parmağın kaydırma işlevi değişmez.
- Araç satırı arka plansızdır; defterin üstünde sabit durur. Dar ekranlarda yatay kaydırılır.
- Kaydetme: araç çubuğundaki disket simgesi çalışmayı Defterim sayfasına ekler. Kayıtlar buradan açılır veya çöp kutusu simgesiyle silinir. Otomatik kayıt da sessizce çalışır.
- Formüller: alt çekmecede yeniden görünür. Kapalıyken ince satırdır; açılınca konu seçilerek dikey kaydırılır.
- Vurgu rengi: lavanta varsayılandır; yeşil, mavi, kehribar, gül ve nötr Hiçbiri seçenekleri açık/koyu görünümden bağımsızdır. Logo ve arayüz seçilen rengi kullanır.
- Araç pencereleri, çözüm ve formül çekmecesi animasyonla açılıp kapanır. Azaltılmış hareket tercihi desteklenir.
- Dil: Ayarlardan Türkçe / English seçilebilir. Menü, sorular, formüller ve araçlar seçilen dile geçer; tercih cihazda saklanır.
- Ayarlar: açık / koyu görünüm; noktalı, kareli, çizgili ve düz kâğıt. Varsayılan görünüm beyazdır.
- Defter aşağı doğru kaydırdıkça uzar. Çizimler sabit belge koordinatlarında saklanır.
- Soru biçimi: Şıklı / Açık uçlu. Varsayılan açık uçludur. Bu modda şıklar, cevap kontrolü ve sonuç puanı görünmez. Çözüm alanına tıklayınca doğrudan çözüm açılır. Tercih cihazda saklanır.
- Mobil üst menü tek satırdır. Arayüz metni seçilemez; hesap makinesi ve grafik ifade alanları düzenlenebilir.
- S Pen tuşu basılı tutulurken geçici silgiye geçer; bırakınca seçili araca döner. Web Pointer Events ve Android yerel MotionEvent tuş durumu birlikte kullanılır. Kalemle temasın tamamı tek geri al adımıdır. Gerçek Samsung S Pen üzerinde bu davranış henüz doğrulanmadı.
- S Pen çizim yapar. Parmak varsayılan olarak defteri kaydırır. Ayarlardaki “Elle çizmeyi aç” anahtarı ile parmakla çizimi etkinleştirebilirsin. El modu yoktur.
- PNG: görünen defter alanını Android'in dosya kaydetme ekranıyla istediğin konuma kaydet.
- Kronometre: araç çubuğundaki saat simgesinden açılır; sürüklenir, küçültülür ve kapatılır. Başlat, duraklat/devam et ve sıfırla kontrolleri vardır. Kapalıyken veya soru değiştirirken çalışmaya devam eder.
- Bilimsel hesap makinesi: DEG/RAD, sin/cos/tan, ters trigonometrik fonksiyonlar, logaritma, kök, üs, faktöriyel ve Ans.
- Grafik çizici: iki fonksiyon, örneğin sin(x) ve x^2; yakınlaştırma, uzaklaştırma ve sürükleme. Radyan varsayılandır.
- Android geri tuşu önce açık ayar penceresini veya en üstteki araç penceresini kapatır, sonra ana sayfaya döner.
- Otomatik kayıt sessizce çalışır; üst bölümde kayıt bildirimi ve süre göstergesi yoktur.
- Notlar ve tercihler uygulamanın cihazdaki deposunda tutulur. Web sürümü ve Android sürümü ayrı kayıt alanları kullanır. Uygulama verilerini temizlemek veya uygulamayı kaldırmak bu notları siler.

## Android Studio

Bu klasörü Android Studio'da aç. Android SDK Platform 36 ve JDK 17 veya 21 ile Gradle eşitlemesini tamamla. Java tabanlı kabuk ek uygulama bağımlılığı kullanmaz.

```sh
./gradlew assembleDebug
```

Çıktı: `app/build/outputs/apk/debug/app-debug.apk`.

Mağaza sürümü için Android Studio'da **Generate Signed Bundle / APK → Android App Bundle** akışını ve kendi yayın anahtarını kullan. Anahtarı kaynak koduna ekleme. Android Studio'nun oluşturduğu debug APK kendi debug imzasını kullanır; farklı imzalı APK mevcut kurulumun üzerine güncellenemez.

## Yapı

- `android/app/src/main/java/com/sapsoft/forma/MainActivity.java`: yerel varlık sunumu, sistem çubuğu teması, geri tuşu, dosya kaydetme köprüsü.
- `app/src/main/assets/web/`: paket içindeki arayüz, çizim ve kayıt kodu.
- `app/src/main/assets/web/fonts/`: çevrimdışı yazı tipleri ve SIL OFL lisansları.

Paket INTERNET veya depolama izni istemez. Dosya kaydetme, Android Storage Access Framework ile kullanıcı tarafından seçilen konuma yapılır. Yalnızca uygulamanın paketli HTTPS varlıkları yüklenir.

## Doğrulama

Java kaynak derlemesi, DEX oluşturma, manifest ve paket içeriği, APK v2/v3 imzası ve ZIP hizalaması kontrol edildi. Arayüzün çevrimdışı varlıkları ve JavaScript–Android köprü çağrıları tarayıcıda kontrol edildi. Fiziksel Android cihazı veya emülatör üzerinde çalıştırma testi yapılmadı.

## 1.7 değişiklikleri

- Samsung tuş durumu havadan temasa geçerken korunur; gerçek S Pen cihazında henüz test edilmedi.
- Noktasal silgi / tam fırça darbesi silgisi, seçili silgiye tekrar basınca boyut sürgüsü.
- Yedi kalem: tükenmez, dolma, kurşun, fosforlu, keçeli, fırça, kesik uçlu. Referans kalınlık ve basınç ayarı.
- Üç atanabilir hızlı renk, özel vurgu rengi, vurgu renginden etkilenen otomatik sayfa rengi.
- Kutusuz okunaklı sorular ve çalışma alanı–defter sayfaları arasında animasyon.

## 1.8 değişiklikleri

- Hesap makinesi: ek trigonometrik, hiperbolik, kök ve logaritma fonksiyonları; MC/MR/M+/M− hafızası, 30 işlem geçmişi, ondalık/kesir/bilimsel sonuç biçimleri. Hafıza ve geçmiş cihazda saklanır.
- 2D grafik: altı bağımsız eğri, renk/görünürlük, nokta ve sayısal türev takibi, eksen aralıkları, sığdırma, parmakla yakınlaştırma, PNG dışa aktarma.
- 3D grafik: z=f(x,y) yüzeyi, önbellekli 43×43 geometri, perspektif yansıtma, döndürme, iki parmakla yakınlaştırma, tel kafes/yükseklik ve alan ayarları. Ek ağ bağımlılığı yok.
- Kronometre ve geri sayım bağımsız çalışır. Geri sayımın bitiş zamanı kaydedilir; pencere gizlenince ve uygulama yeniden açılınca geçen süre hesaba katılır. Sesli uyarı yalnız uygulama açık ve görünürken çalışır; yerel Android arka plan alarmı değildir.
- Ayrı sürüklenebilir ve küçültülebilir saat penceresi, 12/24 saat ve yerel tarih.

## 1.9 değişiklikleri

- Çevrimdışı deterministik soru üretimi: trigonometri için 10, hareket ve mol kavramı için beşer matematiksel şablon. Değerler, şıklar ve çözüm birlikte hesaplanır. Sonraki tuşunda beş soru sınırı yok. Üretilen tüm soruların benzersiz olması garanti edilmez.
- Soru/çözüm/şıklar/üretim parametreleri ve çizimler Kaydet ile aynı kayıtta saklanır. Defterim soru ve çözümü gösterir. Yeni soru taslakları otomatik saklanır, Defterim'e açıkça Kaydet ile eklenir. Eski sabit soru kayıtları korunur.
- Her yeni soruda tahtayı temizle ayarı varsayılan açık; kapalıysa yeni soruya çizimler taşınır. Önceki soruya ve kayıtlı çalışmaya dönüş kendi çizimlerini yükler. Araç çubuğunda görünür çöp kutusu simgesi ve geri alınabilir temizleme.
- Boş sorular için kayıt biriktirilmez; yalnız soru dizisinin tohumu ve konumu saklanır. Kayıtlar cihazın yerel depolamasındadır.

## 1.10 değişiklikleri

- Ayarların ilk bölümü Lise / Üniversite modu; varsayılan Lise. Lise'nin mevcut dersleri, soru dizileri ve kayıtları korunur.
- Üniversite başlangıç bankası: Matematik → genel karma sınav / Trigonometri → konudan karma veya özdeşlikler, yarım açı, çift açı, trigonometrik denklemler. Genel karma şu an bu dört trigonometri alt konusunu içerir. Analiz, lineer cebir ve üniversite fizik/kimya kategorileri henüz hazır değil.
- Üniversite ve her alt konu kendi soru tohumunu/konumunu saklar. Kayıtlar eğitim modu, konu, alt konu, soru, çözüm, seçenekler ve çizimlerini korur.
- Şık sayısı 4/5/6/7 seçilebilir; açık uçlu modda şıklar görünmez. Yeni ve kaydedilmemiş sorular şık sayısını uygular; kaydedilmiş sorular asıl seçeneklerini korur. Cevap harfleri A–G. Sayısal olarak eşdeğer seçenekler ayıklanır.

## 1.11 değişiklikleri

- Üniversite Matematik bankası Genel Matematik 1 için sekiz ana konu, 29 alt konu ve 33 formüle genişletildi: kümeler/reel sayılar, fonksiyonlar, üstel/logaritmik fonksiyonlar, trigonometri, limit/süreklilik, türev, türev uygulamaları ve integrale giriş.
- Genel karma sınav sekiz ana konudan dengeli biçimde ilerler. Her konunun karma veya belirli alt konu dizisi ayrıdır; sayısal parametreler, cevap ve çözüm birlikte üretilir.
- Formül çekmecesi sorunun konusunu takip eder; elle başka konu seçilirse seçim korunur. Genel formül görünümünde tüm konular dikey kaydırılabilir.
- Tüm yeni soru/çözüm, konu etiketleri ve formül açıklamaları Türkçe/İngilizce çalışır. Eski üniversite genel sınav kayıtları özgün soru, çözüm ve şıklarıyla korunur.
- 11.600 yeni soru/şık kümesi, sayısal türev/integral kontrolleri, 29 alt konu tarayıcı akışı, mobil yerleşim ve çevrimdışı Android varlıkları doğrulandı. Gerçek Android cihaz/S Pen testi yapılmadı.

## 1.12 değişiklikleri

- Üniversite Matematik altında Genel Matematik 1 / Genel Matematik 2 ders seçimi; iki dersin konu seçimleri ve soru sıraları ayrı saklanır. Genel Matematik 1 kayıtları ve soru kimlikleri korunur.
- Genel Matematik 2: sekiz ana konu, 33 alt konu ve 33 formül. İntegral yöntemleri/uygulamaları, uygunsuz integraller, diziler/seriler, kuvvet/Taylor serileri, parametrik/kutupsal eğriler, vektör/uzay geometrisi ve çok değişkenli fonksiyonlar.
- Her alt konu sayısal parametrelerle yeni soru, doğru cevap ve adım adım çözüm üretir. Genel karma sınav tüm sekiz konuyu kullanır. Pi içeren bazı sorular açıkça pi katsayısını ister.
- Formül çekmecesinde bağımsız ders seçimi; kayıtlarda ders adı ve eski seçenekler korunur. Yeni konu, soru, çözüm ve formül açıklamaları Türkçe/İngilizce çalışır.
- 13.200 Genel Matematik 2 soru/şık kümesi sayısal integral/türev ve seri kontrolleriyle doğrulandı. Mobil akış, kayıt geçişleri, çizim performansı ve çevrimdışı varlık kontrolleri yapıldı. Gerçek Android cihaz/S Pen testi yapılmadı.

## 1.13 değişiklikleri

- Üniversite Matematik altında Analitik Geometri ayrı ders olarak eklendi; seçimi ve soru sırası Genel Matematik 1/2’den bağımsızdır.
- Sekiz ana konu, 32 alt konu, 32 formül: düzlem koordinatları, doğrular, çember, parabol, elips, hiperbol, dönüşümler/geometrik yer ve uzay geometrisi.
- Her alt konu değişen değerlerle doğru cevap, 4–7 sayısal olarak farklı şık ve adım adım çözüm üretir. Genel karma sınav sekiz konudan ilerler. Türkçe/İngilizce desteklenir.
- İlgili sorularda aynı koordinat ölçeğini kullanan SVG çizimleri vardır; teğet noktası ve dikme ayağı gösterilir. Şekiller mobilde de görünür.
- 12.800 soru/şık kümesi ve 10.800 üretilmiş SVG çizimi doğrulandı. Mobil kayıt/ders/formül geçişleri, önceki derslerin kayıtları, çizim performansı ve çevrimdışı varlıklar kontrol edildi. Gerçek Android cihaz/S Pen testi yapılmadı.

## 1.14 değişiklikleri

- Geometri ve Katı Cisimler ayrı üniversite dersleri olarak eklendi. Geometri: 6 ana konu/24 alt konu/24 formül; Katı Cisimler: 7 ana konu/28 alt konu/28 formül. Değişen parametreler, 4–7 farklı şık, adım adım çözümler ve mobil SVG şekilleri.
- Geometri açı/üçgen/dörtgen/çokgen/çember/benzerlik; katı cisimler küp/dikdörtgenler prizması/prizmalar/piramit/silindir/koni/küre konularını kapsar. İki derste bağımsız soru sıraları ve karma sınav bulunur.
- Hesap makinesi, grafik çizici, kronometre ve saat tek Widget gezgini düğmesinden açılan sağ çekmeceye taşındı. Çekmece hareket azaltma tercihini, klavye odağını ve Escape tuşunu destekler. Araç pencereleri taşınabilir ve küçültülebilir.
- Defterim’de klasör oluşturma/yeniden adlandırma, filtreleme ve kayıt taşıma eklendi. Klasör silinince kayıtlar silinmez, klasörsüz bölüme taşınır. Klasörler ve kayıt üyelikleri yerel depolamada korunur.
- 20.800 soru/şık kümesi, iki soru bankasının tüm alt konu akışları, mobil şekiller, widget araçları ve klasör kalıcılığı doğrulandı. Çizim performansı ve çevrimdışı varlık kontrolleri geçti. Gerçek Android cihaz/S Pen testi yapılmadı.

## 1.15–1.16 değişiklikleri

- Üniversite Matematik altında Lineer Cebir: sekiz ana konu, 32 alt konu ve 32 formül.
- Ayrık Matematik: dokuz ana konu, 36 alt konu ve 36 formül; mantık, kümeler, kombinatorik, bağıntılar, fonksiyonlar/kısmi sıralama, sayı teorisi, çizgeler, ağaçlar ve yinelemeler.
- Her dersin soru sırası ve konu seçimi ayrı tutulur. Sorular değişken değerlerle üretilir, kaydedildiğinde soru ve çözüm korunur. Türkçe/İngilizce, genel karma sınav ve konu/alt konu seçimi desteklenir.
- Ayrık Matematik için 14.400 soru/şık kombinasyonu bağımsız hesaplarla doğrulandı.

## 1.17 değişiklikleri

- Üniversite Matematik altında Diferansiyel Denklemler: dokuz ana konu, 36 alt konu ve 36 formül. Birinci/ikinci mertebe denklemler, ayrılabilir/lineer/tam/homojen/Bernoulli/Riccati yöntemleri, özel çözüm ve rezonans, Euler–Cauchy, Laplace, lineer sistemler ve ileri Euler adımı.
- Başlangıç değerli sorular değişkenlerle üretilir. Çözüm adımları, gereken aralıklar ve Euler yaklaşımı açıkça gösterilir. Genel karma ve alt konu seçimi, Türkçe/İngilizce, 4–7 şık ve açık uçlu mod, soru/çözüm kaydı desteklenir.
- 14.400 soru/şık kombinasyonu ve 1.700 bağımsız RK4/sayısal integral kontrolü geçti.

## 1.18 değişiklikleri

- Çalışma alanındaki S Pen temasları WebView sağ tuş davranışından bağımsız olarak yerel MotionEvent üzerinden aktarılır. Hareket geçmişi ve basınç korunur; örnekler görüntü karesi başına tek JavaScript çağrısında gruplanır. Kalem araç düğmelerine/pencerelere dokunduğunda standart WebView etkileşimi devam eder.
- Havadan temasa geçerken eksik tuş bitleri basılı durumunu iptal etmez. Açık basma/bırakma, standart temas bitleri, iptal ve odak kaybı ele alınır. Tuş bırakılınca seçilen araca dönülür; bir temas bir geri al adımıdır.
- Varsayılanlar Üniversite modu ve Fırça darbesi silgisi. Önceki kurulumlara bir defalık uygulanır; sonraki kişisel seçimler korunur.
- Java durum testleri ve tarayıcıda temasla gerçek piksel/fırça darbesi silme, bırakma, geri alma, pencere dışlamaları ve varsayılan geçişi doğrulandı. Gerçek Samsung S Pen cihaz testi yapılmadı.

## 1.19.0

- Matematik 1: iki sunumun tamamı, 173 kaynak örneği/alt soru ve grafik-tanım çalışması; 10 konu, 57 alt konu, 84 formül. İspat, eşit ifade ve grafik çiziminde şık/cevap kontrolü yoktur. Kaydedilen soru ve çözüm aynı kalır.
- fx-82MS referansıyla DEG/RAD/GRAD, bilimsel fonksiyonlar, kombinasyon/permutasyon, kökler, DMS, ENG, kesir, bellek/değişkenler, istatistik ve altı regresyon modeli. fx-991CW işlevleri sonraki modüllere bırakıldı. Casio donanımının tuş sırası ve yuvarlama davranışları birebir emüle edilmez.
- Widget adı Modül oldu. Hesap makinesi ve grafik başlıklarındaki bağlantı tuşları modülleri kabloyla bağlar; hesap makinesi seçili 2D eğrinin/3D yüzeyin klavyesi olur.
- Web/mobil ve yerel kalem regresyon testleri geçti. Gerçek Android/S Pen cihaz testi yapılmadı.

## 1.20.0

- Her açışta yeni ve bağımsız bir modül penceresi oluşur. Birden fazla grafik, hesap makinesi, saat ve kronometre açılabilir. Kapatılan pencerelerin bağlantıları ve geçici içerikleri temizlenir.
- Kayıtlı değerler ve fonksiyonlar iki sekmeli kayıt modülünü kullanır. Bağlı hesap makinesinden alınır, seçilen bağlı hesap makinesi veya grafiğe gönderilir. Her kayıt silinebilir; diğer çalışmalarda görünür kutusu ile genel veya mevcut soru/defter kaydına özel olur. Pencereyi kapatmak kayıtları silmez.
- İşlem geçmişi yalnızca bağlı modüllerin işlemlerini, mevcut soru/defter çalışmasında saklar. Geçmiş yeniden açılınca geri gelir; kayıt veya tüm geçmiş silinebilir. Çalışma silinince ona özel kayıtlar/geçmiş de silinir; genel kayıtlar korunur.
- Modül gezgininin açık pencereler listesiyle arkadaki pencereler öne alınır. Kablolar çoklu bağlantıları gösterir; hesap makinesinin klavyesi aynı anda tek bir grafik penceresini denetler.
- Gerçek Android cihaz doğrulaması henüz yapılmadı.

## 1.21
- Modül portundan sürükleyerek kablo bağlantısı kurma; fare, dokunmatik ve kalem.
- Tam daire portlar; kapatılma/veri saklama alt açıklamaları kaldırıldı.
- Sağ üstte sabit ayar tuşu; sade renk adları; açık/koyu/sistem görünümü.
- Hesap makinesi yana genişler; küçük ekranlarda ek tuş alanı yatay kaydırılır.
- Soru paneli sola daraltılarak ince şerit halinde bırakılabilir.
- Fırça darbesi silgisi 4 px minimum çapta sabittir; nokta silgisi boyutu ayrı tutulur.
- S Pen silgi tuşu bırakıldığında 250 ms yazma beklemesi, istemsiz noktaları önler.
- Hesap makinesi ifade alanı sistem klavyesini istemez. Pencere numaraları boşta olan en küçük sayıdan verilir.

## 1.22
- Ana menünün sağındaki dekoratif çember ve üçgen kaldırıldı.

## 1.23
- Grafik örnek tuşları kaldırıldı. Yeni 2D/3D grafikler boş başlar.

## 1.24
- Hesap makinesinde defter yazımı aç/kapa: kesir, kök ve üs giriş/çıktısı. Tercih cihazda saklanır.
- Ayarlarda soru, şık, çözüm ve kayıtlı soru görünümü için ayrı defter yazımı seçeneği.
- fx-991CW uygulama aileleri ayrı, çoklu ve kabloyla bağlanabilir modüllerdir: istatistik, dağılım, elektronik tablo, fonksiyon tablosu, denklem, eşitsizlik, karmaşık sayılar, sayı tabanları, matris, vektör, oran ve Math Box.
- Sayısal türev/integral/toplam/çarpım için ek modül. Grafik ve hesap makinesi mevcut modüller olarak kalır.
- Matris/vektör A–D bellekleri pencereye özeldir. Elektronik tablo A1:E45 aralığı, göreli/mutlak başvuru, Sum/Mean/Min/Max ve doldurma içerir.
- Denklemler 2–4 derece, 2–4 bilinmeyen doğrusal sistem ve sayısal çözücü içerir. Hesaplama sayısaldır.
- MathLive, Math.js ve jStat yerel paketleri/fontları APK içinde bulunur; matematik modülleri ağ erişimi gerektirmez.
- Kaynak: https://support.casio.com/global/en/calc/manual/fx-570CW_991CW_en/using_calculator_apps/index.html


## 1.25 — İlk açılış tanıtımı
İlk açılışta ders ve konu seçimi, soru/çözüm, soru geçişi, kalem, ayarlar, formüller, modüller ve kayıt için kısa rehber açılır. Kablo bağlamayı öğretmek için kayıt oluşturmayan sürükleme alıştırması vardır. Atlanabilir; tamamlanma/atlama cihazda hatırlanır. Ayarlar → Tanıtımı tekrar göster ile yeniden açılır. Türkçe/İngilizce, klavye ve küçük ekran desteği vardır.


## 1.26 — Kablolar, rastgele üreteci ve soru paneli
Kablonun üzerine çift tıkla / çift dokun ile yalnızca o bağlantı kaldırılır. Math Box artık Rastgele üreteci adındadır; zar ve yazı tura yanında, iki sınır dahil aralıklı tam sayı üretimi sunar (1–1000 örnek). Büyük aralıklar için kriptografik, yanlılıksız örnekleme kullanılır. Tablet/masaüstünde soru panelinin sağ kenarının ortasındaki tutamaç genişliği artırır; mevcut genişlik minimumdur. Genişlik saklanır ve daraltma oku korunur.


## 1.27 — Formüllerde defter yazımı
Ayarlar → Defter yazımı (soru, çözüm ve formüller) aynı tercihi tüm formül dersleri ve konularına uygular. Satır sonları korunur; kapatılınca kaynak metin geri gelir. Kalem veya silgi menüsü açıkken kâğıtta çizime başlanınca menü kapanır. Android yerel S Pen örnekleri de aynı davranışı kullanır; havada gezinme menüyü kapatmaz.


## 1.28 — Sade kalem araç satırı
Aynı menüyü açan ikinci renk paleti düğmesi kaldırıldı. Kalem türleri ve renkler kalem düğmesinden açılır; menü açma/kapatma ve çizim sırasında otomatik kapanma korunur.


## 1.29 — Çalışma oturumları
- Araç satırındaki Yeni oturum düğmesi aynı konuda yeni bir soru akışı ve boş tahta başlatır. Menüde önce kaydetme veya doğrudan yeni oturum seçenekleri vardır. Kaydedilmiş oturumlar etkilenmez.
- Kaydet artık oturumu kaydeder: ziyaret edilen sorular, çözümler, ayrı çizimler, açık modüller ve kablolar birlikte saklanır. Kayıtlı değer/fonksiyonlar ve işlem geçmişi sorudan bağımsız olarak oturuma aittir. Sonraki/Önceki modülleri kapatmaz.
- Defterim’de bir oturum tek karttır. Oturumdaki sorular bölümünden belirli soruya dönülebilir. Klasörleme ve silme oturumun tamamına uygulanır. Eski tek soru kayıtları korunur.
- Oturum silinirse ona ait sorular ve yerel modül kayıt/geçmişi silinir; genele açık değer/fonksiyonlar korunur. Yeni oturum başlatmak mevcut kaydedilmiş oturumu silmez.
- Defter yazımı yeni kurulumda soru/çözüm/formüllerde ve hesap makinesinde açık gelir. Önceden kapatılan tercih korunur.
- Veriler cihazın yerel depolamasında tutulur. APK, önceki geliştirme sürümleriyle aynı anahtarla imzalanmıştır. Fiziksel Samsung/S Pen testi henüz yapılmadı.

