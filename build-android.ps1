param(
    [ValidateSet('Debug', 'Release', 'ReleaseUnsigned')]
    [string]$Mode = 'Debug'
)

$ErrorActionPreference = 'Stop'
$projectDirectory = Join-Path $PSScriptRoot 'android'
$localProperties = Join-Path $projectDirectory 'local.properties'
$sdkDirectory = if ($env:ANDROID_HOME) { $env:ANDROID_HOME } elseif ($env:ANDROID_SDK_ROOT) { $env:ANDROID_SDK_ROOT } else { $null }
if (!$sdkDirectory -and (Test-Path -LiteralPath $localProperties)) {
    $sdkMatch = [regex]::Match((Get-Content -LiteralPath $localProperties -Raw), '(?m)^sdk\.dir=(.+)$')
    if ($sdkMatch.Success) { $sdkDirectory = $sdkMatch.Groups[1].Value.Trim().Replace('\:', ':').Replace('\\', '\') }
}
if (!$sdkDirectory) { $sdkDirectory = Join-Path $env:USERPROFILE 'AppData\Local\Android\Sdk' }
if (!(Test-Path -LiteralPath (Join-Path $sdkDirectory 'platforms\android-36\android.jar'))) {
    throw 'Android SDK Platform 36 is missing. Install Android 16 (API 36) through Android Studio SDK Manager.'
}
if (!(Get-Command java -ErrorAction SilentlyContinue) -and !$env:JAVA_HOME) { throw 'JDK 17 or 21 is required.' }
Set-Content -LiteralPath $localProperties -Value ('sdk.dir=' + $sdkDirectory.Replace('\','/')) -Encoding ascii

$gradleConfig = Get-Content -LiteralPath (Join-Path $projectDirectory 'app\build.gradle') -Raw
$versionMatch = [regex]::Match($gradleConfig, "versionName\s+'([^']+)'")
if (!$versionMatch.Success) { throw 'Android versionName was not found.' }
$version = $versionMatch.Groups[1].Value
[string[]]$gradleArguments = if ($Mode -eq 'Debug') { @('assembleDebug') } else { @('bundleRelease', 'lintRelease') }
if ($Mode -eq 'ReleaseUnsigned') { $gradleArguments += '-PformaUnsignedRelease=true' }

Push-Location $projectDirectory
try {
    & .\gradlew.bat @gradleArguments
    if ($LASTEXITCODE -ne 0) { throw "Android build failed: $LASTEXITCODE" }
} finally { Pop-Location }

$outputDirectory = Join-Path $PSScriptRoot 'build'
New-Item -ItemType Directory -Path $outputDirectory -Force | Out-Null
if ($Mode -eq 'Debug') {
    $sourcePath = Join-Path $projectDirectory 'app\build\outputs\apk\debug\app-debug.apk'
    $outputPath = Join-Path $outputDirectory "forma-android-$version-debug.apk"
} else {
    $sourcePath = Join-Path $projectDirectory 'app\build\outputs\bundle\release\app-release.aab'
    $suffix = if ($Mode -eq 'ReleaseUnsigned') { '-unsigned' } else { '-release' }
    $outputPath = Join-Path $outputDirectory "forma-android-$version$suffix.aab"
    Add-Type -AssemblyName System.IO.Compression.FileSystem
    $archive = [IO.Compression.ZipFile]::OpenRead($sourcePath)
    try {
        $hasSignature = @($archive.Entries | Where-Object { $_.FullName -match '^META-INF/[^/]+\.(RSA|DSA|EC)$' }).Count -gt 0
        if ($Mode -eq 'Release' -and !$hasSignature) { throw 'The release AAB is unsigned. Configure your upload key before uploading to Play Console.' }
        if ($Mode -eq 'ReleaseUnsigned' -and $hasSignature) { throw 'Expected an unsigned verification bundle.' }
    } finally { $archive.Dispose() }
}
Copy-Item -LiteralPath $sourcePath -Destination $outputPath
& (Join-Path $PSScriptRoot 'update-source-manifest.ps1')
Write-Output "Artifact: $outputPath"
Write-Output "SHA256: $((Get-FileHash -LiteralPath $outputPath -Algorithm SHA256).Hash.ToLowerInvariant())"
if ($Mode -eq 'ReleaseUnsigned') { Write-Output 'Unsigned verification artifact: sign a release AAB with your upload key before Play Console upload.' }
