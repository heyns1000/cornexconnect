# OAuth Deep Links — Native App Configuration

CornexConnect uses OAuth (Google, Microsoft, GitHub, Facebook) for authentication.
When running as a native app via Capacitor, OAuth redirects must use custom URL schemes
so the app can intercept the callback instead of opening a browser tab.

## URL Scheme

**Custom scheme:** `com.cornexconnect.app`

All OAuth callbacks redirect to:
```
com.cornexconnect.app://oauth/callback/{provider}
```

---

## Android — AndroidManifest.xml

After running `npx cap add android`, add these intent filters inside the main
`<activity>` tag in `android/app/src/main/AndroidManifest.xml`:

```xml
<!-- OAuth Deep Link Handler -->
<intent-filter>
    <action android:name="android.intent.action.VIEW" />
    <category android:name="android.intent.category.DEFAULT" />
    <category android:name="android.intent.category.BROWSABLE" />
    <data android:scheme="com.cornexconnect.app"
          android:host="oauth"
          android:pathPrefix="/callback" />
</intent-filter>

<!-- HTTPS App Links (for universal links) -->
<intent-filter android:autoVerify="true">
    <action android:name="android.intent.action.VIEW" />
    <category android:name="android.intent.category.DEFAULT" />
    <category android:name="android.intent.category.BROWSABLE" />
    <data android:scheme="https"
          android:host="your-production-domain.com"
          android:pathPrefix="/api/auth" />
</intent-filter>
```

Replace `your-production-domain.com` with your actual deployed domain.

---

## iOS — Info.plist

After running `npx cap add ios`, the URL scheme is auto-registered from
`capacitor.config.ts` (`ios.scheme: 'CornexConnect'`).

Verify in `ios/App/App/Info.plist` that this exists:

```xml
<key>CFBundleURLTypes</key>
<array>
    <dict>
        <key>CFBundleURLSchemes</key>
        <array>
            <string>com.cornexconnect.app</string>
            <string>CornexConnect</string>
        </array>
    </dict>
</array>
```

For Universal Links (iOS), add an Associated Domains entitlement:
```
applinks:your-production-domain.com
```

---

## Server-Side OAuth Redirect Configuration

Each OAuth provider's developer console needs the native redirect URI added:

| Provider  | Console URL                                      | Redirect URI to add                                      |
|-----------|--------------------------------------------------|----------------------------------------------------------|
| Google    | https://console.cloud.google.com/apis/credentials | `com.cornexconnect.app://oauth/callback/google`          |
| Microsoft | https://portal.azure.com > App registrations      | `com.cornexconnect.app://oauth/callback/microsoft`       |
| GitHub    | https://github.com/settings/developers             | `com.cornexconnect.app://oauth/callback/github`          |
| Facebook  | https://developers.facebook.com/apps               | `com.cornexconnect.app://oauth/callback/facebook`        |

---

## Capacitor App Listener

The deep link is handled client-side by listening for the `appUrlOpen` event.
This is set up in `client/src/lib/capacitor-deeplinks.ts`.
