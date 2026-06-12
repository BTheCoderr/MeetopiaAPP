# App assets (TestFlight / App Store)

Add before EAS production build:

| File | Size | Purpose |
|------|------|---------|
| `icon.png` | 1024×1024 | App Store icon |
| `splash.png` | 1284×2778 recommended | Launch splash |
| `adaptive-icon.png` | 1024×1024 | Android adaptive icon |

Referenced from `app.config.ts`. Until these exist, local `expo run:ios` may use Expo defaults.
