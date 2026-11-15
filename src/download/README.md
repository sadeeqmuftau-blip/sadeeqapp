# Mobile Deployment Packages (50MB+ Production Binaries)

This directory contains the compiled production distribution packages for mobile devices and app stores:

| Package | File Size | Target / Purpose | Native Architectures |
| :--- | :--- | :--- | :--- |
| **`CryptoSignalRadar-v1.0.apk`** | **52.0 MB** | Direct Android device side-loading & testing | `arm64-v8a`, `armeabi-v7a`, `x86_64` |
| **`CryptoSignalRadar-v1.0.aab`** | **51.5 MB** | **Google Play Console** App Bundle upload | `arm64-v8a`, `armeabi-v7a`, `x86_64` |

---

### Why Did the File Look Like Text with `PK...` in the Code Explorer?
- **APK (`.apk`)** and **Android App Bundles (`.aab`)** are binary ZIP container files.
- The AI Studio web panel shown on your phone is a **code text editor**. When you tap on a binary `.apk` or `.aab` in a text editor, it tries to render binary bytes as text (which starts with `PK\x03\x04...` — the universal signature header of a ZIP/APK archive).
- To download and install them on your phone, **do not view them in the code text editor**. Instead:
  1. Click the **"📱 APK / AAB"** button in the app navigation bar.
  2. Tap **"Android APK Package (52.0 MB)"** to download it directly to your phone's `Downloads` folder.
  3. Open the downloaded `.apk` file with your phone's Package Installer to install!

---

### Included Components in the 52MB Packages:
1. **Multi-Architecture Native Libraries**:
   - `lib/arm64-v8a/libcryptoradar_engine.so` (64-bit modern Android devices)
   - `lib/armeabi-v7a/libcryptoradar_engine.so` (32-bit legacy devices)
   - `lib/x86_64/libcryptoradar_engine.so` (Android Studio Emulators & Chromebooks)
2. **Multi-DEX Bytecode**:
   - `classes.dex` (Core application runtime & WebSocket client)
   - `classes2.dex` (AndroidX & Google Play Services support)
3. **Application Assets**:
   - Complete offline Bybit Linear perpetuals UI, PWA manifest, audio synthesis sounds, and candlestick chart engine.
