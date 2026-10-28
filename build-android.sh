#!/usr/bin/env bash
set -euo pipefail
project_root="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
if [[ ! -f "${ANDROID_HOME:-${ANDROID_SDK_ROOT:-}}/platforms/android-36/android.jar" ]]; then
  echo 'Android SDK API 36 is required. Set ANDROID_HOME.' >&2
  exit 1
fi
cd "$project_root/android"
sh ./gradlew assembleDebug lintDebug --console=plain
version=$(sed -n "s/.*versionName '\([^']*\)'.*/\1/p" app/build.gradle)
mkdir -p "$project_root/build"
artifact="$project_root/build/turev-al-android-$version-debug.apk"
cp app/build/outputs/apk/debug/app-debug.apk "$artifact"
echo "Artifact: $artifact"
sha256sum "$artifact"
