$ErrorActionPreference = 'Stop'
$projectDirectory = Join-Path $PSScriptRoot 'android'
$sdkDirectory = if ($env:ANDROID_HOME) { $env:ANDROID_HOME } elseif ($env:ANDROID_SDK_ROOT) { $env:ANDROID_SDK_ROOT } else { Join-Path $env:LOCALAPPDATA 'Android\Sdk' }
if (!(Test-Path -LiteralPath $sdkDirectory)) { throw "Android SDK bulunamadı. Android Studio ile SDK kur veya ANDROID_HOME değişkenini ayarla." }
if (!(Get-Command java -ErrorAction SilentlyContinue) -and !$env:JAVA_HOME) { throw 'JDK 17 veya 21 kur ve java komutunu PATH içine ekle.' }
Set-Content -LiteralPath (Join-Path $projectDirectory 'local.properties') -Value ('sdk.dir=' + $sdkDirectory.Replace('\','/')) -Encoding ascii
Push-Location $projectDirectory
try {
    & .\gradlew.bat assembleDebug
    if ($LASTEXITCODE -ne 0) { throw "Android derlemesi başarısız: $LASTEXITCODE" }
} finally { Pop-Location }
$apkDirectory = Join-Path $PSScriptRoot 'build'
New-Item -ItemType Directory -Path $apkDirectory -Force | Out-Null
$gradleConfig = Get-Content -LiteralPath (Join-Path $projectDirectory 'app\build.gradle') -Raw
$versionMatch = [regex]::Match($gradleConfig, "versionName\s+'(\d+\.\d+)\.\d+'");
if (!$versionMatch.Success) { throw 'Android sürüm numarası bulunamadı.' }
$apkPath = Join-Path $apkDirectory ('forma-android-' + $versionMatch.Groups[1].Value + '.apk')
Copy-Item -LiteralPath (Join-Path $projectDirectory 'app\build\outputs\apk\debug\app-debug.apk') -Destination $apkPath
Write-Output "APK hazır: $apkPath"
