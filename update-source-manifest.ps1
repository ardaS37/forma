$ErrorActionPreference = 'Stop'
$taskRoot = $PSScriptRoot
$taskConfig = Get-Content -LiteralPath (Join-Path $taskRoot 'android/app/build.gradle') -Raw
$taskFiles = [ordered]@{}
$taskSources = @(
    'README.md', '.gitignore', 'build-android.ps1', 'update-source-manifest.ps1',
    'android/README.md', 'android/PLAY-STORE.md', 'android/.gitignore',
    'android/build.gradle', 'android/settings.gradle', 'android/gradle.properties',
    'android/gradlew', 'android/gradlew.bat', 'android/app/build.gradle',
    'android/keystore.properties.example', 'android/verify-math1.cjs', 'android/verify-ui.cjs',
    'android/verify-physics.cjs', 'android/verify-physics-ui.cjs', 'android/verify-theme.cjs',
    'android/verify-icon-ui.cjs', 'android/verify-icon-device.cjs', 'android/LauncherIconPaletteTest.java',
    'android/verify-simulation-windows.cjs'
)
foreach ($taskFolder in @('android/app/src/main', 'android/gradle', 'web/dist')) {
    $taskFolderPath = Join-Path $taskRoot $taskFolder
    if (Test-Path -LiteralPath $taskFolderPath) {
        $taskSources += Get-ChildItem -LiteralPath $taskFolderPath -File -Recurse | ForEach-Object {
            $_.FullName.Substring($taskRoot.Length + 1).Replace('\', '/')
        }
    }
}
foreach ($taskRelative in ($taskSources | Sort-Object -Unique)) {
    $taskPath = Join-Path $taskRoot $taskRelative
    $taskFiles[$taskRelative] = (Get-FileHash -LiteralPath $taskPath -Algorithm SHA256).Hash.ToLowerInvariant()
}
$taskManifest = [ordered]@{
    version = [regex]::Match($taskConfig, "versionName\s+'([^']+)'").Groups[1].Value
    version_code = [int][regex]::Match($taskConfig, 'versionCode\s+(\d+)').Groups[1].Value
    application_id = [regex]::Match($taskConfig, "applicationId\s+'([^']+)'").Groups[1].Value
    android_source = 'android/app/src/main'
    note = 'Current source hashes; web/dist is a separate web snapshot. Historical build artifacts and signing secrets are excluded.'
    files = $taskFiles
}
$taskManifest | ConvertTo-Json -Depth 5 | Set-Content -LiteralPath (Join-Path $taskRoot 'source-manifest.json') -Encoding UTF8
