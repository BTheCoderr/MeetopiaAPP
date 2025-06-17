#!/bin/bash

# Meetopia Mobile App Setup Script
# This script automates the setup process for the React Native mobile app

set -e

echo "🚀 Setting up Meetopia Mobile App..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js v18 or higher."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version must be 18 or higher. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Check if we're on macOS for iOS setup
if [[ "$OSTYPE" == "darwin"* ]]; then
    echo "🍎 macOS detected - setting up iOS dependencies..."
    
    # Check if CocoaPods is installed
    if ! command -v pod &> /dev/null; then
        echo "📱 Installing CocoaPods..."
        sudo gem install cocoapods
    fi
    
    # Install iOS dependencies
    echo "📱 Installing iOS pods..."
    cd ios && pod install && cd ..
    echo "✅ iOS setup complete"
else
    echo "⚠️  iOS setup skipped (not on macOS)"
fi

# Create environment file if it doesn't exist
if [ ! -f .env ]; then
    echo "⚙️  Creating environment configuration..."
    cat > .env << EOL
# Meetopia Mobile App Environment Configuration
API_BASE_URL=https://your-api-server.com
SOCKET_URL=wss://your-socket-server.com
DAILY_API_KEY=your-daily-co-api-key
FIREBASE_API_KEY=your-firebase-api-key
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_MESSAGING_SENDER_ID=your-sender-id
FIREBASE_APP_ID=your-app-id
EOL
    echo "✅ Environment file created (.env)"
    echo "⚠️  Please update the .env file with your actual API keys and URLs"
fi

# Create necessary directories
mkdir -p android/app/src/main/res/drawable
mkdir -p android/app/src/main/res/mipmap-hdpi
mkdir -p android/app/src/main/res/mipmap-mdpi
mkdir -p android/app/src/main/res/mipmap-xhdpi
mkdir -p android/app/src/main/res/mipmap-xxhdpi
mkdir -p android/app/src/main/res/mipmap-xxxhdpi

# Create Android strings.xml if it doesn't exist
if [ ! -f android/app/src/main/res/values/strings.xml ]; then
    mkdir -p android/app/src/main/res/values
    cat > android/app/src/main/res/values/strings.xml << EOL
<resources>
    <string name="app_name">Meetopia</string>
</resources>
EOL
    echo "✅ Android strings.xml created"
fi

# Create Android styles.xml if it doesn't exist
if [ ! -f android/app/src/main/res/values/styles.xml ]; then
    cat > android/app/src/main/res/values/styles.xml << EOL
<resources>
    <!-- Base application theme. -->
    <style name="AppTheme" parent="Theme.AppCompat.DayNight.NoActionBar">
        <item name="android:editTextBackground">@drawable/rn_edit_text_material</item>
    </style>
    
    <!-- Launch screen theme -->
    <style name="LaunchTheme" parent="AppTheme">
        <item name="android:windowBackground">@drawable/launch_screen</item>
    </style>
</resources>
EOL
    echo "✅ Android styles.xml created"
fi

# Create launch screen drawable
if [ ! -f android/app/src/main/res/drawable/launch_screen.xml ]; then
    cat > android/app/src/main/res/drawable/launch_screen.xml << EOL
<?xml version="1.0" encoding="utf-8"?>
<layer-list xmlns:android="http://schemas.android.com/apk/res/android">
    <item android:drawable="@color/primary_color" />
    <item>
        <bitmap
            android:gravity="center"
            android:src="@mipmap/ic_launcher" />
    </item>
</layer-list>
EOL
    echo "✅ Android launch screen created"
fi

# Create colors.xml
if [ ! -f android/app/src/main/res/values/colors.xml ]; then
    cat > android/app/src/main/res/values/colors.xml << EOL
<?xml version="1.0" encoding="utf-8"?>
<resources>
    <color name="primary_color">#6366f1</color>
    <color name="background_color">#ffffff</color>
</resources>
EOL
    echo "✅ Android colors.xml created"
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. Update the .env file with your API keys and URLs"
echo "2. Add your app icons to android/app/src/main/res/mipmap-* directories"
echo "3. Configure Firebase for push notifications"
echo "4. Set up your signing keys for release builds"
echo ""
echo "To run the app:"
echo "  npm start          # Start Metro bundler"
echo "  npm run android    # Run on Android"
if [[ "$OSTYPE" == "darwin"* ]]; then
    echo "  npm run ios        # Run on iOS"
fi
echo ""
echo "For production builds:"
echo "  npm run build:android  # Build Android APK"
if [[ "$OSTYPE" == "darwin"* ]]; then
    echo "  npm run build:ios      # Build iOS archive"
fi
echo ""
echo "📚 Check the README.md for detailed instructions" 