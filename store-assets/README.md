# Forma — Play Store görsel paketi

Bu paket `com.sapsoft.forma`, sürüm `1.33.0` için hazırlanmıştır. Görseller Türkçedir.

## Play Console'da nereye yüklenecek?

| Console alanı | Dosya / klasör | Ölçü |
| --- | --- | --- |
| Uygulama simgesi | `icon-512.png` | 512 × 512, RGBA PNG |
| Tanıtım görseli / Feature graphic | `feature-1024x500.png` | 1024 × 500, RGB PNG |
| Telefon ekran görüntüleri | `phone/` içindeki 4 PNG | 1080 × 1920 |
| 7 inç tablet ekran görüntüleri | `tablet-7/` içindeki 4 PNG | 1080 × 1920, dikey |
| 10 inç tablet ekran görüntüleri | `tablet-10/` içindeki 4 PNG | 2560 × 1440, yatay |

Ekran görüntülerini dosya adlarına göre 01 → 04 sırasıyla yükle: ders seçimi, çalışma/çizim alanı, çözüm, hesap makinesi/grafik modülleri. `screenshots.json` her görsel için erişilebilirlik açıklaması içerir; açıklamaları ilgili alt metin alanlarına kopyalayabilirsin.

Tanıtım görseli, “Forma — Düşün. Çiz. Çöz.” metinli bir marka illüstrasyonudur. Arka plan için ayrıca bir Play Console alanı yoktur; bu görsel Feature graphic alanına yüklenir. TV dağıtımı seçilmediğinden TV banner'ı hazırlanmadı; tanıtım videosu isteğe bağlıdır.

## Kaynak ve doğrulama

- Simge mevcut Android launcher vektöründen üretilmiştir; uygulamanın simgesi değiştirilmemiştir. Kaynak: `sources/icon.svg`.
- Tanıtım illüstrasyonu ImageGen ile üretildi, yükleme boyutuna ölçeklendi. Güncel kaynak: `sources/feature-edited.png`; ilk sürüm: `sources/feature-original.png`.
- Ekran görüntüleri Android paketindeki gerçek HTML/CSS/JavaScript arayüzünden, izole Chrome oturumlarında cihaz boyutlarıyla alındı. Fiziksel Android cihaz/emülatör ekran görüntüsü değildir; Android sistem çubuklarını içermez. Kullanıcı verisi kullanılmadı; örnek soru ve çizimler üretildi.
- Ekran görüntülerine reklam yazısı, çerçeve veya sahte arayüz eklenmedi. PNG'ler alfa kanalı olmadan dışa aktarıldı; en boy oranları 9:16 ve 16:9'dur.
- `validation.json` dosyasında piksel ölçüleri, renk kanalları, dosya boyutları ve SHA256 özetleri bulunur.

Yalnız yükleme dosyaları ve bu rehber `forma-play-store-assets-1.33.0.zip` içinde bulunur. `sources/` ve üretim betikleri zip'e dahil değildir.

## Yeniden ekran görüntüsü almak

Node.js, Chrome, Playwright ve Sharp gerekir. Bu bilgisayarın paket yolu ile proje kökünden:

```powershell
$env:NODE_PATH='C:\Users\ardas\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\node_modules'
node store-assets/capture-store.cjs
```

[Google Play görsel gereksinimleri](https://support.google.com/googleplay/android-developer/answer/9866151?hl=en-en)

